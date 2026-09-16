import type { Meta, StoryObj } from '@storybook/react-vite';

import { Switch, type SwitchFrame } from '../../src/components/Switch';
import { type Candidate, type Column, Comparison } from './Comparison';
import { keepToggleColorAsCompared } from './pins';

// 後半の軸 48: トグルとキャプションの置き方
//   ユーザーの「45, 46, 47 ですが、トグル＋ラベルに対して、キャプションの位置でかなり迷っていると思います。…
//   キャプションの位置によってトグルの位置が変わるのがちょっと違和感がありまして。」から
// 共通のルール（A〜E）: トグルとラベルは、部品の高さの1行（マウス用 40px・指用 44px・大きい指用 52px）の縦の中央にそろえる。
//   キャプションはこの行の外に置き、有無や長さでこの行とトラックの位置は変わらない
// 案はトークン（src/components/Switch.tsx が読む。design/tokens.css の「キャプションの置き方」）の上書きだけで作る。どの行も同じ値を明示する
//   --switch-line: 1 で1行を部品の高さに固定する（0 はいま）。--switch-track-align・--switch-label-align: 1行の中のそろえ方
//   --switch-columns-start・-end: 格子の列（線の名前 track・label・row・aside）
//   --switch-caption-column・-row・-gap・-hug: キャプションの列・行・上の間・ラベルの下端から測るか
//   --color-switch-caption-surface・--switch-caption-pad-x・-pad-y・--switch-caption-radius: キャプションの面
//   --switch-track-rows・--switch-row-track-rows・--switch-row-track-align: トラックの縦の位置（囲みなし・囲みあり）と、囲みありのそろえ方

const columnsStart =
  '[row-start track-start] auto [track-end label-start] minmax(0, 1fr) [label-end row-end]';
const columnsEnd =
  '[row-start label-start] minmax(0, 1fr) [label-end track-start] auto [track-end row-end]';
// D: ラベルの右に、キャプションの列（aside）を足す。ラベルの列は文字の幅
const columnsAsideStart =
  '[row-start track-start] auto [track-end label-start] auto [label-end aside-start] minmax(0, 1fr) [aside-end row-end]';
const columnsAsideEnd =
  '[row-start label-start] auto [label-end aside-start] minmax(0, 1fr) [aside-end track-start] auto [track-end row-end]';

// 現行版: ラベルの行の中央にトラック。キャプションはラベルのすぐ下。囲みがあるときは、トラックを行の縦の中央に置く
const current = {
  '--switch-line': '0',
  '--switch-track-align': 'center',
  '--switch-label-align': 'center',
  '--switch-columns-start': columnsStart,
  '--switch-columns-end': columnsEnd,
  '--switch-caption-column': 'label',
  '--switch-caption-row': '2',
  '--switch-caption-gap': '0px',
  '--switch-caption-hug': '0',
  '--color-switch-caption-surface': 'transparent',
  '--switch-caption-pad-x': '0px',
  '--switch-caption-pad-y': '0px',
  '--switch-caption-radius': '0px',
  '--switch-track-rows': '1 / 2',
  '--switch-row-track-rows': '1 / -1',
  '--switch-row-track-align': 'center',
  '--switch-gap': '12px',
  '--switch-row-pad-y': '8px',
  // 囲みがあるときの行の押下の塗りと動き。比べたときの値（押すと濃くする）。軸 47 の A で部品の既定が変わったので明示する
  '--switch-row-press-darken': '8%',
  '--switch-row-duration': '100ms',
  '--switch-row-press-duration': '100ms',
};

// A〜E の共通: 1行を部品の高さに固定し、トラックとラベルをその中央に置く。囲みがあってもトラックは1行の中
const line = {
  ...current,
  '--switch-line': '1',
  '--switch-track-align': 'start',
  '--switch-label-align': 'baseline',
  '--switch-row-track-rows': '1 / 2',
  '--switch-row-track-align': 'start',
};

const surface = {
  '--color-switch-caption-surface': 'var(--color-field)',
  '--switch-caption-pad-x': '12px',
  '--switch-caption-pad-y': '8px',
  '--switch-caption-radius': 'var(--radius-control)',
};

