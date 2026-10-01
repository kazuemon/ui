import type { Meta, StoryObj } from '@storybook/react-vite';
import { Fragment } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  Sortable,
  SortableHandle,
  SortableItem,
  SortableSeparator,
  type SortableVariant,
} from '../../src/components/sortable/Sortable';

// 軸 483: 並べ替えられるリストに挟む、動かさない行（区切り・見出し）の見た目
const meta = {
  title: 'Design Review/483 並べ替えの動かさない行',
  id: 'design-review-483-sortable-separator',
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
    name: '挟めない',
    intent:
      '項目でない行を並びに置けなかった。まとまりは、リストを分けて外に見出しを置くしかない。比べるための基準',
    spec: [['区切り', 'なし']],
  },
  {
    id: 'A',
    name: '見出し＋線',
    intent:
      'ラベルと同じ太字の文字のあとに、残りの幅に細い線を引く。線が「ここで分かれる」を示し、文字が何のまとまりかを示す',
    spec: [
      ['文字', 'ラベルと同じ（太字・一段淡い濃紺）'],
      ['線', '細い線を残りの幅に'],
      ['面', 'なし'],
    ],
    tokens: {
      '--sortable-separator-fg': 'var(--color-fg-muted)',
      '--sortable-separator-line-width': 'var(--border-width-thin)',
      '--sortable-separator-bg': 'transparent',
      '--sortable-separator-px': '0px',
      '--sortable-separator-pt': 'calc(var(--spacing) * 2)',
      '--sortable-separator-pb': 'calc(var(--spacing) * 1)',
    },
  },
  {
    id: 'B',
    name: '見出しだけ',
    intent:
      '線は引かず、文字と上の空きだけで分ける。Menu のまとまりの見出しと同じ考え方で、いちばん静か',
    spec: [
      ['文字', 'ラベルと同じ'],
      ['線', 'なし'],
      ['面', 'なし'],
    ],
    tokens: {
      '--sortable-separator-fg': 'var(--color-fg-muted)',
      '--sortable-separator-line-width': '0px',
      '--sortable-separator-bg': 'transparent',
      '--sortable-separator-px': '0px',
      '--sortable-separator-pt': 'calc(var(--spacing) * 3)',
      '--sortable-separator-pb': 'calc(var(--spacing) * 1)',
    },
  },
  {
    id: 'C',
    name: 'グレーの帯',
    intent:
      '入力欄の塗りの帯に文字を載せる。項目の面（白い面）と形がはっきり違い、動かせないことが面でも分かる。fill の面とは近い',
    spec: [
      ['文字', 'ラベルと同じ'],
      ['線', 'なし'],
      ['面', '入力欄の塗りの帯（項目の文字の頭にそろえる）'],
    ],
    tokens: {
      '--sortable-separator-fg': 'var(--color-fg-muted)',
      '--sortable-separator-line-width': '0px',
      '--sortable-separator-bg': 'var(--color-field)',
      '--sortable-separator-px': 'var(--spacing-control-x)',
      '--sortable-separator-pt': 'calc(var(--spacing) * 1)',
      '--sortable-separator-pb': 'calc(var(--spacing) * 1)',
    },
  },
];

const columns: Column[] = [{ label: 'card' }, { label: 'fill' }, { label: 'divided' }];

const items = [
  { id: 'draft', label: '下書きを書く' },
  { id: 'review', label: '見直しを頼む' },
  { id: 'image', label: '見出しの画像を作る' },
  { id: 'publish', label: '公開する' },
];
const order = items.map((item) => item.id);
const labelOf = (id: string) => items.find((item) => item.id === id)?.label ?? id;

function List({ variant, separators }: { variant: SortableVariant; separators: boolean }) {
  return (
    <div className="w-64">
      <Sortable value={order} variant={variant} aria-label="今週やること">
        {separators && <SortableSeparator>今日</SortableSeparator>}
        {order.map((id, index) => (
          <Fragment key={id}>
            {separators && index === 2 && <SortableSeparator>明日以降</SortableSeparator>}
            <SortableItem value={id} accessibleName={labelOf(id)}>
              <SortableHandle />
              {labelOf(id)}
            </SortableItem>
          </Fragment>
        ))}
      </Sortable>
    </div>
  );
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={483}
      axis="並べ替えの動かさない行"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <List variant={column.label as SortableVariant} separators={candidate.id !== '現行版'} />
      )}
    >
      <p>
        SortableSeparator
        を足し、並べ替えられるリストの途中に、動かさない行（「今日」「明日以降」のような見出しや区切り）を挟めるようにしました。value
        には入れず、項目のあいだに描きます。項目はキーボードや ︙
        の操作で、区切りをまたいで動きます。
      </p>
      <p>
        選ぶのは、区切りの行の見た目です。divided（1
        つの枠の中を線で区切る）では、どの案でも枠の中の行として、項目の文字の頭にそろえ、線は項目と同じ区切りの線にしています。文字を書かない区切りは、線だけになります（B・C
        では線もなくなるので、文字を書く前提です）。
      </p>
    </Comparison>
  ),
};
