import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { PaletteFrame, scrollableDecorator } from './command-palette-axis-parts';

// 軸 590: CommandPalette の面の位置と幅
const meta = {
  title: 'Design Review/590 CommandPalette の面の位置と幅',
  id: 'design-review-590-command-palette-position',
  parameters: { layout: 'fullscreen' },
  decorators: [scrollableDecorator],
  args: { pick: 'current,B,C' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const top = 'max(var(--dialog-margin), 12dvh)';

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '上寄せ・560px',
    intent:
      '画面の上寄り（高さの 12%）に置く。打って候補が減っても、検索欄の位置は動かない。幅は Dialog の md より一回り広く、ショートカットと 2 行目が並んでも窮屈にならない',
    spec: [
      ['位置', '上寄せ（画面の高さの 12%）'],
      ['幅', '560px'],
    ],
    tokens: {
      '--command-palette-align': 'start',
      '--command-palette-offset': top,
      '--command-palette-width': 'calc(var(--spacing) * 140)',
    },
  },
  {
    id: 'A',
    name: '中央・560px',
    intent:
      'Dialog と同じく、画面の上下の中央に置く。打って候補が減ると面が縮み、検索欄が上下に動く',
    spec: [
      ['位置', '中央'],
      ['幅', '560px'],
    ],
    tokens: {
      '--command-palette-align': 'center',
      '--command-palette-offset': 'var(--dialog-margin)',
      '--command-palette-width': 'calc(var(--spacing) * 140)',
    },
  },
  {
    id: 'B',
    name: '上寄せ・480px',
    intent:
      '幅を Dialog の既定（md）とそろえる。面の大きさの段が増えない。長い文字とショートカットが並ぶと詰まる',
    spec: [
      ['位置', '上寄せ（画面の高さの 12%）'],
      ['幅', '480px（Dialog の md）'],
    ],
    tokens: {
      '--command-palette-align': 'start',
      '--command-palette-offset': top,
      '--command-palette-width': 'var(--dialog-width)',
    },
  },
  {
    id: 'C',
    name: '上寄せ・640px',
    intent:
      '幅を広くとり、候補の 2 行目や長いページ名も 1 行に収める。左の文字と右のショートカットが離れる',
    spec: [
      ['位置', '上寄せ（画面の高さの 12%）'],
      ['幅', '640px'],
    ],
    tokens: {
      '--command-palette-align': 'start',
      '--command-palette-offset': top,
      '--command-palette-width': 'calc(var(--spacing) * 160)',
    },
  },
];

const columns: Column[] = [
  {
    label: '開いた直後',
    note: '打って絞り込み、↑↓・Enter も試せます。「画面で開く」でふだんの出方（⌘K の代わり）',
  },
  { label: '「set」と打ったあと', note: '候補が 1 つに減ったとき' },
];

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={590}
      axis="CommandPalette の面の位置と幅"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) =>
        column.label === '開いた直後' ? (
          <PaletteFrame showOpenButton />
        ) : column.label.startsWith('「set」') ? (
          <PaletteFrame defaultValue="set" />
        ) : null
      }
    >
      <p>
        決定: 上寄せだけにする。幅は 560px を既定にし、480px（B）・640px（C）の段も props
        で選べる。「中央は無し、デフォルトは現行サイズで、サイズを変更できるならよさそうです。」
      </p>
      <p>
        ⌘K
        などで開く面を、画面のどこに、どの幅で置くかを選びます。面の見た目（白・細い輪郭・やわらかい影・カードの角）、行の見た目（Menu
        の項目と同じ）はどの案も同じです。
      </p>
      <p>
        並べた見本は開いたままで、打って絞り込めます。2 列目は「set」と打ったあとです。A
        では面が縮んだ分だけ検索欄が下がります。ふだんの出方は、見本の下の「画面で開く」で確かめてください。
      </p>
      <p>おすすめは現行版（上寄せ・560px）です。幅は className で変えられます。</p>
    </Comparison>
  ),
};
