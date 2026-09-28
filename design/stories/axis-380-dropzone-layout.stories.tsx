import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Dropzone } from '../../src/components/dropzone/Dropzone';

// 決定済み（縦に積む）。横1行にする案は採らず、切り替えのトークンは部品の決まった値に畳んだので、
// ここは比較ではなく、決めた見た目の記録として残す
const candidates: Candidate[] = [
  {
    id: 'current',
    name: '縦に積む',
    intent: 'アイコン・案内の文・「ファイルを選択」の見た目のボタンを縦に積み、中央にそろえる',
    spec: [
      ['direction', 'column'],
      ['icon-size', '32px'],
      ['padding', '32px'],
      ['min-height', '160px'],
    ],
  },
];

const columns: Column[] = [{ label: '通常' }, { label: '幅を詰めたところ' }];

const meta = {
  title: 'Design Review/380 中身の並べ方',
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Compare: Story = {
  render: () => (
    <Comparison
      index={380}
      axis="箱の中身の並べ方"
      pick="current"
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <div className={column.label === '幅を詰めたところ' ? 'w-56' : 'w-80'}>
          <Dropzone label="画像" caption="JPEG・PNG、1 つ 5MB まで" />
        </div>
      )}
    >
      <p>
        決定: 縦に積む形のままにします。アイコン・文・ボタンを横1列に収める案（表の1行や、控えめに
        置きたい場所向け）は採りませんでした。比べるためだけに足していた切り替えのトークン
        （`--dropzone-content-direction` など）は、部品の決まった値に畳みました。
      </p>
    </Comparison>
  ),
};
