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
