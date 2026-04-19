"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const MESSAGES = [
  "AIがリフォーム案を設計中...",
  "部屋の構造を解析しています...",
  "素材とライティングを選定中...",
  "最終レンダリングをかけています...",
];

export default function GenerationLoader() {
  const [idx, setIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const msgId = setInterval(
      () => setIdx((i) => (i + 1) % MESSAGES.length),
      2200,
    );
    const tickId = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => {
      clearInterval(msgId);
      clearInterval(tickId);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="relative overflow-hidden rounded-2xl border border-navy-100 bg-gradient-to-br from-navy-900 to-navy-700 p-8 text-white shadow-lg"
    >
      <div className="absolute inset-0 shimmer-bg animate-shimmer opacity-40" />
      <div className="relative flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-semibold">{MESSAGES[idx]}</p>
          <p className="text-sm text-navy-100">
            通常 15〜30秒ほどで完成します（経過 {elapsed}秒）。
          </p>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block h-2 w-2 rounded-full bg-white animate-float-dot"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
