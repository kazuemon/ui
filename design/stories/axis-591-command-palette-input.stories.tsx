import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { PaletteFrame, scrollableDecorator } from './command-palette-axis-parts';

// 軸 591: CommandPalette の検索欄の見た目
const meta = {
  title: 'Design Review/591 CommandPalette の検索欄',
  id: 'design-review-591-command-palette-input',
  parameters: { layout: 'fullscreen' },
  decorators: [scrollableDecorator],
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

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '面に溶かす・56px',
    intent:
      '塗りも枠線も持たず、面の端まで使う。部品の高さより一段高くし、下の区切り線で候補と分ける。面そのものが欄に見え、開いているあいだフォーカスの枠線を出し続けない',
    spec: [
      ['塗り・枠線', 'なし'],
      ['高さ', '56px'],
      ['区切り', '下に細い線'],
    ],
    tokens: {
      '--command-palette-input-height': 'calc(var(--spacing) * 14)',
      '--command-palette-input-bg': 'transparent',
      '--command-palette-input-line-width': '0px',
      '--command-palette-input-inset': '0px',
      '--command-palette-input-radius': '0px',
      '--command-palette-divider': 'var(--border-width-thin)',
    },
  },
  {
    id: 'A',
    name: '面に溶かす・部品の高さ',
    intent:
      '現行版と同じ形で、高さを候補の行と同じ部品の高さにする。面が低くなり、欄と候補の差が小さくなる',
    spec: [
      ['塗り・枠線', 'なし'],
      ['高さ', '部品の高さ（マウス 40px・指 44px）'],
      ['区切り', '下に細い線'],
    ],
    tokens: {
      '--command-palette-input-height': 'var(--spacing-control)',
      '--command-palette-input-bg': 'transparent',
      '--command-palette-input-line-width': '0px',
      '--command-palette-input-inset': '0px',
      '--command-palette-input-radius': '0px',
      '--command-palette-divider': 'var(--border-width-thin)',
    },
  },
  {
    id: 'B',
    name: '入力欄と同じ',
    intent:
      'TextField と同じグレーの塗りの欄を、面の内側に置く。いつもフォーカスしているので、フォーカスの枠線が出続ける。区切り線は引かない',
    spec: [
      ['塗り・枠線', 'グレーの塗り・フォーカスの枠線'],
      ['高さ', '部品の高さ'],
      ['区切り', 'なし（欄の塗りで分ける）'],
    ],
    tokens: {
      '--command-palette-input-height': 'var(--spacing-control)',
      '--command-palette-input-bg': 'var(--color-field)',
      '--command-palette-input-line-width': 'var(--field-border-width)',
      '--command-palette-input-inset': 'calc(var(--spacing) * 2)',
      '--command-palette-input-radius': 'var(--radius-control)',
      '--command-palette-divider': '0px',
    },
  },
];

const columns: Column[] = [
  {
    label: '開いた直後',
    note: '打って絞り込み、↑↓・Enter も試せます。「画面で開く」でふだんの出方（⌘K の代わり）',
  },
  { label: '「記事」と打ったあと' },
];

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={591}
      axis="CommandPalette の検索欄"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) =>
        column.label === '開いた直後' ? (
          <PaletteFrame height="h-[460px]" showOpenButton />
        ) : column.label.startsWith('「記事」') ? (
          <PaletteFrame height="h-[460px]" defaultValue="記事" />
        ) : null
      }
    >
      <p>
        決定:
        現行版（面に溶かす・56px）。選べる形は作らない。「現行でいいかなと思いました。Aの高さは無しで、フォーカスについては選択肢は入力中でも上下キーで切り替えできるものなので、カーソル点滅があれば十分かなと思いました。」
      </p>
      <p>
        面の上の検索欄の見た目を選びます。虫眼鏡と打った文字の位置は、候補のアイコンと文字の左にそろえています（どの案も同じ）。
      </p>
      <p>
        面が開いているあいだ、検索欄はいつもフォーカスしています。原則 2
        ではフォーカスは枠線で表しますが、現行版・A
        は欄の形を持たず面そのものを欄として見せるので、枠線を出しません。B
        は入力欄と同じ形なので、枠線が出続けます。
      </p>
      <p>おすすめは現行版（面に溶かす・56px）です。</p>
    </Comparison>
  ),
};
