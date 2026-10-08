import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { PaletteFrame, scrollableDecorator } from './command-palette-axis-parts';

// 軸 592: CommandPalette のキー操作の案内
const meta = {
  title: 'Design Review/592 CommandPalette のキー操作の案内',
  id: 'design-review-592-command-palette-key-hints',
  parameters: { layout: 'fullscreen' },
  decorators: [scrollableDecorator],
  args: { pick: 'A,current' },
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
    name: '出さない',
    intent:
      'キー操作の案内を出さない。面は検索欄と候補だけで軽い。↑↓・Enter・Esc は、Menu や選択肢と同じ慣れた操作なので書かずに済ませる',
    spec: [['案内', 'なし']],
    tokens: {
      '--command-palette-footer-display': 'none',
      '--command-palette-esc-display': 'none',
    },
  },
  {
    id: 'A',
    name: '下の帯に並べる',
    intent:
      '面の下に細い線で区切った帯を置き、「↑↓ 移動・Enter 実行・Esc 閉じる」を Kbd とキャプションの文字で並べる。初めての人にも操作が分かる。面が 1 段高くなる',
    spec: [
      ['案内', '下の帯（Kbd＋キャプション）'],
      ['読み上げ', '帯の文として読む'],
    ],
    tokens: {
      '--command-palette-footer-display': 'flex',
      '--command-palette-esc-display': 'none',
    },
  },
  {
    id: 'B',
    name: '検索欄の右に Esc だけ',
    intent:
      '検索欄の右端に Esc のキーを 1 つだけ置き、閉じ方だけを見せる。面の高さは変わらない。↑↓・Enter は書かない',
    spec: [
      ['案内', '検索欄の右端に Esc の Kbd'],
      ['読み上げ', '読まない（飾り）'],
    ],
    tokens: {
      '--command-palette-footer-display': 'none',
      '--command-palette-esc-display': 'inline-block',
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
      index={592}
      axis="CommandPalette のキー操作の案内"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) =>
        column.label === '開いた直後' ? (
          <PaletteFrame height="h-[540px]" showOpenButton />
        ) : (
          <PaletteFrame height="h-[540px]" defaultValue="記事" />
        )
      }
    >
      <p>
        決定: 下の帯の案内（A）を既定にし、出さない形（現行版）も props
        で選べる。「デフォルトAで、無も選べるでいいかなと。B の位置の Esc
        は閉じるボタンだとは直感的に分からないなと思いました（Esc × とかのボタンなら別）」
      </p>
      <p>
        キーボードの操作（↑↓ で移る・Enter で実行・Esc
        で閉じる）を、面の中に案内するかを選びます。指で操作するシートでは、どの案も出しません。
      </p>
      <p>
        候補の右端のショートカットは、Menu と同じ小さいグレーの文字です。Kbd
        の枠を並べると一覧がにぎやかになるため、案内に Kbd を使う A・B
        でも、候補の側は文字のままです。
      </p>
      <p>
        おすすめは現行版（出さない）を既定にし、A を props
        で選べるようにする形です。案内の文言（移動・実行・閉じる）は部品の操作を指す短い文なので、既定を持ち、差し替えられるようにします。
      </p>
    </Comparison>
  ),
};
