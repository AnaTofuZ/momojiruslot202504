import {
  combinations,
  generateURLFromJoinReel,
  getCharsFromURL,
} from "@/lib/char_to_code_mapping";
import Link from "next/link";
import { XPostButton } from "@/app/xpost";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return {
    title: `スロットマシン - ${id}`,
    description: "スロットマシンのページです。",
    openGraph: {
      title: `スロットマシン - ${id}`,
      description: "スロットマシンのページです。",
      images: [
        {
          url: `/ogp/${id}.png`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const jaFromId = getCharsFromURL(id).join("");
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-400 to-pink-600 flex flex-col items-center justify-center p-6 relative">
      {/* 背景パネル風の装飾 */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-pink-200 to-transparent rounded-b-[1.5rem] z-0" />

      <div className="z-10 text-center max-w-2xl w-full">
        {/* タイトル部分 */}
        <h1 className="text-2xl md:text-4xl font-bold text-yellow-100 drop-shadow-lg mb-6">
          🎉 2025/04/12が誕生日の
        </h1>
        <h1 className="text-2xl md:text-4xl font-bold text-yellow-100 drop-shadow-lg mb-6">
          山梨ご当地VTuberは…
        </h1>

        {/* 中央の画像 */}
        <div className="w-full flex justify-center mb-8">
          <img
            src={`/ogp/${id}.png`}
            alt={jaFromId}
            className="max-w-full max-h-[300px] rounded-2xl shadow-xl border-4 border-pink-200"
          />
        </div>

        {/* スロットマシンへのリンク */}
        <Link
          href="/"
          className="inline-block bg-yellow-400 hover:bg-yellow-500 text-pink-900 font-bold py-4 px-8 rounded-full text-lg shadow-md transition-transform transform hover:scale-105"
        >
          ▶ スロットマシンで遊ぶ
        </Link>
        <XPostButton id={id} />
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return combinations.map((combo) => ({ id: generateURLFromJoinReel(combo) }));
}
