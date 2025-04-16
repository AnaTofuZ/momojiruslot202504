import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "宝灯桃汁スロットマシーン2025春",
  description: "宝灯桃汁スロットマシーン2025春",
  metadataBase: new URL("https://anatofuz.net/momojiruslot202504"),
  openGraph: {
    images: [
      {
        url: "/ogp/og-image.png", // public/ogp/og-image.png を指定
        width: 1200,
        height: 630,
        alt: "宝灯桃汁スロットマシーン2025春",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
