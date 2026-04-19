import { NextResponse } from "next/server";
import { submitReformJob } from "@/lib/falClient";
import type { ReformStyleId } from "@/lib/styles";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      imageDataUrl?: string;
      styleId?: ReformStyleId;
    };

    if (!body.imageDataUrl || !body.styleId) {
      return NextResponse.json(
        { error: "imageDataUrl と styleId が必要です。" },
        { status: 400 },
      );
    }

    const { requestId, model } = await submitReformJob({
      imageDataUrl: body.imageDataUrl,
      styleId: body.styleId,
    });

    return NextResponse.json({ requestId, model });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
