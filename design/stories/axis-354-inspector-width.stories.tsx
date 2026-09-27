import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { InspectorArea } from './inspector-frame';

// 軸 354: Inspector の幅の既定
//   候補は design/tokens.css の --inspector-width の上書きだけで作る

const columns: Column[] = [
  { label: 'push（領域 720px）', note: '「詳細」を押すと開閉を試せます' },
  { label: 'overlay（領域 720px）' },
];

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '320px',
    intent: '欄やトグルを 1 列に並べて読みやすく、本文の幅も残る幅。',
    spec: [['幅', '320px']],
    tokens: { '--inspector-width': 'calc(var(--spacing) * 80)' },
  },
  {
    id: 'A',
    name: '360px（Drawer の横のパネルと同じ）',
    intent:
      '画面の横から出す Drawer と同じ幅。対になる Drawer と中身を入れ替えても、折り返しが変わらない。',
    spec: [['幅', '360px']],
    tokens: { '--inspector-width': 'calc(var(--spacing) * 90)' },
  },
  {
    id: 'B',
    name: '280px',
    intent: '本文を広く残すことを優先した細い幅。長いラベルは折り返しやすくなる。',
    spec: [['幅', '280px']],
    tokens: { '--inspector-width': 'calc(var(--spacing) * 70)' },
  },
];

function renderCell(column: Column) {
  return (
    <InspectorArea
      presentation={column.label.startsWith('overlay') ? 'overlay' : 'push'}
      width="w-[720px]"
    />
  );
}

const meta = {
  title: 'Design Review/354 Inspectorの幅',
  id: 'design-review-354-inspector-width',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
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

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={354}
      axis="Inspector の幅"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={renderCell}
    >
      <p>
        Inspector の既定の幅を決めます。使う側は --inspector-width
        で変えられます。重ねる形では、狭い領域で本文の側に少し残して縮みます。
      </p>
      <p>どれを既定にするかを選んでください。</p>
    </Comparison>
  ),
};
