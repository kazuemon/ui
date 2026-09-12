import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../src/components/Button';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 15: 塗りのボタンを押したときの縁（principles.md 原則1・3、design/adr/0006）
// 変えるのは次のトークンだけ
//   押したときの影（--shadow-raised-press）
//   グレーのボタンの影（--shadow-neutral、--shadow-neutral-hover、--shadow-neutral-press）
//   グレーのボタンの枠線（--neutral-line-width、--color-neutral-line）
// グレー以外のボタンの通常と hover の影（--shadow-raised、--shadow-raised-hover）、押下で 1px 沈むことは変えない
// --shadow-neutral-press の既定は :root で var(--shadow-raised-press) を読むので、行では両方を書く
// 2回目。1回目の B（グレーのボタンに #DEE0E1 の枠線）と C（グレーのボタンは輪郭の線なし）は外した
// 「白地では」の値は、濃紺グレー（#1F2F37）を白地に重ねた結果

const ring = (percent: number) => `0 0 0 1px rgb(31 47 55 / ${percent / 100})`;
const none = '0 0 #0000';
// ADR-0006 の影（ふだんと hover）。どの値を当てているか行ごとに読めるよう、値で書く
const drop = '0 1px 2px rgb(31 47 55 / 0.1)';
const raised = `${drop}, ${ring(5)}`;
const raisedHover = ring(6);

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '押すと影も輪郭も消える',
    intent:
      'ADR-0006 のまま。押すと影をすべて消す。影に含まれる輪郭の 1px の線も消えるので、白地に近いグレーのボタンは縁が1周内側に下がり、縮んだように見える。',
    spec: [
      ['押したときの影', 'なし（輪郭の線も消える）'],
      ['グレーのボタンの枠線', 'なし'],
    ],
    tokens: {
      '--shadow-raised-press': none,
      '--shadow-neutral': raised,
      '--shadow-neutral-hover': raisedHover,
      '--shadow-neutral-press': none,
      '--neutral-line-width': '0px',
      '--color-neutral-line': 'var(--color-surface-line)',
    },
  },
  {
    id: 'A',
    name: '押しても輪郭を残す',
    intent:
      '押すと、ぼかしの影だけを消し、輪郭の 1px の線は残す。線は hover のときと同じ濃さ。押しても大きさが変わらない。hover との違いは 1px 沈むこと。',
    spec: [
      ['押したときの影', '輪郭の線だけ（濃紺グレー 6%、白地では約 #F2F3F3）'],
      ['グレーのボタンの枠線', 'なし'],
    ],
    tokens: {
      '--shadow-raised-press': ring(6),
      '--shadow-neutral': raised,
      '--shadow-neutral-hover': raisedHover,
      '--shadow-neutral-press': ring(6),
      '--neutral-line-width': '0px',
      '--color-neutral-line': 'var(--color-surface-line)',
    },
  },
  {
    id: 'A2',
    name: '押すと輪郭が少し濃くなる',
    intent:
      'A の輪郭の線を、押したときだけ少し濃くする。接地して縁が締まるように見える。押したことが、沈む動きに加えて縁でも分かる。',
    spec: [
      ['押したときの影', '輪郭の線だけ（濃紺グレー 12%、白地では約 #E4E6E7）'],
      ['グレーのボタンの枠線', 'なし'],
    ],
    tokens: {
      '--shadow-raised-press': ring(12),
      '--shadow-neutral': raised,
      '--shadow-neutral-hover': raisedHover,
      '--shadow-neutral-press': ring(12),
      '--neutral-line-width': '0px',
      '--color-neutral-line': 'var(--color-surface-line)',
    },
  },
  {
    id: 'D',
    name: 'グレーのボタンに淡い枠線',
    intent:
      '白いボタンと同じく、グレーのボタンも縁を枠線で持つ。1回目の B（#DEE0E1）は重かったので、塗りと B の中間の淡い色にする。押して影が消えても縁は残る。押したときの影は現行版のまま。',
    spec: [
      ['押したときの影', 'なし（輪郭の線も消える）'],
      ['グレーのボタンの枠線', '1px #E7E8E9（塗り #EFF0F1 と #DEE0E1 の中間）'],
    ],
    tokens: {
      '--shadow-raised-press': none,
      '--shadow-neutral': raised,
      '--shadow-neutral-hover': raisedHover,
      '--shadow-neutral-press': none,
      '--neutral-line-width': '1px',
      '--color-neutral-line': '#e7e8e9',
    },
  },
];

