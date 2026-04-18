import { REFORM_STYLES, type ReformStyleId } from "./styles";

export interface GenerateRequest {
  imageDataUrl: string;
  styleId: ReformStyleId;
}

export interface GenerateResult {
  imageUrl: string;
  seed?: number;
  model: string;
}

const MODEL = process.env.FAL_MODEL ?? "fal-ai/flux-general";
const CONTROLNET = process.env.FAL_CONTROLNET ?? "depth";

export async function generateReformImage(
  req: GenerateRequest,
): Promise<GenerateResult> {
  const key = process.env.FAL_KEY;
  if (!key) {
    throw new Error(
      "FAL_KEY is not set. Copy .env.local.example to .env.local and fill in your fal.ai key.",
    );
  }

  const style = REFORM_STYLES.find((s) => s.id === req.styleId);
  if (!style) throw new Error(`Unknown style: ${req.styleId}`);

  // TODO: 実際の fal.ai 呼び出しをここに実装する。
  //
  // 例 (擬似コード):
  //
  //   import * as fal from "@fal-ai/serverless-client";
  //   fal.config({ credentials: key });
  //
  //   const result = await fal.subscribe(MODEL, {
  //     input: {
  //       image_url: req.imageDataUrl,
  //       prompt: style.prompt,
  //       controlnet: CONTROLNET,          // "canny" | "depth"
  //       controlnet_conditioning_scale: 0.85,
  //       num_inference_steps: 28,
  //       guidance_scale: 7,
  //     },
  //   });
  //   return { imageUrl: result.images[0].url, seed: result.seed, model: MODEL };

  throw new Error(
    "generateReformImage は未実装です。lib/falClient.ts の TODO を埋めてください。",
  );
}

export const falConfig = { model: MODEL, controlnet: CONTROLNET };
