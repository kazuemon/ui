import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { CaretDownIcon } from '@phosphor-icons/react';

import { DatePicker, type DatePickerProps } from './DatePicker';
import { Fieldset } from '../fieldset/Fieldset';
import { Icon } from '../icon/Icon';
import { Temporal } from '../../internal/date/plain-date';
import { DensityPair, Matrix } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';

type Sample = MatrixColumn & { name: string; props: Partial<DatePickerProps> };

const day = Temporal.PlainDate.from('2026-09-20');
const today = Temporal.PlainDate.from('2026-09-30');

const stateRows: Sample[] = [
  { label: '空', name: '空', props: {} },
  { label: '値あり', name: '値あり', props: { defaultValue: day } },
  {
    label: 'エラー',
    name: 'エラー',
    props: { defaultValue: day, errorText: '平日を選んでください' },
  },
  { label: '押せない', name: '押せない', props: { defaultValue: day, disabled: true } },
  { label: '読み取り専用', name: '読み取り専用', props: { defaultValue: day, readOnly: true } },
];

const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: 'フォーカス', state: 'focus' },
];

const variants = ['field', 'button'] as const;
const colors = ['neutral', 'primary', 'secondary'] as const;

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '日付を選ぶ欄です。年・月・日を打ち込むことも、右端のボタンで開くカレンダーから選ぶこともできます。ラベル・キャプション・状態の文などは DateField と同じです。',
          '',
          '- 打ち込みは DateField と同じです。「2026/09/20」「令和8年9月20日」のような文字の貼り付けや、全角の数字も読みます。',
          '- 右端のボタンでカレンダーを開きます。日を選ぶと欄に入り、カレンダーは閉じます。Esc で閉じると、フォーカスはボタンに戻ります。',
          '- `variant="button"` は、打てない表示だけのボタンです。押すとカレンダーを開きます。選んだ日の書き方は `dateStyle`・`format`、空のときの文字は `placeholder` で決めます。印は右端の暦が既定で、`iconPlacement="start"` で値の前に置けます。Select とそろえて ▼ にするときは `icon` に渡します。',
          '- `min`・`max`・`isDateDisabled` で選べる日を絞ります。カレンダーでは押せなくなり、打ち込んだ日が範囲の外なら欄をエラーの見た目にします。',
          '- カレンダーの下には、今日を選ぶ幅いっぱいのボタンを出します。要らないときは `showTodayButton={false}` で外します。',
          '- `clearable` で、値を消すボタンを出します。',
          '- 読み取り専用では、カレンダーを開くボタンを出しません。',
          '- 指で操作していて画面が狭いときは、カレンダーを画面の下から出すシートにします（`presentation`）。',
          '- 値は `Temporal.PlainDate` で受け渡します。`name` を渡すと、フォームには「2026-09-20」の形で送ります。',
        ].join('\n'),
      },
    },
  },
  args: {
    label: '予約日',
    variant: 'field',
    color: 'neutral',
    disabled: false,
    readOnly: false,
    showTodayButton: true,
    clearable: false,
    today,
  },
  argTypes: {
    label: { control: 'text' },
    caption: { control: 'text' },
    errorText: { control: 'text' },
    placeholder: { control: 'text' },
    variant: {
      control: 'inline-radio',
      options: variants,
      table: { defaultValue: { summary: "'field'" } },
    },
    iconPlacement: {
      control: 'inline-radio',
      options: ['end', 'start'],
      table: { defaultValue: { summary: "'end'" } },
    },
    color: {
      control: 'inline-radio',
      options: colors,
      table: { defaultValue: { summary: "'neutral'" } },
    },
    dateStyle: { control: 'inline-radio', options: ['medium', 'long', 'full'] },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    showTodayButton: { control: 'boolean' },
    clearable: { control: 'boolean' },
    value: { control: false },
    defaultValue: { control: false },
    min: { control: false },
    max: { control: false },
    today: { control: false },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  args: { caption: '来店する日を選んでください' },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
};

