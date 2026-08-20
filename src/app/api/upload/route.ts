import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      // Check if base64 payload
      const body = await req.json().catch(() => null)
      if (body && body.image && typeof body.image === 'string') {
        const base64Data = body.image.replace(/^data:image\/\w+;base64,/, '')
        const buffer = Buffer.from(base64Data, 'base64')
        const filename = `img_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.jpg`
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        await mkdir(uploadDir, { recursive: true })
        await writeFile(path.join(uploadDir, filename), buffer)
        return NextResponse.json({ success: true, url: `/uploads/${filename}` })
      }

      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = path.extname(file.name) || '.jpg'
    const cleanExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext.toLowerCase())
      ? ext.toLowerCase()
      : '.jpg'

    const filename = `upload_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${cleanExt}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')

    await mkdir(uploadDir, { recursive: true })
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
      filename,
    })
  } catch (error: any) {
    console.error('[UPLOAD ERROR]', error)
    return NextResponse.json({ success: false, error: error.message || 'Upload failed' }, { status: 500 })
  }
}
