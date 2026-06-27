import { NextResponse, type NextRequest } from 'next/server'
import { getServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'

export interface CompanySuggestion {
  name: string
  city: string | null
  address: string | null
  country: string | null
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ suggestions: [] }, { status: 401 })

  const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return NextResponse.json({ suggestions: [] })

  const supabase = await getServerClient()
  const { data } = await supabase
    .from('companies')
    .select('name, city, address, country')
    .ilike('name', `${q}%`)
    .order('internship_count', { ascending: false })
    .limit(6)

  return NextResponse.json({ suggestions: (data ?? []) as CompanySuggestion[] })
}
