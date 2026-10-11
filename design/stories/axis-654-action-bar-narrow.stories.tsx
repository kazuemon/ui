import type { Meta, StoryObj } from '@storybook/react-vite';

import { ListCell, scrollableDecorator } from './action-bar-axis-parts';
import { type Candidate, type Column, Comparison } from './Comparison';
import type { ActionBarNarrowDisplay } from '../../src/components/action-bar/ActionBar';

// 軸 654: ActionBar の操作が入りきらないときの形
const meta = {
  title: 'Design Review/654 ActionBar の操作が入りきらないとき',
  id: 'design-review-654-action-bar-narrow',
  parameters: { layout: 'fullscreen' },
  decorators: [scrollableDecorator],
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

// この軸は部品の指定（narrowDisplay）を行ごとに変える
const displays: Record<string, ActionBarNarrowDisplay> = {
  現行版: 'menu',
  A: 'icon-only',
  B: 'wrap',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '⋮ のメニューに畳む',
    intent:
      '入りきらない操作を、後ろから ⋮ のメニューに畳む。帯の高さは変わらない。畳んだ操作は 1 回多く押す必要がある。メニューは、指で狭い画面ではシートで出る',
    spec: [
      ['入りきらないとき', '後ろの操作から ⋮ に畳む'],
      ['narrowDisplay', 'menu'],
    ],
  },
  {
    id: 'A',
    name: 'アイコンだけにする',
    intent:
      'まず文字を外してアイコンだけにし、それでも入らないときに ⋮ へ畳む。押す回数は増えにくいが、アイコンだけで意味が伝わる操作に限られる（名前は読み上げにだけ出る）',
    spec: [
      ['入りきらないとき', '文字を外す → それでも入らなければ ⋮'],
      ['narrowDisplay', 'icon-only'],
    ],
  },
  {
    id: 'B',
    name: '折り返す',
    intent:
      '件数の行と操作の行に分けて、帯を高くする。どの操作もそのまま押せるが、帯が一覧を大きく隠す',
    spec: [
      ['入りきらないとき', '次の行へ折り返す'],
      ['narrowDisplay', 'wrap'],
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
          narrowDisplay={displays[candidate.id]}
          resizable={column.label === '幅を変えられる見本'}
          width={column.label === '幅を変えられる見本' ? '560px' : '320px'}
        />
      )}
    >
      <p>
        操作（複製・書き出す・移動・削除）が帯に入りきらないときの形を選びます。帯の面・幅（中身に合わせて真ん中）はどの案も同じです。
      </p>
      <p>
        おすすめは現行版（⋮
        のメニューに畳む）です。帯の高さが変わらず、一覧を隠す広さが一定です。既定は現行版にし、A・B
        も narrowDisplay で選べるようにするかを教えてください。
      </p>
    </Comparison>
  ),
};
