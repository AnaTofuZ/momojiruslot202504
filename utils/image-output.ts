import { writeOgpImage } from "@/lib/ogdump";
import {
  combinations,
  generateURLFromJoinReel,
} from "@/lib/char_to_code_mapping";

const main = async () => {
  combinations.forEach(async (c) => {
    const id = generateURLFromJoinReel(c);
    await writeOgpImage(c, id);
  });
};

main();
