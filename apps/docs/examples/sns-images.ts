// SNS の見本の投稿に付ける画像（外に取りに行かないよう、SVG の data URL で作る）

import { sunset } from './article-images';
import { landscape } from './images';

const svgSized = (width: number, height: number, body: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${body}</svg>`
  )}`;

// 花（縦長）
const flower = svgSized(
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

/** 投稿の Gallery に並べる 3 枚 */
export const postImages = [
  { src: landscape, alt: '空と山の絵', width: 1600, height: 900, caption: '山並みと空' },
  { src: sunset, alt: '夕焼けの海の絵', width: 1600, height: 900, caption: '夕焼けの海' },
  {
    src: flower,
    alt: 'ピンクの花の絵',
    width: 900,
    height: 1200,
    caption: '縦長の画像も、画面の高さに収めます',
  },
];
