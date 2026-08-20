import crypto from 'crypto'

export function generateOrderShortCode(): string {
  const timestamp = Date.now().toString().slice(-4)
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase().slice(0, 3)
  return `RR-${timestamp}-${rand}`
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function calculateTax(subtotal: number, taxRate: number = 0.05): number {
  return Math.round(subtotal * taxRate * 100) / 100
}

export function calculateDeliveryFee(subtotal: number): number {
  if (subtotal >= 499) return 0
  if (subtotal >= 299) return 29
  return 49
}

export function calculateDiscount(
  subtotal: number,
  coupon: {
    discountType: string
    value: number
    minOrderAmount: number
    maxDiscount: number | null
  } | null
): number {
  if (!coupon) return 0
  if (subtotal < coupon.minOrderAmount) return 0

  let discount = 0
  if (coupon.discountType === 'PERCENT') {
    discount = (subtotal * coupon.value) / 100
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount)
    }
  } else {
    discount = coupon.value
  }

  return Math.round(Math.min(discount, subtotal) * 100) / 100
}

export function apiSuccess<T>(data: T, status: number = 200) {
  return Response.json({ success: true, data }, { status })
}

export function apiError(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status })
}
