import Link from "next/link";
import { X } from "lucide-react";
import { getCharsFromURL } from "@/lib/char_to_code_mapping"; // ← アイコン使いたければ

const createText = (ja: string) => {
  return `2025/04/12が3回目の誕生日の山梨ご当地VTuberは
  「${ja}」です!
    
...本当は宝灯桃汁ナリよ!!!!

#桃汁ちゃん誕生日おめでとう
#宝灯桃汁

    `;
};

interface Props {
  id: string;
}

export const XPostButton: React.FC<Props> = ({ id }) => {
  const ja = getCharsFromURL(id).join("");
  const tweetText = encodeURIComponent(createText(ja));
  const tweetUrl = encodeURIComponent(
    `https://anatofuz.net/momojiruslot202504/${id}`,
  );

  return (
    <Link
      href={`https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-6 tweet-button"
    >
      Xにポストする
    </Link>
  );
};
