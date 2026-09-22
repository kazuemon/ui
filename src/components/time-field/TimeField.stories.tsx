import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, fn, userEvent } from 'storybook/test';

import { TimeField, type TimeFieldProps } from './TimeField';
import { Temporal } from '../../internal/date/plain-date';
import { DensityPair, Gallery, Matrix, Specimen } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';

type Sample = MatrixColumn & { props: Partial<TimeFieldProps> };

const time = Temporal.PlainTime.from('15:05');

const stateRows: Sample[] = [
  { label: '空', props: {} },
  { label: '値あり', props: { defaultValue: time } },
  { label: 'エラー', props: { errorText: '開始時刻を入力してください' } },
  {
    label: '範囲の外',
    props: {
      defaultValue: time,
      max: Temporal.PlainTime.from('12:00'),
      errorText: '12:00 までの時刻を入力してください',
    },
  },
  { label: '押せない', props: { defaultValue: time, disabled: true } },
  { label: '読み取り専用', props: { defaultValue: time, readOnly: true } },
];

const colors = ['neutral', 'primary', 'secondary'] as const;

const colorColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'フォーカス（時）', state: 'focus' },
];

const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: 'フォーカス（時）', state: 'focus' },
];

const formats: { label: string; props: Partial<TimeFieldProps> }[] = [
  { label: '24 時間制', props: {} },
  { label: '24 時間制・秒', props: { showSeconds: true } },
  { label: '12 時間制', props: { hourCycle: 12 } },
  { label: '12 時間制（en-US）', props: { hourCycle: 12, locale: 'en-US' } },
];

const meta = {
  title: 'Components/TimeField',
  component: TimeField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '時刻を、時・分（秒）の区切りごとに打つ欄です。キー操作と見た目は DateField と同じです。',
          '',
          '- `hourCycle` で 12 時間制か 24 時間制かを選びます。指定しないときは言語の既定（ja-JP は 24 時間制）です。12 時間制では午前・午後の区切りが付き、↑↓ か A・P のキーで切り替えます。',
          '- `showSeconds` で秒の区切りを出します。`minuteStep` は、分を ↑↓ で増減するときの刻みです。',
          '- 「9:05」「0905」「午後3時」「3:05 PM」のような文字を貼り付けると、読み取って区切りに入れます。全角の数字も読みます。直したことを知らせたいときは `halfWidthNotice` を付けます。',
          '- 値は `Temporal.PlainTime` で受け渡します。`name` を渡すと、フォームには「15:05」の形で送ります。',
          '- `color` で、いま打っている区切りの塗りとフォーカスの枠線の色を選びます。既定はグレーの塗りです。',
          '- `id`・`ref`・`inputProps` は、区切りを並べる要素（`role="group"`）に付きます。`className` は欄の外枠に付きます。',
        ].join('\n'),
      },
    },
  },
  args: {
    label: '開始時刻',
    captionPlacement: 'top',
    addonShape: 'attached',
    segmentPlaceholder: 'letters',
    color: 'neutral',
    showSeconds: false,
    minuteStep: 1,
    disabled: false,
    readOnly: false,
    loading: false,
    loadingBehavior: 'non-blocking',
    loadingIndicator: 'spinner',
  },
  argTypes: {
    label: { control: 'text' },
    caption: { control: 'text' },
    captionPlacement: {
      control: 'inline-radio',
      options: ['top', 'bottom'],
      table: { defaultValue: { summary: "'top'" } },
    },
    errorText: { control: 'text' },
    warningText: { control: 'text' },
    infoText: { control: 'text' },
    prefix: { control: 'text' },
    suffix: { control: 'text' },
    hourCycle: {
      control: 'inline-radio',
      options: [12, 24],
      table: { defaultValue: { summary: 'ロケールの既定' } },
    },
    color: {
      control: 'inline-radio',
      options: colors,
      table: { defaultValue: { summary: "'neutral'" } },
    },
    segmentPlaceholder: { control: 'inline-radio', options: ['letters', 'units', 'dashes'] },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    loading: { control: 'boolean' },
    value: { control: false },
    defaultValue: { control: false },
    min: { control: false },
    max: { control: false },
  },
} satisfies Meta<typeof TimeField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  args: { caption: '15 分きざみで受け付けます', minuteStep: 15 },
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
    pseudo: {
      ...statePseudo({ hover: '[data-slot="control"]', focusWithin: '[data-slot="control"]' }),
      focus: ['[data-preview="focus"] [data-segment="hour"]'],
    },
    docs: {
      description: {
        story:
          'フォーカスは欄の枠線で示し、いま打っている区切りをグレーの塗りで示します。`min`・`max` の外の時刻は、欄をエラーの見た目にします。',
      },
      source: sourceCode(`
        <TimeField label="開始時刻" />
        <TimeField label="開始時刻" defaultValue={Temporal.PlainTime.from('15:05')} />
        <TimeField label="開始時刻" errorText="開始時刻を入力してください" />
        <TimeField
          label="開始時刻"
          defaultValue={Temporal.PlainTime.from('15:05')}
          max={Temporal.PlainTime.from('12:00')}
          errorText="12:00 までの時刻を入力してください"
        />
        <TimeField label="開始時刻" defaultValue={Temporal.PlainTime.from('15:05')} disabled />
        <TimeField label="開始時刻" defaultValue={Temporal.PlainTime.from('15:05')} readOnly />
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={stateRows}
      rowLabel={(row) => row.label}
      columns={stateColumns}
      columnWidth="14rem"
      renderCell={(row) => <TimeField {...args} {...row.props} />}
    />
  ),
};

export const Colors: Story = {
  tags: ['visual'],
  name: '色',
  parameters: {
    controls: { exclude: ['color'] },
    pseudo: {
      ...statePseudo({ focusWithin: '[data-slot="control"]' }),
      focus: ['[data-preview="focus"] [data-segment="hour"]'],
    },
    docs: {
      description: {
        story:
          '`color` で欄の色を選びます。既定の `neutral` は、いま打っている区切りをグレーで塗ります。`primary`・`secondary` は、区切りをその色の淡い塗りにし、フォーカスの枠線もその色にします。フォームの中で色をそろえたいときに使います。',
      },
      source: sourceCode(`
        <TimeField label="開始時刻" />
        <TimeField label="開始時刻" color="primary" />
        <TimeField label="開始時刻" color="secondary" />
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={colors.map((color) => ({ label: color }))}
      rowLabel={(row) => row.label}
      columns={colorColumns}
      columnWidth="14rem"
      renderCell={(row) => <TimeField {...args} defaultValue={time} color={row.label} />}
    />
  ),
};