export const States: Story = {
  tags: ['visual'],
  name: '状態',
  parameters: {
    controls: { exclude: ['variant'] },
    pseudo: {
      ...statePseudo({
        hover: '[data-slot="control"]:not([data-disabled] *, :disabled)',
        focusWithin: '[data-slot="control"]:not([data-disabled] *, :disabled)',
      }),
      focus: [
        '[data-preview="focus"] [data-slot="control"]:not([data-disabled] *, :disabled) [data-segment="year"]',
      ],
    },
    docs: {
      description: {
        story:
          '上の 5 行が打ち込める欄（既定）、下の 5 行が `variant="button"` です。読み取り専用では、カレンダーを開くボタンを出しません。',
      },
      source: sourceCode(`
        <DatePicker label="予約日" />
        <DatePicker label="予約日" defaultValue={Temporal.PlainDate.from('2026-09-20')} />
        <DatePicker label="予約日" variant="button" />
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={variants.flatMap((variant) =>
        stateRows.map((row) => ({ ...row, label: `${variant}・${row.name}`, variant }))
      )}
      rowLabel={(row) => row.label}
      columns={stateColumns}
      columnWidth="15rem"
      renderCell={(row) => <DatePicker {...args} {...row.props} variant={row.variant} />}
    />
  ),
};

// 開いた面。play でボタンを押して開いたあとの姿を撮る
export const Open: Story = {
  tags: ['visual'],
  name: '開いた状態',
  args: { defaultValue: day },
  parameters: {
    docs: {
      description: {
        story:
          'カレンダーは欄の左端にそろえて、下に浮かべます。開いているあいだ、欄はフォーカス中と同じ見た目のままです。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'カレンダーを開く' }));
    const page = within(canvasElement.ownerDocument.body);
    const dialog = await page.findByRole('dialog', { name: '予約日' });
    // 選んだ日へフォーカスが移る
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: /2026年9月20日/ })).toHaveFocus()
    );
  },
};

export const TodayButton: Story = {
  tags: ['visual'],
  name: '「今日」のボタン',
  args: { defaultOpen: true },
  parameters: {
    docs: {
      description: {
        story:
          'カレンダーの下に、今日を選ぶ幅いっぱいのボタンを出します。押すと今日が欄に入り、カレンダーは閉じます。今日が選べない日（`min`・`max` の外）なら、押せなくなります。`showTodayButton={false}` で外せます。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
};

// variant="button" の印の置き方（右端の暦が既定。値の前・▼ も選べる）
const buttonIcons: (MatrixColumn & { props: Partial<DatePickerProps> })[] = [
  { label: '右端に暦（既定）', props: {} },
  { label: '値の前に暦', props: { iconPlacement: 'start' } },
  { label: '右端に ▼', props: { icon: <Icon icon={CaretDownIcon} /> } },
];

export const ButtonIcons: Story = {
  tags: ['visual'],
  name: 'ボタンの印',
  args: { variant: 'button' },
  parameters: {
    controls: { exclude: ['variant', 'iconPlacement'] },
    docs: {
      description: {
        story:
          '`variant="button"` の印は、右端の暦が既定です。`iconPlacement="start"` で値の前に置けます。Select とそろえて ▼ にするときは、`icon` に `<Icon icon={CaretDownIcon} />` を渡します。',
      },
      source: sourceCode(`
        <DatePicker label="予約日" variant="button" />
        <DatePicker label="予約日" variant="button" iconPlacement="start" />
        <DatePicker label="予約日" variant="button" icon={<Icon icon={CaretDownIcon} />} />
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={buttonIcons}
      rowLabel={(row) => row.label}
      columns={[{ label: '空' }, { label: '値あり' }]}
      columnWidth="15rem"
      renderCell={(row, column) => (
        <DatePicker
          {...args}
          {...row.props}
          defaultValue={column.label === '値あり' ? day : undefined}
        />
      )}
    />
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  args: { caption: '来店する日を選んでください', defaultValue: day },
  render: (args) => (
    <DensityPair>
      <div className="flex w-72 flex-col gap-4">
        <DatePicker {...args} />
        <DatePicker {...args} variant="button" />
      </div>
    </DensityPair>
  ),
};

// 打ち込み・カレンダー・消去の確かめ
// 値は文字（ISO 8601）にして記録する。Temporal の値どうしは、expect で中身を比べられないため
const fieldChange = fn();

function FieldExample() {
  const [value, setValue] = useState<Temporal.PlainDate | null>(null);
  return (
    <form className="flex max-w-sm flex-col gap-3">
      <DatePicker
        label="予約日"
        name="date"
        today={today}
        clearable
        value={value}
        onValueChange={(next) => {
          setValue(next);
          fieldChange(next?.toString() ?? null);
        }}
      />
      <output className="text-caption text-fg-subtle">値: {value?.toString() ?? 'null'}</output>
    </form>
  );
}

export const Interaction: Story = {
  name: '打ち込みとカレンダー',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '打ち込んだ日はカレンダーを開くとその月で出ます。カレンダーで日を選ぶと欄に入り、カレンダーは閉じてフォーカスはボタンに戻ります。',
      },
    },
  },
  render: () => <FieldExample />,
  play: async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const group = canvas.getByRole('group', { name: '予約日' });
    const [year] = within(group).getAllByRole('spinbutton');
    await userEvent.click(year);
    await userEvent.keyboard('20261005');
    await expect(fieldChange).toHaveBeenLastCalledWith('2026-10-05');

    // カレンダーを開くと、打ち込んだ日の月で出て、その日にフォーカスがある
    const trigger = canvas.getByRole('button', { name: 'カレンダーを開く' });
    await userEvent.click(trigger);
    const dialog = await page.findByRole('dialog', { name: '予約日' });
    await expect(within(dialog).getByRole('grid', { name: '2026年10月' })).toBeInTheDocument();
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: /2026年10月5日/ })).toHaveFocus()
    );

    // キーボードで次の日へ移り、Enter で選ぶ
    await userEvent.keyboard('{ArrowRight}{Enter}');
    await expect(fieldChange).toHaveBeenLastCalledWith('2026-10-06');
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
    await expect(trigger).toHaveFocus();
    const hidden = canvasElement.querySelector<HTMLInputElement>('input[name="date"]');
    await expect(hidden?.value).toBe('2026-10-06');

    // Esc で閉じても、フォーカスはボタンに戻る
    await userEvent.click(trigger);
    await page.findByRole('dialog', { name: '予約日' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
    await expect(trigger).toHaveFocus();

    // 消去のボタンで値を空にし、欄の最初の区切りへ戻る
    await userEvent.click(canvas.getByRole('button', { name: '日付を消去' }));
    await expect(fieldChange).toHaveBeenLastCalledWith(null);
    await expect(year).toHaveFocus();
    await expect(canvas.queryByRole('button', { name: '日付を消去' })).toBeNull();
  },
};

