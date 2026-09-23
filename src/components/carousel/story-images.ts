// Carousel・Thumbnails のストーリー（と比較のストーリー）で使う見本の画像。外に取りに行かない
// 作品のページのスクリーンショット風（16:9）。文字は描かない（CI と手元でフォントがずれるため）

const svg = (body: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="1280" height="720">${body}</svg>`)}`;

// ページの骨組み（上の帯・見出しの帯・本文の行）。hero の色と並びを変えて、どの 1 枚か見分けられるようにする
const page = (hero: string, accent: string, layout: 'hero' | 'cards' | 'split' | 'list') => {
  const bar = `<rect width="640" height="360" fill="#ffffff"/><rect width="640" height="36" fill="#f4f5f6"/><circle cx="24" cy="18" r="8" fill="${accent}"/><rect x="480" y="13" width="48" height="10" rx="5" fill="#dfe3e6"/><rect x="540" y="13" width="72" height="10" rx="5" fill="#dfe3e6"/>`;
  switch (layout) {
    case 'hero':
      return svg(
        `${bar}<rect x="32" y="60" width="576" height="170" rx="16" fill="${hero}"/><circle cx="520" cy="120" r="36" fill="#fff4cc"/><rect x="56" y="100" width="220" height="22" rx="8" fill="#ffffff" opacity="0.9"/><rect x="56" y="136" width="160" height="12" rx="6" fill="#ffffff" opacity="0.7"/><rect x="56" y="180" width="96" height="28" rx="14" fill="${accent}"/><rect x="32" y="256" width="576" height="10" rx="5" fill="#eef0f1"/><rect x="32" y="280" width="480" height="10" rx="5" fill="#eef0f1"/><rect x="32" y="304" width="520" height="10" rx="5" fill="#eef0f1"/>`
      );
    case 'cards':
      return svg(
        `${bar}<rect x="32" y="60" width="200" height="20" rx="6" fill="${accent}"/><rect x="32" y="92" width="360" height="10" rx="5" fill="#eef0f1"/>${[
          32, 232, 432,
        ]
          .map(
            (x) =>
              `<rect x="${x}" y="124" width="176" height="200" rx="14" fill="#f4f5f6"/><rect x="${x}" y="124" width="176" height="100" rx="14" fill="${hero}"/><rect x="${x + 16}" y="240" width="120" height="12" rx="6" fill="#dfe3e6"/><rect x="${x + 16}" y="264" width="90" height="10" rx="5" fill="#eef0f1"/>`
          )
          .join('')}`
      );
    case 'split':
      return svg(
        `${bar}<rect x="32" y="60" width="280" height="264" rx="16" fill="${hero}"/><path d="M32 270 L120 200 L200 250 L312 170 L312 308 Q312 324 296 324 L48 324 Q32 324 32 308Z" fill="${accent}" opacity="0.6"/><rect x="340" y="76" width="200" height="22" rx="8" fill="#dfe3e6"/><rect x="340" y="116" width="268" height="10" rx="5" fill="#eef0f1"/><rect x="340" y="140" width="240" height="10" rx="5" fill="#eef0f1"/><rect x="340" y="164" width="256" height="10" rx="5" fill="#eef0f1"/><rect x="340" y="212" width="112" height="32" rx="16" fill="${accent}"/>`
      );
    default:
      return svg(
        `${bar}<rect x="32" y="60" width="160" height="20" rx="6" fill="${accent}"/>${[
          100, 160, 220, 280,
        ]
          .map(
            (y) =>
              `<rect x="32" y="${y}" width="576" height="48" rx="12" fill="#f4f5f6"/><rect x="44" y="${y + 8}" width="32" height="32" rx="16" fill="${hero}"/><rect x="92" y="${y + 12}" width="200" height="10" rx="5" fill="#dfe3e6"/><rect x="92" y="${y + 28}" width="140" height="8" rx="4" fill="#eef0f1"/>`
          )
          .join('')}`
      );
  }
};

/** 作品のページのスクリーンショット風の画像（5 枚） */
export const screens = [
  { src: page('#7cc4f8', '#2474df', 'hero'), alt: 'トップページ' },
  { src: page('#f9c6d8', '#d6407a', 'cards'), alt: '作品の一覧' },
  { src: page('#cfeafc', '#2f6b58', 'split'), alt: '作品の詳細' },
  { src: page('#fff4cc', '#b58a00', 'list'), alt: 'ブログの一覧' },
  { src: page('#dfe3e6', '#2474df', 'hero'), alt: 'お問い合わせ' },
] as const;

/** 数の多い並び（12 枚）。Thumbnails がはみ出すときの見本 */
export const manyScreens = Array.from({ length: 12 }, (_, i) => ({
  ...screens[i % screens.length],
  alt: `画面 ${i + 1}`,
}));
