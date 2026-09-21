import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { TagsInput } from '../../src/components/tags-input/TagsInput';

// 後半の軸 262: TagsInput で、Backspace（1 回目）や ← で選んだチップをどう見せるか
//   欄が空のときの Backspace は、1 回目で最後のチップを選び、2 回目で消す。選ばれていることが分からないと、
//   2 回目の Backspace で何が消えるのかが読めない
//   選んだチップには DOM のフォーカスが当たるので、候補は --tags-input-chip-selected-* の上書きだけで作る

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'キーボードのフォーカスの線だけ',
    intent:
      '枠線（outline）のボタンのフォーカスと同じ、輪郭の外側の線。線の太さ・隙間・動く長さも同じで、部品が色を持っていればその色に従う。チップの色や面はそのまま。',
    spec: [
      ['線', 'フォーカスの線（2px・外側 2px）'],
      ['線の色', '部品の色（なければ --color-focus-ring）'],
      ['面', '変えない'],
    ],
    tokens: {
      '--tags-input-chip-selected-ring-width': 'var(--focus-ring-width)',
      '--tags-input-chip-selected-ring-color': 'var(--color-focus-ring)',
      '--tags-input-chip-selected-veil': 'transparent',
    },
  },
  {
    id: 'A',
    name: 'フォーカスの線に、薄い覆いを足す',
    intent:
      '線はそのままで、チップの面に文字の色を薄く重ねる。線だけより、チップ自体が「選ばれている」と読める。',
    spec: [
      ['線', 'フォーカスの線（2px・外側 2px）'],
      ['面', '文字の色を 12% 重ねる'],
    ],
    tokens: {
      '--tags-input-chip-selected-ring-width': 'var(--focus-ring-width)',
      '--tags-input-chip-selected-ring-color': 'var(--color-focus-ring)',
      '--tags-input-chip-selected-veil': 'color-mix(in oklab, currentColor 12%, transparent)',
    },
  },
  {
    id: 'B',
    name: '覆いだけ（線なし）',
    intent:
      '線を出さず、面を濃くするだけ。欄の中に線が増えないので静かだが、キーボードの居場所としては弱い。',
    spec: [
      ['線', 'なし'],
      ['面', '文字の色を 20% 重ねる'],
    ],
    tokens: {
      '--tags-input-chip-selected-ring-width': '0px',
      '--tags-input-chip-selected-ring-color': 'transparent',
      '--tags-input-chip-selected-veil': 'color-mix(in oklab, currentColor 20%, transparent)',
    },
  },
  {
    id: 'C',
    name: '反転させる（濃い面）',
    intent:
      '面を文字の色で強く塗り、次の Backspace で消えることを強く示す。ひと目で分かる代わりに、欄の中で目立つ。',
    spec: [
      ['線', 'フォーカスの線（2px・外側 2px）'],
      ['面', '文字の色を 40% 重ねる'],
    ],
    tokens: {
      '--tags-input-chip-selected-ring-width': 'var(--focus-ring-width)',
      '--tags-input-chip-selected-ring-color': 'var(--color-focus-ring)',
      '--tags-input-chip-selected-veil': 'color-mix(in oklab, currentColor 40%, transparent)',
    },
  },
];

const columns: Column[] = [
  { label: 'ふだん', note: 'どのチップも選ばれていない' },
  { label: '最後のチップを選んだとき', note: 'Backspace の 1 回目', preview: 'focus' },
  { label: '色付き（primary）', note: '選んだとき', preview: 'focus' },
];

function renderCell(column: Column) {
  return (
    <div className="w-[280px]">
      <TagsInput
        label="記事のタグ"
        placeholder="打って Enter で足す"
        color={column.label === '色付き（primary）' ? 'primary' : 'neutral'}
        defaultValue={['デザイン', '実装', '検証']}
      />
    </div>
  );
}

const meta = {
  title: 'Design Review/262 TagsInput で選んだチップの見え方',
  id: 'design-review-262-tags-input-chip-selected',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      // 最後のチップだけを、選ばれた（フォーカスが当たった）状態に固定する
      focus: ['[data-preview="focus"] [data-slot="tags-input-chip"]:last-of-type'],
    },
  },
  args: { pick: 'current' },
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
      index={262}
      axis="TagsInput で、Backspace や ← で選んだチップをどう見せるか"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => renderCell(column)}
    >
      <p>
        <strong>決定: 現行版（キーボードのフォーカスの線だけ）</strong>
        にしました。理由は「Outline
        のボタンに揃えるイメージ」です。線の引き方・色の決め方・動く長さを、
        枠線のボタンのフォーカスにそろえてあります（ADR の番号はあとで入れます）。
      </p>
      <p>
        欄が空のときの Backspace は、1 回目で最後のチップを選び、2 回目で外します。1
        回目で何が選ばれたかが分からないと、次の Backspace で何が消えるのかが読めません（←
        でもチップへ移れます）。
      </p>
      <p>
        2 列目と 3 列目は、最後のチップを選んだ状態に固定してあります。実際に欄を押してから
        Backspace や ←
        を押しても確かめられます。色付き（primary）の列は、チップに色が付いていても読めるかを見るためのものです。
      </p>
      <p>ほかの案（A・B・C）は、決めたときの比べものとして残してあります。</p>
    </Comparison>
  ),
};
