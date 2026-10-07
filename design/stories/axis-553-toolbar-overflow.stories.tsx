import {
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  CaretDownIcon,
  TextBIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Icon } from '../../src/components/icon/Icon';
import { Menu } from '../../src/components/menu/Menu';
import { MenuItem } from '../../src/components/menu/MenuItem';
import { SearchField } from '../../src/components/search-field/SearchField';
import { Select } from '../../src/components/select/Select';
import { Toggle } from '../../src/components/toggle/Toggle';
import { ToggleGroup } from '../../src/components/toggle/ToggleGroup';
import { Toolbar, ToolbarButton, ToolbarSeparator } from '../../src/components/toolbar/Toolbar';

// 軸 553: ツールバーに入りきらないとき
const meta = {
  title: 'Design Review/553 ツールバーに入りきらないとき',
  id: 'design-review-553-toolbar-overflow',
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
    id: '現行版',
    name: '折り返す',
    intent:
      '入りきらない項目を次の行へ送る。まとまり（ToolbarGroup・ToggleGroup）の中は折り返さず、まとまりごと送る。どの項目もいつも見えるが、帯の高さが変わる。行の端に区切りの線が残ることがある',
    spec: [
      ['wrap', 'true'],
      ['帯の高さ', '行の数で変わる'],
    ],
  },
  {
    id: 'A',
    name: '横にスクロール',
    intent:
      '1 行のまま、はみ出した分を横にスクロールする。続きのある端に内側の影を落とす（ScrollArea と同じ）。帯の高さは変わらないが、隠れた項目は送らないと見えない。矢印キーで移ると、見える位置まで送る',
    spec: [
      ['wrap', 'false'],
      ['帯の高さ', '1 行のまま'],
      ['続きの合図', '端の内側の影'],
    ],
  },
];

const columns: Column[] = [
  { label: '狭い入れ物（320px）', note: '書式の帯' },
  { label: 'もっと狭い（240px）', note: '書式の帯' },
  { label: '一覧の上の操作（280px）', note: '検索の欄とボタン' },
];

const sizes = ['12px', '14px', '16px', '20px'];

function Formatting({ wrap }: { wrap: boolean }) {
  return (
    <Toolbar aria-label="書式" wrap={wrap}>
      <ToolbarButton iconOnly aria-label="元に戻す">
        <Icon icon={ArrowCounterClockwiseIcon} standalone />
      </ToolbarButton>
      <ToolbarButton iconOnly aria-label="やり直す">
        <Icon icon={ArrowClockwiseIcon} standalone />
      </ToolbarButton>
      <ToolbarSeparator />
      <ToggleGroup multiple defaultValue={['bold']} aria-label="文字の書式">
        <Toggle value="bold" iconOnly aria-label="太字">
          <Icon icon={TextBIcon} standalone />
        </Toggle>
        <Toggle value="italic" iconOnly aria-label="斜体">
          <Icon icon={TextItalicIcon} standalone />
        </Toggle>
        <Toggle value="underline" iconOnly aria-label="下線">
          <Icon icon={TextUnderlineIcon} standalone />
        </Toggle>
      </ToggleGroup>
      <ToolbarSeparator />
      <Select
        accessibleName="文字の大きさ"
        items={sizes}
        defaultValue="14px"
        presentation="popover"
        className="w-28"
      />
      <Menu
        trigger={
          <ToolbarButton>
            挿入
            <Icon icon={CaretDownIcon} />
          </ToolbarButton>
        }
      >
        <MenuItem>画像</MenuItem>
        <MenuItem>表</MenuItem>
      </Menu>
    </Toolbar>
  );
}

function ListActions({ wrap }: { wrap: boolean }) {
  return (
    <Toolbar aria-label="一覧の操作" wrap={wrap}>
      <SearchField accessibleName="絞り込み" placeholder="名前で絞り込む" className="w-48" />
      <ToolbarSeparator />
      <ToolbarButton variant="outline">書き出す</ToolbarButton>
      <ToolbarButton color="primary">追加</ToolbarButton>
    </Toolbar>
  );
}

export const Default: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={553}
      axis="ツールバーに入りきらないとき"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const wrap = candidate.id === '現行版';
        if (column.label.startsWith('狭い'))
          return (
            <div className="w-80">
              <Formatting wrap={wrap} />
            </div>
          );
        if (column.label.startsWith('もっと'))
          return (
            <div className="w-60">
              <Formatting wrap={wrap} />
            </div>
          );
        return (
          <div className="w-70">
            <ListActions wrap={wrap} />
          </div>
        );
      }}
    >
      <p>決定: 既定は折り返す。wrap={false} で横にスクロールする（ADR-0483）</p>
      <p>
        帯が入れ物より長いときの扱いです。部品は入れ物が狭いかどうかを知らないので（原則20）、どちらも
        wrap で選べるようにしてあります。決めるのは既定です。
      </p>
      <p>
        入りきらない項目を「…」のメニューに畳む形は、この比較に入れていません（項目の幅を測って隠す仕組みが要るので、要るなら別に作ります）。
      </p>
    </Comparison>
  ),
};
