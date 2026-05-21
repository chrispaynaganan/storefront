import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM = 'Known & Worn <orders@knownandworn.com>'
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? 'mark.payns@gmail.com'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ''

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount)
}

function baseLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#FAF7F4;font-family:Georgia,serif;color:#3B1F0E;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F4;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:580px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(59,31,14,0.08);">
        <tr>
          <td style="background:#3B1F0E;padding:28px 32px;text-align:center;">
            <div style="font-size:22px;font-weight:bold;color:#FFCBA4;letter-spacing:2px;text-transform:uppercase;">Known &amp; Worn</div>
          </td>
        </tr>
        ${content}
        <tr>
          <td style="background:#FAF7F4;padding:20px 32px;text-align:center;border-top:1px solid #F2EDE8;">
            <div style="font-size:12px;color:#6B3A22;line-height:1.6;">
              Questions? Reply to this email or contact us at
              <a href="mailto:hello@knownandworn.com" style="color:#3B1F0E;">hello@knownandworn.com</a><br/>
              © ${new Date().getFullYear()} Known &amp; Worn. Philippines.
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function ctaButton(label: string, href: string): string {
  return `
  <tr>
    <td style="padding:0 32px 32px;text-align:center;">
      <a href="${href}" style="display:inline-block;background:#3B1F0E;color:#FFCBA4;text-decoration:none;padding:12px 28px;border-radius:4px;font-size:14px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">
        ${label}
      </a>
    </td>
  </tr>`
}

// ─── Customer: status-change emails ──────────────────────────────────────────

export interface StatusEmailData {
  order_id: string
  customer_name: string
  customer_email: string
  total: number
  courier?: string | null
  tracking_number?: string | null
}

const COURIER_TRACKING_URLS: Record<string, string> = {
  'J&T Express':   'https://www.jtexpress.ph/trajectoryQuery',
  'LBC':           'https://www.lbcexpress.com/track',
  'Flash Express': 'https://www.flashexpress.ph/fxt/',
  'NinjaVan':      'https://www.ninjavan.co/en-ph/tracking',
  'Grab Express':  'https://www.grab.com/ph/',
  'Lalamove':      'https://www.lalamove.com/en-ph/',
}

function courierTrackingLink(courier: string): string {
  const base = COURIER_TRACKING_URLS[courier]
  if (!base) return courier
  return `<a href="${base}" target="_blank" style="color:#3B1F0E;font-weight:600;">${courier}</a>`
}

interface StatusConfig {
  headline: string
  message: (d: StatusEmailData) => string
}

const STATUS_SUBJECTS: Record<string, (id: string) => string> = {
  packed:           (id: string) => `Your order is being packed — #${id.slice(0, 8).toUpperCase()}`,
  shipped:          (id: string) => `Your order is on its way — #${id.slice(0, 8).toUpperCase()}`,
  out_for_delivery: (id: string) => `Out for delivery today — #${id.slice(0, 8).toUpperCase()}`,
  delivered:        (id: string) => `Your order has been delivered — #${id.slice(0, 8).toUpperCase()}`,
  cancelled:        (id: string) => `Your order has been cancelled — #${id.slice(0, 8).toUpperCase()}`,
  return_requested: (id: string) => `Return request received — #${id.slice(0, 8).toUpperCase()}`,
  refunded:         (id: string) => `Your return has been approved — #${id.slice(0, 8).toUpperCase()}`,
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  packed: {
    headline: 'Your order is being packed 📦',
    message: (d: StatusEmailData) =>
      `Hey ${d.customer_name}, your order #${d.order_id.slice(0, 8).toUpperCase()} is being packed and will be handed to the courier soon.`,
  },
  shipped: {
    headline: "It's on its way! 🚚",
    message: (d: StatusEmailData) => {
      const shortId = d.order_id.slice(0, 8).toUpperCase()
      if (d.tracking_number && d.courier) {
        return `Hey ${d.customer_name}, your order #${shortId} has been shipped.<br/><br/>
          Courier: <strong>${courierTrackingLink(d.courier)}</strong><br/>
          Tracking number: <strong>${d.tracking_number}</strong>`
      }
      return `Hey ${d.customer_name}, your order #${shortId} has been shipped.`
    },
  },
  out_for_delivery: {
    headline: 'Out for delivery today 🛵',
    message: (d: StatusEmailData) =>
      `Hey ${d.customer_name}, your order #${d.order_id.slice(0, 8).toUpperCase()} is out for delivery. Keep an eye out!`,
  },
  delivered: {
    headline: 'Delivered! 🎉',
    message: (d: StatusEmailData) =>
      `Hey ${d.customer_name}, your order #${d.order_id.slice(0, 8).toUpperCase()} has been delivered. Hope you love it!`,
  },
  cancelled: {
    headline: 'Order cancelled',
    message: (d: StatusEmailData) =>
      `Hey ${d.customer_name}, your order #${d.order_id.slice(0, 8).toUpperCase()} has been cancelled. If you have questions, reply to this email.`,
  },
  return_requested: {
    headline: 'Return request received',
    message: (d: StatusEmailData) =>
      `Hey ${d.customer_name}, we've received your return request for order #${d.order_id.slice(0, 8).toUpperCase()}. We'll review it and get back to you within 1–2 business days.`,
  },
  refunded: {
    headline: 'Return approved ✅',
    message: (d: StatusEmailData) =>
      `Hey ${d.customer_name}, your return for order #${d.order_id.slice(0, 8).toUpperCase()} has been approved. Your refund of ${formatPrice(d.total)} will be processed shortly.`,
  },
}

