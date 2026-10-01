import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Table, TableBody, TableCell, TableFoot, TableHead, TableHeader, TableRow } from './Table';
import { Code } from '../code/Code';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';

const rows = [
  ['ボタン', 'Button', '44px'],
  ['入力欄', 'TextField', '44px'],
  ['大きい指用', 'coarse-large', '52px'],
];

const Sample = (props: Parameters<typeof Table>[0]) => (
  <Table {...props}>
    <TableHead>
      <TableRow>
        <TableHeader>部品</TableHeader>
        <TableHeader>中の名前</TableHeader>
        <TableHeader align="end">高さ</TableHeader>
      </TableRow>
    </TableHead>
    <TableBody>
      {rows.map(([name, code, height]) => (
        <TableRow key={name}>
          <TableCell>{name}</TableCell>
          <TableCell>
            <Code>{code}</Code>
          </TableCell>
          <TableCell align="end">{height}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const meta = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '表です。Markdown（GFM）を変換した HTML と同じ要素（`table`・`thead`・`tbody`・`tr`・`th`・`td`）と、列の寄せの `align` を出します。',
          '',
          '- `variant` は見た目です。`lines`（既定）は行のあいだの横線、`framed` は外枠と見出しのグレーの面、`banded` は見出しの行を丸い帯にした形です。',
          '- `showColumnDivider` で列のあいだに縦線を引きます（既定はなし）。',
          '- `size="sm"` はセルの上下の余白を詰め、一度に多くの行を見せます。文字の大きさは変えません。文字を小さくするときは `textSize="sm"` を別に渡します。',
          '- `showStripes` で本文の行を 1 行おきに塗ります。`hideRowDivider` を合わせると、行のあいだの線を消して面だけで行を分けます。',
          '- 合計の行は `TableFoot` に入れます。上に濃い線を引いて太字にします。`variant` で `filled`（グレーの面）・`double`（二重線）にもできます。行の頭の「合計」は `TableHeader`（`scope="row"`）にします。',
          '- 列の寄せは `align`（`start`・`center`・`end`）です。数字の列は `end` にし、見出しのセルと本文のセルで同じ値をそろえて渡します。',
          '- セルの縦の寄せは `verticalAlign`（`top`（既定）・`middle`・`bottom`）です。`Table`・`TableRow`・`TableCell` のどこにでも書け、内側の指定が勝ちます。',
          '- 文字はパソコンで 16px、スマホで 14px です。記事の中でも、スマホでは 14px になります。',
          '- 本文の幅より広いときは、表だけが横にスクロールします。スクロールできるときは、Tab で表に移り、矢印キーで横に動かせます。名前は `caption` か `accessibleName` で付けます。',
        ].join('\n'),
      },
    },
  },
  args: { variant: 'lines', showColumnDivider: false, accessibleName: '部品の高さ' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['lines', 'framed', 'banded'] },
    showColumnDivider: { control: 'boolean' },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
    textSize: { control: 'inline-radio', options: ['md', 'sm'] },
    showStripes: { control: 'boolean' },
    hideRowDivider: { control: 'boolean' },
    caption: { control: 'text' },
  },
  render: (args) => (
    <div data-reading className="max-w-xl">
      <Sample {...args} />
    </div>
  ),
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Variants: Story = {
  tags: ['visual'],
  name: '見た目と縦線',
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="22rem">
      {(['lines', 'framed', 'banded'] as const).map((variant) => (
        <Specimen key={variant} label={variant}>
          <div className="flex flex-col gap-4">
            <Sample variant={variant} />
            <Sample variant={variant} showColumnDivider />
          </div>
        </Specimen>
      ))}
    </Gallery>
  ),
};

const items = [
  { name: 'ノート A5', count: 3, price: 480 },
  { name: 'ボールペン 0.5', count: 5, price: 150 },
  { name: 'マスキングテープ', count: 2, price: 320 },
];
const yen = (value: number) => `${value.toLocaleString('ja-JP')} 円`;
const subtotal = items.reduce((sum, item) => sum + item.count * item.price, 0);
const tax = Math.round(subtotal * 0.1);

