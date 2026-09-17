import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Checkbox } from '../../src/components/checkbox/Checkbox';
import { CheckboxGroup } from '../../src/components/checkbox/CheckboxGroup';
import { Radio, RadioGroup } from '../../src/components/radio/Radio';
import { TextField } from '../../src/components/text-field/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 80: チェックボックスとラジオの、選択肢とエラー・警告の行のあいだ — design/adr/0101 で A に決定
// 変えるのは、選択肢の行の組み方（--choice-row-pad）と、エラー・警告の行を詰めるか（--choice-message-tighten）だけ
// 決まった後に tokens.css を更新しても同じ比較を再現できるよう、全案（現行版を含む）で軸の値を明示する

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '部品の高さの中央',
    intent:
      '行は部品の高さで、文字をその縦の中央に置く。エラーの行は上に入力欄と同じ間を持つので、文字の下の余りと足し合わさる。',
    spec: [
      ['行', '部品の高さ（文字は縦の中央）'],
      ['エラーの行の上', '余り＋入力欄と同じ間'],
    ],
    tokens: { '--choice-row-pad': '0', '--choice-message-tighten': '0' },
  },
  {
    id: 'A',
    name: '文字の上下に余白',
    intent:
      '行を「文字の上下に余り分の余白」で組み、エラーの行はその余白を引いて入力欄と同じ間にする。キャプションのある行は今より高くなる。',
    spec: [
      ['行', '文字の上下に余白（キャプション付きは高くなる）'],
      ['エラーの行の上', '入力欄と同じ間'],
    ],
    tokens: { '--choice-row-pad': '1', '--choice-message-tighten': '1' },
  },
  {
    id: 'B',
    name: '余りがあるときだけ詰める',
    intent:
      '行は現行版のまま。最後の行にキャプションがないときだけ、エラーの行を余りの分だけ上に詰める。文字が折り返して余りがなくなると、詰めすぎる。',
    spec: [
      ['行', '部品の高さ（現行版のまま）'],
      ['エラーの行の上', 'キャプションなし: 入力欄と同じ間 / あり: 現行版のまま'],
    ],
    tokens: { '--choice-row-pad': '0', '--choice-message-tighten': '1' },
  },
];

const columns: Column[] = [
  { label: '1つだけ', note: 'エラーと警告の両方' },
  { label: '1つだけ・キャプション付き' },
  { label: 'グループ', note: '最後の行にキャプションなし' },
  { label: 'グループ・最後にキャプション' },
  { label: '文字が折り返す', note: '1つだけ置いた箱' },
  { label: '入力欄（参考）', note: '本体とエラーの行のあいだ' },
];

const width = 'w-64';

const cells: Record<string, () => ReactNode> = {
  '1つだけ': () => (
    <div className={width}>
      <Checkbox
        label="利用規約に同意する"
        required
        error="利用規約に同意してください"
        warning="あとから取り消せます"
      />
    </div>
  ),
  '1つだけ・キャプション付き': () => (
    <div className={width}>
      <Checkbox
        label="利用規約に同意する"
        caption="規約は登録の前にお読みください"
        error="利用規約に同意してください"
      />
    </div>
  ),
  グループ: () => (
    <div className={width}>
      <CheckboxGroup label="受け取るお知らせ" error="1つ以上選んでください">
        <Checkbox value="mail" label="メール" />
        <Checkbox value="sms" label="SMS" />
        <Checkbox value="push" label="プッシュ通知" />
      </CheckboxGroup>
    </div>
  ),
  'グループ・最後にキャプション': () => (
    <div className={width}>
      <RadioGroup label="配送の時間" error="配送の時間を選んでください">
        <Radio value="am" label="午前" />
        <Radio value="pm" label="午後" caption="14 時から 18 時" />
      </RadioGroup>
    </div>
  ),
  文字が折り返す: () => (
    <div className="w-48">
      <Checkbox
        label="利用規約とプライバシーポリシーに同意する"
        error="利用規約に同意してください"
      />
    </div>
  ),
  '入力欄（参考）': () => (
    <div className={width}>
      <TextField label="お名前" error="お名前を入力してください" />
    </div>
  ),
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/80 選択肢とエラーの行のあいだ',
  id: 'design-review-80-choice-message-gap',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={80}
      axis="選択肢とエラーの行のあいだ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => cells[column.label]?.()}
    >
      <p>
        <strong className="text-fg">決定: A 文字の上下に余白</strong>
        （ADR-0101）。「ストーリーで比べたいです。」「Aで改修お願いします」
      </p>
      <p>
        チェックボックスとラジオで、選択肢の文字とエラー・警告の行のあいだを選びます。現行版では、行の高さ（部品の高さ）の中で文字を縦の中央に置いた余りと、エラーの行の上の間が足し合わさり、入力欄より広く見えます。
      </p>
      <p>
        A
        は、行を「文字の上下の余白」で組み直します。キャプションがあってもなくても、エラーの行までの間が入力欄と同じになります。ただし、キャプションのある行が高くなり、選択肢の並びの間隔も変わります。
      </p>
      <p>
        B
        は、行を変えずに、余りがあるときだけエラーの行を詰めます。文字が折り返すと余りがなくなり、詰めすぎます（右から2列目）。
      </p>
      <p>密度は、上のツールバーの「密度」で指用とマウス用を切り替えられます。</p>
    </Comparison>
  ),
};
