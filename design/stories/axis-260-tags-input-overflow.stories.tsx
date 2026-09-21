import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { TagsInput } from '../../src/components/tags-input/TagsInput';

// 後半の軸 260: TagsInput で、タグが増えたときに欄がどう伸びるか
//   複数選ぶ Combobox は、選んだ項目を欄の中に折り返して並べ、欄の高さが伸びます（ADR-0217）。
//   TagsInput は打った文字がそのままタグになるので、Combobox より数が増えやすく、欄が画面を押し広げることがあります
//   はみ出す案は、素の overflow ではなく ScrollArea（軸 93）と同じ見た目にする（端の内側の影と、載せたとき・スクロール中に出るつまみ）
//   候補は --tags-input-wrap・--tags-input-max-height・--tags-input-chip-shrink・--tags-input-content-min-width の上書きだけで作る

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '折り返して、欄が伸びる',
    intent:
      '複数選ぶ Combobox と同じ。タグが増えると行が増え、欄の高さがそのまま伸びる。すべてのタグがいつも見える代わりに、下の内容が押し下げられる。',
    spec: [
      ['折り返し', 'する'],
      ['高さの上限', 'なし'],
      ['スクロール', 'なし'],
    ],
    tokens: {
      '--tags-input-wrap': 'wrap',
      '--tags-input-max-height': 'none',
    },
  },
  {
    id: 'A',
    name: '1 行のまま、横に流す',
    intent:
      '折り返さず、欄の高さは 1 行に固定する。はみ出したタグは横にスクロールして見る。欄の高さが変わらないので、下の内容が動かない。',
    spec: [
      ['折り返し', 'しない'],
      ['高さの上限', '1 行'],
      ['スクロール', '横'],
    ],
    tokens: {
      '--tags-input-wrap': 'nowrap',
      '--tags-input-max-height': 'none',
      '--tags-input-chip-shrink': '0',
      '--tags-input-content-min-width': 'max-content',
    },
  },
  {
    id: 'B',
    name: '折り返して、3 行で止める',
    intent:
      '折り返すが、およそ 3 行分の高さで止めて、そこから先は縦にスクロールする。増えはじめは現行版と同じに見え、増えすぎたときだけ止まる。',
    spec: [
      ['折り返し', 'する'],
      ['高さの上限', '部品の高さ × 2.5（およそ 3 行）'],
      ['スクロール', '縦'],
    ],
    tokens: {
      '--tags-input-wrap': 'wrap',
      '--tags-input-max-height': 'calc(var(--spacing-control) * 2.5)',
    },
  },
  {
    id: 'C',
    name: '折り返して、2 行で止める',
    intent: 'B と同じ考えで、止める高さをおよそ 2 行にする。欄が占める場所はいちばん小さい。',
    spec: [
      ['折り返し', 'する'],
      ['高さの上限', '部品の高さ × 1.75（およそ 2 行）'],
      ['スクロール', '縦'],
    ],
    tokens: {
      '--tags-input-wrap': 'wrap',
      '--tags-input-max-height': 'calc(var(--spacing-control) * 1.75)',
    },
  },
];

const few = ['デザイン', '実装'];
const many = [
  'デザイン',
  '実装',
  '検証',
  '運用',
  'ドキュメント',
  '社内ツール',
  'アクセシビリティ',
  'パフォーマンス',
  'リファクタリング',
];

const columns: Column[] = [
  { label: 'タグ 2 つ', note: '増えていないとき' },
  { label: 'タグ 9 つ', note: '増えたとき' },
  { label: 'タグ 9 つ（フォーカス中）', note: '打つ欄が見えるか', preview: 'focus' },
];

function renderCell(column: Column) {
  const values = column.label === 'タグ 2 つ' ? few : many;
  return (
    <div className="w-[280px]">
      <TagsInput
        label="記事のタグ"
        caption="下の内容が、どれだけ押し下げられるか"
        placeholder="打って Enter で足す"
        defaultValue={values}
      />
      <p className="pt-3 text-xs text-fg-subtle">この下に続く内容</p>
    </div>
  );
}

const meta = {
  title: 'Design Review/260 TagsInput のタグが増えたときの欄',
  id: 'design-review-260-tags-input-overflow',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      focusWithin: ['[data-preview="focus"] [data-slot="control"]'],
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
      index={260}
      axis="TagsInput で、タグが増えたときに欄がどう伸びるか"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => renderCell(column)}
    >
      <p>
        <strong>決定: 現行版（折り返して、欄が伸びる）を既定</strong>
        にし、行数は
        props（`maxRows`）で指定できるようにしました。指定した行数で欄の高さが止まり、あふれた分は
        B・C と同じ見た目（ScrollArea の端の影とつまみ）で縦にスクロールします。`maxRows={1}` は A
        と同じで、 折り返さずに 1 行のまま横にスクロールします（ADR の番号はあとで入れます）。
      </p>
      <p>
        複数選ぶ Combobox は、選んだ項目を欄の中に折り返して並べ、欄の高さが伸びます（ADR-0217）。
        TagsInput
        は打った文字がそのままタグになるので、選択肢の数に縛られず、欄が画面を押し広げることがあります。
      </p>
      <p>
        どの案でも、タグの大きさと並びは Combobox
        と同じです。違うのは、欄の高さを止めるかどうかと、止めたときにどちらへ流すかだけです。
        実際にタグを足したり外したりして、欄の下の内容がどれだけ動くかを見てください。
      </p>
      <p>
        A・B・C は、決めたときの比べものとして残してあります（いまは `maxRows`
        で同じ形になります）。
      </p>
    </Comparison>
  ),
};
