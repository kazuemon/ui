import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { LineChartPreview } from './line-chart-preview';

// 決定: A（題を淡く、値を太く）を既定にし、ほかの案も variant・size で選べる — ADR-0541
// 軸 669: hover のカードの中身（題・名前・値の濃さと大きさ）。--chart-tooltip-*（題・区切り線・値の太さ・文字）で行ごとに変える
const meta = {
  title: 'Design Review/669 グラフの hover のカードの中身',
  id: 'design-review-669-chart-tooltip',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A,current,B,C' },
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
    name: '題と値を少し太く',
    intent:
      'キャプションの大きさで、題（日付）と値を少し太く、名前を淡くする。題と行が同じ強さで並び、どこから読むかの順がはっきりしない',
    spec: [
      ['文字', 'キャプション（12px）'],
      ['題', '本文の色・やや太い'],
      ['値', 'やや太い'],
    ],
    tokens: {
      '--chart-tooltip-text': 'var(--text-caption)',
      '--chart-tooltip-leading': 'var(--leading-caption)',
      '--chart-tooltip-title-color': 'var(--color-fg)',
      '--chart-tooltip-title-weight': '500',
      '--chart-tooltip-title-pad': '0px',
      '--chart-tooltip-divider': '0px',
      '--chart-tooltip-value-weight': '500',
    },
  },
  {
    id: 'A',
    name: '題を淡く、値を太く',
    intent:
      '題を淡い文字の細字に下げ、値を太字にする。目が数字に向き、題は補足として読める。見たいのが数字のときに向く',
    spec: [
      ['文字', 'キャプション（12px）'],
      ['題', '淡い文字・ふつう'],
      ['値', '太字'],
    ],
    tokens: {
      '--chart-tooltip-text': 'var(--text-caption)',
      '--chart-tooltip-leading': 'var(--leading-caption)',
      '--chart-tooltip-title-color': 'var(--color-fg-muted)',
      '--chart-tooltip-title-weight': '400',
      '--chart-tooltip-title-pad': '0px',
      '--chart-tooltip-divider': '0px',
      '--chart-tooltip-value-weight': '700',
    },
  },
  {
    id: 'B',
    name: '題の下に区切り線',
    intent:
      '題を太字にし、下に細い線を引いて行と分ける。表の見出しのように、題と中身の境がはっきりする。カードが少し縦に長くなる',
    spec: [
      ['文字', 'キャプション（12px）'],
      ['題', '本文の色・太字・下に線'],
      ['値', 'やや太い'],
    ],
    tokens: {
      '--chart-tooltip-text': 'var(--text-caption)',
      '--chart-tooltip-leading': 'var(--leading-caption)',
      '--chart-tooltip-title-color': 'var(--color-fg)',
      '--chart-tooltip-title-weight': '700',
      '--chart-tooltip-title-gap': 'calc(var(--spacing) * 2)',
      '--chart-tooltip-title-pad': 'calc(var(--spacing) * 1.5)',
      '--chart-tooltip-divider': 'var(--border-width-thin)',
      '--chart-tooltip-value-weight': '500',
    },
  },
  {
    id: 'C',
    name: 'ラベルの大きさ',
    intent:
      'A の濃さのまま、文字をラベルの大きさ（14px）に上げる。凡例と同じ大きさで読みやすいが、カードが大きくなり、線の上を広く覆う',
    spec: [
      ['文字', 'ラベル（14px）'],
      ['題', '淡い文字・ふつう'],
      ['値', '太字'],
    ],
    tokens: {
      '--chart-tooltip-text': 'var(--text-label)',
      '--chart-tooltip-leading': 'var(--leading-label)',
      '--chart-tooltip-title-color': 'var(--color-fg-muted)',
      '--chart-tooltip-title-weight': '400',
      '--chart-tooltip-title-pad': '0px',
      '--chart-tooltip-divider': '0px',
      '--chart-tooltip-value-weight': '700',
    },
  },
];

const columns: Column[] = [
  { label: '3 系列', note: '9/17 に載せたところを固定' },
  { label: '1 系列', note: '同じ位置' },
];

export const Candidates: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={669}
      axis="グラフの hover のカードの中身"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <LineChartPreview activeIndex={8} seriesCount={column.label === '1 系列' ? 1 : 3} />
      )}
    >
      <p>
        hover
        で出すカード（ChartTooltip）の中の、題（日付）・系列の名前・値の濃さと大きさを決めます。面（白・細い輪郭・淡い影）は
        Tooltip と同じで、どの案でも変えません。
      </p>
      <p>
        推し: A（題を淡く、値を太く）。hover して見たいのは数字なので、数字が先に目に入ります。B
        は境がはっきりしますが、小さなカードに線が増えます。C
        は読みやすい反面、カードが線を広く隠します。
      </p>
    </Comparison>
  ),
};
