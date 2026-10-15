import type { TreeSelectItem } from './tree-select-items';

// ストーリーと比較の軸で使う木（部品ではない。公開の入口には足さない）
export const docTree: TreeSelectItem[] = [
  {
    value: 'design',
    label: 'デザイン',
    children: [
      { value: 'principles', label: '原則' },
      { value: 'tokens', label: 'トークン' },
      { value: 'adr', label: '決定の記録' },
      { value: 'axes', label: '比較の軸', disabled: true },
    ],
  },
  {
    value: 'components',
    label: '部品',
    children: [
      {
        value: 'inputs',
        label: '入力',
        children: [
          { value: 'select', label: 'Select' },
          { value: 'combobox', label: 'Combobox' },
          { value: 'tree-select', label: 'TreeSelect' },
        ],
      },
      {
        value: 'overlays',
        label: '重なる面',
        children: [
          { value: 'dialog', label: 'Dialog' },
          { value: 'drawer', label: 'Drawer' },
        ],
      },
      { value: 'tag', label: 'Tag' },
    ],
  },
  {
    value: 'guides',
    label: 'ドキュメント',
    children: [
      { value: 'intro', label: 'はじめに' },
      { value: 'install', label: 'インストール' },
    ],
  },
  { value: 'changelog', label: '変更履歴' },
];

// 親を選ぶことに意味がある木（parentSelect の見本。文言は架空）
//   orgTree: 通知の宛先・閲覧の範囲を選ぶ部署の木。「営業本部 のすべて」（本部全体）か、1 つの課かを選ぶ（1 つ選ぶ形）
//     課の名前は部ごとに重なる（「第一課」）。欄のパスで、どの部の課かを見分ける
export const orgTree: TreeSelectItem[] = [
  {
    value: 'sales',
    label: '営業本部',
    children: [
      {
        value: 'sales-east',
        label: '東日本営業部',
        children: [
          { value: 'sales-east-1', label: '第一課' },
          { value: 'sales-east-2', label: '第二課' },
        ],
      },
      {
        value: 'sales-west',
        label: '西日本営業部',
        children: [
          { value: 'sales-west-1', label: '第一課' },
          { value: 'sales-west-2', label: '第二課' },
        ],
      },
    ],
  },
  {
    value: 'dev',
    label: '開発本部',
    children: [
      {
        value: 'dev-product',
        label: 'プロダクト開発部',
        children: [
          { value: 'dev-app', label: 'アプリ課' },
          { value: 'dev-platform', label: '基盤課' },
        ],
      },
      { value: 'dev-qa', label: '品質保証部' },
    ],
  },
  {
    value: 'admin',
    label: '管理本部',
    children: [
      { value: 'hr', label: '人事部' },
      { value: 'finance', label: '経理部' },
      { value: 'audit', label: '監査室', disabled: true },
    ],
  },
];

//   labelTree: 記事に付けるカテゴリの木（Gmail のラベルのように、親のカテゴリそのものも記事に付けられる。複数選ぶ形）
//   一括の形（parentSelect="none"）では「開発」を選ぶと、中のカテゴリをすべて付ける意味になる
export const labelTree: TreeSelectItem[] = [
  {
    value: 'dev',
    label: '開発',
    children: [
      { value: 'frontend', label: 'フロントエンド' },
      { value: 'infra', label: 'インフラ' },
      { value: 'testing', label: 'テスト' },
    ],
  },
  {
    value: 'design',
    label: 'デザイン',
    children: [
      { value: 'ui', label: 'UI' },
      { value: 'diagram', label: '図解' },
    ],
  },
  {
    value: 'news',
    label: 'お知らせ',
    children: [
      { value: 'release', label: 'リリース' },
      { value: 'event', label: 'イベント' },
    ],
  },
  { value: 'diary', label: '日記' },
];

