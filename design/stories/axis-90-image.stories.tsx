import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';

import { Button } from '../../src/components/button/Button';
import { Figure } from '../../src/components/figure/Figure';
import { Heading } from '../../src/components/heading/Heading';
import { Image } from '../../src/components/image/Image';
import { Prose } from '../../src/components/prose/Prose';
import { Tag } from '../../src/components/tag/Tag';
import { Text } from '../../src/components/text/Text';
import { type Candidate, type Column, Comparison } from './Comparison';
import { landscape } from './samples/images';

// 後半の軸 90: 画像の読み込み中と失敗
// 変えるのは --image-* だけ。全案（現行版を含む）で軸の値を明示する
// 状態の固定: 読み込み中は src を渡さない。失敗は読み込めないデータの URL。読み込み後は、1 秒待ってから src を渡す（「もう一度読み込む」で繰り返す）

const sweep = 'var(--skeleton-sweep)';
const pulse = 'var(--animate-pulse)';
const broken = 'data:image/png;base64,AAAA';

const base = {
  '--image-loading-sweep': sweep,
  '--image-loading-pulse': 'none',
  '--image-loading-pulse-reduced': pulse,
  '--image-loading-icon-display': 'none',
  '--image-reveal-duration': 'var(--duration-normal)',
  '--image-error-icon-display': 'block',
  '--image-error-text-display': 'block',
};
const still = {
  '--image-loading-sweep': 'none',
  '--image-loading-pulse': 'none',
  '--image-loading-pulse-reduced': 'none',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'Skeleton と同じ面・ふわっと・アイコンと alt',
    intent:
      '読み込み中は Skeleton と同じ面（光が横切る）。読み込んだら 0.2 秒でふわっと出す。失敗したら、壊れた画像のアイコンと alt の文を面の上に出す。',
    spec: [
      ['読み込み中', 'Skeleton と同じ（光）'],
      ['出方', 'ふわっと 200ms'],
      ['失敗', 'アイコンと alt'],
    ],
    tokens: base,
  },
  {
    id: 'A',
    name: '無地の面',
    intent:
      '読み込み中の面を動かさない。画像は数が多いので、並んだカードが一斉に光らないぶん静か。',
    spec: [
      ['読み込み中', '無地の面'],
      ['出方', 'ふわっと 200ms'],
      ['失敗', 'アイコンと alt'],
    ],
    tokens: { ...base, ...still },
  },
  {
    id: 'B',
    name: '面にアイコン',
    intent: '無地の面の中央に画像のアイコンを置く（ラフの形）。画像が入る場所だと分かる。',
    spec: [
      ['読み込み中', '無地の面・画像のアイコン'],
      ['出方', 'ふわっと 200ms'],
      ['失敗', 'アイコンと alt'],
    ],
    tokens: { ...base, ...still, '--image-loading-icon-display': 'block' },
  },
  {
    id: 'C',
    name: 'すぐ出す',
    intent: '読み込んだ画像を、ふわっとさせずにすぐ出す。「もう一度読み込む」で現行版と見比べる。',
    spec: [
      ['読み込み中', 'Skeleton と同じ（光）'],
      ['出方', 'すぐ'],
      ['失敗', 'アイコンと alt'],
    ],
    tokens: { ...base, '--image-reveal-duration': '0ms' },
  },
  {
    id: 'D',
    name: '失敗はアイコンだけ',
    intent:
      '失敗したときに alt の文を出さず、アイコンだけにする。キャプションや見出しと文が重ならない。',
    spec: [
      ['読み込み中', 'Skeleton と同じ（光）'],
      ['出方', 'ふわっと 200ms'],
      ['失敗', 'アイコンだけ'],
    ],
    tokens: { ...base, '--image-error-text-display': 'none' },
  },
  {
    id: 'E',
    name: '失敗は面だけ',
    intent:
      '失敗しても何も出さず、止まった面だけを残す。読み込み中と見分けるのは動きの有無だけになる。',
    spec: [
      ['読み込み中', 'Skeleton と同じ（光）'],
      ['出方', 'ふわっと 200ms'],
      ['失敗', '面だけ'],
    ],
    tokens: { ...base, '--image-error-icon-display': 'none', '--image-error-text-display': 'none' },
  },
];

