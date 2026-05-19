import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { logActivity } from "@/lib/activity-log";

const PAYPAL_BASE =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// ─── PayPal webhook signature verification ────────────────────────────────────

async function verifyWebhookSignature(
  headers: Headers,
  rawBody: string
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  if (!webhookId) {
    // If no webhook ID configured, skip verification in dev/sandbox
    if (process.env.PAYPAL_ENV !== "live") {
      console.warn("[Webhook] PAYPAL_WEBHOOK_ID not set — skipping verification (non-live)");
      return true;
    }
    console.error("[Webhook] PAYPAL_WEBHOOK_ID is required in production");
    return false;
  }

  // Get access token
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const secret = process.env.PAYPAL_CLIENT_SECRET!;
  const credentials = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const tokenRes = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!tokenRes.ok) return false;
  const { access_token } = await tokenRes.json();

  // Verify signature via PayPal API
  const verifyRes = await fetch(
    `${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: headers.get("paypal-auth-algo"),
        cert_url: headers.get("paypal-cert-url"),
        client_id: clientId,
        transmission_id: headers.get("paypal-transmission-id"),
        transmission_sig: headers.get("paypal-transmission-sig"),
        transmission_time: headers.get("paypal-transmission-time"),
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody),
      }),
    }
  );

  if (!verifyRes.ok) return false;

  const { verification_status } = await verifyRes.json();
  return verification_status === "SUCCESS";
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // 1. Verify webhook signature
  const isValid = await verifyWebhookSignature(req.headers, rawBody);
  if (!isValid) {
    console.error("[Webhook] Invalid PayPal signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const adminSupabase = await createAdminSupabaseClient();
  const eventType: string = event.event_type ?? "";

  console.log(`[Webhook] Received: ${eventType}`, event.id);

  try {
    switch (eventType) {
      // ── Payment completed (primary event) ──────────────────────────────────
      case "PAYMENT.CAPTURE.COMPLETED": {
        const capture = event.resource;
        const paypalOrderId = capture?.supplementary_data?.related_ids?.order_id
          ?? capture?.id;

        if (!paypalOrderId) {
          console.warn("[Webhook] Cannot resolve order ID from event", event.id);
          break;
        }

        // Find our order by paypal_order_id
        const { data: order, error } = await adminSupabase
          .from("orders")
          .select("id, status, user_id")
          .eq("paypal_order_id", paypalOrderId)
          .single();

        if (error || !order) {
          console.warn(
            "[Webhook] Order not found for paypal_order_id:",
            paypalOrderId
          );
          // Return 200 so PayPal doesn't retry — we may have handled it already
          break;
        }

        if (order.status === "paid") {
          console.log("[Webhook] Order already marked paid, skipping:", order.id);
          break;
        }

        // Update status to paid
        const { error: updateError } = await adminSupabase
          .from("orders")
          .update({ status: "paid" })
          .eq("id", order.id);

        if (updateError) throw updateError;

        await logActivity({
          userId: order.user_id,
          userName: "PayPal Webhook",
          userRole: "system",
          action: "updated",
          entity: "order",
          entityId: order.id,
          entityName: `Order #${order.id.slice(0, 8).toUpperCase()}`,
          changes: { status: { from: order.status, to: "paid" } },
          metadata: { event_id: event.id, paypal_order_id: paypalOrderId },
        });

        console.log("[Webhook] Order marked paid via webhook:", order.id);
        break;
      }

      // ── Payment denied / reversed ──────────────────────────────────────────
      case "PAYMENT.CAPTURE.DENIED":
      case "PAYMENT.CAPTURE.REVERSED": {
        const capture = event.resource;
        const paypalOrderId =
          capture?.supplementary_data?.related_ids?.order_id ?? capture?.id;

        if (!paypalOrderId) break;

        const { data: order } = await adminSupabase
          .from("orders")
          .select("id, status, user_id")
          .eq("paypal_order_id", paypalOrderId)
          .single();

        if (!order) break;

        const newStatus = eventType === "PAYMENT.CAPTURE.DENIED" ? "payment_failed" : "refunded";

        await adminSupabase
          .from("orders")
          .update({ status: newStatus })
          .eq("id", order.id);

        await logActivity({
          userId: order.user_id,
          userName: "PayPal Webhook",
          userRole: "system",
          action: "updated",
          entity: "order",
          entityId: order.id,
          entityName: `Order #${order.id.slice(0, 8).toUpperCase()}`,
          changes: { status: { from: order.status, to: newStatus } },
          metadata: { event_id: event.id, event_type: eventType },
        });

        console.log(`[Webhook] Order ${newStatus}:`, order.id);
        break;
      }

      // ── Refund completed ───────────────────────────────────────────────────
      case "PAYMENT.CAPTURE.REFUNDED": {
        const capture = event.resource;
        const paypalOrderId =
          capture?.supplementary_data?.related_ids?.order_id ?? capture?.id;

        if (!paypalOrderId) break;

        const { data: order } = await adminSupabase
          .from("orders")
          .select("id, status, user_id")
          .eq("paypal_order_id", paypalOrderId)
          .single();

        if (!order) break;

        await adminSupabase
          .from("orders")
          .update({ status: "refunded" })
          .eq("id", order.id);

        await logActivity({
          userId: order.user_id,
          userName: "PayPal Webhook",
          userRole: "system",
          action: "updated",
          entity: "order",
          entityId: order.id,
          entityName: `Order #${order.id.slice(0, 8).toUpperCase()}`,
          changes: { status: { from: order.status, to: "refunded" } },
          metadata: { event_id: event.id },
        });

        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${eventType}`);
    }
  } catch (err: any) {
    console.error("[Webhook] Error processing event:", err);
    // Still return 200 — PayPal will retry on 5xx, we don't want loops
  }

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true });
}