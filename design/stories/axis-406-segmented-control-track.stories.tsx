import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  SegmentedControl,
  SegmentedControlItem,
  type SegmentedControlVariant,
} from '../../src/components/segmented-control/SegmentedControl';

// 軸 406: SegmentedControl の溝の見せ方（塗りと輪郭）。置く地を変えた列で比べる
const meta = {
  title: 'Design Review/406 SegmentedControl の溝',
  id: 'design-review-406-segmented-control-track',
  parameters: { layout: 'fullscreen' },
  args: { pick: '現行版,B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', '現行版,B'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '入力欄のグレー',
    intent:
      '溝を入力欄と同じグレーにする（ラジオの仲間なので入力欄の仲間の塗り）。グレーの面の上では、溝と地の差が小さくなる',
    spec: [
      ['溝の塗り', '入力欄のグレー'],
      ['輪郭', 'なし'],
    ],
    tokens: {
      '--segmented-control-track-bg': 'var(--color-field)',
      '--segmented-control-track-border-width': '0px',
    },
  },
  {
    id: 'A',
    name: '一段濃いグレー',
    intent:
      '溝を入力欄の prefix・スイッチの OFF と同じ、一段濃いグレーにする。白いつまみとの差が大きく、グレーの面の上でも溝が見える',
    spec: [
      ['溝の塗り', '入力欄の prefix のグレー'],
      ['輪郭', 'なし'],
    ],
    tokens: {
      '--segmented-control-track-bg': 'var(--color-field-addon)',
      '--segmented-control-track-border-width': '0px',
    },
  },
  {
    id: 'B',
    name: '塗らずに細い線で囲む',
    intent:
      '溝を塗らず、細い境界線で囲む。どの地に置いても同じに見える（原則6 の「地が変わるものは白い面と細い縁」に近い）。白いつまみは影だけで浮く',
    spec: [
      ['溝の塗り', 'なし'],
      ['輪郭', '細い境界線'],
    ],
    tokens: {
      '--segmented-control-track-bg': 'transparent',
      '--segmented-control-track-border-width': 'var(--border-width-thin)',
    },
  },
];

const columns: Column[] = [
  { label: '白い地', note: 'surface（既定のつまみ）' },
  { label: 'グレーの面の上', note: 'surface' },
  { label: '白い地・filled', note: 'Primary の塗りのつまみ' },
];

function Sample({ variant }: { variant: SegmentedControlVariant }) {
  return (
    <SegmentedControl<string>
      accessibleName="表示"
      defaultValue="board"
      variant={variant}
      color={variant === 'filled' ? 'primary' : 'neutral'}
    >
      <SegmentedControlItem value="board">ボード</SegmentedControlItem>
      <SegmentedControlItem value="table">表</SegmentedControlItem>
      <SegmentedControlItem value="calendar">カレンダー</SegmentedControlItem>
    </SegmentedControl>
  );
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={406}
      axis="SegmentedControl の溝"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => {
        if (column.label === 'グレーの面の上')
          return (
            <div className="w-fit rounded-card bg-field p-4">
              <Sample variant="surface" />
            </div>
          );
        return <Sample variant={column.label === '白い地・filled' ? 'filled' : 'surface'} />;
      }}
    >
      <p>
        決定: 現行版（入力欄のグレー・輪郭なし）を既定にし、B（塗らずに細い線で囲む）も
        frame="outline" で選べる（ADR は記録のときに振る）。
      </p>
      <p>
        つまみを載せる溝の見せ方を選びます。白い地と、コードの枠や読み込み中の面のようなグレーの面の上に置いたときを並べています。
      </p>
      <p>既定にする案と、ほかにも選べるようにする案があれば教えてください。</p>
    </Comparison>
  ),
};
