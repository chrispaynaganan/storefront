import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase-server";
import { sendOrderConfirmationEmail, OrderConfirmationItem } from "@/lib/email/order-confirmation";
import { logActivity } from "@/lib/activity-log";

const PAYPAL_BASE =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const secret = process.env.PAYPAL_CLIENT_SECRET!;
  const credentials = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error(`PayPal token request failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

async function capturePayPalOrder(paypalOrderId: string, accessToken: string): Promise<any> {
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `capture-${paypalOrderId}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`PayPal capture failed: ${data?.message ?? res.status}`);
  }
  return data;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const adminSupabase = await createAdminSupabaseClient();

    // 1. Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse body — address data comes in directly, no pre-insert needed
    const body = await req.json();
    const { paypal_order_id, address: addressData, promo_code } = body as {
      paypal_order_id: string;
      address: {
        full_name: string;
        line1: string;
        line2?: string;
        city: string;
        province: string;
        country: string;
        postal_code: string;
        phone?: string;
      };
      promo_code?: string;
    };

    if (!paypal_order_id || !addressData) {
      return NextResponse.json(
        { error: "paypal_order_id and address are required" },
        { status: 400 }
      );
    }

    // 3. Load cart items
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select(`
        id,
        qty,
        variant_id,
        variants (
          id,
          size,
          color,
          color_hex,
          stock_qty,
          price,
          compare_at_price,
          sku,
          products (
            id,
            name,
            slug,
            image_urls
          )
        )
      `)
      .eq("user_id", user.id);

    if (cartError) throw cartError;
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 4. Stock check before capture
    const outOfStock = cartItems.filter((item) => {
      const v = item.variants as any;
      return !v || v.stock_qty < item.qty;
    });

    if (outOfStock.length > 0) {
      const names = outOfStock.map((i) => (i.variants as any)?.products?.name ?? "item");
      return NextResponse.json(
        { error: "Some items are out of stock", out_of_stock: names },
        { status: 409 }
      );
    }

    // 5. Capture PayPal payment
    const accessToken = await getPayPalAccessToken();
    const captureResult = await capturePayPalOrder(paypal_order_id, accessToken);

    if (captureResult.status !== "COMPLETED") {
      return NextResponse.json(
        { error: `Payment not completed: ${captureResult.status}` },
        { status: 402 }
      );
    }

    // 6. Save address using admin client (bypasses RLS)
    const { data: savedAddress, error: addrError } = await adminSupabase
      .from("addresses")
      .insert({
        user_id: user.id,
        line1: addressData.line1,
        line2: addressData.line2 ?? null,
        city: addressData.city,
        province: addressData.province,
        country: addressData.country,
        postal_code: addressData.postal_code,
        is_default: false,
      })
      .select()
      .single();

    if (addrError || !savedAddress) {
      console.error("[Capture] Address insert failed:", addrError);
      throw new Error("Failed to save address");
    }

    // 7. Atomically decrement stock
    const stockItems = cartItems.map((item) => ({
      variant_id: item.variant_id,
      qty: item.qty,
    }));

    const { data: stockResult, error: stockError } = await adminSupabase.rpc(
      "decrement_stock_for_items",
      { p_items: stockItems }
    );

    if (stockError) {
      console.error("[CRITICAL] Stock decrement error:", stockError);
    } else if (!stockResult?.success) {
      console.error("[CRITICAL] Partial stock failure:", stockResult);
    }

    // 8. Resolve promo discount
    let discount = 0;

    if (promo_code) {
      const { data: promo } = await supabase
        .from("promos")
        .select("*")
        .eq("code", promo_code.toUpperCase())
        .eq("is_active", true)
        .lte("starts_at", new Date().toISOString())
        .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`)
        .single();

      if (promo) {
        const subtotalRaw = cartItems.reduce(
          (sum, item) => sum + (item.variants as any).price * item.qty,
          0
        );
        discount =
          promo.type === "percent"
            ? Math.round((subtotalRaw * promo.value) / 100 * 100) / 100
            : promo.value;
      }
    }

    // 9. Calculate totals
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.variants as any).price * item.qty,
      0
    );
    const total = Math.max(0, subtotal - discount);

    // 10. Create order
    const { data: order, error: orderError } = await adminSupabase
      .from("orders")
      .insert({
        user_id: user.id,
        address_id: savedAddress.id,
        status: "paid",
        subtotal,
        discount,
        total,
        currency: "PHP",
        paypal_order_id,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 11. Create order_items
    const orderItems = cartItems.map((item) => {
      const v = item.variants as any;
      return {
        order_id: order.id,
        variant_id: item.variant_id,
        qty: item.qty,
        unit_price: v.price,
        line_total: v.price * item.qty,
      };
    });

    const { error: itemsError } = await adminSupabase.from("order_items").insert(orderItems);
    if (itemsError) throw itemsError;

    // 12. Clear cart
    await adminSupabase.from("cart_items").delete().eq("user_id", user.id);

    // 13. Load user profile for email
    const { data: profile } = await adminSupabase
      .from("users")
      .select("full_name, first_name, email")
      .eq("id", user.id)
      .single();

    const customerName = profile?.first_name ?? profile?.full_name ?? "there";
    const customerEmail = profile?.email ?? user.email ?? "";

    // 14. Send confirmation email
    const emailItems: OrderConfirmationItem[] = cartItems.map((item) => {
      const v = item.variants as any;
      const p = v.products;
      return {
        name: p?.name ?? "Product",
        size: v.size,
        color: v.color,
        color_hex: v.color_hex,
        qty: item.qty,
        unit_price: v.price,
        line_total: v.price * item.qty,
        image_url: p?.image_urls?.[0] ?? undefined,
      };
    });

    const emailResult = await sendOrderConfirmationEmail({
      order_id: order.id,
      customer_name: customerName,
      customer_email: customerEmail,
      items: emailItems,
      subtotal,
      discount,
      total,
      currency: "PHP",
      address: {
        line1: savedAddress.line1,
        line2: savedAddress.line2 ?? undefined,
        city: savedAddress.city,
        province: savedAddress.province,
        postal_code: savedAddress.postal_code,
        country: savedAddress.country,
      },
      paypal_order_id,
    });

    if (!emailResult.success) {
      console.error("[Email] Confirmation failed:", emailResult.error);
    }

    // 15. Log activity
    await logActivity({
      userId: user.id,
      userName: customerName,
      userRole: "customer",
      action: "created",
      entity: "order",
      entityId: order.id,
      entityName: `Order #${order.id.slice(0, 8).toUpperCase()}`,
      metadata: {
        paypal_order_id,
        total,
        item_count: cartItems.length,
        email_sent: emailResult.success,
      },
    });

    return NextResponse.json({ success: true, order_id: order.id });

  } catch (err: any) {
    console.error("[Capture] Unhandled error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}