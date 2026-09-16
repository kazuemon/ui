import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Tag } from '../../src/components/Tag';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 39: Badge（数と小さな状態の点）
// タグ（淡い面・文字 11px/12px・高さ 20px・pill）とは別の、素の要素の部品として作った（src/components/Badge.tsx）
// 変えるのは次のトークンだけ（Badge.tsx が読む）
//   --color-badge-*・--color-on-badge-*: 塗りと文字。現行版はタグの色（淡い面）、A〜C は濃い塗り
//   --badge-size: 数の丸の高さ（1桁で丸）。--badge-pad-x: 2桁以上で横に伸びるときの左右の余白
//   --badge-dot: 状態の点の直径
//   --badge-ring-width: 重ねるときの縁（置く面の色 --color-badge-ring）の太さ
//   --badge-overlay-inset: 重ねるとき、相手の右上の角から Badge の中心を内側へ寄せる量
// 文字の大きさはどの案もキャプション（マウス用 11px・指用 12px）で、タグと同じ

const colors = ['primary', 'secondary', 'neutral', 'info', 'success', 'warning', 'danger'] as const;

// 現行版: いまのタグの色（淡い面に同じ色相の濃い文字）
const softColors = Object.fromEntries(
  colors.flatMap((c) => [
    [`--color-badge-${c}`, `var(--color-tag-${c})`],
    [`--color-on-badge-${c}`, `var(--color-on-tag-${c})`],
  ])
);

// A〜C: 濃い塗り。状態の色は塗りのお知らせと同じ、グレーはトグルの ON と同じ濃いグレー
const solidColors = {
  '--color-badge-primary': 'var(--color-primary)',
  '--color-on-badge-primary': 'var(--color-on-primary)',
  '--color-badge-secondary': 'var(--color-fg-secondary)',
  '--color-on-badge-secondary': 'var(--color-on-secondary)',
  '--color-badge-neutral': 'var(--color-fg-muted)',
  '--color-on-badge-neutral': 'var(--palette-white)',
  '--color-badge-info': 'var(--color-notice-info-filled)',
  '--color-on-badge-info': 'var(--color-on-notice-info-filled)',
  '--color-badge-success': 'var(--color-notice-success-filled)',
  '--color-on-badge-success': 'var(--color-on-notice-success-filled)',
  '--color-badge-warning': 'var(--color-notice-warning-filled)',
  '--color-on-badge-warning': 'var(--color-on-notice-warning-filled)',
  '--color-badge-danger': 'var(--color-notice-danger-filled)',
  '--color-on-badge-danger': 'var(--color-on-notice-danger-filled)',
};

interface Shape {
  fill: 'soft' | 'solid';
  size: string;
  padX: string;
  dot: string;
  ring: string;
  inset: string;
}

const candidate = (id: string, name: string, intent: string, s: Shape): Candidate => ({
  id,
  name,
  intent,
  spec: [
    ['塗り', s.fill === 'soft' ? '淡い面に濃い文字（タグと同じ）' : '濃い塗りに白い文字'],
    ['高さ', `${s.size}（2桁以上は左右 ${s.padX} で伸びる）`],
    ['点', s.dot],
    ['重ねるときの縁', s.ring === '0px' ? 'なし' : `置く面の色 ${s.ring}`],
    ['重ねる位置', s.inset === '0px' ? '角の上に中心' : `角から内側へ ${s.inset}`],
  ],
  tokens: {
    ...(s.fill === 'soft' ? softColors : solidColors),
    // 決めたあとで、警告の点だけ別の色（--color-badge-warning-dot）にした。比べたときの形のまま、点も数の丸と同じ塗りにする
    '--color-badge-warning-dot': 'var(--color-badge-warning)',
    '--color-badge-ring': 'var(--color-surface)',
    '--badge-size': s.size,
    '--badge-pad-x': s.padX,
    '--badge-dot': s.dot,
    '--badge-ring-width': s.ring,
    '--badge-overlay-inset': s.inset,
  },
});

