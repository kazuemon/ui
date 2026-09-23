import type { Meta, StoryObj } from '@storybook/react-vite';

import { Carousel, type CarouselControlsPosition } from '../../src/components/carousel/Carousel';
import { slides } from './carousel-parts';
import { type Candidate, type Column, Comparison } from './Comparison';

// 軸 285: Carousel の前へ・次へのボタンの置き場所
//   下の行の並び方は tokens.css の --carousel-controls-columns・--carousel-controls-areas・--carousel-indicator-justify。
//   案は controlsPosition（bottom・bottom-end・overlay）で選ぶ。全案で値を明示する
const meta = {
  title: 'Design Review/285 Carousel の前へ・次への置き場所',
  id: 'design-review-285-carousel-controls',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current,A,B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'current,A,B'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

type ControlsCandidate = Candidate & { placement: CarouselControlsPosition };

const candidates: ControlsCandidate[] = [
  {
    id: 'current',
    name: '下の行・両端',
    intent:
      '画像の下の行に、前へを左端、次へを右端に置き、位置の点を中央に置く。画像には何も重ねず、スクリーンショットを隅まで見せる。ボタンは枠線のボタン（控えめな操作）',
    spec: [
      ['controlsPosition', 'bottom（既定）'],
      ['--carousel-controls-columns', 'auto 1fr auto'],
      ['--carousel-controls-areas', "'prev indicator next'"],
      ['--carousel-indicator-justify', 'center'],
    ],
    tokens: {
      '--carousel-controls-columns': 'auto 1fr auto',
      '--carousel-controls-areas': "'prev indicator next'",
      '--carousel-indicator-justify': 'center',
    },
    placement: 'bottom',
  },
  {
    id: 'A',
    name: '下の行・右にまとめる',
    intent:
      '位置の点を左に、前へ・次へを右端に並べてまとめる。マウスでは続けて押すときに移動が少ない。行の左側が空くので、あとからキャプションを置く場所にもなる',
    spec: [
      ['controlsPosition', 'bottom-end'],
      ['--carousel-controls-columns', '1fr auto auto'],
      ['--carousel-controls-areas', "'indicator prev next'"],
      ['--carousel-indicator-justify', 'start'],
    ],
    tokens: {
      '--carousel-controls-columns': '1fr auto auto',
      '--carousel-controls-areas': "'indicator prev next'",
      '--carousel-indicator-justify': 'start',
    },
    placement: 'bottom-end',
  },
  {
    id: 'B',
    name: '画像に重ねる',
    intent:
      '前へ・次へを画像の左右の中央に重ねる。白い塗りの丸いボタン（影と輪郭）で、どの画像の上でも縁が分かる。行が点だけになり、全体の高さが減る。代わりに、画像の端の内容がボタンで隠れる',
    spec: [
      ['controlsPosition', 'overlay'],
      ['--carousel-controls-columns', 'auto 1fr auto'],
      ['--carousel-controls-areas', "'prev indicator next'"],
      ['--carousel-indicator-justify', 'center'],
    ],
    tokens: {
      '--carousel-controls-columns': 'auto 1fr auto',
      '--carousel-controls-areas': "'prev indicator next'",
      '--carousel-indicator-justify': 'center',
    },
    placement: 'overlay',
  },
];

const columns: Column[] = [
  { label: '広い（36rem）', note: '作品のページ・記事の幅' },
  { label: '狭い（20rem）', note: 'スマートフォンの幅' },
];

export const Controls: Story = {
  name: '前へ・次への置き場所',
  render: ({ pick }) => (
    <Comparison
      pick={pick}
      index={285}
      axis="Carousel の前へ・次への置き場所"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <div className={column.label.startsWith('広い') ? 'w-xl' : 'w-80'}>
          <Carousel
            accessibleName="作品の画面"
            defaultValue={1}
            controlsPosition={candidates.find((c) => c.id === candidate.id)?.placement}
          >
            {slides}
          </Carousel>
        </div>
      )}
    >
      <p>
        <strong>
          決定: current（下の行・両端）を既定にし、A（下の行の右にまとめる）と B（画像に重ねる）も
          controlsPosition（bottom・bottom-end・overlay）で選べる。
        </strong>
      </p>
      <p>
        前へ・次へのボタンをどこに置くかを選びます。どの案でも、指やトラックパッドの横スクロールと、枠にフォーカスしたときの
        ←→ で送れます。ボタンは主にマウスで使う人のためのものです。
      </p>
      <p>
        推奨は current（下の行・両端）です。作品のスクリーンショットは端まで見せたいので、ImageZoom
        の ×
        と同じく画像に重ねません。ボタンは枠線のボタンで、スライドより目立たせません。左右に分かれているので、どちらが前でどちらが次かを向きで読めます。A
        はマウスで続けて押すときに楽ですが、指の画面では前へが中央寄りになります。B
        は高さが減り写真のギャラリーらしく見えますが、スクリーンショットの左右の端（メニューやボタン）がボタンで隠れます。
      </p>
    </Comparison>
  ),
};
