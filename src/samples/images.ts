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
