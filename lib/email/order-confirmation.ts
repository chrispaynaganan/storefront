import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export interface OrderConfirmationItem {
  name: string;
  size: string;
  color: string;
  color_hex: string;
  qty: number;
  unit_price: number;
  line_total: number;
  image_url?: string;
}

export interface OrderConfirmationData {
  order_id: string;
  customer_name: string;
  customer_email: string;
  items: OrderConfirmationItem[];
  subtotal: number;
  discount: number;
  total: number;
  currency: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
  };
  paypal_order_id: string;
}

function formatPrice(amount: number, currency = "PHP"): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function buildEmailHtml(data: OrderConfirmationData): string {
  const {
    order_id,
    customer_name,
    items,
    subtotal,
    discount,
    total,
    currency,
    address,
    paypal_order_id,
  } = data;

  const shortId = order_id.slice(0, 8).toUpperCase();

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #F2EDE8; vertical-align: top;">
          <div style="display: flex; gap: 12px;">
            ${
              item.image_url
                ? `<img src="${item.image_url}" width="60" height="60" style="border-radius: 4px; object-fit: cover; flex-shrink: 0;" />`
                : `<div style="width:60px;height:60px;background:#F2EDE8;border-radius:4px;flex-shrink:0;"></div>`
            }
            <div>
              <div style="font-weight: 600; color: #3B1F0E; margin-bottom: 2px;">${item.name}</div>
              <div style="font-size: 13px; color: #6B3A22;">
                Size: ${item.size} &nbsp;·&nbsp;
                <span style="display:inline-flex;align-items:center;gap:4px;">
                  Color: <span style="display:inline-block;width:10px;height:10px;background:${item.color_hex};border-radius:50%;border:1px solid #ccc;margin-left:3px;"></span> ${item.color}
                </span>
              </div>
              <div style="font-size: 13px; color: #6B3A22; margin-top: 2px;">Qty: ${item.qty}</div>
            </div>
          </div>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #F2EDE8; text-align: right; vertical-align: top; white-space: nowrap; color: #3B1F0E; font-weight: 500;">
          ${formatPrice(item.line_total, currency)}
        </td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmed — Known & Worn</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F4; font-family: Georgia, serif; color: #3B1F0E;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background: #FAF7F4; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 580px; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(59,31,14,0.08);">

          <!-- Header -->
          <tr>
            <td style="background: #3B1F0E; padding: 28px 32px; text-align: center;">
              <div style="font-size: 22px; font-weight: bold; color: #FFCBA4; letter-spacing: 2px; text-transform: uppercase;">
                Known &amp; Worn
              </div>
            </td>
          </tr>

          <!-- Hero message -->
          <tr>
            <td style="padding: 32px 32px 0; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #3B1F0E; margin-bottom: 8px;">
                Order Confirmed! 🎉
              </div>
              <div style="font-size: 15px; color: #6B3A22; line-height: 1.6;">
                Hey ${customer_name}, thank you for your order.<br/>
                We'll start preparing it right away.
              </div>
            </td>
          </tr>

          <!-- Order meta -->
          <tr>
            <td style="padding: 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #FAF7F4; border-radius: 6px; padding: 16px;">
                <tr>
                  <td style="font-size: 13px; color: #6B3A22; padding: 4px 0;">Order number</td>
                  <td style="font-size: 13px; color: #3B1F0E; font-weight: 600; text-align: right;">#${shortId}</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #6B3A22; padding: 4px 0;">PayPal reference</td>
                  <td style="font-size: 13px; color: #3B1F0E; text-align: right;">${paypal_order_id}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="font-size: 14px; font-weight: 600; color: #3B1F0E; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                Items ordered
              </div>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemRows}
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding: 20px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${
                  discount > 0
                    ? `
                <tr>
                  <td style="font-size: 14px; color: #6B3A22; padding: 3px 0;">Subtotal</td>
                  <td style="font-size: 14px; color: #3B1F0E; text-align: right;">${formatPrice(subtotal, currency)}</td>
                </tr>
                <tr>
                  <td style="font-size: 14px; color: #6B3A22; padding: 3px 0;">Discount</td>
                  <td style="font-size: 14px; color: #E8A882; text-align: right;">−${formatPrice(discount, currency)}</td>
                </tr>
                `
                    : ""
                }
                <tr>
                  <td style="font-size: 16px; font-weight: 700; color: #3B1F0E; padding: 8px 0 0; border-top: 2px solid #F2EDE8;">Total paid</td>
                  <td style="font-size: 16px; font-weight: 700; color: #3B1F0E; text-align: right; padding: 8px 0 0; border-top: 2px solid #F2EDE8;">${formatPrice(total, currency)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping address -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <div style="font-size: 14px; font-weight: 600; color: #3B1F0E; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                Shipping to
              </div>
              <div style="font-size: 14px; color: #6B3A22; line-height: 1.7;">
                ${address.line1}${address.line2 ? `, ${address.line2}` : ""}<br/>
                ${address.city}, ${address.province} ${address.postal_code}<br/>
                ${address.country}
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 0 32px 32px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/account/orders"
                 style="display: inline-block; background: #3B1F0E; color: #FFCBA4; text-decoration: none; padding: 12px 28px; border-radius: 4px; font-size: 14px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
                View My Orders
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #FAF7F4; padding: 20px 32px; text-align: center; border-top: 1px solid #F2EDE8;">
              <div style="font-size: 12px; color: #6B3A22; line-height: 1.6;">
                Questions? Reply to this email or contact us at
                <a href="mailto:hello@knownandworn.com" style="color: #3B1F0E;">hello@knownandworn.com</a><br/>
                © ${new Date().getFullYear()} Known &amp; Worn. Philippines.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

export async function sendOrderConfirmationEmail(
  data: OrderConfirmationData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await getResend().emails.send({
      from: "Known & Worn <orders@knownandworn.com>",
      to: data.customer_email,
      subject: `Order confirmed — #${data.order_id.slice(0, 8).toUpperCase()}`,
      html: buildEmailHtml(data),
    });

    if (error) {
      console.error("[Resend] Failed to send order confirmation:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[Resend] Exception sending order confirmation:", err);
    return { success: false, error: err?.message ?? "Unknown error" };
  }
}