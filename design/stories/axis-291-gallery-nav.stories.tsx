import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { GalleryFrame } from './gallery-frame';

// 軸 291: Gallery の前後のボタンと位置の表示の置き方
//   値は tokens.css の --gallery-nav-bar（1 は下の帯にまとめる、0 は左右の端）・--gallery-nav-space-x（左右の端に置くとき、
//   1 は画像に重ねない）・--gallery-nav-raised（1 は白い丸の面）・--gallery-nav-bg・--gallery-nav-shadow。
//   候補はこの上書きだけで作る。全案（現行版を含む）で値を明示する
const meta = {
  title: 'Design Review/291 Gallery の前後のボタンと位置の表示',
  id: 'design-review-291-gallery-nav',
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

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '下の帯にまとめる',
    intent:
      '画像の下に「‹ 3 / 8 ›」を 1 列に並べる。閉じる × の分として上下に取っている場所の、下の側に置くので、画像は小さくならず、ボタンも画像に重ならない。指の画面でも親指の届く下にあり、パソコンとスマートフォンで同じ形',
    spec: [
      ['置き場所', '下の帯の中央（位置は ‹ › のあいだ）'],
      ['形', '面のない丸（閉じる × と同じ）'],
      ['画像との重なり', 'なし'],
    ],
    tokens: {
      '--gallery-nav-bar': '1',
      '--gallery-nav-space-x': '1',
      '--gallery-nav-raised': '0',
      '--gallery-nav-bg': 'transparent',
      '--gallery-nav-shadow': 'none',
    },
  },
  {
    id: 'A',
    name: '左右の端（面のない形）',
    intent:
      '‹ を左の端、› を右の端の中央に置き、位置は左上（閉じる × と向かい合う角）に出す。送る向きとボタンの位置がそろう。ボタンの分だけ左右を空けるので、横に長い画像は少し小さくなる',
    spec: [
      ['置き場所', '左右の端の中央・位置は左上'],
      ['形', '面のない丸（閉じる × と同じ）'],
      ['画像との重なり', 'なし（左右を空ける）'],
    ],
    tokens: {
      '--gallery-nav-bar': '0',
      '--gallery-nav-space-x': '1',
      '--gallery-nav-raised': '0',
      '--gallery-nav-bg': 'transparent',
      '--gallery-nav-shadow': 'none',
    },
  },
  {
    id: 'B',
    name: '左右の端、画像に重ねる白い丸',
    intent:
      'A と同じ置き場所で、ボタンに白い丸の面と影を付け、画像に重なってもよい形にする（閉じる × の raised と同じ）。画像はいちばん大きく出るが、画像の左右の端が少し隠れる',
    spec: [
      ['置き場所', '左右の端の中央・位置は左上'],
      ['形', '白い丸の面と影（閉じる × の raised と同じ）'],
      ['画像との重なり', 'あり'],
    ],
    tokens: {
      '--gallery-nav-bar': '0',
      '--gallery-nav-space-x': '0',
      '--gallery-nav-raised': '1',
      '--gallery-nav-bg': 'var(--color-surface)',
      '--gallery-nav-shadow': 'var(--shadow-overlay)',
    },
  },
];

const columns: Column[] = [
  { label: 'パソコン', note: '2 枚目（横長）。‹ › を押して送れる' },
  { label: 'スマートフォン', note: '3 枚目（縦長）' },
  { label: 'スマートフォン（最初の画像）', note: '端では前へ送るボタンを出さない' },
];

export const Nav: Story = {
  name: '前後のボタンと位置の表示',
  render: ({ pick }) => (
    <Comparison
      pick={pick}
      index={291}
      axis="Gallery の前後のボタンと位置の表示"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) =>
        column.label === 'パソコン' ? (
          <GalleryFrame key={candidate.id} device="desktop" open defaultValue={1} />
        ) : (
          <GalleryFrame
            key={candidate.id}
            device="phone"
            open
            defaultValue={column.label === 'スマートフォン' ? 2 : 0}
          />
        )
      }
    >
      <p>
        <strong>
          決定: current（下の帯にまとめる）を既定にし、A・B も controlsPosition="sides" | "overlay"
          で選べる（Carousel と同じ名前）。位置の示し方は indicator（count・dots・none）で選べる。
        </strong>
      </p>
      <p>
        拡大した面で、前後に送るボタン（‹ ›）と、いまの位置（「3 /
        6」）をどこにどう置くかを選びます。キーボードの ←→
        と、指で左右にはじく操作は、どの案でも使えます。閉じる × は ImageZoom
        と同じ（右上・面のない形）です。
      </p>
      <p>
        推奨は current です。閉じる ×
        を画像に重ねないために上下に取っている場所の下の側がちょうど空いているので、そこに送る操作と位置をまとめると、画像を小さくせず、何にも重ねずに置けます。スマートフォンでは親指の届く下にあり、パソコンでも同じ形なので、覚えることが
        1 つで済みます。あとで小さな画像の帯（Thumbnails）を足すときも、同じ下の側に並べられます。A
        は送る向きとボタンの位置がそろいますが、左右を空けるぶん横長の画像が小さくなり、スマートフォンでは画像がかなり細くなります。B
        は画像をいちばん大きく出せますが、ImageZoom の閉じる ×
        で既定にしなかった「画像に重ねる形」です。
      </p>
      <p>
        既定をどれにしますか。「current を既定にして、B も選べる」のようにもできます（props
        は、たとえば <code>navPlacement="bottom" | "sides"</code> を想定しています）。
      </p>
    </Comparison>
  ),
};
