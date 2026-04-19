"use client";

import { ImagePlus, RotateCcw, UploadCloud } from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface Props {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}

async function resizeImageToDataUrl(
  file: File,
  maxSide: number,
  quality: number,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas context unavailable");
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

export default function ImageUploader({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const readFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const dataUrl = await resizeImageToDataUrl(file, 1536, 0.85);
      onChange(dataUrl);
    },
    [onChange],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) readFile(file);
    },
    [readFile],
  );

  if (value) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt="アップロードされた現場写真"
          className="w-full aspect-[4/3] object-cover"
        />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-navy-700 shadow backdrop-blur hover:bg-white"
        >
          <RotateCcw className="h-4 w-4" />
          写真を変える
        </button>
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={[
        "group flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed bg-navy-50/40 text-center transition-colors",
        dragging
          ? "border-navy-500 bg-navy-50"
          : "border-navy-200 hover:border-navy-400 hover:bg-navy-50",
      ].join(" ")}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) readFile(file);
        }}
      />
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-600 text-white shadow-lg shadow-navy-600/20 transition group-hover:scale-105">
        <UploadCloud className="h-7 w-7" />
      </div>
      <div>
        <p className="font-semibold text-navy-900">
          現場写真をタップ or ドラッグ
        </p>
        <p className="mt-1 text-sm text-navy-500">
          JPG / PNG / HEIC、スマホで撮影した写真もOK
        </p>
      </div>
      <div className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-navy-600">
        <ImagePlus className="h-4 w-4" />
        明るめ・正面からの一枚が綺麗に出ます
      </div>
    </label>
  );
}
