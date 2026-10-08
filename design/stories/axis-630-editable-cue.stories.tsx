import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Editable } from '../../src/components/editable/Editable';

// 軸 630: Editable の、文字のときに書き換えられることを示す印（鉛筆と文字のあいだ）
const meta = {
  title: 'Design Review/630 Editable の鉛筆と文字のあいだ',
  id: 'design-review-630-editable-cue',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
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
    id: 'current',
    name: '8px',
    intent:
      '前回までの倍の間。鉛筆が文字の一部ではなく、後ろに添えた印として離れて見える。表のセルでも、鉛筆が隣の列まで寄らない',
    spec: [['文字と鉛筆のあいだ', '8px（spacing × 2）']],
    tokens: { '--editable-cue-icon-gap': 'calc(var(--spacing) * 2)' },
  },
  {
    id: 'A',
    name: '4px（前回までの間）',
    intent: '前回までの間。鉛筆が文字のすぐ後ろに付き、最後の 1 文字のように見えることがある',
    spec: [['文字と鉛筆のあいだ', '4px（spacing）']],
    tokens: { '--editable-cue-icon-gap': 'var(--spacing)' },
  },
  {
    id: 'B',
    name: '12px',
    intent:
      'さらに離す。鉛筆がはっきり別のものに見えるが、短い値（「10 月末」など）では、どの値の印かが少し遠く感じる',
    spec: [['文字と鉛筆のあいだ', '12px（spacing × 3）']],
    tokens: { '--editable-cue-icon-gap': 'calc(var(--spacing) * 3)' },
  },
  {
    id: 'C',
    name: '16px',
    intent:
      '文字 1 字ぶん離す。いちばんすっきり見えるが、表の狭いセルでは鉛筆が右へ押し出され、値が途中で切れやすい',
    spec: [['文字と鉛筆のあいだ', '16px（spacing × 4）']],
    tokens: { '--editable-cue-icon-gap': 'calc(var(--spacing) * 4)' },
  },
];

const columns: Column[] = [
  { label: '通常' },
  { label: 'hover', preview: 'hover' },
  { label: '見出しと表で', note: 'マウスを載せて・押して試せます（Enter で確定、Esc で取り消し）' },
];

const preview = 'button[data-slot="editable-preview"]';

export const Candidates: Story = {
  name: '候補',
  parameters: { pseudo: { rootSelector: 'body', hover: [`[data-preview="hover"] ${preview}`] } },
  render: ({ pick }) => (
    <Comparison
      index={630}
      axis="Editable の、文字と鉛筆のあいだ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) =>
        column.label === '見出しと表で' ? (
          <div className="flex w-72 flex-col gap-3">
            <Editable accessibleName="プロジェクトの名前" defaultValue="ポートフォリオの作り直し" />
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 text-sm">
              <span className="text-fg-muted">担当</span>
              <Editable accessibleName="担当" size="sm" defaultValue="かずえもん" />
              <span className="text-fg-muted">期限</span>
              <Editable accessibleName="期限" size="sm" defaultValue="10 月末" />
            </div>
          </div>
        ) : (
          <div className="w-64">
            <Editable accessibleName={`見本・${column.label}`} defaultValue="2026 年の目標" />
          </div>
        )
      }
    >
      <p>
        決定: 現行版（文字と鉛筆のあいだ 8px、spacing × 2）。鉛筆は文字と同じ大きさで、editIndicator
        は subtle が既定、hover も選べる。
      </p>
      <p>
        鉛筆は文字と同じ大きさで、ふだんは半分の濃さ、載せると濃くする形に決まりました（載せたときだけ出す形も
        editIndicator="hover" で選べます）。ここでは、文字と鉛筆のあいだを選びます。
      </p>
      <p>「見出しと表で」の列は、マウスを載せて・押して試せます。</p>
    </Comparison>
  ),
};
