// 色の計算（oklch 変換・WCAG コントラスト比）。
// 候補生成時のコントラスト制約（design/adr/0002）の検査にも使う。

const toLinear = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const toGamma = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

export const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

export function hexToOklch(hex) {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { l: L, c: Math.hypot(A, B), h: Math.atan2(B, A) };
}

// 色域外なら null
export function oklchToHex({ l, c, h }) {
  const A = c * Math.cos(h);
  const B = c * Math.sin(h);
  const lc = (l + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const mc = (l - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const sc = (l - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const rgb = [
    4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc,
    -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc,
    -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc,
  ];
  if (rgb.some((v) => v < -0.001 || v > 1.001)) return null;
  return (
    '#' +
    rgb
      .map((v) =>
        Math.round(Math.min(1, Math.max(0, toGamma(v))) * 255)
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
      .toUpperCase()
  );
}

export function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// 色相を保ったまま明度だけ下げ、bg に対して target 以上のコントラストになる最初の色を返す。
// 色域に収まらない場合は彩度を少しずつ落とす。
export function darkenToContrast(hex, bg, target) {
  const { l, c, h } = hexToOklch(hex);
  for (let L = l; L > 0.15; L -= 0.002) {
    let C = c;
    let out;
    while (!(out = oklchToHex({ l: L, c: C, h })) && C > 0) C -= 0.002;
    if (out && contrast(out, bg) >= target) return out;
  }
  return null;
}

// 明度・彩度・色相を指定して作る（色相は度数）。色域外は彩度を落として収める。
export function oklch(l, c, hDeg) {
  const h = (hDeg * Math.PI) / 180;
  let C = c;
  let out;
  while (!(out = oklchToHex({ l, c: C, h })) && C > 0) C -= 0.002;
  return out;
}
