import type { Meta, StoryObj } from '@storybook/react-vite';

import { Toggle, type ToggleShape } from '../../src/components/toggle/Toggle';
import { EyeIcon } from '../../src/internal/icons';
import { type Candidate, type Column, Comparison } from './Comparison';

// 軸 268: アイコンだけの Toggle の形（shape）。Button の iconOnly と同じ考えの props（square・circle）
//   候補はトークンではなく shape の指定を行ごとに変える（Comparison.tsx の「candidate は…部品の指定（props）を行ごとに変える軸で使う」）
const meta = {
  title: 'Design Review/268 アイコンだけの Toggle の形',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

const shapeOf: Record<string, ToggleShape> = { current: 'square', A: 'circle' };

const candidates: Candidate[] = [
  {
    id: 'current',
    name: 'square（部品の角）',
    intent: '文字のトグルと同じ角。Button の iconOnly の既定と同じ考え',
    spec: [['形', 'square']],
  },
  {
    id: 'A',
    name: 'circle（丸）',
    intent:
      '完全な丸。単独のアイコンボタンとして軽く見せたいときの形（Button の shape="circle" と同じ）',
    spec: [['形', 'circle']],
  },
];

const columns: Column[] = [
  { label: 'OFF' },
  { label: 'ON（filled）' },
  { label: 'ON（outline）' },
  { label: 'グループの中' },
];

export const IconShape: Story = {
  name: 'アイコンだけの形',
  render: () => (
    <Comparison
      index={268}
      axis="アイコンだけの Toggle の形（square か circle か）"
      pick="current,A"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const shape = shapeOf[candidate.id];
        if (column.label === 'グループの中')
          return (
            <div className="flex gap-2">
              <Toggle iconOnly shape={shape} aria-label="表示" color="primary" defaultPressed>
                <EyeIcon standalone />
              </Toggle>
              <Toggle iconOnly shape={shape} aria-label="非表示" color="primary">
                <EyeIcon standalone />
              </Toggle>
            </div>
          );
        if (column.label === 'ON（outline）')
          return (
            <Toggle
              iconOnly
              shape={shape}
              aria-label="表示を切り替える"
              variant="outline"
              color="primary"
              defaultPressed
            >
              <EyeIcon standalone />
            </Toggle>
          );
        return (
          <Toggle
            iconOnly
            shape={shape}
            aria-label="表示を切り替える"
            color="primary"
            defaultPressed={column.label !== 'OFF'}
          >
            <EyeIcon standalone />
          </Toggle>
        );
      }}
    >
      <p>決定: current（square）を既定にし、A（circle）も shape props で選べる。</p>
      <p>
        アイコンだけの Toggle（部品の高さの正方形）の形を選びます。square（現行版）は文字の Toggle
        と同じ角、circle は完全な丸です。Toggle は Button と同じ props
        名（iconOnly・shape）を使うので、Button と同じ既定（square）にそろえた。circle
        は、いくつも並ぶツールバーで軽く見せたいときに選べる。
      </p>
    </Comparison>
  ),
};
