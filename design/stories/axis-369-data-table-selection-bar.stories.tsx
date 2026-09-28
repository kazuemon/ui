import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  countText,
  SamplePagination,
  SampleTable,
  SearchBar,
  SelectionActions,
} from './data-table-frame';
import { Text } from '../../src/components/text/Text';

// 後半の軸 369: DataTable で行を選んでいるあいだの、件数と一括操作の置き場所
// 決定: 現行版（検索の右に並べる）。見本もこの形
//   上の帯（検索）も下の帯（件数・ページ送り）も部品にせず、見本（Recipes/DataTable）で組み方を示す（原則20）
//   決めた置き方は見本に写す。候補は並べ方（クラス）の違いだけで作る
//   帯の面は、ページと同じレイヤーなので影を付けない（原則1）。面を敷く案は、入力欄のグレーか、選ぶ箱と同じ色の淡い面

function Bars({ id, selected }: { id: string; selected: boolean }) {
  const count = 2;
  const top = (() => {
    if (!selected || id === 'C') return <SearchBar />;
    if (id === 'A' || id === 'B') {
      return (
        <div
          className={`flex min-h-(--spacing-control) items-center rounded-control px-3 ${id === 'A' ? 'bg-field' : 'bg-primary-subtle'}`}
        >
          <SelectionActions count={count} />
        </div>
      );
    }
    return (
      <SearchBar>
        <SelectionActions count={count} />
      </SearchBar>
    );
  })();
  return (
    <div className="flex w-[36rem] flex-col gap-3">
      {top}
      <SampleTable
        rows={3}
        color={id === 'B' ? 'primary' : undefined}
        selected={selected ? ['A-1024', 'A-1026'] : []}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        {id === 'C' && selected ? (
          <SelectionActions count={count} />
        ) : (
          <Text as="span" size="sm" variant="muted">
            {countText}
          </Text>
        )}
        <SamplePagination align="end" className="min-w-0 flex-1" />
      </div>
    </div>
  );
}

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '検索の右に並べる',
    intent:
      '上の帯の右端に「2 件を選択中」と操作を足す。検索はそのまま使える。面は敷かない。選ぶと帯の右側だけが現れる。',
    spec: [
      ['置き場所', '上の帯の右端'],
      ['面', 'なし'],
      ['検索', '残す'],
    ],
  },
  {
    id: 'A',
    name: '上の帯を差し替える（グレーの面）',
    intent:
      '選んでいるあいだは、上の帯を選択の帯に差し替える。帯には入力欄のグレーを敷く。いまは選んだ行への操作の場面だと分かる。検索の帯（ラベル付き）より低いので、選ぶと表が少し上に動く。',
    spec: [
      ['置き場所', '上の帯（差し替え）'],
      ['面', '入力欄のグレー'],
      ['検索', '隠す'],
    ],
  },
  {
    id: 'B',
    name: '上の帯を差し替える（淡い色の面）',
    intent:
      'A の面を、選ぶ箱と同じ色の淡い面にする（ここでは color="primary"）。選んだ行の面と帯の面がつながって見える。',
    spec: [
      ['置き場所', '上の帯（差し替え）'],
      ['面', 'color の淡い面'],
      ['検索', '隠す'],
    ],
  },
  {
    id: 'C',
    name: '下の帯の件数と入れ替える',
    intent:
      '下の帯の件数の場所に「2 件を選択中」と操作を出す。上の帯は検索だけのまま動かない。表の下まで目を移す必要がある。',
    spec: [
      ['置き場所', '下の帯の左'],
      ['面', 'なし'],
      ['検索', '残す'],
    ],
  },
];

const columns: Column[] = [{ label: '選んでいないとき' }, { label: '2 件を選んでいるとき' }];

const meta = {
  title: 'Design Review/369 DataTable（選んでいるあいだの一括操作）',
  id: 'design-review-369-data-table-selection-bar',
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

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={369}
      axis="DataTable（選んでいるあいだの一括操作）"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <Bars id={candidate.id} selected={column.label.startsWith('2')} />
      )}
    >
      <p>
        <strong className="text-fg">決定: 現行版（検索の右に並べる）。見本もこの形</strong>
        。行を選んでいるあいだは、何件選んでいるかと、選んだ行への操作（書き出す・選択を外す）を出します。この帯は部品にせず、見本（Recipes/DataTable）で組み方を示します。ここで決めるのは、その置き場所と面です。
      </p>
      <p>
        件数の文は、選ぶたびに読み上げでも知らせます（aria-live）。差し替える案（A・B）では、選択を外すと検索の帯に戻ります。
      </p>
      <p>どれを見本の形にするかを一言添えてください。</p>
    </Comparison>
  ),
};
