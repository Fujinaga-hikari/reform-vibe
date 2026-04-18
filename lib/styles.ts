import { Hammer, Leaf, Snowflake } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ReformStyleId = "scandi" | "japanese" | "industrial";

export interface ReformStyle {
  id: ReformStyleId;
  label: string;
  subLabel: string;
  description: string;
  prompt: string;
  icon: LucideIcon;
  accent: string;
}

export const REFORM_STYLES: ReformStyle[] = [
  {
    id: "scandi",
    label: "北欧モダン",
    subLabel: "Scandinavian Modern",
    description:
      "白を基調にした明るい配色、ナチュラルな木目、シンプルで温かみのある家具。",
    prompt:
      "Scandinavian modern interior, bright white walls, light oak wood floor, minimal furniture, soft natural lighting, cozy and airy atmosphere, high-end interior photography",
    icon: Snowflake,
    accent: "from-sky-100 to-white",
  },
  {
    id: "japanese",
    label: "和風",
    subLabel: "Japanese Traditional",
    description:
      "畳、障子、木の梁を活かした落ち着きのある空間。侘び寂びを感じる質感。",
    prompt:
      "Traditional Japanese interior, tatami floor, shoji screens, wooden beams, warm ambient lighting, wabi-sabi aesthetic, serene and minimal",
    icon: Leaf,
    accent: "from-emerald-50 to-white",
  },
  {
    id: "industrial",
    label: "インダストリアル",
    subLabel: "Industrial Loft",
    description:
      "むき出しのコンクリート、黒いスチール、ヴィンテージな木。男前ロフト空間。",
    prompt:
      "Industrial loft interior, exposed concrete walls, black steel frames, vintage wood, Edison bulb lighting, urban masculine atmosphere",
    icon: Hammer,
    accent: "from-zinc-100 to-white",
  },
];

export function findStyle(id: string): ReformStyle | undefined {
  return REFORM_STYLES.find((s) => s.id === id);
}
