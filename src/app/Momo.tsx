"use client";

import React, { useState, useRef } from "react";

const REEL_SYMBOLS = [
  ["宝", "方", "砲", "峰", "鳥", '報'], // リール1（REEL1_SYMBOLS）
  ["灯", "刀", "塔", "糖", "腸", '等'], // リール2（REEL2_SYMBOLS）
  ["桃", "栗", "梨", "梅", "杏", "煮"], // リール3（REEL3_SYMBOLS）
  ["汁", "城", "郎", "子", "梨"], // リール4（REEL4_SYMBOLS）
];


export const Slot: React.FC = () => {
  const [reels, setReels] = useState(Array(4).fill(0));
  const [spinning, setSpinning] = useState(Array(4).fill(false));
  const [muted, setMuted] = useState(false);
  const [win, setWin] = useState(false);
  const [reach, setReach] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const reachAudioRef = useRef<HTMLAudioElement>(null);
  const winAudioRef = useRef<HTMLAudioElement>(null);
  const spinIntervalRefs = useRef<(NodeJS.Timeout | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const spinPositionRefs = useRef<number[]>([0, 0, 0, 0]);

  const generateReelContent = React.useCallback(
      (reelIndex: number, position: number) => {
        const reelContent = [];
        const symbols = REEL_SYMBOLS[reelIndex]; // 該当リールのシンボルリスト

        for (let i = -2; i <= 2; i++) {
          const adjustedPosition = position + i;

          // インデックスを正規化 (リールの範囲内)
          const normalizedPosition =
              adjustedPosition >= 0
                  ? adjustedPosition % symbols.length
                  : (symbols.length + (adjustedPosition % symbols.length)) %
                  symbols.length;

          reelContent.push(symbols[normalizedPosition]);
        }
        return reelContent;
      },
      []
  );


  // 指定されたリールを停止
  const stopReel = React.useCallback(
      (reelIndex: number) => {
        if (!spinning[reelIndex]) return; // スピンしていない場合は無視

        if (spinIntervalRefs.current[reelIndex]) {
          clearInterval(spinIntervalRefs.current[reelIndex]!);
          spinIntervalRefs.current[reelIndex] = null;
        }

        const newSpinning = [...spinning];
        newSpinning[reelIndex] = false;
        setSpinning(newSpinning);

        if (!muted && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }

        // リーチチェック
        if (reelIndex >= 1) {
          const previousSymbols = reels
              .slice(0, reelIndex + 1)
              .map((pos, idx) => {
                const symbols = REEL_SYMBOLS[idx];
                return symbols[pos % symbols.length];
              });

          const consecutive = previousSymbols.every(
              (symbol) => symbol === previousSymbols[0]
          );

          if (consecutive && reelIndex === 1) {
            setReach(true);
            if (!muted && reachAudioRef.current) {
              reachAudioRef.current.play();
            }
          }
        }

        // 当たりチェック
        if (reelIndex === 3) {
          const allSymbols = reels.map((pos, idx) => {
            const symbols = REEL_SYMBOLS[idx];
            return symbols[pos % symbols.length];
          });

          if (allSymbols.every((symbol) => symbol === allSymbols[0])) {
            setWin(true);
            if (!muted && winAudioRef.current) {
              winAudioRef.current.play();
            }
          }
        }
      },
      [muted, reels, spinning]
  );


  // 全リールを開始
  const startSpin = React.useCallback(() => {
    if (spinning.some((s) => s)) return;

    setWin(false);
    setReach(false);
    setSpinning(Array(4).fill(true));

    const newReels = reels.map((_, i) =>
        Math.floor(Math.random() * REEL_SYMBOLS[i].length)
    );
    setReels(newReels);

    // 各リールのスピンを開始
    reels.forEach((_, index) => {
      spinPositionRefs.current[index] = 0;

      if (spinIntervalRefs.current[index]) {
        clearInterval(spinIntervalRefs.current[index]!);
      }

      spinIntervalRefs.current[index] = setInterval(() => {
        spinPositionRefs.current[index] =
            (spinPositionRefs.current[index] + 1) % REEL_SYMBOLS[index].length;

        setReels((prev) => {
          const newReels = [...prev];
          newReels[index] = spinPositionRefs.current[index];
          return newReels;
        });
      }, 50); // リール更新間隔
    });
  }, [reels, spinning]);


  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-400 to-pink-600 flex items-center justify-center p-4">
      {/* パチスロ筐体 */}
      <div className="relative w-full max-w-3xl aspect-[3/4] bg-gradient-to-b from-pink-300 to-pink-400 rounded-[2rem] shadow-2xl border-8 border-pink-200">
        {/* 筐体の装飾パネル */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-pink-200 to-transparent rounded-t-[1.5rem]">
          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809')] bg-cover bg-center opacity-20 rounded-t-[1.5rem]" />
        </div>

        {/* メインディスプレイエリア */}
        <div className="absolute top-32 left-6 right-6 bottom-48 bg-gradient-to-b from-pink-800 to-pink-700 rounded-lg p-6 border-4 border-pink-300">
          {/* タイトルバー */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-pink-200 drop-shadow-lg">
              うろ覚え宝灯桃汁スロットマシーン
            </h1>
            <button
              onClick={() => setMuted(!muted)}
              className="text-pink-200 hover:text-pink-100"
            ></button>
          </div>

          {/* リール表示部分 */}
          <div
            className={`grid grid-cols-4 gap-2 h-[calc(100%-4rem)] ${
              win ? "animate-pulse" : ""
            }`}
          >
            {reels.map((position, reelIndex) => (
              <div
                key={reelIndex}
                className={`relative bg-black rounded-md overflow-hidden border-2
                  ${win ? "border-yellow-400" : "border-pink-300"}
                  ${reach && reelIndex > 1 ? "border-red-500" : ""}`}
              >
                {/* Center line - adjusted to align with symbol center */}
                <div className="absolute left-0 right-0 top-[calc(50%-2.5rem)] h-[2px] bg-yellow-400 z-10 opacity-70" />

                {/* Reel window */}
                <div className="relative h-full">
                  {/* Top gradient */}
                  <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black to-transparent z-10" />

                  {/* Bottom gradient */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent z-10" />

                  {/* Symbols */}
                  <div
                    className="absolute inset-0 flex flex-col items-center transition-transform duration-100 pt-16"
                    style={{
                      transform: spinning[reelIndex]
                        ? `translateY(-${
                            (spinPositionRefs.current[reelIndex] % 1) * 100
                          }%)`
                        : "translateY(0)",
                    }}
                  >
                    {generateReelContent(reelIndex,position).map((symbol, index) => (
                      <div
                        key={index}
                        className={`h-[72px] flex items-center justify-center text-6xl font-bold
                          ${
                            index === 2
                              ? "text-pink-200 drop-shadow-glow"
                              : "text-gray-600"
                          }`}
                      >
                        {symbol}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* コントロールパネル */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-pink-400 to-pink-300 rounded-b-[1.5rem] px-8 pt-6">
          {/* 停止ボタン */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            {reels.map((_, reelIndex) => (
              <button
                key={reelIndex}
                onClick={() => stopReel(reelIndex)}
                disabled={!spinning[reelIndex]}
                className={`py-4 rounded-full text-white font-bold shadow-lg transform active:scale-95 transition-transform text-lg
                  ${
                    spinning[reelIndex]
                      ? "bg-red-500 hover:bg-red-600 border-2 border-red-300"
                      : "bg-gray-500 cursor-not-allowed"
                  }`}
              >
                停止 {reelIndex + 1}
              </button>
            ))}
          </div>

          {/* スタートレバー */}
          <button
            onClick={startSpin}
            disabled={spinning.some((s) => s)}
            className={`w-full py-4 rounded-full text-white font-bold shadow-lg transform active:scale-95 transition-transform
              ${
                spinning.some((s) => s)
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 border-2 border-green-300"
              }`}
          >
            スタート
          </button>
        </div>

        {win && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-yellow-400 animate-bounce drop-shadow-glow z-50">
            大当たり！
          </div>
        )}

        <audio
          ref={audioRef}
          src="https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3"
        />
        <audio
          ref={reachAudioRef}
          src="https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3"
        />
        <audio
          ref={winAudioRef}
          src="https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3"
        />
      </div>
    </div>
  );
};
