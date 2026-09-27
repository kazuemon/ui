import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { Avatar } from '../../src/components/avatar/Avatar';
import { AvatarGroup } from '../../src/components/avatar-group/AvatarGroup';
import { type Candidate, type Column, Comparison } from './Comparison';

// 軸 0322: AvatarGroup の重なり
// AvatarGroup（src/components/avatar-group）は、比べるループにはかけず「原則にない判断」として実装した。
// ここで見比べるのは、そのうち見た目に関わる 2 点だけ（並べる向き・最大表示数の仕組みは backlog に残したまま）
//   重なりの量: --avatar-group-overlap（隣のアバターと重ねる量。--avatar-size に対する比。現行 0.3）
//   縁の処理: --avatar-group-ring-width（現行 --border-width-thick）の box-shadow。
//     色は部品のコードに直書き（var(--color-surface)）で、専用のトークンを持たない。
//     「縁を枠線寄りの色にする」候補だけは、そのスコープで --color-surface 自体を上書きして色を試す
//     （採るなら、実装側に --avatar-group-ring-color を足す必要がある。これは軸を分けず、この比較の中でだけ触れる）
const overlapCurrent = '0.3';
const ringWidthCurrent = 'var(--border-width-thick)';

const current: CSSProperties & Record<`--${string}`, string> = {
  '--avatar-group-overlap': overlapCurrent,
  '--avatar-group-ring-width': ringWidthCurrent,
};

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '現行版',
    intent: '隣のアバターの 30% を重ね、境目は置いた面の色（--color-surface）の縁で区切る',
    spec: [
      ['重なりの量', '30%（--avatar-size の比）'],
      ['縁の太さ', '2px（--border-width-thick）'],
      ['縁の色', '--color-surface（面の色で区切る＝背景に溶ける）'],
    ],
    tokens: current,
  },
  {
    id: 'A',
    name: '重なりを浅くする（18%）',
    intent:
      '頭文字が 2 文字（KM など）でも隠れにくいところまで浅くする。まとまりの強さは現行より弱まる',
    spec: [
      ['重なりの量', '18%'],
      ['縁の太さ', '2px（現行のまま）'],
      ['縁の色', '--color-surface（現行のまま）'],
    ],
    tokens: { ...current, '--avatar-group-overlap': '0.18' },
  },
  {
    id: 'B',
    name: '重なりを深くする（45%）',
    intent: '1 つの塊として強くまとめる。頭文字は隠れやすくなり、"+N" も窮屈に見える',
    spec: [
      ['重なりの量', '45%'],
      ['縁の太さ', '2px（現行のまま）'],
      ['縁の色', '--color-surface（現行のまま）'],
    ],
    tokens: { ...current, '--avatar-group-overlap': '0.45' },
  },
  {
    id: 'C',
    name: '縁を太くする（4px）',
    intent: '区切りをよりはっきりさせる。その分、重なった側のアバターの見える幅はさらに削れる',
    spec: [
      ['重なりの量', '30%（現行のまま）'],
      ['縁の太さ', '4px（--border-width-thick の 2 倍）'],
      ['縁の色', '--color-surface（現行のまま）'],
    ],
    tokens: { ...current, '--avatar-group-ring-width': 'calc(var(--border-width-thick) * 2)' },
  },
  {
    id: 'D',
    name: '縁を線寄りの色にする',
    intent:
      '面の色で切り抜く代わりに、Avatar 自身の細い輪郭（--avatar-outline-color）と同じ考えの薄い線にする。' +
      '背景の色に依存せず区切れる一方、常にアバターの外周にも薄い線が付き、Avatar 自身の輪郭と重なって少し濃く見える',
    spec: [
      ['重なりの量', '30%（現行のまま）'],
      ['縁の太さ', '2px（現行のまま）'],
      ['縁の色', 'color-mix(in oklab, var(--color-fg) 14%, transparent)（線寄り）'],
    ],
    tokens: {
      ...current,
      '--color-surface': 'color-mix(in oklab, var(--color-fg) 14%, transparent)',
    },
  },
];

const members = ['かずえもん', '宮本一也', 'Kazuya Miyamoto', 'Sato', 'Tanaka', 'Suzuki'];
const avatars = (count: number) =>
  members.slice(0, count).map((name) => <Avatar key={name} size="lg" name={name} />);

const columns: Column[] = [
  { label: '通常表示', note: '4 人・max なし' },
  { label: '+N 表示', note: '6 人・max={4}（アバター 3 個 + "+3"）' },
];

const meta = {
  title: 'Design Review/0322 AvatarGroupの重なり',
  id: 'design-review-0322-avatar-group-overlap',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
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

export const Overlap: Story = {
  name: '重なりと縁',
  render: ({ pick }) => (
    <Comparison
      index={322}
      axis="AvatarGroup の重なり"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <AvatarGroup size="lg" max={column.label === '+N 表示' ? 4 : undefined}>
          {avatars(column.label === '+N 表示' ? 6 : 4)}
        </AvatarGroup>
      )}
    >
      <p>
        AvatarGroup（重ねて並べる Avatar）の実装時に、比べるループにかけず「原則にない判断」として
        決めた 2 点を見比べます。重なりの量（--avatar-group-overlap）と、境目の縁の太さ・色
        （--avatar-group-ring-width と、いまは部品のコードに直書きの --color-surface）です。
        並べる向き（あとに置いたアバターが上に重なる。DOM 順のまま z-index を使わない）と、
        最大表示数の仕組み（max は "+N" 自身の枠も含む）は、比べる案がないため backlog
        に残したままです。
      </p>
      <p>
        見てほしい点: A・B は重なりの深さで、Kazuya Miyamoto の頭文字「KM」がどこまで隠れるかを。 C
        は縁の太さで、区切りのはっきりさと、重なった側の見える幅の削れ方を。D
        は縁の色で、いまの「背景に溶ける面の色」と、「常に薄い線が付く」形のどちらが望ましいかを見てください。
        D
        を採るときは、実装側に専用の色トークン（--avatar-group-ring-color）を足す直しが別途要ります。
      </p>
      <p>
        どれを既定にするか（重なりの量・縁の太さ・縁の色、それぞれ 1 つずつ）を一言添えてください。
      </p>
    </Comparison>
  ),
};
