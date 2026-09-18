import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Button } from '../../src/components/button/Button';
import { Heading } from '../../src/components/heading/Heading';
import { Image } from '../../src/components/image/Image';
import { Skeleton } from '../../src/components/skeleton/Skeleton';
import { Switch } from '../../src/components/switch/Switch';
import { Tag } from '../../src/components/tag/Tag';
import { Text } from '../../src/components/text/Text';
import { TextField } from '../../src/components/text-field/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';
import { landscape } from './samples/images';

// 後半の軸 89: 読み込み中の面（Skeleton）
// 変えるのは --skeleton-* だけ。全案（現行版を含む）で軸の値を明示する
// 動きは静止画では見えないので、ストーリーを開いて見る。動きを減らす設定の見え方は、OS の設定を切り替えて見る

const pulse = 'var(--animate-pulse)';
const white = (percent: number) =>
  `color-mix(in oklab, var(--color-surface) ${percent}%, transparent)`;

// 高さ・角（D）と色（C）は決まった値。変えるのは光だけ
const base = {
  '--skeleton-fill': 'var(--color-field)',
  '--skeleton-highlight': white(90),
  '--skeleton-sweep': 'skeleton-sweep 1.6s ease-in-out infinite',
  '--skeleton-sweep-angle': '90deg',
  '--skeleton-sweep-band': '14%',
  '--skeleton-sweep-size': '300% 100%',
  '--skeleton-sweep-attachment': 'scroll',
  '--skeleton-pulse': 'none',
  '--skeleton-pulse-reduced': pulse,
  '--skeleton-text-bar': '1em',
  '--skeleton-text-radius': 'var(--radius-sm)',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '前の C＋D（今の光）',
    intent:
      '入力欄の塗りの面に、白い縦の帯が左から右へ 1.6 秒で通る。前のラウンドで「露骨に目立つ」と言われた光。',
    spec: [
      ['光の濃さ', '白 90%'],
      ['帯', '縦・幅 14%'],
      ['動き', '1.6 秒で通り抜ける'],
    ],
    tokens: base,
  },
  {
    id: 'A',
    name: '淡く',
    intent: '形と動きは現行版のまま、光の白さを半分にする。',
    spec: [
      ['光の濃さ', '白 45%'],
      ['帯', '縦・幅 14%'],
      ['動き', '1.6 秒で通り抜ける'],
    ],
    tokens: { ...base, '--skeleton-highlight': white(45) },
  },
  {
    id: 'B',
    name: '広く柔らかく',
    intent:
      '帯を倍の幅にして、明るさの山をなだらかにする。境目が見えず、面全体がゆっくり明るくなって戻る。',
    spec: [
      ['光の濃さ', '白 60%'],
      ['帯', '縦・幅 30%'],
      ['動き', '1.6 秒で通り抜ける'],
    ],
    tokens: { ...base, '--skeleton-highlight': white(60), '--skeleton-sweep-band': '30%' },
  },
  {
    id: 'C',
    name: 'ゆっくり・間を空ける',
    intent: '光を 1.7 秒かけて通し、通ったあと 1.1 秒休む。光っていない時間が長い。',
    spec: [
      ['光の濃さ', '白 60%'],
      ['帯', '縦・幅 14%'],
      ['動き', '1.7 秒で通り、1.1 秒休む'],
    ],
    tokens: {
      ...base,
      '--skeleton-highlight': white(60),
      '--skeleton-sweep': 'skeleton-sweep-rest 2.8s ease-in-out infinite',
    },
  },
  {
    id: 'D',
    name: '斜め・淡く',
    intent:
      '右に傾けた帯（縦から 20°）が左上から右下へ通る。光は淡く、間を空ける。帯は面ごとに通るので、並んだ面ではそれぞれの幅で光る。',
    spec: [
      ['光の濃さ', '白 60%'],
      ['帯', '斜め 20°・幅 14%'],
      ['動き', '1.7 秒で通り、1.1 秒休む'],
      ['基準', '面ごと'],
    ],
    tokens: {
      ...base,
      '--skeleton-highlight': white(60),
      '--skeleton-sweep': 'skeleton-sweep-rest 2.8s ease-in-out infinite',
      '--skeleton-sweep-angle': '110deg',
    },
  },
  {
    id: 'E',
    name: '斜め・淡く・画面でつながる',
    intent:
      'D と同じ斜めの帯を、画面を基準にして通す。並んだ面（カードの画像と文字の行、隣のカード）で帯がひと続きに見え、1 本の光が画面を横切る。',
    spec: [
      ['光の濃さ', '白 60%'],
      ['帯', '斜め 20°・画面の幅の約 1/5'],
      ['動き', '1.7 秒で通り、1.1 秒休む'],
      ['基準', '画面'],
    ],
    tokens: {
      ...base,
      '--skeleton-highlight': white(60),
      '--skeleton-sweep': 'skeleton-sweep-rest 2.8s ease-in-out infinite',
      '--skeleton-sweep-angle': '110deg',
      '--skeleton-sweep-band': '8%',
      '--skeleton-sweep-size': '250% 100%',
      '--skeleton-sweep-attachment': 'fixed',
    },
  },
];