const Estimate = ({
  footVariant,
  full = false,
  ...props
}: Parameters<typeof Table>[0] & {
  footVariant?: Parameters<typeof TableFoot>[0]['variant'];
  full?: boolean;
}) => (
  <Table accessibleName="見積もり" {...props}>
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
    <TableFoot variant={footVariant}>
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
);

export const Foot: Story = {
  tags: ['visual'],
  name: '合計の行',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`TableFoot` の `variant` は `line`（既定。上に濃い線）・`filled`（グレーの面）・`double`（上に二重線）です。合計が複数の行のとき、2 行目からは本文と同じ細い線です。',
      },
    },
  },
  render: () => (
    <Gallery columnWidth="22rem">
      {(['line', 'filled', 'double'] as const).map((variant) => (
        <Specimen key={variant} label={variant}>
          <div className="flex flex-col gap-4">
            <Estimate footVariant={variant} />
            <Estimate footVariant={variant} variant="framed" full />
          </div>
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const SizesAndStripes: Story = {
  tags: ['visual'],
  name: '詰めた余白・小さい文字・縞',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`size="sm"` は上下の余白だけを詰めます。文字の大きさは `textSize` で別に選びます。縞（`showStripes`）は行のあいだの線を残し、`hideRowDivider` を合わせると面だけで行を分けます。',
      },
    },
  },
  render: () => (
    <Gallery columnWidth="22rem">
      <Specimen label='size="sm"'>
        <Sample size="sm" />
      </Specimen>
      <Specimen label='size="sm"・textSize="sm"'>
        <Sample size="sm" textSize="sm" />
      </Specimen>
      <Specimen label="showStripes">
        <Sample showStripes />
      </Specimen>
      <Specimen label="showStripes・hideRowDivider">
        <Sample showStripes hideRowDivider />
      </Specimen>
    </Gallery>
  ),
};

export const VerticalAligns: Story = {
  tags: ['visual'],
  name: 'セルの縦の寄せ',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`verticalAlign` は `Table`・`TableRow`・`TableCell` のどこにでも書けます。内側の指定が外側より勝ちます（ここでは 3 行目のセルだけ `bottom` にしています）。',
      },
    },
  },
  render: () => (
    <Gallery columnWidth="22rem">
      {(['top', 'middle', 'bottom'] as const).map((verticalAlign) => (
        <Specimen key={verticalAlign} label={verticalAlign}>
          <Table verticalAlign={verticalAlign} variant="framed">
            <TableHead>
              <TableRow>
                <TableHeader>部品</TableHeader>
                <TableHeader>説明</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>ボタン</TableCell>
                <TableCell>
                  押すと進む部品です。文字の長さによっては、セルの中で 2 行になります。
                </TableCell>
              </TableRow>
              <TableRow verticalAlign="middle">
                <TableCell>入力欄</TableCell>
                <TableCell>
                  行で middle にした行です。文字が折り返しても、左のセルは中央にそろいます。
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell verticalAlign="bottom">目次</TableCell>
                <TableCell>
                  セルで bottom にしたセルです。表と行の指定より、セルの指定が勝ちます。
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度とはみ出し',
  parameters: { controls: { disable: true } },
  render: () => (
    <DensityPair>
      <div data-reading className="flex w-[20rem] flex-col gap-4">
        <Sample variant="framed" caption="表 1. 部品の高さ" />
        <Table accessibleName="横に長い表">
          <TableHead>
            <TableRow>
              {['日付', 'タイトル', 'カテゴリ', '文字数', '閲覧数', 'いいね', '状態'].map(
                (label) => (
                  <TableHeader key={label}>{label}</TableHeader>
                )
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {[
                '2026-09-17',
                'ポートフォリオを作り直しました',
                'Design',
                '3200',
                '1204',
                '48',
                '公開中',
              ].map((value) => (
                <TableCell key={value}>{value}</TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </DensityPair>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  play: async ({ canvas }) => {
    const table = canvas.getByRole('table', { name: '部品の高さ' });
    await expect(table).toBeInTheDocument();
    await expect(canvas.getAllByRole('columnheader')).toHaveLength(3);
  },
};
