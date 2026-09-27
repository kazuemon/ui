import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { InspectorArea } from './inspector-frame';

// 軸 352: 重ねる形（overlay）の Inspector の角と、領域の端からの離れ
//   候補は design/tokens.css の --inspector-overlay-inset・--inspector-overlay-radius-*・--inspector-overlay-edge-line-width の上書きだけで作る

const columns: Column[] = [
  { label: '右に重ねる', note: '「詳細」を押すと開閉を試せます' },
  { label: '左に重ねる' },
];

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '端に着け、本文の側だけ丸める',
    intent:
      '領域の端に着け、本文の側の角だけカードの角に丸める。Drawer の横のパネルと同じ形（原則5: 自分で場所を占める面は一段大きい角）。',
    spec: [
      ['端からの離れ', '0'],
      ['本文の側の角', 'カードの角'],
      ['端の側の角', '0'],
      ['上下・端の側の輪郭', 'なし'],
    ],
    tokens: {
      '--inspector-overlay-inset': '0px',
      '--inspector-overlay-radius-inner': 'var(--radius-card)',
      '--inspector-overlay-radius-outer': '0px',
      '--inspector-overlay-edge-line-width': '0px',
    },
  },
  {
    id: 'A',
    name: '端に着け、角を丸めない',
    intent:
      '領域の端に着け、角も丸めない。領域の上下の端と角がそろい、アプリの枠の一部として見える。重なる面であることは影だけで伝える。',
    spec: [
      ['端からの離れ', '0'],
      ['本文の側の角', '0'],
      ['端の側の角', '0'],
      ['上下・端の側の輪郭', 'なし'],
    ],
    tokens: {
      '--inspector-overlay-inset': '0px',
      '--inspector-overlay-radius-inner': '0px',
      '--inspector-overlay-radius-outer': '0px',
      '--inspector-overlay-edge-line-width': '0px',
    },
  },
  {
    id: 'B',
    name: '端から離して浮かべる',
    intent:
      '領域の端から少し離し、4 つの角をすべてカードの角に丸め、輪郭を一周させる。領域の中に浮かんだカードに見え、画面の端から出る Drawer とは形で見分けられる。',
    spec: [
      ['端からの離れ', '8px'],
      ['本文の側の角', 'カードの角'],
      ['端の側の角', 'カードの角'],
      ['上下・端の側の輪郭', '1px'],
    ],
    tokens: {
      '--inspector-overlay-inset': 'calc(var(--spacing) * 2)',
      '--inspector-overlay-radius-inner': 'var(--radius-card)',
      '--inspector-overlay-radius-outer': 'var(--radius-card)',
      '--inspector-overlay-edge-line-width': 'var(--border-width-thin)',
    },
  },
];

function renderCell(column: Column) {
  return (
    <InspectorArea variant="overlay" side={column.label.startsWith('左') ? 'left' : 'right'} />
  );
}

const meta = {
  title: 'Design Review/352 Inspectorの重なりの形',
  id: 'design-review-352-inspector-overlay-shape',
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
      index={352}
      axis="Inspector を重ねるときの角と端からの離れ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={renderCell}
    >
      <p>
        Inspector を overlay
        で開いたときの形を決めます。押しのける形（push）は領域の端に着いた角のない面で、
        ここで決めるのは重ねる形だけです。
      </p>
      <p>どれを既定にするかを選んでください。</p>
    </Comparison>
  ),
};
