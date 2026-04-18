# ReformVibe (仮)

現場の内装写真から、指定したスタイルのリフォーム画像を生成する Micro-SaaS プロトタイプ。

## 技術スタック

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS / lucide-react
- fal.ai (ControlNet Canny / Depth) — 骨組みのみ実装

## セットアップ

```bash
cd reform-vibe
cp .env.local.example .env.local    # FAL_KEY を記入
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開く。

## ディレクトリ

- `app/page.tsx` — ランディング + アップロード + スタイル選択 + 比較 UI
- `app/api/generate/route.ts` — POST /api/generate (画像 + styleId → 生成画像 URL)
- `lib/falClient.ts` — fal.ai 呼び出しの骨組み (TODO 実装)
- `lib/styles.ts` — 北欧モダン / 和風 / インダストリアル 定義とプロンプト
- `components/` — ImageUploader, StyleSelector, GenerationLoader, BeforeAfter

## 次のステップ

1. `lib/falClient.ts` の TODO 箇所で `@fal-ai/serverless-client` を使って `fal.subscribe` を呼び出す。
2. 画像は DataURL のまま送っているので、必要に応じて fal のストレージにアップロードしてから URL を渡す形に変更。
3. 生成履歴の保存 (DB or Supabase)、PDF エクスポート、LINE 連携などを追加。
