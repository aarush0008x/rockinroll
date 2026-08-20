import { getAppUrl } from '@/lib/utils'

export interface SendWhatsAppOptions {
  to: string
  message: string
}

export async function sendWhatsAppMessage({ to, message }: SendWhatsAppOptions) {
  let cleanPhone = to.replace(/[^0-9]/g, '')
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone
  }

  const whatsappApiKey = process.env.WHATSAPP_API_KEY
  const whatsappPhoneId = process.env.WHATSAPP_PHONE_ID

  // 1. WhatsApp Cloud API
  if (whatsappApiKey && whatsappPhoneId && whatsappApiKey !== 'your_whatsapp_key') {
    try {
      const res = await fetch(`https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${whatsappApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: { body: message },
        }),
      })

      const data = await res.json()
      console.log('[WHATSAPP DISPATCH RESULT]', JSON.stringify(data))
      return { success: true, provider: 'cloud_api', data }
    } catch (err: any) {
      console.error('[WHATSAPP API ERROR]', err)
      return { success: false, error: err.message }
    }
  }

  // 2. UltraMsg / Webhook Fallback
  const ultraMsgInstance = process.env.ULTRAMSG_INSTANCE_ID
  const ultraMsgToken = process.env.ULTRAMSG_TOKEN

  if (ultraMsgInstance && ultraMsgToken) {
    try {
      const res = await fetch(`https://api.ultramsg.com/${ultraMsgInstance}/messages/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token: ultraMsgToken,
          to: `+${cleanPhone}`,
          body: message,
        }),
      })
      const data = await res.json()
      return { success: true, provider: 'ultramsg', data }
    } catch (err: any) {
      console.error('[ULTRAMSG ERROR]', err)
    }
  }

  // 3. Development / Simulation Mode
  console.log(`\n💬 [WHATSAPP NOTIFICATION to +${cleanPhone}] ──────────────────────────────`)
  console.log(message)
  console.log(`──────────────────────────────────────────────────────────────────────────\n`)
  return { success: true, simulated: true }
}

// ── 1. ORDER CONFIRMED WHATSAPP ─────────────────────────────────────────────
export async function sendWhatsAppOrderConfirmed(phone: string, order: any) {
  const appUrl = getAppUrl()
  const trackerLink = `${appUrl}/orders/${order.shortCode}`
  const itemsText = order.items
    ?.map((it: any) => `• ${it.quantity}x ${it.name} (₹${it.price * it.quantity})`)
    .join('\n') || ''

  const message = `🔥 *RockinRoll Order Confirmed!*

Hi ${order.user?.name || 'Foodie'}, your order *#${order.shortCode}* has been sent to our kitchen!

*Items Ordered:*
${itemsText}
*Total Amount:* ₹${order.grandTotal}

📍 *Live Order Tracker:*
${trackerLink}

Our chefs are firing up the tandoor now! 🌯`

  return sendWhatsAppMessage({ to: phone, message })
}

// ── 2. OUT FOR DELIVERY WHATSAPP ───────────────────────────────────────────
export async function sendWhatsAppOutForDelivery(
  phone: string,
  order: any,
  riderName: string = 'Our Delivery Partner',
  riderPhone?: string
) {
  const appUrl = getAppUrl()
  const trackerLink = `${appUrl}/orders/${order.shortCode}`

  const message = `🛵 *Your Rolls are Out for Delivery!*

Order *#${order.shortCode}* is packed hot in insulated thermal bags and on its way!

👤 *Rider:* ${riderName} ${riderPhone ? `(+91 ${riderPhone})` : ''}
📍 *Live Delivery Map:* ${trackerLink}

Please keep ₹${order.grandTotal} ready if Cash on Delivery. Enjoy your feast! 🌯🔥`

  return sendWhatsAppMessage({ to: phone, message })
}

// ── 3. DELIVERED WHATSAPP ───────────────────────────────────────────────────
export async function sendWhatsAppOrderDelivered(phone: string, order: any) {
  const appUrl = getAppUrl()
  const reviewLink = `${appUrl}/orders/${order.shortCode}`

  const message = `🎉 *Order Delivered!*

Your piping-hot RockinRoll order *#${order.shortCode}* has arrived.

Did you love the smoky charcoal crunch?
⭐ Leave a 5-star review here: ${reviewLink}

_Thank you for ordering with RockinRoll! (CGC university, Mohali)_`

  return sendWhatsAppMessage({ to: phone, message })
}

// ── 4. PHONE OTP LOGIN WHATSAPP ─────────────────────────────────────────────
export async function sendWhatsAppPhoneOtp(phone: string, otp: string) {
  const message = `🔐 *Your RockinRoll Login Code is ${otp}*

Use this 6-digit OTP to log into your account or order status. Valid for 10 minutes.

Do not share this OTP with anyone.`

  return sendWhatsAppMessage({ to: phone, message })
}
