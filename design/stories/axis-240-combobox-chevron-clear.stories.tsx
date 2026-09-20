import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  Combobox,
  type ComboboxItem,
  type ComboboxProps,
} from '../../src/components/combobox/Combobox';
import { statePseudo } from '../../src/stories/story-states';

// 後半の軸 240: Combobox の欄の右端で、▼ と ✕ をどう並べるか
//   ▼ は塗りのないアイコン（押せない・説明。原則 8、ADR-0190）、✕ はグレー地のボタン（押せる）
//   候補は部品の props（chevron）で行ごとに変える

const items: ComboboxItem[] = [
  { label: '東京', value: 'tokyo' },
  { label: '大阪', value: 'osaka' },
  { label: '福岡', value: 'fukuoka' },
];

type Look = Pick<ComboboxProps, 'chevron'>;

const looks: Record<string, Look> = {
  現行版: { chevron: 'show' },
  A: { chevron: 'empty-only' },
  C: { chevron: 'hide' },
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '値 … ▼ ✕（グレーの ✕ が端）',
    intent: '▼ はいつも出し、値があるときは右にグレー地の ✕ が端に接して並ぶ。',
    spec: [['chevron', 'show']],
  },
  {
    id: 'A',
    name: '値があるときは ✕ だけ',
    intent: '空のときは ▼、値があるときは ▼ を隠して ✕ だけにする。端に出るのは常に 1 つ。',
    spec: [['chevron', 'empty-only']],
  },
  {
    id: 'C',
    name: '▼ を出さない',
    intent: '▼ をやめ、欄のどこを押しても開く。値があるときだけグレーの ✕ が端に出る。',
    spec: [['chevron', 'hide']],
  },
];

const columns: Column[] = [
  { label: '空' },
  { label: '値あり' },
  { label: 'フォーカス（値あり）', preview: 'focus' },
  { label: '複数（チップ）' },
  { label: '複数・読み取り専用' },
  { label: '複数・押せない' },
  { label: '読み取り専用' },
  { label: '押せない' },
  { label: 'エラー' },
];

function cellBody(column: Column, look: Look) {
  const common = { items, label: '出身地', ...look };
  switch (column.label) {
    case '空':
      return <Combobox {...common} placeholder="選ぶ" />;
    case '値あり':
      return <Combobox {...common} defaultValue="tokyo" defaultInputValue="東京" />;
    case 'フォーカス（値あり）':
      return <Combobox {...common} defaultValue="osaka" defaultInputValue="大阪" />;
    case '複数（チップ）':
      return <Combobox {...common} multiple defaultValue={['tokyo', 'osaka']} />;
    case '複数・読み取り専用':
      return <Combobox {...common} multiple readOnly defaultValue={['tokyo', 'osaka']} />;
    case '複数・押せない':
      return <Combobox {...common} multiple disabled defaultValue={['tokyo', 'osaka']} />;
    case '読み取り専用':
      return <Combobox {...common} readOnly defaultValue="tokyo" defaultInputValue="東京" />;
    case '押せない':
      return <Combobox {...common} disabled defaultValue="tokyo" defaultInputValue="東京" />;
    default:
      return (
        <Combobox
          {...common}
          defaultValue="tokyo"
          defaultInputValue="東京"
          error="選び直してください"
        />
      );
  }
}

// 欄の幅を固定する。列が中身の最小幅まで縮むと、✕ のない欄だけ ✕ の分だけ狭くなり、比べにくいため
function cell(column: Column, look: Look) {
  return <div className="w-72">{cellBody(column, look)}</div>;
}

interface Args {
  pick: string;
}

const meta = {
  title: 'Design Review/240 Combobox の ▼ と ✕',
  id: 'design-review-240-combobox-chevron-clear',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({ focusWithin: '[data-slot="control"]' }),
  },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'C'],
    },
  },
} satisfies Meta<Args>;

export default meta;

export const Candidates: StoryObj<Args> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={240}
      axis="Combobox の ▼ と ✕"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => cell(column, looks[candidate.id])}
    >
      <p>
        欄の右端の ▼（塗りのないアイコン＝押せない）と
        ✕（グレー地のボタン＝押せる）の並べ方を選びます。
      </p>
      <p>どれを既定にするか、ほかに props で選べるようにしたい案があれば教えてください。</p>
    </Comparison>
  ),
};
