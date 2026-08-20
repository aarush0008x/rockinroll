import crypto from 'crypto'

const APP_ID = process.env.CASHFREE_APP_ID || 'TEST_APP_ID'
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY || 'TEST_SECRET_KEY'
const WEBHOOK_SECRET = process.env.CASHFREE_WEBHOOK_SECRET || 'TEST_WEBHOOK_SECRET'
const ENVIRONMENT = process.env.CASHFREE_ENVIRONMENT || 'PROD'

const BASE_URL =
  ENVIRONMENT === 'PROD'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg'

const API_VERSION = '2023-08-01'

interface CashfreeOrderRequest {
  orderId: string
  orderAmount: number
  orderCurrency?: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  returnUrl: string
  notifyUrl: string
}

export async function createCashfreeOrder(req: CashfreeOrderRequest) {
  const body = {
    order_id: req.orderId,
    order_amount: req.orderAmount,
    order_currency: req.orderCurrency || 'INR',
    customer_details: {
      customer_id: req.customerId,
      customer_name: req.customerName,
      customer_email: req.customerEmail,
      customer_phone: req.customerPhone,
    },
    order_meta: {
      return_url: req.returnUrl,
      notify_url: req.notifyUrl,
    },
  }

  // If live keys are not configured yet, return a mock session
  if (!process.env.CASHFREE_APP_ID || process.env.CASHFREE_APP_ID === 'your_cashfree_app_id') {
    return {
      cf_order_id: `CF_${Date.now()}`,
      order_id: req.orderId,
      payment_session_id: `session_${crypto.randomBytes(16).toString('hex')}`,
      order_status: 'ACTIVE',
      order_amount: req.orderAmount,
      order_currency: 'INR',
      is_mock: true,
    }
  }

  const response = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-version': API_VERSION,
      'x-client-id': APP_ID,
      'x-client-secret': SECRET_KEY,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Cashfree order creation failed: ${JSON.stringify(error)}`)
  }

  return response.json()
}

export function verifyCashfreeWebhook(
  rawBody: string,
  signature: string,
  timestamp: string
): boolean {
  try {
    const signedPayload = `${timestamp}${rawBody}`
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(signedPayload)
      .digest('base64')
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    )
  } catch {
    return false
  }
}
