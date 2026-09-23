import type { Meta, StoryObj } from '@storybook/react-vite';

import { Embed } from '../../src/components/embed/Embed';
import { type Candidate, type Column, Comparison } from './Comparison';

// 軸 272: Embed の枠（角丸・影・輪郭）。
//   値は tokens.css の --embed-radius・--embed-shadow・--embed-outline-width・--embed-outline-color。
//   候補はこの 4 つの上書きだけで作る
const demo = (label: string) =>
  `data:text/html;charset=utf-8,${encodeURIComponent(
    `<body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#cfeafc;font:16px system-ui">${label}</body>`
  )}`;

const meta = {
  title: 'Design Review/272 Embed の枠',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

// 決定後は、読み込む前（idle）と読み込む・読み込んだあと（loading・loaded）で枠の値を分けて持つ
//   （--embed-idle-* と --embed-shadow・--embed-outline-width）。各候補は、どちらの状態も自分の値を明示する
const candidates: Candidate[] = [
  {
    id: 'current',
    name: 'カードの角・輪郭のみ（Image・Figure と同じ。常に同じ枠）',
    intent:
      '角は Image・Figure と同じカードの角、影は付けず、白っぽい面が地に溶けないよう細い輪郭だけを引く。読み込む前もあとも同じ枠。記事の中のものはページと同じレイヤー（原則1）に沿う',
    spec: [
      ['角', 'カードの角'],
      ['影', 'なし（常に）'],
      ['輪郭', '内側1px・濃紺12%（常に）'],
    ],
    tokens: {
      '--embed-idle-shadow': 'none',
      '--embed-idle-outline-width': 'var(--border-width-thin)',
    },
  },
  {
    id: 'A',
    name: 'カードの角・読み込む前だけ浮いた影（クリックできる分だけ持ち上げる）',
    intent:
      'クリックするまでは実際に押せるボタンなので、浮いた押すものと同じ薄い影を付け、輪郭は外す。読み込んだあと（iframe）は現行のまま輪郭のみに戻す',
    spec: [
      ['角', 'カードの角'],
      ['影', '読み込む前だけ浮いた押すもの（--shadow-raised）'],
      ['輪郭', '読み込む前はなし／読み込んだあとは内側1px・濃紺12%'],
    ],
    tokens: {
      '--embed-idle-shadow': 'var(--shadow-raised)',
      '--embed-idle-outline-width': '0px',
    },
  },
  {
    id: 'B',
    name: '部品の角・輪郭のみ（常に同じ枠）',
    intent: '角をボタン・入力欄と同じ部品の角に落とし、コードの枠に近い、より控えめな箱に見せる',
    spec: [
      ['角', '部品の角'],
      ['影', 'なし（常に）'],
      ['輪郭', '内側1px・濃紺12%（常に）'],
    ],
    tokens: {
      '--embed-radius': 'var(--radius-control)',
      '--embed-idle-shadow': 'none',
      '--embed-idle-outline-width': 'var(--border-width-thin)',
    },
  },
];

const columns: Column[] = [
  { label: '読み込む前（clickToLoad）' },
  { label: '読み込んだあと', note: '同じ枠を iframe にも使う' },
];

export const Frame: Story = {
  name: '枠の見た目',
  render: () => (
    <Comparison
      index={272}
      axis="Embed の枠（角丸・影・輪郭）"
      pick="A"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <div className="w-64">
          <Embed
            key={`${candidate.id}-${column.label}`}
            provider="youtube"
            clickToLoad={column.label === '読み込む前（clickToLoad）'}
            src={demo('読み込みました')}
            title="空と山の紹介動画"
          />
        </div>
      )}
    >
      <p>
        決定: A（<code>clickToLoad</code>
        でまだ押していないあいだだけ、浮いた影・輪郭なしにする。それ以外の状態は現行＝カードの角・影なし・輪郭のみのまま）。既定（
        <code>clickToLoad</code> を渡さない）は最初から iframe を読み込むので、
        「読み込む前」の影は、押せる形にしたときだけ出ます。
      </p>
      <p>
        Embed の枠（読み込む前の面と、読み込んだあとの iframe
        を囲む箱）の角・影・輪郭を選びます。読み込む前はクリックできるボタンでもあるので、他の「面」（画像・カード）とどちらに寄せるかが論点です。
      </p>
      <p>
        推奨は current です。記事の中の画像（Image・Figure）と同じ角・輪郭にそろえ、Embed
        も「記事の中に置く読みものの一部」として扱います（原則1:
        記事の中のものはページと同じレイヤーで、影は付けません）。A
        は「押せるボタン」の面を強く出したいときの案で、影が付く分、押せることは伝わりやすくなりますが、読み込んだあとも同じ枠を使うと、ただのメディアなのに浮いて見えます。B
        は箱をコードの枠のように控えめにします。
      </p>
      <p>
        既定をどれにしますか。読み込む前と読み込んだあとで、枠だけ変える（影は読み込む前だけ、など）案も選べます。
      </p>
    </Comparison>
  ),
};
