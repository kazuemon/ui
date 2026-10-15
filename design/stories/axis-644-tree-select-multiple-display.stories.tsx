import type { Meta, StoryObj } from '@storybook/react-vite';

import type { TreeSelectControlProps } from '../../src/components/tree-select/TreeSelect';
import type { TreeSelectItem } from '../../src/components/tree-select/tree-select-items';
import { docTree } from '../../src/components/tree-select/tree-select-samples';
import { CaretRightIcon } from '../../src/internal/icons';
import { type Candidate, type Column, Comparison } from './Comparison';
import { FieldOnly, OpenFrame, scrollableDecorator } from './tree-select-axis-parts';

// 軸 644: TreeSelect（複数選ぶ形）の欄に出す文
const meta = {
  title: 'Design Review/644 TreeSelect の複数の出し方',
  id: 'design-review-644-tree-select-multiple-display',
  parameters: { layout: 'fullscreen' },
  decorators: [scrollableDecorator],
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
type Story = StoryObj<{ pick: string }>;

// 値から名前を引く表（A を renderValue で描くため）
const labels = new Map<string, string>();
const collect = (items: TreeSelectItem[]) => {
  for (const item of items) {
    labels.set(item.value, item.label);
    if (item.children) collect(item.children);
  }
};
collect(docTree);

// 決めたあとの props で、各案を描く。A（文でつなぐ）は部品に持たせず、renderValue で描く
type Shown = Pick<
  TreeSelectControlProps<string, true>,
  'valueDisplay' | 'separator' | 'renderValue'
>;
const display: Record<string, Shown> = {
  現行版: {},
  A: {
    renderValue: (values) => (
      <span className="min-w-0 truncate">
        {values.map((value) => labels.get(value) ?? value).join('、')}
      </span>
    ),
  },
  B: { valueDisplay: 'path' },
  C: { valueDisplay: 'path', separator: <CaretRightIcon className="size-[0.9em]" /> },
};

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
  {
    id: 'B',
    name: 'チップにパス（選べる形）',
    intent:
      '決めたあとに足した形。valueDisplay="path" で、チップに親からのパスを出す（親と区切りは一段淡く）。同じ名前の行が別の枝にあるときに使う',
    spec: [
      ['欄の文', 'チップ（「デザイン / 原則」）'],
      ['props', 'valueDisplay="path"'],
    ],
  },
  {
    id: 'C',
    name: '区切りを変える（選べる形）',
    intent:
      '決めたあとに足した形。separator に文字やアイコンを渡すと、区切りの見た目を変えられる（null で区切らない）。Cascader と同じ名前と型',
    spec: [
      ['欄の文', 'チップ（「デザイン › 原則」）'],
      ['props', 'separator={<アイコン>}'],
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
        const shown = display[candidate.id] as object;
        return column.label === '2 件' ? (
          <OpenFrame
            props={{
              multiple: true,
              ...shown,
              defaultValue: ['principles', 'tokens'],
              defaultExpanded: ['design'],
            }}
          />
        ) : (
          <FieldOnly props={{ multiple: true, ...shown, defaultValue: many }} />
        );
      }}
    >
      <p>
        決定: 現行版（チップ・名前だけ）を既定にする。チップの文も 1 つ選ぶ形と同じ valueDisplay
        に従い、&quot;path&quot; でパスを出せる（B）。区切りは separator
        で差し替えられる（C。既定は「/」、null で区切らない）。中身をすべて差し替えるときは Select
        と同じ renderValue を渡す（A
        はこれで描ける。部品の選べる形としては持たない）。「現行版で、チップに親名を表示するかをカスタムできると良さそうですが、カスタムレンダラがいいですかね？（他で使えるようにしてましたっけ）」
      </p>
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
