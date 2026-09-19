import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { landscape } from './samples/images';
import { Card, CardBody, CardImage } from '../../src/components/card/Card';
import { Heading } from '../../src/components/heading/Heading';
import { LinkCard } from '../../src/components/link-card/LinkCard';
import { Pager } from '../../src/components/pager/Pager';
import { Text } from '../../src/components/text/Text';

// 後半の軸 151: 全体が押せるカードを浮かせるときの、影と hover
// 決定: B2（ボタンと同じ影、hover の面は入力欄の塗りを白に半分混ぜた色）。画像の拡大は既定でオフにし、オンにもできるようにする（ADR は記録のときに書く）
//   ADR-0167 で「全体が押せるカードは、浮いた押すものにする（薄い影を付け、hover で影を減らし、押すと沈む。hover の輪郭の変化は外す）」と決めた
//   ここで決めるのは、影の強さ・hover で面を塗るか・画像を大きくする動きを残すか
//   候補は押せるカードのトークン（--card-line・--card-line-hover・--card-fill-hover・--card-shadow*・--card-hover-media-scale）の上書きだけで作る
//   LinkCard は同じトークンを読む。Pager の押せるカードは --pager-card-* を読むので、同じ値を写す

type Tokens = CSSProperties & Record<`--${string}`, string>;

// Card・LinkCard の値を、Pager の押せるカードにも写す
function withPager(tokens: Tokens): Tokens {
  return {
    ...tokens,
    '--pager-card-line-hover': tokens['--card-line-hover'],
    '--pager-card-fill-hover': tokens['--card-fill-hover'],
    '--pager-card-fill-press': tokens['--card-fill-hover'],
    '--pager-card-shadow': tokens['--card-shadow'],
    '--pager-card-shadow-hover': tokens['--card-shadow-hover'],
    '--pager-card-shadow-press': tokens['--card-shadow-press'],
  };
}

