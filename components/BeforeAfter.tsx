"use client";

import { Columns2, SlidersHorizontal } from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface Props {
  before: string;
  after: string;
}

type Mode = "slider" | "side";

export default function BeforeAfter({ before, after }: Props) {
  const [mode, setMode] = useState<Mode>("slider");
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold tracking-wide text-navy-500">
          BEFORE / AFTER
        </h3>
        <div className="inline-flex w-full justify-center rounded-full border border-navy-100 bg-white p-1 text-sm sm:w-auto">
          <button
            type="button"
            onClick={() => setMode("slider")}
            className={[
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition",
              mode === "slider"
                ? "bg-navy-600 text-white"
                : "text-navy-600 hover:bg-navy-50",
            ].join(" ")}
          >
            <SlidersHorizontal className="h-4 w-4" />
            スライダー
          </button>
          <button
            type="button"
            onClick={() => setMode("side")}
            className={[
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition",
              mode === "side"
                ? "bg-navy-600 text-white"
                : "text-navy-600 hover:bg-navy-50",
            ].join(" ")}
          >
            <Columns2 className="h-4 w-4" />
            並列
          </button>
        </div>
      </div>

      {mode === "slider" ? (
        <div
          ref={ref}
          className="relative aspect-[4/3] w-full select-none touch-none overflow-hidden rounded-2xl border border-navy-100 bg-navy-50"
          onMouseDown={(e) => {
            dragging.current = true;
            updateFromClientX(e.clientX);
          }}
          onMouseMove={(e) => {
            if (dragging.current) updateFromClientX(e.clientX);
          }}
          onMouseUp={() => (dragging.current = false)}
          onMouseLeave={() => (dragging.current = false)}
          onTouchStart={(e) => updateFromClientX(e.touches[0].clientX)}
          onTouchMove={(e) => updateFromClientX(e.touches[0].clientX)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={after}
            alt="リフォーム後"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-y-0 left-0 overflow-hidden"
            style={{ width: `${pos}%` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={before}
              alt="リフォーム前"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ width: `${100 / (pos / 100)}%`, maxWidth: "none" }}
            />
          </div>
          <div
            className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(10,21,48,0.2)]"
            style={{ left: `${pos}%` }}
          >
            <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-navy-700 shadow-lg">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
          </div>
          <span className="absolute top-3 left-3 rounded-full bg-navy-900/75 px-2.5 py-1 text-xs font-medium text-white">
            BEFORE
          </span>
          <span className="absolute top-3 right-3 rounded-full bg-navy-600 px-2.5 py-1 text-xs font-medium text-white">
            AFTER
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { label: "BEFORE", src: before, tone: "bg-navy-900/75" },
            { label: "AFTER", src: after, tone: "bg-navy-600" },
          ].map((pane) => (
            <div
              key={pane.label}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-navy-100 bg-navy-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pane.src}
                alt={pane.label}
                className="h-full w-full object-cover"
              />
              <span
                className={[
                  "absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-medium text-white",
                  pane.tone,
                ].join(" ")}
              >
                {pane.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
