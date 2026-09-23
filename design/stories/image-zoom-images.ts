// 軸 279〜282（ImageZoom）の比較で使う見本の画像（外に取りに行かない）。決まったら軸のストーリーと一緒に消す

const svg = (width: number, height: number, viewBox: string, body: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}">${body}</svg>`)}`;

export const landscape = svg(
  1280,
  720,
  '0 0 640 360',
  '<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc4f8"/><stop offset="1" stop-color="#cfeafc"/></linearGradient></defs><rect width="640" height="360" fill="url(#s)"/><circle cx="520" cy="90" r="36" fill="#fff4cc"/><path d="M0 250 L130 140 L230 230 L360 110 L480 220 L580 150 L640 200 L640 360 L0 360Z" fill="#9fb3cf"/><path d="M0 300 L120 250 L240 300 L380 240 L520 310 L640 270 L640 360 L0 360Z" fill="#2f6b58"/>'
);
export const portrait = svg(
  720,
  960,
  '0 0 360 480',
  '<rect width="360" height="480" fill="#cfeafc"/><circle cx="180" cy="170" r="70" fill="#fff4cc"/><path d="M0 380 L120 300 L240 360 L360 290 L360 480 L0 480Z" fill="#2f6b58"/>'
);
export const whiteScreen = svg(
  1280,
  720,
  '0 0 640 360',
  '<rect width="640" height="360" fill="#ffffff"/><rect x="48" y="48" width="200" height="20" rx="6" fill="#eef0f1"/><rect x="48" y="96" width="544" height="10" rx="5" fill="#eef0f1"/><rect x="48" y="120" width="440" height="10" rx="5" fill="#eef0f1"/><rect x="48" y="176" width="260" height="130" rx="12" fill="#f4f5f6"/><rect x="332" y="176" width="260" height="130" rx="12" fill="#f4f5f6"/>'
);
// 縦に長いスマートフォンの画面のスクリーンショット風（9:19.5）
export const tallScreen = svg(
  720,
  1560,
  '0 0 360 780',
  '<rect width="360" height="780" fill="#ffffff"/><rect x="24" y="56" width="160" height="20" rx="6" fill="#cfeafc"/><rect x="24" y="104" width="312" height="180" rx="16" fill="#7cc4f8"/><rect x="24" y="308" width="312" height="10" rx="5" fill="#eef0f1"/><rect x="24" y="332" width="260" height="10" rx="5" fill="#eef0f1"/><rect x="24" y="372" width="312" height="72" rx="12" fill="#f4f5f6"/><rect x="24" y="460" width="312" height="72" rx="12" fill="#f4f5f6"/><rect x="24" y="548" width="312" height="72" rx="12" fill="#f4f5f6"/><rect x="24" y="700" width="312" height="48" rx="24" fill="#2474df"/>'
);
