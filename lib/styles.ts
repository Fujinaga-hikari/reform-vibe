import { Hammer, Moon, Sparkles, Sun, TreePine } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ReformStyleId =
  | "wa-modern"
  | "simple-modern"
  | "natural-wood"
  | "hotel-like"
  | "kominka";

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
    id: "wa-modern",
    label: "和モダン",
    subLabel: "Japanese Modern",
    description:
      "畳と障子を活かしつつ、間接照明や黒の造作でモダンに洗練された落ち着きのある空間。",
    prompt:
      "Completely renovated into a photorealistic modern Japanese interior (wa-modern). Fresh tatami mat flooring with clean linen edging, paper shoji screens in slim black lacquered wooden frames, dark stained wooden ceiling beams, low minimalist cedar furniture with clean lines, built-in cedar wall storage, a single ikebana arrangement, soft indirect warm lighting hidden in cove ceilings, matte black accents, deep neutral palette of cream, charcoal, and warm wood, refined zen-inspired serenity, Japanese premium ryokan meets contemporary apartment, architectural photography, 8k.",
    icon: Moon,
    accent: "from-stone-100 to-white",
  },
  {
    id: "simple-modern",
    label: "シンプル洋室",
    subLabel: "Simple Modern",
    description:
      "白壁とオーク床、造作収納で整えた、明るくすっきりした日本のマンション定番スタイル。",
    prompt:
      "Completely renovated into a photorealistic simple modern Japanese apartment interior. Clean pure white painted walls, light oak engineered wood flooring with subtle grain, built-in white cabinetry with handleless doors, minimalist Japanese-contemporary furniture in white and pale wood, sheer white linen curtains, recessed ceiling downlights and soft diffused natural daylight, neat and uncluttered, a few small green houseplants, bright airy atmosphere, typical high-end Tokyo mansion interior photography, 8k. Remove any tatami, shoji, exposed beams, or industrial elements.",
    icon: Sun,
    accent: "from-slate-50 to-white",
  },
  {
    id: "natural-wood",
    label: "ナチュラルウッド",
    subLabel: "Natural Wood / Muji-style",
    description:
      "明るい木とグレージュを基調に、無印良品のようなミニマルで温かみのある空間。",
    prompt:
      "Completely renovated into a photorealistic natural-wood Japanese interior in Muji-style. Pale birch and white oak wood flooring and wall panels with soft visible grain, warm greige painted walls, simple cotton-linen fabric sofa in oatmeal beige, low natural-wood shelves with a few books and pottery, small potted olive plant, soft daylight through sheer curtains, warm ambient paper pendant light, minimal, cozy and calm, Muji / Ryohin Keikaku concept store aesthetic, interior photography, 8k. Remove any industrial, dark, luxury, or traditional Japanese elements like tatami and shoji.",
    icon: TreePine,
    accent: "from-amber-50 to-white",
  },
  {
    id: "hotel-like",
    label: "ホテルライク",
    subLabel: "Hotel-Like Premium",
    description:
      "ダークウッドと間接照明、落ち着きのあるグレージュで演出する、上質な都市型ホテル空間。",
    prompt:
      "Completely renovated into a photorealistic hotel-like luxury Japanese interior. Dark walnut wood flooring and wall paneling, warm taupe and charcoal painted walls, soft indirect cove lighting behind cornices, elegant brass wall sconces, plush neutral-toned sofa with textured fabric, marble-topped side tables, heavy blackout drapes with sheer inner curtains, a framed abstract artwork, low ambient warm lighting, sophisticated and calm, high-end urban hotel suite atmosphere, Park Hyatt Tokyo style, architectural interior photography, 8k. Remove any bright, casual, industrial, or traditional elements.",
    icon: Sparkles,
    accent: "from-neutral-100 to-white",
  },
  {
    id: "kominka",
    label: "古民家リノベ",
    subLabel: "Kominka Renovation",
    description:
      "太い梁や柱を活かし、モダンキッチンや土間と組み合わせた温故知新のリノベーションスタイル。",
    prompt:
      "Completely renovated into a photorealistic kominka (traditional Japanese farmhouse) renovation interior. Exposed dark aged wooden ceiling beams and columns preserved, wide-plank aged pine flooring, a polished black mortar doma earthen floor entry area, a modern minimal kitchen with matte black and natural oak cabinetry tucked under the beams, a large wood-burning cast iron stove, vintage indigo fabric cushions on low wooden benches, paper lantern pendant lights, warm amber lighting with sunbeams through wooden latticework, a careful balance of century-old structure and contemporary craftsmanship, Japanese countryside farmhouse magazine photography, 8k.",
    icon: Hammer,
    accent: "from-orange-50 to-white",
  },
];

export function findStyle(id: string): ReformStyle | undefined {
  return REFORM_STYLES.find((s) => s.id === id);
}
