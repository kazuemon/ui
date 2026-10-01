import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Carousel } from '../../src/components/carousel/Carousel';
import { screens } from '../../src/components/carousel/story-images';
import { Image } from '../../src/components/image/Image';

// 軸 452: Carousel の 1 画面に複数枚（slidesPerView）のときの、スライドのあいだと、次の 1 枚をのぞかせるか
const meta = {
  title: 'Design Review/452 カルーセルの複数枚の並べ方',
  id: 'design-review-452-carousel-per-view',
  parameters: { layout: 'fullscreen' },
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

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '1 枚ずつ（複数枚を並べられない）',
    intent:
      'いまの Carousel。slidesPerView を渡しても 1 枚を幅いっぱいに見せる（比べるため、この行だけ並べる数を 1 にしている）。比べるための基準',
    spec: [
      ['並べる数', '1'],
      ['あいだ', '16px'],
      ['のぞかせる端', 'なし'],
    ],
    tokens: {
      '--carousel-per-view-gap': 'calc(var(--spacing) * 4)',
      '--carousel-per-view-peek': '0',
    },
  },
  {
    id: 'A',
    name: 'ぴったり並べる・あいだ 16px',
    intent:
      '並べる数ちょうどの幅に割る。あいだは 1 枚のときと同じ 16px。続きがあることは、位置の印と次へのボタンで見せる',
    spec: [
      ['あいだ', '16px（1 枚のときと同じ）'],
      ['のぞかせる端', 'なし'],
    ],
    tokens: {
      '--carousel-per-view-gap': 'calc(var(--spacing) * 4)',
      '--carousel-per-view-peek': '0',
    },
  },
  {
    id: 'B',
    name: 'ぴったり並べる・あいだ 12px',
    intent:
      'A のあいだを、両隣を見せる peek と同じ 12px に詰める。小さな画像が並ぶとき、1 枚ずつが少し大きくなり、ひとまとまりに見える',
    spec: [
      ['あいだ', '12px（peek と同じ）'],
      ['のぞかせる端', 'なし'],
    ],
    tokens: {
      '--carousel-per-view-gap': 'calc(var(--spacing) * 3)',
      '--carousel-per-view-peek': '0',
    },
  },
  {
    id: 'C',
    name: '次の 1 枚の端をのぞかせる（0.2 枚）',
    intent:
      '右端に次の 1 枚の端を 0.2 枚分だけ見せる。指で横に送れることが、画像そのもので分かる。並べた画像は A より少し小さくなる',
    spec: [
      ['あいだ', '16px'],
      ['のぞかせる端', '0.2 枚'],
    ],
    tokens: {
      '--carousel-per-view-gap': 'calc(var(--spacing) * 4)',
      '--carousel-per-view-peek': '0.2',
    },
  },
  {
    id: 'D',
    name: 'あいだ 12px・のぞかせる端 0.35 枚',
    intent:
      'C を強め、詰めたあいだで 0.35 枚をのぞかせる。スマホのアプリの棚のような見え方。端の画像は半分近く切れる',
    spec: [
      ['あいだ', '12px'],
      ['のぞかせる端', '0.35 枚'],
    ],
    tokens: {
      '--carousel-per-view-gap': 'calc(var(--spacing) * 3)',
      '--carousel-per-view-peek': '0.35',
    },
  },
];

const columns: Column[] = [
  { label: '2 枚', note: 'slidesPerView={2}・幅 360px' },
  { label: '3 枚', note: 'slidesPerView={3}・幅 560px' },
  { label: '3 枚・数で示す', note: 'indicator="count"・止まる位置は 3 つ' },
];

const slides = screens.map((screen) => (
  <Image key={screen.alt} ratio={16 / 9} src={screen.src} alt={screen.alt} />
));

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={452}
      axis="カルーセルの複数枚の並べ方"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const two = column.label === '2 枚';
        const perView = candidate.id === '現行版' ? 1 : two ? 2 : 3;
        return (
          <Carousel
            accessibleName="作品の画面"
            slidesPerView={perView}
            indicator={column.label === '3 枚・数で示す' ? 'count' : 'dots'}
            className={two ? 'w-[360px]' : 'w-[560px]'}
          >
            {slides}
          </Carousel>
        );
      }}
    >
      <p>
        決定: 複数枚は B（ちょうど収める・あいだ 12px。次の 1 枚をのぞかせない）。ユーザーの返事「B
        でいいかなと思いました。」候補の見た目は、トークンを畳む前のこのコミットで比べられます。
      </p>
      <p>
        Carousel に、1 画面に並べる枚数 slidesPerView を足しました。数（slidesPerView={'{3}'}
        ）か、画面の幅の段ごとの数（{'{ base: 1, md: 3 }'}。Grid の columns
        と同じ段）を渡します。送るのは 1 枚ずつで、止まる位置は「枚数 − 並べる数 + 1」です（5 枚を 3
        枚ずつなら 3 つ）。位置の点と「1 / 3」もその数で示します。
      </p>
      <p>
        選ぶのは、複数枚のときのスライドのあいだと、右端に次の 1 枚の端をのぞかせるかです。1
        枚のときの両隣を見せる peek とは別の値です（peek は 1 枚のときだけ効きます）。
      </p>
    </Comparison>
  ),
};
