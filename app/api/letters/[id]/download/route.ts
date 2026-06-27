import { NextResponse, type NextRequest } from 'next/server'
import { getServerClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/session'
import { buildDownloadRecord } from '@/lib/letters/history'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // RLS ensures the user can only see their own letter (or any, if staff).
  const supabase = await getServerClient()
  const { data: letter } = await supabase
    .from('letters')
    .select('id, pdf_path, serial_number, is_revoked')
    .eq('id', id)
    .maybeSingle()

  if (!letter?.pdf_path) {
    return NextResponse.json({ error: 'Letter not found' }, { status: 404 })
  }
  if (letter.is_revoked) {
    return NextResponse.json({ error: 'This letter has been revoked' }, { status: 410 })
  }

  // Fetch the PDF from the private bucket with the service role.
  const admin = getAdminClient()
  const { data: file, error } = await admin.storage.from('letters').download(letter.pdf_path)
  if (error || !file) {
    return NextResponse.json({ error: 'File unavailable' }, { status: 404 })
  }

  // Record the download (best-effort).
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
  await admin.from('download_history').insert(buildDownloadRecord(letter.id, user.id, ip))

  const bytes = await file.arrayBuffer()
  return new NextResponse(bytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${letter.serial_number}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
