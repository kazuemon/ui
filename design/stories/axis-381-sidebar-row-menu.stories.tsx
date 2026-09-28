import type { Meta, StoryObj } from '@storybook/react-vite';

import { statePseudo } from '../../src/stories/story-states';
import { type Candidate, type Column, Comparison } from './Comparison';
import { Frame } from './sidebar-axis-parts';

// 軸 381: Sidebar の行ごとのメニュー
//   行の右端に ︙ のボタンを置き、名前を変える・複製・削除などを出す。ボタンをいつ見せるかを比べる。畳んだ列では出さない
const meta = {
  title: 'Design Review/381 Sidebar の行ごとのメニュー',
  id: 'design-review-381-sidebar-row-menu',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({ hover: 'li:has(> a[href="#b"]), [data-preview="hover"] a[href="#b"]' }),
  },
  args: { pick: 'D,B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: 'A',
    name: 'いつも見せる',
    intent:
      'どの行にも ︙ をいつも出す。操作があることがすぐ分かり、指の画面と同じ見た目になる。行が多いと ︙ が縦に並んでうるさい',
    spec: [
      ['ふだん', '見せる'],
      ['いまいる行', '見せる'],
    ],
    tokens: {
      '--sidebar-action-rest-opacity': '1',
      '--sidebar-action-current-opacity': '1',
    },
  },
  {
    id: 'B',
    name: '載せたときだけ',
    intent:
      '行に載せたとき・キーボードでボタンにフォーカスしたとき・メニューを開いているあいだだけ出す。ふだんは静か。指の画面（hover がない）では、いつも出す',
    spec: [
      ['ふだん', '隠す'],
      ['いまいる行', '隠す'],
    ],
    tokens: {
      '--sidebar-action-rest-opacity': '0',
      '--sidebar-action-current-opacity': '0',
    },
  },
  {
    id: 'C',
    name: '載せたとき＋いまいる行',
    intent:
      'B に加えて、いまいる行ではいつも出す。いま見ているグループの操作にはすぐ手が届き、ほかの行は静か',
    spec: [
      ['ふだん', '隠す'],
      ['いまいる行', '見せる'],
    ],
    tokens: {
      '--sidebar-action-rest-opacity': '0',
      '--sidebar-action-current-opacity': '1',
    },
  },
  {
    id: 'D',
    name: '半分の濃さ・載せると濃く',
    intent:
      'DataTable の並べ替えの印と同じ見せ方。ふだんから半分の濃さで置き、行に載せる・フォーカスすると濃くする。操作があることは分かり、行が多くてもうるさくない',
    spec: [
      ['ふだん', '半分の濃さ'],
      ['載せたとき', '濃く'],
    ],
    tokens: {
      '--sidebar-action-rest-opacity': '0.5',
      '--sidebar-action-current-opacity': '0.5',
    },
  },
];

const columns: Column[] = [
  { label: '通常', note: 'いまいる行は「Aグループ」' },
  { label: '「Bグループ」に載せた', preview: 'hover' },
];

export const Axis: Story = {
  name: 'Sidebar の行ごとのメニュー',
  render: ({ pick }) => (
    <Comparison
      index={381}
      axis="Sidebar の行ごとのメニュー"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={() => (
        <Frame features={{ edges: true, counts: true, menus: true }} height={640} />
      )}
    >
      <p className="font-bold text-fg">
        決定（ADR-0360）: 既定は D（DataTable
        の並べ替えの印と同じ。半分の濃さ・載せると濃く）。載せたときだけ出す B
        と、いつも出すも選べる。
      </p>
      <p>
        グループ・リーグの行と、下のアカウントの行に ︙ を付けています（SidebarItem の
        menu）。ボタンは行のリンクの外に重ねます。
      </p>
      <p>
        行の並べ替えは、この部品には持たせず、Sortable（dnd-kit
        のレシピ）と組み合わせる形を考えています。並べ替えが要る場面があれば教えてください。
      </p>
    </Comparison>
  ),
};
