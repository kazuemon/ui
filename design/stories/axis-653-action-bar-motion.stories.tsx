import type { Meta, StoryObj } from '@storybook/react-vite';

import { ListCell, scrollableDecorator } from './action-bar-axis-parts';
import { type Candidate, type Column, Comparison } from './Comparison';

// 軸 653: ActionBar の出入りの動き
const meta = {
  title: 'Design Review/653 ActionBar の出入りの動き',
  id: 'design-review-653-action-bar-motion',
  parameters: { layout: 'fullscreen' },
  decorators: [scrollableDecorator],
  args: { pick: '' },
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

const durations = {
  '--action-bar-duration-enter': 'var(--duration-slow)',
  '--action-bar-duration-exit': 'var(--popup-duration-out)',
} as const;

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
    tokens: {
      ...durations,
      '--action-bar-from-shift': 'calc(100% + var(--action-bar-inset))',
      '--action-bar-from-scale': '1',
      '--action-bar-from-opacity': '0',
    },
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
    tokens: {
      ...durations,
      '--action-bar-from-shift': 'var(--popup-shift)',
      '--action-bar-from-scale': '1',
      '--action-bar-from-opacity': '0',
    },
  },
  {
    id: 'B',
    name: '小さい姿から',
    intent: '少し小さい姿（90%）から、下の辺を中心に広がる。ぽんと出る感じがあり、位置は動かない',
    spec: [
      ['出はじめ', '大きさ 90%・濃さ 0'],
      ['長さ', '出る 250ms・消える 150ms'],
    ],
    tokens: {
      ...durations,
      '--action-bar-from-shift': '0px',
      '--action-bar-from-scale': '0.9',
      '--action-bar-from-opacity': '0',
    },
  },
  {
    id: 'C',
    name: '動かさない',
    intent: 'すぐに出し、すぐに消す（動きを減らす設定のときと同じ）。一覧の下の空きも跳ぶ',
    spec: [
      ['出はじめ', 'なし'],
      ['長さ', '0'],
    ],
    tokens: {
      '--action-bar-duration-enter': '0ms',
      '--action-bar-duration-exit': '0ms',
      '--action-bar-from-shift': '0px',
      '--action-bar-from-scale': '1',
      '--action-bar-from-opacity': '1',
    },
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
        行を選んだとき（帯が出る）と、すべて外したとき（帯が消える）の動きを選びます。どの案も、一覧の下の空きは帯と同じ長さで伸び縮みし、消えるときは出るときより短くします。動きを減らす設定では、どの案でもすぐに出します。
      </p>
      <p>
        おすすめは現行版（下の端から滑って出る）です。帯が下の端から来たと分かり、トーストやシートの出方ともそろいます。
      </p>
    </Comparison>
  ),
};
