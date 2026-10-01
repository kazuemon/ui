import type { Meta, StoryObj } from '@storybook/react-vite';

import { landscape, landscapeTiny } from './axis-image-samples';
import { type Candidate, type Column, Comparison } from './Comparison';
import { Image } from '../../src/components/image/Image';

// 軸 493: Image の仮画像（placeholder）のぼかしの強さ
const meta = {
  title: 'Design Review/493 仮画像のぼかしの強さ',
  id: 'design-review-493-image-placeholder-blur',
  parameters: { layout: 'fullscreen' },
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

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '仮画像なし',
    intent: 'いまの Image。読み込み中は光の横切る面を置く。比べるための基準',
    spec: [['ぼかし', '—']],
  },
  {
    id: 'A',
    name: 'ぼかさない',
    intent:
      '縮めた仮画像を、ブラウザの拡大のまま広げる。色の塊がにじんで見え、元の絵の配置が最もよく分かる',
    spec: [['ぼかし', '0']],
    tokens: { '--image-placeholder-blur': '0px' },
  },
  {
    id: 'B',
    name: '弱い',
    intent: '少しだけぼかす。色の塊の境目が消え、絵の配置（空・山・地面）はまだ読める',
    spec: [['ぼかし', '8px']],
    tokens: { '--image-placeholder-blur': 'calc(var(--spacing) * 2)' },
  },
  {
    id: 'C',
    name: '中くらい',
    intent: '色の流れだけが残る。何の絵かは分からないが、上下の色の配置は分かる',
    spec: [['ぼかし', '16px']],
    tokens: { '--image-placeholder-blur': 'calc(var(--spacing) * 4)' },
  },
  {
    id: 'D',
    name: '強い',
    intent: '色の平均に近いもやになる。仮画像の粗さが目立たず、面に近い落ち着いた見た目',
    spec: [['ぼかし', '32px']],
    tokens: { '--image-placeholder-blur': 'calc(var(--spacing) * 8)' },
  },
];

const columns: Column[] = [
  { label: '大きい', note: '幅 360px。仮画像は 16×9 px' },
  { label: '小さい', note: '幅 160px（カードの横の画像など）' },
  { label: '本物', note: '読み込めたときの見た目' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={493}
      axis="仮画像のぼかしの強さ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const placeholder = candidate.id === '現行版' ? undefined : landscapeTiny;
        return (
          <div className={column.label === '小さい' ? 'w-40' : 'w-90'}>
            <Image
              src={column.label === '本物' ? landscape : undefined}
              alt="空と山の絵"
              ratio="16 / 9"
              placeholder={placeholder}
            />
          </div>
        );
      }}
    >
      <p>
        Image
        の仮画像（placeholder）を、どれだけぼかして敷くかです。ぼかしは画像の大きさによらず同じ強さなので、小さい画像ほど強く効きます。ぼかした縁が透けないよう、仮画像は少し大きくして枠で切っています。
      </p>
      <p>
        仮画像は、利用者が作る数十 px の縮小版（Next.js の
        blurDataURL、Astro・画像の配信サービスの縮小版）を想定しています。BlurHash
        のようにはじめからぼやけた要素を渡すときは、ぼかしを重ねることになります。
      </p>
    </Comparison>
  ),
};
