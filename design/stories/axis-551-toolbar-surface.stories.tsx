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

// 軸 551: Toolbar の帯の面（枠線・塗り・内側の余白・角）
const meta = {
  title: 'Design Review/551 ツールバーの帯の面',
  id: 'design-review-551-toolbar-surface',
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

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '細い線の枠',
    intent:
      '白い地のまま、細い境界線で帯を囲む。内側に 4px 空け、角は中の部品の角に余白を足した同心の角。帯の範囲が見え、ページと同じレイヤーなので影はない',
    spec: [
      ['枠線', '細い境界線（--color-line）'],
      ['塗り', 'なし'],
      ['内側の余白', '4px'],
      ['角', '部品の角 + 4px（16px）'],
    ],
    tokens: {
      '--toolbar-border-width': 'var(--border-width-thin)',
      '--toolbar-bg': 'transparent',
      '--toolbar-padding': 'calc(var(--spacing) * 1)',
      '--toolbar-radius': 'calc(var(--radius-control) + var(--spacing) * 1)',
    },
  },
  {
    id: 'A',
    name: '面なし',
    intent:
      '枠も塗りも余白もなく、項目だけを並べる。ButtonGroup の gap と同じ見え方。帯の範囲は見えないが、いちばん軽い',
    spec: [
      ['枠線', 'なし'],
      ['塗り', 'なし'],
      ['内側の余白', '0'],
    ],
    tokens: {
      '--toolbar-border-width': '0px',
      '--toolbar-bg': 'transparent',
      '--toolbar-padding': '0px',
      '--toolbar-radius': '0px',
    },
  },
  {
    id: 'B',
    name: '淡いグレーの塗り',
    intent:
      '枠線の代わりに、入力欄と同じ淡いグレーを敷く。帯の範囲は塗りで見せる。グレーの項目（トグルの OFF・欄）と地の差は小さくなる',
    spec: [
      ['枠線', 'なし'],
      ['塗り', '入力欄と同じグレー（--color-field）'],
      ['内側の余白', '4px'],
      ['角', '部品の角 + 4px（16px）'],
    ],
    tokens: {
      '--toolbar-border-width': '0px',
      '--toolbar-bg': 'var(--color-field)',
      '--toolbar-padding': 'calc(var(--spacing) * 1)',
      '--toolbar-radius': 'calc(var(--radius-control) + var(--spacing) * 1)',
    },
  },
  {
    id: 'C',
    name: '下にだけ線',
    intent:
      'エディタや表の上端に貼る帯の形。角を丸めず、下にだけ細い線を引いて本文と区切る。左右と上は置いた場所の枠に任せる',
    spec: [
      ['枠線', '下だけ細い境界線'],
      ['塗り', 'なし'],
      ['内側の余白', '4px'],
      ['角', 'なし'],
    ],
    tokens: {
      '--toolbar-border-width': '0 0 var(--border-width-thin) 0',
      '--toolbar-bg': 'transparent',
      '--toolbar-padding': 'calc(var(--spacing) * 1)',
      '--toolbar-radius': '0px',
    },
  },
];

const columns: Column[] = [
  { label: '書式の帯', note: 'ボタン・ToggleGroup・Select・Menu の開く口' },
  { label: '一覧の上の操作', note: '検索の欄・枠線のボタン・色のボタン' },
  { label: '縦の帯', note: 'アイコンだけのトグルとボタン' },
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
      index={551}
      axis="ツールバーの帯の面"
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
      <p>
        決定: 帯は面なし（枠・塗り・内側の余白なし）だけにする。面が要るときは利用者が className
        で敷く（ADR-0481）
      </p>
      <p>
        Toolbar
        の帯そのものの見せ方です。帯はページと同じレイヤーなので、どの案も影は付けません（原則1）。
        囲むときの角は、中の部品の角に内側の余白を足した同心の角です（原則5）。
      </p>
      <p>
        既定を 1
        つ選び、ほかの形も選べるようにするか（variant）を教えてください。項目の間と区切りは軸
        552、ボタンの見た目は軸 554 で比べます。
      </p>
    </Comparison>
  ),
};
