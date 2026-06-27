import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Refreshes the Supabase auth session on every request and guards app routes.
 * Unauthenticated users are redirected to /login when visiting protected areas;
 * authenticated users are redirected away from the auth pages.
 */
const PROTECTED_PREFIXES = ['/dashboard', '/profile', '/requests', '/letters', '/admin', '/staff']
const AUTH_PAGES = ['/login', '/signup', '/verify-otp', '/forgot']

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p))
  const isAuthPage = AUTH_PAGES.some((p) => path.startsWith(p))

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  // Run on everything except static assets and the public verify pages.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|verify|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
