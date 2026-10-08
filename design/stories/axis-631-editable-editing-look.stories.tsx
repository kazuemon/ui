import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Editable } from '../../src/components/editable/Editable';

// 軸 631: Editable の、書き換えているあいだの欄の見た目
const meta = {
  title: 'Design Review/631 Editable の書き換え中の欄',
  id: 'design-review-631-editable-editing-look',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: 'current',
    name: 'グレーの面＋枠線',
    intent:
      'TextField にフォーカスしたときと同じ。グレーの面に、フォーカスの枠線を足す。ほかの入力欄と見た目がそろい、「いま入力欄になった」と分かる',
    spec: [
      ['面', '入力欄のグレー（gray-50）'],
      ['枠線', 'フォーカスの枠線（濃紺）'],
    ],
    tokens: { '--editable-edit-bg': 'var(--color-field-focus)' },
  },
  {
    id: 'A',
    name: '白い面＋枠線',
    intent:
      '面は敷かず（白）、フォーカスの枠線だけを足す。文字のときからの変化が枠線だけになり、見出しや表の中で静か。ただし、白い面は読み取り専用の欄（破線）や Card と近く、入力欄の仲間（グレー）から外れる',
    spec: [
      ['面', '白（surface）'],
      ['枠線', 'フォーカスの枠線（濃紺）'],
    ],
    tokens: { '--editable-edit-bg': 'var(--color-surface)' },
  },
];

const columns: Column[] = [
  { label: '書き換え中', note: 'フォーカスを固定', preview: 'editing' },
  { label: '書き換え中（表の中・sm）', preview: 'editing' },
  { label: '押して試す', note: 'Enter で確定、Esc で取り消し' },
];

export const Candidates: Story = {
  name: '候補',
  parameters: {
    pseudo: {
      rootSelector: 'body',
      focusWithin: ['[data-preview="editing"] [data-editing] [data-slot="control"]'],
    },
  },
  render: ({ pick }) => (
    <Comparison
      index={631}
      axis="Editable の、書き換えているあいだの欄の見た目"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => {
        if (column.label === '押して試す')
          return (
            <div className="flex w-64 flex-col gap-3">
              <Editable accessibleName="1 行" defaultValue="2026 年の目標" />
              <Editable
                accessibleName="複数行"
                multiline
                defaultValue={'週に 1 本、記事を書く。\n書いたら SNS で知らせる。'}
              />
            </div>
          );
        if (column.label === '書き換え中')
          return (
            <div className="w-64">
              <Editable accessibleName="書き換え中" defaultEditing defaultValue="2026 年の目標" />
            </div>
          );
        return (
          <div className="grid w-64 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 text-sm">
            <span className="text-fg-muted">担当</span>
            <Editable accessibleName="担当" size="sm" defaultEditing defaultValue="かずえもん" />
            <span className="text-fg-muted">期限</span>
            <Editable accessibleName="期限" size="sm" defaultValue="10 月末" />
          </div>
        );
      }}
    >
      <p>決定: 現行版（グレーの面＋枠線）。</p>
      <p>
        Editable
        を押したあと、入力欄になっているあいだの見た目を選びます。どちらも文字の位置は文字のときと同じで、枠線はフォーカスの枠線です（原則2）。
      </p>
    </Comparison>
  ),
};
