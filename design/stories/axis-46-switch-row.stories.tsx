import type { Meta, StoryObj } from '@storybook/react-vite';

import { Switch, type SwitchFrame } from '../../src/components/Switch';
import { type Candidate, type Column, Comparison } from './Comparison';
import {
  keepSwitchCaptionAsCompared,
  keepToggleColorAsCompared,
  switchGroupedAsComparedCss,
} from './pins';

// 後半の軸 46: トグルを右に置いた行（togglePlacement="end"）の押せる範囲
//   ユーザーの「46 にも左トグルバージョンが欲しいです」で、トラックを左に置いた列（部品の既定の start）も足した
// 押せる範囲は見た目の範囲と一致させる（決定）。いまのトグルは文字の幅とトラックだけが押せる。
// トラックを右に置くと、文字とトラックのあいだの空白は押せず、どの文字がどのトグルのものか分かりにくい
// 案は Switch の frame（行ごとに変える）で作る。見た目は次のトークン（src/components/Switch.tsx が読む）。どの行も同じ値を明示する
//   --switch-row-line-width・--color-switch-row-line: 囲みと区切り線の太さと色
//   --switch-row-radius: 1行ずつ囲む（card）角。--switch-group-radius: 1つの囲みにまとめる（grouped）角
//   --switch-row-gap: card を続けて置いたときの間。--switch-row-pad-y: 行の上下の余白（線を含む）
//   --color-switch-row-hover・--switch-row-press-darken: hover の塗りと、押しているあいだに混ぜる本文の色の割合
//   --switch-row-duration・--switch-row-press-duration: 塗りの動きの長さ（比べたときの 100ms。軸 47 の A で部品の既定が変わったので明示する）
//   --switch-track-rows・--switch-gap: トラックの縦の位置と、トラックと文字の間（軸 29・44。この軸では変えない）
// C（grouped）は採らなかったので部品から消した。frame="divided" の行に pins.tsx の CSS を当てて、比べたときの見た目で描く

type ComparedFrame = SwitchFrame | 'grouped';

const look = {
  '--switch-row-line-width': '1px',
  '--color-switch-row-line': 'var(--color-line)',
  '--switch-row-radius': 'var(--radius-control)',
  '--switch-group-radius': 'var(--radius-card)',
  '--switch-row-gap': '8px',
  '--switch-row-pad-y': '8px',
  '--color-switch-row-hover': 'var(--color-select-item-highlight)',
  '--switch-row-press-darken': '8%',
  '--switch-row-duration': '100ms',
  '--switch-row-press-duration': '100ms',
  '--switch-track-rows': '1 / 2',
  '--switch-gap': '12px',
};

const rowSpec: [string, string][] = [
  ['行の余白', '上下 8px（線を含む）、左右は部品の左右の余白（マウス用 12px・指用 16px）'],
  ['行の高さ', 'キャプションなし: 部品の高さ（マウス用 40px・指用 44px）。あり: 上下の余白＋文字'],
  ['hover', '一覧の項目の hover と同じ塗り（入力欄の塗り #F2F4F4）'],
  ['押下', 'hover の塗りに本文の色を 8% 混ぜる。行は沈まない。ノブはいまと同じく縮む'],
  ['押せないとき', '行全体が押せない。塗りは変わらない'],
];

const frames: Record<string, ComparedFrame> = {
  現行版: 'none',
  A: 'card',
  B: 'divided',
  C: 'grouped',
  D: 'card',
  E: 'divided',
};

