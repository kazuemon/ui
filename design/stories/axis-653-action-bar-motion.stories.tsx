import type { Meta, StoryObj } from '@storybook/react-vite';

import { ListCell, scrollableDecorator } from './action-bar-axis-parts';
import { type Candidate, type Column, Comparison } from './Comparison';
import type { ActionBarMotion } from '../../src/components/action-bar/ActionBar';

// 軸 653: ActionBar の出入りの動き
const meta = {
  title: 'Design Review/653 ActionBar の出入りの動き',
  id: 'design-review-653-action-bar-motion',
  parameters: { layout: 'fullscreen' },
  decorators: [scrollableDecorator],
  args: { pick: 'A,current,B,C' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

// 決めたあと、動きは部品の motion になった。行ごとに motion を渡す
const motions: Record<string, ActionBarMotion> = {
  現行版: 'slide',
  A: 'fade-up',
  B: 'scale',
  C: 'none',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '下の端から滑って出る',
    intent:
      'シートやトーストと同じく、下の端の外から滑り上がり、濃さも一緒に上がる。どこから来たかが分かる（重なる面は出てくる元の側から）',
    spec: [
      ['出はじめ', '帯の高さ＋16px 下・濃さ 0'],
      ['長さ', '出る 250ms・消える 150ms'],
    ],
  },
  {
    id: 'A',
    name: '短く浮かぶ',
    intent:
      'メニューや吹き出しと同じく、8px 下から濃さと一緒に浮かぶ。動く距離が短く控えめ。下の端から来た感じは弱い',
    spec: [
      ['出はじめ', '8px 下・濃さ 0'],
      ['長さ', '出る 250ms・消える 150ms'],
    ],
  },
  {
    id: 'B',
    name: '小さい姿から',
    intent: '少し小さい姿（90%）から、下の辺を中心に広がる。ぽんと出る感じがあり、位置は動かない',
    spec: [
      ['出はじめ', '大きさ 90%・濃さ 0'],
      ['長さ', '出る 250ms・消える 150ms'],
    ],
  },
  {
    id: 'C',
    name: '動かさない',
    intent: 'すぐに出し、すぐに消す（動きを減らす設定のときと同じ）。一覧の下の空きも跳ぶ',
    spec: [
      ['出はじめ', 'なし'],
      ['長さ', '0'],
    ],
  },
];

const columns: Column[] = [
  { label: 'ふつうの長さ', note: '行を選ぶ・外すと帯が出入りします' },
  { label: '4 倍の長さ', note: '違いを見るために、出る・消える長さを 4 倍にしたもの' },
];

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={653}
      axis="ActionBar の出入りの動き"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <ListCell
          defaultSelected={[]}
          barProps={{ motion: motions[candidate.id], variant: 'neutral-strong' }}
          style={
            column.label === '4 倍の長さ' && candidate.id !== 'C'
              ? {
                  ['--action-bar-duration-enter' as string]: 'calc(var(--duration-slow) * 4)',
                  ['--action-bar-duration-exit' as string]: 'calc(var(--popup-duration-out) * 4)',
                }
              : undefined
          }
        />
      )}
    >
      <p>
        決定: A（8px
        下から浮かぶ）を既定にし、現行版（下の端から滑る）・B（広がる）・C（動かさない）も motion
        で選べる（fade-up・slide・scale・none）。「デフォルトはA、他も選べるでよさそう」
      </p>
      <p>
        行を選んだとき（帯が出る）と、すべて外したとき（帯が消える）の動きを選びます。どの案も、一覧の下の空きは帯と同じ長さで伸び縮みし、消えるときは出るときより短くします。動きを減らす設定では、どの案でもすぐに出します。
      </p>
      <p>
        おすすめは現行版（下の端から滑って出る）です。帯が下の端から来たと分かり、トーストやシートの出方ともそろいます。
      </p>
    </Comparison>
  ),
};
