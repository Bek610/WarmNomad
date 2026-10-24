import { NextResponse } from "next/server";

// Үлдэгдэл уншихад юу болж байгааг шалгах (нууц мэдээлэл харуулахгүй)
export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.GOOGLE_SCRIPT_URL || "";
  const info: Record<string, unknown> = {
    configured: Boolean(url),
    looksLikeExecUrl: /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(url.trim()),
    hasWhitespace: url !== url.trim(),
  };
  if (!url) return NextResponse.json(info);
  try {
    const res = await fetch(`${url.trim()}?action=stock`, { cache: "no-store", redirect: "follow" });
    const text = await res.text();
    info.status = res.status;
    info.contentType = res.headers.get("content-type");
    info.bodyStart = text.slice(0, 200);
  } catch (err) {
    info.error = err instanceof Error ? err.message : String(err);
  }
  return NextResponse.json(info);
}
