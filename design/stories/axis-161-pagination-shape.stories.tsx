import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Pagination } from '../../src/components/pagination/Pagination';

// 後半の軸 161: Pagination の番号の形
//   --pagination-item-radius（番号と前へ・次への角）
//   --pagination-item-line-width・--pagination-item-line（枠線。B のためだけの切り替え。決まったら畳む）
//   いまのページの印は軸 160 の現行版（グレーの塗り＋太字）で固定

const href = (page: number) => `#page-${page}`;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '部品の角',
    intent:
      '原則5「見た目がボタンなら部品の角」。アイコンだけのボタンの既定（正方形）と同じ形。いまのページの塗りが、角の丸い正方形になる。',
    spec: [
      ['角', '部品の角（--radius-control）'],
      ['枠線', 'なし'],
    ],
    tokens: {
      '--pagination-item-radius': 'var(--radius-control)',
      '--pagination-item-line-width': '0px',
    },
  },
  {
    id: 'A',
    name: '丸（pill）',
    intent:
      'Navbar の行き先・Tabs の淡い面と同じ pill。1〜2 桁の番号は円、3 桁と前へ・次への文字は両端の丸い形になる。行き先を並べる部品どうしで形がそろい、人懐っこい。',
    spec: [
      ['角', 'pill（--radius-pill）'],
      ['枠線', 'なし'],
    ],
    tokens: {
      '--pagination-item-radius': 'var(--radius-pill)',
      '--pagination-item-line-width': '0px',
    },
  },
  {
    id: 'B',
    name: '枠線の四角',
    intent:
      '番号ごとに細い枠線を引き、押せる範囲をふだんから見せる（原則17）。押せることは分かりやすいが、枠が 9 つ並ぶので重く、原則7 の強さの段では枠線のボタンと同じ控えめな操作に見える。',
    spec: [
      ['角', '部品の角（--radius-control）'],
      ['枠線', '細い境界線（--color-line）'],
    ],
    tokens: {
      '--pagination-item-radius': 'var(--radius-control)',
      '--pagination-item-line-width': 'var(--border-width-thin)',
      '--pagination-item-line': 'var(--color-line)',
    },
  },
];

const columns: Column[] = [
  { label: '通常', note: '10 ページのうち 5 ページ目' },
  { label: 'hover', note: '隣の番号（4）', preview: 'hover' },
  { label: '押下', note: '隣の番号（4）', preview: 'active' },
  { label: 'フォーカス（キーボード）', note: '隣の番号（4）', preview: 'focus' },
  { label: '前へ・次へに文字', note: '幅 36rem・120 / 240 ページ' },
];

const target = '[data-kind="page"][aria-label="4 ページ目"]';

const meta = {
  title: 'Design Review/161 Pagination の番号の形',
  id: 'design-review-161-pagination-shape',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      hover: [`[data-preview="hover"] ${target}`, `[data-preview="active"] ${target}`],
      active: [`[data-preview="active"] ${target}`],
      focusVisible: [`[data-preview="focus"] ${target}`],
    },
  },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={161}
      axis="Pagination の番号の形"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) =>
        column.label === '前へ・次へに文字' ? (
          <div className="w-[36rem]">
            <Pagination page={120} count={240} href={href} align="start" />
          </div>
        ) : (
          <div className="w-[28rem]">
            <Pagination page={5} count={10} href={href} align="start" />
          </div>
        )
      }
    >
      <p>
        ページ番号と前へ・次への形を選びます。高さと幅の下限は、どの案でも部品の高さ（指で押せる大きさ）です。いまのページの印は、軸
        160 の現行版（グレーの塗りと太字）で固定しています。
      </p>
      <p>
        置いた場所が 32rem
        より広いと、前へ・次へに文字が付き、横に長い形になります（右端の列）。形の違いは、いまのページの塗りと、hover・押下の敷きの形に出ます。
      </p>
      <p>実際にマウスを載せて、Tab でも動かして確かめられます。</p>
    </Comparison>
  ),
};
