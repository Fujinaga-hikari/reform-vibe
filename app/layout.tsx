import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReformVibe — 現場写真から、リフォーム案を一瞬で。",
  description:
    "現場の内装写真をアップロードするだけで、AIが指定スタイルのリフォーム案を生成。北欧モダン・和風・インダストリアルに対応。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-white text-navy-900 font-sans">
        {children}
      </body>
    </html>
  );
}
