// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/', '/sign-in'];

export function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const pathname = req.nextUrl.pathname;

  // Permitir acesso a rotas públicas
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Se não tiver token, redireciona para login
  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // ✅ Aqui não dá para validar com jwt.verify — apenas segue
  // Validação real será feita no backend das páginas protegidas

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/teacher/:path*',
    '/student/:path*'
  ],
};
