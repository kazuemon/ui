import type { Meta, StoryObj } from '@storybook/react-vite';

import { Carousel } from '../../src/components/carousel/Carousel';
import { slides } from './carousel-parts';
import { type Candidate, type Column, Comparison } from './Comparison';

// 軸 287: Carousel で次のスライドを少し見せるか
//   値は tokens.css の --carousel-slide-size・--carousel-gap・--carousel-snap-align・--carousel-track-inset。
//   候補はこの上書きだけで作る（B は決めたあと peek で選べるようにした）。全案（現行版を含む）で値を明示する
const meta = {
  title: 'Design Review/287 Carousel の次のスライドを見せるか',
  id: 'design-review-287-carousel-peek',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current,B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'current,B'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '1 枚ずつ幅いっぱい',
    intent:
      '1 枚を枠の幅いっぱいに見せる。スクリーンショットがいちばん大きく、隣の 1 枚に気を取られない。続きがあることは、位置の点と次へのボタンで伝える',
    spec: [
      ['--carousel-slide-size', '100cqi（枠の幅いっぱい）'],
      ['--carousel-gap', '16px'],
      ['--carousel-snap-align', 'start'],
      ['--carousel-track-inset', '0'],
    ],
    tokens: {
      '--carousel-slide-size': '100cqi',
      '--carousel-gap': 'calc(var(--spacing) * 4)',
      '--carousel-snap-align': 'start',
      '--carousel-track-inset': '0px',
    },
  },
  {
    id: 'A',
    name: '次を少し見せる',
    intent:
      '1 枚を 88% にし、右に次の 1 枚の端をのぞかせる。横に送れることが、画像そのもので分かる（指の画面で効く）。左端はそろったまま',
    spec: [
      ['--carousel-slide-size', '88cqi'],
      ['--carousel-gap', '12px'],
      ['--carousel-snap-align', 'start'],
      ['--carousel-track-inset', '0'],
    ],
    tokens: {
      '--carousel-slide-size': '88cqi',
      '--carousel-gap': 'calc(var(--spacing) * 3)',
      '--carousel-snap-align': 'start',
      '--carousel-track-inset': '0px',
    },
  },
  {
    id: 'B',
    name: '両隣を少し見せる',
    intent:
      '1 枚を 80% にして中央に止め、左右に前後の 1 枚をのぞかせる。最初と最後の 1 枚も中央に止まるよう、両端に余白を取る。左端が本文とそろわない',
    spec: [
      ['--carousel-slide-size', '80cqi'],
      ['--carousel-gap', '12px'],
      ['--carousel-snap-align', 'center'],
      ['--carousel-track-inset', '10cqi（(100 - 80) / 2）'],
    ],
    tokens: {
      '--carousel-slide-size': '80cqi',
      '--carousel-gap': 'calc(var(--spacing) * 3)',
      '--carousel-snap-align': 'center',
      '--carousel-track-inset': 'calc((100cqi - 80cqi) / 2)',
    },
  },
];

const columns: Column[] = [
  { label: '最初の 1 枚' },
  { label: '途中の 1 枚' },
  { label: '最後の 1 枚' },
];

export const Peek: Story = {
  name: '次のスライドを見せるか',
  render: ({ pick }) => (
    <Comparison
      pick={pick}
      index={287}
      axis="Carousel の次のスライドを見せるか"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <div key={candidate.id} className="w-sm">
          <Carousel
            accessibleName="作品の画面"
            defaultValue={
              column.label.startsWith('最初') ? 0 : column.label.startsWith('途中') ? 2 : 4
            }
          >
            {slides}
          </Carousel>
        </div>
      )}
    >
      <p>
        <strong>
          決定: current（1 枚ずつ幅いっぱい）を既定にし、B（両隣を少し見せる）も peek で選べる。A
          は採らない。
        </strong>
      </p>
      <p>
        隣のスライドの端をのぞかせて、横に送れることを画像で見せるかを選びます。スクロールできる面は続きがあることを見せる、という原則
        1 の考えを、Carousel でどう満たすかの軸です。どの案でも、指で 1 枚ずつ止まります。
      </p>
      <p>
        推奨は current（幅いっぱい）です。作品のスクリーンショットは画面の端まで意味があるので、1
        枚を大きく、欠けずに見せます。続きがあることは、位置の点と次へのボタンが伝えます。A
        は指の画面で「横に送れる」ことが最も自然に伝わりますが、1
        枚が少し小さくなり、右端に切れた画像が常に見えます。B
        は写真のギャラリーらしい見た目ですが、左端が本文とそろわず整然さが下がります。
      </p>
    </Comparison>
  ),
};
