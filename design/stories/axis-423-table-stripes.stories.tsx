import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type TableVariant,
} from '../../src/components/table/Table';

// 軸 423: Table の縞（showStripes）
const meta = {
  title: 'Design Review/423 表の縞',
  id: 'design-review-423-table-stripes',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A,B' },
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

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '縞なし',
    intent: 'showStripes を渡しても変わらない。比べるための基準',
    spec: [
      ['偶数行の面', 'なし'],
      ['行のあいだの線', '細い線のまま'],
    ],
    tokens: {
      '--table-stripe-bg': 'transparent',
      '--table-stripe-line-width': 'var(--border-width-thin)',
    },
  },
  {
    id: 'A',
    name: '縞＋線',
    intent: '偶数行に入力欄のグレーを敷き、行のあいだの線も残す。線と面の両方で行を分ける',
    spec: [
      ['偶数行の面', '入力欄のグレー'],
      ['行のあいだの線', '細い線のまま'],
    ],
    tokens: {
      '--table-stripe-bg': 'var(--color-field)',
      '--table-stripe-line-width': 'var(--border-width-thin)',
    },
  },
  {
    id: 'B',
    name: '縞だけ（線を消す）',
    intent:
      '縞が行を分けるので、行のあいだの線を消す。見出しの下の線・外枠・縦線は残す。線が減って静かになる',
    spec: [
      ['偶数行の面', '入力欄のグレー'],
      ['行のあいだの線', 'なし'],
    ],
    tokens: {
      '--table-stripe-bg': 'var(--color-field)',
      '--table-stripe-line-width': '0px',
    },
  },
  {
    id: 'C',
    name: '淡い縞だけ',
    intent:
      'B の面を半分の濃さにする。長い表で縞が目にうるさくならない。明るい画面では見えにくくなる',
    spec: [
      ['偶数行の面', '入力欄のグレーを半分'],
      ['行のあいだの線', 'なし'],
    ],
    tokens: {
      '--table-stripe-bg': 'color-mix(in oklab, var(--color-field) 50%, transparent)',
      '--table-stripe-line-width': '0px',
    },
  },
];

const columns: Column[] = [
  { label: 'lines（既定）' },
  { label: 'framed' },
  { label: 'banded' },
  { label: 'lines・縦線あり', note: 'showColumnDivider' },
];

const rows = [
  { name: '森の文具店', city: '札幌', orders: 128, rate: '4.2%' },
  { name: 'ひだまり雑貨', city: '仙台', orders: 64, rate: '3.1%' },
  { name: '港町ベーカリー', city: '神戸', orders: 212, rate: '6.8%' },
  { name: 'そらいろ書房', city: '福岡', orders: 37, rate: '1.9%' },
  { name: 'あさがお花店', city: '金沢', orders: 91, rate: '2.7%' },
  { name: 'こもれび珈琲', city: '松本', orders: 150, rate: '5.5%' },
];

function Shops({ variant, divider = false }: { variant: TableVariant; divider?: boolean }) {
  return (
    <div className="w-[360px]">
      <Table variant={variant} showStripes showColumnDivider={divider} accessibleName="お店">
        <TableHead>
          <TableRow>
            <TableHeader>お店</TableHeader>
            <TableHeader>地域</TableHeader>
            <TableHeader align="end">注文</TableHeader>
            <TableHeader align="end">返品率</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.city}</TableCell>
              <TableCell align="end">{row.orders}</TableCell>
              <TableCell align="end">{row.rate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Cell({ column }: { column: Column }) {
  if (column.label.startsWith('framed')) return <Shops variant="framed" />;
  if (column.label.startsWith('banded')) return <Shops variant="banded" />;
  if (column.label.includes('縦線')) return <Shops variant="lines" divider />;
  return <Shops variant="lines" />;
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={423}
      axis="表の縞"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <Cell column={column} />}
    >
      <p>
        決定: 縞は
        A（縞＋行の線）を既定にし、B（縞だけ・行の線なし）も選べる。ユーザーの返事「縞のバリエーションは
        A or B で良さそうです。デフォルトは A
        ですかね。」候補の見た目は、トークンを畳む前のこのコミットで比べられます。
      </p>
      <p>
        Table に showStripes（既定は false）を足しました。列の多い横に長い表で、1
        行おきに面を敷いて、行を目で追いやすくします。どの見た目（variant）にも重ねられます。
      </p>
      <p>選ぶのは、縞の濃さと、縞のときに行のあいだの線を残すかです。</p>
    </Comparison>
  ),
};
