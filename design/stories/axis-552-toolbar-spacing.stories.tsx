import {
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  CaretDownIcon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
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

// 軸 552: ツールバーの項目の間と区切り
const meta = {
  title: 'Design Review/552 ツールバーの項目の間と区切り',
  id: 'design-review-552-toolbar-spacing',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A' },
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

const surface = {
  '--toolbar-border-width': 'var(--border-width-thin)',
  '--toolbar-padding': 'calc(var(--spacing) * 1)',
  '--toolbar-radius': 'calc(var(--radius-control) + var(--spacing) * 1)',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '間 4px・短い区切り',
    intent:
      '項目の間は 4px。区切りは項目の高さから上下 8px ずつ縮めた細い線で、左右にさらに 4px 空ける（区切りの両側は 8px）。まとまりの境目だけが広く見える',
    spec: [
      ['項目の間', '4px'],
      ['区切りの長さ', '項目の高さ − 16px'],
      ['区切りの両側', '8px'],
    ],
    tokens: {
      ...surface,
      '--toolbar-gap': 'calc(var(--spacing) * 1)',
      '--toolbar-separator-inset': 'calc(var(--spacing) * 2)',
      '--toolbar-separator-space': 'calc(var(--spacing) * 1)',
    },
  },
  {
    id: 'A',
    name: '間 8px・短い区切り',
    intent:
      '項目の間を ButtonGroup の gap と同じ 8px に広げる。区切りの両側も 8px で、項目の間と同じ。区切りの線だけでまとまりを分ける',
    spec: [
      ['項目の間', '8px'],
      ['区切りの長さ', '項目の高さ − 16px'],
      ['区切りの両側', '8px'],
    ],
    tokens: {
      ...surface,
      '--toolbar-gap': 'calc(var(--spacing) * 2)',
      '--toolbar-separator-inset': 'calc(var(--spacing) * 2)',
      '--toolbar-separator-space': '0px',
    },
  },
  {
    id: 'B',
    name: '間 4px・項目と同じ高さの区切り',
    intent:
      '区切りを項目の高さいっぱいに伸ばす。まとまりの境目がはっきりするが、線が帯の枠に近づく',
    spec: [
      ['項目の間', '4px'],
      ['区切りの長さ', '項目の高さ'],
      ['区切りの両側', '8px'],
    ],
    tokens: {
      ...surface,
      '--toolbar-gap': 'calc(var(--spacing) * 1)',
      '--toolbar-separator-inset': '0px',
      '--toolbar-separator-space': 'calc(var(--spacing) * 1)',
    },
  },
  {
    id: 'C',
    name: '間 2px・ごく短い区切り',
    intent:
      '項目を詰めて、帯を 1 つの塊に見せる。区切りは上下 12px ずつ縮めた短い線で、両側を 12px 空ける。アイコンだけのボタンが多いエディタ向き',
    spec: [
      ['項目の間', '2px'],
      ['区切りの長さ', '項目の高さ − 24px'],
      ['区切りの両側', '12px'],
    ],
    tokens: {
      ...surface,
      '--toolbar-gap': 'calc(var(--spacing) * 0.5)',
      '--toolbar-separator-inset': 'calc(var(--spacing) * 3)',
      '--toolbar-separator-space': 'calc(var(--spacing) * 2.5)',
    },
  },
];

const columns: Column[] = [
  { label: '書式の帯', note: 'ボタン・ToggleGroup・Select・Menu の開く口' },
  { label: '一覧の上の操作', note: '検索の欄・枠線のボタン・色のボタン' },
  { label: '縦の帯', note: '区切りは横の線' },
];

const sizes = ['12px', '14px', '16px', '20px'];

function Formatting() {
  return (
    <Toolbar aria-label="書式">
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

function ListActions() {
  return (
    <Toolbar aria-label="一覧の操作">
      <SearchField accessibleName="絞り込み" placeholder="名前で絞り込む" className="w-48" />
      <ToolbarSeparator />
      <ToolbarButton variant="outline">書き出す</ToolbarButton>
      <ToolbarButton color="primary">追加</ToolbarButton>
    </Toolbar>
  );
}

function Vertical() {
  return (
    <Toolbar aria-label="揃え" orientation="vertical">
      <ToggleGroup orientation="vertical" defaultValue={['left']} aria-label="揃え">
        <Toggle value="left" iconOnly aria-label="左揃え">
          <Icon icon={TextAlignLeftIcon} standalone />
        </Toggle>
        <Toggle value="center" iconOnly aria-label="中央揃え">
          <Icon icon={TextAlignCenterIcon} standalone />
        </Toggle>
      </ToggleGroup>
      <ToolbarSeparator />
      <ToolbarButton iconOnly aria-label="元に戻す">
        <Icon icon={ArrowCounterClockwiseIcon} standalone />
      </ToolbarButton>
    </Toolbar>
  );
}

export const Default: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={552}
      axis="ツールバーの項目の間と区切り"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => {
        if (column.label === '書式の帯')
          return (
            <div className="w-[34rem]">
              <Formatting />
            </div>
          );
        if (column.label === '一覧の上の操作')
          return (
            <div className="w-[26rem]">
              <ListActions />
            </div>
          );
        return <Vertical />;
      }}
    >
      <p>決定: 項目の間は ButtonGroup と同じ 8px。区切りは現行版のまま（ADR-0482）</p>
      <p>
        帯の中の項目の間と、まとまりのあいだに引く区切りの線（ToolbarSeparator）の長さと両側の空きです。帯の面はどの案も現行版（細い線の枠）にそろえています。
      </p>
      <p>密度（ツールバーの「密度」）を指に切り替えても比べてください。</p>
    </Comparison>
  ),
};
