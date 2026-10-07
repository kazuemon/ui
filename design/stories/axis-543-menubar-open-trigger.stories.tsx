import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { MenuItem } from '../../src/components/menu/MenuItem';
import { Menubar, MenubarMenu } from '../../src/components/menubar/Menubar';
import { statePseudo } from '../../src/stories/story-states';

// 後半の軸 543: Menubar の開いているトリガーの印
//   候補は --menubar-trigger-open-bg・--menubar-trigger-open-fg・--menubar-trigger-open-bar・--menubar-trigger-open-bar-color の上書きだけで作る
//   hover の塗りは、どの案も本文の色を 8% 敷いたもの（平らな押すもの）。開いている印が hover と見分けられるかを比べる

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '押下と同じ濃さ',
    intent:
      '平らな押すものを押したときと同じく、本文の色を 16% 敷く。押して開いたまま、押した見た目が残る。hover（8%）より一段濃く、見分けられる。',
    spec: [
      ['塗り', 'fg を flat-press-mix（16%）'],
      ['文字', 'fg'],
      ['線', 'なし'],
    ],
    tokens: {
      '--menubar-trigger-open-bg':
        'color-mix(in oklab, var(--color-fg) var(--flat-press-mix), transparent)',
      '--menubar-trigger-open-fg': 'var(--color-fg)',
      '--menubar-trigger-open-bar': '0px',
      '--menubar-trigger-open-bar-color': 'var(--color-primary)',
    },
  },
  {
    id: 'A',
    name: '入力欄の塗り',
    intent:
      'Menu の入れ子を開いている項目と同じく、入力欄のグレーを敷く。開いた中身の項目と同じ印でそろう。hover の塗りとほぼ同じ濃さなので、hover しているトリガーと開いているトリガーは見分けにくい。',
    spec: [
      ['塗り', 'field（gray-50）'],
      ['文字', 'fg'],
      ['線', 'なし'],
    ],
    tokens: {
      '--menubar-trigger-open-bg': 'var(--color-field)',
      '--menubar-trigger-open-fg': 'var(--color-fg)',
      '--menubar-trigger-open-bar': '0px',
      '--menubar-trigger-open-bar-color': 'var(--color-primary)',
    },
  },
  {
    id: 'B',
    name: '淡い青の塗り',
    intent:
      'Navbar の currentIndicator="primary" と同じ、淡い青の面と青の文字。開いたものがいちばん目立つ。いまいるページの印と同じ色なので、選んだ状態に読まれるおそれがある。',
    spec: [
      ['塗り', 'primary-subtle'],
      ['文字', 'on-primary-subtle'],
      ['線', 'なし'],
    ],
    tokens: {
      '--menubar-trigger-open-bg': 'var(--color-primary-subtle)',
      '--menubar-trigger-open-fg': 'var(--color-on-primary-subtle)',
      '--menubar-trigger-open-bar': '0px',
      '--menubar-trigger-open-bar-color': 'var(--color-primary)',
    },
  },
  {
    id: 'C',
    name: '文字の下の青い線',
    intent:
      'Navbar の underline と同じ、文字の下の青い線だけ。塗りは hover だけになる。線は Tabs の選んだタブの印にも似るので、切り替えたように読まれるおそれがある。',
    spec: [
      ['塗り', 'なし'],
      ['文字', 'fg'],
      ['線', '2px・primary（文字の幅）'],
    ],
    tokens: {
      '--menubar-trigger-open-bg': 'transparent',
      '--menubar-trigger-open-fg': 'var(--color-fg)',
      '--menubar-trigger-open-bar': 'var(--navbar-current-bar)',
      '--menubar-trigger-open-bar-color': 'var(--color-primary)',
    },
  },
  {
    id: 'D',
    name: 'グレーのボタンの塗り',
    intent:
      'グレーのボタンと同じ neutral の面を敷く。入力欄の塗りより、わずかに濃い灰色。hover との差は A と同じく小さい。',
    spec: [
      ['塗り', 'neutral（gray-100）'],
      ['文字', 'fg'],
      ['線', 'なし'],
    ],
    tokens: {
      '--menubar-trigger-open-bg': 'var(--color-neutral)',
      '--menubar-trigger-open-fg': 'var(--color-fg)',
      '--menubar-trigger-open-bar': '0px',
      '--menubar-trigger-open-bar-color': 'var(--color-primary)',
    },
  },
];

const columns: Column[] = [
  { label: '開いている（編集）' },
  {
    label: '開いている＋隣を hover',
    note: '編集を開いたまま、ファイルに載せている',
    preview: 'hover',
  },
  { label: '開いているトリガーを hover', preview: 'hover' },
  { label: '白い面の帯の上', note: '軸 541 の B（白い面と細い輪郭）' },
];

function Sample({ hoverTarget }: { hoverTarget?: 'file' | 'edit' }) {
  const target = { 'data-preview-target': '' };
  return (
    <Menubar accessibleName="アプリのメニュー">
      <MenubarMenu label="ファイル" triggerProps={hoverTarget === 'file' ? target : undefined}>
        <MenuItem>新規</MenuItem>
      </MenubarMenu>
      <MenubarMenu
        label="編集"
        triggerProps={{ 'data-popup-open': '', ...(hoverTarget === 'edit' ? target : {}) }}
      >
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
    case '開いている＋隣を hover':
      return <Sample hoverTarget="file" />;
    case '開いているトリガーを hover':
      return <Sample hoverTarget="edit" />;
    case '白い面の帯の上':
      return (
        <div
          style={
            {
              '--menubar-bg': 'var(--color-surface)',
              '--menubar-line-width': 'var(--border-width-thin)',
              '--menubar-padding': 'var(--spacing)',
            } as CSSProperties
          }
        >
          <Sample />
        </div>
      );
    default:
      return <Sample />;
  }
}

const meta = {
  title: 'Design Review/543 Menubar の開いているトリガーの印',
  id: 'design-review-543-menubar-open-trigger',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({ hover: '[data-preview-target]' }),
  },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={543}
      axis="Menubar の開いているトリガーの印"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => renderCell(column)}
    >
      <p>決定: 押下と同じ濃さを既定にし、色は Button と同じ color の語彙で変えられる（ADR-0480）</p>
      <p>
        メニューを開いているあいだ、そのトリガーにどんな印を付けるかを決めます。1
        つ開いているあいだは、隣のトリガーに載せるだけでメニューが移るので、hover
        の塗り（本文の色を淡く敷く）と、開いている印が並んで見えることがあります（2 列目）。
      </p>
      <p>
        おすすめは現行版（押下と同じ濃さ）を既定にすることです。押して開いたまま押した見た目が残るので理由が分かりやすく、hover
        より一段濃いので並んでも見分けられ、白い面の帯の上でもグレーの帯の上でも同じに見えます。A と
        D は hover とほとんど同じ濃さです。B と C は、Navbar のいまいるページや Tabs
        の選んだタブと同じ色・線なので、選んだ状態に読まれるおそれがあります。どれを既定にするか教えてください。
      </p>
    </Comparison>
  ),
};
