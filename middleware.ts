import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Artıq heç bir yoxlama yoxdur, birbaşa keçid veririk
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Bütün yolları tutur, amma statik fayllara ilişmir
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
