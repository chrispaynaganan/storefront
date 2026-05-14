import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import sharp from 'sharp'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const slug = formData.get('slug') as string | null

    if (!file || !slug) {
      return NextResponse.json({ error: 'Missing file or slug.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Convert any image format to WebP
    const webpBuffer = await sharp(buffer)
      .webp({ quality: 85 })
      .toBuffer()

    const path = `${slug}-${Date.now()}.webp`
    const supabase = await createAdminSupabaseClient()

    const { error: upErr } = await supabase.storage
      .from('products')
      .upload(path, webpBuffer, {
        contentType: 'image/webp',
        upsert: false,
      })

    if (upErr) throw upErr

    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(path)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Upload failed.' }, { status: 500 })
  }
}