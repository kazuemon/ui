import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Card } from '../../src/components/card/Card';
import { LoadingOverlay } from '../../src/components/loading-overlay/LoadingOverlay';
import { TextField } from '../../src/components/text-field/TextField';

// 軸 640: LoadingOverlay の真ん中に出すもの（円の大きさ・文言の有無）
const meta = {
  title: 'Design Review/640 LoadingOverlay の円と文言',
  id: 'design-review-640-loading-overlay-content',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
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

interface Variant {
  showLoadingText: boolean;
  tokens: Record<string, string>;
}

const variants: Record<string, Variant> = {
  current: { showLoadingText: false, tokens: {} },
  A: { showLoadingText: true, tokens: {} },
  B: {
    showLoadingText: true,
    tokens: {
      '--loading-overlay-spinner-size': 'var(--spinner-size-md)',
      '--loading-overlay-spinner-stroke': 'var(--spinner-stroke-md)',
    },
  },
};

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '円だけ（大）',
    intent:
      '真ん中に大きい円（lg）を 1 つだけ置く。文は見せず、読み上げだけで「読み込んでいます」と知らせる。見た目が静かで、下の内容を邪魔しない',
    spec: [
      ['円', 'lg（40px）'],
      ['文言', '見せない（読み上げだけ）'],
    ],
  },
  {
    id: 'A',
    name: '円（大）＋文言',
    intent:
      '大きい円の下に「読み込んでいます」を見せる。何を待っているのかが目でも分かるが、下の内容と文字が重なって見える',
    spec: [
      ['円', 'lg（40px）'],
      ['文言', '円の下に見せる'],
    ],
  },
  {
    id: 'B',
    name: '円（中）＋文言',
    intent: '円を小さく（md）して文言と並べる。小さい領域（カード 1 枚の半分ほど）でも収まりやすい',
    spec: [
      ['円', 'md（24px）'],
      ['文言', '円の下に見せる'],
    ],
  },
];

const columns: Column[] = [
  { label: '出ているところ', note: '幕が出た状態を固定' },
  { label: '押して試す', note: '「読み込む」で 2 秒ほど幕が出る' },
];

function Region({ loading, variant }: { loading: boolean; variant: Variant }) {
  return (
    <LoadingOverlay
      loading={loading}
      delay={0}
      minDuration={0}
      showLoadingText={variant.showLoadingText}
      className="w-72 rounded-card"
    >
      <Card>
        <div className="flex flex-col gap-3 p-4">
          <p className="font-bold">今月の記録</p>
          <TextField label="メモ" />
          <Button color="primary">保存する</Button>
        </div>
      </Card>
    </LoadingOverlay>
  );
}

function Trial({ variant }: { variant: Variant }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex flex-col items-start gap-3">
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 2000);
        }}
      >
        読み込む
      </Button>
      <Region loading={loading} variant={variant} />
    </div>
  );
}

export const Axis: Story = {
  name: '円と文言',
  render: ({ pick }) => (
    <Comparison
      index={640}
      axis="LoadingOverlay の真ん中に出すもの"
      pick={pick}
      candidates={candidates.map((candidate) => ({
        ...candidate,
        tokens: variants[candidate.id].tokens,
      }))}
      columns={columns}
      renderCell={(column, candidate) =>
        column.label === '出ているところ' ? (
          <Region loading variant={variants[candidate.id]} />
        ) : (
          <Trial variant={variants[candidate.id]} />
        )
      }
    >
      <p>決定: 既定は円（大）だけ。文言は任意で、`showLoadingText` で円の下に出す。</p>
      <p>
        カードや表の上に重ねる幕の真ん中に、何を出すかを選びます。読み上げは、どの案でも「読み込んでいます」を知らせます。
      </p>
      <p>
        既定を 1 つ選び、ほかの案も選べるようにするかを答えてください（文言は
        `showLoadingText`、円の大きさは部品のトークンで変えられます）。
      </p>
    </Comparison>
  ),
};
