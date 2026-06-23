import { NextResponse } from "next/server";
import { getWexmeFeed } from "@/lib/courtside/wexme";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { live, scheduled } = await getWexmeFeed();
    return NextResponse.json(
      { live, scheduled },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ live: [], scheduled: [] }, { status: 200 });
  }
}
