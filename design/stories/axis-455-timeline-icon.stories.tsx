import {
  BriefcaseIcon,
  CheckIcon,
  GraduationCapIcon,
  RocketLaunchIcon,
  WarningIcon,
  XIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  Timeline,
  TimelineItem,
  type TimelineMarkerType,
} from '../../src/components/timeline/Timeline';

// 軸 455: Timeline の点にアイコンを置くとき（TimelineItem の icon）の、アイコンの丸の形と色
const meta = {
  title: 'Design Review/455 年表の点のアイコン',
  id: 'design-review-455-timeline-icon',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A,B,C,D' },
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

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'アイコンを置けない（点だけ）',
    intent:
      'いまの Timeline。点にアイコンを置けないので、種類（入社・卒業・公開）は題の文字でしか分からない。比べるため、この行は icon を渡していない',
    spec: [['印', '点（10px）']],
    tokens: {},
  },
  {
    id: 'A',
    name: '点の色の塗り・白抜きのアイコン（24px）',
    intent:
      '点の色の丸（24px）に、塗りに載せる色のアイコン（14px）を白抜きで置く。点を大きくした形なので、点の項目と混ぜても同じ仲間に見える。グレーの丸は 3:1 の点の色',
    spec: [
      ['丸', '24px・点の色の塗り'],
      ['アイコン', '14px・塗りに載せる色（白）'],
    ],
    tokens: {
      '--timeline-icon-marker-size': 'calc(var(--spacing) * 6)',
      '--timeline-icon-size': 'calc(var(--spacing) * 3.5)',
      '--timeline-icon-fill': '1',
      '--timeline-icon-surface': '1',
      '--timeline-icon-ring': '0px',
    },
  },
  {
    id: 'B',
    name: '淡い面・色のアイコン（28px）',
    intent:
      '淡い面の丸（28px）に、前景の色のアイコン（16px）を置く。タグやお知らせの淡い面と同じ配色で、A より軽い。グレーは入力欄の面の色',
    spec: [
      ['丸', '28px・淡い面'],
      ['アイコン', '16px・前景の色'],
    ],
    tokens: {
      '--timeline-icon-marker-size': 'calc(var(--spacing) * 7)',
      '--timeline-icon-size': 'calc(var(--spacing) * 4)',
      '--timeline-icon-fill': '0',
      '--timeline-icon-surface': '1',
      '--timeline-icon-ring': '0px',
    },
  },
  {
    id: 'C',
    name: '白い丸に細い輪郭・色のアイコン（28px）',
    intent:
      '地の色の丸に、前景の色の細い輪郭を引き、同じ色のアイコンを置く（outline の点を大きくした形）。線の部品の見た目で、いちばん軽い',
    spec: [
      ['丸', '28px・地の色＋細い輪郭（1.5px）'],
      ['アイコン', '16px・前景の色'],
    ],
    tokens: {
      '--timeline-icon-marker-size': 'calc(var(--spacing) * 7)',
      '--timeline-icon-size': 'calc(var(--spacing) * 4)',
      '--timeline-icon-fill': '0',
      '--timeline-icon-surface': '0',
      '--timeline-icon-ring': 'var(--border-width-medium)',
    },
  },
  {
    id: 'D',
    name: '丸なし・アイコンだけ（20px）',
    intent:
      '丸を持たず、点の代わりに前景の色のアイコン（20px）だけを置く。線はアイコンの手前で切れる。アイコンの形がそのまま見え、本文のアイコンと同じ扱い',
    spec: [
      ['丸', 'なし（地の色で線を隠す）'],
      ['アイコン', '20px・前景の色'],
    ],
    tokens: {
      '--timeline-icon-marker-size': 'calc(var(--spacing) * 5)',
      '--timeline-icon-size': 'calc(var(--spacing) * 5)',
      '--timeline-icon-fill': '0',
      '--timeline-icon-surface': '0',
      '--timeline-icon-ring': '0px',
    },
  },
];

const columns: Column[] = [
  { label: 'グレー（既定）', note: 'すべての項目にアイコン' },
  { label: '色を混ぜる', note: 'primary・success・warning・danger' },
  { label: '点と混ぜる', note: '一部の項目だけアイコン・強調あり' },
];

interface Entry {
  date: string;
  title: string;
  icon: React.ReactNode;
  markerType?: TimelineMarkerType;
}

const entries: Entry[] = [
  { date: '2026年4月', title: 'ポートフォリオを公開', icon: <RocketLaunchIcon /> },
  { date: '2024年4月', title: '株式会社かずえもん 入社', icon: <BriefcaseIcon /> },
  { date: '2024年3月', title: '大学を卒業', icon: <GraduationCapIcon /> },
];

const colored: TimelineMarkerType[] = ['primary', 'success', 'warning', 'danger'];
const coloredIcons = [
  <RocketLaunchIcon key="rocket" />,
  <CheckIcon key="check" />,
  <WarningIcon key="warning" />,
  <XIcon key="x" />,
];
const coloredTitles = ['v1.0 を公開', '審査を通過', '公開を延期', 'v0.9 を取り下げ'];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={455}
      axis="年表の点のアイコン"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const withIcon = candidate.id !== '現行版';
        if (column.label === '色を混ぜる') {
          return (
            <Timeline className="w-[300px]">
              {colored.map((markerType, i) => (
                <TimelineItem
                  key={markerType}
                  date={`2026年${9 - i}月`}
                  title={coloredTitles[i]}
                  markerType={markerType}
                  icon={withIcon ? coloredIcons[i] : undefined}
                />
              ))}
            </Timeline>
          );
        }
        const mixed = column.label === '点と混ぜる';
        return (
          <Timeline className="w-[300px]">
            {entries.map((entry, i) => (
              <TimelineItem
                key={entry.title}
                date={entry.date}
                title={entry.title}
                emphasis={mixed && i === 0}
                markerType={mixed && i === 0 ? 'primary' : undefined}
                icon={withIcon && (!mixed || i !== 1) ? entry.icon : undefined}
              >
                {i === 1 ? <p>Web のフロントエンドを担当。</p> : null}
              </TimelineItem>
            ))}
          </Timeline>
        );
      }}
    >
      <p>
        決定: アイコンの点は A（点の色の塗りに白抜きのアイコン）を既定にし、B・C・D
        も選べる。ユーザーの返事「どのバリエーションでも選べると良さそうですが、デフォルトは塗り点なのでAかなと思いました。」候補の見た目は、トークンを畳む前のこのコミットで比べられます。
      </p>
      <p>
        TimelineItem に、点の代わりに置くアイコン icon
        を足しました。丸の色は点の種類（markerType）に従います。 アイコンを持つ項目が 1
        つでもあると、点の列が丸の幅に広がり、点も線も列の中央に並びます（題の頭はそろったまま）。
      </p>
      <p>
        選ぶのは、丸の形（塗り・淡い面・輪郭・丸なし）と大きさです。状態の色（success・warning・danger）の点の色は軸
        456 で比べています。この軸の警告の色は、軸 456 の既定（オリーブ色）です。
      </p>
    </Comparison>
  ),
};
