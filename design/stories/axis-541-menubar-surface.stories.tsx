import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { MenuItem } from '../../src/components/menu/MenuItem';
import { Menubar, MenubarMenu } from '../../src/components/menubar/Menubar';
import { statePseudo } from '../../src/stories/story-states';

// 後半の軸 541: Menubar の帯に面を敷くか
//   候補は --menubar-bg・--menubar-line・--menubar-line-width・--menubar-padding・--menubar-radius の上書きだけで作る
//   帯に余白があるとき、トリガーの角は帯の角から余白を引いた同心の角になる（部品がそう描く）
//   開いているトリガーの塗り（--menubar-trigger-open-bg）は、溝（A）では溝と同じ色で消えるので、A だけ白いつまみにする

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '面なし',
    intent:
      '帯は面を持たず、置いた場所の地にトリガーを並べる。Navbar の行き先と同じ置き方で、いちばん軽い。帯の範囲は見えないが、アプリの上の帯に置けば帯がその範囲になる。',
    spec: [
      ['帯の面', 'なし'],
      ['帯の余白', '0'],
      ['トリガーの角', 'control'],
    ],
    tokens: {
      '--menubar-bg': 'transparent',
      '--menubar-line': 'var(--color-surface-line)',
      '--menubar-line-width': '0px',
      '--menubar-padding': '0px',
      '--menubar-radius': 'var(--radius-control)',
    },
  },
  {
    id: 'A',
    name: '入力欄のグレーの溝',
    intent:
      'Tabs の segmented・SegmentedControl と同じく、入力欄のグレーを溝として敷き、開いているトリガーは白いつまみにする。帯のまとまりが見え、開いたものも目立つ。グレーの帯の上（右の列）では溝が見えにくい。',
    spec: [
      ['帯の面', 'field（グレー）'],
      ['帯の余白', '4px'],
      ['開いているトリガー', 'surface（白）'],
      ['トリガーの角', 'control − 4px'],
    ],
    tokens: {
      '--menubar-bg': 'var(--color-field)',
      '--menubar-line': 'var(--color-surface-line)',
      '--menubar-line-width': '0px',
      '--menubar-padding': 'var(--spacing)',
      '--menubar-radius': 'var(--radius-control)',
      '--menubar-trigger-open-bg': 'var(--color-surface)',
    },
  },
  {
    id: 'B',
    name: '白い面と細い輪郭',
    intent:
      'ButtonGroup や白いボタンと同じ、白い面に細い輪郭。グレーの帯の上でも帯の範囲が分かる。部品のまとまりとして読まれ、ツールの帯らしく見える。',
    spec: [
      ['帯の面', 'surface（白）'],
      ['輪郭', 'thin・surface-line'],
      ['帯の余白', '4px'],
      ['トリガーの角', 'control − 4px'],
    ],
    tokens: {
      '--menubar-bg': 'var(--color-surface)',
      '--menubar-line': 'var(--color-surface-line)',
      '--menubar-line-width': 'var(--border-width-thin)',
      '--menubar-padding': 'var(--spacing)',
      '--menubar-radius': 'var(--radius-control)',
    },
  },
];

const columns: Column[] = [
  { label: '白い地の上' },
  { label: 'hover（ファイル）', preview: 'hover' },
  { label: '開いている（編集）' },
  { label: 'グレーの帯の上', note: 'アプリの上の帯を neutral で塗ったとき' },
];

function Sample({ open = false }: { open?: boolean }) {
  return (
    <Menubar accessibleName="アプリのメニュー">
      <MenubarMenu label="ファイル" triggerProps={{ 'data-preview-target': '' }}>
        <MenuItem>新規</MenuItem>
      </MenubarMenu>
      <MenubarMenu label="編集" triggerProps={open ? { 'data-popup-open': '' } : undefined}>
        <MenuItem>取り消す</MenuItem>
      </MenubarMenu>
      <MenubarMenu label="表示">
        <MenuItem>ツールバー</MenuItem>
      </MenubarMenu>
      <MenubarMenu label="ヘルプ">
        <MenuItem>使い方</MenuItem>
      </MenubarMenu>
    </Menubar>
  );
}

function renderCell(column: Column) {
  switch (column.label) {
    case '開いている（編集）':
      return <Sample open />;
    case 'グレーの帯の上':
      return (
        <div className="rounded-control bg-neutral p-3">
          <Sample open />
        </div>
      );
    default:
      return <Sample />;
  }
}

const meta = {
  title: 'Design Review/541 Menubar の帯の面',
  id: 'design-review-541-menubar-surface',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({ hover: '[data-preview-target]' }),
  },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={541}
      axis="Menubar の帯に面を敷くか"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => renderCell(column)}
    >
      <p>決定: 面なしだけにする。面が要るときは className で敷く（ADR-0478）</p>
      <p>
        Menubar
        は「ファイル・編集・表示…」のトリガーを横に並べた帯です。帯そのものに面（塗り・輪郭）を敷くかを決めます。トリガーの見た目（hover
        は文字の色を淡く敷き、開いているあいだは押下と同じ濃さの塗り）は、溝の A
        を除いてどの案も同じです。
      </p>
      <p>
        おすすめは現行版（面なし）を既定にし、B（白い面と細い輪郭）を選べるようにすることです。帯はふつうアプリの上の帯（Navbar
        など）の中に置くので、帯の面はそちらが持ちます。面なしがいちばん軽く、Navbar
        の行き先とも並びます。B
        は、帯をページの中に単独で置くとき（エディタの上など）にまとまりを見せられます。A の溝は
        Tabs の segmented
        と見分けがつきにくく、切り替えのつまみに見えます。どれを既定にするか教えてください。
      </p>
    </Comparison>
  ),
};
