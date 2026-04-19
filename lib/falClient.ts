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
const STEPS = Number(process.env.FAL_STEPS ?? "28");
const GUIDANCE = Number(process.env.FAL_GUIDANCE ?? "3.5");
const CONTROL_STRENGTH = Number(process.env.FAL_CONTROL_STRENGTH ?? "0.85");
const IMG2IMG_STRENGTH = Number(process.env.FAL_STRENGTH ?? "0.9");

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

  const input = buildInput(MODEL, style.prompt, imageUrl);

  let result: FalImageOutput;
  try {
    result = (await fal.subscribe(MODEL, {
      input,
      logs: false,
    })) as FalImageOutput;
  } catch (err) {
    const detail = extractFalErrorDetail(err);
    console.error("[fal] subscribe failed", { model: MODEL, detail });
    throw new Error(`fal.ai エラー (${MODEL}): ${detail}`);
  }

  const outUrl = result.images?.[0]?.url ?? result.image?.url;
  if (!outUrl) throw new Error("fal.ai から画像URLが返りませんでした。");

  return { imageUrl: outUrl, seed: result.seed, model: MODEL };
}

function extractFalErrorDetail(err: unknown): string {
  if (!err) return "unknown";
  if (typeof err === "string") return err;
  const e = err as {
    status?: number;
    body?: unknown;
    message?: string;
    name?: string;
  };
  const parts: string[] = [];
  if (e.name) parts.push(e.name);
  if (typeof e.status === "number") parts.push(`HTTP ${e.status}`);
  if (e.message) parts.push(e.message);
  if (e.body !== undefined) {
    try {
      parts.push(
        typeof e.body === "string" ? e.body : JSON.stringify(e.body).slice(0, 500),
      );
    } catch {
      /* ignore */
    }
  }
  return parts.length ? parts.join(" | ") : "unknown";
}

function buildInput(model: string, prompt: string, imageUrl: string) {
  const base = {
    prompt,
    num_inference_steps: STEPS,
    guidance_scale: GUIDANCE,
    num_images: 1,
    enable_safety_checker: true,
    output_format: "jpeg",
  };

  if (model.includes("control-lora-depth") || model.includes("control-lora-canny")) {
    return {
      ...base,
      control_lora_image_url: imageUrl,
      control_lora_strength: CONTROL_STRENGTH,
    };
  }

  if (model.includes("flux-general")) {
    return {
      ...base,
      controlnets: [
        {
          path: "jasperai/Flux.1-dev-Controlnet-Depth",
          control_image_url: imageUrl,
          conditioning_scale: CONTROL_STRENGTH,
          start_percentage: 0,
          end_percentage: 1,
        },
      ],
    };
  }

  return {
    ...base,
    image_url: imageUrl,
    strength: IMG2IMG_STRENGTH,
  };
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export const falConfig = { model: MODEL };
