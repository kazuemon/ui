import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  Autocomplete,
  type AutocompleteItem,
  type AutocompleteProps,
} from '../../src/components/autocomplete/Autocomplete';
import { Icon } from '../../src/components/icon/Icon';
import { statePseudo } from '../../src/stories/story-states';

// 後半の軸 247: Autocomplete の入力欄の見た目（虫眼鏡の有無）と、消去 ✕
//   虫眼鏡は塗りのない印（押せない・検索の欄だという説明。原則 8）、✕ はグレー地のボタン（押せる）
//   候補は部品の props（appearance・clearable）で行ごとに変える

const items: AutocompleteItem[] = [
  { label: '札幌市', value: 'sapporo' },
  { label: '東京都', value: 'tokyo' },
  { label: '京都市', value: 'kyoto' },
];

type Look = Pick<AutocompleteProps, 'icon' | 'clearable'>;

const searchIcon = <Icon icon={MagnifyingGlassIcon} />;

const looks: Record<string, Look> = {
  現行版: { icon: undefined, clearable: true },
  A: { icon: searchIcon, clearable: true },
  B: { icon: undefined, clearable: false },
  C: { icon: searchIcon, clearable: false },
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '飾りなし＋ ✕',
    intent: 'TextField と同じ文字入力欄。文字があるあいだ、端にグレー地の ✕ が出る。',
    spec: [
      ['icon', 'なし'],
      ['clearable', 'true'],
    ],
  },
  {
    id: 'A',
    name: '虫眼鏡＋ ✕',
    intent: '先頭に塗りのない虫眼鏡を置く（SearchField と同じ）。文字があるあいだ、端に ✕ が出る。',
    spec: [
      ['icon', '虫眼鏡'],
      ['clearable', 'true'],
    ],
  },
  {
    id: 'B',
    name: '飾りなし・✕ なし',
    intent: 'TextField と同じで、消去のボタンを出さない。消すのは打ち直しか、選択して削除。',
    spec: [
      ['icon', 'なし'],
      ['clearable', 'false'],
    ],
  },
  {
    id: 'C',
    name: '虫眼鏡・✕ なし',
    intent: '虫眼鏡だけを置き、消去のボタンは出さない。',
    spec: [
      ['icon', '虫眼鏡'],
      ['clearable', 'false'],
    ],
  },
];

const columns: Column[] = [
  { label: '空' },
  { label: '文字あり' },
  { label: 'フォーカス（文字あり）', preview: 'focus' },
  { label: 'エラー' },
  { label: '読み取り専用' },
  { label: '押せない' },
];

function cellBody(column: Column, look: Look) {
  const common = { items, label: '都市', ...look };
  switch (column.label) {
    case '空':
      return <Autocomplete {...common} placeholder="都市名を打って探す" />;
    case '文字あり':
      return <Autocomplete {...common} defaultValue="京都" />;
    case 'フォーカス（文字あり）':
      return <Autocomplete {...common} defaultValue="京都" />;
    case 'エラー':
      return <Autocomplete {...common} defaultValue="京都" error="都市を確かめてください" />;
    case '読み取り専用':
      return <Autocomplete {...common} readOnly defaultValue="京都市" />;
    default:
      return <Autocomplete {...common} disabled defaultValue="京都市" />;
  }
}

// 欄の幅を固定する。✕ の有無で欄の幅が変わって見えないように
function cell(column: Column, look: Look) {
  return <div className="w-72">{cellBody(column, look)}</div>;
}

interface Args {
  pick: string;
}

const meta = {
  title: 'Design Review/247 Autocomplete の入力欄の見た目',
  id: 'design-review-247-autocomplete-input-look',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({ focusWithin: '[data-slot="control"]' }),
  },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<Args>;

export default meta;

export const Candidates: StoryObj<Args> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={247}
      axis="Autocomplete の入力欄の見た目と消去 ✕"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => cell(column, looks[candidate.id])}
    >
      <p>
        決定: 現行版を既定にし、icon は自由に渡せて、✕
        は出さないこともできる形にする（ADR-XXXX、番号は統合時に入れる）。appearance
        をやめ、icon（ReactNode）に置き換えた。虫眼鏡は利用者が渡す。
      </p>
    </Comparison>
  ),
};
