import * as fal from "@fal-ai/serverless-client";
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

const MODEL = process.env.FAL_MODEL ?? "fal-ai/flux/dev/image-to-image";
const STRENGTH = Number(process.env.FAL_STRENGTH ?? "0.75");
const STEPS = Number(process.env.FAL_STEPS ?? "28");
const GUIDANCE = Number(process.env.FAL_GUIDANCE ?? "3.5");

let configured = false;
function ensureConfigured(key: string) {
  if (configured) return;
  fal.config({ credentials: key });
  configured = true;
}

interface FalImageOutput {
  images?: Array<{ url: string }>;
  image?: { url: string };
  seed?: number;
}

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

  ensureConfigured(key);

  const blob = await dataUrlToBlob(req.imageDataUrl);
  const imageUrl = await fal.storage.upload(blob);

  const result = (await fal.subscribe(MODEL, {
    input: {
      prompt: style.prompt,
      image_url: imageUrl,
      strength: STRENGTH,
      num_inference_steps: STEPS,
      guidance_scale: GUIDANCE,
      num_images: 1,
      enable_safety_checker: true,
      output_format: "jpeg",
    },
    logs: false,
  })) as FalImageOutput;

  const outUrl = result.images?.[0]?.url ?? result.image?.url;
  if (!outUrl) throw new Error("fal.ai から画像URLが返りませんでした。");

  return { imageUrl: outUrl, seed: result.seed, model: MODEL };
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export const falConfig = { model: MODEL, strength: STRENGTH };
