// En un archivo middleware.ts en la raíz
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

// Rutas que no requieren autenticación
const publicRoutes = ['/login', '/register', '/api/auth/callback']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Refrescar la sesión de forma explícita
  await supabase.auth.getSession()
  
  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  
  // Verificar la sesión
  const { data: { session } } = await supabase.auth.getSession()
  
  // Si no hay sesión y no estamos en una ruta pública, redirigir a login
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  // Si hay sesión y estamos en login, redirigir a home
  if (session && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url))
  }
  
  return res
}

// Limitar el middleware a rutas específicas
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * 1. Archivos estáticos (_next/static, _next/image, favicon.ico, etc.)
     * 2. Rutas de API (opcional, dependiendo de tu caso)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}