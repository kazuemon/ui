import {
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  CaretDownIcon,
  QuestionIcon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TextBIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarLink,
  type ToolbarProps,
  ToolbarSeparator,
  ToolbarToggle,
} from './Toolbar';
import { ButtonGroup } from '../button-group/ButtonGroup';
import { Button } from '../button/Button';
import { Icon } from '../icon/Icon';
import { Menu } from '../menu/Menu';
import { MenuItem } from '../menu/MenuItem';
import { SearchField } from '../search-field/SearchField';
import { Select } from '../select/Select';
import { Toggle } from '../toggle/Toggle';
import { ToggleGroup } from '../toggle/ToggleGroup';
import { Tooltip } from '../tooltip/Tooltip';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';
import { statePseudo } from '../../stories/story-states';

const orientations = ['horizontal', 'vertical'] as const;
const fontSizes = ['12px', '14px', '16px', '20px'];

const meta = {
  title: 'Components/Toolbar',
  component: Toolbar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'ボタン・トグル・欄を 1 本の帯に並べます。Tab で止まるのは帯の中の 1 つだけで、帯の中は矢印キーで移ります（横の帯は左右、縦の帯は上下）。',
          '',
          '- 中には `ToolbarButton`・`ToolbarToggle`・`ToolbarLink` を置きます。見た目と props は `Button`・`Toggle`・`Link` と同じです。',
          '- いくつかのトグルから選ぶときは、`ToggleGroup` に `Toggle` を入れて、そのまま帯に置きます。',
          '- `Select`・`SearchField`（と、その本体の `SelectControl`・`SearchFieldControl`・`TextFieldControl`）は、そのまま帯に置けます。見えるラベルは置かず、`accessibleName` で名前を付け、幅は `className` で決めます。',
          '- `Menu`・`Popover` の開く口は、`ToolbarButton` を `trigger` に渡します。',
          '- 項目をまとめるときは `ToolbarGroup`、まとまりのあいだには `ToolbarSeparator` を置きます。',
          '- 入りきらないときは折り返します（`wrap`、既定 `true`）。まとまりの中は折り返さず、まとまりごと次の行へ送ります。`wrap={false}` では 1 行のまま横にスクロールします。',
          '- 押せない `ToolbarButton` も矢印キーで止まります。押せない理由を `Tooltip` で出せます。',
          '- 画面に帯が 2 つ以上あるときや、見出しが近くにないときは、`aria-label` で帯の名前を付けます。',
          '',
          '**ButtonGroup との使い分け**: `ButtonGroup` は、2〜4 個のボタンを連結して見せる並びで、ボタンごとに Tab で止まります。',
          'エディタの書式のように、操作が多く並び、キーボードで何度も行き来する場所には `Toolbar` を使います。',
          '帯の中で連結した見た目にしたいときは、`ToggleGroup`（または `ButtonGroup` の代わりに `ToolbarGroup`）を使います。',
          '`Toolbar` の中に `ButtonGroup` と素の `Button` は置きません（矢印キーの並びに入りません）。',
        ].join('\n'),
      },
    },
  },
  args: {
    orientation: 'horizontal',
    wrap: true,
    loopFocus: true,
    disabled: false,
  },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: orientations,
      table: { defaultValue: { summary: "'horizontal'" } },
    },
    wrap: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    loopFocus: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    disabled: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
  },
} satisfies Meta<ToolbarProps>;

export default meta;
type Story = StoryObj<Meta<ToolbarProps>>;

