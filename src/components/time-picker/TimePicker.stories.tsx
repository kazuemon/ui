import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { TimePicker, type TimePickerProps } from './TimePicker';
import { Temporal } from '../../internal/date/plain-date';
import { DensityPair, Matrix } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';

type Sample = MatrixColumn & { props: Partial<TimePickerProps> };

const time = Temporal.PlainTime.from('10:30');

const stateRows: Sample[] = [
  { label: '空', props: {} },
  { label: '値あり', props: { defaultValue: time } },
  { label: 'エラー', props: { errorText: '開始時刻を選んでください' } },
  { label: '押せない', props: { defaultValue: time, disabled: true } },
  { label: '読み取り専用', props: { defaultValue: time, readOnly: true } },
];

const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'ボタンに hover', state: 'hover' },
  { label: 'ボタンにフォーカス（キーボード）', state: 'focus' },
];

// 開いた面を、ページの body ではなくこの枠の中に描く。ドキュメントのページでも、ストーリーごとに収まる
function PopoverFrame({
  height = 'h-[26rem]',
  children,
}: {
  height?: string;
  children: (container: HTMLElement) => ReactNode;
}) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setContainer} className={`relative w-80 max-w-full ${height}`}>
      {container && children(container)}
    </div>
  );
}

// 開いた状態のストーリーも、ドキュメントのページでは閉じて描く
// 開くと選んだ時刻にフォーカスが移り、ページがそのストーリーの位置まで流れてしまうため
const openOnLoad = (viewMode: string) => viewMode !== 'docs';

const meta = {
  title: 'Components/TimePicker',
  component: TimePicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '時刻を打つ欄に、一覧から選ぶボタンを付けたものです。区切りごとに打つことも、右端のボタンで開いた一覧から選ぶこともできます。欄のキー操作は TimeField と同じです。',
          '',
          '- 既定（`variant="list"`）は、`minuteStep`（既定 15 分）ごとの時刻を 1 列に並べます。選ぶと閉じます。5 分や 15 分のような刻みに向きます。5 分より細かくすると一覧が長く重くなるので、`variant="columns"` を使います（開発中は警告が出ます）。',
          '- `variant="columns"` は、時・分（12 時間制では午前・午後、`showSeconds` では秒も）を別々の列にします。選ぶたびに値が入り、分（`showSeconds` では秒）を選ぶと閉じます。1 分刻みで選ばせたいときに向きます。',
          '- 列のあいだの線は `hideColumnDivider` で消せ、列の見出しは `showColumnHeading` で出せます。選んでも閉じないようにするのは `closeOnSelect={false}`、「完了」のボタンを出すのは `showDoneButton` です。',
          '- `min`・`max` の外の時刻は、一覧では選べません。打った値が外なら、欄をエラーの見た目にします。',
          '- 開いたときは、選んでいる時刻（値がないときは、いまの時刻に近い項目）を一覧の中ほどに見せ、そこへフォーカスを移します。↑↓・Home・End で動き、Enter で選びます。',
          '- 読み取り専用の欄には、一覧を開くボタンを置きません。',
          '- 値は `Temporal.PlainTime` で受け渡します。`name` を渡すと、フォームには「15:05」の形で送ります。',
        ].join('\n'),
      },
    },
  },
  args: {
    label: '開始時刻',
    variant: 'list',
    minuteStep: 15,
    color: 'neutral',
    showSeconds: false,
    closeOnSelect: true,
    showDoneButton: false,
    hideColumnDivider: false,
    showColumnHeading: false,
    disabled: false,
    readOnly: false,
  },
  argTypes: {
    label: { control: 'text' },
    caption: { control: 'text' },
    errorText: { control: 'text' },
    variant: {
      control: 'inline-radio',
      options: ['list', 'columns'],
      table: { defaultValue: { summary: "'list'" } },
    },
    hourCycle: {
      control: 'inline-radio',
      options: [12, 24],
      table: { defaultValue: { summary: 'ロケールの既定' } },
    },
    color: {
      control: 'inline-radio',
      options: ['neutral', 'primary', 'secondary'],
      table: { defaultValue: { summary: "'neutral'" } },
    },
    value: { control: false },
    defaultValue: { control: false },
    min: { control: false },
    max: { control: false },
    defaultOpen: { control: false },
    portalContainer: { control: false },
  },
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  args: { caption: '15 分きざみで選べます' },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
};

// Show code: 枠（PopoverFrame）の中身は出ないので、使い方を source.code に手で書く
export const Open: Story = {
  tags: ['visual'],
  name: '開いた状態（1 列）',
  parameters: {
    controls: { include: ['minuteStep', 'color', 'hourCycle'] },
    docs: {
      description: {
        story:
          '`minuteStep` ごとの時刻を 1 列に並べます。選んでいる時刻は、選択肢と同じ淡い面・太字・チェックで示し、開いたときは一覧の中ほどに見せます。',
      },
      source: sourceCode(`
        <TimePicker label="開始時刻" defaultValue={Temporal.PlainTime.from('10:30')} />
      `),
    },
  },
  render: (args, { viewMode }) => (
    <PopoverFrame>
      {(container) => (
        <TimePicker
          {...args}
          defaultValue={time}
          presentation="popover"
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={container}
          positionerProps={{ collisionAvoidance: { side: 'none', align: 'none' } }}
        />
      )}
    </PopoverFrame>
  ),
};

