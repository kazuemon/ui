import type { Meta, StoryObj } from '@storybook/react-vite';

import { Carousel } from '../../src/components/carousel/Carousel';
import { slides } from './carousel-parts';
import { type Candidate, type Column, Comparison } from './Comparison';

// 軸 289: Carousel の端の 1 枚での前へ・次へ（それ以上送れないボタン）
//   決めたときの案 A（消す）は --carousel-edge-button-visibility で作っていた。採らなかったので、案とトークンを外した
const meta = {
  title: 'Design Review/289 Carousel の端での前へ・次へ',
  id: 'design-review-289-carousel-edge-buttons',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '押せない見た目で残す',
    intent:
      '最初の 1 枚では前へ、最後の 1 枚では次へを、押せない見た目（薄いグレー）で残す。Pagination の前へ・次へと同じ。ボタンの位置が動かず、端にいることがボタンでも分かる',
    spec: [['端のボタン', '押せない見た目で残す']],
  },
];

const columns: Column[] = [
  { label: '下の行・最初の 1 枚' },
  { label: '下の行・最後の 1 枚' },
  { label: '画像に重ねる・最初の 1 枚' },
  { label: '画像に重ねる・最後の 1 枚' },
];

export const EdgeButtons: Story = {
  name: '端での前へ・次へ',
  render: ({ pick }) => (
    <Comparison
      pick={pick}
      index={289}
      axis="Carousel の端での前へ・次へ"
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <div className="w-72">
          <Carousel
            accessibleName="作品の画面"
            controlsPosition={column.label.startsWith('画像') ? 'overlay' : 'bottom'}
            defaultValue={column.label.endsWith('最初の 1 枚') ? 0 : 4}
          >
            {slides}
          </Carousel>
        </div>
      )}
    >
      <p>
        <strong>決定: current（押せない見た目で残す）だけにする。A（消す）は採らない。</strong>
      </p>
      <p>
        最初の 1 枚で前へ、最後の 1 枚で次へを、どう見せるかを選びます。Carousel
        は端でつながらない（最後の次は最初に戻らない）ので、端では片方のボタンが押せません。押したボタンが押せなくなったときは、フォーカスを反対のボタンへ移します。
      </p>
      <p>
        推奨は current（押せない見た目で残す）です。Pagination
        の前へ・次へと同じ扱いで、ボタンの有無で並びが変わらず、「ここが端」だとボタンでも分かります（原則13）。送れない向きのボタンを消す案
        A も比べましたが、採りませんでした（案とトークンは外しています）。
      </p>
    </Comparison>
  ),
};
