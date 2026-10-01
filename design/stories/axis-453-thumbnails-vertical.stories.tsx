import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Carousel, type CarouselThumbnailsPlacement } from '../../src/components/carousel/Carousel';
import { screens } from '../../src/components/carousel/story-images';
import { Image } from '../../src/components/image/Image';
import { Thumbnails } from '../../src/components/thumbnails/Thumbnails';
import { statePseudo } from '../../src/stories/story-states';

// 軸 453: Thumbnails を縦に並べるとき（Carousel の横に置く帯）の、帯の側と選んでいる棒の側
const meta = {
  title: 'Design Review/453 縦に並べた小さな画像の帯',
  id: 'design-review-453-thumbnails-vertical',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({
      hover: '[data-slot="thumbnails-item"]:nth-child(3)',
      focusVisible: '[data-slot="thumbnails-item"][aria-selected="true"]',
    }),
  },
  args: { pick: '' },
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

const placementOf: Record<string, CarouselThumbnailsPlacement> = {
  現行版: 'bottom',
  A: 'start',
  B: 'start',
  C: 'end',
  D: 'end',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '帯は枠の下（横）',
    intent:
      'いまの Carousel。Thumbnails は枠の下に横に並べるだけ。縦長の画面や、枠の横が空いているレイアウトでは高さを取る。比べるための基準',
    spec: [
      ['帯', '枠の下・横'],
      ['棒', '画像の下'],
    ],
    tokens: { '--carousel-thumbnails-bar-toward-slide': '1' },
  },
  {
    id: 'A',
    name: '帯は左・棒はスライドの側（右）',
    intent:
      '帯を枠の左に縦に並べ、選んでいる棒を画像の右（スライドの側）に立てる。Tabs の縦向きの印（並びの右端、中身の側）と同じ向き',
    spec: [
      ['帯', '枠の左・縦（thumbnailsPlacement="start"）'],
      ['棒', '画像の右（スライドの側）'],
    ],
    tokens: { '--carousel-thumbnails-bar-toward-slide': '1' },
  },
  {
    id: 'B',
    name: '帯は左・棒は外の側（左）',
    intent:
      'A の棒を画像の左（外の側）に立てる。帯とスライドのあいだに線が挟まらず、画像どうしが近く見える。棒はページの端に寄る',
    spec: [
      ['帯', '枠の左・縦'],
      ['棒', '画像の左（外の側）'],
    ],
    tokens: { '--carousel-thumbnails-bar-toward-slide': '0' },
  },
  {
    id: 'C',
    name: '帯は右・棒はスライドの側（左）',
    intent:
      '帯を枠の右に置く（thumbnailsPlacement="end"）。スライドが読みはじめの左に来る。棒はスライドの側（画像の左）',
    spec: [
      ['帯', '枠の右・縦（thumbnailsPlacement="end"）'],
      ['棒', '画像の左（スライドの側）'],
    ],
    tokens: { '--carousel-thumbnails-bar-toward-slide': '1' },
  },
  {
    id: 'D',
    name: '帯は右・棒は外の側（右）',
    intent: 'C の棒を画像の右（外の側）に立てる',
    spec: [
      ['帯', '枠の右・縦'],
      ['棒', '画像の右（外の側）'],
    ],
    tokens: { '--carousel-thumbnails-bar-toward-slide': '0' },
  },
];

const columns: Column[] = [
  { label: '通常', note: '2 枚目を選んでいる' },
  { label: '画像に hover', note: '3 枚目', preview: 'hover' },
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
      renderCell={(_column, candidate) => (
        <Carousel
          accessibleName="作品の画面"
          defaultValue={1}
          controlsPosition="overlay"
          thumbnailsPlacement={placementOf[candidate.id]}
          thumbnails={<Thumbnails>{thumbs}</Thumbnails>}
          className="w-[480px]"
        >
          {slides}
        </Carousel>
      )}
    >
      <p>
        Thumbnails に縦に並べる orientation="vertical" を、Carousel に Thumbnails の置き場所
        thumbnailsPlacement（bottom・start・end）を足しました。start・end
        では帯を枠の横に縦に並べ、枠の高さに収めます。
        入りきらない分は帯の中で縦にスクロールし、続きは上下の端の影で見せます。↑↓ で選びます。
      </p>
      <p>
        選ぶのは、既定にする帯の側（左か右か）と、選んでいる棒を画像のどちら側に立てるかです。横に並べたときの棒は画像の下で、変わりません。
        Thumbnails を単独で縦に並べたときの棒の側も、ここで決めた向きにそろえます。
      </p>
    </Comparison>
  ),
};
