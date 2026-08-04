import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Solo el panel administrativo necesita sesión. El sitio público es
  // estático/cacheado y no debe pasar por Supabase en cada visita.
  matcher: ["/admin/:path*"],
};
