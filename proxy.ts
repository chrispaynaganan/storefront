import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // Route protection will be implemented here
  // /admin/* → requires admin role
  // /account/* → requires authenticated user
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/checkout'],
}