const columns: Column[] = [
  { label: '通常', note: 'マウスを載せたり押したりして、実際の動きを確かめられます' },
  { label: 'hover 中', note: 'マウスを載せた見た目を固定しています', preview: 'hover' },
  { label: '押下中', note: '押している見た目を固定しています', preview: 'press' },
];

const Buttons = () => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-wrap gap-3">
      <Button color="primary">保存する</Button>
      <Button>キャンセル</Button>
      <Button color="surface">共有</Button>
    </div>
    <div className="flex flex-wrap gap-3">
      <Button color="secondary">応援する</Button>
      <Button color="danger">削除</Button>
    </div>
    <div className="flex flex-wrap gap-3">
      <Button disabled>キャンセル</Button>
      <Button color="surface" disabled>
        共有
      </Button>
    </div>
  </div>
);

// 縁の 1px の違いを見やすくするため、グレーと白のボタンを2倍にして下に並べる
const Zoomed = () => (
  <div className="flex [zoom:2] flex-col items-start gap-2">
    <Button>キャンセル</Button>
    <Button color="surface">共有</Button>
  </div>
);

const Cell = () => (
  <div className="flex flex-col gap-5">
    <Buttons />
    <Zoomed />
  </div>
);

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/15 塗りのボタンを押したときの縁',
  id: 'design-review-15-press-edge',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      hover: ['[data-preview="hover"] button'],
      active: ['[data-preview="press"] button'],
    },
  },
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'A2', 'D'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={15}
      axis="塗りのボタンを押したときの縁"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={() => <Cell />}
    >
      <p>
        <strong className="text-fg">決定: A 押しても輪郭を残す</strong>
        （ADR-0033、一旦）。「一旦 A で進めます。」押すと落ち影だけが消え、輪郭の線は hover
        と同じまま残ります。
      </p>
      <p>
        <strong className="text-fg">2回目</strong>
        。1回目のメモ「そもそも、グレーボタンと白ボタンの一貫性が薄い気がします。」「枠線の追加はちょっと重すぎますね。また、C
        はサンプルがうまく機能していない気がします。同じく縮まって見えます。」を受けて、B と C
        を外し、D を足しました。
      </p>
      <p>
        押したとき、白いボタンは枠線が残るので形が保たれますが、グレーのボタンは縁が消えて塗りの塊になります。2回目は「白地に近い塗りのボタン（グレー・白）は、押しても縁が残る」に揃える案です。A・A2
        は影の輪郭の線を残し、D は白いボタンと同じく枠線で縁を持ちます。C
        が縮んで見えたのは、残した落ち影のにじみも縁の一部に見えていたためです。白地に近い塗りでは、影が変わると大きさが変わって見えます。
      </p>
      <p>
        軸 14 の比較中のメモ「primary ボタンと gray
        ボタンで押したときの挙動が違いますか…？グレーの方は小さくなる挙動も入っているように見えます」を受けた軸です。
      </p>
      <p>
        押したときの指定は、どの色のボタンも同じで、影を消して 1px
        沈むだけです。ただ、塗りのボタンの影（ADR-0006 の「そよ風」）には、薄い落ち影に加えて輪郭の
        1px の線（濃紺グレー
        5%）が入っています。押すとこの線も消えます。青のボタンは塗りの端が縁に見えるので変わりませんが、白地に近いグレーのボタンは、この線が縁の役目をしているため、押すと縁が1周内側に下がり、縮んだように見えます。
      </p>
      <p>
        A・A2 は、押しても輪郭の線を残します。A は hover と同じ濃さ、A2 は少し濃くします。D
        は、グレーのボタンに淡い枠線を持たせ、縁を影から切り離します。
      </p>
      <p>
        原則3は「hover で影が減り、押下で消える（接地）」としています。A・A2
        では、押下で消えるのはぼかしの影だけになります。hover と押下は、1px 沈むことで見分けます。
      </p>
      <p>
        各セルの下は、グレーと白のボタンを2倍に拡大したものです。縁の 1px
        の違いは、ここで見比べてください。
      </p>
      <p>
        判断の基準（軽い・やわらかい・整然・人懐っこい）に最も近い案を1つ選び、一言添えてください。
      </p>
    </Comparison>
  ),
};
