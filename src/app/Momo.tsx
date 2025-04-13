"use client";

import React, { useState, useRef } from "react";
import { generateURL, REEL_SYMBOLS } from "@/lib/char_to_code_mapping";
import { XPostButton } from "@/app/xpost";

export const Slot: React.FC = () => {
  const [startCount, setStartCount] = useState(0);
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
  const [isMuted, setIsMuted] = useState(false); // ミュート状態を管理

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
    if (videoRef.current) {
      videoRef.current.volume = 0.3;
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

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

    setStartCount((prev) => prev + 1);
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

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.code === "Space" || e.key === "Enter") {
        if (slotState === "spinning") {
          const reelIndex = spinning.findIndex((s) => s);
          stopReel(reelIndex);
        } else {
          startSpin();
        }
      }
    },
    [slotState, spinning, startSpin, stopReel],
  );

  return (
    <div
      className="min-h-[100vh] bg-gradient-to-b flex items-center justify-center p-4 background all-wrap"
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <button
        className={`music-volume-off ${isMuted ? "mute" : ""}`} // ミュート時にクラスを追加
        onClick={() => {
          if (videoRef.current) {
            const newMutedState = !videoRef.current.muted;
            videoRef.current.muted = newMutedState; // ミュート状態を切り替え
            setIsMuted(newMutedState); // 状態を更新
          }
          }}
        >動画の音を消す</button>

      <div className="w-full max-w-md bg-gradient-to-b rounded-[2rem]  border-8 border-pink overflow-hidden background-top">
        <div className="p-3 text-center text-white text-xl font-bold">
          回転数: {startCount.toLocaleString()}
        </div>

        <div className="w-full max-w-md bg-gradient-to-b rounded-[2rem]  border-2 border-pink overflow-hidden"></div>

        <div className="p-4 text-center text-white text-xl font-bold">
          うろ覚え宝灯桃汁スロットマシーン
        </div>

        <video ref={videoRef} src={"./nihao.mp4"} autoPlay />
        <div className="px-4 py-2 flex justify-between gap-2 background-slot-wrap">
          {reels.map((position, reelIndex) => (
            <div
              key={reelIndex}
              className="relative bg-black rounded-md overflow-hidden border-2 border-pink--2 flex-1 slot-height"
            >
              <div className="absolute top-[50%] left-0 right-0 h-[2px] bg-yellow-400 opacity-60 z-10" />

              <div className="absolute inset-0 flex flex-col items-center">
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

        <div className="button-wrap">
          <div className="grid grid-cols-4 gap-2 button-stop">
            {reels.map((_, reelIndex) => (
              <button
                key={reelIndex}
                onClick={() => stopReel(reelIndex)}
                disabled={!spinning[reelIndex]}
                className={`py-2 rounded-full text-white font-bold shadow text-sm btn-stop`}
              >
                STOP
              </button>
            ))}
          </div>

          <button
            onClick={startSpin}
            disabled={spinning.some((s) => s)}
            className={`w-full py-3 rounded-full text-white font-bold shadow btn-start`}
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
        <a href="#" className="btn-sns btn-x">
          <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" // Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. 
            >
              <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path>
          </svg>
        </a>
    </div>
  );
};
