import * as fs from 'node:fs/promises';

export async function fetchFont(): Promise<ArrayBuffer | null> {
  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=Yuji+Syuku&display=swap`;

  const css = await (
    await fetch(googleFontsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
      },
    })
  ).text();

  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  );

  if (!resource) return null;
  const res = await fetch(resource[1]);
  return res.arrayBuffer();
}

const main = async () => {
  const fontBuffer = await fetchFont();
  if (fontBuffer) {
    const filePath = 'yuji_syuku.ttf'; // 保存するファイル名
    try {
      await fs.writeFile(filePath, Buffer.from(fontBuffer));
      console.log(`フォントデータを ${filePath} に書き出しました。`);
    } catch (error) {
      console.error('ファイル書き出し中にエラーが発生しました:', error);
    }
  } else {
    console.log('フォントデータの取得に失敗しました。');
  }
};

main();
