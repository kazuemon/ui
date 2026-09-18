import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { CheckItems, MenuSample, RadioItems } from './menu-samples';
import type { MenuColor, MenuMarkPlacement, MenuRadioMark } from '../../src/components/menu/Menu';
import { MenuSeparator } from '../../src/components/menu/MenuItem';

// 後半の軸 121: Menu のチェックとラジオの印
// 決定（ADR 未定）: 印の場所は前を既定に、後ろ（右端）も選べる（Menu の markPlacement）
// 決定（ADR 未定）: ラジオの印は A（ラジオと同じ丸）を既定に、現行版の点とチェック（面・太字なし）も選べる（Menu の radioMark）
// 行ごとに radioMark を props で変える。B・C の面と太字は採らなかったので、マスのクラスで描く

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '点',
    intent:
      '選んだ項目にだけ小さな点を出す。チェックとは形が違うので、入・切ではないことは分かるが、選んでいない項目には何もないので「いくつかから 1 つ」とは読みにくい。',
    spec: [
      ['印', '選んだ項目に小さな点'],
      ['選んでいない項目', '何もなし'],
      ['文字', 'そのまま'],
    ],
  },
  {
    id: 'A',
    name: 'ラジオと同じ丸',
    intent:
      'ラジオ（Radio）を小さくした形。どの項目にもグレーの丸を置き、選んだ丸だけを部品の色の塗りに白い点にする。丸が並ぶので、ひとつだけを選ぶことがラジオと同じ形で読める。印のない項目との差は大きい。',
    spec: [
      ['印', '部品の色の丸に白い点'],
      ['選んでいない項目', 'グレーの丸'],
      ['文字', 'そのまま'],
    ],
  },
  {
    id: 'B',
    name: 'Select と同じ（淡い面・チェック・太字）',
    intent:
      'ラジオのまとまりだけを Select の選んだ項目と同じ見た目にする。選んだ行に部品の色の淡い面を敷き、チェックと太字。行ごと塗るので、ひとつだけ選んでいることがまとまりの中で目立つ。チェックの項目（面なし）とは面の有無で見分ける。',
    spec: [
      ['印', 'チェック（面の上の濃い色）'],
      ['選んでいない項目', '何もなし'],
      ['文字', '太字・面の上の濃い色'],
      ['行', '部品の色の淡い面'],
    ],
  },
  {
    id: 'C',
    name: '点と太字',
    intent:
      '現行版の点に、選んだ項目の文字の太字を足す。印は小さいままで、どれを選んでいるかは文字でも読める。面は敷かないので、メニューの静けさは保つ。',
    spec: [
      ['印', '選んだ項目に小さな点'],
      ['選んでいない項目', '何もなし'],
      ['文字', '選んだ項目だけ太字'],
    ],
  },
];

// 行ごとの印（radioMark）と、採らなかった見た目（B の淡い面・太字、C の太字）を描くマスのクラス
const BOLD = '[&_[role=menuitemradio][data-checked]]:font-bold';
const FACE: Record<MenuColor, string> = {
  neutral:
    '[&_[role=menuitemradio][data-checked]]:[--menu-item-bg:var(--color-select-neutral-selected)]',
  primary:
    '[&_[role=menuitemradio][data-checked]]:[--menu-item-bg:var(--color-primary-subtle)] [&_[role=menuitemradio][data-checked]]:text-on-primary-subtle [&_[role=menuitemradio][data-checked]_[aria-hidden]]:text-on-primary-subtle',
  secondary: '',
};
const ROWS: Record<string, { mark: MenuRadioMark; className?: (color: MenuColor) => string }> = {
  現行版: { mark: 'dot' },
  A: { mark: 'radio' },
  B: { mark: 'check', className: (color) => `${FACE[color]} ${BOLD}` },
  C: { mark: 'dot', className: () => BOLD },
};

const CELLS: Record<string, { placement: MenuMarkPlacement; color: MenuColor; hover?: boolean }> = {
  '前・グレー': { placement: 'start', color: 'neutral' },
  '前・Primary・hover': { placement: 'start', color: 'primary', hover: true },
  '後ろ・グレー': { placement: 'end', color: 'neutral' },
  '後ろ・Primary・hover': { placement: 'end', color: 'primary', hover: true },
};

const columns: Column[] = [
  { label: '前・グレー', note: '既定の場所と色。行番号が入、更新日を選んだところ' },
  { label: '前・Primary・hover', note: 'color="primary"。選んだ更新日に hover' },
  { label: '後ろ・グレー', note: 'markPlacement="end"' },
  { label: '後ろ・Primary・hover', note: 'markPlacement="end"・color="primary"' },
];

const meta = {
  title: 'Design Review/121 Menu のチェックとラジオの印',
  id: 'design-review-121-menu-marks',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A,current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={121}
      axis="Menu のラジオの印（2 巡目）"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const cell = CELLS[column.label];
        const row = ROWS[candidate.id];
        return (
          <MenuSample
            height={400}
            color={cell.color}
            markPlacement={cell.placement}
            radioMark={row.mark}
            className={row.className?.(cell.color)}
          >
            <CheckItems />
            <MenuSeparator />
            <RadioItems hover={cell.hover} />
          </MenuSample>
        );
      }}
    >
      <p>
        <strong>
          決定（ADR 未定）: ラジオの印は
          A（ラジオと同じ丸）を既定にし、現行版の点と、チェックも選べるようにします（Menu の
          radioMark）。チェックは B
          から淡い面と太字を除いた形で、チェックの項目と同じ印だけを出します。
        </strong>
      </p>
      <p>
        <strong>
          決定（ADR 未定）: 印の場所は前を既定にし、後ろ（右端）も選べるようにします（Menu の
          markPlacement）。チェックの印はチェックのままです。
        </strong>
      </p>
      <p>
        2 巡目では、1
        つだけを選ぶ項目（ラジオ）の印を決めます。メニューには箱がないので、「いくつかのうちの 1
        つ」を何で表すかを比べます。上にチェックの項目を並べ、ラジオとの見分けも見られるようにしています。
      </p>
      <p>
        A はラジオの丸をそのまま小さくした形で、選んでいない項目にも丸が出ます。B は Select
        の選んだ項目と同じ見た目で、ラジオのまとまりだけ行に淡い面を敷きます。C
        は現行版の点に太字を足します。
      </p>
    </Comparison>
  ),
};
