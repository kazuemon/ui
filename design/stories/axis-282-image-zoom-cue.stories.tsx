import type { Meta, StoryObj } from '@storybook/react-vite';

import { ImageZoom } from '../../src/components/image-zoom/ImageZoom';
import { type Candidate, type Column, Comparison } from './Comparison';
import { landscape, whiteScreen } from './image-zoom-images';

// 軸 282: ImageZoom の押せることの見せ方（ページに置いた画像）
//   値は tokens.css の --image-zoom-cue-opacity・--image-zoom-cue-hover-opacity・--image-zoom-hover-brightness。
//   候補はこの上書きだけで作る。全案（現行版を含む）で値を明示する。カーソル（拡大鏡）とキーボードのフォーカスの線は全案で同じ
const meta = {
  title: 'Design Review/282 ImageZoom の押せることの見せ方',
  id: 'design-review-282-image-zoom-cue',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      hover: ['[data-preview="hover"] [data-slot="image-zoom-trigger"]'],
      focusVisible: ['[data-preview="focus"] [data-slot="image-zoom-trigger"]'],
    },
  },
  args: { pick: 'current,C' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'C', 'current,C'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: 'current',
    name: 'hover で右下に虫眼鏡の印',
    intent:
      'マウスを載せたときと、キーボードで来たときだけ、画像の右下に白い丸の虫眼鏡を出す。ふだんの記事は画像だけで静かなまま、載せたときに「押すと拡大する」ことが、リンクとは違う形で分かる',
    spec: [
      ['ふだん', '何も出さない'],
      ['hover・フォーカス', '右下に虫眼鏡の印'],
      ['画像の明るさ', '変えない'],
    ],
    tokens: {
      '--image-zoom-cue-opacity': '0',
      '--image-zoom-cue-hover-opacity': '1',
      '--image-zoom-hover-brightness': '1',
    },
  },
  {
    id: 'A',
    name: 'カーソルだけ',
    intent:
      '印も明るさも変えず、拡大鏡のカーソルだけで伝える。いちばん静かだが、マウスを載せても画像そのものは何も返さない',
    spec: [
      ['ふだん', '何も出さない'],
      ['hover・フォーカス', '何も出さない（カーソルだけ）'],
      ['画像の明るさ', '変えない'],
    ],
    tokens: {
      '--image-zoom-cue-opacity': '0',
      '--image-zoom-cue-hover-opacity': '0',
      '--image-zoom-hover-brightness': '1',
    },
  },
  {
    id: 'B',
    name: 'hover で少し暗く',
    intent:
      '印を出さず、マウスを載せたら画像を少し暗くする（92%）。押せることへの手応えは返すが、押すと何が起きるか（拡大か、リンクか）は分からない',
    spec: [
      ['ふだん', '何も出さない'],
      ['hover', '画像を 92% の明るさに'],
      ['フォーカス', 'フォーカスの線だけ'],
    ],
    tokens: {
      '--image-zoom-cue-opacity': '0',
      '--image-zoom-cue-hover-opacity': '0',
      '--image-zoom-hover-brightness': '0.92',
    },
  },
  {
    id: 'C',
    name: '印をいつも出す',
    intent:
      '虫眼鏡の印をいつも出す。マウスのない指の画面でも、押すと拡大することが分かる。代わりに、記事の画像すべての隅に印が並ぶ',
    spec: [
      ['ふだん', '右下に虫眼鏡の印'],
      ['hover・フォーカス', '右下に虫眼鏡の印'],
      ['画像の明るさ', '変えない'],
    ],
    tokens: {
      '--image-zoom-cue-opacity': '1',
      '--image-zoom-cue-hover-opacity': '1',
      '--image-zoom-hover-brightness': '1',
    },
  },
];

const columns: Column[] = [
  { label: '通常', note: '指の画面では、いつもこの見た目' },
  { label: 'hover', preview: 'hover' },
  { label: 'フォーカス（キーボード）', preview: 'focus' },
  { label: '白っぽい画像・hover', note: '印が白い画像に溶けないか', preview: 'hover' },
];

export const Cue: Story = {
  name: '押せることの見せ方',
  render: ({ pick }) => (
    <Comparison
      pick={pick}
      index={282}
      axis="ImageZoom の押せることの見せ方"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <div key={candidate.id} className="w-60">
          <ImageZoom
            src={column.label.startsWith('白') ? whiteScreen : landscape}
            alt={column.label.startsWith('白') ? '設定の画面' : '空と山の絵'}
            width={640}
            height={360}
          />
        </div>
      )}
    >
      <p>
        <strong>
          決定: current（hover とキーボードのときだけ虫眼鏡の印）を既定にし、C（印をいつも出す）も
          showZoomIcon で選べる。A・B は採らない。
        </strong>
      </p>
      <p>
        記事に置いた画像が、押すと拡大することをどう見せるかを選びます。どの案でも、マウスを載せるとカーソルが拡大鏡になり、キーボードで来たときはフォーカスの線が出ます。画像はページと同じレイヤーなので、浮かせず影も付けません。押すと画像そのものが広がるので、沈みも付けません。
      </p>
      <p>
        推奨は current
        です。記事の画像は全部が拡大できることが多いので、ふだんは何も足さず、載せたときにだけ「拡大する」ことを形で返します（原則
        3 の hover は手応え）。虫眼鏡は、リンクの画像（別のページへ移る）と見分ける印にもなります。A
        はマウスを載せても画像が何も返さず、B は返しますが何が起きるかは伝えません。C
        は指の画面でも分かりますが、画像が並ぶと印がうるさくなります。
      </p>
      <p>
        既定をどれにしますか。current
        を既定にして、C（いつも出す）も選べる、という形にもできます（props は、たとえば{' '}
        <code>showZoomIcon</code> を想定しています）。
      </p>
    </Comparison>
  ),
};
