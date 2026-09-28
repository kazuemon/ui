// 美術館の見本の画像（外に取りに行かないよう、SVG の data URL で作る）
// 作品は架空。文字は描かない（フォントで見た目が変わらないように）

const svg = (w: number, h: number, body: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`
  )}`;

export interface Artwork {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** 題・作者・年（キャプション） */
  title: string;
  artist: string;
  year: string;
}

// ── 展覧会の見出しの画像（光の庭。やわらかい色の面と、弧を描く光） ──
export const heroImage = svg(
  2100,
  900,
  `<defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f6e7c8"/><stop offset=".55" stop-color="#e9c9b4"/><stop offset="1" stop-color="#9fb7c9"/>
    </linearGradient>
    <radialGradient id="sun" cx=".7" cy=".35" r=".45">
      <stop offset="0" stop-color="#fff8e4"/><stop offset="1" stop-color="#fff8e4" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="2100" height="900" fill="url(#g)"/>
  <rect width="2100" height="900" fill="url(#sun)"/>
  <path d="M0 700 C400 560 800 820 1200 660 S1800 520 2100 640 L2100 900 L0 900 Z" fill="#6f8f7a" opacity=".55"/>
  <path d="M0 790 C500 700 900 880 1400 760 S1900 700 2100 760 L2100 900 L0 900 Z" fill="#48685a" opacity=".7"/>
  <circle cx="1470" cy="310" r="120" fill="#fff4d8"/>
  <path d="M300 640 Q700 120 1250 300" fill="none" stroke="#fffaf0" stroke-width="10" opacity=".7"/>
  <path d="M380 690 Q820 220 1380 380" fill="none" stroke="#fffaf0" stroke-width="5" opacity=".5"/>
  <rect x="160" y="140" width="220" height="300" fill="#d98c6a" opacity=".45"/>
  <rect x="240" y="220" width="220" height="300" fill="#6c8fb3" opacity=".4"/>`
);

// ── 展示のハイライト（展示室の写真風。壁と額と床） ──
const room = (
  wall: string,
  floor: string,
  frames: { x: number; w: number; h: number; fill: string }[]
) =>
  svg(
    1600,
    900,
    `<rect width="1600" height="900" fill="${wall}"/>
    <rect y="660" width="1600" height="240" fill="${floor}"/>
    <rect y="652" width="1600" height="8" fill="#000" opacity=".06"/>
    ${frames
      .map(
        ({ x, w, h, fill }) =>
          `<rect x="${x + 8}" y="${380 - h / 2 + 10}" width="${w}" height="${h}" fill="#000" opacity=".08"/>` +
          `<rect x="${x}" y="${380 - h / 2}" width="${w}" height="${h}" fill="#f8f5ef"/>` +
          `<rect x="${x + 18}" y="${380 - h / 2 + 18}" width="${w - 36}" height="${h - 36}" fill="${fill}"/>`
      )
      .join('')}
    <ellipse cx="800" cy="120" rx="700" ry="90" fill="#fff" opacity=".25"/>`
  );

export const highlights = [
  {
    src: room('#ece6dc', '#b9a58c', [
      { x: 260, w: 360, h: 460, fill: '#d98c6a' },
      { x: 720, w: 260, h: 320, fill: '#6c8fb3' },
      { x: 1080, w: 280, h: 380, fill: '#e3c26a' },
    ]),
    alt: '第 1 室。暖かい色の額が 3 枚並ぶ白い壁の展示室',
    title: '第 1 室　朝の色',
  },
  {
    src: room('#2f3a44', '#1f262c', [{ x: 420, w: 760, h: 440, fill: '#c9d6de' }]),
    alt: '第 2 室。暗い壁に、横長の大きな作品が 1 枚だけ掛かる展示室',
    title: '第 2 室　ひとつの窓',
  },
  {
    src: room('#e4ebe6', '#9fb0a2', [
      { x: 180, w: 220, h: 280, fill: '#48685a' },
      { x: 470, w: 220, h: 280, fill: '#7fa38c' },
      { x: 760, w: 220, h: 280, fill: '#a9c6b0' },
      { x: 1050, w: 220, h: 280, fill: '#d4e4d8' },
    ]),
    alt: '第 3 室。緑の濃さの違う小さな作品が 4 枚、横一列に並ぶ展示室',
    title: '第 3 室　庭の四季',
  },
  {
    src: room('#f3ede4', '#c4b39a', [
      { x: 340, w: 400, h: 400, fill: '#f0c9c0' },
      { x: 860, w: 400, h: 400, fill: '#bfd0e6' },
    ]),
    alt: '第 4 室。淡い桃色と水色の正方形の作品が 2 枚並ぶ展示室',
    title: '第 4 室　夕方の手紙',
  },
  {
    src: room('#1d2530', '#141a21', [
      { x: 300, w: 300, h: 400, fill: '#f2d27a' },
      { x: 660, w: 300, h: 400, fill: '#e38b5b' },
      { x: 1020, w: 300, h: 400, fill: '#b2573f' },
    ]),
    alt: '第 5 室。暗い壁に、黄色から赤へ色の移る作品が 3 枚並ぶ展示室',
    title: '第 5 室　灯り',
  },
];

// ── 所蔵品: 絵画（Gallery。4:3 に切り取って並べ、拡大すると全体が見える） ──
const painting = (w: number, h: number, body: string, bg: string) =>
  svg(w, h, `<rect width="${w}" height="${h}" fill="${bg}"/>${body}`);

export const paintings: Artwork[] = [
  {
    src: painting(
      1200,
      900,
      `<rect x="120" y="120" width="960" height="330" fill="#d98c6a"/><rect x="120" y="470" width="960" height="310" fill="#e3c26a"/>`,
      '#f3e9d8'
    ),
    alt: '横長の画面を、上の赤茶と下の黄土の 2 つの色の面で分けた絵',
    width: 1200,
    height: 900,
    title: '二つの午後',
    artist: '水野 あかり',
    year: '1962',
  },
  {
    src: painting(
      900,
      1200,
      `<circle cx="450" cy="420" r="230" fill="#2f5d8a"/><circle cx="450" cy="420" r="120" fill="#9fc3e0"/><rect x="0" y="860" width="900" height="340" fill="#1f3348"/>`,
      '#dfe9f1'
    ),
    alt: '縦長の画面の上に青い円が浮かび、下に濃い紺の帯がある絵',
    width: 900,
    height: 1200,
    title: '井戸の月',
    artist: '北条 ひでお',
    year: '1978',
  },
  {
    src: painting(
      1200,
      900,
      `<path d="M0 620 L260 380 L480 560 L760 300 L1000 520 L1200 420 L1200 900 L0 900 Z" fill="#7c9a86"/><path d="M0 760 L300 620 L620 740 L900 600 L1200 720 L1200 900 L0 900 Z" fill="#48685a"/><circle cx="920" cy="200" r="70" fill="#f6e3b0"/>`,
      '#e8eef0'
    ),
    alt: '緑の山が重なり、右上に淡い黄色の太陽がある風景の絵',
    width: 1200,
    height: 900,
    title: '峠の朝',
    artist: '森田 しずか',
    year: '1954',
  },
  {
    src: painting(
      1000,
      1000,
      ['#b2573f', '#e38b5b', '#f2d27a', '#a9c6b0', '#6c8fb3', '#3e4f7a']
        .map(
          (fill, i) => `<rect x="${100 + i * 135}" y="100" width="95" height="800" fill="${fill}"/>`
        )
        .join(''),
      '#f5f1ea'
    ),
    alt: '正方形の画面に、赤から紺まで 6 本の色の縦縞が並ぶ絵',
    width: 1000,
    height: 1000,
    title: '六つの時間',
    artist: '篠原 りく',
    year: '1971',
  },
  {
    src: painting(
      1200,
      900,
      `<ellipse cx="600" cy="700" rx="420" ry="60" fill="#8a6f55" opacity=".35"/><path d="M430 700 Q400 480 520 400 L520 330 L560 330 L560 400 Q690 480 650 700 Z" fill="#6c8fb3"/><circle cx="780" cy="640" r="70" fill="#e38b5b"/><circle cx="860" cy="660" r="50" fill="#e3c26a"/>`,
      '#ede3d3'
    ),
    alt: '机の上に青い瓶と、橙と黄色の果物が 2 つ置かれた静物画',
    width: 1200,
    height: 900,
    title: '瓶と果実',
    artist: '水野 あかり',
    year: '1966',
  },
  {
    src: painting(
      1200,
      900,
      `<rect width="1200" height="450" fill="#f0c9c0"/><rect y="450" width="1200" height="450" fill="#bfd0e6"/><path d="M0 450 Q300 400 600 450 T1200 450" fill="none" stroke="#fff" stroke-width="6"/><rect x="520" y="300" width="160" height="300" fill="#fff" opacity=".35"/>`,
      '#ffffff'
    ),
    alt: '上半分が淡い桃色、下半分が水色で、境目に白い細い線が波打つ絵',
    width: 1200,
    height: 900,
    title: '海の手前',
    artist: '北条 ひでお',
    year: '1983',
  },
];

// ── 所蔵品: 工芸と彫刻（Masonry。縦横の比をそろえない写真） ──
const object = (w: number, h: number, bg: string, body: string) =>
  svg(
    w,
    h,
    `<rect width="${w}" height="${h}" fill="${bg}"/><rect y="${h * 0.78}" width="${w}" height="${h * 0.22}" fill="#000" opacity=".06"/>${body}`
  );

export const objects: Artwork[] = [
  {
    src: object(
      600,
      900,
      '#efe9e0',
      `<path d="M230 700 Q170 520 240 380 Q260 330 250 250 L350 250 Q340 330 360 380 Q430 520 370 700 Z" fill="#3e6d8a"/><path d="M200 520 Q300 560 400 520" stroke="#e8f0f5" stroke-width="10" fill="none"/>`
    ),
    alt: '細い首の、藍色の縦長の花瓶。胴に白い線が 1 本入る',
    width: 600,
    height: 900,
    title: '藍の花瓶',
    artist: '作者不詳',
    year: '19 世紀',
  },
  {
    src: object(
      900,
      600,
      '#f3efe8',
      `<ellipse cx="450" cy="420" rx="260" ry="60" fill="#c98a5b"/><path d="M190 420 Q210 300 450 290 Q690 300 710 420 Z" fill="#dca274"/><ellipse cx="450" cy="300" rx="200" ry="30" fill="#b06f45"/>`
    ),
    alt: '平たく広い、明るい茶色の鉢',
    width: 900,
    height: 600,
    title: '土の鉢',
    artist: '石川 まこと',
    year: '1990',
  },
  {
    src: object(
      700,
      1000,
      '#e5e7ea',
      `<rect x="250" y="780" width="200" height="40" fill="#9aa1a8"/><path d="M300 780 Q260 560 330 420 Q300 300 350 200 Q400 300 370 420 Q440 560 400 780 Z" fill="#c7cbd0"/>`
    ),
    alt: '台の上に立つ、細長く波打つ白い石の彫刻',
    width: 700,
    height: 1000,
    title: '立つ水',
    artist: '森田 しずか',
    year: '1988',
  },
  {
    src: object(
      1000,
      600,
      '#f5efe4',
      `${[0, 1, 2, 3, 4, 5, 6, 7]
        .map(
          (i) =>
            `<rect x="${120 + i * 95}" y="120" width="85" height="360" fill="${i % 2 ? '#b2573f' : '#e9d2b0'}"/>`
        )
        .join('')}<rect x="120" y="270" width="760" height="40" fill="#3e4f7a" opacity=".8"/>`
    ),
    alt: '赤と生成りの縦縞に、紺の帯が横切る織物',
    width: 1000,
    height: 600,
    title: '縞の帯',
    artist: '作者不詳',
    year: '明治',
  },
  {
    src: object(
      800,
      800,
      '#ebe6de',
      `<circle cx="400" cy="400" r="220" fill="#2e2a26"/><circle cx="400" cy="400" r="150" fill="#6a5a48"/><circle cx="400" cy="400" r="40" fill="#e3c26a"/>`
    ),
    alt: '黒い縁に茶色の見込み、中心に金色の点がある丸い漆の盆',
    width: 800,
    height: 800,
    title: '夜の盆',
    artist: '篠原 りく',
    year: '1975',
  },
  {
    src: object(
      600,
      800,
      '#eef1ee',
      `<path d="M300 180 Q420 260 380 420 Q360 560 420 640 L180 640 Q240 560 220 420 Q180 260 300 180 Z" fill="#7fa38c"/><circle cx="300" cy="330" r="40" fill="#eef1ee"/>`
    ),
    alt: '中ほどに丸い穴のあいた、緑の釉の彫刻',
    width: 600,
    height: 800,
    title: '葉の穴',
    artist: '石川 まこと',
    year: '2004',
  },
  {
    src: object(
      900,
      700,
      '#f4ede6',
      `<rect x="160" y="160" width="580" height="380" fill="#f8f5ef" stroke="#c9b9a2" stroke-width="12"/><path d="M200 480 Q330 260 450 380 T700 260" stroke="#2e2a26" stroke-width="14" fill="none"/>`
    ),
    alt: '白い紙に、太い墨の線が 1 本だけ流れる書',
    width: 900,
    height: 700,
    title: '一筆',
    artist: '北条 ひでお',
    year: '1969',
  },
];

// ── 紹介の動画の、再生する前の画像（展示室を横に見渡す） ──
export const videoPoster = room('#ece6dc', '#b9a58c', [
  { x: 120, w: 300, h: 380, fill: '#d98c6a' },
  { x: 520, w: 420, h: 300, fill: '#6c8fb3' },
  { x: 1040, w: 300, h: 380, fill: '#e3c26a' },
]);

// ── アクセスの地図（Embed の iframe に入れる、外に取りに行かない HTML）。文字は描かない ──
export const mapDocument = `data:text/html;charset=utf-8,${encodeURIComponent(
  `<title>Kazue Museum のまわりの地図</title><body style="margin:0;height:100vh;background:#eef0ea">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block">
    <rect width="800" height="600" fill="#eef0ea"/>
    <path d="M0 470 Q200 430 400 480 T800 450 L800 600 L0 600 Z" fill="#cfe3ef"/>
    <rect x="420" y="120" width="260" height="200" rx="18" fill="#cfe2c8"/>
    <g stroke="#ffffff" stroke-width="22" fill="none" stroke-linecap="round">
      <path d="M0 360 L800 340"/><path d="M300 0 L330 600"/><path d="M560 0 L600 330"/>
    </g>
    <g stroke="#ffffff" stroke-width="10" fill="none"><path d="M0 200 L300 180"/><path d="M330 250 L800 230"/></g>
    <path d="M0 90 L800 70" stroke="#9aa1a8" stroke-width="8" stroke-dasharray="26 14"/>
    <rect x="150" y="66" width="90" height="34" rx="8" fill="#6c8fb3"/>
    <rect x="470" y="170" width="120" height="80" rx="10" fill="#d98c6a"/>
    <path d="M530 150 c-22 0 -36 16 -36 34 c0 26 36 58 36 58 s36 -32 36 -58 c0 -18 -14 -34 -36 -34z" fill="#b2573f"/>
    <circle cx="530" cy="184" r="12" fill="#fff"/>
    <path d="M195 100 L320 300 L500 250" stroke="#b2573f" stroke-width="5" fill="none" stroke-dasharray="10 8"/>
  </svg></body>`
)}`;
