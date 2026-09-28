import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Dropzone, type DropzoneProps } from '../../src/components/dropzone/Dropzone';

// 面か線だけかは決定済み（面＋線）。残るのは受け付けるときの色（color props）なので、
// 決定後は候補ごとに実装済みの color props を切り替える（Comparison.tsx の使い方）
const colorById: Record<string, DropzoneProps['color']> = {
  current: 'neutral',
  A: 'primary',
  B: 'secondary',
};

const candidates: Candidate[] = [
  {
    id: 'current',
    name: 'neutral（既定）',
    intent: '色を指定しないとき。受け付けるときも、色を持たないグレーの面＋線（原則6）',
    spec: [
      ['accept-bg', 'var(--color-select-neutral-selected)'],
      ['accept-border', 'var(--color-neutral-strong)'],
    ],
  },
  {
    id: 'A',
    name: 'primary',
    intent: '利用者が選ぶ色。受け付けるときは primary の淡い面と primary の線',
    spec: [
      ['accept-bg', 'var(--color-primary-subtle)'],
      ['accept-border', 'var(--color-primary)'],
    ],
  },
  {
    id: 'B',
    name: 'secondary',
    intent: '利用者が選ぶ色。受け付けるときは secondary の淡い面と secondary の線',
    spec: [
      ['accept-bg', 'var(--color-secondary-subtle)'],
      ['accept-border', 'var(--color-fg-secondary)'],
    ],
  },
];

const columns: Column[] = [{ label: '通常（ドラッグして比べる）' }];

const meta = {
  title: 'Design Review/379 ドラッグ中の色',
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Compare: Story = {
  render: () => (
    <Comparison
      index={379}
      axis="ファイルを上に持ってきたときの色"
      pick="current"
      candidates={candidates}
      columns={columns}
      renderCell={(_column, candidate) => (
        <div className="w-64">
          <Dropzone
            label="画像"
            caption="画像だけを受け付けます（image/*）"
            accept="image/*"
            color={colorById[candidate.id]}
          />
        </div>
      )}
    >
      <p>
        決定: 受け付けるときの見た目は、面＋線のまま（線だけの案は採りませんでした）。色は `color`
        props（primary・secondary・neutral）で選べるようにし、既定は色を持たない neutral
        です。受け付けないとき（危険の色）は、`color`
        によらずいつも同じです。画像ファイルをこの枠にドラッグすると受け付ける色、画像でないファイルをドラッグすると危険の色になります。行ごとに、実際にファイルをドラッグして比べてください（スクリーンショットでは撮れない、動く状態のため）。
      </p>
    </Comparison>
  ),
};
