import { NextResponse, type NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { setPerformerPhoto } from "@/lib/courtside/overrides";

export const runtime = "nodejs";

const CODE = process.env.COURTSIDE_UPLOAD_CODE || "courtside";
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 6 * 1024 * 1024;

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Expected multipart form data." }, { status: 400 });
  }

  const passcode = String(form.get("passcode") ?? "");
  if (passcode !== CODE) {
    return NextResponse.json({ ok: false, error: "Invalid passcode." }, { status: 401 });
  }

  const gameId = String(form.get("gameId") ?? "");
  const category = String(form.get("category") ?? "");
  const playerId = String(form.get("playerId") ?? "");
  const file = form.get("file");

  if (!gameId || !category || !playerId || !(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { ok: false, error: "Unsupported image type. Use JPG, PNG, WEBP or GIF." },
      { status: 415 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "Image is larger than 6 MB." }, { status: 413 });
  }

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const safe = `${gameId}-${category}-${crypto.randomUUID().slice(0, 8)}.${ext}`.replace(/[^a-z0-9.\-]/gi, "");
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, safe), buffer);

  const url = `/uploads/${safe}`;
  await setPerformerPhoto(gameId, category, playerId, url);

  return NextResponse.json({ ok: true, url });
}