const lineSpec: [string, string][] = [
  [
    'トラックの位置',
    '部品の高さの1行（40・44・52px）の縦の中央。上端から 9px・8px・12px。キャプションの有無・長さで動かない',
  ],
  [
    '囲みがあるとき',
    '1行の高さは線を含めて部品の高さ（キャプションなしの行はいまと同じ高さ）。キャプションの下は1行の上と同じだけあける',
  ],
];

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'ラベルの下（いま）',
    intent:
      'ラベルのすぐ下にキャプション。トラックはラベルの行の中央。キャプションがあると、ラベルとキャプションのまとまりが部品の高さの中央に来るので、ラベルとトラックが上に寄る。囲みがあるときは、トラックを行の縦の中央に置く（軸 46）。',
    spec: [
      ['キャプションの位置', 'ラベルの列、ラベルのすぐ下（間 0）'],
      [
        'トラックの位置',
        '囲みなし: ラベルの行の中央。キャプションがあると上に動く（マウス用で上端から 9px → 1px、2行だと 0px）。囲みあり: 行の縦の中央なので、キャプションの長さで下がる（9px → 15px → 23px）',
      ],
      ['囲みがあるとき', '上下の余白 8px（線を含む）。トラックは行の縦の中央'],
      ['原則4（3層）', 'ラベルとキャプションが1つのまとまり。キャプションは小さくグレー'],
      [
        '押せる範囲',
        '囲みなし: ラベルの文字とトラック（キャプションは入らない）。囲みあり: 行全体（キャプションも入る）',
      ],
    ],
    tokens: current,
  },
  {
    id: 'A',
    name: '1行の下、ラベルの始まりにそろえる',
    intent:
      '1行（トラックとラベル）の下に、ラベルの始まりにそろえてキャプションを置く。1行の下の余白を詰め、ラベルの下端のすぐ下から始める（ラベルとキャプションの間はいまと同じ）。',
    spec: [
      ['キャプションの位置', 'ラベルの列（トグルが右のときは左端から、トラックの手前まで）'],
      [
        '行とキャプションの間',
        'ラベルの下端から 0（1行の下の余白 10px・10px・14px を詰める）。トラックの下端とは横にずれていて重ならない',
      ],
      ...lineSpec,
      [
        '原則4（3層）',
        'いまと同じく、ラベルとキャプションが1つのまとまり。トラックとラベルの並びだけが固定される',
      ],
      ['押せる範囲', '囲みなし: ラベルの文字とトラック。囲みあり: 行全体（キャプションも入る）'],
    ],
    tokens: { ...line, '--switch-caption-hug': '1' },
  },
  {
    id: 'B',
    name: '1行の下、幅いっぱい',
    intent:
      '1行の下に、幅いっぱい（トラックの下から）でキャプションを置く。トラックとぶつからないよう、1行の下端から少しだけ詰める。トグルが左のとき、キャプションの始まりがラベルとずれ、トラックの下に文字が回り込む。',
    spec: [
      [
        'キャプションの位置',
        '幅いっぱい（トグルが左ならトラックの下から、右ならトラックの下まで）',
      ],
      [
        '行とキャプションの間',
        '1行の下端から -4px（トラックの下端から 5px・4px・8px。ラベルの下端から 6px・6px・10px）',
      ],
      ...lineSpec,
      ['原則4（3層）', 'キャプションが1行（ラベルと本体）全体の説明として下に付く。小さくグレー'],
      ['押せる範囲', '囲みなし: ラベルの文字とトラック。囲みあり: 行全体（キャプションも入る）'],
    ],
    tokens: { ...line, '--switch-caption-column': 'row', '--switch-caption-gap': '-4px' },
  },
  {
    id: 'C',
    name: '1行の下に、グレーの面で出す',
    intent:
      '1行の下に、入力欄の塗りの面を敷いてキャプションを出す。面は幅いっぱい、角は部品の角、影なし。説明が1行とは別の欄として分かれて見える（ユーザーの「下にグレー地で出てくる」）。',
    spec: [
      ['キャプションの位置', '幅いっぱいの面の中（左右 12px・上下 8px の余白）'],
      ['面', '入力欄の塗り（#F2F4F4）。角は部品の角 12px。影・線なし'],
      ['行とキャプションの間', '1行の下端から 0（トラックの下端から 9px・8px・12px）'],
      ...lineSpec,
      [
        '原則4（3層）',
        'キャプションは小さくグレーのまま、面で1行と分ける。面は押すものの塗りと同じ色なので、押せそうに見えないかを見る',
      ],
      [
        '押せる範囲',
        '囲みなし: ラベルの文字とトラック（面は押せない）。囲みあり: 行全体（面も入る）',
      ],
    ],
    tokens: { ...line, ...surface, '--switch-caption-column': 'row' },
  },
  {
    id: 'D',
    name: 'ラベルの右に続けて',
    intent:
      'ラベルと同じ行の右に、小さい文字で続けて置く。短いキャプション向け。長いときは、ラベルの右の幅の中で折り返し、1行より下に伸びる（トラックとラベルは動かない）。',
    spec: [
      ['キャプションの位置', 'ラベルの右（間 12px）。トグルが右のときは、ラベルとトラックのあいだ'],
      ['行とキャプションの間', '同じ行。ラベルと文字の並び（ベースライン）をそろえる'],
      ...lineSpec,
      ['長いとき', 'ラベルの右の幅で折り返す。2行を超えると、部品が下に伸びる'],
      [
        '原則4（3層）',
        'ラベルとキャプションが横に並ぶ。大きさとグレーで区別する。長いと3層が崩れる',
      ],
      [
        '押せる範囲',
        '囲みなし: ラベルの文字とトラック（キャプションは入らない）。囲みあり: 行全体',
      ],
    ],
    tokens: {
      ...line,
      '--switch-columns-start': columnsAsideStart,
      '--switch-columns-end': columnsAsideEnd,
      '--switch-caption-column': 'aside',
      '--switch-caption-row': '1',
    },
  },
  {
    id: 'E',
    name: 'C の面を、ラベルの始まりから',
    intent:
      'C の面を、ラベルの列だけに敷く。トグルが左のとき、面はトラックの下を空けてラベルの始まりから。トグルが右のとき、面はトラックの手前まで。',
    spec: [
      ['キャプションの位置', 'ラベルの列の面の中（左右 12px・上下 8px の余白）'],
      ['面', 'C と同じ（入力欄の塗り、角 12px、影・線なし）'],
      ['行とキャプションの間', '1行の下端から 0'],
      ...lineSpec,
      ['原則4（3層）', 'C と同じ。面がラベルの下にだけ付くので、ラベルの説明として読める'],
      ['押せる範囲', '囲みなし: ラベルの文字とトラック。囲みあり: 行全体（面も入る）'],
    ],
    tokens: { ...line, ...surface, '--switch-caption-column': 'label' },
  },
];

