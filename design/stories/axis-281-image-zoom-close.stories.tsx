import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { landscape, tallScreen } from './image-zoom-images';
import { ZoomFrame } from './image-zoom-frame';

// 軸 281: ImageZoom の閉じる ×（出すか・形・画像に重ねるか）
//   値は tokens.css の --image-zoom-close-opacity・--image-zoom-close-bg・--image-zoom-close-fg・--image-zoom-close-shadow・
//   --image-zoom-close-space・--image-zoom-close-inset。候補はこの上書きだけで作る。全案（現行版を含む）で値を明示する
//   どの案でも、面のどこかを押す・Esc・指で上下に引く、で閉じられる
const meta = {
  title: 'Design Review/281 ImageZoom の閉じる ×',
  id: 'design-review-281-image-zoom-close',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      focusVisible: ['[data-preview="focus"] [data-slot="image-zoom-close"]'],
    },
  },
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
    name: '面のない ×、画像に重ねない',
    intent:
      'Dialog の右上の × と同じ、面のない × を画面の右上に置く。画像は × の分だけ上下を空けて置き、重ならない。縦長の画像はその分だけ小さくなる',
    spec: [
      ['×', 'いつも出す・面なし'],
      ['画像との重なり', '重ねない（上下に × の分を空ける）'],
    ],
    tokens: {
      '--image-zoom-close-opacity': '1',
      '--image-zoom-close-bg': 'transparent',
      '--image-zoom-close-fg': 'var(--color-fg-muted)',
      '--image-zoom-close-shadow': 'none',
      '--image-zoom-close-space': '1',
      '--image-zoom-close-inset': 'calc(var(--spacing) * 2)',
    },
  },
  {
    id: 'A',
    name: '白い丸の ×、画像に重ねてよい',
    intent:
      '× に白い丸の面と重なる面の影を付け、画像の上に重なっても見えるようにする。上下を空けないので、縦長の画像が大きくなる',
    spec: [
      ['×', 'いつも出す・白い丸の面と影'],
      ['画像との重なり', '重ねてよい（上下は余白だけ）'],
    ],
    tokens: {
      '--image-zoom-close-opacity': '1',
      '--image-zoom-close-bg': 'var(--color-surface)',
      '--image-zoom-close-fg': 'var(--color-fg)',
      '--image-zoom-close-shadow': 'var(--shadow-overlay)',
      '--image-zoom-close-space': '0',
      '--image-zoom-close-inset': 'calc(var(--spacing) * 2)',
    },
  },
  {
    id: 'B',
    name: '× を見せない',
    intent:
      '画面には × を出さず、面を押すか Esc で閉じる（キーボードで来たときだけ × が出る。読み上げでも × は使える）。画像のまわりに何も置かないので、画像がいちばん大きく、静かに見える',
    spec: [
      ['×', 'キーボードで来たときだけ（面なし）'],
      ['画像との重なり', '重ねてよい（上下は余白だけ）'],
    ],
    tokens: {
      '--image-zoom-close-opacity': '0',
      '--image-zoom-close-bg': 'transparent',
      '--image-zoom-close-fg': 'var(--color-fg-muted)',
      '--image-zoom-close-shadow': 'none',
      '--image-zoom-close-space': '0',
      '--image-zoom-close-inset': 'calc(var(--spacing) * 2)',
    },
  },
];

const columns: Column[] = [
  { label: 'パソコン', note: '横長の画像' },
  { label: 'スマートフォン', note: '縦に長いスクリーンショット' },
  {
    label: 'スマートフォン（キーボード）',
    note: '× にキーボードでフォーカスしたとき',
    preview: 'focus',
  },
];

export const Close: Story = {
  name: '閉じる ×',
  render: ({ pick }) => (
    <Comparison
      pick={pick}
      index={281}
      axis="ImageZoom の閉じる ×（出すか・形・画像に重ねるか）"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) =>
        column.label === 'パソコン' ? (
          <ZoomFrame key={candidate.id} device="desktop" open src={landscape} alt="空と山の絵" />
        ) : (
          <ZoomFrame
            key={candidate.id}
            device="phone"
            open
            src={tallScreen}
            alt="スマートフォンの画面"
          />
        )
      }
    >
      <p>
        <strong>
          決定: current（面のない ×、画像に重ねない）を既定にし、A（白い丸の ×）も
          closeButtonVariant="raised" で選べる。B（× を見せない）は採らない。hideCloseButton は ×
          を置かない形のまま。
        </strong>
      </p>
      <p>
        拡大した面の、閉じる ×
        を選びます。どの案でも、面のどこか（画像や後ろ）を押す・Esc・指で上下に引く、で閉じられます。×
        は、それを知らない人と、キーボードや読み上げで操作する人のための閉じる口です。
      </p>
      <p>
        推奨は current です。閉じ方が一目で分かり、Dialog の ×
        と同じ形なので、重なる面の閉じ方がそろいます。画像に重ならないので、画像の隅が隠れません（整然）。代わりに、縦長の画像はスマートフォンで少し小さくなります。A
        は縦長の画像を大きく見せられますが、白い丸が画像の上に浮き、写真の隅を隠します。B
        はいちばん静かですが、閉じ方を知らない人には出口が見えません（押せば閉じることは、拡大のカーソルが外すカーソルに変わることでしか伝わりません）。
      </p>
      <p>
        既定をどれにしますか。current を既定にして、B（× を見せない）も <code>hideCloseButton</code>{' '}
        で選べる、という形にもできます（いまの <code>hideCloseButton</code> は ×
        を置かない形で、キーボードで来たときも出ません。B を選ぶ形にするなら、この意味を変えます）。
      </p>
    </Comparison>
  ),
};
