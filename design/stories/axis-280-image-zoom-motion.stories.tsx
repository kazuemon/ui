import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { landscape, portrait } from './image-zoom-images';
import { ZoomFrame } from './image-zoom-frame';

// 軸 280: ImageZoom の開閉の動き
//   値は tokens.css の --image-zoom-motion（expand・fade）・--image-zoom-duration-in・--image-zoom-duration-out・
//   --image-zoom-ease・--image-zoom-fade-scale。候補はこの上書きだけで作る。全案（現行版を含む）で値を明示する
//   動きを減らす設定では、どの案も動かさずにすぐ出す・消す（原則14）。確かめるときは OS の設定を切る
const meta = {
  title: 'Design Review/280 ImageZoom の開閉の動き',
  id: 'design-review-280-image-zoom-motion',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current,A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'current,A'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '元の位置から広がる',
    intent:
      '押した画像がその場所から広がって画面の中央に来る。閉じると元の場所へ縮んで戻る。切り取って置いた画像（ratio）も、広がりながら全体が見えてくる。どの画像を開いたか、閉じたらどこへ戻るかが動きで分かる',
    spec: [
      ['動き方', 'expand（位置と大きさ）'],
      ['開く・閉じる', '250ms・200ms'],
      ['緩急', 'シートと同じ（--ease-sheet）'],
    ],
    tokens: {
      '--image-zoom-motion': 'expand',
      '--image-zoom-duration-in': 'var(--duration-slow)',
      '--image-zoom-duration-out': 'var(--duration-normal)',
      '--image-zoom-ease': 'var(--ease-sheet)',
      '--image-zoom-fade-scale': 'var(--transition-preset-scale)',
    },
  },
  {
    id: 'A',
    name: 'その場でふわっと出る',
    intent:
      'Dialog と同じく、画面の中央で、濃さと少し小さい姿（96%）から出る。押した画像はページに残る。動きが小さく落ち着いているが、どの画像が大きくなったかは動きでは分からない',
    spec: [
      ['動き方', 'fade（濃さ・96% から）'],
      ['開く・閉じる', '200ms・150ms（浮かぶ面と同じ）'],
      ['緩急', 'シートと同じ（--ease-sheet）'],
    ],
    tokens: {
      '--image-zoom-motion': 'fade',
      '--image-zoom-duration-in': 'var(--popup-duration-in)',
      '--image-zoom-duration-out': 'var(--popup-duration-out)',
      '--image-zoom-ease': 'var(--ease-sheet)',
      '--image-zoom-fade-scale': 'var(--transition-preset-scale)',
    },
  },
  {
    id: 'B',
    name: '元の位置から、ゆっくり広がる',
    intent:
      'current と同じ動きを、長くする。広がる様子を目で追えるが、見たい画像が出るまでに待たされる感じが出る',
    spec: [
      ['動き方', 'expand（位置と大きさ）'],
      ['開く・閉じる', '400ms・300ms'],
      ['緩急', 'シートと同じ（--ease-sheet）'],
    ],
    tokens: {
      '--image-zoom-motion': 'expand',
      '--image-zoom-duration-in': '400ms',
      '--image-zoom-duration-out': '300ms',
      '--image-zoom-ease': 'var(--ease-sheet)',
      '--image-zoom-fade-scale': 'var(--transition-preset-scale)',
    },
  },
];

const columns: Column[] = [
  { label: 'パソコン', note: '画像を押して開き、もう一度押すか Esc で閉じる' },
  { label: 'パソコン（切り取った画像）', note: 'ratio={1} で正方形に切り取った画像' },
  { label: 'スマートフォン', note: '押して開き、押すか上下に引いて閉じる' },
];

export const Motion: Story = {
  name: '開閉の動き',
  render: ({ pick }) => (
    <Comparison
      pick={pick}
      index={280}
      axis="ImageZoom の開閉の動き"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) =>
        column.label === 'スマートフォン' ? (
          <ZoomFrame key={candidate.id} device="phone" src={portrait} alt="縦長の絵" />
        ) : (
          <ZoomFrame
            key={candidate.id}
            device="desktop"
            src={landscape}
            alt="空と山の絵"
            ratio={column.label === 'パソコン' ? undefined : 1}
          />
        )
      }
    >
      <p>
        <strong>
          決定: current（元の位置から広がる）を既定にし、A（その場でふわっと）も motion="fade"
          で選べる。B（ゆっくり）は採らない。
        </strong>
      </p>
      <p>
        画像を押して拡大するとき・閉じるときの動きを選びます。各枠の画像を押して試してください（開いているあいだはページのスクロールが止まります）。後ろの面は軸
        279 の current です。OS
        の「視差効果を減らす」（動きを減らす設定）がオンだと、どの案も動かずにすぐ出ます。
      </p>
      <p>
        推奨は current
        です。動きは「ものがどこから来てどこへ行ったか」を伝えるためのもので、押した画像がそのまま大きくなると、どの画像を見ているか、閉じたらどこへ戻るかが言葉なしに分かります。長さは重なる面の中でいちばん長いシートと同じ
        250ms にし、閉じるほうを短くしています。A
        は落ち着いていますが、押した画像と拡大した画像のつながりが見えません。B
        は目で追えますが、画像が並ぶ記事で何枚も開くと待たされます。
      </p>
      <p>
        既定をどれにしますか。current
        を既定にして、A（その場でふわっと）も選べる、という形にもできます（props は、たとえば{' '}
        <code>motion="expand" | "fade"</code> を想定しています）。
      </p>
    </Comparison>
  ),
};
