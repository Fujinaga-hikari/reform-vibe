"use client";

import {
  ArrowRight,
  Building2,
  Camera,
  Loader2,
  ShieldCheck,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import { useState } from "react";
import BeforeAfter from "@/components/BeforeAfter";
import GenerationLoader from "@/components/GenerationLoader";
import ImageUploader from "@/components/ImageUploader";
import StyleSelector from "@/components/StyleSelector";
import type { ReformStyleId } from "@/lib/styles";

type Status = "idle" | "generating" | "done" | "error";
type ErrorKind = "timeout" | "network" | "server" | "unknown";

interface Progress {
  state: "queued" | "generating";
  queuePosition?: number;
  logs?: string[];
}

const TOTAL_TIMEOUT_MS = 5 * 60 * 1000;
const POLL_INTERVAL_MS = 2000;

export default function HomePage() {
  const [image, setImage] = useState<string | null>(null);
  const [styleId, setStyleId] = useState<ReformStyleId | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<{ kind: ErrorKind; message: string } | null>(null);

  const canGenerate = !!image && !!styleId && status !== "generating";

  async function onGenerate() {
    if (!image || !styleId) return;
    setStatus("generating");
    setError(null);
    setProgress({ state: "queued" });

    const controller = new AbortController();
    const totalTimeoutId = setTimeout(() => controller.abort(), TOTAL_TIMEOUT_MS);

    try {
      const submitRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imageDataUrl: image, styleId }),
        signal: controller.signal,
      });
      const submitData = await submitRes.json().catch(() => ({}));
      if (!submitRes.ok) {
        setError({
          kind: "server",
          message: submitData.error ?? `サーバーエラー (HTTP ${submitRes.status})`,
        });
        setStatus("error");
        return;
      }
      const requestId: string | undefined = submitData.requestId;
      if (!requestId) {
        setError({ kind: "server", message: "requestId が返りませんでした。" });
        setStatus("error");
        return;
      }

      while (!controller.signal.aborted) {
        await sleep(POLL_INTERVAL_MS, controller.signal);
        const statusRes = await fetch(
          `/api/generate/status?requestId=${encodeURIComponent(requestId)}`,
          { signal: controller.signal },
        );
        const statusData = await statusRes.json().catch(() => ({}));
        if (!statusRes.ok) {
          setError({
            kind: "server",
            message: statusData.error ?? `サーバーエラー (HTTP ${statusRes.status})`,
          });
          setStatus("error");
          return;
        }

        if (statusData.state === "queued" || statusData.state === "generating") {
          setProgress({
            state: statusData.state,
            queuePosition: statusData.queuePosition,
            logs: statusData.logs,
          });
          continue;
        }
        if (statusData.state === "done" && statusData.imageUrl) {
          setResult(statusData.imageUrl);
          setStatus("done");
          setProgress(null);
          return;
        }
        if (statusData.state === "error") {
          setError({
            kind: "server",
            message: statusData.error ?? "生成に失敗しました。",
          });
          setStatus("error");
          return;
        }
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setError({
          kind: "timeout",
          message: `生成が ${TOTAL_TIMEOUT_MS / 1000} 秒以内に完了しませんでした。fal.ai のキューが混雑している可能性があります。少し時間をおいて再度お試しください。`,
        });
      } else if (e instanceof TypeError) {
        setError({
          kind: "network",
          message: "ネットワークに接続できませんでした。通信環境を確認してください。",
        });
      } else {
        setError({
          kind: "unknown",
          message: e instanceof Error ? e.message : "予期しないエラーが発生しました。",
        });
      }
      setStatus("error");
    } finally {
      clearTimeout(totalTimeoutId);
    }
  }

  function sleep(ms: number, signal: AbortSignal) {
    return new Promise<void>((resolve, reject) => {
      if (signal.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      const id = setTimeout(resolve, ms);
      const onAbort = () => {
        clearTimeout(id);
        reject(new DOMException("Aborted", "AbortError"));
      };
      signal.addEventListener("abort", onAbort, { once: true });
    });
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-24 pt-10 sm:px-8">
      <Header />

      <section className="mt-12 grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy-700">
            <Sparkles className="h-3.5 w-3.5" />
            Micro-SaaS β版
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-navy-900 sm:text-5xl">
            現場写真1枚から、
            <br />
            <span className="text-navy-600">リフォーム提案</span>を一瞬で。
          </h1>
          <p className="mt-5 text-base leading-relaxed text-navy-600 sm:text-lg">
            スマホで撮った内装写真をアップするだけ。部屋の構造はそのままに、AIが
            <strong className="font-semibold text-navy-800">
              3つのスタイル
            </strong>
            で内装を描き換えます。お客様への提案スピードを、劇的に上げる。
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-navy-500">
            <Feature icon={Camera} text="スマホで撮るだけ" />
            <Feature icon={Zap} text="30秒で生成" />
            <Feature icon={ShieldCheck} text="構造は維持" />
          </div>
        </div>
        <HeroVisual />
      </section>

      <section className="mt-16 rounded-3xl border border-navy-100 bg-white p-6 shadow-sm sm:p-8">
        <Step number={1} title="現場写真をアップロード" />
        <div className="mt-4">
          <ImageUploader value={image} onChange={setImage} />
        </div>

        <div className="mt-10">
          <Step number={2} title="仕上がりスタイルを選ぶ" />
          <div className="mt-4">
            <StyleSelector value={styleId} onChange={setStyleId} />
          </div>
        </div>

        <div className="mt-10">
          <Step number={3} title="AIで生成" />
          <div className="mt-4 space-y-4">
            <button
              type="button"
              disabled={!canGenerate}
              onClick={onGenerate}
              aria-busy={status === "generating"}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-navy-900 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-navy-900/10 transition hover:bg-navy-700 disabled:cursor-not-allowed disabled:bg-navy-200 disabled:text-navy-400 disabled:shadow-none sm:w-auto"
            >
              {status === "generating" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5" />
                  リフォーム案を生成する
                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            {status === "generating" && (
              <GenerationLoader
                queuePosition={progress?.queuePosition}
                logs={progress?.logs}
              />
            )}

            {status === "error" && error && (
              <div
                role="alert"
                className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
              >
                <p className="font-semibold">
                  {error.kind === "timeout"
                    ? "タイムアウトしました"
                    : error.kind === "network"
                      ? "ネットワークエラー"
                      : error.kind === "server"
                        ? "生成に失敗しました"
                        : "エラーが発生しました"}
                </p>
                <p className="mt-1 break-all">{error.message}</p>
                <button
                  type="button"
                  onClick={onGenerate}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700"
                >
                  もう一度生成する
                </button>
              </div>
            )}

            {status === "done" && image && result && (
              <BeforeAfter before={image} after={result} />
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-white">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-base font-bold tracking-tight text-navy-900">
            ReformVibe
          </p>
          <p className="text-[11px] font-medium uppercase tracking-widest text-navy-400">
            AI Interior Reform
          </p>
        </div>
      </div>
      <a
        href="#"
        className="hidden rounded-full border border-navy-200 px-4 py-2 text-sm font-medium text-navy-700 transition hover:border-navy-400 hover:text-navy-900 sm:inline-block"
      >
        法人向けに導入相談
      </a>
    </header>
  );
}

function Feature({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="h-4 w-4 text-navy-600" />
      {text}
    </span>
  );
}

function Step({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white">
        {number}
      </span>
      <h2 className="text-lg font-semibold text-navy-900 sm:text-xl">
        {title}
      </h2>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-700 to-navy-500 shadow-2xl shadow-navy-900/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
      <div className="relative flex h-full flex-col justify-between p-6 text-white sm:p-8">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium backdrop-blur">
            BEFORE → AFTER
          </span>
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-navy-700">
            北欧モダン
          </span>
        </div>
        <div>
          <p className="text-sm text-navy-100">生成時間</p>
          <p className="text-4xl font-bold tracking-tight">
            24<span className="ml-0.5 text-xl font-medium">秒</span>
          </p>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
            <div className="h-full w-4/5 rounded-full bg-white shimmer-bg animate-shimmer" />
          </div>
          <p className="mt-3 text-xs text-navy-100">
            ControlNet で部屋の輪郭を保ったまま再レンダリング。
          </p>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-16 flex flex-col items-center gap-2 text-xs text-navy-400">
      <p>© {new Date().getFullYear()} ReformVibe (仮) — Powered by fal.ai</p>
      <p>現場の職人さんと不動産担当者のための、AIリフォーム提案ツール。</p>
    </footer>
  );
}