// D・E: A・B の線を薄くした版（ユーザーの「46 はA/B の divider の薄い版を作れますか？」）
//   線の色を、細い境界線（#DEE0E1）より一段薄いグレー（--palette-gray-100、#EFF0F1）にする。ほかは A・B と同じ
const lightLook = { ...look, '--color-switch-row-line': 'var(--palette-gray-100)' };

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '囲みなし',
    intent:
      '押せるのは、ラベルの文字の幅とトラックだけ。文字とトラックのあいだの空白や、キャプションを押しても切り替わらない。行は 8px ずつ離して並べる。',
    spec: [
      ['押せる範囲', 'ラベルの文字の幅とトラック'],
      ['囲み・線', 'なし'],
      ['hover・押下', '行は変わらない。押すとノブが縮む'],
      ['フォーカスの線', 'トラックの外側（2px 離して 2px の青）'],
      [
        '原則との関係',
        '押せる範囲＝見た目（見えない広がりなし）。ただしトラックが右にあると、文字とトラックの対応が見えにくい',
      ],
    ],
    tokens: look,
  },
  {
    id: 'A',
    name: '1行ずつ薄い四角で囲む',
    intent:
      'カードのような細い線で1行ずつ囲み、囲みの中はどこを押しても切り替わる。行と行は 8px 離す。囲みが押せる範囲そのものになる。',
    spec: [
      ['押せる範囲', '囲みの内側全部（線を含む）'],
      ['囲み', '1px・細い境界線の色（#DEE0E1）。角は部品の角 12px。影なし。行の間 8px'],
      ...rowSpec,
      ['フォーカスの線', '囲みの外側（2px 離して 2px の青。ボタンと同じ）'],
      [
        '原則との関係',
        '押せる範囲＝囲み。ページと同じレイヤーなので影なし（原則1）。行そのものが押す本体なので部品の角（原則5）',
      ],
    ],
    tokens: look,
  },
  {
    id: 'B',
    name: '上下に区切り線',
    intent:
      '行の上下に区切り線を引き、線のあいだはどこを押しても切り替わる。並べると行のあいだの線は1本。左右の囲みはなく、Android の設定の一覧に近い。指用の画面では左右の端まで線を引く。',
    spec: [
      ['押せる範囲', '上下の線のあいだ全部（線を含む）。横は置いた幅いっぱい'],
      ['区切り線', '1px・細い境界線の色（#DEE0E1）。行のあいだは1本。角・影なし'],
      ...rowSpec,
      ['フォーカスの線', '行の内側（線から 2px 内側に 2px の青）。外に出すと隣の行にかかる'],
      [
        '原則との関係',
        '押せる範囲＝線のあいだ。左右の端は線がなく、hover・押下の塗りで見える。影なし（原則1）。角を持たない',
      ],
    ],
    tokens: look,
  },
  {
    id: 'C',
    name: '1つの角丸の囲みに行を並べる',
    intent:
      'iOS の設定（inset grouped）のように、続けて置いた行を角丸の囲み1つにまとめ、行のあいだに区切り線を引く。区切り線は左を文字の始まりまで下げる。各行の中はどこを押しても切り替わる。',
    spec: [
      ['押せる範囲', '各行の、囲みの内側で区切り線のあいだ'],
      [
        '囲み・区切り線',
        '1px・細い境界線の色（#DEE0E1）。囲みの角はカードの角 16px。区切り線は左の余白の位置から右端まで。影なし',
      ],
      ...rowSpec,
      ['フォーカスの線', '行の内側（線から 2px 内側に 2px の青）。両端の行は囲みの角に沿う'],
      [
        '原則との関係',
        '押せる範囲＝区切られた行。影なし（原則1）。行を包む囲みなので一段大きいカードの角（原則5）',
      ],
    ],
    tokens: look,
  },
  {
    id: 'D',
    name: 'A の薄い線',
    intent:
      'A（1行ずつ囲む）の囲みの線を一段薄いグレーにする。囲みの中はどこを押しても切り替わる。線が行の数だけ並んでも重く見えないようにする。',
    spec: [
      ['押せる範囲', '囲みの内側全部（線を含む）'],
      [
        '囲み',
        '1px・一段薄いグレー（#EFF0F1。A は #DEE0E1）。角は部品の角 12px。影なし。行の間 8px',
      ],
      ...rowSpec,
      ['フォーカスの線', '囲みの外側（2px 離して 2px の青）'],
      ['原則との関係', 'A と同じ。線が薄いぶん、押せる範囲は hover・押下の塗りでも見せる'],
    ],
    tokens: lightLook,
  },
  {
    id: 'E',
    name: 'B の薄い区切り線',
    intent:
      'B（上下に区切り線）の線を一段薄いグレーにする。線のあいだはどこを押しても切り替わる。一覧の中の区切りが控えめになる。',
    spec: [
      ['押せる範囲', '上下の線のあいだ全部（線を含む）。横は置いた幅いっぱい'],
      ['区切り線', '1px・一段薄いグレー（#EFF0F1。B は #DEE0E1）。行のあいだは1本。角・影なし'],
      ...rowSpec,
      ['フォーカスの線', '行の内側（線から 2px 内側に 2px の青）'],
      ['原則との関係', 'B と同じ。線が薄いぶん、押せる範囲は hover・押下の塗りでも見せる'],
    ],
    tokens: lightLook,
  },
];

