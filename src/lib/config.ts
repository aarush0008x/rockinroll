import { prisma } from './db'

// In-memory cache with 15-second TTL to avoid database strain on high traffic
const cache: Record<string, { value: string; expiry: number }> = {}

export async function getSystemConfig(key: string, defaultEnvVar?: string): Promise<string> {
  const now = Date.now()
  if (cache[key] && cache[key].expiry > now) {
    return cache[key].value
  }

  try {
    const record = await prisma.systemConfig.findUnique({
      where: { key },
    })

    if (record && record.value.trim().length > 0) {
      cache[key] = { value: record.value, expiry: now + 15000 }
      return record.value
    }
  } catch (err) {
    console.error(`[CONFIG ERROR] Failed to fetch key '${key}' from DB:`, err)
  }

  const fallback = defaultEnvVar ? process.env[defaultEnvVar] || '' : process.env[key] || ''
  cache[key] = { value: fallback, expiry: now + 15000 }
  return fallback
}

export function clearConfigCache(key?: string) {
  if (key) {
    delete cache[key]
  } else {
    for (const k in cache) delete cache[k]
  }
}
