import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ArrowRightIcon } from '@phosphor-icons/react';

import {
  DateRangePicker,
  DateRangePickerControl,
  type DateRangePickerProps,
  type DateRangePreset,
  type DateRangeValue,
} from './DateRangePicker';
import { Field, FieldCaption, FieldLabel, FieldMessages } from '../field/Field';
import { Icon } from '../icon/Icon';
import { Temporal } from '../../internal/date/plain-date';
import { DensityPair, Matrix, PhoneFrame } from '../../stories/story-parts';
import {
  enabledControl,
  type MatrixColumn,
  pickerFieldColumns,
  pickerFieldPseudo,
  sourceCode,
} from '../../stories/story-states';

type Sample = MatrixColumn & { name: string; props: Partial<DateRangePickerProps> };

const today = Temporal.PlainDate.from('2026-09-30');
const stay: DateRangeValue = {
  start: Temporal.PlainDate.from('2026-10-05'),
  end: Temporal.PlainDate.from('2026-10-08'),
};

const stateRows: Sample[] = [
  { label: '空', name: '空', props: {} },
  { label: '値あり', name: '値あり', props: { defaultValue: stay } },
  {
    label: 'エラー',
    name: 'エラー',
    props: { defaultValue: stay, errorText: '空室がありません' },
  },
  { label: '押せない', name: '押せない', props: { defaultValue: stay, disabled: true } },
  { label: '読み取り専用', name: '読み取り専用', props: { defaultValue: stay, readOnly: true } },
];

const variants = ['field', 'button'] as const;
const colors = ['neutral', 'primary', 'secondary'] as const;

// 今日から数えた期間の候補
const presets: DateRangePreset[] = [
  { label: '今日', value: { start: today, end: today } },
  { label: '過去 7 日', value: { start: today.subtract({ days: 6 }), end: today } },
  { label: '過去 30 日', value: { start: today.subtract({ days: 29 }), end: today } },
  {
    label: '今月',
    value: { start: today.with({ day: 1 }), end: today.with({ day: today.daysInMonth }) },
  },
  {
    label: '先月',
    value: {
      start: today.subtract({ months: 1 }).with({ day: 1 }),
      end: today.with({ day: 1 }).subtract({ days: 1 }),
    },
  },
];

// 「欄にフォーカス」の列は、始まりの年の区切りにだけフォーカスを当てる（終わりの区切り・終わりの欄には当てない）
const basePseudo = pickerFieldPseudo('year');
const focusCell = `[data-preview="focus"] ${enabledControl}`;
const statesPseudo = {
  ...basePseudo,
  focusWithin: [
    `${focusCell}:has([data-range-part="start"])`,
    `[data-preview="focus"] button${enabledControl}`,
    `[data-preview="button-focus"] ${enabledControl}:has([data-slot="field-addon-button"])`,
    `[data-preview="button-focus"] button${enabledControl}`,
  ],
  focus: [`${focusCell} [data-range-part="start"] [data-segment="year"]`],
};

// 開いた面を、ページの body ではなくこの枠の中に描く
function PopoverFrame({
  children,
  className = 'h-[30rem] w-[44rem]',
}: {
  children: (container: HTMLElement) => ReactNode;
  className?: string;
}) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setContainer} className={`relative max-w-full ${className}`}>
      {container && children(container)}
    </div>
  );
}

// 開いた状態のストーリーも、ドキュメントのページでは閉じて描く
const openOnLoad = (viewMode: string) => viewMode !== 'docs';

