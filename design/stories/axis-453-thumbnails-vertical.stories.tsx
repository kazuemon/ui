import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Carousel } from '../../src/components/carousel/Carousel';
import { screens } from '../../src/components/carousel/story-images';
import { Image } from '../../src/components/image/Image';
import { Thumbnails } from '../../src/components/thumbnails/Thumbnails';

// 軸 453: Thumbnails を縦に並べるとき（Carousel の横に置く帯）の、選んでいる印とスクロールのつまみの置き場所
const frame = '[data-slot="thumbnails-frame"]';
const item = '[data-slot="thumbnails-item"]';
const meta = {
  title: 'Design Review/453 縦に並べた小さな画像の帯',
  id: 'design-review-453-thumbnails-vertical',
  parameters: {
    layout: 'fullscreen',
    // 帯に載せたとき（つまみが出る）と、そのまま 3 枚目の画像に載せたとき、選んでいる画像へのフォーカス
    pseudo: {
      rootSelector: 'body',
      hover: [
        `[data-preview="hover"] ${frame}`,
        `[data-preview="item-hover"] ${frame}`,
        `[data-preview="item-hover"] ${item}:nth-child(3)`,
      ],
      focusVisible: [`[data-preview="focus"] ${item}[aria-selected="true"]`],
    },
  },
  args: { pick: 'C' },
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
  '--carousel-thumbnails-bar-toward-slide': '1',
  '--thumbnails-vertical-bar-under': '0',
  '--thumbnails-vertical-scrollbar-start': '0',
  '--thumbnails-vertical-scrollbar-room': '0',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '棒は右・つまみも右に重ねる',
    intent:
      'いまの形。選んでいる棒を画像の右（スライドの側）に縦に引き、スクロールのつまみも帯の右端に重ねる。帯に載せてつまみが出ると、棒とつまみが同じ場所に重なる。比べるための基準',
    spec: [
      ['選んでいる印', '画像の右に縦の棒'],
      ['つまみ', '帯の右端・中身に重ねる'],
    ],
    tokens: base,
  },
  {
    id: 'A',
    name: '棒を左（外の側）へ・つまみは右',
    intent:
      '棒を画像の左（ページの端の側）に移し、つまみとは反対の側に置く。帯の幅は今と同じ。棒はスライドから遠くなる',
    spec: [
      ['選んでいる印', '画像の左に縦の棒'],
      ['つまみ', '帯の右端・中身に重ねる（棒とは反対の側）'],
    ],
    tokens: { ...base, '--carousel-thumbnails-bar-toward-slide': '0' },
  },
  {
    id: 'B',
    name: '棒は右・つまみの溝を棒の外に取る',
    intent:
      '棒は画像の右（スライドの側）のまま。帯の右端につまみの分の溝を取り、つまみを棒のさらに外に置く。重ならないが、帯とスライドのあいだが少し広がる',
    spec: [
      ['選んでいる印', '画像の右に縦の棒'],
      ['つまみ', '棒の外の溝（中身に重ねない）'],
    ],
    tokens: { ...base, '--thumbnails-vertical-scrollbar-room': '1' },
  },
  {
    id: 'C',
    name: '棒は右・つまみを帯の左へ',
    intent:
      '棒は画像の右（スライドの側）のまま。つまみを帯の左端（ページの端の側）に移し、溝を取る。棒とつまみが帯の両側に分かれる',
    spec: [
      ['選んでいる印', '画像の右に縦の棒'],
      ['つまみ', '帯の左端の溝（中身に重ねない）'],
    ],
    tokens: {
      ...base,
      '--thumbnails-vertical-scrollbar-start': '1',
      '--thumbnails-vertical-scrollbar-room': '1',
    },
  },
  {
    id: 'D',
    name: '棒を画像の下に横に引く',
    intent:
      '縦に並べても、横に並べたときと同じく棒を画像の下に引く。棒が帯の横の端に来ないので、つまみと重ならない。画像の間がその分広がる。つまみは右端の溝に置く',
    spec: [
      ['選んでいる印', '画像の下に横の棒（横向きと同じ）'],
      ['つまみ', '帯の右端の溝（中身に重ねない）'],
    ],
    tokens: {
      ...base,
      '--thumbnails-vertical-bar-under': '1',
      '--thumbnails-vertical-scrollbar-room': '1',
    },
  },
];

const columns: Column[] = [
  { label: '通常', note: '2 枚目を選んでいる。つまみは隠れている' },
  { label: '帯に載せたとき', note: 'つまみが出る', preview: 'hover' },
  { label: '3 枚目の画像に hover', note: 'つまみも出ている', preview: 'item-hover' },
  { label: 'フォーカス（キーボード）', note: '選んでいる画像', preview: 'focus' },
];

const slides = screens.map((screen) => (
  <Image key={screen.alt} ratio={16 / 9} src={screen.src} alt={screen.alt} />
));
const thumbs = screens.map((screen) => <img key={screen.alt} src={screen.src} alt={screen.alt} />);

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={453}
      axis="縦に並べた小さな画像の帯"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={() => (
        <Carousel
          accessibleName="作品の画面"
          defaultValue={1}
          controlsPosition="overlay"
          thumbnailsPlacement="start"
          thumbnails={<Thumbnails>{thumbs}</Thumbnails>}
          className="w-[380px]"
        >
          {slides}
        </Carousel>
      )}
    >
      <p>
        決定: 縦に並べた帯は
        C（選んでいる棒は帯の内側＝スライドの側、スクロールのつまみは外側＝ページの端の側に溝を取って置く）。帯を左（start）に置くときは棒が右・つまみが左、右（end）に置くときは左右を入れ替えて棒が左・つまみが右。Carousel
        の横に置かない Thumbnails
        単体の縦向きは、左に置く形（棒が右・つまみが左）を既定にする。ユーザーの返事「左にサムネがあるときは棒が右（内側）・スクロールバーが左（外側）で、右の時はそれぞれ逆、で良さそうです。完全には納得がいっていないので、後から修正すると思います。」候補の見た目は、トークンを畳む前のこのコミットで比べられます。
      </p>
      <p>
        前の比較で「帯だとスクロールバーとの被りが気になりますね…見た目をもう一度練り直したいかもです。」とあったので、作り直しました。
        縦に並べた帯は枠の高さに収め、入りきらない分を帯の中でスクロールします。帯に載せるとスクロールのつまみが帯の端に出ます。
        いまの形では、選んでいる棒とつまみが同じ右端に重なります。
      </p>
      <p>
        選ぶのは、選んでいる印とつまみを重ねない置き方です。どの案も帯は枠の左（thumbnailsPlacement="start"）で比べています。
        帯を右に置く（end）ときは左右を入れ替えた形になります。Thumbnails
        を単独で縦に並べたときも、ここで決めた形にそろえます。
      </p>
    </Comparison>
  ),
};
