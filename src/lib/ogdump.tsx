import satori from "satori";
import sharp from "sharp";
import fs from "fs";
import React from "react";

export const writeOgpImage = async (articleTitle: string, path: string) => {
    // ディレクトリが存在しなければ作成する
    if (!fs.existsSync(path)) fs.mkdirSync(path);

    const image = await generateOgpImage(articleTitle);
    fs.writeFileSync(`${path}/ogp.png`, image);
};

const generateOgpImage = async (title: string) => {
    const font = fs.readFileSync("public/font/yuji_syuku.ttf");

    const svg = await satori(
        <div
            style={{
                height: "100%",
                width: "100%",
                display: "flex",
                backgroundImage: "linear-gradient(135deg, #f8a7dc 10%, #d9027c 100%)",
                color: "#000000",
                justifyContent: "center",
                alignItems: "center",
                padding: "0 2rem",
            }}
        >
    <div
        style={{
        display: "flex",
            flexDirection: "column",
            // padding: "3rem 4rem 2.5rem",
            alignItems: "center",
            backgroundColor: "#ffffff",
            justifyContent: "center",
            borderRadius: "10px",
            width: "100%",
            height: "90%",
    }}
>
    <p style={{ fontSize: 50, fontWeight: 700, textAlign: "center", margin: "0 0 -20px" }}>
        山梨ご当地VTuber
    </p>
    <p style={{ fontSize: 200, fontWeight: 700 }}>{title}</p>

    </div>
    </div>,
    {
        width: 1200,
        height: 630,
        fonts: [
        {
            name: "Yuji Syuku",
            data: font,
            style: "normal",
            weight: 700,
        },
    ],
    }
);

    return await sharp(Buffer.from(svg)).png().toBuffer();
};
