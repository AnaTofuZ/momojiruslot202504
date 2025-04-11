export const REEL_SYMBOLS = [
  ["宝", "方", "砲", "峰", "鳥", "報"], // リール1（REEL1_SYMBOLS）
  ["灯", "刀", "塔", "糖", "腸", "等"], // リール2（REEL2_SYMBOLS）
  ["桃", "栗", "梨", "梅", "杏", "煮"], // リール3（REEL3_SYMBOLS）
  ["汁", "城", "郎", "子", "粉"], // リール4（REEL4_SYMBOLS）
];

const generateCombinations = (symbols: string[][]): string[] => {
  if (symbols.length === 0) {
    return [];
  }

  if (symbols.length === 1) {
    return symbols[0].map((symbol) => symbol);
  }

  const firstReel = symbols[0];
  const remainingReelsCombinations = generateCombinations(symbols.slice(1));
  const combinations: string[] = [];

  for (const symbol of firstReel) {
    for (const combination of remainingReelsCombinations) {
      combinations.push(symbol + combination);
    }
  }

  return combinations;
};

export const combinations = generateCombinations(REEL_SYMBOLS);

const charToCodeMap: Record<string, string> = {
  // リール1の文字
  宝: "a1B3c",
  方: "d4E5f",
  砲: "g6H7i",
  峰: "j8K9l",
  鳥: "m0Nop",
  報: "qR1sT",

  // リール2の文字
  灯: "u2Vwx",
  刀: "y3Z4a",
  塔: "b5C6d",
  糖: "e7F8g",
  腸: "h9I0j",
  等: "kL1mn",

  // リール3の文字
  桃: "o2Pqr",
  栗: "s3S4t",
  梨: "u5T6v",
  梅: "w7U8x",
  杏: "y9V0z",
  煮: "aA1Bc",

  // リール4の文字
  汁: "d2CeF",
  城: "g3GhI",
  郎: "j4Klm",
  子: "n5Pqr",
  粉: "u5X9f",
};

export const getCodeFromChar = (char: string): string => {
  const code = charToCodeMap[char];
  if (!code) {
    throw new Error(`Character "${char}" not found in mapping.`);
  }
  return code;
};

export const getCharFromCode = (code: string): string => {
  const char = Object.keys(charToCodeMap).find(
    (key) => charToCodeMap[key] === code,
  );
  if (!char) {
    throw new Error(`Code "${code}" not found in mapping.`);
  }
  return char;
};

export const generateURL = (reels: string[]): string => {
  return reels
    .map((reel) => reel.split("").map(getCodeFromChar).join(""))
    .join("-");
};

export const generateURLFromJoinReel = (reel: string): string => {
  return generateURL([...reel]);
};

export const getCharsFromURL = (url: string): string[] => {
  const codes = url.split("-").map((code) => code.match(/.{1,5}/g) || []);
  return codes.map((codeGroup) =>
    codeGroup.map((code) => getCharFromCode(code)).join(""),
  );
};
