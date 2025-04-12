"use client";

import React, { useState, useRef } from "react";
import { generateURL, REEL_SYMBOLS } from "@/lib/char_to_code_mapping";
import { XPostButton } from "@/app/xpost";

export const Slot: React.FC = () => {
  const [reels, setReels] = useState(Array(4).fill(0));
  const [spinning, setSpinning] = useState(Array(4).fill(false));
  const [muted] = useState(false);
  const [win, setWin] = useState(false);
  const [, setReach] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const reachAudioRef = useRef<HTMLAudioElement>(null);
  const winAudioRef = useRef<HTMLAudioElement>(null);
  const spinIntervalRefs = useRef<(NodeJS.Timeout | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [generateURIID, setGenerateURIID] = useState("");
  const spinPositionRefs = useRef<number[]>([0, 0, 0, 0]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [slotState, setSlotState] = useState<"idle" | "spinning" | "stopped">(
    "idle",
  );

  React.useEffect(() => {
    if (spinning.every((s) => !s)) {
      // 全てのリールが停止している場合
      const stoppedSymbols = reels.map((position, reelIndex) => {
        const symbols = REEL_SYMBOLS[reelIndex]; // 各リールに対応するシンボルリスト
        return symbols[position % symbols.length]; // 停止時のシンボル
      });

      setGenerateURIID(generateURL(stoppedSymbols));
    }
  }, [spinning, reels, setGenerateURIID]);

  React.useEffect(() => {
    if (slotState === "spinning") {
      if (videoRef.current) {
        videoRef.current.volume = 0.3;
        videoRef.current.play();
      }
    } else if (slotState === "stopped") {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }

    return () => {
      if (slotState == "stopped") {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
        }
      }
    };
  }, [slotState]);

  const generateReelContent = React.useCallback(
    (reelIndex: number, position: number) => {
      const reelContent = [];
      const symbols = REEL_SYMBOLS[reelIndex];

      for (let i = -2; i <= 2; i++) {
        const adjustedPosition = position + i;
        const normalizedPosition =
          adjustedPosition >= 0
            ? adjustedPosition % symbols.length
            : (symbols.length + (adjustedPosition % symbols.length)) %
              symbols.length;

        reelContent.push(symbols[normalizedPosition]);
      }
      return reelContent;
    },
    [],
  );

  const stopReel = React.useCallback(
    (reelIndex: number) => {
      if (!spinning[reelIndex]) return;

      setReach(true);
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

      if (reelIndex >= 1) {
        const previousSymbols = reels
          .slice(0, reelIndex + 1)
          .map((pos, idx) => {
            const symbols = REEL_SYMBOLS[idx];
            return symbols[pos % symbols.length];
          });

        const consecutive = previousSymbols.every(
          (symbol) => symbol === previousSymbols[0],
        );

        if (consecutive && reelIndex === 1) {
          setReach(true);
          if (!muted && reachAudioRef.current) {
            reachAudioRef.current.play();
          }
        }
      }

      if (newSpinning.every((s) => !s)) {
        setSlotState("stopped");
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
    [muted, reels, spinning],
  );

  const startSpin = React.useCallback(() => {
    if (spinning.some((s) => s)) return;

    setSlotState("spinning");
    setWin(false);
    setReach(false);
    setSpinning(Array(4).fill(true));

    const newReels = reels.map((_, i) =>
      Math.floor(Math.random() * REEL_SYMBOLS[i].length),
    );
    setReels(newReels);

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
      }, 50);
    });
  }, [reels, spinning]);

  return (
    <div className="min-h-[100vh] bg-gradient-to-b from-pink-400 to-pink-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gradient-to-b from-pink-300 to-pink-400 rounded-[2rem] shadow-2xl border-8 border-pink-200 overflow-hidden">
        <div className="p-4 text-center bg-pink-800 text-white text-xl font-bold">
          うろ覚え宝灯桃汁スロットマシーン
        </div>

        <video ref={videoRef} src={"./nihao.mp4"} autoPlay />
        <div className="px-4 py-2 bg-pink-700 flex justify-between gap-2">
          {reels.map((position, reelIndex) => (
            <div
              key={reelIndex}
              className="relative bg-black rounded-md overflow-hidden border-2 border-pink-300 flex-1 h-[240px] sm:h-[300px]"
            >
              <div className="absolute top-[50%] left-0 right-0 h-[2px] bg-yellow-400 opacity-60 z-10" />

              <div className="absolute inset-0 flex flex-col items-center pt-8 pb-8">
                {generateReelContent(reelIndex, position).map(
                  (symbol, index) => (
                    <div
                      key={index}
                      className={`h-[40px] sm:h-[56px] flex items-center justify-center text-3xl sm:text-5xl font-bold ${
                        index === 2 ? "text-pink-200" : "text-gray-600"
                      }`}
                    >
                      {symbol}
                    </div>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-6 bg-pink-300">
          <div className="grid grid-cols-4 gap-2 mb-4">
            {reels.map((_, reelIndex) => (
              <button
                key={reelIndex}
                onClick={() => stopReel(reelIndex)}
                disabled={!spinning[reelIndex]}
                className={`py-2 rounded-full text-white font-bold shadow text-sm ${
                  spinning[reelIndex]
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              ></button>
            ))}
          </div>

          <button
            onClick={startSpin}
            disabled={spinning.some((s) => s)}
            className={`w-full py-3 rounded-full text-white font-bold shadow ${
              spinning.some((s) => s)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            スタート
          </button>
        </div>

        {win && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-300 text-4xl font-bold animate-bounce">
            大当たり！
          </div>
        )}

        {slotState === "stopped" && (
          <div className={"items-center justify-center flex flex-col"}>
            <XPostButton id={generateURIID} />
          </div>
        )}

        <audio ref={audioRef} src="./nari.mp3" />
        <audio
          ref={reachAudioRef}
          src="https://assets.mixkit.co/active_storage/sfx/2020/2019-preview.mp3"
        />
        <audio
          ref={winAudioRef}
          src="https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3"
        />
      </div>
    </div>
  );
};