export const OpenColumns: Story = {
  tags: ['visual'],
  name: '開いた状態（列）',
  args: { variant: 'columns', minuteStep: 5 },
  parameters: {
    controls: {
      include: [
        'minuteStep',
        'hourCycle',
        'showSeconds',
        'hideColumnDivider',
        'showColumnHeading',
        'showDoneButton',
      ],
    },
    docs: {
      description: {
        story:
          '`variant="columns"` では、時・分を別々の列から選びます。選ぶたびに欄の値が変わり、分を選ぶと閉じます。列のあいだは細い線で分けます。12 時間制では午前・午後の列が、欄と同じ並びで付きます。',
      },
      source: sourceCode(`
        <TimePicker
          label="開始時刻"
          variant="columns"
          minuteStep={5}
          defaultValue={Temporal.PlainTime.from('10:30')}
        />
        <TimePicker label="開始時刻" variant="columns" minuteStep={5} hourCycle={12} />
      `),
    },
  },
  render: (args, { viewMode }) => (
    <div className="flex flex-wrap gap-8">
      <PopoverFrame>
        {(container) => (
          <TimePicker
            {...args}
            defaultValue={time}
            presentation="popover"
            defaultOpen={openOnLoad(viewMode)}
            portalContainer={container}
            positionerProps={{ collisionAvoidance: { side: 'none', align: 'none' } }}
          />
        )}
      </PopoverFrame>
      <PopoverFrame>
        {(container) => (
          <TimePicker
            {...args}
            label="開始時刻（12 時間制）"
            hourCycle={12}
            defaultValue={Temporal.PlainTime.from('15:00')}
            presentation="popover"
            defaultOpen={openOnLoad(viewMode)}
            portalContainer={container}
            positionerProps={{ collisionAvoidance: { side: 'none', align: 'none' } }}
          />
        )}
      </PopoverFrame>
    </div>
  ),
};

const columnKinds: { label: string; props: Partial<TimePickerProps> }[] = [
  { label: '既定', props: {} },
  { label: 'hideColumnDivider', props: { hideColumnDivider: true } },
  { label: 'showColumnHeading', props: { showColumnHeading: true } },
  { label: 'showDoneButton', props: { showDoneButton: true, closeOnSelect: false } },
];

export const ColumnKinds: Story = {
  tags: ['visual'],
  name: '列の形の見た目',
  args: { variant: 'columns', minuteStep: 5 },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '列のあいだの線は `hideColumnDivider` で消せます。`showColumnHeading` では、列の上に「時」「分」の見出し（`columnNames`）を出します。`showDoneButton` では、下に「完了」のボタンを出します。時だけを選び直すことが多いときは、`closeOnSelect={false}` と合わせて使います。',
      },
      source: sourceCode(`
        <TimePicker label="開始時刻" variant="columns" hideColumnDivider />
        <TimePicker label="開始時刻" variant="columns" showColumnHeading />
        <TimePicker label="開始時刻" variant="columns" showDoneButton closeOnSelect={false} />
      `),
    },
  },
  render: (args, { viewMode }) => (
    <div className="flex flex-wrap gap-6">
      {columnKinds.map((kind) => (
        <div key={kind.label} className="flex w-64 flex-col gap-2">
          <code className="text-(length:--text-caption)">{kind.label}</code>
          <PopoverFrame height="h-[32rem]">
            {(container) => (
              <TimePicker
                {...args}
                {...kind.props}
                defaultValue={time}
                presentation="popover"
                defaultOpen={openOnLoad(viewMode)}
                portalContainer={container}
                positionerProps={{ collisionAvoidance: { side: 'none', align: 'none' } }}
                // 面をいくつも同時に開くので、開いたときのフォーカスは移さない
                popupProps={{ initialFocus: false } as never}
              />
            )}
          </PopoverFrame>
        </div>
      ))}
    </div>
  ),
};