const meta = {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '期間（始まりと終わりの日）を選ぶ欄です。年・月・日を打ち込むことも、右端のボタンで開くカレンダーから選ぶこともできます。ラベル・キャプション・状態の文などは DatePicker と同じです。',
          '',
          '- カレンダーでは、1 回目に押した日が始まり、2 回目に押した日が終わりです。終わりを選ぶとカレンダーは閉じます。始まりを選んだあとは、マウスを載せた日まで薄い帯が出ます。',
          '- カレンダーは 1 か月です。浮かべるときは `numberOfMonths={2}` で 2 か月を横に並べられます（前後の月の日は隠します）。指で操作していて画面が狭いときは、画面の下から出すシートにし、いつも 1 か月にします。',
          '- `presets` で期間の候補（「過去 7 日」など）を並べます。押すと、その期間が欄に入り、カレンダーは閉じます。置き場所は `presetsPlacement` で、既定はカレンダーの左の列です。',
          '- `variant="button"` は、打てない表示だけのボタンです。',
          '- 始まりと終わりのあいだの記号は、既定で「〜」です。`separator` に文字やアイコンを渡して変えられます。記号は読み上げません。',
          '- `min`・`max`・`isDateDisabled` で選べる日を絞り、`minRangeDays`・`maxRangeDays` で期間の長さを絞ります。終わりが始まりより前の日のときと、範囲の外の日のときは、欄をエラーの見た目にします。',
          '- 値は `{ start, end }`（`Temporal.PlainDate`）で受け渡します。`name` を渡すと、両端がそろったときに「2026-10-05/2026-10-08」（ISO 8601 の期間）の形でフォームに送ります。',
        ].join('\n'),
      },
    },
  },
  args: {
    label: '宿泊の期間',
    variant: 'field',
    color: 'neutral',
    disabled: false,
    readOnly: false,
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
    color: {
      control: 'inline-radio',
      options: colors,
      table: { defaultValue: { summary: "'neutral'" } },
    },
    numberOfMonths: {
      control: 'inline-radio',
      options: [1, 2],
      table: { defaultValue: { summary: '1' } },
    },
    presetsPlacement: {
      control: 'inline-radio',
      options: ['start', 'bottom'],
      table: { defaultValue: { summary: "'start'" } },
    },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    clearable: { control: 'boolean' },
    value: { control: false },
    defaultValue: { control: false },
    presets: { control: false },
    min: { control: false },
    max: { control: false },
    today: { control: false },
  },
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  args: { caption: 'チェックインとチェックアウトの日を選んでください' },
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
    viewport: {
      defaultViewport: 'wide',
      viewports: { wide: { name: 'wide', styles: { width: '2000px', height: '1100px' } } },
    },
    pseudo: statesPseudo,
    docs: {
      description: {
        story:
          '上の 5 行が打ち込める欄（既定）、下の 5 行がボタンだけの形（`variant="button"`）です。右端のボタンは、欄の端に付くほかのボタンと同じグレーの塊です。押せない欄では押せず、読み取り専用では出しません。',
      },
      source: sourceCode(`
        <DateRangePicker label="宿泊の期間" />
        <DateRangePicker label="宿泊の期間" variant="button" />
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={variants.flatMap((variant) =>
        stateRows.map((row) => ({ ...row, label: `${variant}・${row.name}`, variant }))
      )}
      rowLabel={(row) => row.label}
      columns={pickerFieldColumns}
      columnWidth="21rem"
      renderCell={(row) => <DateRangePicker {...args} {...row.props} variant={row.variant} />}
    />
  ),
};

// 開いた面。play でボタンを押して開いたあとの姿を撮る
export const Open: Story = {
  tags: ['visual'],
  name: '開いた状態',
  args: { defaultValue: stay },
  parameters: {
    docs: {
      description: {
        story:
          'カレンダーは欄の左端にそろえて、下に浮かべます。選んだ期間は淡い帯でつなぎます。開いているあいだ、欄はフォーカス中と同じ見た目のままです。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="h-[32rem] max-w-sm">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'カレンダーを開く' }));
    const page = within(canvasElement.ownerDocument.body);
    const dialog = await page.findByRole('dialog', { name: '宿泊の期間' });
    await expect(within(dialog).getByRole('grid', { name: '2026年10月' })).toBeInTheDocument();
    // 始まりの日へフォーカスが移る
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: /2026年10月5日/ })).toHaveFocus()
    );
  },
};

export const Colors: Story = {
  tags: ['visual'],
  name: '色',
  args: { defaultValue: stay },
  parameters: {
    controls: { disable: true },
    viewport: {
      defaultViewport: 'tall',
      viewports: { tall: { name: 'tall', styles: { width: '1000px', height: '1500px' } } },
    },
    docs: {
      description: {
        story:
          '`color` は、欄でいま打っている区切りの塗り・フォーカスの枠線と、カレンダーで選んだ期間の色に効きます。',
      },
      source: sourceCode(`
        <DateRangePicker label="宿泊の期間" color="primary" />
      `),
    },
  },
  render: (args, { viewMode }) => (
    <div className="flex flex-col gap-6">
      {colors.map((color) => (
        <PopoverFrame key={color} className="h-[29rem] w-[44rem]">
          {(container) => (
            <DateRangePicker
              {...args}
              className="w-80"
              color={color}
              caption={color}
              presentation="popover"
              defaultOpen={openOnLoad(viewMode)}
              portalContainer={container}
              positionerProps={{ collisionAvoidance: { side: 'none', align: 'none' } }}
            />
          )}
        </PopoverFrame>
      ))}
    </div>
  ),
};

export const Presets: Story = {
  tags: ['visual'],
  name: '期間の候補',
  args: { label: '集計の期間', presets, defaultValue: presets[1]?.value ?? null },
  parameters: {
    viewport: {
      defaultViewport: 'tall',
      viewports: { tall: { name: 'tall', styles: { width: '1000px', height: '1150px' } } },
    },
    docs: {
      description: {
        story:
          '`presets` に期間の候補を渡すと、カレンダーの左に列で並べます。`presetsPlacement="bottom"` ではカレンダーの下に並べます。候補を押すと、その期間が欄に入り、カレンダーは閉じます。今日から数える候補は、使う側が今日から作って渡します。',
      },
      source: sourceCode(`
        const today = Temporal.Now.plainDateISO('Asia/Tokyo');
        <DateRangePicker
          label="集計の期間"
          presets={[
            { label: '過去 7 日', value: { start: today.subtract({ days: 6 }), end: today } },
            { label: '過去 30 日', value: { start: today.subtract({ days: 29 }), end: today } },
          ]}
        />
      `),
    },
  },
  render: (args, { viewMode }) => (
    <div className="flex flex-col gap-6">
      {(['start', 'bottom'] as const).map((placement) => (
        <PopoverFrame
          key={placement}
          className={placement === 'start' ? 'h-[30rem] w-[52rem]' : 'h-[34rem] w-[44rem]'}
        >
          {(container) => (
            <DateRangePicker
              {...args}
              className="w-80"
              caption={`presetsPlacement="${placement}"`}
              presetsPlacement={placement}
              presentation="popover"
              defaultOpen={openOnLoad(viewMode)}
              portalContainer={container}
              positionerProps={{ collisionAvoidance: { side: 'none', align: 'none' } }}
            />
          )}
        </PopoverFrame>
      ))}
    </div>
  ),
};

export const Sheet: Story = {
  tags: ['visual'],
  name: 'シート',
  args: { defaultValue: stay, presets, presentation: 'sheet' },
  parameters: {
    docs: {
      description: {
        story:
          '指で操作していて画面が狭いときは、画面の下から出すシートにします。カレンダーは 1 か月で、期間の候補はカレンダーの下に並べます。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <PhoneFrame>
      {(frame) => (
        <DateRangePicker {...args} defaultOpen={openOnLoad(viewMode)} portalContainer={frame} />
      )}
    </PhoneFrame>
  ),
};

export const TwoMonths: Story = {
  tags: ['visual'],
  name: '2 か月を並べる',
  args: { defaultValue: { start: stay.start, end: Temporal.PlainDate.from('2026-11-03') } },
  parameters: {
    docs: {
      description: {
        story:
          '`numberOfMonths={2}` で、浮かべる面に見せている月と次の月を横に並べます。月をまたぐ期間を一度に見渡せます。同じ日が 2 か所に出ないよう、前後の月の日は隠します。シートでは 1 か月のままです。',
      },
      source: sourceCode(`
        <DateRangePicker label="宿泊の期間" numberOfMonths={2} />
      `),
    },
  },
  render: (args, { viewMode }) => (
    <PopoverFrame>
      {(container) => (
        <DateRangePicker
          {...args}
          className="w-80"
          numberOfMonths={2}
          presentation="popover"
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={container}
          positionerProps={{ collisionAvoidance: { side: 'none', align: 'none' } }}
        />
      )}
    </PopoverFrame>
  ),
};

const separators: { label: string; props: Partial<DateRangePickerProps> }[] = [
  { label: '既定（〜）', props: {} },
  { label: 'separator="–"', props: { separator: '–' } },
  { label: 'separator="から"', props: { separator: 'から' } },
  { label: '矢印のアイコン', props: { separator: <Icon icon={ArrowRightIcon} /> } },
];

export const Separators: Story = {
  tags: ['visual'],
  name: 'あいだの記号',
  args: { defaultValue: stay },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '始まりと終わりの日のあいだには、既定で「〜」を置きます。`separator` には文字のほか、アイコンも渡せます。記号は見た目だけで、読み上げません。欄では区切りの名前（`startName`・`endName`）で、ボタンでは `separatorName`（既定は「から」）で、始まりと終わりを読み分けます。',
      },
      source: sourceCode(`
        <DateRangePicker label="宿泊の期間" separator="から" />
        <DateRangePicker label="宿泊の期間" separator={<Icon icon={ArrowRightIcon} />} />
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={separators}
      rowLabel={(row) => row.label}
      columns={variants.map((variant) => ({ label: variant, variant }))}
      columnWidth="21rem"
      renderCell={(row, column) => (
        <DateRangePicker {...args} {...row.props} variant={column.variant} />
      )}
    />
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  args: { caption: 'チェックインとチェックアウトの日', defaultValue: stay },
  render: (args) => (
    <DensityPair>
      <div className="flex w-80 flex-col gap-4">
        <DateRangePicker {...args} />
        <DateRangePicker {...args} variant="button" />
      </div>
    </DensityPair>
  ),
};

// 打ち込み・カレンダー・消去の確かめ
// 値は文字（ISO 8601）にして記録する。Temporal の値どうしは、expect で中身を比べられないため
const fieldChange = fn();
const text = (value: DateRangeValue | null) =>
  value ? `${value.start?.toString() ?? ''}/${value.end?.toString() ?? ''}` : null;

function FieldExample() {
  const [value, setValue] = useState<DateRangeValue | null>(null);
  return (
    <form className="flex max-w-sm flex-col gap-3">
      <DateRangePicker
        label="宿泊の期間"
        name="stay"
        today={today}
        clearable
        presentation="popover"
        value={value}
        onValueChange={(next) => {
          setValue(next);
          fieldChange(text(next));
        }}
      />
      <output className="text-caption text-fg-subtle">値: {text(value) ?? 'null'}</output>
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
          '始まりと終わりを続けて打ち込めます。カレンダーで始まりの日を押すと面は開いたままで、終わりの日を押すと欄に入って閉じ、フォーカスはボタンに戻ります。',
      },
    },
  },
  render: () => <FieldExample />,
  play: async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const range = canvas.getByRole('group', { name: '宿泊の期間' });
    // 区切りの名前は「年」に、始まり・終わりの名前と欄のラベルを続けて読む
    const start = within(range).getByRole('group', { name: '開始日' });
    const end = within(range).getByRole('group', { name: '終了日' });
    const [startYear] = within(start).getAllByRole('spinbutton');
    await userEvent.click(startYear);
    await userEvent.keyboard('20261005');
    await expect(fieldChange).toHaveBeenLastCalledWith('2026-10-05/');
    const [endYear] = within(end).getAllByRole('spinbutton');
    await userEvent.click(endYear);
    await userEvent.keyboard('20261003');
    await expect(fieldChange).toHaveBeenLastCalledWith('2026-10-05/2026-10-03');
    // 終わりが始まりより前なので、終わりの区切りはエラー
    await expect(endYear).toHaveAttribute('aria-invalid', 'true');

    // カレンダーで選び直す: 1 回目が始まり（開いたまま）、2 回目が終わり（閉じる）
    const trigger = canvas.getByRole('button', { name: 'カレンダーを開く' });
    await userEvent.click(trigger);
    const dialog = await page.findByRole('dialog', { name: '宿泊の期間' });
    await userEvent.click(within(dialog).getByRole('button', { name: /2026年10月12日/ }));
    await expect(fieldChange).toHaveBeenLastCalledWith('2026-10-12/');
    await expect(page.getByRole('dialog', { name: '宿泊の期間' })).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: /2026年10月15日/ }));
    await expect(fieldChange).toHaveBeenLastCalledWith('2026-10-12/2026-10-15');
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
    await expect(trigger).toHaveFocus();
    await expect(endYear).not.toHaveAttribute('aria-invalid');
    const hidden = canvasElement.querySelector<HTMLInputElement>('input[name="stay"]');
    await expect(hidden?.value).toBe('2026-10-12/2026-10-15');

    // 消去のボタンで両端を空にし、始まりの最初の区切りへ戻る
    await userEvent.click(canvas.getByRole('button', { name: '期間を消去' }));
    await expect(fieldChange).toHaveBeenLastCalledWith(null);
    await expect(startYear).toHaveFocus();
    await expect(hidden?.value).toBe('');
  },
};

