import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { NavbarSample } from './navigation-menu-axis-parts';

// 軸 561: NavigationMenu の面（浮かべるか、帯から続けるか）
const meta = {
  title: 'Design Review/561 NavigationMenu の面',
  id: 'design-review-561-navigation-menu-surface',
  parameters: { layout: 'fullscreen' },
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
type Story = StoryObj<{ pick: string }>;

// 帯の下の線の位置: 開くボタンの下から帯の下端まで（帯の高さと部品の高さの差の半分）と、下の線の太さ
const toBandEdge =
  'calc((var(--navbar-height) - var(--spacing-control)) / 2 + var(--border-width-thin))';

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'Popover と同じ浮かぶ面',
    intent:
      '押して開く吹き出しと同じ。開くボタンから 4px 離して浮かべ、角は部品の角。部品に付いて出る面として扱う（原則5）',
    spec: [
      ['ボタンとの間', '4px'],
      ['角', '部品の角（12px）'],
      ['上の輪郭', 'あり'],
    ],
    tokens: {
      '--navigation-menu-offset': 'var(--spacing)',
      '--navigation-menu-radius': 'var(--radius-control)',
      '--navigation-menu-radius-top': 'var(--radius-control)',
      '--navigation-menu-border-top': 'var(--border-width-thin)',
    },
  },
  {
    id: 'A',
    name: 'カードの角で浮かべる',
    intent:
      '面が大きいので、自分で場所を占める面としてカードの角にする（原則5）。ボタンとの間も少し広げる',
    spec: [
      ['ボタンとの間', '8px'],
      ['角', 'カードの角（16px）'],
      ['上の輪郭', 'あり'],
    ],
    tokens: {
      '--navigation-menu-offset': 'calc(var(--spacing) * 2)',
      '--navigation-menu-radius': 'var(--radius-card)',
      '--navigation-menu-radius-top': 'var(--radius-card)',
      '--navigation-menu-border-top': 'var(--border-width-thin)',
    },
  },
  {
    id: 'B',
    name: '帯の下の線から下げる',
    intent:
      '帯の下の線にぴったり着け、上の角は丸めず輪郭も引かない。帯から続く面として見せる（原則5: 領域の端に着けて開くパネルは自分では丸めない）',
    spec: [
      ['ボタンとの間', '帯の下の線まで（12px + 線）'],
      ['角', '上は 0・下は部品の角（12px）'],
      ['上の輪郭', 'なし（帯の線とつなぐ）'],
    ],
    tokens: {
      '--navigation-menu-offset': toBandEdge,
      '--navigation-menu-radius': 'var(--radius-control)',
      '--navigation-menu-radius-top': '0px',
      '--navigation-menu-border-top': '0px',
    },
  },
];

const columns: Column[] = [
  { label: 'Works を開いたところ', note: '1 列・アイコンと説明' },
  { label: 'Blog を開いたところ', note: '2 列・見出しでまとめる' },
];

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={561}
      axis="NavigationMenu の面"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <NavbarSample open={column.label.startsWith('Works') ? 'works' : 'blog'} />
      )}
    >
      <p>
        決定: 現行版（Popover と同じ浮かぶ面）のみ。帯から続く面は作らない（ADR-0485）。「見た目上
        popover と同じなので、現行版でいいかなと思いました。」
      </p>
      <p>
        帯の項目から開く面を、Popover
        と同じ浮かぶ面にするか、帯から続く面にするかを選びます。どの案も、面の白・細い輪郭・重なる面の影は同じです。
      </p>
      <p>
        変えているのは、開くボタンとの間・角・上の輪郭だけです。Storybook
        の画面では、帯の項目に載せて項目を移ると、面の大きさが変わる様子も見られます。
      </p>
    </Comparison>
  ),
};
