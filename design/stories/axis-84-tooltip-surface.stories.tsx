import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';

import { Button } from '../../src/components/button/Button';
import { Tooltip } from '../../src/components/tooltip/Tooltip';
import { type Candidate, type Column, Comparison } from './Comparison';
import { OverlayFrame } from './overlay-frame';

// 後半の軸 84: Tooltip の面 — 現行版（白・淡い影）を既定にし、A（影なし）を shadow={false} で選べる
// 変えるのは --color-tooltip・--color-on-tooltip・--color-tooltip-line・--shadow-tooltip だけ。全案（現行版を含む）で軸の値を明示する

const lightShadow = '0 2px 8px rgb(from var(--color-shadow) r g b / 0.08)';

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '白・淡い影',
    intent: 'ほかの浮かぶ面と同じ白に細い輪郭。Tooltip は小さいので影は小さく淡い。',
    spec: [
      ['面', '白・細い輪郭'],
      ['文字', '濃紺'],
      ['影', '下 2px・ぼかし 8px・8%'],
    ],
    tokens: {
      '--color-tooltip': 'var(--color-surface)',
      '--color-on-tooltip': 'var(--color-fg)',
      '--color-tooltip-line': 'var(--color-surface-line)',
      '--shadow-tooltip': lightShadow,
    },
  },
  {
    id: 'A',
    name: '白・影なし',
    intent:
      '白に細い輪郭だけで、影を付けない。いちばん軽いが、ページの上に重なっていることは輪郭だけで伝える。',
    spec: [
      ['面', '白・細い輪郭'],
      ['文字', '濃紺'],
      ['影', 'なし'],
    ],
    tokens: {
      '--color-tooltip': 'var(--color-surface)',
      '--color-on-tooltip': 'var(--color-fg)',
      '--color-tooltip-line': 'var(--color-surface-line)',
      '--shadow-tooltip': 'none',
    },
  },
  {
    id: 'B',
    name: '濃紺・淡い影',
    intent:
      '本文と同じ濃紺の塗りに白い文字。白い面の多い画面で、補足だと一目で分かる。輪郭はなし。',
    spec: [
      ['面', '濃紺の塗り'],
      ['文字', '白'],
      ['影', '下 2px・ぼかし 8px・8%'],
    ],
    tokens: {
      '--color-tooltip': 'var(--color-fg)',
      '--color-on-tooltip': 'var(--color-surface)',
      '--color-tooltip-line': 'transparent',
      '--shadow-tooltip': lightShadow,
    },
  },
  {
    id: 'C',
    name: '濃紺・影なし',
    intent: 'B から影を外す。濃い塗りだけで下の内容と切り分ける。',
    spec: [
      ['面', '濃紺の塗り'],
      ['文字', '白'],
      ['影', 'なし'],
    ],
    tokens: {
      '--color-tooltip': 'var(--color-fg)',
      '--color-on-tooltip': 'var(--color-surface)',
      '--color-tooltip-line': 'transparent',
      '--shadow-tooltip': 'none',
    },
  },
];

const columns: Column[] = [
  { label: '白い地', note: '短い文' },
  { label: 'グレーの地', note: 'カードの上など' },
  { label: '長い文', note: '折り返す' },
];

const cell = (
  tokens: CSSProperties | undefined,
  ground: string,
  content: string,
  label: string
) => (
  <OverlayFrame density="fine" style={tokens} className={`h-[150px] w-[340px] ${ground}`}>
    {(frame) => (
      <div className="flex justify-center pt-4">
        <Tooltip content={content} open container={frame}>
          <Button appearance="outline">{label}</Button>
        </Tooltip>
      </div>
    )}
  </OverlayFrame>
);

const cells: Record<string, (tokens: CSSProperties | undefined) => ReactNode> = {
  白い地: (tokens) => cell(tokens, 'bg-surface', 'リンクをコピー', '共有'),
  グレーの地: (tokens) => cell(tokens, 'bg-neutral', 'リンクをコピー', '共有'),
  長い文: (tokens) =>
    cell(
      tokens,
      'bg-surface',
      '公開すると、URL を知っている人は誰でも記事を読めます。あとから非公開に戻せます。',
      '公開する'
    ),
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/84 Tooltip の面',
  id: 'design-review-84-tooltip-surface',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current,A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current,A', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={84}
      axis="Tooltip の面"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => cells[column.label]?.(candidate.tokens)}
    >
      <p>
        <strong className="text-fg">
          決定: 現行版（白・淡い影）を既定にし、A（影なし）を shadow={false} で選べる
        </strong>
        。「84 は現行版がデフォルトで、影無しを選べる、がよさそうです。」
      </p>
      <p>
        Tooltip
        の面の色と影を選びます。原則1では、ページの上に重なるレイヤーはやわらかい影と細い輪郭で切り分けます。濃い塗りの案は、影の代わりに面の明るさの差で切り分けます。
      </p>
      <p>出るまでの時間（400ms）と向き（下）は、前の指摘で決めた値のままです。</p>
    </Comparison>
  ),
};