/** 文字の書式の帯（見本） */
function EditorToolbar(props: ToolbarProps) {
  return (
    <Toolbar aria-label="書式" {...props}>
      <ToolbarGroup aria-label="元に戻す・やり直す">
        <ToolbarButton iconOnly aria-label="元に戻す">
          <Icon icon={ArrowCounterClockwiseIcon} standalone />
        </ToolbarButton>
        <ToolbarButton iconOnly aria-label="やり直す" disabled>
          <Icon icon={ArrowClockwiseIcon} standalone />
        </ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToggleGroup multiple aria-label="文字の書式" defaultValue={['bold']}>
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
      <ToggleGroup aria-label="揃え" defaultValue={['left']}>
        <Toggle value="left" iconOnly aria-label="左揃え">
          <Icon icon={TextAlignLeftIcon} standalone />
        </Toggle>
        <Toggle value="center" iconOnly aria-label="中央揃え">
          <Icon icon={TextAlignCenterIcon} standalone />
        </Toggle>
        <Toggle value="right" iconOnly aria-label="右揃え">
          <Icon icon={TextAlignRightIcon} standalone />
        </Toggle>
      </ToggleGroup>
      <ToolbarSeparator />
      <Select
        accessibleName="文字の大きさ"
        items={fontSizes}
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
        <MenuItem>区切り線</MenuItem>
      </Menu>
    </Toolbar>
  );
}

export const Playground: Story = {
  name: '基本',
  render: (args) => <EditorToolbar {...args} />,
};

// 帯に置ける項目を 1 本に並べる
export const Items: Story = {
  name: '置けるもの',
  tags: ['visual'],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'ボタン・トグル・`ToggleGroup`・`Select`・検索の欄・`Menu` の開く口・リンクを、1 本の帯に並べられます。押せない項目は、押せない見た目のまま並びます。',
      },
    },
  },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-6">
      <EditorToolbar />
      <Toolbar aria-label="一覧の操作">
        <SearchField accessibleName="絞り込み" placeholder="名前で絞り込む" className="w-56" />
        <ToolbarToggle>未読だけ</ToolbarToggle>
        <ToolbarSeparator />
        <ToolbarButton variant="outline">書き出す</ToolbarButton>
        <ToolbarButton color="primary">追加</ToolbarButton>
        <ToolbarSeparator />
        <ToolbarLink href="#help" variant="text">
          ヘルプ
        </ToolbarLink>
      </Toolbar>
    </div>
  ),
};

