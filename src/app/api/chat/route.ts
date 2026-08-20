import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory } = await req.json()
    const text = (message || '').trim().toLowerCase()

    if (!text) {
      return NextResponse.json({ success: false, reply: "Hi there! I'm RollBot 🌯 How can I help you today?" })
    }

    // 1. Order Tracking by code or number
    const orderMatch = text.match(/rr-[a-z0-9]+/i) || text.match(/order\s*#?\s*([a-z0-9]+)/i)
    if (orderMatch || text.includes('track') || text.includes('where is my order') || text.includes('status')) {
      const code = orderMatch ? (orderMatch[1] || orderMatch[0]).toUpperCase() : null

      if (code) {
        const order = await prisma.order.findFirst({
          where: {
            OR: [
              { shortCode: code },
              { id: code },
            ],
          },
          include: {
            items: { include: { product: true } },
            payment: true,
          },
        })

        if (order) {
          const statusMap: Record<string, string> = {
            PENDING: '⏳ Placed & awaiting kitchen confirmation',
            CONFIRMED: '🔥 Confirmed & sent to the chef!',
            PREPARING: '👨‍🍳 Sizzling on the hot tawa right now!',
            READY_FOR_PICKUP: '📦 Packed hot and waiting for the rider!',
            OUT_FOR_DELIVERY: '🛵 On the way with our delivery hero!',
            DELIVERED: '🎉 Delivered! Hope you enjoyed the roll!',
            CANCELLED: '❌ Order was cancelled',
          }

          return NextResponse.json({
            success: true,
            reply: `📦 **Order Status for ${order.shortCode}**:
• **Status**: ${statusMap[order.status] || order.status}
• **Total**: ₹${order.grandTotal} (${order.items.length} items)
• **Payment**: ${order.payment?.status || 'COD / PENDING'} via ${order.payment?.gateway || 'CASHFREE'}
• [Click here to view live tracker](https://rockinroll.in/orders/${order.shortCode})`,
            actionType: 'TRACK_ORDER',
            orderCode: order.shortCode,
          })
        } else {
          return NextResponse.json({
            success: true,
            reply: `I couldn't find an order matching **${code}**. Please double-check your shortcode (e.g. \`RR-1024\`) or view your [Dashboard](https://rockinroll.in/dashboard).`,
          })
        }
      } else {
        return NextResponse.json({
          success: true,
          reply: `To track your order, please type your **Order ID** or **Shortcode** (for example: \`RR-1024\`), or check your active orders on your [Dashboard](https://rockinroll.in/dashboard)!`,
        })
      }
    }

    // 2. Coupon / Discount / Offers query
    if (text.includes('coupon') || text.includes('offer') || text.includes('discount') || text.includes('promo') || text.includes('cgc')) {
      const coupons = await prisma.coupon.findMany({
        where: { isActive: true },
        take: 3,
      })

      const list = coupons.map((c) => `• **${c.id}**: ${c.discountType === 'PERCENTAGE' ? `${c.value}% OFF` : `₹${c.value} FLAT OFF`}${c.minOrderAmount ? ` (Min ₹${c.minOrderAmount})` : ''}`).join('\n')

      return NextResponse.json({
        success: true,
        reply: `🎉 **Current Active Offers & Promos**:
${list || '• **CGC50**: Flat ₹50 OFF for CGC students!\n• **FIRSTROLL**: 20% OFF on your first roll!'}

🪙 **RollPoints Loyalty**: You also earn 1 RollPoint for every ₹10 spent (100 RollPoints = ₹10 OFF) redeemable right at checkout!`,
        actionType: 'SHOW_COUPONS',
      })
    }

    // 3. Menu Recommendations / Vegetarian / Non-Veg / Spicy
    if (text.includes('menu') || text.includes('recommend') || text.includes('best') || text.includes('veg') || text.includes('chicken') || text.includes('spicy') || text.includes('paneer')) {
      const isVegOnly = text.includes('veg') && !text.includes('non');
      const isNonVeg = text.includes('chicken') || text.includes('non-veg') || text.includes('mutton') || text.includes('meat');

      const products = await prisma.product.findMany({
        where: {
          isAvailable: true,
          ...(isVegOnly && { isVeg: true }),
          ...(isNonVeg && { isVeg: false }),
        },
        take: 4,
        orderBy: { isBestSeller: 'desc' },
      })

      const itemsList = products.map((p) => `• **${p.name}** — ₹${p.price} ${p.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}${p.isBestSeller ? ' ⭐ Bestseller' : ''}`).join('\n')

      return NextResponse.json({
        success: true,
        reply: `🌯 **Chef's Top Recommended Rolls**:
${itemsList}

👉 You can explore the full menu and customize toppings at [rockinroll.in/menu](https://rockinroll.in/menu)!`,
        actionType: 'RECOMMEND_MENU',
      })
    }

    // 4. Store Hours / Delivery Timings
    if (text.includes('time') || text.includes('timing') || text.includes('hour') || text.includes('open') || text.includes('close')) {
      return NextResponse.json({
        success: true,
        reply: `⏰ **Operating Hours**:
We are open daily from **11:00 AM – 11:00 PM** for hot takeaway and fast doorstep delivery!

🛵 Average delivery time: **20–30 minutes**.`,
      })
    }

    // 5. Contact / Support / Human Handover
    if (text.includes('contact') || text.includes('human') || text.includes('support') || text.includes('phone') || text.includes('email') || text.includes('help')) {
      return NextResponse.json({
        success: true,
        reply: `📞 **RockinRoll Customer Care & Kitchen Desk**:
• **Email**: [support@rockinroll.in](mailto:support@rockinroll.in)
• **Phone**: [+91 98765 43210](tel:+919876543210)
• **WhatsApp**: [Chat directly with Chef on WhatsApp](https://wa.me/919876543210?text=Hi%20RockinRoll%20Team%2C%20I%20need%20assistance)`,
      })
    }

    // 6. RollPoints Loyalty Info
    if (text.includes('point') || text.includes('loyalty') || text.includes('reward')) {
      return NextResponse.json({
        success: true,
        reply: `🪙 **RollPoints™ Loyalty Rewards**:
• Earn **1 RollPoint** for every ₹10 spent.
• Conversion rate: **100 RollPoints = ₹10 INR**.
• Automatic 1-click redemption right on the checkout page!`,
      })
    }

    // Default friendly response
    return NextResponse.json({
      success: true,
      reply: `I'm **RollBot**, your 24/7 Kathi roll assistant! 🌯

Here is what I can do:
1. 📦 **Track an order**: Type your Order ID (e.g. \`RR-1024\`)
2. 🎟️ **Show offers**: Type "coupons" or "discounts"
3. 🔥 **Recommend rolls**: Type "best sellers" or "spicy rolls"
4. ⏰ **Store timings**: Type "hours" or "open"
5. 💬 **Live human help**: Type "support" or "whatsapp"`,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, reply: "Oops, I ran into a hiccup. Please try asking again!" })
  }
}
