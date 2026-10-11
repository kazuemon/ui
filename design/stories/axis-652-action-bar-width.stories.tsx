import type { Meta, StoryObj } from '@storybook/react-vite';

import { ListCell, scrollableDecorator } from './action-bar-axis-parts';
import { type Candidate, type Column, Comparison } from './Comparison';
import type { ActionBarPlacement } from '../../src/components/action-bar/ActionBar';

// 軸 652: ActionBar の帯の幅と寄せ
const meta = {
  title: 'Design Review/652 ActionBar の帯の幅と寄せ',
  id: 'design-review-652-action-bar-width',
  parameters: { layout: 'fullscreen' },
  decorators: [scrollableDecorator],
  args: { pick: 'A,current,C' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

// 決めたあと、幅と寄せは部品の placement になった。行ごとに placement を渡す（B の右寄せは採らずに消した）
const placements: Record<string, ActionBarPlacement> = {
  現行版: 'center',
  A: 'full',
  C: 'docked',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '中身に合わせて真ん中',
    intent:
      'ラフのとおり、帯は中身の幅で、置いた場所の下の真ん中に浮かぶ。件数と操作がまとまって見え、一覧の左右の端は隠さない。指で狭い画面では、左右の余白を残して幅いっぱい',
    spec: [
      ['幅', '中身に合わせる（置いた場所 − 左右 16px まで）'],
      ['寄せ', '真ん中'],
      ['端からの距離', '16px'],
    ],
  },
  {
    id: 'A',
    name: '横いっぱい',
    intent:
      '置いた場所の幅いっぱい（左右に 16px）。件数は左端、操作は右端。広い画面では件数と操作が離れ、帯が一覧の下の端を広く隠す',
    spec: [
      ['幅', '置いた場所 − 左右 16px'],
      ['寄せ', '件数は左・操作は右'],
      ['端からの距離', '16px'],
    ],
  },
  {
    id: 'C',
    name: '下の端に着ける',
    intent:
      '浮かべずに、置いた場所の下の端に幅いっぱいで着ける（角なし・上向きの影）。シートの頭のような見た目で、帯の高さの分だけ一覧が短くなる',
    spec: [
      ['幅', '置いた場所の幅いっぱい'],
      ['寄せ', '件数は左・操作は右'],
      ['端からの距離', '0（角なし・シートの影）'],
    ],
  },
];

const columns: Column[] = [
  {
    label: '広い一覧（640px）',
    note: '行を選ぶと帯が出ます。下までスクロールすると、帯は一覧の下に収まります',
  },
  { label: '狭い一覧（360px）', note: '操作が多いとき。入りきらない操作は ⋮ に畳みます' },
];

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={652}
      axis="ActionBar の帯の幅と寄せ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const barProps = {
          placement: placements[candidate.id],
          variant: 'neutral-strong' as const,
        };
        return column.label.startsWith('広い') ? (
          <ListCell width="640px" barProps={barProps} />
        ) : (
          <ListCell width="360px" actions="many" barProps={barProps} />
        );
      }}
    >
      <p>
        決定: A（横いっぱい）を既定にし、現行版（中身の幅で真ん中）と C（下の端に着ける）も
        placement
        で選べる（full・center・docked）。B（右寄せ）は採らない。「領域によりそうですが、基本は
        A、選択肢として現行とCも選べる、でよさそう」
      </p>
      <p>
        帯をどの幅で、置いた場所のどこに寄せるかを選びます。面と中の並びはどの案も同じです（比べたときの濃いグレーの面のまま見せています）。
        指で操作していて画面が狭いときは、どの案でも左右の余白を残して幅いっぱいにします（トーストと同じ判定）。
      </p>
      <p>
        おすすめは現行版（中身に合わせて真ん中）です。件数と操作がひとかたまりで目に入り、一覧の左右を隠しません。A
        は操作が多い画面で選べるようにする候補です。既定をどれにし、ほかに選べるようにするものがあるかを教えてください。
      </p>
    </Comparison>
  ),
};
