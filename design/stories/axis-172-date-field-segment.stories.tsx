import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { userEvent } from 'storybook/test';

import { type Candidate, type Column, Comparison } from './Comparison';
import { DateField } from '../../src/components/date-field/DateField';
import { TimeField } from '../../src/components/time-field/TimeField';
import { Temporal } from '../../src/internal/date/plain-date';

// 後半の軸 172: 日付の欄の区切り
//   決定: C1（グレー）を既定にし、color を指定した欄では現行版（その色の淡い塗り）にする。間隔は現行版のまま
//   塗りは design/tokens.css の --date-segment-focus-bg（neutral）と --date-segment-focus-bg-primary・-secondary（color を指定した欄）
//   行は color の props で描く: 現行版は color="primary"、C1 は既定（neutral）
//   「途中まで」の列は、play で年を打って作る（値の props では、そろっていない区切りを渡せないため）

const day = Temporal.PlainDate.from('2026-09-20');
const time = Temporal.PlainTime.from('15:05');

const shared = {
  '--date-segment-pad-x': 'calc(var(--spacing) * 0.5)',
  '--date-segment-gap': 'calc(var(--spacing) * 0.5)',
  '--date-segment-radius': 'var(--radius-sm)',
  '--date-segment-focus-fg': 'var(--color-fg)',
  '--date-segment-focus-placeholder': 'var(--field-placeholder)',
};

const spacingSpec: [string, string] = ['間隔', '区切りの左右 2px ＋ 記号とのあいだ 2px'];

const focusCandidates: Candidate[] = [
  {
    id: '現行版',
    name: '主色の淡い塗り（color="primary"）',
    intent:
      'color を指定した欄の見た目。区切りを、その色（ここでは主色の青）を欄のグレーに 16% 混ぜた淡い塗りで塗る。フォーカスの枠線もその色になる。文字の色は変えない。区切りに左右の余白を持たせ、塗りと「/」「:」のあいだを少し空けた（ブラウザの日付の欄と同じ）。',
    spec: [
      ['塗り', '主色 16% ＋ 欄の塗り'],
      ['文字', '本文の色のまま'],
      ['角丸', '4px'],
      spacingSpec,
    ],
    // color="primary" で描く（renderCell）。塗りは --date-segment-focus-bg-primary
    tokens: {
      ...shared,
      '--date-segment-focus-bg-primary':
        'color-mix(in oklab, var(--color-primary) 16%, var(--color-field))',
    },
  },
  {
    id: 'C1',
    name: 'グレーの塗り（既定・neutral）',
    intent:
      'prefix・suffix のグレーに本文の色を 8% 混ぜた塗り。色を持たない欄の中で色を足さずに示す。color を指定しない欄の既定。',
    spec: [
      ['塗り', 'prefix・suffix のグレー ＋ 本文の色 8%'],
      ['文字', '本文の色のまま'],
      ['角丸', '4px'],
      spacingSpec,
    ],
    tokens: {
      ...shared,
      '--date-segment-focus-bg':
        'color-mix(in oklab, var(--color-field-addon), var(--color-fg) 8%)',
    },
  },
];

// 状態を固定する列。focus は区切りに、focus-within は欄の本体に当てる
const focusColumns: Column[] = [
  { label: '空' },
  { label: 'フォーカス（年）', preview: 'focus-year' },
  { label: '途中まで', note: '年を打ち、月を打っているところ', preview: 'partial' },
  { label: '全部', note: '日にフォーカス', preview: 'focus-day' },
  { label: 'エラー', note: '年にフォーカス', preview: 'focus-year' },
  { label: '押せない' },
  { label: '読み取り専用', note: '年にフォーカス', preview: 'focus-year' },
  { label: 'TimeField', note: '時にフォーカス', preview: 'focus-hour' },
];

const pseudo = {
  rootSelector: 'body',
  focus: [
    '[data-preview="focus-year"] [data-segment="year"]',
    '[data-preview="focus-day"] [data-segment="day"]',
    '[data-preview="focus-hour"] [data-segment="hour"]',
    '[data-preview="partial"] [data-segment="month"]',
  ],
  focusWithin: [
    '[data-preview="focus-year"] [data-slot="control"]',
    '[data-preview="focus-day"] [data-slot="control"]',
    '[data-preview="focus-hour"] [data-slot="control"]',
    '[data-preview="partial"] [data-slot="control"]',
  ],
};

function cell(column: Column, candidate: Candidate): ReactNode {
  // 現行版の行は color="primary"、C1 の行は既定（neutral）
  const color = candidate.id === '現行版' ? 'primary' : 'neutral';
  const common = { label: '生年月日', color } as const;
  const body = (() => {
    switch (column.label) {
      case 'フォーカス（年）':
        return <DateField {...common} />;
      case '途中まで':
        return (
          <div data-partial="">
            <DateField {...common} />
          </div>
        );
      case '全部':
        return <DateField {...common} defaultValue={day} />;
      case 'エラー':
        return column.preview ? (
          <DateField {...common} defaultValue={day} error="未来の日は入れられません" />
        ) : (
          <DateField {...common} error="生年月日を入力してください" />
        );
      case '押せない':
        return <DateField {...common} disabled />;
      case '読み取り専用':
        return <DateField {...common} defaultValue={day} readOnly />;
      case 'TimeField':
        return <TimeField label="開始時刻" color={color} defaultValue={time} />;
      default:
        return <DateField {...common} />;
    }
  })();
  return <div className="w-[220px]">{body}</div>;
}

// 「途中まで」の欄に年を打つ。打ち終えたらフォーカスを外す（見せ方は pseudo で固定する）
async function typePartial(root: HTMLElement) {
  for (const year of root.querySelectorAll<HTMLElement>('[data-partial] [data-segment="year"]')) {
    await userEvent.click(year);
    await userEvent.keyboard('2026');
  }
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  // 押したときに動いたスクロールを戻す
  for (const scroller of root.querySelectorAll('.overflow-x-auto')) scroller.scrollLeft = 0;
  window.scrollTo(0, 0);
}

const meta = {
  title: 'Design Review/172 日付の欄の区切り',
  id: 'design-review-172-date-field-segment',
  parameters: { layout: 'fullscreen', pseudo },
  args: { pick: 'C1,current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'C1', 'C1,current'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Focus: StoryObj<{ pick: string }> = {
  name: '打っている区切りの見せ方',
  render: ({ pick }) => (
    <Comparison
      index={172}
      axis="日付の欄の区切り: 打っている区切りの見せ方"
      pick={pick}
      candidates={focusCandidates}
      columns={focusColumns}
      renderCell={(column, candidate) => cell(column, candidate)}
    >
      <p>
        決定: C1（グレー）を既定にし、color
        を指定した欄では現行版（その色の淡い塗り）にする。間隔は現行版のまま。
      </p>
      <p>
        DateField・TimeField
        は、年・月・日（時・分）の区切りごとに打つ欄です。いま打っている区切りを塗りで示します。区切りに左右の余白を持たせ、塗りが「/」「:」にかからないようにしています（ブラウザの日付の欄と同じ間）。値の文字の先頭は、ほかの入力欄とそろえたままです。
      </p>
      <p>現行版の行は color="primary" の欄、C1 の行は color を指定しない欄（neutral）です。</p>
    </Comparison>
  ),
  play: async ({ canvasElement }) => typePartial(canvasElement),
};
