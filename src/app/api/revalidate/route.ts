import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { META_TAG } from "@/server/api";

/**
 * Called by the Vercel crons (see vercel.json) after the API's daily refresh, by the snapshot workflow, or by hand
 * with the secret. The cache also expires on its own right after the API's daily run (see lib/freshness.ts).
 * Vercel sends `Authorization: Bearer $CRON_SECRET`; a manual call can pass `?secret=`.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET ?? process.env.REVALIDATE_SECRET;
  const auth = req.headers.get("authorization");
  const given = auth?.startsWith("Bearer ") ? auth.slice(7) : req.nextUrl.searchParams.get("secret");
  if (!secret || given !== secret) return NextResponse.json({ ok: false }, { status: 401 });
  // expire: 0 = drop the entries now (like updateTag, which route handlers may not call), so the next render
  // fetches the day's data instead of serving the old copy while refreshing
  revalidateTag(META_TAG, { expire: 0 });
  return NextResponse.json({ ok: true, revalidated: META_TAG, at: new Date().toISOString() });
}

export const GET = POST;