const columns: Column[] = [
  { label: 'マウス用', note: 'data-density="fine"。通常' },
  {
    label: 'マウス用・トグルが左',
    note: 'data-density="fine"。トラックを文字の左に置く（togglePlacement="start"。部品の既定）',
  },
  { label: '指用（幅 390px の画面）', note: 'data-density="coarse"。画面の左右の余白 16px' },
  {
    label: '指用・トグルが左（幅 390px の画面）',
    note: 'data-density="coarse"。トラックを文字の左に置く（togglePlacement="start"。部品の既定）',
  },
  { label: 'hover', note: 'マウス用。2行目（プッシュ通知）に固定', preview: 'hover' },
  { label: '押しているあいだ', note: 'マウス用。2行目を押した状態に固定', preview: 'active' },
  {
    label: 'キーボードのフォーカス',
    note: 'マウス用。2行目にフォーカスを固定',
    preview: 'focus',
  },
];

const longCaption =
  'オンにすると、新しい記事が公開されたときにメールでお知らせします。配信は週に1回まとめて届きます。';

const rows = [
  { label: 'お知らせを受け取る', defaultChecked: true },
  { label: 'プッシュ通知', caption: 'コメントがついたときに届きます', target: true },
  { label: 'メールで受け取る', caption: longCaption, defaultChecked: true },
  { label: '位置情報を使う', caption: 'この端末では使えません', disabled: true },
];

// 状態を固定する列では、2行目（axis46-target）だけを固定する
// 押せる範囲を見せる（Controls の showHitArea）: 押せる範囲を点線で囲む
//   現行版はラベルの箱とトラックの箱。ほかは行いっぱいに広げたラベルの ::after（行の線を含む四角）
// 指用の列は幅 390px の画面なので、比較の枠の列の幅を、この列だけ中身の幅にする
const axisCss = `
[data-axis46] .overflow-x-auto > .grid {
  grid-template-columns: minmax(200px, 240px) repeat(2, minmax(280px, 1fr)) repeat(2, max-content) repeat(3, minmax(280px, 1fr)) !important;
}
[data-show-hit] [data-axis46-list] > [data-switch-frame] label::after {
  outline: 1px dashed rgb(236 72 153 / 0.9);
  outline-offset: -1px;
}
[data-show-hit] [data-axis46-list] > :not([data-switch-frame]) label {
  outline: 1px dashed rgb(236 72 153 / 0.9);
}
[data-show-hit] [data-axis46-list] > :not([data-switch-frame]) [role='switch']::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px dashed rgb(236 72 153 / 0.9);
  border-radius: inherit;
  pointer-events: none;
}
`;

// placement: トラックの位置。「トグルが左」の列だけ start（部品の既定）、ほかは end
const List = ({ frame, placement }: { frame: ComparedFrame; placement: 'start' | 'end' }) => (
  // 現行版は行を 8px ずつ離して並べる。ほかは続けて置く（card は部品が --switch-row-gap だけ離す）
  // grouped は divided の行に pins.tsx の CSS を当てて描く
  <div
    data-axis46-list
    data-switch-grouped-as-compared={frame === 'grouped' || undefined}
    className={['flex flex-col', frame === 'none' && 'gap-2'].filter(Boolean).join(' ')}
  >
    {rows.map((row) => (
      <Switch
        key={row.label}
        frame={frame === 'grouped' ? 'divided' : frame}
        togglePlacement={placement}
        label={row.label}
        caption={row.caption}
        defaultChecked={row.defaultChecked}
        disabled={row.disabled}
        className={row.target ? 'axis46-target' : undefined}
      />
    ))}
  </div>
);