export const States: Story = {
  tags: ['visual'],
  name: '状態',
  parameters: {
    pseudo: statePseudo({
      hover: '[data-slot="field-addon-button"]:not(:disabled)',
      focusVisible: '[data-slot="field-addon-button"]:not(:disabled)',
    }),
    docs: {
      description: {
        story:
          '右端のボタンは、欄の端に付くほかのボタンと同じグレーの塊です。押せない欄では押せず、読み取り専用の欄には置きません。',
      },
      source: sourceCode(`
        <TimePicker label="開始時刻" />
        <TimePicker label="開始時刻" defaultValue={Temporal.PlainTime.from('10:30')} />
        <TimePicker label="開始時刻" errorText="開始時刻を選んでください" />
        <TimePicker label="開始時刻" defaultValue={Temporal.PlainTime.from('10:30')} disabled />
        <TimePicker label="開始時刻" defaultValue={Temporal.PlainTime.from('10:30')} readOnly />
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={stateRows}
      rowLabel={(row) => row.label}
      columns={stateColumns}
      columnWidth="14rem"
      renderCell={(row) => <TimePicker {...args} {...row.props} />}
    />
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  args: { defaultValue: time },
  parameters: {
    docs: {
      description: {
        story:
          '高さ・文字・余白は入力方式で切り替わります。ツールバーの「密度」でも切り替えられます。',
      },
    },
  },
  render: (args) => (
    <DensityPair>
      <div className="w-72">
        <TimePicker {...args} />
      </div>
    </DensityPair>
  ),
};

export const PickFromList: Story = {
  name: '一覧から選ぶ',
  args: {
    onValueChange: fn(),
    name: 'start',
    min: Temporal.PlainTime.from('09:00'),
    max: Temporal.PlainTime.from('18:00'),
    defaultValue: time,
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '一覧はキーボードでも選べます。↑↓ で動き、Enter で選ぶと閉じて、フォーカスはボタンに戻ります。`min`・`max` の外の時刻は選べません。',
      },
    },
  },
  decorators: [
    (Story) => (
      <form className="max-w-xs">
        <Story />
      </form>
    ),
  ],
  play: async ({ canvas, args, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const button = canvas.getByRole('button', { name: '時刻を選ぶ' });
    await userEvent.click(button);
    const listbox = await body.findByRole('listbox', { name: '時刻を選ぶ' });
    // 開くと、選んでいる時刻にフォーカスが移る
    const selected = within(listbox).getByRole('option', { selected: true });
    await expect(selected).toHaveTextContent('10:30');
    await waitFor(() => expect(selected).toHaveFocus());
    // 範囲の外の時刻は選べない
    await expect(within(listbox).getByRole('option', { name: '08:45' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(Temporal.PlainTime.from('10:45'));
    await waitFor(() => expect(body.queryByRole('listbox')).not.toBeInTheDocument());
    await expect(button).toHaveFocus();
    const hidden = canvasElement.querySelector<HTMLInputElement>('input[name="start"]');
    await expect(hidden?.value).toBe('10:45');
    // マウスでも選べる
    await userEvent.click(button);
    await userEvent.click(await body.findByRole('option', { name: '17:00' }));
    await expect(hidden?.value).toBe('17:00');
  },
};

export const PickFromColumns: Story = {
  name: '列から選ぶ',
  args: { variant: 'columns', minuteStep: 5, onValueChange: fn(), name: 'start' },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '列の形では、時と分の列が 1 つずつ Tab キーの止まり先になります。列を選ぶたびに値が入り、分を選ぶと閉じます。',
      },
    },
  },
  decorators: [
    (Story) => (
      <form className="max-w-xs">
        <Story />
      </form>
    ),
  ],
  play: async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: '時刻を選ぶ' }));
    const hours = await body.findByRole('listbox', { name: '時' });
    const minutes = body.getByRole('listbox', { name: '分' });
    await userEvent.click(within(hours).getByRole('option', { name: '14' }));
    await userEvent.click(within(minutes).getByRole('option', { name: '35' }));
    const hidden = canvasElement.querySelector<HTMLInputElement>('input[name="start"]');
    await expect(hidden?.value).toBe('14:35');
    await expect(within(hours).getByRole('option', { name: '14' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    // 分を選んだら閉じる
    await waitFor(() => expect(body.queryByRole('listbox')).not.toBeInTheDocument());
  },
};

export const PickWithDoneButton: Story = {
  name: '「完了」で閉じる',
  args: {
    variant: 'columns',
    minuteStep: 5,
    closeOnSelect: false,
    showDoneButton: true,
    name: 'start',
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`closeOnSelect={false}` では、分を選んでも開いたままです。`showDoneButton` の「完了」か、外を押すか Esc で閉じます。',
      },
    },
  },
  decorators: [
    (Story) => (
      <form className="max-w-xs">
        <Story />
      </form>
    ),
  ],
  play: async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: '時刻を選ぶ' }));
    const hours = await body.findByRole('listbox', { name: '時' });
    const minutes = body.getByRole('listbox', { name: '分' });
    await userEvent.click(within(hours).getByRole('option', { name: '14' }));
    await userEvent.click(within(minutes).getByRole('option', { name: '35' }));
    // 分を選んでも開いたまま
    await expect(minutes).toBeInTheDocument();
    const hidden = canvasElement.querySelector<HTMLInputElement>('input[name="start"]');
    await expect(hidden?.value).toBe('14:35');
    await userEvent.click(body.getByRole('button', { name: '完了' }));
    await waitFor(() => expect(body.queryByRole('listbox')).not.toBeInTheDocument());
  },
};
