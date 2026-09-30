import { KanbanIcon, TableIcon, CalendarBlankIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import {
  SegmentedControl,
  type SegmentedControlControlProps,
  SegmentedControlItem,
  type SegmentedControlProps,
} from './SegmentedControl';
import { DensityPair, Matrix } from '../../stories/story-parts';
import { type StateColumn, statePseudo } from '../../stories/story-states';
import { Fieldset } from '../fieldset/Fieldset';
import { Icon } from '../icon/Icon';

const colors = ['neutral', 'primary', 'secondary'] as const;
const variants = ['surface', 'filled', 'soft'] as const;

type Args = SegmentedControlProps<string>;

const meta = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl<string>,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '必ずどれか 1 つを選ぶ切り替えです。グレーの溝の中に項目を並べ、選んだ項目の下地（つまみ）がそこへ滑って移ります。一覧の表示（ボード・表）や、期間（日・週・月）の切り替えに使います。',
          '',
          '- 中には `SegmentedControlItem` を `value` 付きで並べます。選んでいる value が `value`（`defaultValue`）です。はじめからどれかを選んでおきます。',
          '- 選んでいる項目をもう一度押しても外れず、値は空になりません。矢印キーで移ると、移った項目を選びます。',
          '- 押して外せる・いくつも押せる並び（文字の太字・斜体など）には `ToggleGroup` を使います。下に中身（パネル）を切り替えて出すときは `Tabs` を使います。',
          '- 見える見出しを置かないときは、`accessibleName` で読み上げの名前を付けます。見出しは `label`、補足は `caption` です。',
          '- つまみの面は `variant` で選びます。`surface`（既定）は白い面と薄い影、`filled` は部品の色の濃い塗り、`soft` は部品の色の淡い面です。色は `color`（既定 `neutral`）です。',
          '- 形は `shape`（既定 `square` は入力欄・ボタンと同じ角、`circle` は両端が丸い形）、項目の幅は `itemWidth`（既定 `equal` は均等、`fit` は文字に合わせる）、溝の見せ方は `frame`（既定 `field` は入力欄のグレー、`outline` は細い境界線で囲む）で選びます。項目のあいだに仕切りの線を引くときは `showDivider` を付けます。',
          '- つまみの動きは `indicatorMotion` で選びます。`slide`（既定）は滑って移り、`none` はすぐ切り替えます。動きを減らす設定では動かしません。',
        ].join('\n'),
      },
    },
  },
  args: {
    accessibleName: '表示',
    defaultValue: 'board',
    color: 'neutral',
    variant: 'surface',
    shape: 'square',
    itemWidth: 'equal',
    frame: 'field',
    showDivider: false,
    indicatorMotion: 'slide',
    disabled: false,
    readOnly: false,
    onValueChange: fn(),
    children: null,
  },
  argTypes: {
    color: {
      control: 'inline-radio',
      options: colors,
      table: { defaultValue: { summary: "'neutral'" } },
    },
    variant: {
      control: 'inline-radio',
      options: variants,
      table: { defaultValue: { summary: "'surface'" } },
    },
    shape: {
      control: 'inline-radio',
      options: ['square', 'circle'],
      table: { defaultValue: { summary: "'square'" } },
    },
    itemWidth: {
      control: 'inline-radio',
      options: ['equal', 'fit'],
      table: { defaultValue: { summary: "'equal'" } },
    },
    frame: {
      control: 'inline-radio',
      options: ['field', 'outline'],
      table: { defaultValue: { summary: "'field'" } },
    },
    showDivider: { control: 'boolean' },
    indicatorMotion: {
      control: 'inline-radio',
      options: ['slide', 'none'],
      table: { defaultValue: { summary: "'slide'" } },
    },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    children: { control: false },
  },
} satisfies Meta<typeof SegmentedControl<string>>;

export default meta;
type Story = StoryObj<typeof meta>;

function ViewItems() {
  return (
    <>
      <SegmentedControlItem value="board">ボード</SegmentedControlItem>
      <SegmentedControlItem value="table">表</SegmentedControlItem>
      <SegmentedControlItem value="calendar">カレンダー</SegmentedControlItem>
    </>
  );
}

// label と accessibleName はどちらか一方の型（FieldNamed）なので、args から外し、見本ごとに付け直す
function withoutName({ label: _label, accessibleName: _name, children: _children, ...rest }: Args) {
  return rest;
}

function Segmented(args: Args) {
  return (
    <SegmentedControl<string> {...withoutName(args)} accessibleName={args.accessibleName ?? '表示'}>
      <ViewItems />
    </SegmentedControl>
  );
}

export const Playground: Story = {
  name: '基本',
  render: (args) => <Segmented {...args} />,
};

