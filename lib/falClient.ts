import * as fal from "@fal-ai/serverless-client";
import type { QueueStatus } from "@fal-ai/serverless-client";
import { REFORM_STYLES, type ReformStyleId } from "./styles";

export interface SubmitRequest {
  imageDataUrl: string;
  styleId: ReformStyleId;
}

export interface SubmitResult {
  requestId: string;
  model: string;
}

export type JobState = "queued" | "generating" | "done" | "error";

export interface JobStatus {
  state: JobState;
  queuePosition?: number;
  logs?: string[];
  imageUrl?: string;
  error?: string;
  model: string;
}

const MODEL = process.env.FAL_MODEL ?? "fal-ai/flux/dev/image-to-image";
const STEPS = Number(process.env.FAL_STEPS ?? "28");
const GUIDANCE = Number(process.env.FAL_GUIDANCE ?? "3.5");
const CONTROL_STRENGTH = Number(process.env.FAL_CONTROL_STRENGTH ?? "0.85");
const IMG2IMG_STRENGTH = Number(process.env.FAL_STRENGTH ?? "0.9");

let configured = false;
function ensureConfigured() {
  if (configured) return;
  const key = process.env.FAL_KEY;
  if (!key) {
    throw new Error(
      "FAL_KEY is not set. Copy .env.local.example to .env.local and fill in your fal.ai key.",
    );
  }
  fal.config({ credentials: key });
  configured = true;
}

export async function submitReformJob(
  req: SubmitRequest,
): Promise<SubmitResult> {
  ensureConfigured();
  const style = REFORM_STYLES.find((s) => s.id === req.styleId);
  if (!style) throw new Error(`Unknown style: ${req.styleId}`);

  const blob = await dataUrlToBlob(req.imageDataUrl);
  const imageUrl = await fal.storage.upload(blob);
  const input = buildInput(MODEL, style.prompt, imageUrl);

  try {
    const { request_id } = await fal.queue.submit(MODEL, { input });
    return { requestId: request_id, model: MODEL };
  } catch (err) {
    const detail = extractFalErrorDetail(err);
    console.error("[fal] submit failed", { model: MODEL, detail });
    throw new Error(`fal.ai submit エラー (${MODEL}): ${detail}`);
  }
}

export async function getReformJobStatus(
  requestId: string,
): Promise<JobStatus> {
  ensureConfigured();
  try {
    const status = await fal.queue.status(MODEL, {
      requestId,
      logs: true,
    });
    return await mapStatus(status, requestId);
  } catch (err) {
    const detail = extractFalErrorDetail(err);
    console.error("[fal] status failed", { requestId, detail });
    return { state: "error", error: detail, model: MODEL };
  }
}

interface FalImageOutput {
  images?: Array<{ url: string }>;
  image?: { url: string };
  seed?: number;
}

async function mapStatus(
  status: QueueStatus,
  requestId: string,
): Promise<JobStatus> {
  if (status.status === "IN_QUEUE") {
    return {
      state: "queued",
      queuePosition: status.queue_position,
      model: MODEL,
    };
  }
  if (status.status === "IN_PROGRESS") {
    const logs = (status.logs ?? [])
      .map((l) => l.message)
      .filter((m) => !!m)
      .slice(-3);
    return { state: "generating", logs, model: MODEL };
  }
  try {
    const result = (await fal.queue.result(MODEL, {
      requestId,
    })) as FalImageOutput;
    const outUrl = result.images?.[0]?.url ?? result.image?.url;
    if (!outUrl) {
      return {
        state: "error",
        error: "fal.ai から画像URLが返りませんでした。",
        model: MODEL,
      };
    }
    return { state: "done", imageUrl: outUrl, model: MODEL };
  } catch (err) {
    const detail = extractFalErrorDetail(err);
    console.error("[fal] result fetch failed", { requestId, detail });
    return { state: "error", error: detail, model: MODEL };
  }
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

  if (model.includes("flux-lora-depth") || model.includes("flux-lora-canny")) {
    return { ...base, image_url: imageUrl };
  }

  if (
    model.includes("control-lora-depth") ||
    model.includes("control-lora-canny")
  ) {
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

  return { ...base, image_url: imageUrl, strength: IMG2IMG_STRENGTH };
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
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
        typeof e.body === "string"
          ? e.body
          : JSON.stringify(e.body).slice(0, 500),
      );
    } catch {
      /* ignore */
    }
  }
  return parts.length ? parts.join(" | ") : "unknown";
}

export const falConfig = { model: MODEL };
