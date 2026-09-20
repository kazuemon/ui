import type { Meta, StoryObj } from '@storybook/react-vite';

import { Stack, type StackGap } from '../../src/components/stack/Stack';
import { Tag } from '../../src/components/tag/Tag';
import { type Candidate, Comparison } from './Comparison';

// 軸 230: Stack の間隔の段の名前と数。値は tokens.css の --stack-gap-*（尺度 --spacing の倍数）
const meta = {
  title: 'Design Review/230 Stack の間隔の段',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

const steps: Record<string, StackGap[]> = {
  current: ['xs', 'sm', 'md', 'lg', 'xl'],
  B: ['sm', 'md', 'lg'],
  C: ['sm', 'md', 'lg', 'xl'],
};

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '5 段（xs〜xl）',
    intent:
      'ラベルとキャプションの詰まり（xs）から、節どうし（xl）まで。名前は Tailwind の尺度名と同じで、既定は md',
    spec: [
      ['段', 'xs 4・sm 8・md 16・lg 24・xl 40'],
      ['既定', 'md'],
    ],
  },
  {
    id: 'B',
    name: '3 段（sm・md・lg）',
    intent: '迷いにくいが、細かい詰まりと広い節の切れ目は、Tailwind の gap で補うことになる',
    spec: [
      ['段', 'sm 8・md 16・lg 32'],
      ['既定', 'md'],
    ],
    tokens: { '--stack-gap-lg': 'calc(var(--spacing) * 8)' },
  },
  {
    id: 'C',
    name: '4 段（sm〜xl）',
    intent: '8 の倍数に寄せた 4 段。4px の詰まりは Tailwind の gap-1 に任せる',
    spec: [
      ['段', 'sm 8・md 16・lg 24・xl 48'],
      ['既定', 'md'],
    ],
    tokens: { '--stack-gap-xl': 'calc(var(--spacing) * 12)' },
  },
];

export const Gaps: Story = {
  name: '間隔の段',
  render: () => (
    <Comparison
      index={230}
      pick="current"
      axis="Stack の間隔の段の名前と数"
      candidates={candidates}
      columns={[{ label: '縦（子は 3 つ）' }, { label: '横（子は 3 つ）' }]}
      renderCell={(column, candidate) => (
        <div className="flex flex-wrap gap-6">
          {steps[candidate.id].map((gap) => (
            <div key={gap} className="flex flex-col gap-1 text-xs text-fg-subtle">
              {gap}
              <Stack
                direction={column.label.startsWith('縦') ? 'vertical' : 'horizontal'}
                gap={gap}
                className="rounded-control bg-neutral p-2"
              >
                {['あ', 'い', 'う'].map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </Stack>
            </div>
          ))}
        </div>
      )}
    >
      <p>
        決定: current（5 段、既定 md）。「名前が一般的なものと揃っていると認知負荷が少ない」。ADR
        は記録時に書きます。
      </p>
      <p>
        間隔の段の名前と数を選びます。推奨は current（5 段。名前は Tailwind
        の尺度に近く、詰まりから節の切れ目までを 1 つの部品で賄えます）。既定は md（16px）です。
      </p>
    </Comparison>
  ),
};
