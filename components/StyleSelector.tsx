"use client";

import { Check } from "lucide-react";
import { REFORM_STYLES, type ReformStyleId } from "@/lib/styles";

interface Props {
  value: ReformStyleId | null;
  onChange: (id: ReformStyleId) => void;
}

export default function StyleSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {REFORM_STYLES.map((style) => {
        const Icon = style.icon;
        const selected = style.id === value;
        return (
          <button
            key={style.id}
            type="button"
            onClick={() => onChange(style.id)}
            className={[
              "group relative flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all",
              selected
                ? "border-navy-600 bg-navy-600 text-white shadow-lg shadow-navy-600/20"
                : "border-navy-100 bg-white hover:border-navy-300 hover:shadow-md",
            ].join(" ")}
          >
            <div
              className={[
                "flex h-10 w-10 items-center justify-center rounded-xl transition",
                selected
                  ? "bg-white/15 text-white"
                  : "bg-navy-50 text-navy-700 group-hover:bg-navy-100",
              ].join(" ")}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p
                className={[
                  "text-base font-semibold",
                  selected ? "text-white" : "text-navy-900",
                ].join(" ")}
              >
                {style.label}
              </p>
              <p
                className={[
                  "text-xs",
                  selected ? "text-navy-100" : "text-navy-400",
                ].join(" ")}
              >
                {style.subLabel}
              </p>
            </div>
            <p
              className={[
                "text-xs leading-relaxed",
                selected ? "text-navy-50/90" : "text-navy-500",
              ].join(" ")}
            >
              {style.description}
            </p>
            {selected && (
              <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-white text-navy-700">
                <Check className="h-3.5 w-3.5" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
