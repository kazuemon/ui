import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Fieldset } from '../../src/components/fieldset/Fieldset';
import { Radio, RadioGroup } from '../../src/components/radio/Radio';
import { Select } from '../../src/components/select/Select';
import { TextField } from '../../src/components/text-field/TextField';

// 軸 389: Fieldset（欄のまとまり）の囲み方。見出しは本文の大きさの太字（軸 390 で比べる）
const meta = {
  title: 'Design Review/389 Fieldset の囲み方',
  id: 'design-review-389-fieldset-frame',
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

const none = {
  '--fieldset-border-top': '0px',
  '--fieldset-border-side': '0px',
  '--fieldset-border-bottom': '0px',
  '--fieldset-pad-top': '0px',
  '--fieldset-pad-x': '0px',
  '--fieldset-pad-bottom': '0px',
  '--fieldset-radius': '0px',
  '--fieldset-rule-start': '0px',
  '--fieldset-indent': '0px',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '囲まない',
    intent: '見出しと間だけでまとめる。まとまりどうしは、中の欄より広い間で離す',
    spec: [
      ['線', 'なし'],
      ['中の欄', '字下げなし'],
    ],
    tokens: none,
  },
  {
    id: 'A',
    name: '上に線',
    intent:
      '見出しの上に細い境界線を引き、ここから新しいまとまりだと示す。設定の画面の節の区切りに近い',
    spec: [
      ['線', '上だけ・細い境界線'],
      ['線と見出し', '16px'],
    ],
    tokens: {
      ...none,
      '--fieldset-border-top': 'var(--border-width-thin)',
      '--fieldset-pad-top': 'var(--stack-gap-md)',
    },
  },
  {
    id: 'B',
    name: '枠で囲む',
    intent: 'カードのような薄いフチ（細い境界線・カードの角・影なし）で、見出しごと囲む',
    spec: [
      ['線', '四辺・細い境界線'],
      ['角', 'カードの角'],
      ['中の余白', '部品の左右の余白（16px）'],
    ],
    tokens: {
      ...none,
      '--fieldset-border-top': 'var(--border-width-thin)',
      '--fieldset-border-side': 'var(--border-width-thin)',
      '--fieldset-border-bottom': 'var(--border-width-thin)',
      '--fieldset-pad-top': 'var(--spacing-control-x)',
      '--fieldset-pad-x': 'var(--spacing-control-x)',
      '--fieldset-pad-bottom': 'var(--spacing-control-x)',
      '--fieldset-radius': 'var(--radius-card)',
    },
  },
  {
    id: 'C',
    name: '中の欄を縦線で字下げ',
    intent:
      '見出しは左端のまま、中の欄だけを左の縦線で字下げする。入れ子が深くなっても、どこまでがまとまりかが分かる',
    spec: [
      ['線', '中の欄の左・細い境界線'],
      ['線と欄', '16px'],
    ],
    tokens: {
      ...none,
      '--fieldset-rule-start': 'var(--border-width-thin)',
      '--fieldset-indent': 'var(--spacing-control-x)',
    },
  },
];

const columns: Column[] = [
  { label: '1 つのまとまり', note: '幅 400px' },
  { label: 'まとまりを 2 つ並べる', note: '中に RadioGroup・間は 40px' },
  { label: '押せない', note: 'disabled' },
];

const prefectures = [
  { label: '東京都', value: 'tokyo' },
  { label: '大阪府', value: 'osaka' },
];

function Address({ disabled }: { disabled?: boolean }) {
  return (
    <Fieldset label="住所" caption="請求書の送り先です" disabled={disabled}>
      <TextField label="郵便番号" defaultValue="150-0001" />
      <Select label="都道府県" items={prefectures} defaultValue="tokyo" />
      <TextField label="市区町村・番地" defaultValue="渋谷区神宮前 1-2-3" />
    </Fieldset>
  );
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={389}
      axis="Fieldset の囲み方"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <div className="w-[400px]">
          {column.label === '1 つのまとまり' && <Address />}
          {column.label === 'まとまりを 2 つ並べる' && (
            <div className="flex flex-col gap-(--stack-gap-xl)">
              <Address />
              <Fieldset label="配送">
                <RadioGroup label="配送方法" defaultValue="normal">
                  <Radio value="normal" label="通常配送" caption="3〜5 日" />
                  <Radio value="express" label="お急ぎ便" caption="翌日" />
                </RadioGroup>
              </Fieldset>
              <Button color="primary">注文を確かめる</Button>
            </div>
          )}
          {column.label === '押せない' && <Address disabled />}
        </div>
      )}
    >
      <p>
        住所・支払い方法のように、1
        つの問いにいくつもの欄で答えるまとまりです。見出しは本文の大きさの太字で、中の欄のラベルより一段強くしています（強さは軸
        390 で比べます）。
      </p>
      <p>
        まとまりが 2
        つ以上並んだとき、どこからどこまでが一組かが分かるか、中の欄との重さの釣り合いを見てください。既定にする案と、ほかにも選べるようにする案があれば教えてください。
      </p>
    </Comparison>
  ),
};