export const ButtonVariant: Story = {
  name: 'ボタンだけの形',
  args: { variant: 'button', name: 'date', onValueChange: fn() },
  parameters: {
    docs: {
      description: {
        story:
          '`variant="button"` は、打てない表示だけのボタンです。押すとカレンダーを開き、選んだ日をボタンに書きます。読み上げでは、ラベルに続けて選んだ日を読みます。',
      },
    },
  },
  decorators: [
    (Story) => (
      <form className="max-w-sm">
        <Story />
      </form>
    ),
  ],
  play: async ({ canvas, canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    const button = canvas.getByRole('button', { name: '予約日 日付を選ぶ' });
    await userEvent.click(button);
    const dialog = await page.findByRole('dialog', { name: '予約日' });
    await userEvent.click(within(dialog).getByRole('button', { name: /2026年9月18日/ }));
    await expect(args.onValueChange).toHaveBeenCalled();
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
    await expect(button).toHaveAccessibleName('予約日 2026/09/18');
    const hidden = canvasElement.querySelector<HTMLInputElement>('input[name="date"]');
    await expect(hidden?.value).toBe('2026-09-18');
  },
};

export const ReadOnlyNoTrigger: Story = {
  name: '読み取り専用',
  args: { readOnly: true, defaultValue: day },
  parameters: { controls: { disable: true } },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button', { name: 'カレンダーを開く' })).toBeNull();
  },
};

const stayError = 'チェックアウトは、チェックインより後の日にしてください';

export const InFieldset: Story = {
  tags: ['visual'],
  name: 'Fieldset の中',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Fieldset の中に置くと、Fieldset の `disabled` でまとめて押せなくなり、カレンダーのボタンも押せなくなります。まとまりの `errorText` では欄がエラーの見た目になり、エラーの文は欄の説明としても読み上げます。',
      },
    },
  },
  render: () => (
    <div className="flex max-w-sm flex-col gap-10">
      <Fieldset label="宿泊の期間" errorText={stayError}>
        <DatePicker
          label="チェックイン"
          today={today}
          defaultValue={Temporal.PlainDate.from('2026-10-05')}
        />
        <DatePicker
          label="チェックアウト"
          variant="button"
          today={today}
          defaultValue={Temporal.PlainDate.from('2026-10-03')}
        />
      </Fieldset>
      <Fieldset label="宿泊の期間（受付を締め切りました）" disabled>
        <DatePicker label="チェックイン" today={today} defaultValue={day} />
        <DatePicker label="チェックアウト" variant="button" today={today} defaultValue={day} />
      </Fieldset>
    </div>
  ),
  play: async ({ canvas }) => {
    const [invalidSet, disabledSet] = canvas.getAllByRole('group', { name: /^宿泊の期間/ });
    if (!invalidSet || !disabledSet) throw new Error('まとまりがありません');

    // まとまりのエラー: 欄はエラーになり、エラーの文が欄の説明につながる
    const invalid = within(invalidSet);
    for (const segment of invalid.getAllByRole('spinbutton')) {
      await expect(segment).toHaveAttribute('aria-invalid', 'true');
      await expect(segment).toHaveAccessibleDescription(stayError);
    }
    const button = invalid.getByRole('button', { name: /^チェックアウト/ });
    await expect(button).toHaveAccessibleDescription(stayError);
    await expect(button.closest('[data-invalid]')).not.toBeNull();

    // まとまりの disabled: 打ち込む欄・カレンダーのボタン・ボタンだけの形が、どれも押せない
    const disabled = within(disabledSet);
    for (const segment of disabled.getAllByRole('spinbutton')) {
      await expect(segment).toHaveAttribute('aria-disabled', 'true');
    }
    await expect(disabled.getByRole('button', { name: 'カレンダーを開く' })).toBeDisabled();
    await expect(disabled.getByRole('button', { name: /^チェックアウト/ })).toBeDisabled();
  },
};
