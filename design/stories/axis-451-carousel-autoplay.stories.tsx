import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useEffect, useRef } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Carousel } from '../../src/components/carousel/Carousel';
import { screens } from '../../src/components/carousel/story-images';
import { Image } from '../../src/components/image/Image';
import { statePseudo } from '../../src/stories/story-states';

// 軸 451: Carousel の自動の送り（autoPlay）を止めるボタンの置き場所と形
const meta = {
  title: 'Design Review/451 カルーセルの自動の送りを止めるボタン',
  id: 'design-review-451-carousel-autoplay',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({
      hover: '[data-slot="carousel-autoplay"]',
      focusVisible: '[data-slot="carousel-autoplay"]',
    }),
  },
  args: { pick: 'B' },
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

const hidden = {
  '--carousel-autoplay-inline-outline-display': 'none',
  '--carousel-autoplay-inline-plain-display': 'none',
  '--carousel-autoplay-overlay-display': 'none',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'ボタンなし',
    intent:
      '自動で送るが、止めるボタンを出さない。マウスを載せたとき・キーボードで中に入ったときだけ止まる。指で見ている人は止められない（WCAG 2.2.2 を満たさない）。比べるための基準',
    spec: [
      ['置き場所', 'なし'],
      ['形', '—'],
    ],
    tokens: hidden,
  },
  {
    id: 'A',
    name: '下の行・印の左・枠線のボタン',
    intent:
      '前へ・次へと同じ枠線のアイコンのボタンを、位置の点の左に置く。操作がすべて下の行にまとまり、画像に重ならない（前へ・次へを画像に重ねない考えと同じ）',
    spec: [
      ['置き場所', '下の行の中央、位置の印の左'],
      ['形', '枠線のアイコンのボタン（前へ・次へと同じ）'],
    ],
    tokens: { ...hidden, '--carousel-autoplay-inline-outline-display': 'contents' },
  },
  {
    id: 'B',
    name: '下の行・印の左・線のないボタン',
    intent:
      'A と同じ場所で、枠線を外したいちばん軽い形にする。前へ・次へより一段控えめになり、ボタンが 3 つ並んで見えない。押せる範囲は hover の塗りで見える',
    spec: [
      ['置き場所', '下の行の中央、位置の印の左'],
      ['形', '線のないアイコンのボタン'],
    ],
    tokens: { ...hidden, '--carousel-autoplay-inline-plain-display': 'contents' },
  },
  {
    id: 'C',
    name: '画像の右下に重ねる白い丸',
    intent:
      '画像の右下の隅に、白い丸のボタンを重ねる（controlsPosition="overlay" の前へ・次へ、Video の再生ボタンと同じ浮いた形）。動いているものの上で止められる。画像の隅が隠れる',
    spec: [
      ['置き場所', '画像の右下（枠の端から 12px）'],
      ['形', '白い塗りの丸（影あり）'],
    ],
    tokens: { ...hidden, '--carousel-autoplay-overlay-display': 'flex' },
  },
  {
    id: 'D',
    name: '画像の左下に重ねる白い丸',
    intent:
      'C を左下に置く。読みはじめの側にあるので、目に入りやすい。右下に作品の名前などを置く画像と重ならない',
    spec: [
      ['置き場所', '画像の左下（枠の端から 12px）'],
      ['形', '白い塗りの丸（影あり）'],
    ],
    tokens: {
      ...hidden,
      '--carousel-autoplay-overlay-display': 'flex',
      '--carousel-autoplay-overlay-justify': 'start',
    },
  },
];

const columns: Column[] = [
  { label: '送っているとき', note: '一時停止の印' },
  { label: 'ボタンに hover', preview: 'hover' },
  { label: 'ボタンにフォーカス（キーボード）', preview: 'focus' },
  { label: '止めたとき', note: '再生の印に変わる' },
  { label: '前へ・次へを画像に重ねる', note: 'controlsPosition="overlay"' },
];

const slides = screens.map((screen) => (
  <Image key={screen.alt} ratio={16 / 9} src={screen.src} alt={screen.alt} />
));

/** 描いたあとに止めるボタンを 1 回押し、止めた見た目にする（比べるためだけ） */
function Paused({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLButtonElement>('[data-slot="carousel-autoplay"]')?.click();
  }, []);
  return <div ref={ref}>{children}</div>;
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={451}
      axis="カルーセルの自動の送りを止めるボタン"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => {
        // 比べているあいだに送られないよう、間を長くしておく
        const carousel = (
          <Carousel
            accessibleName="作品の画面"
            autoPlay
            loop
            autoPlayInterval={1_000_000}
            controlsPosition={column.label === '前へ・次へを画像に重ねる' ? 'overlay' : 'bottom'}
            className="w-[320px]"
          >
            {slides}
          </Carousel>
        );
        return column.label === '止めたとき' ? <Paused>{carousel}</Paused> : carousel;
      }}
    >
      <p>
        決定: 自動の送りを止めるボタンは
        B（下の行の位置の印の左に置く、線のないいちばん軽いボタン）。ユーザーの返事「B
        でいいかなと思いました。」候補の見た目は、トークンを畳む前のこのコミットで比べられます。
      </p>
      <p>
        Carousel に、自動で送る autoPlay（間は autoPlayInterval、既定 5 秒）と、端でつなぐ loop
        を足しました。自動の送りは、マウスを載せたとき・キーボードで中に入ったとき・別のタブにいるあいだは止まり、
        動きを減らす設定では止めた状態で始まります。送っているあいだは「3 / 5」を読み上げません。
      </p>
      <p>
        5 秒より長く動くものには止める手段が要るので（WCAG
        2.2.2）、止めるボタンを必ず出します。選ぶのは、そのボタンの置き場所と形です。押すと一時停止の印が再生の印に変わります。
        比べやすいよう、この比較では送る間を長くしてあります。
      </p>
    </Comparison>
  ),
};