const candidates: Candidate[] = [
  candidate(
    '現行版',
    'いまのタグで数を出す',
    'Badge はまだないので、いまのタグ（淡い面・高さ 20px・左右 8px）の形で数を出したもの。点はタグにないので、同じ淡い色で描いている。重ねるときの縁はない。',
    { fill: 'soft', size: '20px', padX: '8px', dot: '8px', ring: '0px', inset: '0px' }
  ),
  candidate(
    'A',
    '小さな塗り・縁あり',
    '高さ 16px の濃い塗り。重ねるときは置く面の色の縁 2px で相手と切り離し、中心を角から 4px 内側（角丸の曲がりのあたり）に置く。通知の件数でよく見る形。',
    { fill: 'solid', size: '16px', padX: '4px', dot: '8px', ring: '2px', inset: '4px' }
  ),
  candidate(
    'B',
    '小さな塗り・縁なし',
    'A から縁だけをなくす。重ねたとき、Badge が相手の線や塗りに直接くっつく。',
    { fill: 'solid', size: '16px', padX: '4px', dot: '8px', ring: '0px', inset: '4px' }
  ),
  candidate(
    'C',
    'タグと同じ高さの塗り・縁あり',
    'A を高さ 20px（タグと同じ）、点を 10px に大きくする。数が読みやすく、タグとは塗りの濃さだけで見分ける。',
    { fill: 'solid', size: '20px', padX: '6px', dot: '10px', ring: '2px', inset: '4px' }
  ),
];

const columns: Column[] = [
  {
    label: '角に重ねる',
    note: 'マウス用。アイコンのボタン（3・12・120・点）、文字のボタン、丸いアバター。縁の有無（A と B）は下の濃い塗りのアバターで見分けやすい',
  },
  {
    label: '文字の横に置く',
    note: 'マウス用。ボタンの中、文字の横、状態の点。下の段はタグと並べる',
  },
  { label: '数字だけ・色', note: 'マウス用。1桁・2桁・99+・点。右端は同じ色のタグ' },
  { label: '指用', note: 'data-density="coarse"。部品の高さ 44px・文字 12px' },
];

const Label = ({ children }: { children: ReactNode }) => (
  <p className="text-xs font-bold text-fg-subtle">{children}</p>
);

// 通知のベル（Phosphor の Bell）。アイコン単体なので Bold の線（design/adr/0018）
const BellIcon = () => (
  <svg
    viewBox="0 0 256 256"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="size-(--size-icon) shrink-0"
    style={{ strokeWidth: 'var(--icon-stroke-standalone)' }}
  >
    <path d="M96,192a32,32,0,0,0,64,0" />
    <path d="M56,104a72,72,0,0,1,144,0c0,35.82,8.3,64.6,14.9,76A8,8,0,0,1,208,192H48a8,8,0,0,1-6.88-12C47.71,168.6,56,139.81,56,104Z" />
  </svg>
);

// 数は Badge では読ませず（aria-hidden）、ボタンの名前に含める
const Bell = ({ count }: { count?: number }) => (
  <Badge count={count} color="danger" aria-hidden="true">
    <Button
      appearance="outline"
      aria-label={count === undefined ? '通知（未読あり）' : `通知（未読 ${count} 件）`}
      className="w-(--size-control) px-0"
    >
      <BellIcon />
    </Button>
  </Badge>
);

// dark は濃い塗りのアバター（写真の代わり）。白地や淡いグレーの相手では縁の有無が見分けにくいので、縁の差はここで見る
const Avatar = ({ dark = false }: { dark?: boolean }) => (
  <span
    className={`grid size-(--size-control) place-items-center rounded-pill text-xs font-bold ${
      dark ? 'bg-primary text-on-primary' : 'bg-neutral text-fg-muted'
    }`}
  >
    KZ
  </span>
);

const Text = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center gap-1.5 text-(length:--text-control) leading-(--leading-control) font-bold">
    {children}
  </span>
);

const Row = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-wrap items-center gap-x-5 gap-y-4 pt-2">{children}</div>
);

const Overlay = () => (
  <>
    <Label>アイコンのボタン</Label>
    <Row>
      <Bell count={3} />
      <Bell count={12} />
      <Bell count={120} />
      <Bell />
    </Row>
    <Label>文字のボタン・アバター</Label>
    <Row>
      <Badge count={5} color="danger" aria-hidden="true">
        <Button aria-label="受信箱（未読 5 件）">受信箱</Button>
      </Badge>
      <Badge color="success" aria-hidden="true">
        <Avatar />
      </Badge>
      <Badge count={2} color="primary" aria-hidden="true">
        <Avatar />
      </Badge>
    </Row>
    <Label>濃い塗りのアバター（縁の有無を見る）</Label>
    <Row>
      <Badge color="success" aria-hidden="true">
        <Avatar dark />
      </Badge>
      <Badge count={4} color="danger" aria-hidden="true">
        <Avatar dark />
      </Badge>
      <Badge count={120} color="danger" aria-hidden="true">
        <Avatar dark />
      </Badge>
    </Row>
  </>
);