const columns: Column[] = [
  {
    label: 'マウス用・トグルが左',
    note: 'data-density="fine"。togglePlacement="start"（部品の既定）',
  },
  { label: 'マウス用・トグルが右', note: 'data-density="fine"。togglePlacement="end"' },
  {
    label: '指用・トグルが左（幅 390px の画面）',
    note: 'data-density="coarse"。画面の左右の余白 16px',
  },
  { label: '指用・トグルが右（幅 390px の画面）', note: 'data-density="coarse"' },
  {
    label: '大きい指用・トグルが右（390px）',
    note: 'data-density="coarse" + coarse-large。部品の高さ 52px',
  },
];

const longCaption = 'オンにすると、新しい記事が公開されたときにメールでお知らせします。';

const rows = [
  { key: 'none', label: 'お知らせを受け取る', defaultChecked: true },
  { key: 'short', label: 'プッシュ通知', caption: 'コメントがついたときに届きます' },
  { key: 'long', label: 'メールで受け取る', caption: longCaption, defaultChecked: true },
  { key: 'disabled', label: '位置情報を使う', caption: 'この端末では使えません', disabled: true },
];

const frameGroups: { frame: SwitchFrame; label: string }[] = [
  { frame: 'none', label: '囲みなし（frame="none"）' },
  { frame: 'divided', label: '区切り線（frame="divided"）' },
  { frame: 'card', label: '囲み（frame="card"）' },
];

// 押せる範囲を見せる（Controls の「押せる範囲」）: 押せる範囲を点線で囲む（軸 46 と同じ）
//   囲みなしはラベルの箱とトラックの箱。囲みありは行いっぱいに広げたラベルの ::after
// 列の幅: マウス用は 320px、指用は 390px の画面の幅
const axisCss = `
[data-axis48] .overflow-x-auto > .grid {
  grid-template-columns: minmax(200px, 240px) repeat(2, 320px) repeat(3, max-content) !important;
}
[data-show-hit] [data-axis48-list] > [data-switch-frame] label::after {
  outline: 1px dashed rgb(236 72 153 / 0.9);
  outline-offset: -1px;
}
[data-show-hit] [data-axis48-list] > :not([data-switch-frame]) label {
  outline: 1px dashed rgb(236 72 153 / 0.9);
}
[data-show-hit] [data-axis48-list] > :not([data-switch-frame]) [role='switch']::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px dashed rgb(236 72 153 / 0.9);
  border-radius: inherit;
  pointer-events: none;
}
`;

const Heading = ({ children }: { children: string }) => (
  <h2 className="pb-1 text-xs font-bold text-fg-subtle">{children}</h2>
);