const columns: Column[] = [
  { label: 'ブログのカード', note: '左が読み込み中、右が読み込み後（画像・見出し・日付・Tag）' },
  { label: '並んだカード', note: '読み込み中のカードが 3 枚。帯がカードごとに光るか、つながるか' },
  { label: 'プロフィールの行', note: '丸い顔・名前・ボタン' },
  { label: '設定の画面', note: 'ラベルと入力欄・Switch の行' },
];

const Pair = ({ loading, loaded }: { loading: ReactNode; loaded: ReactNode }) => (
  <div data-density="fine" className="grid grid-cols-[repeat(2,15rem)] items-start gap-4">
    <div aria-busy className="min-w-0">
      {loading}
    </div>
    <div className="min-w-0">{loaded}</div>
  </div>
);

const Card = ({ children, media }: { children: ReactNode; media: ReactNode }) => (
  <article className="flex flex-col overflow-hidden rounded-card border border-line bg-surface">
    {media}
    <div className="flex flex-col gap-2 p-4">{children}</div>
  </article>
);

const blogCard = (
  <Pair
    loading={
      <Card media={<Skeleton radius="none" className="aspect-(--card-media-aspect)" />}>
        <Skeleton shape="text" lines={2} className="text-heading-4" />
        <Skeleton shape="text" className="w-1/3 text-body-sm" />
        <Skeleton radius="pill" className="h-5 w-16" />
      </Card>
    }
    loaded={
      <Card media={<Image ratio="var(--card-media-aspect)" radius="none" src={landscape} alt="" />}>
        <Heading level={3} size={4}>
          ポートフォリオのカードを作り直しました
        </Heading>
        <Text size="sm" tone="subtle">
          2026.09.18
        </Text>
        <div className="flex gap-1">
          <Tag>デザイン</Tag>
        </div>
      </Card>
    }
  />
);

const cardList = (
  <div data-density="fine" aria-busy className="grid w-[31rem] grid-cols-3 gap-2">
    {[0, 1, 2].map((i) => (
      <Card key={i} media={<Skeleton radius="none" className="aspect-(--card-media-aspect)" />}>
        <Skeleton shape="text" lines={2} className="text-body" />
        <Skeleton shape="text" className="w-1/2 text-body-sm" />
      </Card>
    ))}
  </div>
);

const profileRow = (
  <Pair
    loading={
      <div className="flex items-center gap-3">
        <Skeleton shape="circle" />
        <div className="flex min-w-0 flex-1 flex-col">
          <Skeleton shape="text" className="w-24 text-body" />
          <Skeleton shape="text" className="w-16 text-body-sm" />
        </div>
        <Skeleton className="h-(--spacing-control) w-20" />
      </div>
    }
    loaded={
      <div className="flex items-center gap-3">
        <div className="size-(--spacing-control) shrink-0 overflow-hidden rounded-full">
          <Image ratio={1} radius="none" outline={false} src={landscape} alt="" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <Text as="span">かずえもん</Text>
          <Text as="span" size="sm" tone="subtle">
            @kazuemon
          </Text>
        </div>
        <Button appearance="outline">フォロー</Button>
      </div>
    }
  />
);

const settings = (
  <Pair
    loading={
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-(--spacing-field-gap)">
          <Skeleton shape="text" className="w-16 text-label font-bold" />
          <Skeleton className="h-(--spacing-control)" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <Skeleton
            shape="text"
            className="w-32 text-(length:--text-control) leading-(--leading-control)"
          />
          <Skeleton radius="pill" className="h-(--switch-h) w-(--switch-w) shrink-0" />
        </div>
      </div>
    }
    loaded={
      <div className="flex flex-col gap-6">
        <TextField label="表示名" defaultValue="かずえもん" />
        <Switch label="メールで知らせる" togglePlacement="end" defaultChecked />
      </div>
    }
  />
);

const cells: Record<string, ReactNode> = {
  ブログのカード: blogCard,
  並んだカード: cardList,
  プロフィールの行: profileRow,
  設定の画面: settings,
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/89 読み込み中の面（Skeleton）',
  id: 'design-review-89-skeleton',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D', 'E'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={89}
      axis="読み込み中の面（Skeleton）"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => cells[column.label]}
    >
      <p>
        決定: B を既定、ゆっくり明暗（1 回目の A）と、横に通る画面基準の光（E
        を縦の帯にしたもの）を選べる（Skeleton の animation。ADR
        はあとで書く）。比べるためのトークンは部品の値に畳んだので、今はどの行も既定（B）の見た目で描かれます。
      </p>
      <p>
        高さ・角は D（文字の大きさいっぱいの帯・小さい角）、色は
        C（入力欄の塗り）に決めました。今回は、光をもっとさりげなくする見せ方を比べます。
      </p>
      <p>
        比べるのは、光の濃さ、帯の幅、速さと間、向き（縦・斜め）、光を面ごとに通すか画面を基準にしてつなげるか（D
        と
        E）です。並んだカードや、カードの画像と文字の行で、帯がつながって見えるかも見てください。動きは開いたまま見比べます。
      </p>
      <p>
        動きを減らす設定（OS
        の「視差効果を減らす」など）では、どの案も光は通らず、その場の明滅に置き換わります。どれを既定にするかに加えて、「光なし」などを部品の選択肢として選べるようにするかも決められます。
      </p>
    </Comparison>
  ),
};