export const Formats: Story = {
  tags: ['visual'],
  name: '12 時間制・秒',
  parameters: {
    controls: { exclude: ['hourCycle', 'showSeconds', 'locale'] },
    docs: {
      description: {
        story:
          '12 時間制では、午前・午後の区切りが言語の並びで付きます（ja-JP は前、en-US は後ろ）。上の段が空、下の段が値の入った欄です。',
      },
      source: sourceCode(`
        <TimeField label="開始時刻" showSeconds />
        <TimeField label="開始時刻" hourCycle={12} />
      `),
    },
  },
  render: (args) => (
    <Gallery columnWidth="14rem">
      {formats.map((format) => (
        <Specimen key={format.label} label={format.label}>
          <TimeField {...args} {...format.props} />
          <TimeField {...args} {...format.props} defaultValue={time} />
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const Keyboard: Story = {
  name: 'キー操作',
  args: { onValueChange: fn(), name: 'start', minuteStep: 15 },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '時に「1」「2」を打つと 12 時になり、分へ進みます。時に「3」から先を打つと、すぐ分へ進みます。分は ↑↓ で `minuteStep` ずつ増減します。',
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
  play: async ({ canvas, args, canvasElement }) => {
    const hour = canvas.getByRole('spinbutton', { name: /^時/ });
    const minute = canvas.getByRole('spinbutton', { name: /^分/ });
    await userEvent.click(hour);
    await userEvent.keyboard('9');
    await expect(minute).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(minute).toHaveTextContent('00');
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    await expect(args.onValueChange).toHaveBeenCalledTimes(3);
    const hidden = canvasElement.querySelector<HTMLInputElement>('input[name="start"]');
    await expect(hidden?.value).toBe('09:30');
    await userEvent.paste('午後３時半');
    await expect(hidden?.value).toBe('15:30');
  },
};

export const FullWidthNotice: Story = {
  name: '全角を直したことを知らせる',
  args: { halfWidthNotice: true },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`halfWidthNotice` を付けると、全角の数字を半角に直したときに、本体の下の情報の行で知らせます。文を渡すと、その文を出します。既定は知らせません。',
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
  play: async ({ canvas }) => {
    const [hour] = canvas.getAllByRole('spinbutton');
    await userEvent.click(hour);
    await userEvent.paste('０９：０５');
    await expect(canvas.getByText('全角の数字を半角に直しました')).toBeInTheDocument();
  },
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
        <TimeField {...args} />
      </div>
    </DensityPair>
  ),
};
