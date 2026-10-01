import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { TimePicker, type TimePickerProps } from './TimePicker';
import { Fieldset } from '../fieldset/Fieldset';
import { Temporal } from '../../internal/date/plain-date';
import { DensityPair, Matrix } from '../../stories/story-parts';
import {
  type MatrixColumn,
  pickerFieldColumns,
  pickerFieldPseudo,
  sourceCode,
} from '../../stories/story-states';

type Sample = MatrixColumn & { props: Partial<TimePickerProps> };

const time = Temporal.PlainTime.from('10:30');

const stateRows: Sample[] = [
  { label: '空', props: {} },
  { label: '値あり', props: { defaultValue: time } },
  { label: 'エラー', props: { errorText: '開始時刻を選んでください' } },
  { label: '押せない', props: { defaultValue: time, disabled: true } },
  { label: '読み取り専用', props: { defaultValue: time, readOnly: true } },
];

const colors = ['neutral', 'primary', 'secondary'] as const;

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

export const Colors: Story = {
  tags: ['visual'],
  name: '色',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`color` は、欄でいま打っている区切りの塗り・フォーカスの枠線と、一覧で選んだ時刻の色に効きます。neutral（既定）はグレー、primary・secondary はその色です。',
      },
      source: sourceCode(`
        <TimePicker label="開始時刻" color="primary" />
      `),
    },
  },
  render: (args, { viewMode }) => (
    <div className="flex flex-wrap gap-6">
      {colors.map((color) => (
        <PopoverFrame key={color}>
          {(container) => (
            <TimePicker
              {...args}
              color={color}
              caption={color}
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
      ))}
    </div>
  ),
};

export const States: Story = {
  tags: ['visual'],
  name: '状態',
  parameters: {
    // 欄とボタンの状態を 5 列に並べる分、撮る枠を広くする（既定は 1200×900）
    viewport: {
      defaultViewport: 'wide',
      viewports: { wide: { name: 'wide', styles: { width: '1360px', height: '900px' } } },
    },
    pseudo: pickerFieldPseudo('hour'),
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
      columns={pickerFieldColumns}
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

export const OutOfRangeValue: Story = {
  name: '範囲の外の値で開く',
  args: {
    min: Temporal.PlainTime.from('09:00'),
    max: Temporal.PlainTime.from('18:00'),
    defaultValue: Temporal.PlainTime.from('07:10'),
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '値が `min`・`max` の外のときは、開いた一覧で選べる時刻のうちいちばん近いものにフォーカスを置きます。PageUp・PageDown は、見えている行の数ずつ動きます。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: '時刻を選ぶ' }));
    // 面の名前は欄のラベル。一覧の名前は開く口の名前で、同じ文を二度読ませない
    const dialog = await body.findByRole('dialog', { name: '開始時刻' });
    const listbox = within(dialog).getByRole('listbox', { name: '時刻を選ぶ' });
    const nearest = within(listbox).getByRole('option', { name: '09:00' });
    await waitFor(() => expect(nearest).toHaveFocus());
    await expect(nearest).toHaveAttribute('tabindex', '0');
    // 範囲の外の項目には、フォーカスの止まり先を置かない
    await expect(within(listbox).getByRole('option', { name: '07:00' })).toHaveAttribute(
      'tabindex',
      '-1'
    );
    // PageDown は、見えている行の数（7 行半の一覧で 6 行）だけ進む
    await userEvent.keyboard('{PageDown}');
    await waitFor(() =>
      expect(within(listbox).getByRole('option', { name: '10:30' })).toHaveFocus()
    );
    await userEvent.keyboard('{PageUp}');
    await waitFor(() => expect(nearest).toHaveFocus());
    await userEvent.keyboard('{Escape}');
  },
};

export const LockedStaysClosed: Story = {
  name: '開けない欄',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '押せない欄（Fieldset の `disabled` を含む）・読み取り専用の欄・待っているあいだ止める欄（`loadingBehavior="blocking"`）では、`defaultOpen` や `open` を渡しても一覧を開きません。',
      },
    },
  },
  render: () => (
    <div className="flex max-w-xs flex-col gap-4">
      <TimePicker label="押せない" disabled defaultOpen />
      <TimePicker label="読み取り専用" readOnly defaultOpen defaultValue={time} />
      <TimePicker label="待っている" loading loadingBehavior="blocking" open />
      <Fieldset label="まとめて押せない" disabled>
        <TimePicker label="Fieldset の中" defaultOpen />
      </Fieldset>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    // 開くなら描いた直後に面が出るので、数フレーム待ってから確かめる
    await new Promise((resolve) => setTimeout(resolve, 200));
    await expect(body.queryByRole('listbox')).toBeNull();
    for (const button of body.queryAllByRole('button', { name: '時刻を選ぶ' })) {
      await expect(button).toHaveAttribute('aria-expanded', 'false');
    }
  },
};

const hoursError = '終了時刻は、開始時刻より後にしてください';

export const InFieldset: Story = {
  tags: ['visual'],
  name: 'Fieldset の中',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Fieldset の中に置くと、Fieldset の `disabled` でまとめて押せなくなり、一覧を開くボタンも押せなくなります。まとまりの `errorText` では欄がエラーの見た目になり、エラーの文は欄の説明としても読み上げます。',
      },
    },
  },
  render: () => (
    <div className="flex max-w-sm flex-col gap-10">
      <Fieldset label="営業時間" errorText={hoursError}>
        <TimePicker label="開始時刻" defaultValue={Temporal.PlainTime.from('18:00')} />
        <TimePicker label="終了時刻" defaultValue={Temporal.PlainTime.from('09:00')} />
      </Fieldset>
      <Fieldset label="営業時間（変更できません）" disabled>
        <TimePicker label="開始時刻" defaultValue={time} />
        <TimePicker label="終了時刻" defaultValue={Temporal.PlainTime.from('18:00')} />
      </Fieldset>
    </div>
  ),
  play: async ({ canvas }) => {
    const [invalidSet, disabledSet] = canvas.getAllByRole('group', { name: /^営業時間/ });
    if (!invalidSet || !disabledSet) throw new Error('まとまりがありません');

    // まとまりのエラー: 欄はエラーになり、エラーの文が欄の説明につながる
    for (const segment of within(invalidSet).getAllByRole('spinbutton')) {
      await expect(segment).toHaveAttribute('aria-invalid', 'true');
      await expect(segment).toHaveAccessibleDescription(hoursError);
    }

    // まとまりの disabled: 欄と、一覧を開くボタンが押せない
    const disabled = within(disabledSet);
    for (const segment of disabled.getAllByRole('spinbutton')) {
      await expect(segment).toHaveAttribute('aria-disabled', 'true');
    }
    for (const button of disabled.getAllByRole('button', { name: '時刻を選ぶ' })) {
      await expect(button).toBeDisabled();
    }
  },
};

export const OutsideForm: Story = {
  name: 'フォームの外に置く',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '欄を `<form>` の外に置くときは、`form` にフォームの id を渡します。送る値（ISO 8601 の文字）はフォームの値に入ります。',
      },
    },
  },
  render: () => (
    <div className="flex max-w-xs flex-col gap-4">
      <form id="time-picker-outside-form" />
      <TimePicker
        label="開始の時刻"
        name="start"
        form="time-picker-outside-form"
        defaultValue={time}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // 外に置いた欄の値も、form で指したフォームの値に入る
    const form = canvasElement.querySelector<HTMLFormElement>('#time-picker-outside-form');
    await expect(form && new FormData(form).get('start')).toBe('10:30');
  },
};
