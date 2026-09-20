import type { Meta, StoryObj } from '@storybook/react-vite';

import { Combobox, type ComboboxItem } from '../../src/components/combobox/Combobox';
import { type Candidate, type Column, Comparison } from './Comparison';

const items: ComboboxItem[] = [
  { label: 'デザイン', value: 'design' },
  { label: 'フロントエンド', value: 'frontend' },
  { label: 'バックエンド', value: 'backend' },
  { label: 'インフラ', value: 'infra' },
  { label: 'ライティング', value: 'writing' },
  { label: 'アクセシビリティ', value: 'a11y' },
  { label: 'テスト', value: 'test' },
  { label: 'データ分析', value: 'data' },
  { label: 'プロダクト管理', value: 'pm' },
  { label: 'マーケティング', value: 'mk' },
  { label: 'アクセシビリティとインクルーシブデザインの実践', value: 'long' },
];

const five = ['design', 'frontend', 'backend', 'infra', 'writing'];
const many = [
  'design',
  'frontend',
  'backend',
  'infra',
  'writing',
  'a11y',
  'test',
  'data',
  'pm',
  'mk',
  'design2',
].filter((v) => v !== 'design2');

const columns: Column[] = [
  { label: '長いラベル 1 つ', note: '幅の切り方を見る' },
  { label: '5 つ（折り返し）' },
  { label: '10 個（3 行）', note: '消す ✕ の縦位置は今のまま' },
  { label: 'readOnly' },
  { label: 'disabled' },
  { label: 'error' },
  { label: '指（coarse 52px）', note: '密度を固定' },
];

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '現行版',
    intent: '高さは欄より 8px 低い。幅は切らない（新しい既定。欄の幅を超えるときだけ … で省略）。',
    spec: [
      ['高さ', 'control − 8px'],
      ['最大幅', '切らない（chipMaxWidth なし）'],
    ],
  },
  {
    id: 'A',
    name: '高さ そのまま',
    intent: 'チップの高さを欄と同じ 44px にする。',
    spec: [
      ['高さ', 'control (44px)'],
      ['最大幅', '切らない'],
    ],
    tokens: { '--combobox-chip-height': 'var(--spacing-control)' },
  },
  {
    id: 'B',
    name: '高さ −12px',
    intent: 'チップをさらに低くして、3 行でも欄が伸びすぎないようにする。',
    spec: [
      ['高さ', 'control − 12px'],
      ['最大幅', '切らない'],
    ],
    tokens: { '--combobox-chip-height': 'calc(var(--spacing-control) - var(--spacing) * 3)' },
  },
  {
    id: 'C',
    name: '最大幅 120px',
    intent: 'chipMaxWidth="120px"。長いラベルを早めに切り、1 行に入る数を増やす。',
    spec: [
      ['高さ', 'control − 8px'],
      ['最大幅', '120px（chipMaxWidth）'],
    ],
  },
  {
    id: 'D',
    name: '最大幅 160px',
    intent: 'chipMaxWidth="160px"。これまでの既定と同じ切り方を、指定したときだけ。',
    spec: [
      ['高さ', 'control − 8px'],
      ['最大幅', '160px（chipMaxWidth）'],
    ],
  },
];

function Cell({ column, candidate }: { column: Column; candidate: Candidate }) {
  const maxWidths: Record<string, string> = { C: '120px', D: '160px' };
  const base = {
    label: '得意なこと',
    items,
    multiple: true,
    chipMaxWidth: maxWidths[candidate.id],
  } as const;
  const w = (n: React.ReactNode) => <div className="w-96">{n}</div>;
  switch (column.label) {
    case '長いラベル 1 つ':
      return w(<Combobox {...base} defaultValue={['long', 'design']} />);
    case '5 つ（折り返し）':
      return w(<Combobox {...base} defaultValue={five} />);
    case '10 個（3 行）':
      return w(<Combobox {...base} defaultValue={many} />);
    case 'readOnly':
      return w(<Combobox {...base} readOnly defaultValue={['design', 'long']} />);
    case 'disabled':
      return w(<Combobox {...base} disabled defaultValue={['design', 'long']} />);
    case 'error':
      return w(
        <Combobox {...base} error="1 つ以上選んでください" defaultValue={['design', 'long']} />
      );
    default:
      return (
        <div data-density="coarse" className="w-96" data-candidate={candidate.id}>
          <Combobox {...base} defaultValue={['long', 'design', 'frontend']} />
        </div>
      );
  }
}

const meta = {
  title: 'Design Review/241 Combobox のチップ',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Candidates: Story = {
  name: 'candidates',
  render: () => (
    <Comparison
      index={241}
      axis="Combobox（multiple）のチップ"
      pick="current"
      columns={columns}
      candidates={candidates}
      renderCell={(column, candidate) => <Cell column={column} candidate={candidate} />}
    >
      <p>
        行は 現行版 → 高さ（A・B）→ 最大幅（C・D は chipMaxWidth
        prop）の順。最大幅は既定では切らず、prop
        で指定したときだけ切ります。高さの既定はどれにしますか。
      </p>
      <p>
        「10 個」の列は、欄が 3 行に伸びたときの ✕ の縦位置を見るためです（部品は変えていません）。
      </p>
    </Comparison>
  ),
};
