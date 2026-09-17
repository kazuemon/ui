import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './Table';
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
        <TableHeader align="right">高さ</TableHeader>
      </TableRow>
    </TableHead>
    <TableBody>
      {rows.map(([name, code, height]) => (
        <TableRow key={name}>
          <TableCell>{name}</TableCell>
          <TableCell>
            <Code>{code}</Code>
          </TableCell>
          <TableCell align="right">{height}</TableCell>
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
          '- `appearance` は見た目です。`lines`（既定）は行のあいだの横線、`framed` は外枠と見出しのグレーの面、`banded` は見出しの行を丸い帯にした形です。',
          '- `columnLines` で列のあいだに縦線を引きます（既定はなし）。',
          '- 文字はパソコンで 16px、スマホで 14px です。記事の中でも、スマホでは 14px になります。',
          '- 本文の幅より広いときは、表だけが横にスクロールします。スクロールできるときは、Tab で表に移り、矢印キーで横に動かせます。名前は `caption` か `label` で付けます。',
        ].join('\n'),
      },
    },
  },
  args: { appearance: 'lines', columnLines: false, label: '部品の高さ' },
  argTypes: {
    appearance: { control: 'inline-radio', options: ['lines', 'framed', 'banded'] },
    columnLines: { control: 'boolean' },
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

export const Appearances: Story = {
  tags: ['visual'],
  name: '見た目と縦線',
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="22rem">
      {(['lines', 'framed', 'banded'] as const).map((appearance) => (
        <Specimen key={appearance} label={appearance}>
          <div className="flex flex-col gap-4">
            <Sample appearance={appearance} />
            <Sample appearance={appearance} columnLines />
          </div>
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
        <Sample appearance="framed" caption="表 1. 部品の高さ" />
        <Table label="横に長い表">
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