export const Orientations: Story = {
  name: '向き',
  tags: ['visual'],
  parameters: {
    controls: { exclude: ['orientation'] },
    docs: {
      description: {
        story:
          '`horizontal`（既定）は置いた場所の幅いっぱいに伸び、左右の矢印キーで移ります。`vertical` は中身の幅に合わせ、上下の矢印キーで移ります。区切りの線は帯と逆の向きに引きます。',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap items-start gap-10">
      <Toolbar {...args} orientation="vertical" aria-label="描く道具">
        <ToggleGroup orientation="vertical" defaultValue={['left']} aria-label="揃え">
          <Toggle value="left" iconOnly aria-label="左揃え">
            <Icon icon={TextAlignLeftIcon} standalone />
          </Toggle>
          <Toggle value="center" iconOnly aria-label="中央揃え">
            <Icon icon={TextAlignCenterIcon} standalone />
          </Toggle>
          <Toggle value="right" iconOnly aria-label="右揃え">
            <Icon icon={TextAlignRightIcon} standalone />
          </Toggle>
        </ToggleGroup>
        <ToolbarSeparator />
        <ToolbarButton iconOnly aria-label="ヘルプ">
          <Icon icon={QuestionIcon} standalone />
        </ToolbarButton>
      </Toolbar>
      <div className="min-w-0 flex-1">
        <Toolbar {...args} orientation="horizontal" aria-label="書式">
          <ToolbarButton iconOnly aria-label="元に戻す">
            <Icon icon={ArrowCounterClockwiseIcon} standalone />
          </ToolbarButton>
          <ToolbarSeparator />
          <ToolbarToggle iconOnly aria-label="太字">
            <Icon icon={TextBIcon} standalone />
          </ToolbarToggle>
          <ToolbarToggle iconOnly aria-label="斜体">
            <Icon icon={TextItalicIcon} standalone />
          </ToolbarToggle>
        </Toolbar>
      </div>
    </div>
  ),
};

export const Wrapping: Story = {
  name: '入りきらないとき',
  tags: ['visual'],
  parameters: {
    controls: { exclude: ['wrap'] },
    docs: {
      description: {
        story:
          '`wrap`（既定 `true`）では次の行へ折り返します。まとまり（`ToolbarGroup`・`ToggleGroup`）の中は折り返さず、まとまりごと送ります。`wrap={false}` では 1 行のまま横にスクロールし、続きのある端に内側の影を落とします。',
      },
    },
  },
  render: (args) => (
    <Gallery columnWidth="20rem">
      <Specimen label="wrap（既定）">
        <div className="w-80">
          <EditorToolbar {...args} wrap />
        </div>
      </Specimen>
      <Specimen label="wrap={false}">
        <div className="w-80">
          <EditorToolbar {...args} wrap={false} />
        </div>
      </Specimen>
    </Gallery>
  ),
};

export const Disabled: Story = {
  name: '押せないとき',
  tags: ['visual'],
  parameters: {
    controls: { exclude: ['disabled'] },
    docs: {
      description: {
        story:
          '帯の `disabled` は、中の項目をすべて押せなくします。押せない `ToolbarButton` は矢印キーで止まり、押せない理由を `Tooltip` で出せます。押せないトグルと欄は、矢印キーで飛ばします。',
      },
    },
  },
  render: (args) => (
    <div className="flex max-w-3xl flex-col gap-6">
      <EditorToolbar {...args} disabled />
      <Toolbar aria-label="公開">
        <ToolbarButton>下書きに保存</ToolbarButton>
        <Tooltip content="タイトルを入れると公開できます">
          <ToolbarButton color="primary" disabled>
            公開する
          </ToolbarButton>
        </Tooltip>
      </Toolbar>
    </div>
  ),
};

export const Focus: Story = {
  name: 'フォーカス',
  tags: ['visual'],
  parameters: {
    controls: { disable: true },
    pseudo: statePseudo({ focusVisible: '[data-slot="toolbar-button"]:first-child' }),
    docs: {
      description: {
        story:
          '帯の端の項目にキーボードで止まったときも、フォーカスの線は帯の枠の内側に収まります。',
      },
    },
  },
  render: () => (
    <div data-preview="focus" className="max-w-md">
      <Toolbar aria-label="記録">
        <ToolbarButton>記録する</ToolbarButton>
        <ToolbarButton variant="outline">取り消す</ToolbarButton>
      </Toolbar>
    </div>
  ),
};

export const Densities: Story = {
  name: '密度',
  tags: ['visual'],
  render: (args) => (
    <DensityPair>
      <div className="w-[34rem] max-w-full">
        <EditorToolbar {...args} />
      </div>
    </DensityPair>
  ),
};

export const VersusButtonGroup: Story = {
  name: 'ButtonGroup との違い',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '上の `ButtonGroup` は、ボタンごとに Tab で止まります。下の `Toolbar` は、Tab で帯に入ったあと、矢印キーで移ります。操作が多く並ぶ場所では `Toolbar` を使います。',
      },
    },
  },
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <ButtonGroup aria-label="編集（ButtonGroup）">
        <Button variant="outline">切り取り</Button>
        <Button variant="outline">コピー</Button>
        <Button variant="outline">貼り付け</Button>
      </ButtonGroup>
      <Toolbar aria-label="編集（Toolbar）" className="w-fit">
        <ToolbarButton variant="outline">切り取り</ToolbarButton>
        <ToolbarButton variant="outline">コピー</ToolbarButton>
        <ToolbarButton variant="outline">貼り付け</ToolbarButton>
      </Toolbar>
    </div>
  ),
};