export async function sendOrderStatusEmail(
  status: string,
  data: StatusEmailData
): Promise<{ success: boolean; error?: string }> {
  const config = STATUS_CONFIGS[status]
  if (!config) return { success: true } // silently skip unknown statuses

  const bodyMessage = config.message(data)
  const orderUrl = `${SITE_URL}/account/orders/${data.order_id}`

  const html = baseLayout(`
    <tr>
      <td style="padding:32px 32px 0;text-align:center;">
        <div style="font-size:26px;font-weight:bold;color:#3B1F0E;margin-bottom:8px;">${config.headline}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px 24px;">
        <div style="font-size:15px;color:#6B3A22;line-height:1.7;">${bodyMessage}</div>
      </td>
    </tr>
    ${ctaButton('View Order', orderUrl)}
  `)

  try {
    const { error } = await getResend().emails.send({
      from: FROM,
      to: data.customer_email,
      subject: STATUS_SUBJECTS[status](data.order_id),
      html,
    })
    if (error) {
      console.error(`[Resend] Status email (${status}) failed:`, error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err: any) {
    console.error(`[Resend] Status email (${status}) exception:`, err)
    return { success: false, error: err?.message ?? 'Unknown error' }
  }
}

// ─── Admin: new order notification ───────────────────────────────────────────

export interface AdminNewOrderData {
  order_id: string
  customer_name: string
  customer_email: string
  total: number
  payment_method: string
  item_count: number
}

export async function sendAdminNewOrderEmail(
  data: AdminNewOrderData
): Promise<{ success: boolean; error?: string }> {
  const shortId = data.order_id.slice(0, 8).toUpperCase()
  const adminOrderUrl = `${SITE_URL}/admin/orders/${data.order_id}`

  const html = baseLayout(`
    <tr>
      <td style="padding:32px 32px 0;text-align:center;">
        <div style="font-size:26px;font-weight:bold;color:#3B1F0E;margin-bottom:8px;">New order received 🛍️</div>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F4;border-radius:6px;padding:16px;">
          <tr>
            <td style="font-size:13px;color:#6B3A22;padding:4px 0;">Order</td>
            <td style="font-size:13px;color:#3B1F0E;font-weight:600;text-align:right;">#${shortId}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#6B3A22;padding:4px 0;">Customer</td>
            <td style="font-size:13px;color:#3B1F0E;text-align:right;">${data.customer_name} (${data.customer_email})</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#6B3A22;padding:4px 0;">Total</td>
            <td style="font-size:13px;color:#3B1F0E;font-weight:600;text-align:right;">${formatPrice(data.total)}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#6B3A22;padding:4px 0;">Payment</td>
            <td style="font-size:13px;color:#3B1F0E;text-align:right;">${data.payment_method.toUpperCase()}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#6B3A22;padding:4px 0;">Items</td>
            <td style="font-size:13px;color:#3B1F0E;text-align:right;">${data.item_count}</td>
          </tr>
        </table>
      </td>
    </tr>
    ${ctaButton('View Order in Admin', adminOrderUrl)}
  `)

  try {
    const { error } = await getResend().emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `New order #${shortId} — ${formatPrice(data.total)}`,
      html,
    })
    if (error) {
      console.error('[Resend] Admin new order email failed:', error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err: any) {
    console.error('[Resend] Admin new order email exception:', err)
    return { success: false, error: err?.message ?? 'Unknown error' }
  }
}