const none = '0 0 #0000';
// 面に合わせた影（C・D）: 大きい面なので、ボタンの影より少し広く落とす。hover ではボタンの影まで減らす
const cardShadow =
  '0 2px 8px rgb(from var(--color-shadow) r g b / 0.08), 0 1px 2px rgb(from var(--color-shadow) r g b / 0.06)';

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '影なし・面を塗る・輪郭を濃く（ADR-0129）',
    intent:
      'ページと同じレイヤーの面として、影を付けない。hover で面を入力欄の塗りにし、輪郭を 3:1 の濃さにし、画像を少し大きくする。押すと 1px 沈む。原則 1・3（ADR-0167）とは食い違っている。',
    spec: [
      ['影', 'なし'],
      ['hover の面', '入力欄の塗り'],
      ['hover の輪郭', '3:1 の濃さ'],
      ['画像', 'hover で 1.04 倍'],
      ['押下', '1px 沈む'],
    ],
    tokens: withPager({
      '--card-line': 'var(--color-surface-line)',
      '--card-line-hover': 'var(--color-line-strong)',
      '--card-fill-hover': 'var(--color-field)',
      '--card-shadow': none,
      '--card-shadow-hover': none,
      '--card-shadow-press': none,
      '--card-hover-media-scale': '1.04',
    }),
  },
  {
    id: 'A',
    name: 'ボタンと同じ影',
    intent:
      '白いボタンと同じ、輪郭程度の薄い影を付ける。hover で落ち影が消えて輪郭の線だけが残り、押すと 1px 沈む。面は白のまま、輪郭も変えない。画像は hover で少し大きくする。',
    spec: [
      ['影', 'ボタンと同じ（輪郭程度）'],
      ['hover', '落ち影が消える'],
      ['hover の面', '白のまま'],
      ['画像', 'hover で 1.04 倍'],
      ['押下', '影は hover のまま・1px 沈む'],
    ],
    tokens: withPager({
      '--card-line': 'var(--color-surface-line)',
      '--card-line-hover': 'var(--color-surface-line)',
      '--card-fill-hover': 'var(--color-surface)',
      '--card-shadow': 'var(--shadow-raised)',
      '--card-shadow-hover': 'var(--shadow-raised-hover)',
      '--card-shadow-press': 'var(--shadow-raised-press)',
      '--card-hover-media-scale': '1.04',
    }),
  },
  {
    id: 'B',
    name: 'A＋hover で面を塗る',
    intent:
      'A の影に、いまの hover の塗り（入力欄の塗り）を残す。影が減るだけでは変化が小さいときの手応えを、塗りで足す。画像のないカードでも hover が分かる。',
    spec: [
      ['影', 'ボタンと同じ（輪郭程度）'],
      ['hover', '落ち影が消える＋面を入力欄の塗りに'],
      ['画像', 'hover で 1.04 倍'],
      ['押下', '影は hover のまま・1px 沈む'],
    ],
    tokens: withPager({
      '--card-line': 'var(--color-surface-line)',
      '--card-line-hover': 'var(--color-surface-line)',
      '--card-fill-hover': 'var(--color-field)',
      '--card-shadow': 'var(--shadow-raised)',
      '--card-shadow-hover': 'var(--shadow-raised-hover)',
      '--card-shadow-press': 'var(--shadow-raised-press)',
      '--card-hover-media-scale': '1.04',
    }),
  },
  {
    id: 'B2',
    name: 'B の塗りを半分の濃さに',
    intent:
      'B の hover の塗りを、入力欄の塗りと白の中間にする。パレットには入力欄の塗りより淡いグレーがないので、入力欄の塗りを白に半分混ぜて作る（新しい値）。影が減る変化が主で、塗りは添えるだけになる。',
    spec: [
      ['影', 'ボタンと同じ（輪郭程度）'],
      ['hover', '落ち影が消える＋面を淡く塗る'],
      ['hover の面', '入力欄の塗りを白に 50% 混ぜた色'],
      ['画像', 'hover で 1.04 倍'],
      ['押下', '影は hover のまま・1px 沈む'],
    ],
    tokens: withPager({
      '--card-line': 'var(--color-surface-line)',
      '--card-line-hover': 'var(--color-surface-line)',
      '--card-fill-hover': 'color-mix(in oklab, var(--color-field) 50%, var(--color-surface))',
      '--card-shadow': 'var(--shadow-raised)',
      '--card-shadow-hover': 'var(--shadow-raised-hover)',
      '--card-shadow-press': 'var(--shadow-raised-press)',
      '--card-hover-media-scale': '1.04',
    }),
  },
  {
    id: 'C',
    name: '面に合わせた影',
    intent:
      'カードはボタンより大きい面なので、ボタンの影では浮いて見えにくい。少し広くやわらかい影を落とし、hover でボタンの影まで減らす。重なる面の影よりは低く見える。面は白のまま。',
    spec: [
      ['影', '少し広い（重なる面より低い）'],
      ['hover', 'ボタンの影まで減らす'],
      ['hover の面', '白のまま'],
      ['画像', 'hover で 1.04 倍'],
      ['押下', '影は hover のまま・1px 沈む'],
    ],
    tokens: withPager({
      '--card-line': 'var(--color-surface-line)',
      '--card-line-hover': 'var(--color-surface-line)',
      '--card-fill-hover': 'var(--color-surface)',
      '--card-shadow': cardShadow,
      '--card-shadow-hover': 'var(--shadow-raised)',
      '--card-shadow-press': 'var(--shadow-raised)',
      '--card-hover-media-scale': '1.04',
    }),
  },
  {
    id: 'D',
    name: 'C から画像の動きを外す',
    intent:
      'C の影の変化だけで手応えを伝え、画像は動かさない。影が減って沈むことに集中させ、カードの中身は静かなままにする。',
    spec: [
      ['影', '少し広い（重なる面より低い）'],
      ['hover', 'ボタンの影まで減らす'],
      ['hover の面', '白のまま'],
      ['画像', '動かさない'],
      ['押下', '影は hover のまま・1px 沈む'],
    ],
    tokens: withPager({
      '--card-line': 'var(--color-surface-line)',
      '--card-line-hover': 'var(--color-surface-line)',
      '--card-fill-hover': 'var(--color-surface)',
      '--card-shadow': cardShadow,
      '--card-shadow-hover': 'var(--shadow-raised)',
      '--card-shadow-press': 'var(--shadow-raised)',
      '--card-hover-media-scale': '1',
    }),
  },
];

