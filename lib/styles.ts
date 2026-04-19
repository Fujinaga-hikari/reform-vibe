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
      "Completely renovated into a bright photorealistic Scandinavian modern interior. Pure white painted walls, pale light oak wood flooring with visible grain, clean minimalist furniture in soft beige and light grey fabrics, sheer white linen curtains, soft natural daylight, subtle green plants, cozy and airy atmosphere, airbnb plus interior photography, 8k, professional architectural render. Remove all tatami, shoji, concrete, and industrial elements.",
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
      "Completely renovated into a serene photorealistic traditional Japanese ryokan interior. Tatami mat flooring, shoji paper sliding screens, dark stained wooden ceiling beams, low wooden furniture in natural cedar, a small ikebana flower arrangement, soft warm ambient lighting filtered through shoji, wabi-sabi aesthetic, minimal and calm, Japanese ryokan interior photography, 8k. Remove any modern western, Scandinavian, or industrial elements.",
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
      "Completely renovated into a photorealistic industrial loft interior. Raw exposed concrete walls with visible texture, black matte steel window frames and beams, polished concrete floor, weathered reclaimed wood accents, vintage leather sofa, Edison filament bulbs hanging from black metal pendants, moody dramatic lighting, urban masculine atmosphere, Brooklyn warehouse conversion, architectural photography, 8k. Remove all tatami mats, shoji screens, paper walls, and traditional Japanese elements.",
    icon: Hammer,
    accent: "from-zinc-100 to-white",
  },
];

export function findStyle(id: string): ReformStyle | undefined {
  return REFORM_STYLES.find((s) => s.id === id);
}
