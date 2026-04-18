import { NextResponse } from "next/server";
import { generateReformImage } from "@/lib/falClient";
import type { ReformStyleId } from "@/lib/styles";

export const runtime = "nodejs";

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

    const result = await generateReformImage({
      imageDataUrl: body.imageDataUrl,
      styleId: body.styleId,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
