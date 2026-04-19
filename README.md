# ReformVibe

現場の内装写真1枚から、AIが5種類の日本向けリフォームスタイルで内装を描き換える Micro-SaaS。
リフォーム業者・不動産担当者の「お客様への提案」を数十秒で仕上げることを想定しています。

## スクリーンフロー

1. 現場写真をアップロード（スマホ撮影OK）
2. 5つのスタイルから1つを選択
3. 「リフォーム案を生成」→ 15〜40秒で BEFORE / AFTER スライダーで比較

## 技術スタック

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS / lucide-react
- fal.ai (Flux 系モデル) の非同期キュー API
- Vercel Hosting + Basic 認証ミドルウェア

## セットアップ（ローカル）

```bash
git clone https://github.com/Fujinaga-hikari/reform-vibe.git
cd reform-vibe
cp .env.local.example .env.local    # FAL_KEY を記入
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開く。

## 環境変数

| Name | 必須 | 例 / デフォルト | 説明 |
|---|---|---|---|
| `FAL_KEY` | ✅ | `xxxx-xxxx...:yyyy...` | fal.ai の API キー。https://fal.ai/dashboard/keys |
| `FAL_MODEL` | | `fal-ai/flux/dev/image-to-image` | 使用モデル。下記「モデル選択」参照 |
| `FAL_STRENGTH` | | `0.9` | img2img モデルでの元画像への忠実度（0-1, 高いほどスタイル優先） |
| `FAL_STEPS` | | `28` | 推論ステップ数 |
| `FAL_GUIDANCE` | | `3.5` | guidance scale（プロンプト追従度） |
| `FAL_CONTROL_STRENGTH` | | `0.85` | ControlNet系モデル使用時の構造保持度 |
| `BASIC_AUTH_USER` | | 未設定 | Basic 認証ユーザー名（両方セットで認証有効） |
| `BASIC_AUTH_PASSWORD` | | 未設定 | Basic 認証パスワード |

`BASIC_AUTH_*` は両方セットされた時のみ認証が有効化。ローカル開発では未設定でOK。

## モデル選択

`FAL_MODEL` で使用モデルを切り替え可能。[lib/falClient.ts](lib/falClient.ts) が入力スキーマを自動で分岐します。

| モデルID | 用途 | 備考 |
|---|---|---|
| `fal-ai/flux/dev/image-to-image` | デフォルト。安定動作 | `strength` 調整で効き具合をコントロール |
| `fal-ai/flux-lora-depth` | 構造を厳密保持したい場合 | Vercel Hobby の 60秒制限で停滞する場合あり |
| `fal-ai/flux-general` | ControlNet を細かく指定したい場合 | 上級者向け |

## スタイルプリセット

[lib/styles.ts](lib/styles.ts) で定義。日本市場向けに特化した5種類：

1. **和モダン** — 畳と障子を活かしつつ間接照明と黒の造作でモダンに
2. **シンプル洋室** — 白壁＋オーク床＋造作、日本のマンション定番
3. **ナチュラルウッド** — 明るい木とグレージュ、無印良品風
4. **ホテルライク** — ダークウッド＋間接照明、都市型ホテル
5. **古民家リノベ** — 梁を活かす＋モダンキッチン＋土間

プロンプトは各スタイルの `prompt` フィールドで調整可能。

## アーキテクチャ

### 画像生成フロー（非同期キュー型）

```
Client                        Vercel Server               fal.ai
  |                                 |                        |
  |--POST /api/generate------------>|                        |
  |  (DataURL + styleId)            |                        |
  |                                 |--storage.upload-------->|
  |                                 |<----image URL----------|
  |                                 |--queue.submit---------->|
  |                                 |<----request_id---------|
  |<---{requestId}------------------|                        |
  |                                 |                        |
  |--GET /api/generate/status------>|                        |
  |  (2秒ごとに繰り返し)              |--queue.status--------->|
  |                                 |<----state--------------|
  |<---{state: "queued"/            |                        |
  |     "generating"/"done"/"error"}|                        |
  |                                 |                        |
  |  [完了後]                       |--queue.result--------->|
  |                                 |<----images[{url}]------|
  |<---{state: "done", imageUrl}----|                        |
```

Vercel Hobby プランの関数実行上限 60秒を回避するため、submit と status を分離。
関数は各呼び出し1秒未満で終わり、長時間生成でもタイムアウトしない。

### 画像プロキシ

[app/api/image-proxy/route.ts](app/api/image-proxy/route.ts) で fal.media CDN の画像を一度サーバー経由で配信。ブラウザ環境での QUIC/HTTP3 問題を回避し、1年 immutable キャッシュで CDN 負荷も軽減。

### Basic 認証

[middleware.ts](middleware.ts) で `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` が両方セットされている時のみ全ルートを Basic 認証で保護。提案デモを URL + ユーザー名 + パスワードで渡す運用を想定。

## ディレクトリ

```
app/
  page.tsx                      ランディング + アップロード + 選択 + 比較UI
  api/generate/route.ts         POST: fal に submit、requestId を返す
  api/generate/status/route.ts  GET:  状態取得 + 完了時は result fetch
  api/image-proxy/route.ts      GET:  fal.media 画像をサーバー経由で配信
components/
  ImageUploader.tsx             ドラッグ&ドロップ + 1536px にリサイズ
  StyleSelector.tsx             5つのスタイル選択UI
  GenerationLoader.tsx          ローディング + 経過秒 + fal のライブログ表示
  BeforeAfter.tsx               スライダー / 並列切り替えの比較UI
lib/
  falClient.ts                  fal SDK ラッパー (submit/status/result)
  styles.ts                     5つのスタイル定義とプロンプト
middleware.ts                   Basic 認証
```

## Vercel へのデプロイ

1. GitHub リポジトリを Vercel にインポート
2. Environment Variables に上記の `FAL_KEY` ほかをセット
3. Deploy

デフォルトで Hobby プラン（無料）で動作。画像生成は非同期なので 60秒関数上限の影響を受けない。
Basic 認証をかける場合は `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` も登録。

## コスト目安

- fal.ai: 1枚あたり ~$0.03（Flux dev img2img の場合）
- Vercel: Hobby プラン無料枠で MVP 運用可
- 月100枚デモ利用 ≒ $3 程度

## 今後の拡張候補

- 生成履歴の保存（DB / Supabase）
- PDF 提案書エクスポート
- LINE 連携（LINE で写真→スタイル選択→結果を LINE で受信）
- GPT-4V / Claude Vision による部屋分析 → 個別プロンプト自動生成（二段階AI）
- カスタムスタイル（業者ごとの好み・ブランドに合わせた学習）

## ライセンス

プロプライエタリ（提案用プロトタイプ）