const Cell = ({ column, candidate }: { column: Column; candidate: Candidate }) => {
  const frame = frames[candidate.id];
  const placement = column.label.includes('トグルが左') ? 'start' : 'end';
  if (column.label.startsWith('指用')) {
    // 幅 390px の画面。区切り線（B）は画面の左右の端まで引く。ほかは画面の左右に 16px の余白
    return (
      <div
        data-density="coarse"
        className="box-content w-[390px] rounded-[32px] border border-line bg-bg py-6"
      >
        <div className={frame === 'divided' ? undefined : 'px-4'}>
          <List frame={frame} placement={placement} />
        </div>
      </div>
    );
  }
  return (
    <div data-density="fine" className="max-w-[320px]">
      <List frame={frame} placement={placement} />
    </div>
  );
};

interface ComparisonArgs {
  pick: string;
  showHitArea: boolean;
}

const meta = {
  title: 'Design Review/46 トグルを右に置いた行の押せる範囲',
  id: 'design-review-46-switch-row',
  decorators: [keepSwitchCaptionAsCompared, keepToggleColorAsCompared],
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      hover: ['[data-preview="hover"] .axis46-target'],
      active: [
        '[data-preview="active"] .axis46-target',
        '[data-preview="active"] .axis46-target label',
      ],
      focusVisible: ['[data-preview="focus"] .axis46-target [role="switch"]'],
    },
  },
  args: { pick: 'current,A,B', showHitArea: false },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）。使い分けるときはカンマで区切る',
      control: 'text',
    },
    showHitArea: {
      name: '押せる範囲',
      description: '押せる範囲を点線で囲んで見せる',
      control: 'boolean',
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick, showHitArea }) => (
    <div data-axis46 data-show-hit={showHitArea || undefined}>
      <style>{axisCss + switchGroupedAsComparedCss}</style>
      <Comparison
        index={46}
        axis="トグルを右に置いた行の押せる範囲"
        pick={pick}
        candidates={candidates}
        columns={columns}
        renderCell={(column, candidate) => <Cell column={column} candidate={candidate} />}
      >
        <p>
          かずえもんのメモ:「Select
          で右側トグルを選んだ場合、トグルできる領域がかなり狭いのと、対応が分かりづらいので、薄い四角で括られて内部領域に全部判定がある形式や、上下に
          divider を配置して、divider
          の中は全部判定がある、とかにしたほうがいいかもですね。そのサンプルも貰えると助かります。」（トグルを右に置いたとき）
        </p>
        <p>
          <strong className="text-fg">決まったこと</strong>
          （ADR-0066）。押せる範囲は、見た目の範囲と一致させます。見えない広がりは付けません。いまのトグルは、文字の幅とトラックだけが押せます。トラックを右に置くと、文字とトラックのあいだの空白は押せず、どの文字がどのトグルのものかも分かりにくくなります。
        </p>
        <p>
          ここで選ぶのは、行全体を押せるようにするときの、押せる範囲の見せ方です。A・B・C
          は、行の範囲を囲みか区切り線で描き、その内側のどこを押しても切り替わります。hover
          と押しているあいだは行の塗りが変わり、押せる範囲がそこでも見えます。部品の既定は現行版のままで、行の形は
          Switch の frame で選びます。
        </p>
        <p>
          列は、マウス用と指用（幅 390px の画面）の通常の見た目と、マウス用の2行目（プッシュ通知）を
          hover・押しているあいだ・キーボードのフォーカスに固定したものです。4行目は押せない行です。Controls
          の「押せる範囲」を入れると、押せる範囲を点線で囲みます。
        </p>
        <p>どれを既定にするか、ほかを選べるようにするかを一言添えてください。</p>
      </Comparison>
    </div>
  ),
};