export const Variants: Story = {
  name: 'つまみの面と色',
  tags: ['visual'],
  parameters: {
    controls: { exclude: ['color', 'variant'] },
    docs: {
      description: {
        story:
          '`surface`（既定）は白い面と薄い影で、`color` は選んだ項目の文字に出ます。`filled` は部品の色の濃い塗り、`soft` は部品の色の淡い面です。',
      },
    },
  },
  render: (args) => (
    <Matrix
      rows={colors}
      columns={variants.map((variant) => ({ label: variant, variant }))}
      columnWidth="18rem"
      rowLabel={(color) => color}
      renderCell={(color, column) => <Segmented {...args} color={color} variant={column.variant} />}
    />
  ),
};

const shapeRows: {
  label: string;
  props: Pick<
    SegmentedControlControlProps<string>,
    'shape' | 'itemWidth' | 'frame' | 'showDivider'
  >;
}[] = [
  { label: '既定', props: {} },
  { label: 'shape="circle"', props: { shape: 'circle' } },
  { label: 'itemWidth="fit"', props: { itemWidth: 'fit' } },
  { label: 'frame="outline"', props: { frame: 'outline' } },
  { label: 'showDivider', props: { showDivider: true } },
];

export const Shapes: Story = {
  name: '形',
  tags: ['visual'],
  parameters: {
    controls: { exclude: ['shape', 'itemWidth', 'frame', 'showDivider'] },
    docs: {
      description: {
        story:
          '既定は入力欄・ボタンと同じ角（`shape="square"`）、均等な幅（`itemWidth="equal"`）、入力欄のグレーの溝（`frame="field"`）で、仕切りの線はありません。`shape="circle"` は両端が丸い形、`itemWidth="fit"` は項目ごとに文字の幅、`frame="outline"` は塗らずに細い境界線で囲む溝です。`showDivider` は選んでいない項目どうしのあいだに線を引きます。カードやサイドバーなどグレーの地に置くときは、溝が地に溶けるので `frame="outline"` を使います。',
      },
    },
  },
  render: (args) => (
    <Matrix
      rows={shapeRows}
      columns={[{ label: 'surface' }, { label: 'filled', variant: 'filled' as const }]}
      columnWidth="20rem"
      rowLabel={(row) => row.label}
      renderCell={(row, column) => (
        <SegmentedControl<string>
          {...withoutName(args)}
          {...row.props}
          variant={column.variant ?? 'surface'}
          color={column.variant ? 'primary' : 'neutral'}
          accessibleName="絞り込み"
          defaultValue="unread"
        >
          <SegmentedControlItem value="all">すべて</SegmentedControlItem>
          <SegmentedControlItem value="unread">未読</SegmentedControlItem>
          <SegmentedControlItem value="flagged">フラグ付き</SegmentedControlItem>
          <SegmentedControlItem value="trash">ゴミ箱</SegmentedControlItem>
        </SegmentedControl>
      )}
    />
  ),
};

const stateColumns: StateColumn[] = [
  { label: '通常' },
  { label: 'hover（表）', state: 'hover' },
  { label: '押下（表）', state: 'active' },
  { label: 'フォーカス（キーボード）', state: 'focus' },
  { label: '押せない', disabled: true },
];

export const States: Story = {
  name: '状態',
  tags: ['visual'],
  parameters: {
    controls: { exclude: ['disabled'] },
    pseudo: statePseudo({
      hover: '[data-slot="segmented-control-item"]:not([data-checked])',
      active: '[data-slot="segmented-control-item"]:not([data-checked])',
      focusVisible: '[data-slot="segmented-control-item"][data-checked]',
    }),
  },
  render: (args) => (
    <Matrix
      rows={['surface', 'filled'] as const}
      columns={stateColumns}
      columnWidth="12rem"
      rowLabel={(variant) => variant}
      renderCell={(variant, column) => (
        <SegmentedControl<string>
          {...withoutName(args)}
          variant={variant}
          color="primary"
          accessibleName="表示"
          disabled={column.disabled}
        >
          <SegmentedControlItem value="board">ボード</SegmentedControlItem>
          <SegmentedControlItem value="table">表</SegmentedControlItem>
        </SegmentedControl>
      )}
    />
  ),
};

