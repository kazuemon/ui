import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Combobox } from '../../src/components/combobox/Combobox';
import { DatePicker } from '../../src/components/date-picker/DatePicker';
import { Select } from '../../src/components/select/Select';
import { Temporal } from '../../src/internal/date/plain-date';
import { enabledControl } from '../../src/stories/story-states';

// 軸 522: Select の値を消すボタン（clearable）の場所と、hover・フォーカスの範囲（F21）
const control = (state: string) => `[data-preview="${state}"] ${enabledControl}`;
const clearButton = (state: string) =>
  `[data-preview="${state}"] [data-select-clear]:enabled, [data-preview="${state}"] [data-slot="combobox-clear"]:enabled`;

const meta = {
  title: 'Design Review/522 Select の値を消すボタン',
  id: 'design-review-522-select-clear',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      hover: [control('hover'), clearButton('button-hover')],
      focusWithin: [control('focus')],
      focusVisible: [clearButton('button-focus')],
    },
  },
  args: { pick: 'C' },
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

const clear = (atCaret: '0' | '1', hoverJoined: '0' | '1') => ({
  '--select-clear-at-caret': atCaret,
  '--select-clear-caret-gap': 'var(--spacing)',
  '--select-clear-hover-joined': hoverJoined,
});

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '消すボタンなし',
    intent:
      'いまの Select は、一度選ぶと空に戻せない（空の選択肢を足すしかない）。比べるための基準。下の行に Combobox（× は右端）と DatePicker（× は暦の左）を並べる',
    spec: [
      ['× の場所', 'なし'],
      ['× に hover', '—'],
    ],
    tokens: clear('0', '1'),
  },
  {
    id: 'A',
    name: '× は右端、▼ がずれる（Combobox と同じ）',
    intent:
      '値があるとき、グレー地の × を右端に出し、▼ が × の左へずれる。欄の幅は変わらない。▼ は飾りで、× 以外の欄全体が開く場所。× に hover しているあいだも、欄は hover の塗りのまま',
    spec: [
      ['× の場所', '右端（▼ が左へずれる）'],
      ['× に hover', '欄も hover の塗り'],
    ],
    tokens: clear('0', '1'),
  },
  {
    id: 'B',
    name: '× は ▼ の左、▼ は動かない（DatePicker と同じ）',
    intent:
      '値があるとき、× を ▼ の左に出し、▼ は右端から動かない。× の右にも開く場所（▼）が残る。▼ は押す場所ではなく飾りなので、Combobox では「▼ がずれてよい」とした',
    spec: [
      ['× の場所', '▼ の左（▼ は動かない）'],
      ['× に hover', '欄も hover の塗り'],
    ],
    tokens: clear('1', '1'),
  },
  {
    id: 'C',
    name: 'A の並びで、× に hover しても欄は変えない',
    intent:
      '並びは A と同じ。× に hover しているあいだは欄の塗りを通常に戻し、× だけが濃くなる。押すと開く場所（欄）と、押すと消える場所（×）の境目がはっきりする',
    spec: [
      ['× の場所', '右端（▼ が左へずれる）'],
      ['× に hover', '× だけ（欄は通常の塗り）'],
    ],
    tokens: clear('0', '0'),
  },
];

const columns: Column[] = [
  { label: '値なし', note: '× は出さない' },
  { label: '値あり' },
  { label: '欄に hover', preview: 'hover' },
  { label: '× に hover', preview: 'button-hover' },
  { label: '欄にフォーカス', preview: 'focus' },
  {
    label: '× にフォーカス',
    note: 'キーボード（欄の枠線を消し、× の線だけ）',
    preview: 'button-focus',
  },
  { label: '押せない', note: '× は押せない形で出す' },
  { label: 'Combobox・DatePicker', note: '参考（いまの部品）' },
];

const wards = ['千代田区', '中央区', '港区', '新宿区'];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={522}
      axis="Select の値を消すボタン"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const clearable = candidate.id !== '現行版';
        if (column.label === 'Combobox・DatePicker') {
          return (
            <div className="flex w-[240px] flex-col gap-3">
              <Combobox accessibleName="区（Combobox）" items={wards} defaultValue="港区" />
              <DatePicker
                accessibleName="日付（DatePicker）"
                clearable
                defaultValue={Temporal.PlainDate.from('2026-10-01')}
              />
            </div>
          );
        }
        return (
          <div className="w-[240px]">
            <Select
              label="区"
              items={wards}
              placeholder="選んでください"
              clearable={clearable}
              disabled={column.label === '押せない'}
              defaultValue={column.label === '値なし' ? undefined : '港区'}
            />
          </div>
        );
      }}
    >
      <p>
        決定: Select の clearable の × は右端に置き、▼ が × の左へずれる（Combobox と同じ並び）。×
        に hover しているあいだは欄の塗りを変えず、× だけを濃くする（C）。ユーザーの返事「C
        でよさそうです。」候補の見た目は、トークンを畳む前のこのコミットで比べられます。
      </p>
      <p>
        Select に clearable を足し、選んだ値を空に戻せるようにします。Select
        の本体はボタンなので、中に × のボタンを置けません。本体と × を包み、×
        を本体の上に重ねます。×
        は値があるときだけ出し、読み取り専用では出さず、押せない欄では押せない形で出します（Combobox
        と同じ）。押すと値を消し、フォーカスは本体に戻ります。
      </p>
      <p>
        選ぶのは、× の場所（Combobox のように右端に置いて ▼ をずらすか、DatePicker のように ▼
        の左に置くか）と、× に hover したときに欄の塗りも変えるかです。キーボードで ×
        にフォーカスしたときは、ほかの入力欄の suffix のボタンと同じく、欄の枠線を消して ×
        の線だけにします。
      </p>
    </Comparison>
  ),
};
