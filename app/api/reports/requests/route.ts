import { NextResponse, type NextRequest } from 'next/server'
import { getServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
import { isStaff } from '@/lib/auth/guard'
import { toCsv } from '@/lib/reports/csv'
import { buildRequestsReportPdf, type ReportRow } from '@/lib/reports/pdf'

function fmt(iso?: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || !isStaff(user.role)) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const format = request.nextUrl.searchParams.get('format') ?? 'csv'
  const status = request.nextUrl.searchParams.get('status')

  const supabase = await getServerClient()
  let query = supabase
    .from('requests')
    .select('position, type, status, created_at, profiles(full_name, reg_number, program, semester), companies(name, city)')
    .order('created_at', { ascending: false })
    .limit(5000)
  if (status && status !== 'all') query = query.eq('status', status)

  const { data } = await query
  const rows = (data ?? []).map((r) => {
    const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
    const c = Array.isArray(r.companies) ? r.companies[0] : r.companies
    return {
      student: p?.full_name ?? '',
      reg: p?.reg_number ?? '',
      program: p?.program ?? '',
      semester: p?.semester ?? '',
      company: c?.name ?? '',
      city: c?.city ?? '',
      position: r.position ?? '',
      type: r.type ?? '',
      status: r.status ?? '',
      date: fmt(r.created_at as string),
    }
  })

  const stamp = new Date().toISOString().slice(0, 10)

  if (format === 'pdf') {
    const reportRows: ReportRow[] = rows.map((r) => ({
      student: r.student, reg: r.reg, company: r.company, status: r.status, date: r.date,
    }))
    const pdf = await buildRequestsReportPdf(reportRows, status && status !== 'all' ? `Requests (${status})` : 'All requests')
    return new NextResponse(pdf as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="irms-requests-${stamp}.pdf"`,
      },
    })
  }

  const csv = toCsv(
    ['Student', 'Reg #', 'Program', 'Semester', 'Company', 'City', 'Position', 'Type', 'Status', 'Submitted'],
    rows.map((r) => [r.student, r.reg, r.program, r.semester, r.company, r.city, r.position, r.type, r.status, r.date]),
  )
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="irms-requests-${stamp}.csv"`,
    },
  })
}
