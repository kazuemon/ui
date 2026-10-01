import { CheckIcon, CodeIcon, WarningIcon, XIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  Timeline,
  TimelineItem,
  type TimelineMarkerType,
} from '../../src/components/timeline/Timeline';

// 軸 456: Timeline の状態の色の点（markerType の success・warning・danger）の塗り方。とくに警告の黄色
const meta = {
  title: 'Design Review/456 年表の状態の色の点',
  id: 'design-review-456-timeline-status',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const base = {
  '--color-timeline-marker-success': 'var(--color-success)',
  '--color-timeline-marker-danger': 'var(--color-danger)',
  '--color-timeline-marker-warning': 'var(--color-fg-warning)',
  '--color-timeline-marker-on-warning': 'var(--palette-white)',
  '--timeline-status-fill': '100%',
  '--timeline-status-ring': '0px',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '状態の色なし',
    intent:
      'いまの Timeline の点は neutral・outline・primary だけ。結果の違い（通った・延期・取り下げ）は文字でしか分からない。比べるため、この行は状態の項目も neutral で描いている',
    spec: [['点', 'グレー・青だけ']],
    tokens: base,
  },
  {
    id: 'A',
    name: '濃い塗り（警告はオリーブ色）',
    intent:
      '成功は緑、危険は赤の濃い塗り。警告は、白地で見える前景用のオリーブ色で塗る（黄色の塗りは白地で 1.2:1）。どの点も 3:1 を超える',
    spec: [
      ['成功・危険', '濃い塗り'],
      ['警告', 'オリーブ色の塗り（白地 5.1:1）'],
    ],
    tokens: base,
  },
  {
    id: 'B',
    name: '濃い塗り（警告は黄色）',
    intent:
      'A の警告を、お知らせや Badge と同じ黄色の塗りにする。警告らしい色だが、白地では点がほとんど見えない（1.2:1）。アイコンの丸では、黄色の上のアイコンは濃紺',
    spec: [
      ['成功・危険', '濃い塗り'],
      ['警告', '黄色の塗り（白地 1.2:1）'],
    ],
    tokens: {
      ...base,
      '--color-timeline-marker-warning': 'var(--color-warning)',
      '--color-timeline-marker-on-warning': 'var(--color-on-warning)',
    },
  },
  {
    id: 'C',
    name: '濃い塗り＋前景の色の輪郭（警告は黄色＋オリーブの縁）',
    intent:
      'B に、前景の色の細い輪郭を引く。黄色の点はオリーブ色の縁で白地でも形が見え、黄色も残る。成功・危険は塗りと縁が同じ色なので A と変わらない',
    spec: [
      ['成功・危険', '濃い塗り（縁は同じ色）'],
      ['警告', '黄色の塗り＋オリーブ色の縁（1.5px）'],
    ],
    tokens: {
      ...base,
      '--color-timeline-marker-warning': 'var(--color-warning)',
      '--color-timeline-marker-on-warning': 'var(--color-on-warning)',
      '--timeline-status-ring': 'var(--border-width-medium)',
    },
  },
  {
    id: 'D',
    name: '淡い面＋前景の色の輪郭',
    intent:
      '点の中を淡い面にし、前景の色の輪郭を引く（outline の点に色を付けた形）。タグの淡い面と同じ配色で、グレーの点と並んでも強すぎない',
    spec: [['成功・危険・警告', '淡い面＋前景の色の縁（1.5px）']],
    tokens: {
      ...base,
      '--timeline-status-fill': '0%',
      '--timeline-status-ring': 'var(--border-width-medium)',
    },
  },
];

const columns: Column[] = [
  { label: '点（md）', note: '状態ごとに 1 つずつ' },
  { label: '点（lg）・強調', note: 'markerSize="lg"・最初の項目に emphasis' },
  { label: 'アイコンの丸', note: 'icon（軸 455 の既定）' },
];

const items: { markerType: TimelineMarkerType; title: string; date: string }[] = [
  { markerType: 'success', title: '審査を通過', date: '2026年8月' },
  { markerType: 'warning', title: '公開を延期', date: '2026年7月' },
  { markerType: 'danger', title: 'v0.9 を取り下げ', date: '2026年6月' },
  { markerType: 'neutral', title: '開発をはじめる', date: '2026年4月' },
];

const icons: Record<string, ReactNode> = {
  success: <CheckIcon />,
  warning: <WarningIcon />,
  danger: <XIcon />,
  neutral: <CodeIcon />,
};

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={456}
      axis="年表の状態の色の点"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <Timeline
          className="w-[260px]"
          markerSize={column.label === '点（lg）・強調' ? 'lg' : 'md'}
        >
          {items.map((item, i) => (
            <TimelineItem
              key={item.title}
              date={item.date}
              title={item.title}
              markerType={candidate.id === '現行版' ? 'neutral' : item.markerType}
              emphasis={column.label === '点（lg）・強調' && i === 0}
              icon={column.label === 'アイコンの丸' ? icons[item.markerType] : undefined}
            />
          ))}
        </Timeline>
      )}
    >
      <p>
        Timeline の markerType に、状態の色 success・warning・danger
        を足しました。起きたことの結果を点の色で示します。
        色だけに頼らず、題やアイコン（icon）でも伝えます。
      </p>
      <p>
        選ぶのは、状態の色の点の塗り方です。警告の黄色は塗りにしか使わない色で、白地の小さな点では見えにくくなります（1.2:1。点のような図形には
        3:1 が要ります）。アイコンの丸の列は、点の色からできる丸の見え方の確かめです。
      </p>
    </Comparison>
  ),
};
