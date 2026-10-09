import type { CascaderItem } from './Cascader';

// ストーリーと比較のストーリーで使う選択肢（架空の並び）

const leaves = (prefix: string, labels: string[]): CascaderItem[] =>
  labels.map((label, i) => ({ label, value: `${prefix}-${i + 1}` }));

/** 都道府県 → 市区町村（2 段） */
export const regions: CascaderItem[] = [
  {
    label: '北海道',
    value: 'hokkaido',
    children: leaves('hokkaido', ['札幌市', '函館市', '小樽市', '旭川市']),
  },
  {
    label: '宮城県',
    value: 'miyagi',
    children: leaves('miyagi', ['仙台市', '石巻市', '塩竈市']),
  },
  {
    label: '東京都',
    value: 'tokyo',
    children: [
      { label: '千代田区', value: 'chiyoda' },
      { label: '中央区', value: 'chuo' },
      { label: '港区', value: 'minato' },
      { label: '新宿区', value: 'shinjuku' },
      { label: '文京区', value: 'bunkyo' },
      { label: '台東区', value: 'taito' },
      { label: '品川区', value: 'shinagawa' },
      { label: '目黒区', value: 'meguro' },
      { label: '世田谷区', value: 'setagaya' },
      { label: '渋谷区', value: 'shibuya' },
      { label: '中野区', value: 'nakano' },
      { label: '杉並区', value: 'suginami' },
      { label: '八王子市', value: 'hachioji', disabled: true },
    ],
  },
  {
    label: '神奈川県',
    value: 'kanagawa',
    children: leaves('kanagawa', ['横浜市', '川崎市', '相模原市', '鎌倉市']),
  },
  {
    label: '愛知県',
    value: 'aichi',
    children: leaves('aichi', ['名古屋市', '豊橋市', '岡崎市']),
  },
  {
    label: '京都府',
    value: 'kyoto',
    children: leaves('kyoto', ['京都市', '宇治市', '舞鶴市']),
  },
  {
    label: '大阪府',
    value: 'osaka',
    children: leaves('osaka', ['大阪市', '堺市', '豊中市', '吹田市']),
  },
  { label: '沖縄県', value: 'okinawa', disabled: true, children: [] },
];

/** カテゴリ（3 段） */
export const categories: CascaderItem[] = [
  {
    label: '本',
    value: 'books',
    children: [
      {
        label: '小説',
        value: 'novel',
        children: leaves('novel', ['ミステリー', 'SF', '歴史', '恋愛']),
      },
      {
        label: '技術書',
        value: 'tech',
        children: leaves('tech', ['Web', 'デザイン', 'データベース']),
      },
      { label: '絵本', value: 'picture' },
    ],
  },
  {
    label: '文房具',
    value: 'stationery',
    children: [
      {
        label: '筆記具',
        value: 'pen',
        children: leaves('pen', ['ボールペン', '万年筆', '鉛筆']),
      },
      {
        label: 'ノート',
        value: 'notebook',
        children: leaves('notebook', ['方眼', '無地', '横罫']),
      },
      { label: '付箋', value: 'sticky' },
    ],
  },
  {
    label: '雑貨',
    value: 'goods',
    children: [
      { label: 'マグカップ', value: 'mug' },
      { label: 'トートバッグ', value: 'tote' },
    ],
  },
];