const Inline = () => (
  <>
    <Label>ボタンの中</Label>
    <Row>
      <Button appearance="outline">
        受信箱
        <Badge count={3} color="danger" />
      </Button>
      <Button appearance="outline">
        コメント
        <Badge count={12} />
      </Button>
    </Row>
    <Label>文字の横・状態の点</Label>
    <Row>
      <Text>
        未読
        <Badge count={3} color="danger" />
      </Text>
      <Text>
        レビュー待ち
        <Badge count={128} color="primary" />
      </Text>
    </Row>
    <Row>
      <Text>
        <Badge color="success" />
        稼働中
      </Text>
      <Text>
        <Badge color="danger" />
        停止中
      </Text>
      <Text>
        <Badge />
        下書き
      </Text>
    </Row>
    <Label>タグと並べる</Label>
    <Row>
      <span className="inline-flex items-center gap-1.5">
        <Tag color="success">公開中</Tag>
        <Badge count={3} color="success" />
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Tag color="danger">期限切れ</Tag>
        <Badge count={12} color="danger" />
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Tag>デザイン</Tag>
        <Badge count={8} />
      </span>
    </Row>
  </>
);

const Colors = () => (
  <div className="grid grid-cols-[auto_repeat(5,auto)] items-center justify-start gap-x-3 gap-y-2.5">
    {colors.map((color) => (
      <div key={color} className="col-span-full grid grid-cols-subgrid items-center">
        <span className="text-xs text-fg-subtle">{color}</span>
        <Badge count={3} color={color} />
        <Badge count={12} color={color} />
        <Badge count={120} color={color} />
        <Badge color={color} />
        <Tag color={color}>タグ</Tag>
      </div>
    ))}
  </div>
);

const Coarse = () => (
  <>
    <Label>角に重ねる</Label>
    <Row>
      <Bell count={3} />
      <Bell count={120} />
      <Badge color="success" aria-hidden="true">
        <Avatar />
      </Badge>
    </Row>
    <Label>文字の横に置く</Label>
    <Row>
      <Button appearance="outline">
        受信箱
        <Badge count={3} color="danger" />
      </Button>
      <Text>
        <Badge color="success" />
        稼働中
      </Text>
    </Row>
    <Row>
      <span className="inline-flex items-center gap-1.5">
        <Tag color="danger">期限切れ</Tag>
        <Badge count={12} color="danger" />
      </span>
    </Row>
  </>
);

const Cell = ({ column }: { column: Column }) => {
  const coarse = column.label === '指用';
  return (
    <div data-density={coarse ? 'coarse' : 'fine'} className="flex flex-col gap-3">
      {column.label === '角に重ねる' && <Overlay />}
      {column.label === '文字の横に置く' && <Inline />}
      {column.label === '数字だけ・色' && <Colors />}
      {coarse && <Coarse />}
    </div>
  );
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/39 Badge（数と小さな状態の点）',
  id: 'design-review-39-badge',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={39}
      axis="Badge（数と小さな状態の点）"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <Cell column={column} />}
    >
      <p>
        <strong className="text-fg">決まったこと</strong>
        （ADR-0061）。数（通知の件数など）と小さな状態の点を出す Badge
        を、タグとは別の部品として作りました。押せない、素の要素の部品です。ここで選ぶのは Badge
        の形（塗り・大きさ・重ねるときの縁）です。
      </p>
      <p>
        1行目の現行版は、Badge がないいま、タグ（淡い面・高さ
        20px）で数を出したときの見た目です。A〜C
        は濃い塗りに白い文字で、状態の色は塗りのお知らせと同じです（警告だけ黄色に濃紺の文字）。A
        を基準に、B は縁、C は大きさだけを変えています。重ねるときは、どの案も Badge
        の中心を相手の右上の角から 4px 内側に置きます（現行版は角の上）。
      </p>
      <p>
        列は場面です。「角に重ねる」ではアイコンのボタン・文字のボタン・丸いアバターに重ねた形を、「文字の横に置く」ではボタンの中や文字の横に置いた形と、タグと並べたときに別の部品に見えるかを見てください。「数字だけ・色」では
        1桁・2桁・99+・点を、利用者が選ぶ色と状態の色で並べています。右端は指用です。
      </p>
      <p>
        通知の件数は危険の色（赤）で出すのが慣例なので、例ではそうしています。色を指定しないときは、ほかの部品と同じくグレーです。
      </p>
      <p>
        どれを既定にするかを一言添えてください。場面で使い分けたい案があれば、それも教えてください。
      </p>
    </Comparison>
  ),
};
