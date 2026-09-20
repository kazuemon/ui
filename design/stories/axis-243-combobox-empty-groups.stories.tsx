import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';

import { Combobox, type ComboboxGroup } from '../../src/components/combobox/Combobox';
import { Comparison, type Candidate, type Column } from './Comparison';

const prefectures: ComboboxGroup[] = [
  {
    label: '関東',
    items: [
      { label: '東京都', value: 'tokyo' },
      { label: '神奈川県', value: 'kanagawa' },
    ],
  },
  {
    label: '近畿',
    items: [
      { label: '大阪府', value: 'osaka' },
      { label: '京都府', value: 'kyoto' },
    ],
  },
  { label: '九州', items: [{ label: '福岡県', value: 'fukuoka' }] },
];

const columns: Column[] = [
  { label: '単一選択', note: 'multiple なし' },
  { label: '複数選択', note: 'multiple' },
];

function PopoverFrame({
  height,
  children,
}: {
  height: string;
  children: (c: HTMLElement) => ReactNode;
}) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setContainer} className={`relative max-w-sm ${height}`}>
      {container && children(container)}
    </div>
  );
}

type Cell = Partial<React.ComponentProps<typeof Combobox>>;

function cell(column: Column, height: string, props: Cell, empty = false) {
  const multiple = column.label === '複数選択';
  return (
    <PopoverFrame height={height}>
      {(container) => (
        <Combobox
          label="都道府県"
          items={prefectures}
          placeholder="打って探す"
          {...(multiple
            ? { multiple: true, defaultValue: empty ? [] : ['tokyo', 'osaka'] }
            : { defaultValue: empty ? null : 'kyoto' })}
          {...(empty ? { defaultInputValue: 'zzz' } : {})}
          popoverMaxHeight="none"
          {...props}
          defaultOpen
          container={container}
          collisionAvoidance={{ side: 'none', align: 'none' }}
        />
      )}
    </PopoverFrame>
  );
}

const meta = {
  title: 'Design Review/243 Combobox の空状態とグループ',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const headings: (Candidate & { props: Cell })[] = [
  {
    id: 'current',
    name: 'label（現行版）',
    intent: '見出しは入力欄のラベルと同じ、太字で一段淡い濃紺',
    spec: [['groupLabelStyle', 'label']],
    props: { groupLabelStyle: 'label' },
  },
  {
    id: 'A',
    name: 'caption',
    intent: '見出しをキャプションと同じ小さいグレーにして、項目より一歩引かせる',
    spec: [['groupLabelStyle', 'caption']],
    props: { groupLabelStyle: 'caption' },
  },
];

export const GroupHeading: Story = {
  name: '1 グループの見出し',
  render: () => (
    <Comparison
      index={243}
      axis="グループの見出しの見た目"
      pick="current"
      candidates={headings}
      columns={columns}
      renderCell={(column, candidate) =>
        cell(column, 'h-[24rem]', headings.find((c) => c.id === candidate.id)?.props ?? {})
      }
    >
      <p>見出しと項目の区別を、太さと色のどちらで付けるか。</p>
    </Comparison>
  ),
};

const separators: (Candidate & { props: Cell })[] = [
  {
    id: 'current',
    name: '区切りなし（現行版）',
    intent: '見出しの上の余白だけでグループを分ける',
    spec: [['groupSeparator', 'false']],
    props: { groupSeparator: false },
  },
  {
    id: 'A',
    name: '区切り線あり',
    intent: '面の端から端まで線を引く。Menu と同じ形',
    spec: [['groupSeparator', 'true']],
    props: { groupSeparator: true },
  },
  {
    id: 'B',
    name: 'caption 見出し＋区切り線',
    intent: '見出しを引かせるぶん、線でグループの切れ目を補う',
    spec: [
      ['groupLabelStyle', 'caption'],
      ['groupSeparator', 'true'],
    ],
    props: { groupLabelStyle: 'caption', groupSeparator: true },
  },
];

export const GroupSeparator: Story = {
  name: '2 グループの区切り',
  render: () => (
    <Comparison
      index={243}
      axis="グループのあいだの区切り線"
      pick="current"
      candidates={separators}
      columns={columns}
      renderCell={(column, candidate) =>
        cell(column, 'h-[24rem]', separators.find((c) => c.id === candidate.id)?.props ?? {})
      }
    >
      <p>見出しの種類（label / caption）は 1 と組み合わせて選べる。</p>
    </Comparison>
  ),
};

const hint = (
  <span className="flex flex-col py-1.5">
    <span>当てはまる都道府県がありません</span>
    <span className="text-caption leading-caption text-fg-subtle">
      ひらがなや漢字を変えて、もう一度探してください
    </span>
  </span>
);

const empties: (Candidate & { props: Cell })[] = [
  {
    id: 'current',
    name: '短い 1 行（現行版）',
    intent: '項目と同じ高さ・左右の余白。文は emptyText で渡す',
    spec: [['emptyText', '当てはまるものがありません']],
    props: { emptyText: '当てはまるものがありません' },
  },
  {
    id: 'A',
    name: '2 行のヒント',
    intent: '1 行目に結果、2 行目にキャプションの小さいグレーで次の手を示す。高さは伸びる',
    spec: [['emptyText', '1 行目＋ヒント（ReactNode）']],
    props: { emptyText: hint },
  },
  {
    id: 'B',
    name: '読み込み中の並び（参考）',
    intent: '読み込み中は空の行を出さず、読み込みの行を出す。現行の動きで、候補ではない',
    spec: [
      ['loading', 'true'],
      ['emptyText', '当てはまるものがありません'],
    ],
    props: { loading: true, emptyText: '当てはまるものがありません' },
  },
];

export const EmptyRow: Story = {
  name: '3 空の行',
  render: () => (
    <Comparison
      index={243}
      axis="当たる選択肢がないときの行"
      pick="current"
      candidates={empties}
      columns={columns}
      renderCell={(column, candidate) =>
        cell(column, 'h-[13rem]', empties.find((c) => c.id === candidate.id)?.props ?? {}, true)
      }
    >
      <p>入力欄に「zzz」と打って、当たるものがない状態で固定している。</p>
    </Comparison>
  ),
};
