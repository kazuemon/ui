// 見本の画像（外に取りに行かないよう、SVG の data URL で作る）

export const svg = (body: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">${body}</svg>`
  )}`;

// 空と山の絵（色のある画像）
export const landscape = svg(`
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7cc8fb"/><stop offset="1" stop-color="#e3f4fe"/>
    </linearGradient>
    <linearGradient id="far" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8fa8c8"/><stop offset="1" stop-color="#b9c9dc"/>
    </linearGradient>
    <linearGradient id="near" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3f7d6b"/><stop offset="1" stop-color="#27544a"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#sky)"/>
  <circle cx="1220" cy="220" r="80" fill="#fff6d6"/>
  <path d="M0 620 L300 360 L520 540 L820 280 L1120 560 L1360 420 L1600 580 L1600 900 L0 900 Z" fill="url(#far)"/>
  <path d="M0 760 L260 600 L520 720 L860 540 L1180 740 L1420 640 L1600 720 L1600 900 L0 900 Z" fill="url(#near)"/>
`);

// 白っぽい画像（画面のスクリーンショットの絵）。輪郭がないと白地に溶ける
export const screenshot = svg(`
  <rect width="1600" height="900" fill="#ffffff"/>
  <rect x="120" y="110" width="520" height="56" rx="12" fill="#f4f5f7"/>
  <rect x="120" y="220" width="1360" height="24" rx="12" fill="#eceef1"/>
  <rect x="120" y="276" width="1180" height="24" rx="12" fill="#eceef1"/>
  <rect x="120" y="332" width="1260" height="24" rx="12" fill="#eceef1"/>
  <rect x="120" y="440" width="640" height="340" rx="24" fill="#f7f8fa"/>
  <rect x="840" y="440" width="640" height="340" rx="24" fill="#f7f8fa"/>
  <rect x="180" y="690" width="200" height="52" rx="26" fill="#e3f4fe"/>
`);

// Gallery の見本に並べる絵。色と形と比を変えて、並べたときと送ったときに見分けられるようにする
const svgSized = (width: number, height: number, body: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${body}</svg>`
  )}`;

// 夕焼けの海
export const sunset = svg(`
  <defs>
    <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f7a8c4"/><stop offset="1" stop-color="#ffe2b8"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#dusk)"/>
  <circle cx="800" cy="560" r="150" fill="#ffd27a"/>
  <rect y="560" width="1600" height="340" fill="#5a86b8"/>
  <rect x="620" y="610" width="360" height="12" rx="6" fill="#ffd27a" opacity="0.7"/>
  <rect x="680" y="660" width="240" height="10" rx="5" fill="#ffd27a" opacity="0.5"/>
`);

// 夜の街
export const night = svg(`
  <rect width="1600" height="900" fill="#1f2a4a"/>
  <circle cx="1300" cy="180" r="70" fill="#f4f1d0"/>
  <rect x="80" y="420" width="200" height="480" fill="#33416b"/>
  <rect x="320" y="300" width="240" height="600" fill="#2b375c"/>
  <rect x="600" y="480" width="180" height="420" fill="#3a4a78"/>
  <rect x="820" y="360" width="260" height="540" fill="#2b375c"/>
  <rect x="1120" y="520" width="220" height="380" fill="#33416b"/>
  <rect x="1380" y="440" width="180" height="460" fill="#2b375c"/>
  <g fill="#ffe7a3">
    <rect x="360" y="360" width="36" height="36"/><rect x="440" y="440" width="36" height="36"/>
    <rect x="870" y="420" width="36" height="36"/><rect x="960" y="520" width="36" height="36"/>
    <rect x="130" y="500" width="36" height="36"/><rect x="1180" y="600" width="36" height="36"/>
  </g>
`);

// 花（縦長）
export const flower = svgSized(
  900,
  1200,
  `
  <rect width="900" height="1200" fill="#e9f7ef"/>
  <rect x="440" y="560" width="20" height="560" rx="10" fill="#3f8f5f"/>
  <ellipse cx="560" cy="820" rx="110" ry="40" fill="#5fae7c" transform="rotate(-30 560 820)"/>
  <g fill="#f59ab8">
    <circle cx="450" cy="380" r="110"/><circle cx="600" cy="480" r="110"/><circle cx="540" cy="650" r="110"/>
    <circle cx="360" cy="650" r="110"/><circle cx="300" cy="480" r="110"/>
  </g>
  <circle cx="450" cy="530" r="90" fill="#ffd66e"/>
`
);

// 図（記事の図のような、白地の線と箱）
export const diagram = svg(`
  <rect width="1600" height="900" fill="#ffffff"/>
  <g fill="#f4f5f7" stroke="#c9d3de" stroke-width="4">
    <rect x="140" y="330" width="340" height="220" rx="28"/>
    <rect x="630" y="330" width="340" height="220" rx="28"/>
    <rect x="1120" y="330" width="340" height="220" rx="28"/>
  </g>
  <g stroke="#2474df" stroke-width="10" stroke-linecap="round">
    <line x1="500" y1="440" x2="610" y2="440"/><line x1="990" y1="440" x2="1100" y2="440"/>
  </g>
  <g fill="#7cc8fb"><rect x="200" y="400" width="220" height="24" rx="12"/><rect x="690" y="400" width="220" height="24" rx="12"/><rect x="1180" y="400" width="220" height="24" rx="12"/></g>
  <g fill="#e1e6ec"><rect x="200" y="450" width="160" height="18" rx="9"/><rect x="690" y="450" width="160" height="18" rx="9"/><rect x="1180" y="450" width="160" height="18" rx="9"/></g>
`);

// 森（縦長）
export const forest = svgSized(
  900,
  1200,
  `
  <rect width="900" height="1200" fill="#d8efe4"/>
  <circle cx="680" cy="220" r="80" fill="#fff6d6"/>
  <g fill="#3f7d6b">
    <path d="M180 1200 L180 900 L60 900 L180 600 L110 600 L220 320 L330 600 L260 600 L380 900 L260 900 L260 1200Z"/>
    <path d="M560 1200 L560 860 L420 860 L560 520 L480 520 L610 220 L740 520 L660 520 L800 860 L660 860 L660 1200Z"/>
  </g>
  <rect y="1080" width="900" height="120" fill="#27544a"/>
`
);

/** Gallery の見本。比の違う絵を 6 枚 */
export const galleryImages = [
  { src: landscape, alt: '空と山の絵', width: 1600, height: 900, caption: '山並みと空' },
  { src: sunset, alt: '夕焼けの海の絵', width: 1600, height: 900, caption: '夕焼けの海' },
  {
    src: flower,
    alt: 'ピンクの花の絵',
    width: 900,
    height: 1200,
    caption: '縦長の画像も、画面の高さに収めます',
  },
  { src: night, alt: '夜の街の絵', width: 1600, height: 900, caption: '夜の街' },
  {
    src: diagram,
    alt: '3 つの箱を矢印でつないだ図',
    width: 1600,
    height: 900,
    caption: '図 3. 処理の流れ',
  },
  { src: forest, alt: '森の絵', width: 900, height: 1200, caption: '森' },
];
