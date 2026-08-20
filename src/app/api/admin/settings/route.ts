import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/security'
import { prisma } from '@/lib/db'
import { clearConfigCache } from '@/lib/config'

const ALLOWED_CONFIG_KEYS = [
  'CASHFREE_APP_ID',
  'CASHFREE_SECRET_KEY',
  'CASHFREE_ENVIRONMENT',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'BREVO_API_KEY',
  'BREVO_SENDER_EMAIL',
  'WHATSAPP_API_KEY',
  'WHATSAPP_PHONE_ID',
  'ULTRAMSG_INSTANCE_ID',
  'ULTRAMSG_TOKEN',
]

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ['ADMIN', 'SUPER_ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const dbConfigs = await prisma.systemConfig.findMany()
    const configMap: Record<string, { value: string; isConfigured: boolean; source: 'DB' | 'ENV' | 'UNSET' }> = {}

    for (const key of ALLOWED_CONFIG_KEYS) {
      const dbEntry = dbConfigs.find((c) => c.key === key)
      const envVal = process.env[key] || ''

      if (dbEntry && dbEntry.value.trim().length > 0) {
        configMap[key] = {
          value: dbEntry.value,
          isConfigured: true,
          source: 'DB',
        }
      } else if (envVal && !envVal.startsWith('your_') && !envVal.startsWith('re_your_')) {
        configMap[key] = {
          value: envVal,
          isConfigured: true,
          source: 'ENV',
        }
      } else {
        configMap[key] = {
          value: '',
          isConfigured: false,
          source: 'UNSET',
        }
      }
    }

    return NextResponse.json({ success: true, data: configMap })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ['ADMIN', 'SUPER_ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const entries = Object.entries(body)

    for (const [key, rawVal] of entries) {
      if (ALLOWED_CONFIG_KEYS.includes(key)) {
        const val = String(rawVal || '').trim()

        await prisma.systemConfig.upsert({
          where: { key },
          update: { value: val },
          create: { key, value: val, category: key.split('_')[0] || 'GENERAL' },
        })

        clearConfigCache(key)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Integration credentials saved to database successfully!',
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
