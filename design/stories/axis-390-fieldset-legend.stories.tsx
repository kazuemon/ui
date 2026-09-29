import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Checkbox } from '../../src/components/checkbox/Checkbox';
import { Fieldset } from '../../src/components/fieldset/Fieldset';
import { Radio, RadioGroup } from '../../src/components/radio/Radio';
import { Select } from '../../src/components/select/Select';
import { TextField } from '../../src/components/text-field/TextField';

// 軸 390: Fieldset の見出しの強さ。中の欄のラベル（14px の太字）との差をどう付けるか。囲み方は囲まない（軸 389 で比べる）
const meta = {
  title: 'Design Review/390 Fieldset の見出しの強さ',
  id: 'design-review-390-fieldset-legend',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
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
    name: '本文の太字',
    intent: '見出し 4 と同じ（本文の大きさの太字）。中の欄のラベルより一回り大きい',
    spec: [
      ['文字', '本文の大きさ・太字・本文の色'],
      ['指', '14px（本文と同じく下がる）'],
    ],
    tokens: {
      '--fieldset-legend-size': 'var(--text-body)',
      '--fieldset-legend-leading': 'var(--leading-body)',
      '--fieldset-legend-weight': '700',
      '--fieldset-legend-color': 'var(--color-fg)',
    },
  },
  {
    id: 'A',
    name: 'ラベルと同じ',
    intent: '中の欄のラベルと同じ文字。差は、見出しの下の間と、まとまりの外の間だけで付ける',
    spec: [['文字', 'ラベルと同じ（14px・太字）']],
    tokens: {
      '--fieldset-legend-size': 'var(--text-label)',
      '--fieldset-legend-leading': 'var(--leading-label)',
      '--fieldset-legend-weight': '700',
      '--fieldset-legend-color': 'var(--color-fg)',
    },
  },
  {
    id: 'B',
    name: '見出し 3',
    intent: '見出し 3 の大きさ。フォームの中の節として、はっきり区切る',
    spec: [['文字', '見出し 3（18px）・太字']],
    tokens: {
      '--fieldset-legend-size': 'var(--text-heading-3)',
      '--fieldset-legend-leading': 'var(--leading-heading-3)',
      '--fieldset-legend-weight': '700',
      '--fieldset-legend-color': 'var(--color-fg)',
    },
  },
  {
    id: 'C',
    name: '小さく淡い',
    intent:
      'キャプションの大きさの太字を、一段淡い色で。見出しは目印に下がり、中の欄のラベルが主役になる',
    spec: [['文字', 'キャプションの大きさ（12px）・太字・淡い色']],
    tokens: {
      '--fieldset-legend-size': 'var(--text-caption)',
      '--fieldset-legend-leading': 'var(--leading-caption)',
      '--fieldset-legend-weight': '700',
      '--fieldset-legend-color': 'var(--color-fg-muted)',
    },
  },
];

const columns: Column[] = [
  { label: '入力欄のまとまり', note: 'ヘルプテキストあり' },
  { label: '選択肢のまとまり', note: '中に RadioGroup と Checkbox' },
];

const prefectures = [
  { label: '東京都', value: 'tokyo' },
  { label: '大阪府', value: 'osaka' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={390}
      axis="Fieldset の見出しの強さ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <div className="w-[400px]">
          {column.label === '入力欄のまとまり' ? (
            <Fieldset label="住所" caption="請求書の送り先です">
              <TextField label="郵便番号" defaultValue="150-0001" />
              <Select label="都道府県" items={prefectures} defaultValue="tokyo" />
            </Fieldset>
          ) : (
            <Fieldset label="配送">
              <RadioGroup label="配送方法" defaultValue="normal">
                <Radio value="normal" label="通常配送" caption="3〜5 日" />
                <Radio value="express" label="お急ぎ便" caption="翌日" />
              </RadioGroup>
              <Checkbox label="置き配を使う" />
            </Fieldset>
          )}
        </div>
      )}
    >
      <p>
        まとまりの見出し（「住所」「配送」）と、中の欄のラベル（「郵便番号」「配送方法」）の差の付け方です。中に
        RadioGroup を置くと、見出しが 2 段になります。
      </p>
      <p>既定にする案と、ほかにも選べるようにする案があれば教えてください。</p>
    </Comparison>
  ),
};
