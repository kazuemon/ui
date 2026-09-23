import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { ZoomFrame } from './image-zoom-frame';
import { portrait, whiteScreen } from './image-zoom-images';

// 軸 279: ImageZoom の拡大したときの面（後ろの面・余白・角）
//   値は tokens.css の --image-zoom-backdrop・--image-zoom-backdrop-blur・--image-zoom-padding-x・--image-zoom-padding-y・
//   --image-zoom-radius・--image-zoom-outline・--image-zoom-caption-color・--image-zoom-close-fg・--image-zoom-focus-ring。
//   候補はこの上書きだけで作る。全案（現行版を含む）で値を明示する
const meta = {
  title: 'Design Review/279 ImageZoom の拡大したときの面',
  id: 'design-review-279-image-zoom-surface',
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

const light = {
  '--image-zoom-caption-color': 'var(--color-fg-muted)',
  '--image-zoom-close-fg': 'var(--color-fg-muted)',
  '--image-zoom-focus-ring': 'var(--color-focus-ring)',
};
const dark = {
  '--image-zoom-backdrop': 'rgb(from var(--color-shadow) r g b / 0.9)',
  '--image-zoom-backdrop-blur': '0px',
  '--image-zoom-outline': 'transparent',
  '--image-zoom-caption-color': 'var(--color-surface)',
  '--image-zoom-close-fg': 'var(--color-surface)',
  '--image-zoom-focus-ring': 'var(--color-surface)',
};

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '地の色でほぼ覆い、ぼかす',
    intent:
      'ページの地の色（白）を 92% で重ね、後ろを少しぼかす。画像は余白を取ってカードの角と細い輪郭を付け、記事の中の画像がそのまま大きくなった姿にする。ページの明るさが変わらないので、読んでいる流れを切らない',
    spec: [
      ['後ろの面', '地の色 92%・ぼかし 8px'],
      ['余白', '左右 16px（上下は × の分）'],
      ['角・輪郭', 'カードの角・濃紺 12% の輪郭'],
      ['キャプション・×', '淡い濃紺'],
    ],
    tokens: {
      '--image-zoom-backdrop': 'color-mix(in oklab, var(--color-bg) 92%, transparent)',
      '--image-zoom-backdrop-blur': 'calc(var(--spacing) * 2)',
      '--image-zoom-padding-x': 'calc(var(--spacing) * 4)',
      '--image-zoom-padding-y': 'calc(var(--spacing) * 4)',
      '--image-zoom-radius': 'var(--radius-card)',
      '--image-zoom-outline': 'color-mix(in oklab, var(--color-fg) 12%, transparent)',
      ...light,
    },
  },
  {
    id: 'A',
    name: 'Dialog と同じ後ろの暗さ',
    intent:
      '重なる面と同じ、濃紺 30% の後ろの暗さにする。ページが透けて見え、どの記事の画像を開いたかが分かるが、画像のまわりに後ろの文や画像が見える',
    spec: [
      ['後ろの面', '濃紺 30%（--color-backdrop）・ぼかしなし'],
      ['余白', '左右 16px（上下は × の分）'],
      ['角・輪郭', 'カードの角・輪郭なし'],
      ['キャプション・×', '本文の濃紺'],
    ],
    tokens: {
      '--image-zoom-backdrop': 'var(--color-backdrop)',
      '--image-zoom-backdrop-blur': '0px',
      '--image-zoom-padding-x': 'calc(var(--spacing) * 4)',
      '--image-zoom-padding-y': 'calc(var(--spacing) * 4)',
      '--image-zoom-radius': 'var(--radius-card)',
      '--image-zoom-outline': 'transparent',
      '--image-zoom-caption-color': 'var(--color-fg)',
      '--image-zoom-close-fg': 'var(--color-fg)',
      '--image-zoom-focus-ring': 'var(--color-focus-ring)',
    },
  },
  {
    id: 'B',
    name: '暗く覆い、端まで広げる',
    intent:
      '写真を見る画面のように、濃紺 90% で覆い、画像を画面の端まで広げて角を付けない。画像がいちばん大きく見えるが、ページとは別の画面に移ったように見える',
    spec: [
      ['後ろの面', '濃紺 90%・ぼかしなし'],
      ['余白', '左右 0（上下は × の分）'],
      ['角・輪郭', '角なし・輪郭なし'],
      ['キャプション・×', '白'],
    ],
    tokens: {
      '--image-zoom-padding-x': '0px',
      '--image-zoom-padding-y': '0px',
      '--image-zoom-radius': '0px',
      ...dark,
    },
  },
  {
    id: 'C',
    name: '暗く覆い、余白と角は残す',
    intent:
      'B と同じ濃紺 90% で覆い、余白とカードの角は current のまま残す。写真の色が暗い地で締まって見え、やわらかさも残る',
    spec: [
      ['後ろの面', '濃紺 90%・ぼかしなし'],
      ['余白', '左右 16px（上下は × の分）'],
      ['角・輪郭', 'カードの角・輪郭なし'],
      ['キャプション・×', '白'],
    ],
    tokens: {
      '--image-zoom-padding-x': 'calc(var(--spacing) * 4)',
      '--image-zoom-padding-y': 'calc(var(--spacing) * 4)',
      '--image-zoom-radius': 'var(--radius-card)',
      ...dark,
    },
  },
];