export const PresetPick: Story = {
  name: '候補を押す',
  args: { presets, onValueChange: fn(), presentation: 'popover' },
  parameters: { controls: { disable: true } },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas, canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'カレンダーを開く' }));
    const dialog = await page.findByRole('dialog', { name: '宿泊の期間' });
    await userEvent.click(within(dialog).getByRole('button', { name: '過去 7 日' }));
    await expect(args.onValueChange).toHaveBeenCalled();
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
  },
};

export const ButtonVariant: Story = {
  name: 'ボタンだけの形',
  args: { variant: 'button', name: 'stay', presentation: 'popover' },
  parameters: {
    docs: {
      description: {
        story:
          '`variant="button"` は、打てない表示だけのボタンです。押すとカレンダーを開き、選んだ期間をボタンに書きます。読み上げでは、ラベルに続けて「2026/10/05 から 2026/10/08」のように読みます。',
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
  play: async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const button = canvas.getByRole('button', { name: '宿泊の期間 期間を選ぶ' });
    await userEvent.click(button);
    const dialog = await page.findByRole('dialog', { name: '宿泊の期間' });
    await userEvent.click(within(dialog).getByRole('button', { name: /2026年9月18日/ }));
    await userEvent.click(within(dialog).getByRole('button', { name: /2026年9月21日/ }));
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
    await expect(button).toHaveAccessibleName('宿泊の期間 2026/09/18 から 2026/09/21');
    const hidden = canvasElement.querySelector<HTMLInputElement>('input[name="stay"]');
    await expect(hidden?.value).toBe('2026-09-18/2026-09-21');
  },
};

export const Composition: Story = {
  name: '組み立てる',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '並べ方を変えたいときは、`Field` の中に `FieldLabel`・`FieldCaption`・`FieldMessages` と本体の `DateRangePickerControl` を置きます。ラベル・キャプション・状態の文、`disabled`・`required`、フォームの `name` は `Field` に渡し、値・`min`・`max`・`variant` などは `DateRangePickerControl` に渡します。',
      },
      source: sourceCode(`
        <Field label="宿泊の期間" caption="チェックインとチェックアウトの日" name="stay" required>
          <FieldLabel />
          <DateRangePickerControl />
          <FieldCaption />
          <FieldMessages />
        </Field>
      `),
    },
  },
  render: () => (
    <div className="max-w-sm">
      <Field label="宿泊の期間" caption="チェックインとチェックアウトの日" name="stay" required>
        <FieldLabel />
        <DateRangePickerControl defaultValue={stay} today={today} />
        <FieldCaption />
        <FieldMessages />
      </Field>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const [year] = canvas.getAllByRole('spinbutton');
    await expect(year).toHaveAttribute('aria-required', 'true');
    await expect(year).toHaveAccessibleDescription('チェックインとチェックアウトの日');
    const hidden = canvasElement.querySelector<HTMLInputElement>('input[name="stay"]');
    await expect(hidden?.value).toBe('2026-10-05/2026-10-08');
  },
};
