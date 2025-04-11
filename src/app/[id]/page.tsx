import {
  combinations,
  generateURLFromJoinReel,
} from "@/lib/char_to_code_mapping";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <h1>{id}</h1>
      <p>リールを回して、同じ絵柄を揃えよう！</p>
    </div>
  );
}

export async function generateStaticParams() {
  return combinations.map((combo) => ({ id: generateURLFromJoinReel(combo) }));
}
