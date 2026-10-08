// 記事の見本の画像（src/samples/images.ts の sunset・night と同じ絵）

import { svg } from './images';

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
