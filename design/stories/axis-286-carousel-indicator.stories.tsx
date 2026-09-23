import type { Meta, StoryObj } from '@storybook/react-vite';

import { Carousel, type CarouselIndicator } from '../../src/components/carousel/Carousel';
import { Thumbnails } from '../../src/components/thumbnails/Thumbnails';
import { manySlides, manyThumbs, slides, thumbs } from './carousel-parts';
import { type Candidate, type Column, Comparison } from './Comparison';

// 軸 286: Carousel の位置の示し方（いまどの 1 枚か）
//   印の形は Carousel の indicator（dots・count・none）。B は none に Thumbnails を組む。点の大きさと色は tokens.css の --carousel-dot-*（全案で同じ）
const meta = {
  title: 'Design Review/286 Carousel の位置の示し方',
  id: 'design-review-286-carousel-indicator',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current,A,B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'current,A', 'current,A,B'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

type IndicatorCandidate = Candidate & { indicator: CarouselIndicator; withThumbnails: boolean };

const dotTokens = {
  '--carousel-dot-size': 'calc(var(--spacing) * 2)',
  '--carousel-dot-current-width': 'calc(var(--spacing) * 5)',
  '--carousel-dot-color': 'var(--color-line-strong)',
  '--carousel-dot-current-color': 'var(--color-neutral-strong)',
};

const candidates: IndicatorCandidate[] = [
  {
    id: 'current',
    name: '点',
    intent:
      '1 枚に 1 つの点を並べ、いまの 1 枚の点を横に伸ばして濃くする。全部で何枚あって、いまどのあたりかが一目で分かる。点は押せない（指で押せる大きさを取れないため）',
    spec: [
      ['indicator', 'dots'],
      ['点', '8px・グレー（線の濃いグレー）'],
      ['いまの点', '20px の pill・濃いグレー'],
    ],
    tokens: dotTokens,
    indicator: 'dots',
    withThumbnails: false,
  },
  {
    id: 'A',
    name: '「3 / 5」',
    intent:
      '数で示す（Pagination のいちばん狭い形「5 / 10」と同じ書き方）。枚数が多くても幅が変わらない。何枚目かははっきりするが、全体のどのあたりかは数を読まないと分からない',
    spec: [
      ['indicator', 'count'],
      ['いまの数', '太字・本文の色'],
      ['/ 全体', 'グレーの文字'],
    ],
    tokens: dotTokens,
    indicator: 'count',
    withThumbnails: false,
  },
  {
    id: 'B',
    name: 'Thumbnails だけ',
    intent:
      '点も数も出さず、下の Thumbnails の選んでいる印で示す。どの 1 枚に何が写っているかまで見え、押して飛べる。代わりに縦に場所を取る',
    spec: [
      ['indicator', 'none'],
      ['thumbnails', '<Thumbnails>'],
    ],
    tokens: dotTokens,
    indicator: 'none',
    withThumbnails: true,
  },
];

const columns: Column[] = [
  { label: '5 枚・3 枚目', note: '作品のスクリーンショット' },
  { label: '12 枚・8 枚目', note: '枚数が多いとき' },
];

export const Indicator: Story = {
  name: '位置の示し方',
  render: ({ pick }) => (
    <Comparison
      pick={pick}
      index={286}
      axis="Carousel の位置の示し方"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const { indicator, withThumbnails } = candidates.find((c) => c.id === candidate.id)!;
        const many = column.label.startsWith('12');
        return (
          <div className="w-md">
            <Carousel
              accessibleName="作品の画面"
              defaultValue={many ? 7 : 2}
              indicator={indicator}
              thumbnails={
                withThumbnails ? <Thumbnails>{many ? manyThumbs : thumbs}</Thumbnails> : undefined
              }
            >
              {many ? manySlides : slides}
            </Carousel>
          </div>
        );
      }}
    >
      <p>
        <strong>
          決定: current（点）を既定にし、A（「3 / 5」）と B（Thumbnails だけ）も indicator
          で選べる。B は、画像に重ねるボタン（controlsPosition="overlay"）と組むのが見た目にもよい。
        </strong>
      </p>
      <p>
        いまどの 1 枚か、全部で何枚かをどう見せるかを選びます。どの案でも、読み上げでは、いまの 1
        枚が変わるたびに「3 / 5」を 1 回だけ読みます（見える印は読み上げに出しません）。
      </p>
      <p>
        推奨は current（点）です。作品のスクリーンショットは 3〜6
        枚ほどなので、点の数で「あと何枚あるか」がそのまま見え、横に送れることの手がかりにもなります。点は小物なので
        pill にし、いまの点だけを伸ばして人懐っこく見せます。A は枚数が多い並び（12
        枚）で点が長くなりすぎるときに向きます。B
        は、見出しの画像を選ばせたい作品のページに向きます。
      </p>
    </Comparison>
  ),
};
