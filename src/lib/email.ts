/**
 * Brevo (Sendinblue) Transactional Email Service for RockinRoll
 */

export interface EmailRecipient {
  email: string
  name?: string
}

export interface SendEmailOptions {
  to: EmailRecipient[]
  subject: string
  htmlContent: string
  textContent?: string
}

export async function sendBrevoEmail(options: SendEmailOptions) {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'rockinroll@gmail.com'
  const senderName = process.env.BREVO_SENDER_NAME || 'RockinRoll Gourmet Rolls'

  if (!apiKey || apiKey === 'your_brevo_api_key_here') {
    console.log(`[BREVO SIMULATION] Email to ${options.to.map((t) => t.email).join(', ')} | Subject: ${options.subject}`)
    return { success: true, simulated: true }
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: options.to,
        subject: options.subject,
        htmlContent: options.htmlContent,
        textContent: options.textContent,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      console.error('Brevo API Error:', data)
      return { success: false, error: data.message || 'Failed to send email via Brevo' }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Brevo email exception:', error)
    return { success: false, error: error.message }
  }
}

// ── 1. ACCOUNT VERIFICATION EMAIL ───────────────────────────────────────────
export async function sendAccountVerificationEmail(
  email: string,
  name: string,
  verificationCode: string,
  verificationLink: string
) {
  const subject = `Verify your RockinRoll Account (Code: ${verificationCode})`
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background-color: #22092C; margin: 0; padding: 30px; color: #333;">
      <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
        <div style="background: linear-gradient(135deg, #BE3144, #F05941); padding: 32px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1px;">ROCKIN<span style="color: #22092C;">ROLL</span></h1>
          <p style="margin: 8px 0 0; font-size: 13px; font-weight: 600; opacity: 0.9;">Gourmet Kathi & Fusion Rolls</p>
        </div>

        <div style="padding: 32px;">
          <h2 style="color: #22092C; font-size: 20px; font-weight: 800; margin-top: 0;">Welcome to the Roll Revolution, ${name}!</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #555;">
            Thank you for creating an account with RockinRoll. Please verify your email address to unlock quick ordering, live order tracking, and exclusive rewards.
          </p>

          <div style="margin: 24px 0; padding: 20px; background: #FFF8F5; border: 2px dashed #BE3144; border-radius: 16px; text-align: center;">
            <span style="display: block; font-size: 12px; font-weight: 800; color: #872341; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Your 6-Digit Verification Code</span>
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #BE3144;">${verificationCode}</span>
          </div>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${verificationLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #BE3144, #F05941); color: #ffffff; text-decoration: none; font-weight: 900; font-size: 14px; border-radius: 14px; text-transform: uppercase; letter-spacing: 1px;">
              Verify Account Online →
            </a>
          </div>

          <p style="font-size: 12px; color: #888; text-align: center; margin-top: 24px;">
            This code will expire in 30 minutes. If you did not sign up for RockinRoll, please ignore this email.
          </p>
        </div>

        <div style="background: #FFF8F5; padding: 18px; text-align: center; border-top: 1px solid #eee; font-size: 11px; color: #777;">
          © ${new Date().getFullYear()} RockinRoll Food Systems Inc. • CGC university, Mohali
        </div>
      </div>
    </body>
    </html>
  `

  return sendBrevoEmail({
    to: [{ email, name }],
    subject,
    htmlContent,
    textContent: `Welcome to RockinRoll, ${name}! Your verification code is ${verificationCode}. Verify online: ${verificationLink}`,
  })
}

// ── 2. PASSWORD RESET EMAIL ─────────────────────────────────────────────────
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetLink: string
) {
  const subject = `Reset your RockinRoll Password`
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background-color: #22092C; margin: 0; padding: 30px; color: #333;">
      <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
        <div style="background: linear-gradient(135deg, #BE3144, #F05941); padding: 32px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1px;">ROCKIN<span style="color: #22092C;">ROLL</span></h1>
        </div>

        <div style="padding: 32px;">
          <h2 style="color: #22092C; font-size: 20px; font-weight: 800; margin-top: 0;">Password Reset Request</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #555;">
            Hi ${name}, we received a request to reset your RockinRoll account password. Click the button below to set a new password:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="display: inline-block; padding: 14px 36px; background: #22092C; color: #ffffff; text-decoration: none; font-weight: 900; font-size: 14px; border-radius: 14px; text-transform: uppercase; letter-spacing: 1px;">
              Reset My Password →
            </a>
          </div>

          <p style="font-size: 12px; color: #888; line-height: 1.5;">
            If you did not request a password reset, you can safely ignore this email. This link is valid for 1 hour.
          </p>
        </div>

        <div style="background: #FFF8F5; padding: 18px; text-align: center; border-top: 1px solid #eee; font-size: 11px; color: #777;">
          © ${new Date().getFullYear()} RockinRoll Food Systems Inc.
        </div>
      </div>
    </body>
    </html>
  `

  return sendBrevoEmail({
    to: [{ email, name }],
    subject,
    htmlContent,
    textContent: `Hi ${name}, reset your RockinRoll password by visiting: ${resetLink}`,
  })
}

// ── 3. LIVE ORDER STATUS NOTIFICATION EMAIL ─────────────────────────────────
export async function sendOrderStatusEmail(order: any, newStatus: string) {
  const customerEmail = order.user?.email
  const customerName = order.user?.name || 'Valued Customer'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'
  const trackerLink = `${appUrl}/orders/${order.shortCode}`

  if (!customerEmail) return { success: false, error: 'No customer email' }

  let statusTitle = ''
  let statusEmoji = ''
  let statusDesc = ''

  switch (newStatus) {
    case 'CONFIRMED':
      statusTitle = 'Order Confirmed & Sent to Kitchen'
      statusEmoji = '🔥'
      statusDesc = 'Your order is confirmed! Our chefs are preparing your ingredients for the tandoor.'
      break
    case 'PREPARING':
      statusTitle = 'Rolling & Flame-Grilling in Progress'
      statusEmoji = '👨‍🍳'
      statusDesc = 'Your juicy tikkas and artisanal parathas are on the grill right now!'
      break
    case 'READY':
      statusTitle = 'Packed & Ready for Rider Pickup'
      statusEmoji = '📦'
      statusDesc = 'Your order is boxed hot in thermal packaging and waiting for your delivery hero.'
      break
    case 'OUT_FOR_DELIVERY':
      statusTitle = 'Out for Delivery — On the Way!'
      statusEmoji = '🛵'
      statusDesc = 'Your delivery partner is on the way with your piping-hot meal!'
      break
    case 'DELIVERED':
      statusTitle = 'Delivered! Enjoy Your Feast'
      statusEmoji = '🎉'
      statusDesc = 'Your RockinRoll order has arrived. Grab a bite and enjoy every flavor!'
      break
    case 'CANCELLED':
      statusTitle = 'Order Cancelled'
      statusEmoji = '❌'
      statusDesc = 'Your order has been cancelled. Any deducted amount will be refunded promptly.'
      break
    default:
      statusTitle = `Order Status: ${newStatus}`
      statusEmoji = '🌯'
      statusDesc = `Your order status has been updated to ${newStatus}.`
  }

  const subject = `${statusEmoji} ${statusTitle} (Order #${order.shortCode})`

  const itemsHtml = order.items
    ?.map(
      (item: any) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0e6e6; font-size: 13px; font-weight: bold; color: #22092C;">
          ${item.quantity}x ${item.name}
          ${item.addons?.length ? `<div style="font-size: 11px; color: #BE3144; font-weight: normal;">+ ${item.addons.map((a: any) => a.name).join(', ')}</div>` : ''}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0e6e6; font-size: 13px; font-weight: 900; color: #22092C; text-align: right;">
          ₹${item.price * item.quantity}
        </td>
      </tr>
    `
    )
    .join('')

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background-color: #22092C; margin: 0; padding: 30px; color: #333;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
        <div style="background: linear-gradient(135deg, #BE3144, #F05941); padding: 28px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px;">ROCKIN<span style="color: #22092C;">ROLL</span></h1>
          <p style="margin: 6px 0 0; font-size: 12px; font-weight: 700; opacity: 0.9;">Order #${order.shortCode}</p>
        </div>

        <div style="padding: 32px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 38px; margin-bottom: 8px;">${statusEmoji}</div>
            <h2 style="color: #22092C; font-size: 22px; font-weight: 900; margin: 0;">${statusTitle}</h2>
            <p style="font-size: 14px; color: #666; margin: 8px 0 0; line-height: 1.5;">${statusDesc}</p>
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${trackerLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #BE3144, #F05941); color: #ffffff; text-decoration: none; font-weight: 900; font-size: 14px; border-radius: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(190,49,68,0.3);">
              Track Live Order 🛵 →
            </a>
          </div>

          <div style="background: #FFF8F5; border-radius: 18px; padding: 20px; margin-top: 24px;">
            <h4 style="margin: 0 0 12px; font-size: 13px; font-weight: 900; color: #22092C; text-transform: uppercase; letter-spacing: 1px;">Order Summary</h4>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsHtml}
              <tr>
                <td style="padding-top: 12px; font-size: 14px; font-weight: 900; color: #22092C;">Grand Total</td>
                <td style="padding-top: 12px; font-size: 16px; font-weight: 900; color: #BE3144; text-align: right;">₹${order.grandTotal}</td>
              </tr>
            </table>
          </div>

          ${order.address ? `
            <div style="margin-top: 18px; font-size: 12px; color: #666; line-height: 1.4;">
              <strong style="color: #22092C;">Delivery Address:</strong><br>
              ${order.address.name} (${order.address.phone})<br>
              ${order.address.houseFlatNo}, ${order.address.street}, ${order.address.area}, ${order.address.city} - ${order.address.pinCode}
            </div>
          ` : ''}
        </div>

        <div style="background: #FFF8F5; padding: 16px; text-align: center; border-top: 1px solid #eee; font-size: 11px; color: #777;">
          Need assistance? Reply to this email or call +91 95017 14559
        </div>
      </div>
    </body>
    </html>
  `

  return sendBrevoEmail({
    to: [{ email: customerEmail, name: customerName }],
    subject,
    htmlContent,
    textContent: `${statusTitle} for Order #${order.shortCode}. Track live at: ${trackerLink}`,
  })
}
