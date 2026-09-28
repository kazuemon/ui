import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Dropzone, type DropzoneVariant } from '../../src/components/dropzone/Dropzone';

// 決定後は、候補ごとの見た目を実装済みの variant props で切り替える（Comparison.tsx の使い方）
const variantById: Record<string, DropzoneVariant> = {
  current: 'dashed',
  A: 'outline',
  B: 'filled',
};

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '点線（dashed）',
    intent:
      '塗りを持たず、3:1 の輪郭の点線で場所だけを示す（読み取り専用の入力欄の輪郭と近い書き方）',
    spec: [
      ['border-style', 'dashed'],
      ['border-color', 'var(--color-line-strong)'],
      ['bg', 'transparent'],
    ],
  },
  {
    id: 'A',
    name: '実線（outline）',
    intent: '点線と同じ太さ・色で、実線にする',
    spec: [
      ['border-style', 'solid'],
      ['border-color', 'var(--color-line-strong)'],
      ['bg', 'transparent'],
    ],
  },
  {
    id: 'B',
    name: '面だけ（filled）',
    intent: '枠線を持たず、入力欄と同じグレーの塗り（原則8）だけで場所を示す',
    spec: [
      ['border-style', 'none'],
      ['bg', 'var(--color-field)'],
    ],
  },
];

const columns: Column[] = [
  { label: '通常' },
  { label: 'hover', preview: 'hover' },
  { label: 'フォーカス（キーボード）', preview: 'focus' },
];

const meta = {
  title: 'Design Review/378 枠の線',
  parameters: {
    pseudo: {
      rootSelector: 'body',
      hover: ['[data-preview="hover"] [data-slot="dropzone"]'],
      focusVisible: ['[data-preview="focus"] [data-slot="dropzone"] input'],
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Compare: Story = {
  render: () => (
    <Comparison
      index={378}
      axis="枠の線"
      pick="B"
      candidates={candidates}
      columns={columns}
      renderCell={(_column, candidate) => (
        <div className="w-64">
          <Dropzone
            label="画像"
            caption="JPEG・PNG、1 つ 5MB まで"
            variant={variantById[candidate.id]}
          />
        </div>
      )}
    >
      <p>
        決定: 面だけ（filled）を既定にします。点線（dashed）・実線（outline）は、`variant` props
        で使う側が選べる形のまま残します（3案とも部品に実装済みです）。
      </p>
      <p>
        ドラッグ中の色（受け付ける・受け付けない）は軸379、箱の中身の並べ方は軸380で別に比べました。
      </p>
    </Comparison>
  ),
};
