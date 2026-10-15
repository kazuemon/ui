import type { Meta, StoryObj } from '@storybook/react-vite';

import type { TreeSelectControlProps } from '../../src/components/tree-select/TreeSelect';
import { type Candidate, type Column, Comparison } from './Comparison';
import { FieldOnly, OpenFrame, scrollableDecorator } from './tree-select-axis-parts';

// 軸 643: TreeSelect（1 つ選ぶ形）の欄に出す文
const meta = {
  title: 'Design Review/643 TreeSelect の欄の文',
  id: 'design-review-643-tree-select-value-display',
  parameters: { layout: 'fullscreen' },
  decorators: [scrollableDecorator],
  args: { pick: 'A' },
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

// 決めたあとの props で、各案を描く（現行版は pathVariant="default"、B は valueDisplay="last"）
const display: Record<string, Pick<TreeSelectControlProps, 'valueDisplay' | 'pathVariant'>> = {
  現行版: { valueDisplay: 'path', pathVariant: 'default' },
  A: { valueDisplay: 'path', pathVariant: 'muted' },
  B: { valueDisplay: 'last' },
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'パス',
    intent:
      'ラフの絵のとおり、親からのパスを本文の色で出す。同じ名前の行が別の枝にあっても見分けられる。長いときは親の側から省き、選んだ行の名前を残す',
    spec: [
      ['欄の文', '「デザイン / 原則」'],
      ['親の色', '本文と同じ'],
      ['長いとき', '親の側を … で省く'],
    ],
  },
  {
    id: 'A',
    name: 'パス・親を淡く',
    intent:
      'パスを出し、親と区切りを一段淡くする（ラベルの淡い色と同じ）。選んだ行の名前が先に目に入る。読み上げは現行版と同じ',
    spec: [
      ['欄の文', '「デザイン / 原則」（親は淡く）'],
      ['親の色', '一段淡い（--color-fg-muted）'],
      ['長いとき', '親の側を … で省く'],
    ],
  },
  {
    id: 'B',
    name: '名前だけ',
    intent:
      '選んだ行の名前だけを出す（Select と同じ見え方）。短く収まるが、同じ名前の行が別の枝にあると欄だけでは見分けられない',
    spec: [
      ['欄の文', '「原則」'],
      ['親の色', '—'],
      ['長いとき', '名前の後ろを … で省く'],
    ],
  },
];

const columns: Column[] = [
  { label: '浅い行を選んだとき', note: '開いたままの面。行を押すと欄の文が変わります' },
  {
    label: '深い行・狭い欄',
    note: '「部品 / 入力 / TreeSelect」を選んだ幅 12rem の欄。押すと開きます',
  },
];

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={643}
      axis="TreeSelect の欄の文（1 つ選ぶ形）"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const shown = display[candidate.id];
        return column.label === '浅い行を選んだとき' ? (
          <OpenFrame props={{ defaultValue: 'principles', ...shown }} />
        ) : (
          <FieldOnly props={{ defaultValue: 'tree-select', ...shown }} width="w-48" />
        );
      }}
    >
      <p>
        決定: A（パス・親と区切りを一段淡く）を既定にする。親の文字色は pathVariant で選べ、default
        で現行版の形（本文と同じ色）になる。B（名前だけ）は valueDisplay=&quot;last&quot;
        で選べるまま残す。「デフォルトAで、親の文字色が選べる、でよさそう」
      </p>
      <p>
        1
        つ選ぶ形で、欄に何を出すかを選びます。どの案も、読み上げは欄の名前のあとに欄の文をそのまま読みます（現行版・A
        は「デザイン / 原則」）。
      </p>
      <p>
        複数選ぶ形のチップは、どの案でも名前だけです（パスはチップに収まらないため。出し方は軸
        644）。
      </p>
      <p>
        おすすめは現行版（パス）を既定にし、B（名前だけ）を選べるようにする形です。木を選ぶ欄は「どの枝か」が値の意味に入ることが多く、ラフの絵もパスでした。浅い木や名前が重ならない木では、B
        で Select と同じ見え方にできます。A
        は差が小さく、淡い文字が値の一部に見えにくくなるので推しません。
      </p>
    </Comparison>
  ),
};