const columns: Column[] = [
  { label: '通常' },
  { label: 'hover', preview: 'hover' },
  { label: '押下', note: 'hover したまま押したところ', preview: 'active' },
  { label: 'フォーカス（キーボード）', preview: 'focus' },
  { label: '画像のないカード', note: '左が通常、右が hover', preview: 'no-image' },
  { label: 'LinkCard・Pager', note: '同じトークンを読む仲間' },
  { label: '押せないカード', note: '比べる用。影を付けない（原則1）' },
];

const width: CSSProperties = { width: '240px' };

function Content({ title }: { title: string }) {
  return (
    <>
      <Text size="sm" tone="subtle">
        2026.09.19
      </Text>
      <Heading level={3} size={4}>
        {title}
      </Heading>
    </>
  );
}

function PressableCard({ title = 'カードの押し心地を詰める' }: { title?: string }) {
  return (
    <Card href="#card" style={width}>
      <CardImage src={landscape} alt="" />
      <CardBody>
        <Content title={title} />
      </CardBody>
    </Card>
  );
}

function TextOnlyCard({ hover }: { hover?: boolean }) {
  return (
    <Card href="#text" style={{ width: '120px' }} data-hover={hover || undefined}>
      <CardBody>
        <Content title="文だけ" />
      </CardBody>
    </Card>
  );
}

function renderCell(column: Column) {
  switch (column.preview) {
    case 'no-image':
      return (
        <div className="flex gap-3">
          <TextOnlyCard />
          <TextOnlyCard hover />
        </div>
      );
    default:
      break;
  }
  if (column.label === 'LinkCard・Pager') {
    return (
      <div className="flex w-[360px] flex-col gap-4">
        <LinkCard
          href="#link-card"
          title="トークンの決め方"
          description="役割のトークンを先に使い、部品のトークンは役割にない値だけに足します。"
          site="k6n.jp"
          image={landscape}
        />
        <Pager
          prev={{ href: '#prev', title: 'トークンの決め方' }}
          next={{ href: '#next', title: 'カードの押し心地を詰める' }}
        />
      </div>
    );
  }
  if (column.label === '押せないカード') {
    return (
      <Card style={width}>
        <CardImage src={landscape} alt="" />
        <CardBody>
          <Content title="押せないカード" />
        </CardBody>
      </Card>
    );
  }
  return <PressableCard />;
}

const meta = {
  title: 'Design Review/151 押せるカードの影と hover',
  id: 'design-review-151-pressable-card-float',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      hover: [
        '[data-preview="hover"] [data-slot="card"]',
        '[data-preview="active"] [data-slot="card"]',
        '[data-preview="no-image"] [data-slot="card"][data-hover]',
      ],
      active: ['[data-preview="active"] [data-slot="card"]'],
      focusVisible: ['[data-preview="focus"] [data-slot="card"]'],
    },
  },
  args: { pick: 'B2' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'B2', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={151}
      axis="全体が押せるカードを浮かせるときの、影と hover"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => renderCell(column)}
    >
      <p>
        全体が押せるカードは、浮いた押すものにすると決めました（ADR-0167）。薄い影を付け、hover
        で影を減らし、押すと沈みます。hover
        で輪郭を濃くする変化は外します。ここで決めるのは、影の強さ、hover
        で面を塗るか、画像を大きくする動きを残すかです。
      </p>
      <p>
        LinkCard と Pager
        の押せるカードも、同じ値になります。押せないカード（中のボタンだけが押せるカードを含む）は、ページと同じレイヤーのまま影を付けません。右端の列と比べてください。
      </p>
      <p>
        動き（影が減る・沈む・画像が大きくなる）は静止画では見えないので、実際にマウスを載せて押してみてください。どれを既定にするか、ほかに選べるようにしたい案があれば、それも教えてください。
      </p>
    </Comparison>
  ),
};
