import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  Table,
  TableBody,
  TableCell,
  TableFoot,
  TableHead,
  TableHeader,
  TableRow,
  type TableVariant,
} from '../../src/components/table/Table';

// 軸 421: Table の合計の行（TableFoot）の見た目
const meta = {
  title: 'Design Review/421 表の合計の行',
  id: 'design-review-421-table-foot',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '見た目なし',
    intent:
      'tfoot を置いても本文の行と同じ。本文の最後の行とのあいだに線もなく、合計が本文に紛れる',
    spec: [
      ['上の線', 'なし'],
      ['文字', 'ふつう'],
      ['面', 'なし'],
    ],
    tokens: {
      '--table-foot-line-width': '0px',
      '--table-foot-line-style': 'solid',
      '--table-foot-line-color': 'var(--color-line)',
      '--table-foot-weight': '400',
      '--table-foot-bg': 'transparent',
    },
  },
  {
    id: 'A',
    name: '細い線＋太字',
    intent:
      '本文の行のあいだと同じ細い線を上に引き、文字を太くする。見出しの行（太字・下に線）と上下で対になる',
    spec: [
      ['上の線', '細い線（1px・罫線の色）'],
      ['文字', '太字'],
      ['面', 'なし'],
    ],
    tokens: {
      '--table-foot-line-width': 'var(--border-width-thin)',
      '--table-foot-line-style': 'solid',
      '--table-foot-line-color': 'var(--color-line)',
      '--table-foot-weight': '700',
      '--table-foot-bg': 'transparent',
    },
  },
  {
    id: 'B',
    name: '濃い線＋太字',
    intent: '本文の行のあいだより濃く太い線で区切る。本文が長くても、合計の始まりが目に留まる',
    spec: [
      ['上の線', '1.5px・濃い輪郭の色'],
      ['文字', '太字'],
      ['面', 'なし'],
    ],
    tokens: {
      '--table-foot-line-width': 'var(--border-width-medium)',
      '--table-foot-line-style': 'solid',
      '--table-foot-line-color': 'var(--color-line-strong)',
      '--table-foot-weight': '700',
      '--table-foot-bg': 'transparent',
    },
  },
  {
    id: 'C',
    name: '面＋太字',
    intent:
      '線を引かず、見出しの面（framed）と同じグレーの面を敷く。framed の表では上下が同じ面で挟まる',
    spec: [
      ['上の線', 'なし'],
      ['文字', '太字'],
      ['面', '入力欄のグレー'],
    ],
    tokens: {
      '--table-foot-line-width': '0px',
      '--table-foot-line-style': 'solid',
      '--table-foot-line-color': 'var(--color-line)',
      '--table-foot-weight': '700',
      '--table-foot-bg': 'var(--color-field)',
    },
  },
  {
    id: 'D',
    name: '二重線＋太字',
    intent:
      '帳簿の慣習（合計の上に二重線）に寄せる。見積もりや明細の表らしくなるが、ほかの部品にない線の形',
    spec: [
      ['上の線', '二重線（3px・濃い輪郭の色）'],
      ['文字', '太字'],
      ['面', 'なし'],
    ],
    tokens: {
      '--table-foot-line-width': '3px',
      '--table-foot-line-style': 'double',
      '--table-foot-line-color': 'var(--color-line-strong)',
      '--table-foot-weight': '700',
      '--table-foot-bg': 'transparent',
    },
  },
];

const columns: Column[] = [
  { label: 'lines（既定）', note: '合計が 1 行' },
  { label: 'framed', note: '外枠と見出しの面' },
  { label: 'banded', note: '見出しの丸い帯' },
  { label: 'lines・合計が 3 行', note: '小計・消費税・合計' },
];

const items = [
  { name: 'ノート A5', count: 3, price: 480 },
  { name: 'ボールペン 0.5', count: 5, price: 150 },
  { name: 'マスキングテープ', count: 2, price: 320 },
];
const yen = (value: number) => `${value.toLocaleString('ja-JP')} 円`;
const subtotal = items.reduce((sum, item) => sum + item.count * item.price, 0);
const tax = Math.round(subtotal * 0.1);

function Estimate({ variant, full = false }: { variant: TableVariant; full?: boolean }) {
  return (
    <div className="w-[340px]">
      <Table variant={variant} accessibleName="見積もり">
        <TableHead>
          <TableRow>
            <TableHeader>品目</TableHeader>
            <TableHeader align="end">数</TableHeader>
            <TableHeader align="end">金額</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.name}>
              <TableCell>{item.name}</TableCell>
              <TableCell align="end">{item.count}</TableCell>
              <TableCell align="end">{yen(item.count * item.price)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFoot>
          {full && (
            <>
              <TableRow>
                <TableHeader scope="row">小計</TableHeader>
                <TableCell />
                <TableCell align="end">{yen(subtotal)}</TableCell>
              </TableRow>
              <TableRow>
                <TableHeader scope="row">消費税</TableHeader>
                <TableCell />
                <TableCell align="end">{yen(tax)}</TableCell>
              </TableRow>
            </>
          )}
          <TableRow>
            <TableHeader scope="row">合計</TableHeader>
            <TableCell align="end">{items.reduce((sum, item) => sum + item.count, 0)}</TableCell>
            <TableCell align="end">{yen(full ? subtotal + tax : subtotal)}</TableCell>
          </TableRow>
        </TableFoot>
      </Table>
    </div>
  );
}

function Cell({ column }: { column: Column }) {
  if (column.label.startsWith('framed')) return <Estimate variant="framed" />;
  if (column.label.startsWith('banded')) return <Estimate variant="banded" />;
  if (column.label.includes('3 行')) return <Estimate variant="lines" full />;
  return <Estimate variant="lines" />;
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={421}
      axis="表の合計の行"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <Cell column={column} />}
    >
      <p>
        Table に
        TableFoot（tfoot）を足しました。見積もり・明細の表で、本文の下に合計の行を置きます。行の頭の「合計」は
        TableHeader（scope="row"）です。
      </p>
      <p>
        選ぶのは、合計の行の上の区切りと、文字の太さです。合計が複数の行のとき、2
        行目からは本文と同じ細い線です。Prose（Markdown
        の記事）の表にも同じ見た目が当たります（Markdown に tfoot はないので、素の HTML
        で書いたときだけです）。
      </p>
    </Comparison>
  ),
};