const columns: Column[] = [
  { label: 'パソコン', note: '白っぽい画面の画像とキャプション' },
  { label: 'スマートフォン', note: '縦長の画像' },
];

export const Surface: Story = {
  name: '拡大したときの面',
  render: ({ pick }) => (
    <Comparison
      pick={pick}
      index={279}
      axis="ImageZoom の拡大したときの面（後ろの面・余白・角）"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) =>
        column.label === 'パソコン' ? (
          <ZoomFrame
            key={candidate.id}
            device="desktop"
            open
            src={whiteScreen}
            alt="設定の画面"
            caption="図 2. 設定の画面"
          />
        ) : (
          <ZoomFrame
            key={candidate.id}
            device="phone"
            open
            src={portrait}
            alt="縦長の絵"
            caption="縦長の画像"
          />
        )
      }
    >
      <p>
        <strong>
          決定: current（地の色で覆ってぼかす）を既定にし、A（Dialog と同じ後ろの暗さ）も
          variant="dark" で選べる。B・C は採らない。地の色の濃さは、軸 283
          で実際の記事のページに置いて比べ、88% にした。
        </strong>
      </p>
      <p>
        画像を押して拡大したときの、後ろの面の色とぼかし、画像のまわりの余白、画像の角を選びます。枠は画面の代わりで、後ろには記事の見出しと文の行（灰色の帯）があります。押した画像は、拡大しているあいだ元の場所から消えます（拡大した画像がそこから移ったように見せるため）。
      </p>
      <p>
        推奨は current
        です。記事を読んでいる途中で画像を大きくして、また読みに戻る、という使い方が多いので、ページの明るさを変えずに画像だけを前に出します。ぼかしで後ろの文字が読めなくなり、画像に目が向きます。角と輪郭は記事の中の画像と同じなので、「その画像が大きくなった」と分かります（軽い・やわらかい）。A
        は後ろの文や画像が透けて、拡大した画像と競います。B・C
        は写真には映えますが、白っぽい画面のスクリーンショットでは明暗の差が大きく、ページから別の画面に移ったように見えます。
      </p>
      <p>
        既定をどれにしますか。current を既定にして、写真の多い作品ページでは C（または
        B）を選べる、という形にもできます（props は、たとえば <code>backdrop="light" | "dark"</code>
        を想定しています）。
      </p>
      <p>いま決めないこと: 閉じる × の形と場所（軸 281）、開閉の動き（軸 280）。</p>
    </Comparison>
  ),
};