export const Field: Story = {
  name: '見出しと説明',
  tags: ['visual'],
  parameters: {
    docs: {
      description: {
        story:
          'フォームの中では、ほかの入力欄と同じく見出し（`label`）・補足（`caption`）・状態の文（`errorText` など）を付けられます。`name` を付けると、選んだ値がフォームで送られます。読み取り専用（`readOnly`）と押せない（`disabled`）は同じ見た目で、読み取り専用はフォーカスでき、値が送られます。',
      },
    },
  },
  render: (args) => (
    <div className="flex w-[360px] flex-col gap-8">
      <SegmentedControl<string>
        {...withoutName(args)}
        label="配送の速さ"
        caption="お急ぎ便は翌日に届きます"
        name="speed"
        defaultValue="normal"
      >
        <SegmentedControlItem value="normal">通常</SegmentedControlItem>
        <SegmentedControlItem value="express">お急ぎ便</SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl<string>
        {...withoutName(args)}
        label="配送の速さ"
        errorText="この地域にはお急ぎ便で届けられません"
        defaultValue="express"
      >
        <SegmentedControlItem value="normal">通常</SegmentedControlItem>
        <SegmentedControlItem value="express">お急ぎ便</SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl<string>
        {...withoutName(args)}
        label="配送の速さ"
        readOnly
        defaultValue="normal"
      >
        <SegmentedControlItem value="normal">通常</SegmentedControlItem>
        <SegmentedControlItem value="express">お急ぎ便</SegmentedControlItem>
      </SegmentedControl>
    </div>
  ),
};

