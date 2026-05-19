import { createClient } from "@/lib/supabase";

export interface StockValidationResult {
  valid: boolean;
  outOfStock: Array<{
    variantId: string;
    productName: string;
    requestedQty: number;
    availableQty: number;
  }>;
}

/**
 * Validates that all cart items have sufficient stock.
 * Call this before showing the PayPal button or initiating checkout.
 */
export async function validateCartStock(
  cartItems: Array<{ variant_id: string; qty: number }>
): Promise<StockValidationResult> {
  if (!cartItems.length) {
    return { valid: true, outOfStock: [] };
  }

  const supabase = createClient();
  const variantIds = cartItems.map((i) => i.variant_id);

  const { data: variants, error } = await supabase
    .from("variants")
    .select(`
      id,
      stock_qty,
      products (
        name
      )
    `)
    .in("id", variantIds);

  if (error || !variants) {
    console.error("[Stock] Failed to validate stock:", error);
    // Fail open — let backend re-validate
    return { valid: true, outOfStock: [] };
  }

  const outOfStock: StockValidationResult["outOfStock"] = [];

  for (const cartItem of cartItems) {
    const variant = variants.find((v) => v.id === cartItem.variant_id);
    if (!variant) continue;

    if (variant.stock_qty < cartItem.qty) {
      outOfStock.push({
        variantId: cartItem.variant_id,
        productName: (variant.products as any)?.name ?? "Product",
        requestedQty: cartItem.qty,
        availableQty: variant.stock_qty,
      });
    }
  }

  return {
    valid: outOfStock.length === 0,
    outOfStock,
  };
}

/**
 * Returns the max qty a user can add to cart for a given variant.
 * Used to clamp the qty input on product pages.
 */
export async function getVariantStock(variantId: string): Promise<number> {
  const supabase = createClient();
  const { data } = await supabase
    .from("variants")
    .select("stock_qty")
    .eq("id", variantId)
    .single();

  return data?.stock_qty ?? 0;
}