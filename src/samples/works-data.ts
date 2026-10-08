// 作品集の見本のデータ（外に取りに行かないよう、画像は SVG の data URL で作る。文字は描かない）

const photo = (w: number, h: number, fill: string, accent: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">` +
      `<rect width="${w}" height="${h}" fill="${fill}"/>` +
      `<circle cx="${w * 0.7}" cy="${h * 0.35}" r="${Math.min(w, h) * 0.18}" fill="${accent}"/>` +
      `<path d="M0 ${h * 0.78} L${w * 0.35} ${h * 0.55} L${w * 0.6} ${h * 0.72} L${w} ${h * 0.5} L${w} ${h} L0 ${h} Z" fill="${accent}" opacity="0.55"/>` +
      `</svg>`
  )}`;

export type WorkCategory = 'web' | 'app' | 'photo' | 'illustration';

export const categories: { value: WorkCategory; label: string }[] = [
  { value: 'web', label: 'Web' },
  { value: 'app', label: 'アプリ' },
  { value: 'photo', label: '写真' },
  { value: 'illustration', label: 'イラスト' },
];

export interface Work {
  slug: string;
  title: string;
  date: string;
  category: WorkCategory;
  tags: string[];
  src: string;
  width: number;
  height: number;
}

const work = (
  slug: string,
  title: string,
  date: string,
  category: WorkCategory,
  tags: string[],
  [w, h, fill, accent]: [number, number, string, string]
): Work => ({
  slug,
  title,
  date,
  category,
  tags,
  src: photo(w, h, fill, accent),
  width: w,
  height: h,
});

export const works: Work[] = [
  work(
    'kazuemon-ui',
    'kazuemon/ui',
    '2026-09-30',
    'web',
    ['React', 'デザインシステム'],
    [640, 400, '#e3f0fd', '#5aa6f0']
  ),
  work(
    'tournament',
    '大会の運営ツール',
    '2026-08-12',
    'app',
    ['Next.js', '業務'],
    [640, 480, '#eef4e6', '#7fb069']
  ),
  work('spring', '春の高台から', '2026-03-02', 'photo', ['風景'], [480, 640, '#cfeafc', '#7cc4f8']),
  work('alley', '路地裏の光', '2026-02-18', 'photo', ['街'], [640, 420, '#fce9d8', '#f2b378']),
  work(
    'mascot',
    '大会のマスコット',
    '2026-01-20',
    'illustration',
    ['キャラクター'],
    [560, 560, '#fde7f0', '#ef7fa8']
  ),
  work(
    'blog',
    '個人のブログ',
    '2025-12-01',
    'web',
    ['Astro', 'MDX'],
    [640, 360, '#f1ecfb', '#9b7fe0']
  ),
  work('water', '朝の水面', '2025-11-03', 'photo', ['風景'], [640, 480, '#dff3ea', '#6fc39a']),
  work(
    'icons',
    'アイコンのセット',
    '2025-10-10',
    'illustration',
    ['アイコン'],
    [480, 600, '#fff4d6', '#f0b93a']
  ),
];

/** 注目の作品（Carousel の 1 枚ずつ）。画面の絵は横長でそろえる */
export const featured = [
  { title: 'kazuemon/ui のドキュメント', src: photo(1600, 900, '#e3f0fd', '#5aa6f0') },
  { title: '大会の運営ツールの一覧', src: photo(1600, 900, '#eef4e6', '#7fb069') },
  { title: '個人のブログの記事', src: photo(1600, 900, '#f1ecfb', '#9b7fe0') },
  { title: '大会のマスコット', src: photo(1600, 900, '#fde7f0', '#ef7fa8') },
];

/** 作品のほかの活動（登壇・記事）。小さな絵は 4:3 */
export const activities = [
  {
    title: 'デザインを候補から選ぶ',
    kind: '登壇',
    date: '2026-07-18',
    src: photo(400, 300, '#e9eef5', '#7d93b2'),
  },
  {
    title: '密度で変わる寸法の作り方',
    kind: '記事',
    date: '2026-06-02',
    src: photo(400, 300, '#f3efe6', '#c2a36b'),
  },
  {
    title: '和文フォントの行の高さ',
    kind: '記事',
    date: '2026-04-21',
    src: photo(400, 300, '#e8f4f1', '#5fae9c'),
  },
];