export const Icons: Story = {
  name: 'アイコン',
  tags: ['visual'],
  parameters: {
    docs: {
      description: {
        story:
          '`icon` で文字の前にアイコンを置けます。アイコンだけの項目には、`aria-label` で読み上げの名前を付け、アイコンに `standalone` を付けます。1 つの項目だけ押せなくするときは、項目に `disabled` を付けます。',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col items-start gap-6">
      <SegmentedControl<string> {...withoutName(args)} accessibleName="表示" defaultValue="board">
        <SegmentedControlItem value="board" icon={<Icon icon={KanbanIcon} />}>
          ボード
        </SegmentedControlItem>
        <SegmentedControlItem value="table" icon={<Icon icon={TableIcon} />}>
          表
        </SegmentedControlItem>
        <SegmentedControlItem value="calendar" icon={<Icon icon={CalendarBlankIcon} />} disabled>
          カレンダー
        </SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl<string> {...withoutName(args)} accessibleName="表示" defaultValue="board">
        <SegmentedControlItem value="board" aria-label="ボード">
          <Icon icon={KanbanIcon} standalone />
        </SegmentedControlItem>
        <SegmentedControlItem value="table" aria-label="表">
          <Icon icon={TableIcon} standalone />
        </SegmentedControlItem>
      </SegmentedControl>
    </div>
  ),
};

const tasks = [
  { title: '見本のページを直す', status: '進行中' },
  { title: 'README を整える', status: '未着手' },
  { title: 'リリースノートを書く', status: '完了' },
];

function ViewSwitch() {
  const [view, setView] = useState('board');
  return (
    <div className="flex w-[480px] flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold">タスク</h2>
        <SegmentedControl<string> accessibleName="表示" value={view} onValueChange={setView}>
          <SegmentedControlItem value="board" icon={<Icon icon={KanbanIcon} />}>
            ボード
          </SegmentedControlItem>
          <SegmentedControlItem value="table" icon={<Icon icon={TableIcon} />}>
            表
          </SegmentedControlItem>
        </SegmentedControl>
      </div>
      {view === 'board' ? (
        <div className="grid grid-cols-3 gap-3">
          {['未着手', '進行中', '完了'].map((status) => (
            <div key={status} className="flex flex-col gap-2 rounded-card bg-field p-3">
              <p className="text-sm font-bold">{status}</p>
              {tasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <p key={task.title} className="rounded-control bg-surface p-2 text-sm">
                    {task.title}
                  </p>
                ))}
            </div>
          ))}
        </div>
      ) : (
        <table className="text-sm">
          <tbody>
            {tasks.map((task) => (
              <tr key={task.title} className="border-b border-line">
                <td className="py-2">{task.title}</td>
                <td className="py-2 text-fg-muted">{task.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export const ViewSwitching: Story = {
  name: '表示の切り替え',
  parameters: {
    docs: {
      description: {
        story: [
          '一覧をボードで見るか表で見るかのように、同じ中身の見せ方を切り替えるときに使います。値は空にならないので、選んでいない状態を扱わずに済みます。',
          '',
          '見出しの行の右端に置き、`accessibleName` で「表示」などの名前を付けます。切り替えた中身がタブのように別の内容になるときは `Tabs` を使います。',
        ].join('\n'),
      },
      source: {
        code: [
          "const [view, setView] = useState('board');",
          '',
          '<SegmentedControl accessibleName="表示" value={view} onValueChange={setView}>',
          '  <SegmentedControlItem value="board" icon={<Icon icon={KanbanIcon} />}>ボード</SegmentedControlItem>',
          '  <SegmentedControlItem value="table" icon={<Icon icon={TableIcon} />}>表</SegmentedControlItem>',
          '</SegmentedControl>',
          "{view === 'board' ? <Board /> : <TaskTable />}",
        ].join('\n'),
        language: 'tsx',
      },
    },
  },
  render: () => <ViewSwitch />,
};

export const Densities: Story = {
  name: '密度',
  tags: ['visual'],
  render: (args) => (
    <DensityPair>
      <Segmented {...args} />
    </DensityPair>
  ),
};

// play: 読み上げと値の確かめ
export const Accessibility: Story = {
  name: '読み上げ',
  render: (args) => <Segmented {...args} />,
  play: async ({ args, canvas, canvasElement }) => {
    const group = canvas.getByRole('radiogroup', { name: '表示' });
    const board = canvas.getByRole('radio', { name: 'ボード' });
    const table = canvas.getByRole('radio', { name: '表' });
    const calendar = canvas.getByRole('radio', { name: 'カレンダー' });
    await expect(group).toBeVisible();
    await expect(board).toHaveAttribute('aria-checked', 'true');

    // 押すと選び、つまみがその項目へ移る
    const root = canvasElement.querySelector<HTMLElement>('[data-slot="segmented-control"]')!;
    const before = root.style.getPropertyValue('--segmented-control-knob-x');
    await userEvent.click(table);
    await expect(table).toHaveAttribute('aria-checked', 'true');
    await expect(board).toHaveAttribute('aria-checked', 'false');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('table');
    await waitFor(() =>
      expect(root.style.getPropertyValue('--segmented-control-knob-x')).not.toBe(before)
    );

    // つまみは滑って移る（indicatorMotion="slide" の既定）
    const knob = root.querySelector<HTMLElement>('[data-slot="segmented-control-knob"]')!;
    await expect(getComputedStyle(knob).transitionProperty).toContain('left');
    await expect(getComputedStyle(knob).transitionDuration).not.toMatch(/^0s/);

    // 選んでいる項目をもう一度押しても外れない（空にならない）
    await userEvent.click(table);
    await expect(table).toHaveAttribute('aria-checked', 'true');

    // 矢印キーで移ると、移った項目を選ぶ
    await userEvent.keyboard('{ArrowRight}');
    await expect(calendar).toHaveFocus();
    await expect(calendar).toHaveAttribute('aria-checked', 'true');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('calendar');
  },
};

const deliveryError = 'お急ぎ便と置き配は、一緒に選べません';

export const InFieldset: Story = {
  name: 'Fieldset の中',
  tags: ['visual'],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Fieldset の中に置くと、Fieldset の `disabled` でまとめて押せなくなります。まとまりの `errorText` では溝がエラーの淡い赤になり、エラーの文はグループの説明としても読み上げます。',
      },
    },
  },
  render: () => (
    <div className="flex w-[360px] flex-col gap-10">
      <Fieldset label="配送" errorText={deliveryError}>
        <SegmentedControl<string> label="配送の速さ" defaultValue="express">
          <SegmentedControlItem value="normal">通常</SegmentedControlItem>
          <SegmentedControlItem value="express">お急ぎ便</SegmentedControlItem>
        </SegmentedControl>
        <SegmentedControl<string> label="受け取り方" defaultValue="drop">
          <SegmentedControlItem value="hand">手渡し</SegmentedControlItem>
          <SegmentedControlItem value="drop">置き配</SegmentedControlItem>
        </SegmentedControl>
      </Fieldset>
      <Fieldset label="配送（発送の準備に入りました）" disabled>
        <SegmentedControl<string> label="配送の速さ" defaultValue="normal">
          <SegmentedControlItem value="normal">通常</SegmentedControlItem>
          <SegmentedControlItem value="express">お急ぎ便</SegmentedControlItem>
        </SegmentedControl>
      </Fieldset>
    </div>
  ),
  play: async ({ canvas }) => {
    const [invalidSet, disabledSet] = canvas.getAllByRole('group', { name: /^配送/ });
    if (!invalidSet || !disabledSet) throw new Error('まとまりがありません');

    // まとまりのエラー: 溝はエラーの見た目になり、エラーの文がグループの説明につながる
    for (const group of within(invalidSet).getAllByRole('radiogroup')) {
      await expect(group).toHaveAttribute('data-invalid');
      await expect(group).toHaveAccessibleDescription(deliveryError);
    }

    // まとまりの disabled: 項目が押せない。押しても選び直さない
    const disabled = within(disabledSet);
    for (const radio of disabled.getAllByRole('radio')) {
      await expect(radio).toHaveAttribute('aria-disabled', 'true');
    }
    const express = disabled.getByRole('radio', { name: 'お急ぎ便' });
    await userEvent.click(express, { pointerEventsCheck: 0 });
    await expect(express).not.toBeChecked();
  },
};
