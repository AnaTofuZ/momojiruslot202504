import {writeOgpImage} from "@/lib/ogdump";

const main = async () => {
    await writeOgpImage("宝灯桃汁", "public/ogp");
}

main();
