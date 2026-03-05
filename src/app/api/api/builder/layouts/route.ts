import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Use /api/builder/layouts instead." }, { status: 301 });
}
