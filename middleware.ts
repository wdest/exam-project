import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // 1. İlkin cavab yaradırıq
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Supabase müştərisini qururuq
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // DÜZƏLİŞ: Buraya ': any' əlavə etdik ki, TypeScript ilişməsin
        setAll(cookiesToSet: any) {
          cookiesToSet.forEach(({ name, value, options }: any) => request.cookies.set(name, value));
          
          response = NextResponse.next({
            request,
          });
          
          cookiesToSet.forEach(({ name, value, options }: any) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. İstifadəçini yoxlayırıq (Auth)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. Əgər Admin panelinə girmək istəyirsə və admin deyilsə
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Giriş etməyibsə -> Login-ə at
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Giriş edib, amma Admin deyilsə -> Ana səhifəyə at
    // Qeyd: Bu sorğunu bazanı çox yormamaq üçün sadələşdirmək olar, 
    // amma hələlik təhlükəsizlik üçün qalması yaxşıdır.
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Bütün yolları tut, amma statik fayllara (şəkil, favicon və s.) ilişmə
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
