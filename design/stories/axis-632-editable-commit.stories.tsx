import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Editable, type EditableBlurBehavior } from '../../src/components/editable/Editable';

// 軸 632: Editable の確定と取り消し（確定・取り消しのボタンを出すか、外を押したときに確定か取り消しか）
const meta = {
  title: 'Design Review/632 Editable の確定と取り消し',
  id: 'design-review-632-editable-commit',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const behavior: Record<string, { blurBehavior: EditableBlurBehavior; showActions: boolean }> = {
  current: { blurBehavior: 'commit', showActions: false },
  A: { blurBehavior: 'cancel', showActions: false },
  B: { blurBehavior: 'commit', showActions: true },
};

const candidates: Candidate[] = [
  {
    id: 'current',
    name: 'ボタンなし・外へ出ると確定',
    intent:
      'Enter か、欄の外を押す・Tab で離れると確定する。Esc だけが取り消し。打ったものが消えないので安心だが、うっかり触った変更もそのまま確定する',
    spec: [
      ['ボタン', 'なし'],
      ['外へ出たとき', '確定'],
    ],
  },
  {
    id: 'A',
    name: 'ボタンなし・外へ出ると取り消し',
    intent:
      'Enter だけが確定。欄の外を押す・Tab で離れると、元の値に戻る。うっかり確定しないが、打ったあと外を押すと消えてしまう',
    spec: [
      ['ボタン', 'なし'],
      ['外へ出たとき', '取り消し'],
    ],
  },
  {
    id: 'B',
    name: '✓・× のボタン・外へ出ると確定',
    intent:
      '書き換えているあいだ、欄の右端に確定（✓）と取り消し（×）のボタンを出す（suffix のボタンと同じグレーの塊）。指でも確定・取り消しが分かる。欄が狭くなり、表のセルでは窮屈',
    spec: [
      ['ボタン', '✓・×（欄の右端）'],
      ['外へ出たとき', '確定'],
    ],
  },
];

const columns: Column[] = [
  { label: '1 行', note: '押して、打ってから外を押してみてください' },
  { label: '複数行', note: 'Enter は改行、Ctrl（⌘）＋ Enter で確定' },
  { label: '表の中（sm）' },
];

// 確定した回数と値を、見本の下に出す
function Sample({ id, column }: { id: string; column: Column }) {
  const [log, setLog] = useState<string>('—');
  const props = {
    ...behavior[id],
    onValueCommitted: (value: string) => setLog(`確定: ${value.replace(/\n/g, '⏎')}`),
  };
  const editable =
    column.label === '1 行' ? (
      <Editable accessibleName="1 行" defaultValue="2026 年の目標" {...props} />
    ) : column.label === '複数行' ? (
      <Editable
        accessibleName="複数行"
        multiline
        defaultValue={'週に 1 本、記事を書く。\n書いたら SNS で知らせる。'}
        {...props}
      />
    ) : (
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 text-sm">
        <span className="text-fg-muted">担当</span>
        <Editable accessibleName="担当" size="sm" defaultValue="かずえもん" {...props} />
        <span className="text-fg-muted">期限</span>
        <Editable accessibleName="期限" size="sm" defaultValue="10 月末" {...props} />
      </div>
    );
  return (
    <div className="flex w-64 flex-col gap-2">
      {editable}
      <p className="text-xs text-fg-subtle">{log}</p>
    </div>
  );
}

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={632}
      axis="Editable の確定と取り消し"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => <Sample id={candidate.id} column={column} />}
    >
      <p>
        決定: 現行版（ボタンなし・外へ出ると確定）が既定。showActions で ✓・× を出せ、blurBehavior
        で取り消しにもできる。
      </p>
      <p>
        書き換えたあと、どう確定し、どう取り消すかを選びます。どの案でも、Enter（複数行では Ctrl・⌘
        ＋ Enter）で確定、Esc で取り消しです。違うのは、欄の外へ出たときと、ボタンを出すかです。
      </p>
      <p>
        どれを既定にし、どれを選べるようにするかも教えてください（いまは
        `blurBehavior`・`showActions` でどれも選べる作りです）。
      </p>
    </Comparison>
  ),
};