const columns: Column[] = [
  { label: '読み込み中', note: 'ブログのカードと、記事の中の Figure' },
  { label: '読み込み後', note: '1 秒読み込んでから出る。上の「もう一度読み込む」で繰り返す' },
  { label: '失敗', note: '読み込めない画像' },
];

type State = 'loading' | 'loaded' | 'error';

// 1 秒待ってから src を渡す。replay が変わるたびに作り直して、読み込み中へ戻す（Scenes に key を付ける）
function useDelayedSrc(state: State) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (state !== 'loaded') return undefined;
    const timer = setTimeout(() => setReady(true), 1000);
    return () => clearTimeout(timer);
  }, [state]);
  if (state === 'error') return broken;
  if (state === 'loaded' && ready) return landscape;
  return undefined;
}

function Scenes({ state }: { state: State }) {
  const src = useDelayedSrc(state);
  return (
    <div data-density="fine" className="flex w-[18rem] flex-col gap-6">
      <article className="flex flex-col overflow-hidden rounded-card border border-line bg-surface">
        <Image ratio="var(--card-media-aspect)" radius="none" src={src} alt="空と山の絵" />
        <div className="flex flex-col gap-2 p-4">
          <Heading level={3} size={4}>
            ポートフォリオのカードを作り直しました
          </Heading>
          <Text size="sm" tone="subtle">
            2026.09.18
          </Text>
          <div className="flex gap-1">
            <Tag>デザイン</Tag>
          </div>
        </div>
      </article>
      <div className="flex flex-col gap-4">
        <Prose>
          <p>記事の本文です。画像の前後に段落が並びます。</p>
        </Prose>
        <Figure src={src} alt="空と山の絵" caption="図 1. 空と山" />
        <Prose>
          <p>画像のあとに続く段落です。</p>
        </Prose>
      </div>
    </div>
  );
}

const stateOf: Record<string, State> = {
  読み込み中: 'loading',
  読み込み後: 'loaded',
  失敗: 'error',
};

function ImageComparison({ pick }: { pick: string }) {
  const [replay, setReplay] = useState(0);
  return (
    <Comparison
      index={90}
      axis="画像の読み込み中と失敗"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <Scenes key={replay} state={stateOf[column.label] ?? 'loading'} />}
    >
      <p>
        決定: 読み込み中は Skeleton
        と同じ面、読み込めたらすぐ出す（C）、失敗したら破れた画像のアイコンと「読み込みに失敗しました」（errorText
        で変えられる）。ratio も寸法もない画像は、16:9 の画像だと仮定して読み込み中と失敗したときは
        16:9 の枠を取り、読み込めたら画像本来の比の高さに変える（ADR
        はあとで書く）。候補の切り替えのトークンは部品の値に畳んだので、今はどの行も決定の見た目で描かれます。
      </p>
      <p>
        Image（と、それを使う
        Figure）の、読み込み中・読み込み後・失敗の見せ方です。決めるのは、読み込み中の面（Skeleton
        と同じ・無地・アイコン）、読み込んだときの出方（ふわっと・すぐ）、失敗したときの見せ方（アイコンと
        alt・アイコンだけ・面だけ）です。
      </p>
      <p>
        角と輪郭は Figure と同じです。場所は ratio か width・height
        で先に取るので、読み込んでも下の内容は跳びません（どれもないときは、読み込めたときに高さが変わります）。動きを減らす設定では、光はその場の明滅になり、ふわっとは出ません。どれを既定にし、どれを選べるようにするかも決められます。
      </p>
      <div>
        <Button appearance="outline" onClick={() => setReplay((n) => n + 1)}>
          もう一度読み込む
        </Button>
      </div>
    </Comparison>
  );
}

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/90 画像の読み込み中と失敗',
  id: 'design-review-90-image',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'C' },
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
  render: ({ pick }) => <ImageComparison pick={pick} />,
};
