import { NextResponse } from "next/server";
import { getReformJobStatus } from "@/lib/falClient";

export const runtime = "nodejs";
export const maxDuration = 15;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const requestId = searchParams.get("requestId");
  if (!requestId) {
    return NextResponse.json(
      { error: "requestId is required" },
      { status: 400 },
    );
  }
  try {
    const status = await getReformJobStatus(requestId);
    return NextResponse.json(status);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
