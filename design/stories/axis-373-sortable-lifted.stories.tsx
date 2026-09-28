import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { StaticDrag, TryList } from './sortable-frame';

// 軸 373: Sortable の持ち上げた項目（dragging）の見た目
//   候補は design/tokens.css の --sortable-lifted-shadow・--sortable-lifted-scale・--sortable-lifted-rotate の上書きだけで作る
//   持ち上がる動き（置いてあった見た目から変わる）は押す動きと同じ長さ。動きを減らす設定ではすぐに変わる

const overlayShadow =
  'var(--shadow-overlay), inset 0 0 0 var(--border-width-thin) var(--color-surface-line)';

const columns: Column[] = [
  { label: 'fill（グレーの塗り）', note: '2 つ目を持ち上げたところ' },
  { label: 'card（白い面）', note: '2 つ目を持ち上げたところ' },
  { label: '試す', note: 'つまみを引いてください' },
];

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '重なる面と同じ影',
    intent:
      'ポインタについて動く写しはページの上に重なるので、選択肢や Popover と同じやわらかく広い影と細い輪郭にする（原則1）。大きさと角度は変えない。',
    spec: [
      ['影', '0 8px 24px / 12%（--shadow-overlay）＋輪郭 1px'],
      ['大きさ', '1'],
      ['傾き', '0'],
    ],
    tokens: {
      '--sortable-lifted-shadow': overlayShadow,
      '--sortable-lifted-scale': '1',
      '--sortable-lifted-rotate': '0deg',
    },
  },
  {
    id: 'A',
    name: '少し大きくする',
    intent:
      '影は現行版のまま、写しを少しだけ大きくして手前に来たことを見せる。Slider のつまみを押したときに膨らむ手応えと同じ方向。',
    spec: [
      ['影', '現行版と同じ'],
      ['大きさ', '1.03'],
      ['傾き', '0'],
    ],
    tokens: {
      '--sortable-lifted-shadow': overlayShadow,
      '--sortable-lifted-scale': '1.03',
      '--sortable-lifted-rotate': '0deg',
    },
  },
  {
    id: 'B',
    name: '影を濃く、低く',
    intent:
      '影を濃く近くにして、つまんで持ち上げた感じを強める。Slider の lift と同じ考え方。重なる面より強い影になる。',
    spec: [
      ['影', '0 4px 12px / 24%＋輪郭 1px'],
      ['大きさ', '1'],
      ['傾き', '0'],
    ],
    tokens: {
      '--sortable-lifted-shadow':
        '0 4px 12px rgb(from var(--color-shadow) r g b / 0.24), inset 0 0 0 var(--border-width-thin) var(--color-surface-line)',
      '--sortable-lifted-scale': '1',
      '--sortable-lifted-rotate': '0deg',
    },
  },
  {
    id: 'C',
    name: '少し傾ける',
    intent:
      '手でつまんでいる感じを傾きで出す（Trello などに近い）。ポップだが、整然とは離れる。影は現行版のまま。',
    spec: [
      ['影', '現行版と同じ'],
      ['大きさ', '1'],
      ['傾き', '2deg'],
    ],
    tokens: {
      '--sortable-lifted-shadow': overlayShadow,
      '--sortable-lifted-scale': '1',
      '--sortable-lifted-rotate': '2deg',
    },
  },
];

function renderCell(column: Column) {
  if (column.label === '試す') return <TryList />;
  return <StaticDrag variant={column.label.startsWith('card') ? 'card' : 'fill'} />;
}

const meta = {
  title: 'Design Review/373 Sortableの持ち上げた項目',
  id: 'design-review-373-sortable-lifted',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A,B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'A,B'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;
type Story = StoryObj<{ pick: string }>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={373}
      axis="Sortable の持ち上げた項目"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={renderCell}
    >
      <p className="font-bold text-fg">
        決定: A（少し大きくする）と
        B（影を濃く、低く）を合わせた見た目にする。選べるようにはしない。「A+B
        の組み合わせとしたいです。持っている実感が一番ありました。」傾き（C）のトークンは畳んだので、この比較の
        C の行はもう傾かない（決めたときの見た目は比較画像とコミットで残す）
      </p>
      <p>
        引いているあいだ、ポインタについて動く写しの見た目を決めます。面はどの案も白で、入る場所（元の項目）は点線の枠です（軸
        374）。
      </p>
      <p>
        「試す」の列で引くと、置いてあった見た目から持ち上がる動きも見られます。どれを既定にするか、ほかも選べるようにするかを選んでください。
      </p>
    </Comparison>
  ),
};
