import type { Meta, StoryObj } from '@storybook/react-vite';

import { ListCell, scrollableDecorator } from './action-bar-axis-parts';
import { type Candidate, type Column, Comparison } from './Comparison';
import type { ActionBarButtonNarrowPlacement } from '../../src/components/action-bar/ActionBar';

// 軸 654: ActionBar の操作が入りきらないときの形
const meta = {
  title: 'Design Review/654 ActionBar の操作が入りきらないとき',
  id: 'design-review-654-action-bar-narrow',
  parameters: { layout: 'fullscreen' },
  decorators: [scrollableDecorator],
  args: { pick: 'B,current,A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', '決定'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

// 決めたあと、帯の narrowDisplay ではなく、操作ごとの narrowPlacement になった
//   比べた 3 案は、4 つの操作すべてに同じ扱いを付けた形で再現する。最後の行は、扱いを混ぜた見本
const placements: Record<string, ActionBarButtonNarrowPlacement[]> = {
  現行版: ['menu', 'menu', 'menu', 'menu'],
  A: ['icon-only', 'icon-only', 'icon-only', 'icon-only'],
  B: ['bar', 'bar', 'bar', 'bar'],
  決定: ['icon-only', 'menu', 'menu', 'bar'],
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '⋮ のメニューに畳む',
    intent:
      '入りきらない操作を、後ろから ⋮ のメニューに畳む。帯の高さは変わらない。畳んだ操作は 1 回多く押す必要がある。メニューは、指で狭い画面ではシートで出る',
    spec: [
      ['入りきらないとき', '後ろの操作から ⋮ に畳む'],
      ['narrowPlacement', 'menu（すべての操作）'],
    ],
  },
  {
    id: 'A',
    name: 'アイコンだけにする',
    intent:
      'まず文字を外してアイコンだけにし、それでも入らないときに ⋮ へ畳む。押す回数は増えにくいが、アイコンだけで意味が伝わる操作に限られる（名前は読み上げにだけ出る）',
    spec: [
      ['入りきらないとき', '文字を外す → それでも入らなければ ⋮'],
      ['narrowPlacement', 'icon-only（すべての操作）'],
    ],
  },
  {
    id: 'B',
    name: '折り返す',
    intent:
      '件数の行と操作の行に分けて、帯を高くする。どの操作もそのまま押せるが、帯が一覧を大きく隠す',
    spec: [
      ['入りきらないとき', '次の行へ折り返す'],
      ['narrowPlacement', 'bar（既定。すべての操作）'],
    ],
  },
  {
    id: '決定',
    name: '操作ごとに扱いを混ぜた見本',
    intent:
      '複製は icon-only、書き出す・移動は menu、削除は書かない（bar）。狭くなると、複製の文字を外す → 移動・書き出すの順に ⋮ へ畳む → それでも入らなければ削除を次の行へ折り返す',
    spec: [
      ['複製', 'icon-only'],
      ['書き出す・移動', 'menu'],
      ['削除', 'bar（既定）'],
    ],
  },
];

const columns: Column[] = [
  {
    label: '幅を変えられる見本',
    note: '枠の右下の角をつまんで幅を変えると、入りきらなくなったところで形が変わります',
  },
  { label: '狭い一覧（320px）', note: 'スマホの幅くらい。⋮ を押すと畳んだ操作が出ます' },
];

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={654}
      axis="ActionBar の操作が入りきらないとき"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <ListCell
          actions="many"
          icons
          placements={placements[candidate.id]}
          resizable={column.label === '幅を変えられる見本'}
          width={column.label === '幅を変えられる見本' ? '560px' : '320px'}
        />
      )}
    >
      <p>
        決定: 帯ではなく操作（ActionBarButton）ごとに narrowPlacement で扱いを持つ。既定は B（bar:
        畳まずに折り返す）。menu を付けた操作は現行版のように ⋮ に畳み、icon-only を付けた操作は A
        のようにまず文字を外す。順は「icon-only の文字を外す → menu を後ろから畳む →
        それでも入らなければ折り返す」。最後の行が、扱いを混ぜた見本。「畳んでよいものとそうでないものがあると思うので、デフォルトは
        B として、Navbar
        のように畳んでよいもの扱いなら現行、アイコンだけにしてもよい扱いならAになる、でいいかなと思いました。」
      </p>
      <p>
        操作（複製・書き出す・移動・削除）が帯に入りきらないときの形を選びます。帯の面と幅は、決めた既定（白い面・横いっぱい）でそろえています。
      </p>
      <p>
        比べたときのおすすめは現行版（⋮
        のメニューに畳む。帯の高さが変わらず、一覧を隠す広さが一定）でした。
      </p>
    </Comparison>
  ),
};
