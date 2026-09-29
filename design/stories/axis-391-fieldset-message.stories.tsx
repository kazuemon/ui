import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Fieldset, type FieldsetMessagePlacement } from '../../src/components/fieldset/Fieldset';
import { TextField } from '../../src/components/text-field/TextField';

// 軸 391: Fieldset のまとまり全体のステータスメッセージ（1 つの欄に帰せないエラー）の場所と、エラーのときに何を赤くするか
//   軸 389 で「既定は囲まない、枠（B）と縦線（C）も選べる」、390 で「見出しは本文の太字」と決まった（未記録）
const meta = {
  title: 'Design Review/391 Fieldset のまとまりのエラー',
  id: 'design-review-391-fieldset-message',
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
    name: 'まとまりの下',
    intent:
      '中の欄の下に、欄のエラーと同じ行（丸の「!」と赤い文字）を出す。欄の見た目も線も変えない',
    spec: [
      ['場所', '中の欄の下'],
      ['赤くするもの', '行の文字だけ'],
    ],
  },
  {
    id: 'A',
    name: '見出しの下',
    intent:
      '見出し（とヘルプテキスト）の下、中の欄の上に出す。読む順で先に目に入り、長いまとまりでも見出しから離れない',
    spec: [
      ['場所', '見出し・ヘルプテキストの下'],
      ['赤くするもの', '行の文字だけ'],
    ],
  },
  {
    id: 'B',
    name: '線も赤く',
    intent: '現行版のうえで、囲みの線（枠・縦線）を赤くする。囲まないときは現行版と同じ',
    spec: [
      ['場所', '中の欄の下'],
      ['赤くするもの', '行の文字と、枠・縦線'],
    ],
    tokens: { '--fieldset-line-invalid': 'var(--color-fg-danger)' },
  },
  {
    id: 'C',
    name: '中の欄も赤く',
    intent: '現行版のうえで、中の欄をすべてエラーの見た目（赤い枠線・赤みの塗り）にする',
    spec: [
      ['場所', '中の欄の下'],
      ['赤くするもの', '行の文字と、中の欄すべて'],
    ],
  },
  {
    id: 'D',
    name: '見出しの下＋中の欄も赤く',
    intent: 'A と C の組み合わせ。行は見出しの下で先に読め、どの欄を直せばよいかは赤い欄で示す',
    spec: [
      ['場所', '見出し・ヘルプテキストの下'],
      ['赤くするもの', '行の文字と、中の欄すべて'],
    ],
  },
];

const placementOf: Record<string, FieldsetMessagePlacement> = { A: 'top', D: 'top' };

// 軸 389 の B・C（選べる形）の値
const frames: Record<string, CSSProperties & Record<`--${string}`, string>> = {
  囲まない: {},
  枠: {
    '--fieldset-border-top': 'var(--border-width-thin)',
    '--fieldset-border-side': 'var(--border-width-thin)',
    '--fieldset-border-bottom': 'var(--border-width-thin)',
    '--fieldset-pad-top': 'var(--spacing-control-x)',
    '--fieldset-pad-x': 'var(--spacing-control-x)',
    '--fieldset-pad-bottom': 'var(--spacing-control-x)',
    '--fieldset-radius': 'var(--radius-card)',
  },
  縦線: {
    '--fieldset-rule-start': 'var(--border-width-thin)',
    '--fieldset-indent': 'var(--spacing-control-x)',
  },
};

const columns: Column[] = [
  { label: '囲まない', note: '既定' },
  { label: '枠', note: '選べる形' },
  { label: '縦線', note: '選べる形' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={391}
      axis="Fieldset のまとまりのエラー"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <div className="w-[360px]" style={frames[column.label]}>
          <Fieldset
            label="宿泊の期間"
            caption="チェックインとチェックアウトの日です"
            errorText="チェックアウトは、チェックインより後の日にしてください"
            messagePlacement={placementOf[candidate.id] ?? 'bottom'}
            invalidFields={candidate.id === 'C' || candidate.id === 'D'}
          >
            <TextField label="チェックイン" defaultValue="2026-10-10" />
            <TextField label="チェックアウト" defaultValue="2026-10-08" />
          </Fieldset>
        </div>
      )}
    >
      <p>
        「チェックアウトはチェックインより後」のように、1
        つの欄に帰せないエラーをまとまり全体に出す行です。1
        つの欄のエラーは、これまでどおりその欄の下に出します。行は欄のエラーと同じ見た目で、出るときは同じく滑って開き、読み上げではまとまりの説明になります。
      </p>
      <p>
        列は、軸 389
        で選べるようにした囲み方です。既定にする案と、ほかにも選べるようにする案があれば教えてください。
      </p>
    </Comparison>
  ),
};
