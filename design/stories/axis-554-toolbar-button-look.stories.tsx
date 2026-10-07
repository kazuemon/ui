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
import {
  Toolbar,
  ToolbarButton,
  type ToolbarButtonProps,
  ToolbarSeparator,
} from '../../src/components/toolbar/Toolbar';

// 軸 554: ツールバーの中のボタンの既定の見た目
const meta = {
  title: 'Design Review/554 ツールバーの中のボタンの既定の見た目',
  id: 'design-review-554-toolbar-button-look',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A' },
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

const variants = {
  現行版: 'filled',
  A: 'underline',
  B: 'outline',
} as const;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'グレーの塗り（Button の既定）',
    intent:
      'ToolbarButton の既定を Button と同じ filled（グレーの塗りと薄い影）にする。トグルの OFF（平らなグレー）と並ぶと、ボタンだけが少し浮いて見える',
    spec: [['ToolbarButton の variant', 'filled']],
  },
  {
    id: 'A',
    name: '塗りも枠線もない（underline）',
    intent:
      '既定を underline にする。アイコンだけのボタンは線のない平らな形で、hover で淡く敷く。文字のボタンには淡い下線が付く。エディタの帯でよく見る軽さ',
    spec: [['ToolbarButton の variant', 'underline']],
  },
  {
    id: 'B',
    name: '枠線（outline）',
    intent:
      '既定を outline にする。帯の枠の中に枠線のボタンが並ぶ。トグルの OFF のグレーとは形で見分ける',
    spec: [['ToolbarButton の variant', 'outline']],
  },
];

const columns: Column[] = [
  { label: '書式の帯', note: 'アイコンのボタン・トグル・Select・文字のボタン' },
  { label: '一覧の上の操作', note: '色を指定したボタンは variant を変えない' },
  { label: '縦の帯', note: 'アイコンだけ' },
];

type ButtonVariant = ToolbarButtonProps['variant'];

const sizes = ['12px', '14px', '16px', '20px'];

function Formatting({ variant }: { variant: ButtonVariant }) {
  return (
    <Toolbar aria-label="書式">
      <ToolbarButton variant={variant} iconOnly aria-label="元に戻す">
        <Icon icon={ArrowCounterClockwiseIcon} standalone />
      </ToolbarButton>
      <ToolbarButton variant={variant} iconOnly aria-label="やり直す">
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
          <ToolbarButton variant={variant}>
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

function ListActions({ variant }: { variant: ButtonVariant }) {
  return (
    <Toolbar aria-label="一覧の操作">
      <SearchField accessibleName="絞り込み" placeholder="名前で絞り込む" className="w-48" />
      <ToolbarSeparator />
      <ToolbarButton variant={variant}>書き出す</ToolbarButton>
      <ToolbarButton color="primary">追加</ToolbarButton>
    </Toolbar>
  );
}

function Vertical({ variant }: { variant: ButtonVariant }) {
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
      <ToolbarButton variant={variant} iconOnly aria-label="元に戻す">
        <Icon icon={ArrowCounterClockwiseIcon} standalone />
      </ToolbarButton>
    </Toolbar>
  );
}

export const Default: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={554}
      axis="ツールバーの中のボタンの既定の見た目"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const variant = variants[candidate.id as keyof typeof variants];
        if (column.label === '書式の帯')
          return (
            <div className="w-[34rem]">
              <Formatting variant={variant} />
            </div>
          );
        if (column.label === '一覧の上の操作')
          return (
            <div className="w-[26rem]">
              <ListActions variant={variant} />
            </div>
          );
        return <Vertical variant={variant} />;
      }}
    >
      <p>
        決定: ToolbarButton の既定は
        underline。トグルもオフは平ら・オンだけ色が付く見た目を選べる（ADR-0484）
      </p>
      <p>
        ToolbarButton に variant を渡さないときの見た目です。どの案でも、ボタンごとに variant
        を渡して変えられます。トグル（ToggleGroup・ToolbarToggle）の OFF
        はどの案でもグレーの平らな塗りのままです。
      </p>
      <p>帯の面はどの案も現行版（細い線の枠）です。</p>
    </Comparison>
  ),
};
