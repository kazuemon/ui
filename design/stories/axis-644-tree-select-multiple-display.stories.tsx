import type { Meta, StoryObj } from '@storybook/react-vite';

import type { TreeSelectMultipleDisplay } from '../../src/components/tree-select/TreeSelect';
import { type Candidate, type Column, Comparison } from './Comparison';
import { FieldOnly, OpenFrame, scrollableDecorator } from './tree-select-axis-parts';

// 軸 644: TreeSelect（複数選ぶ形）の欄に出す文
const meta = {
  title: 'Design Review/644 TreeSelect の複数の出し方',
  id: 'design-review-644-tree-select-multiple-display',
  parameters: { layout: 'fullscreen' },
  decorators: [scrollableDecorator],
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const display: Record<string, TreeSelectMultipleDisplay> = { 現行版: 'chips', A: 'text' };

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'チップ',
    intent:
      '選んだ行をチップで並べ、入りきらないと折り返して欄が伸びる（Combobox の複数選ぶ形と同じ）。何を選んだかが全部見える。チップの × は置かない（欄そのものがボタンなので、外すのは面の中で行う）',
    spec: [
      ['欄の文', 'チップ（名前）'],
      ['多いとき', '折り返して欄が伸びる'],
      ['欄の高さ', '選んだ数で変わる'],
    ],
  },
  {
    id: 'A',
    name: '文でつなぐ',
    intent:
      '名前を「、」でつなぎ、1 行に収めて後ろを … で省く（Select の複数選ぶ形と同じ）。欄の高さが変わらず、フォームの並びが動かない。多いと後ろの項目が見えない',
    spec: [
      ['欄の文', '「原則、トークン」'],
      ['多いとき', '後ろを … で省く'],
      ['欄の高さ', '変わらない'],
    ],
  },
];

const many = ['principles', 'tokens', 'adr', 'select', 'combobox', 'dialog', 'intro'];

const columns: Column[] = [
  { label: '2 件', note: '開いたままの面。行を押すと欄が変わります' },
  { label: '7 件', note: '閉じた欄。押すと開きます' },
];

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={644}
      axis="TreeSelect の複数の出し方"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const multipleDisplay = display[candidate.id];
        return column.label === '2 件' ? (
          <OpenFrame
            props={{
              multiple: true,
              multipleDisplay,
              defaultValue: ['principles', 'tokens'],
              defaultExpanded: ['design'],
            }}
          />
        ) : (
          <FieldOnly props={{ multiple: true, multipleDisplay, defaultValue: many }} />
        );
      }}
    >
      <p>
        複数選ぶ形で、選んだものを欄にどう出すかを選びます。チップの中身は名前だけです（パスは出しません）。外に渡す値を親に畳む形（軸
        646）では、畳んだ親の名前が 1 つ出ます。
      </p>
      <p>
        おすすめは現行版（チップ）を既定にし、A（文でつなぐ）を選べるようにする形です。木から選ぶものは数が増えやすく、何を選んだかを欄で確かめたい場面が多いためです。表の上の絞り込みのように、欄の高さを変えたくない場所では
        A を使います。
      </p>
    </Comparison>
  ),
};
