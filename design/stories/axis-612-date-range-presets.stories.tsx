import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { LiveRange, presets, scrollable } from './date-range-axis-parts';
import type { DateRangePickerPresetsPlacement } from '../../src/components/date-range-picker/DateRangePicker';

// 軸 612: DateRangePicker の期間の候補（「過去 7 日」など）の置き場所（浮かべるとき。シートではいつも下の行）
const meta = {
  title: 'Design Review/612 期間の候補の置き場',
  id: 'design-review-612-date-range-presets',
  parameters: { layout: 'fullscreen' },
  decorators: [scrollable],
  args: { pick: 'current,A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'current,A'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

type Placement = Candidate & { placement: DateRangePickerPresetsPlacement };

const candidates: Placement[] = [
  {
    id: '現行版',
    name: 'カレンダーの左の列',
    intent:
      '候補を左に縦に積み、カレンダーとのあいだに細い線を引く。候補は下線だけの軽いボタン（並びに埋もれてよい操作 — 原則7）。候補が多くても縦に伸びるだけで、面の高さに収まる',
    spec: [
      ['presetsPlacement', "'start'"],
      ['候補の見た目', '下線だけのボタン（sm）'],
      ['面の幅', 'カレンダー＋候補の列（約 800px）'],
    ],
    placement: 'start',
  },
  {
    id: 'A',
    name: 'カレンダーの下の行',
    intent:
      '候補をカレンダーの下に、枠線の小さいボタンで折り返して並べる。面の幅はカレンダーのまま。シートの並びと同じになる',
    spec: [
      ['presetsPlacement', "'bottom'"],
      ['候補の見た目', '枠線のボタン（sm）'],
      ['面の幅', 'カレンダーのまま（約 680px）'],
    ],
    placement: 'bottom',
  },
];

const columns: Column[] = [
  {
    label: '面（操作できる）',
    note: '「過去 7 日」を選んだところ。候補を押すと欄の値が変わる（本物の面では、押すと閉じる）',
  },
];

export const Candidates: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={612}
      axis="期間の候補（過去 7 日など）の置き場所"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(_column, candidate) => (
        <LiveRange
          defaultValue={presets[1]?.value ?? null}
          presets={presets}
          presetsPlacement={(candidate as Placement).placement}
        />
      )}
    >
      <p>
        <strong>
          決定: 既定は現行版（カレンダーの左の列）。A（下の行）も presetsPlacement で選べる
        </strong>
      </p>
      <p>
        DateRangePicker
        に渡す期間の候補（presets）を、面のどこに並べるかを選びます。指で操作していて画面が狭いときのシートでは、どの案でもカレンダーの下に並べます。
      </p>
      <p>
        欄の下の面は、本物の面の中身をそのまま置いたものです。候補や日を押すと欄の値も変わります。いま選んでいる候補に印は付けていません（カレンダーの帯で分かるため）。印が要るかも、あわせて教えてください。
      </p>
    </Comparison>
  ),
};
