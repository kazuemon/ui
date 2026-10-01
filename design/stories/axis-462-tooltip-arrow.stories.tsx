import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Tooltip, type TooltipSide } from '../../src/components/tooltip/Tooltip';

// 軸 462: Tooltip の本体を指す矢印（showArrow）の大きさと本体とのあいだ。
//   押せないときもフォーカスできるボタン（focusableWhenDisabled）に、押せない理由を出す場面で並べる
const meta = {
  title: 'Design Review/462 Tooltip の矢印',
  id: 'design-review-462-tooltip-arrow',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      focusVisible: ['[data-preview="focus"] button'],
    },
  },
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '矢印なし',
    intent:
      'いまの Tooltip。本体から 8px 離して、面だけを出す。この行だけ showArrow を渡さずに描く',
    spec: [
      ['矢印', 'なし'],
      ['本体とのあいだ', '8px'],
    ],
  },
  {
    id: 'A',
    name: '小さい矢印（8px）',
    intent:
      '回す前の一辺 8px（はみ出しは 4px）。面の文字（12px）に釣り合う小ささ。本体とのあいだは 8px のままで、矢印の先から本体まで 4px',
    spec: [
      ['矢印', '8px（はみ出し 4px）'],
      ['本体とのあいだ', '8px'],
    ],
    tokens: { '--tooltip-arrow-size': '8px', '--tooltip-offset': '8px' },
  },
  {
    id: 'B',
    name: 'Popover と同じ矢印（12px）',
    intent:
      'Popover の矢印と同じ一辺 12px（はみ出し 6px）。浮かぶ面の矢印が 1 つの大きさになる。小さい面には大きく見える。本体とのあいだは 10px（矢印の先から 4px）',
    spec: [
      ['矢印', '12px（はみ出し 6px）'],
      ['本体とのあいだ', '10px'],
    ],
    tokens: { '--tooltip-arrow-size': '12px', '--tooltip-offset': '10px' },
  },
  {
    id: 'C',
    name: '小さい矢印・本体に寄せる',
    intent:
      'A の矢印で、本体とのあいだを 6px に詰める。矢印の先が本体から 2px で、どれの補足かがいちばん近く見える',
    spec: [
      ['矢印', '8px（はみ出し 4px）'],
      ['本体とのあいだ', '6px'],
    ],
    tokens: { '--tooltip-arrow-size': '8px', '--tooltip-offset': '6px' },
  },
];

const columns: Column[] = [
  { label: '下に出す', note: 'ふつうのボタン（side="bottom"）' },
  { label: '上に出す', note: '長押しの向き（side="top"）' },
  {
    label: '押せない理由（フォーカス）',
    note: 'focusableWhenDisabled のボタンにキーボードで止まる',
    preview: 'focus',
  },
];

// 本体とのあいだは Base UI が数で受けるので、比べる値を行ごとに渡す（--tooltip-offset は body から読むため）
const offsets: Record<string, number> = { 現行版: 8, A: 8, B: 10, C: 6 };

/** 行のトークンが効くよう、Tooltip をセルの中に描く */
function Cell({
  candidate,
  side,
  reason,
}: {
  candidate: Candidate;
  side: TooltipSide;
  reason?: boolean;
}) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setFrame} className="relative flex h-32 items-center">
      {frame && (
        <Tooltip
          content={reason ? '下書きを保存すると公開できます' : '下書きとして保存します'}
          side={side}
          open
          showArrow={candidate.id !== '現行版'}
          portalContainer={frame}
          positionerProps={{ sideOffset: offsets[candidate.id] ?? 8 }}
        >
          {reason ? (
            <Button color="primary" disabled focusableWhenDisabled>
              公開する
            </Button>
          ) : (
            <Button variant="outline">保存</Button>
          )}
        </Tooltip>
      )}
    </div>
  );
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={462}
      axis="Tooltip の矢印"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        switch (column.label) {
          case '下に出す':
            return <Cell candidate={candidate} side="bottom" />;
          case '上に出す':
            return <Cell candidate={candidate} side="top" />;
          default:
            return <Cell candidate={candidate} side="bottom" reason />;
        }
      }}
    >
      <p>
        決定: A（矢印 8px・本体とのあいだ 8px）。ユーザーの返事「A かなと思いました。ボタンについて
        props でフォーカス制御を入れていますが、Tooltip で囲まれているなら focusable
        が伝搬するのが良さそう？と思いました。」 押せないボタンを Tooltip で包んだときは、Button
        が自動で focusableWhenDisabled になる（明示した false は優先する）。
        候補の見た目は、トークンを畳む前のこのコミットで比べられます。
      </p>
      <p>
        Tooltip に、本体を指す矢印（showArrow）を足しました。Popover
        の矢印と同じ作りで、面と同じ白に外側の 2
        辺だけ輪郭を引いた四角を回します。既定では出しません。
      </p>
      <p>
        あわせて Button に focusableWhenDisabled を足しました。押せないときも Tab
        で止まり、aria-disabled で押せないことを伝えます（見た目は押せないボタンと同じ）。3
        列目は、そのボタンにキーボードで止まり、押せない理由を Tooltip
        で出したところです。色付きのボタンは全体を薄くするので、フォーカスの線も一緒に薄くなります。
      </p>
      <p>選ぶのは、矢印の大きさと、本体とのあいだです。</p>
    </Comparison>
  ),
};
