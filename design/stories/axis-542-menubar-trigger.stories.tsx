import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { MenuItem } from '../../src/components/menu/MenuItem';
import { Menubar, MenubarMenu } from '../../src/components/menubar/Menubar';
import { statePseudo } from '../../src/stories/story-states';

// 後半の軸 542: Menubar のトリガーの寸法と文字
//   候補は --menubar-trigger-padding-x・--menubar-trigger-weight・--menubar-trigger-fg・--menubar-trigger-open-fg・
//   --menubar-trigger-open-weight と、比べるときだけ置く --menubar-trigger-height・--menubar-trigger-text・--menubar-trigger-leading の上書きだけで作る
//   高さと文字を上書きしない案は、部品の高さと文字（密度で変わる）のまま

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '本文の太さ・狭い余白',
    intent:
      'デスクトップのアプリのメニューの帯と同じく、本文の色と太さの文字を、左右 12px の余白で詰めて並べる。高さは部品の高さ（指でも押せる 44px）。項目が多くても横に収まりやすい。',
    spec: [
      ['高さ', 'spacing-control（44px）'],
      ['左右の余白', '12px'],
      ['文字', 'text-control・400・fg'],
    ],
    tokens: {
      '--menubar-trigger-padding-x': 'calc(var(--spacing) * 3)',
      '--menubar-trigger-weight': '400',
      '--menubar-trigger-fg': 'var(--color-fg)',
      '--menubar-trigger-open-fg': 'var(--color-fg)',
    },
  },
  {
    id: 'A',
    name: 'ボタンと同じ',
    intent:
      'Button と同じ太字と左右 16px の余白。押せるものと一目で分かるが、4 つ並ぶと文字が重く、帯の幅も広がる。',
    spec: [
      ['高さ', 'spacing-control（44px）'],
      ['左右の余白', 'spacing-control-x（16px）'],
      ['文字', 'text-control・700・fg'],
    ],
    tokens: {
      '--menubar-trigger-padding-x': 'var(--spacing-control-x)',
      '--menubar-trigger-weight': '700',
      '--menubar-trigger-fg': 'var(--color-fg)',
      '--menubar-trigger-open-fg': 'var(--color-fg)',
    },
  },
  {
    id: 'B',
    name: 'Navbar の行き先と同じ',
    intent:
      'Navbar の行き先と同じく、ふだんは一段淡い文字にし、開いているトリガーだけ本文の色の太字にする。開いたものが文字でも分かる。太さが変わるぶん、開くと文字の幅がわずかに広がる。',
    spec: [
      ['高さ', 'spacing-control（44px）'],
      ['左右の余白', '12px'],
      ['文字', 'text-control・400・fg-muted'],
      ['開いているとき', '700・fg'],
    ],
    tokens: {
      '--menubar-trigger-padding-x': 'calc(var(--spacing) * 3)',
      '--menubar-trigger-weight': '400',
      '--menubar-trigger-fg': 'var(--color-fg-muted)',
      '--menubar-trigger-open-fg': 'var(--color-fg)',
      '--menubar-trigger-open-weight': '700',
    },
  },
  {
    id: 'C',
    name: '小さい段',
    intent:
      'Button の size="sm" と同じ 36px の高さと 14px の文字。アプリの上の帯を低く詰めたいときの形。指でも 36px のままで、指で押せる高さを割る。',
    spec: [
      ['高さ', 'spacing-control-sm（36px）'],
      ['左右の余白', 'spacing-control-x-sm（12px）'],
      ['文字', 'text-control-sm（14px）・400・fg'],
    ],
    tokens: {
      '--menubar-trigger-height': 'var(--spacing-control-sm)',
      '--menubar-trigger-text': 'var(--text-control-sm)',
      '--menubar-trigger-leading': 'var(--leading-control-sm)',
      '--menubar-trigger-padding-x': 'var(--spacing-control-x-sm)',
      '--menubar-trigger-weight': '400',
      '--menubar-trigger-fg': 'var(--color-fg)',
      '--menubar-trigger-open-fg': 'var(--color-fg)',
    },
  },
];

const columns: Column[] = [
  { label: '通常（マウス）' },
  { label: 'hover（ファイル）', preview: 'hover' },
  { label: '開いている（編集）' },
  { label: '指（coarse）', note: '部品の文字は 14px になる' },
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
      return (
        <div data-density="fine">
          <Sample open />
        </div>
      );
    case '指（coarse）':
      return (
        <div data-density="coarse">
          <Sample open />
        </div>
      );
    default:
      return (
        <div data-density="fine">
          <Sample />
        </div>
      );
  }
}

const meta = {
  title: 'Design Review/542 Menubar のトリガーの寸法と文字',
  id: 'design-review-542-menubar-trigger',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({ hover: '[data-preview-target]' }),
  },
  args: { pick: 'current,C' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={542}
      axis="Menubar のトリガーの寸法と文字"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => renderCell(column)}
    >
      <p>決定: 現行版（md）を既定にし、小さい段 C を size="sm" で選べる（ADR-0479）</p>
      <p>
        帯に並ぶトリガー（ファイル・編集…）の高さ、左右の余白、文字の太さと色を決めます。トリガーは平らな押すものなので、hover
        は文字の色を淡く敷き、押すと沈みます。角は部品の角（Button と同じ）です。
      </p>
      <p>
        おすすめは現行版（本文の太さ・狭い余白）を既定にすることです。メニューの帯は項目の名前が短く数が多いので、太字や広い余白は重くなります。高さは部品の高さのままにし、指でも押せる大きさを保ちます。C
        の小さい段は、帯を低く詰めたいときのために Button の size
        と同じ形で選べるようにする案です（既定にはしない）。どれを既定にし、ほかに選べるようにするものがあるか教えてください。
      </p>
    </Comparison>
  ),
};
