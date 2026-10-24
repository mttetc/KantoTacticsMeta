import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { META_TAG } from "@/server/api";

/**
 * Called by the Vercel cron (see vercel.json) after the API's daily refresh, or by hand with the secret.
 * Vercel sends `Authorization: Bearer $CRON_SECRET`; a manual call can pass `?secret=`.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET ?? process.env.REVALIDATE_SECRET;
  const auth = req.headers.get("authorization");
  const given = auth?.startsWith("Bearer ") ? auth.slice(7) : req.nextUrl.searchParams.get("secret");
  if (!secret || given !== secret) return NextResponse.json({ ok: false }, { status: 401 });
  revalidateTag(META_TAG, "max");
  return NextResponse.json({ ok: true, revalidated: META_TAG, at: new Date().toISOString() });
}

export const GET = POST;