// play: 読み上げとキーボードの確かめ
export const Keyboard: Story = {
  name: '矢印キーで移る',
  parameters: { controls: { disable: true } },
  render: () => {
    const onUndo = fn();
    return (
      <div className="flex max-w-3xl flex-col gap-4">
        <button type="button">前の要素</button>
        <EditorToolbar />
        <Toolbar aria-label="記録">
          <ToolbarButton onClick={onUndo} data-testid="undo">
            記録する
          </ToolbarButton>
        </Toolbar>
      </div>
    );
  },
  play: async ({ canvas, step }) => {
    const toolbar = canvas.getByRole('toolbar', { name: '書式' });
    const bar = within(toolbar);
    await expect(toolbar).toHaveAttribute('aria-orientation', 'horizontal');

    await step('Tab で入るのは帯の中の 1 つだけ', async () => {
      await userEvent.click(canvas.getByRole('button', { name: '前の要素' }));
      await userEvent.tab();
      await expect(bar.getByRole('button', { name: '元に戻す' })).toHaveFocus();
      await userEvent.tab();
      // 帯を抜けて、次の帯へ
      await expect(canvas.getByRole('button', { name: '記録する' })).toHaveFocus();
      await userEvent.tab({ shift: true });
      await expect(bar.getByRole('button', { name: '元に戻す' })).toHaveFocus();
    });

    await step('押せないボタンにも矢印キーで止まり、押しても何もしない', async () => {
      await userEvent.keyboard('{ArrowRight}');
      const redo = bar.getByRole('button', { name: 'やり直す' });
      await expect(redo).toHaveFocus();
      await expect(redo).toHaveAttribute('aria-disabled', 'true');
      await expect(redo).not.toHaveAttribute('disabled');
    });

    await step('ToggleGroup のトグルも同じ並びに入る', async () => {
      await userEvent.keyboard('{ArrowRight}');
      const bold = bar.getByRole('button', { name: '太字' });
      await expect(bold).toHaveFocus();
      await expect(bold).toHaveAttribute('aria-pressed', 'true');
      await userEvent.keyboard('{ArrowRight}');
      await userEvent.keyboard(' ');
      await expect(bar.getByRole('button', { name: '斜体' })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    });

    await step('Select の本体も並びに入る', async () => {
      // 斜体 → 下線 → 左揃え → 中央揃え → 右揃え → 文字の大きさ
      await userEvent.keyboard('{ArrowRight>5/}');
      await expect(bar.getByRole('combobox', { name: '文字の大きさ' })).toHaveFocus();
    });

    await step('Menu の開く口から一覧を開ける', async () => {
      await userEvent.keyboard('{ArrowRight}');
      const insert = bar.getByRole('button', { name: /挿入/ });
      await expect(insert).toHaveAttribute('aria-haspopup', 'menu');
      await userEvent.keyboard('{Enter}');
      await waitFor(() =>
        expect(within(document.body).getByRole('menuitem', { name: '画像' })).toBeVisible()
      );
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(insert).toHaveFocus());
    });

    await step('端で回る（loopFocus）', async () => {
      await userEvent.keyboard('{ArrowRight}');
      await expect(bar.getByRole('button', { name: '元に戻す' })).toHaveFocus();
    });
  },
};

export const SearchInToolbar: Story = {
  name: '欄の中の矢印キー',
  parameters: { controls: { disable: true } },
  render: () => (
    <Toolbar aria-label="一覧の操作" className="max-w-xl">
      <ToolbarButton>すべて選ぶ</ToolbarButton>
      <SearchField accessibleName="絞り込み" defaultValue="ab" className="w-56" />
      <ToolbarButton>書き出す</ToolbarButton>
    </Toolbar>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole<HTMLInputElement>('searchbox', { name: '絞り込み' });
    await userEvent.click(canvas.getByRole('button', { name: 'すべて選ぶ' }));
    await userEvent.keyboard('{ArrowRight}');
    await expect(input).toHaveFocus();
    // 文字の途中では、左右の矢印キーは文字の中を動く
    input.setSelectionRange(1, 1);
    await userEvent.keyboard('{ArrowRight}');
    await expect(input).toHaveFocus();
    // 文字の端まで来たら、隣の項目へ移る
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('button', { name: '書き出す' })).toHaveFocus();
  },
};
