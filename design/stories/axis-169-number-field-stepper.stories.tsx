import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  NumberField,
  type NumberFieldProps,
  type NumberFieldStepper,
} from '../../src/components/number-field/NumberField';

// 後半の軸 169: NumberField の増減ボタン
//   形の違いは props（stepper）なので、行ごとに renderCell で変える。トークンの上書きはない
//   縦積みの幅と ▲▼ の大きさは --number-field-stepper-width・--number-field-stepper-icon

const stepperOf: Record<string, NumberFieldStepper> = {
  現行版: 'split',
  A: 'stacked',
  C: 'none',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'B 両端に − ／ ＋',
    intent:
      '左に −、右に ＋ を、本体の端に接する塊（FieldAddonButton）で置く。値は中央に寄せる。ボタンは本体と同じ高さで、指でもマウスでも押しやすい（原則17）。「円」などの文字は塊にせず、値のすぐ右に淡い文字で置く（− 1,200 円 ＋）。',
    spec: [
      ['stepper', "'split'"],
      ['ボタン', '本体の高さ × 本体の端の塊の幅'],
      ['prefix・suffix', '値の横に淡い文字（塊にしない）'],
      ['値', '中央寄せ'],
    ],
  },
  {
    id: 'A',
    name: '右端に縦積み ▲▼',
    intent:
      '右端に細い塊を置き、上下に割って ▲ と ▼ にする。幅をとらず、値は左寄せのまま（TextField と同じ）。1 つのボタンは本体の半分の高さなので、指では押しにくい。「円」は塊のまま、ボタンの前に置く（1,200 [円][▲▼]）。',
    spec: [
      ['stepper', "'stacked'"],
      ['ボタン', '本体の半分の高さ × 32px'],
      ['prefix・suffix', 'TextField と同じ塊。suffix はボタンの前'],
      ['値', '左寄せ'],
    ],
  },
  {
    id: 'C',
    name: 'ボタンなし',
    intent:
      'ボタンを置かない。↑↓ キー・フォーカス中のホイール・ラベルを押したまま左右に動かして増減する。見た目は TextField と同じ。増減できることは見た目に出ないので、打って入れる値（金額など）に向く。指では打つしかない。',
    spec: [
      ['stepper', "'none'"],
      ['増減', '↑↓・ホイール・ラベルを左右に'],
      ['prefix・suffix', 'TextField と同じ塊'],
      ['値', '左寄せ'],
    ],
  },
];

type Cell = Column & { props: Partial<NumberFieldProps> };

const columns: Cell[] = [
  { label: '通常', props: { label: '数量', defaultValue: 3, min: 0, max: 99 } },
  {
    label: 'hover',
    preview: 'hover',
    props: { label: '数量', defaultValue: 3, min: 0, max: 99 },
  },
  {
    label: 'フォーカス',
    preview: 'focus',
    props: { label: '数量', defaultValue: 3, min: 0, max: 99 },
  },
  {
    label: '値あり（suffix 付き）',
    props: {
      label: '価格',
      defaultValue: 1200,
      step: 100,
      min: 0,
      suffix: '円',
      caption: '100 円ずつ増減します',
    },
  },
  {
    label: '上限に届いた',
    note: '＋（▲）が押せない',
    props: { label: '数量', defaultValue: 99, min: 0, max: 99, caption: '99 個まで' },
  },
  {
    label: 'エラー',
    props: { label: '数量', defaultValue: 0, min: 0, max: 99, error: '1 個以上にしてください' },
  },
  {
    label: '押せない',
    props: { label: '数量', defaultValue: 3, min: 0, max: 99, disabled: true },
  },
  {
    label: '読み取り専用',
    note: 'ボタンは出さない',
    props: { label: '数量', defaultValue: 3, min: 0, max: 99, readOnly: true },
  },
];

const meta = {
  title: 'Design Review/169 NumberField の増減ボタン',
  id: 'design-review-169-number-field-stepper',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      hover: ['[data-preview="hover"] [data-slot="control"]'],
      focusWithin: ['[data-preview="focus"] [data-slot="control"]'],
    },
  },
  args: { pick: 'current,A,C' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'C', 'current,A,C'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

const propsOf = new Map(columns.map((column) => [column.label, column.props]));

const renderCell = (column: Column, candidate: Candidate) => (
  <div className="w-60">
    <NumberField
      label="数量"
      locale="ja-JP"
      stepper={stepperOf[candidate.id]}
      {...propsOf.get(column.label)}
    />
  </div>
);

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={169}
      axis="NumberField の増減ボタン"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={renderCell}
    >
      <p>
        <strong>
          決定: 現行版（両端に −／＋）を既定にし、A（縦積み）と C（ボタンなし）も選べる形にする。
        </strong>
        スマートフォンで数を選ぶ専用の入力（シートなど）は、あとで検討します。
      </p>
      <p>
        数を入れる欄の、増減ボタンの置き方を選びます。どの案もボタンは欄の中（値に作用するボタン）で、↑↓
        キーでも増減できます。min・max に届くと、その向きのボタンが押せなくなります。
      </p>
      <p>
        既定にする案を 1 つ選んでください。ほかの案も <code>stepper</code>{' '}
        で選べる形のまま残せます。
      </p>
      <p>
        実際にボタンを押し、↑↓ キー（Shift で 10、Alt で 0.1）も試せます。C
        はラベル（「数量」）を押したまま左右に動かすと増減します。
      </p>
    </Comparison>
  ),
};

// 密度ごとの見え方。縦積みの 1 つのボタンは、指でも本体の半分の高さになる
export const Densities: StoryObj<{ pick: string }> = {
  name: '密度（指・マウス）',
  render: ({ pick }) => (
    <Comparison
      index={169}
      axis="NumberField の増減ボタン（密度）"
      pick={pick}
      candidates={candidates}
      columns={[
        { label: '指（coarse）', note: '本体 44px' },
        { label: 'マウス（fine）', note: '本体 44px' },
        { label: '大きい指', note: '本体 52px' },
      ]}
      renderCell={(column, candidate) => (
        <div
          className={['w-60', column.label === '大きい指' && 'coarse-large']
            .filter(Boolean)
            .join(' ')}
          data-density={column.label === 'マウス（fine）' ? 'fine' : 'coarse'}
        >
          <NumberField
            locale="ja-JP"
            label="価格"
            defaultValue={1200}
            step={100}
            min={0}
            suffix="円"
            stepper={stepperOf[candidate.id]}
          />
        </div>
      )}
    >
      <p>
        密度ごとの大きさです。高さはマウスも指も 44px なので、縦積みの 1 つのボタンはどちらも約 20px
        の高さになります。
      </p>
    </Comparison>
  ),
};
