import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const LOGIN = "/admin/login";

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isLogin = path === LOGIN;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const redirectTo = (pathname: string, next?: string) => {
    const u = request.nextUrl.clone();
    u.pathname = pathname;
    u.search = "";
    if (next) u.searchParams.set("next", next);
    return NextResponse.redirect(u);
  };

  // Sin configuración no hay sesión posible: todo va al login (que muestra el aviso).
  if (!url || !key) return isLogin ? NextResponse.next() : redirectTo(LOGIN);

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isLogin) return redirectTo(LOGIN, path);
  if (user && isLogin) return redirectTo("/admin");
  return response;
}