//   folderTree: 保存先のフォルダの木。中にフォルダがあっても、そのフォルダ自体に保存できる（1 つ選ぶ形）
export const folderTree: TreeSelectItem[] = [
  {
    value: 'docs',
    label: 'ドキュメント',
    children: [
      {
        value: 'projects',
        label: '案件',
        children: [
          {
            value: 'projects-2026',
            label: '2026 年度',
            children: [
              { value: 'proj-library', label: '海辺の図書館' },
              { value: 'proj-plaza', label: '駅前ひろば' },
            ],
          },
          { value: 'projects-2025', label: '2025 年度' },
        ],
      },
      {
        value: 'internal',
        label: '社内',
        children: [
          { value: 'minutes', label: '議事録' },
          { value: 'rules', label: '規程' },
        ],
      },
    ],
  },
  {
    value: 'photos',
    label: '写真',
    children: [
      { value: 'photos-2026', label: '2026' },
      { value: 'photos-2025', label: '2025' },
    ],
  },
  { value: 'shared', label: '共有（閲覧のみ）', disabled: true },
];

//   notifyTree: 受け取る通知の種類（複数選ぶ形）。親の箱で、その種類の通知をまとめて受け取る
export const notifyTree: TreeSelectItem[] = [
  {
    value: 'news',
    label: 'お知らせ',
    children: [
      { value: 'release', label: 'リリース' },
      { value: 'maintenance', label: 'メンテナンス' },
      { value: 'event', label: 'イベント' },
    ],
  },
  {
    value: 'account',
    label: 'アカウント',
    children: [
      { value: 'login', label: '新しい端末からのログイン' },
      { value: 'billing', label: '支払い' },
    ],
  },
  {
    value: 'comment',
    label: 'コメント',
    children: [
      { value: 'reply', label: '返信' },
      { value: 'mention', label: 'メンション' },
    ],
  },
  { value: 'weekly', label: '週のまとめ' },
];

//   stationTree: 乗車駅（1 つ選ぶ形）。路線には乗れないので、選べるのは駅だけ。乗り換え駅は複数の路線に出る（値は路線ごとに分ける）
export const stationTree: TreeSelectItem[] = [
  {
    value: 'kaihin',
    label: '海浜線',
    children: [
      { value: 'kaihin-minatomachi', label: '港町' },
      { value: 'kaihin-shiomidai', label: '汐見台' },
      { value: 'kaihin-hamakaze', label: '浜風公園' },
      { value: 'kaihin-chuo', label: '中央' },
    ],
  },
  {
    value: 'kyuryo',
    label: '丘陵線',
    children: [
      { value: 'kyuryo-chuo', label: '中央' },
      { value: 'kyuryo-wakaba', label: '若葉台' },
      { value: 'kyuryo-sakura', label: '桜ヶ丘' },
    ],
  },
  {
    value: 'kanjo',
    label: 'みなと環状線',
    children: [
      { value: 'kanjo-minatomachi', label: '港町' },
      { value: 'kanjo-shiyakusho', label: '市役所前' },
      { value: 'kanjo-chuo', label: '中央' },
    ],
  },
];

//   couponTree: クーポンの対象商品（複数選ぶ形）。「文具 全体」は今後追加される文具も対象、一括は今ある文具の商品だけ
export const couponTree: TreeSelectItem[] = [
  {
    value: 'stationery',
    label: '文具',
    children: [
      { value: 'note-a5', label: 'ノート A5' },
      { value: 'gel-pen', label: 'ゲルインクペン' },
      { value: 'masking-tape', label: 'マスキングテープ' },
    ],
  },
  {
    value: 'goods',
    label: '雑貨',
    children: [
      { value: 'mug', label: 'マグカップ' },
      { value: 'tote', label: 'トートバッグ' },
    ],
  },
  {
    value: 'food',
    label: '食品',
    children: [
      { value: 'drip-coffee', label: 'ドリップコーヒー' },
      { value: 'baked-sweets', label: '焼き菓子の詰め合わせ' },
    ],
  },
];
