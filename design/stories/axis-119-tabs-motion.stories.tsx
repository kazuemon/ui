import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { TabsSample } from './tabs-samples';
import type { TabsIndicatorMotion } from '../../src/components/tabs/Tabs';

// 後半の軸 119: Tabs の印の動き
// 決定（ADR 未定）: 現行版（滑る、200ms）を既定にし、A（すぐ切り替える）も選べるようにします（Tabs の indicatorMotion）。伸びて縮む案（B）は採りません
// 動きは部品の値に畳んだので、各行は indicatorMotion の値だけで描く

const LOOKS: Record<string, TabsIndicatorMotion> = {
  現行版: 'slide',
  A: 'none',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '滑る',
    intent: '印が選んだタブへ滑る。両端が同時に動く。長さと緩急は、行が出る動き・押下と同じ。',
    spec: [
      ['長さ', '200ms'],
      ['緩急', '押下と同じ（速く出て、ゆっくり止まる）'],
    ],
  },
  {
    id: 'A',
    name: 'すぐ切り替わる',
    intent:
      '動かさず、選んだタブにすぐ印を出す。チェックボックスやラジオの「選んだかどうかは、動かさずにすぐ切り替える」と同じ。',
    spec: [['長さ', '0ms']],
  },
];

const columns: Column[] = [
  { label: '下の線（Primary）', note: 'タブを押して動きを見る' },
  { label: '淡い面（Primary）', note: '軸 118 の B の印' },
];

const meta = {
  title: 'Design Review/119 Tabs の印の動き',
  id: 'design-review-119-tabs-motion',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current,A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={119}
      axis="Tabs の印の動き"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const indicatorMotion = LOOKS[candidate.id];
        switch (column.label) {
          case '淡い面（Primary）':
            return (
              <TabsSample indicatorMotion={indicatorMotion} indicator="subtle" color="primary" />
            );
          default:
            return <TabsSample indicatorMotion={indicatorMotion} color="primary" />;
        }
      }}
    >
      <p>
        <strong>
          決定（ADR 未定）:
          現行版（滑る、200ms）を既定にし、A（すぐ切り替える）も選べるようにします（Tabs の
          indicatorMotion）。伸びて縮む案（B）は採りません。
        </strong>
      </p>
      <p>
        選んだタブを変えたとき、印がどう移るかを決めます。静止画では違いが出ないので、各行のタブを押して見比べてください。「概要」から「登壇」のように離れたタブへ移ると違いが分かりやすく、右へ移るときと左へ移るときで伸びる向きが変わります。
      </p>
      <p>
        ポップさは動きで出すという考えに沿うのが現行版、選んだ状態はすぐ切り替えるという考えに沿うのが
        A です。動きを減らす設定では、どちらの案も動かさずに切り替えます。
      </p>
    </Comparison>
  ),
};