// 上から、キャプションなし・短い・2行に折り返す長いもの・押せない
const List = ({ frame, placement }: { frame: SwitchFrame; placement: 'start' | 'end' }) => (
  // 囲みなしは行を 8px ずつ離して並べる。ほかは続けて置く（card は部品が --switch-row-gap だけ離す）
  <div
    data-axis48-list
    className={['flex flex-col', frame === 'none' && 'gap-2'].filter(Boolean).join(' ')}
  >
    {rows.map((row) => (
      <Switch
        key={row.key}
        frame={frame}
        togglePlacement={placement}
        label={row.label}
        caption={row.caption}
        defaultChecked={row.defaultChecked}
        disabled={row.disabled}
        data-axis48-case={row.key}
      />
    ))}
  </div>
);

type FramesArg = 'all' | SwitchFrame;

const Cell = ({ column, frames }: { column: Column; frames: FramesArg }) => {
  const placement = column.label.includes('トグルが左') ? 'start' : 'end';
  const coarse = column.label.includes('指用');
  const large = column.label.startsWith('大きい');
  const groups = frameGroups.filter((g) => frames === 'all' || g.frame === frames);
  return (
    <div
      data-density={coarse ? 'coarse' : 'fine'}
      className={[
        'flex flex-col gap-6',
        coarse
          ? 'box-content w-[390px] rounded-[32px] border border-line bg-bg py-6'
          : 'max-w-[320px]',
        large && 'coarse-large',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {groups.map((g) => (
        // 指用の区切り線は画面の左右の端まで引く（軸 46 と同じ）。見出しと、ほかの形は左右に 16px の余白
        <section key={g.frame} data-axis48-frame={g.frame}>
          <div className={coarse ? 'px-4' : undefined}>
            <Heading>{g.label}</Heading>
          </div>
          <div className={coarse && g.frame !== 'divided' ? 'px-4' : undefined}>
            <List frame={g.frame} placement={placement} />
          </div>
        </section>
      ))}
    </div>
  );
};

interface ComparisonArgs {
  pick: string;
  showHitArea: boolean;
  frames: FramesArg;
}

const meta = {
  title: 'Design Review/48 トグルとキャプションの置き方',
  id: 'design-review-48-switch-caption',
  decorators: [keepToggleColorAsCompared],
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A,E', showHitArea: false, frames: 'all' },
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
    frames: {
      name: '行の形',
      description: 'セルに並べる行の形（all は囲みなし・区切り線・囲みの3つ）',
      control: 'inline-radio',
      options: ['all', 'none', 'divided', 'card'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick, showHitArea, frames }) => (
    <div data-axis48 data-show-hit={showHitArea || undefined}>
      <style>{axisCss}</style>
      <Comparison
        index={48}
        axis="トグルとキャプションの置き方"
        pick={pick}
        candidates={candidates}
        columns={columns}
        renderCell={(column) => <Cell column={column} frames={frames} />}
      >
        <p>
          <strong className="text-fg">決まったこと</strong>（ADR-0068）。囲みなし（frame="none"）の
          A
          が既定です。E（キャプションをラベルの列に敷いた淡いグレーの面に出す形）も選べます。囲みを付けるときは、トグルを囲みの縦の中央に置きます。軸
          44 は、この決定で置き換わりました。
        </p>
        <p>
          かずえもんのメモ:「45, 46, 47
          ですが、トグル＋ラベルに対して、キャプションの位置でかなり迷っていると思います。トグルとラベルが縦中央ぞろえとしたとき、いろいろなキャプションの位置の案（下にグレー地で出てくる
          など）を出してほしいです。キャプションの位置によってトグルの位置が変わるのがちょっと違和感がありまして。」
        </p>
        <p>
          A〜E の共通のルール。トグルとラベルは、部品の高さの1行（マウス用 40px・指用
          44px・大きい指用
          52px）の中で縦の中央にそろえます。キャプションはこの行の外に置くので、キャプションがあってもなくても、長くても、トラックとラベルの位置は変わりません。囲み（区切り線・囲み）があっても、トラックはこの1行の中です。ここで選ぶのは、キャプションをどこにどう置くかです。
        </p>
        <p>
          各セルは上から、キャプションなし・短い・2行に折り返す長いもの・押せない、の4行です。それを囲みなし・区切り線・囲みの3つの形で並べています（Controls
          の「行の形」で1つに絞れます）。Controls
          の「押せる範囲」を入れると、押せる範囲を点線で囲みます。
        </p>
        <p>どれを既定にするか、ほかを選べるようにするかを一言添えてください。</p>
      </Comparison>
    </div>
  ),
};
