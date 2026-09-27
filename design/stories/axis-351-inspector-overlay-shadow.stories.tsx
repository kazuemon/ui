import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { InspectorArea } from './inspector-frame';

// 軸 351: 重ねる形（overlay）の Inspector の影と輪郭の強さ
//   候補は design/tokens.css の --inspector-overlay-shadow-*・--inspector-overlay-line-width の上書きだけで作る

const columns: Column[] = [
  { label: '右に重ねる', note: '「詳細」を押すと開閉を試せます' },
  { label: '左に重ねる' },
];

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'Drawer の横のパネルと同じ',
    intent:
      '画面の横から出す Drawer と同じ、やわらかく広い影（本文の側へ）と、本文の側の細い輪郭。領域の中でも「重なる面」として同じ高さに見せる（原則1）。',
    spec: [
      ['影', '8px 0 24px / 12%（本文の側へ）'],
      ['輪郭', '本文の側に 1px'],
    ],
    tokens: {
      '--inspector-overlay-shadow-left': '8px 0 24px rgb(from var(--color-shadow) r g b / 0.12)',
      '--inspector-overlay-shadow-right': '-8px 0 24px rgb(from var(--color-shadow) r g b / 0.12)',
      '--inspector-overlay-line-width': 'var(--border-width-thin)',
    },
  },
  {
    id: 'A',
    name: '影を小さく淡く',
    intent:
      '画面の最上層ではなく領域の中に留まる面なので、Drawer より一段低く見せる。影を Affix の帯（ページに貼り付いた面）と同じ程度に抑え、輪郭は残す。',
    spec: [
      ['影', '4px 0 16px / 8%（本文の側へ）'],
      ['輪郭', '本文の側に 1px'],
    ],
    tokens: {
      '--inspector-overlay-shadow-left': '4px 0 16px rgb(from var(--color-shadow) r g b / 0.08)',
      '--inspector-overlay-shadow-right': '-4px 0 16px rgb(from var(--color-shadow) r g b / 0.08)',
      '--inspector-overlay-line-width': 'var(--border-width-thin)',
    },
  },
  {
    id: 'B',
    name: '影だけ（輪郭なし）',
    intent:
      '影は Drawer と同じにし、輪郭を外す。白い面を白い地に浮かせるので、縁は影だけで見せることになる（原則1 の「白いものは細い輪郭を足す」から外れる案）。',
    spec: [
      ['影', '8px 0 24px / 12%（本文の側へ）'],
      ['輪郭', 'なし'],
    ],
    tokens: {
      '--inspector-overlay-shadow-left': '8px 0 24px rgb(from var(--color-shadow) r g b / 0.12)',
      '--inspector-overlay-shadow-right': '-8px 0 24px rgb(from var(--color-shadow) r g b / 0.12)',
      '--inspector-overlay-line-width': '0px',
    },
  },
];

function renderCell(column: Column) {
  return (
    <InspectorArea presentation="overlay" side={column.label.startsWith('左') ? 'left' : 'right'} />
  );
}

const meta = {
  title: 'Design Review/351 Inspectorの重なりの影',
  id: 'design-review-351-inspector-overlay-shadow',
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
      index={351}
      axis="Inspector を重ねるときの影と輪郭"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={renderCell}
    >
      <p>
        Inspector を overlay
        で開いたときの、本文との離し方を決めます。重なる面には影を付けます（原則1）が、 Inspector
        は画面の最上層ではなく領域の中に留まるので、Drawer と同じ強さでよいかを比べます。
      </p>
      <p>どれを既定にするかを選んでください。</p>
    </Comparison>
  ),
};
