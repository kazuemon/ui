import { FileTextIcon, FolderIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Icon } from '../../src/components/icon/Icon';
import { Tree, TreeItem } from '../../src/components/tree/Tree';

// 軸 454: Tree の子をあとから読み込むとき（TreeItem の hasChildren・loading）の、読み込み中の見せ方
const meta = {
  title: 'Design Review/454 ツリーの子の読み込み中',
  id: 'design-review-454-tree-loading',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const off = {
  '--tree-loading-caret-display': 'grid',
  '--tree-loading-caret-spinner-display': 'none',
  '--tree-loading-end-display': 'none',
  '--tree-loading-row-display': 'none',
  '--tree-loading-skeleton-display': 'none',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '印なし',
    intent:
      '開いた行は、子が届くまで空のまま。待っているのか、子がないのかが分からない。比べるための基準',
    spec: [
      ['行', '開閉の印のまま'],
      ['開いた中', '空'],
    ],
    tokens: off,
  },
  {
    id: 'A',
    name: '開閉の印を回る円に替える',
    intent:
      '読み込んでいるあいだ、行の頭の開閉の印を回る円に置き換える。行の高さも中身も動かず、届いたら印に戻って子が開く。待っている場所が、押した行そのものになる',
    spec: [
      ['行', '開閉の印 → 回る円'],
      ['開いた中', '空（届いたら開く）'],
    ],
    tokens: {
      ...off,
      '--tree-loading-caret-display': 'none',
      '--tree-loading-caret-spinner-display': 'grid',
    },
  },
  {
    id: 'B',
    name: '行の右端に回る円',
    intent:
      '開閉の印は開いた向きのまま残し、行の右端に回る円を置く。印の向きで開いたことが分かり、円で待っていることが分かる。右端はアイコンや ↗ と同じ場所',
    spec: [
      ['行', '開閉の印（下向き）＋右端の回る円'],
      ['開いた中', '空'],
    ],
    tokens: { ...off, '--tree-loading-end-display': 'grid' },
  },
  {
    id: 'C',
    name: '開いた中に「読み込んでいます」の行',
    intent:
      '開いた中、子の段の字下げで、回る円と「読み込んでいます」の行を 1 行置く。どこに子が入るかが分かる。届くと、その行が子に入れ替わる',
    spec: [
      ['行', '開閉の印（下向き）'],
      ['開いた中', '回る円＋文（淡い文字）の 1 行'],
    ],
    tokens: { ...off, '--tree-loading-row-display': 'flex' },
  },
  {
    id: 'D',
    name: '開いた中に場所取りの行',
    intent:
      '開いた中に、子の行の形の淡い場所取り（Skeleton の文字の行）を 2 行置き、光が横切る。届いたときの高さの変わりが小さい。何行届くかは分からないので、2 行は仮の数',
    spec: [
      ['行', '開閉の印（下向き）'],
      ['開いた中', '場所取りの行 × 2'],
    ],
    tokens: { ...off, '--tree-loading-skeleton-display': 'flex' },
  },
];

const columns: Column[] = [
  { label: '読み込み中', note: '「部品」を開いた直後' },
  { label: '入れ子の中で読み込み中', note: '2 段目の「入力」' },
  { label: '届いたあと', note: '比べるため（どの案も同じ）' },
];

const folder = (
  <Icon>
    <FolderIcon />
  </Icon>
);
const file = (
  <Icon>
    <FileTextIcon />
  </Icon>
);

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={454}
      axis="ツリーの子の読み込み中"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <Tree accessibleName="ドキュメント" className="w-[260px]">
          <TreeItem label="はじめに" icon={file} href="#intro" />
          {column.label === '読み込み中' ? (
            <TreeItem label="部品" icon={folder} hasChildren loading defaultExpanded />
          ) : (
            <TreeItem label="部品" icon={folder} defaultExpanded>
              <TreeItem label="Button" icon={file} href="#button" />
              {column.label === '入れ子の中で読み込み中' ? (
                <TreeItem label="入力" icon={folder} hasChildren loading defaultExpanded />
              ) : (
                <TreeItem label="入力" icon={folder} defaultExpanded>
                  <TreeItem label="Checkbox" icon={file} href="#checkbox" />
                  <TreeItem label="Radio" icon={file} href="#radio" />
                </TreeItem>
              )}
            </TreeItem>
          )}
          <TreeItem label="デザイン原則" icon={folder} hasChildren />
        </Tree>
      )}
    >
      <p>
        TreeItem に、子をあとから読み込む hasChildren と、読み込み中の loading
        を足しました。hasChildren を付けると、children
        がまだなくても開け閉めできる行になります。開いたとき（onExpandedChange）に子を読み込み、そのあいだ
        loading を付けます。読み上げには、行の aria-busy
        と「読み込んでいます」（loadingText）を届けます。
      </p>
      <p>
        選ぶのは、読み込んでいるあいだに見える印です。原則では、待っていることだけを見せ、結果がないとは言い切りません。いちばん下の「デザイン原則」は、まだ開いていない
        hasChildren の行です（閉じた印のまま）。
      </p>
    </Comparison>
  ),
};
