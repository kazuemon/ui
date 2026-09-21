import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { DateField } from '../components/date-field/DateField';
import { MaskField } from '../components/mask-field/MaskField';
import { NumberField } from '../components/number-field/NumberField';
import { PasswordField } from '../components/password-field/PasswordField';
import { PinField } from '../components/pin-field/PinField';
import { SearchField } from '../components/search-field/SearchField';
import { Select } from '../components/select/Select';
import { TextField } from '../components/text-field/TextField';
import { TimeField } from '../components/time-field/TimeField';
import { Temporal } from '../internal/date/plain-date';
import { DensityPair, Matrix } from './story-parts';
import { type MatrixColumn, statePseudo } from './story-states';

// 文字を打つ欄をまとめて並べる一覧。欄どうしで、高さ・塗り・枠線・文字の大きさ・状態の見え方がそろっているかを見比べる
// 各欄の細かい状態は、それぞれの部品のストーリーにある

/** 一覧の 1 行。状態ごとに渡す props を変えて描く */
interface FieldRow {
  name: string;
  render: (state: RowState) => ReactNode;
}

interface RowState {
  label: string;
  filled: boolean;
  errorText?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

type StateColumn = MatrixColumn & { values: Omit<RowState, 'label'> };

const columns: StateColumn[] = [
  { label: '空', values: { filled: false } },
  { label: '値あり', values: { filled: true } },
  { label: 'hover', state: 'hover', values: { filled: true } },
  { label: 'フォーカス', state: 'focus', values: { filled: true } },
  { label: 'エラー', values: { filled: true, errorText: '確かめてください' } },
  { label: '押せない', values: { filled: true, disabled: true } },
  { label: '読み取り専用', values: { filled: true, readOnly: true } },
];

const wards = [
  { label: '渋谷区', value: 'shibuya' },
  { label: '新宿区', value: 'shinjuku' },
];

const rows: FieldRow[] = [
  {
    name: 'TextField',
    render: ({ filled, ...s }) => (
      <TextField
        {...s}
        defaultValue={filled ? 'かずえもん' : undefined}
        placeholder="例: かずえもん"
      />
    ),
  },
  {
    name: 'SearchField',
    render: ({ filled, ...s }) => (
      <SearchField {...s} defaultValue={filled ? 'ボタン' : undefined} placeholder="例: ボタン" />
    ),
  },
  {
    name: 'PasswordField',
    render: ({ filled, ...s }) => (
      <PasswordField {...s} defaultValue={filled ? 'kazuemon-2026' : undefined} />
    ),
  },
  {
    name: 'MaskField',
    render: ({ filled, ...s }) => (
      <MaskField {...s} mask="###-####" defaultValue={filled ? '1500042' : undefined} />
    ),
  },
  {
    name: 'Select',
    render: ({ filled, ...s }) => (
      <Select
        {...s}
        items={wards}
        defaultValue={filled ? 'shibuya' : undefined}
        placeholder="選んでください"
      />
    ),
  },
  {
    name: 'NumberField',
    render: ({ filled, ...s }) => (
      <NumberField {...s} locale="ja-JP" suffix="円" defaultValue={filled ? 1200 : undefined} />
    ),
  },
  {
    name: 'DateField',
    render: ({ filled, ...s }) => (
      <DateField
        {...s}
        locale="ja-JP"
        defaultValue={filled ? Temporal.PlainDate.from('2026-09-20') : undefined}
      />
    ),
  },
  {
    name: 'TimeField',
    render: ({ filled, ...s }) => (
      <TimeField
        {...s}
        locale="ja-JP"
        defaultValue={filled ? Temporal.PlainTime.from('15:05') : undefined}
      />
    ),
  },
  {
    name: 'PinField',
    render: ({ filled, ...s }) => <PinField {...s} defaultValue={filled ? '1234' : undefined} />,
  },
];

const meta = {
  title: 'Overview/入力欄の一覧',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '文字を打つ欄と選ぶ欄を、同じ状態で並べた一覧です。欄どうしで見た目がそろっているかを見比べます。',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** 欄ごとに、状態を横に並べる */
export const States: Story = {
  name: '状態',
  tags: ['visual'],
  parameters: {
    pseudo: statePseudo({ hover: '[data-slot="control"]', focusWithin: '[data-slot="control"]' }),
  },
  render: () => (
    <Matrix
      rows={rows}
      columns={columns}
      columnWidth="13rem"
      rowLabel={(row) => row.name}
      renderCell={(row, column) => row.render({ label: row.name, ...column.values })}
    />
  ),
};

/** 同じ幅で縦に積む。フォームに並べたときの高さと間を見る */
export const Stacked: Story = {
  name: 'フォームに並べる',
  tags: ['visual'],
  render: () => (
    <DensityPair>
      <div className="flex w-80 flex-col gap-6">
        {rows.map((row) => (
          <div key={row.name}>{row.render({ label: row.name, filled: true })}</div>
        ))}
      </div>
    </DensityPair>
  ),
};
