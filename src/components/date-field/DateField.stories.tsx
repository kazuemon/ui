import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, fn, userEvent, within } from 'storybook/test';

import { DateField, type DateFieldProps } from './DateField';
import { Temporal } from '../../internal/date/plain-date';
import { DensityPair, Gallery, Matrix, Specimen } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';

type Sample = MatrixColumn & { props: Partial<DateFieldProps> };

const day = Temporal.PlainDate.from('2026-09-20');

const stateRows: Sample[] = [
  { label: '空', props: {} },
  { label: '値あり', props: { defaultValue: day } },
  { label: 'エラー', props: { errorText: '生年月日を入力してください' } },
  {
    label: '範囲の外',
    props: {
      defaultValue: day,
      max: Temporal.PlainDate.from('2026-09-01'),
      errorText: '9月1日までの日を入力してください',
    },
  },
  { label: '押せない', props: { defaultValue: day, disabled: true } },
  { label: '読み取り専用', props: { defaultValue: day, readOnly: true } },
];

const colors = ['neutral', 'primary', 'secondary'] as const;

const colorColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'フォーカス（年）', state: 'focus' },
];

const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: 'フォーカス（年）', state: 'focus' },
];

const placeholders = ['letters', 'units', 'dashes'] as const;
const locales = ['ja-JP', 'en-US', 'de-DE'] as const;

const meta = {
  title: 'Components/DateField',
  component: DateField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '日付を、年・月・日の区切りごとに打つ欄です。ラベル・キャプション・本体の並びや、`errorText`・`prefix`・`suffix`・`loading` などは TextField と同じです。',
          '',
          '- 区切りは ←→ で移り、↑↓ で 1 つずつ増減します（端まで行くと反対の端へ回ります）。数字を打つと埋まり、桁がそろうと次の区切りへ進みます。Backspace で 1 桁ずつ消えます。',
          '- 「2026/09/20」「20260920」「令和8年9月20日」のような文字を貼り付けると、読み取って区切りに入れます。全角の数字も読みます。直したことを知らせたいときは `halfWidthNotice` を付けます。読めないときは値を変えず、`onParseFailed` を呼びます。',
          '- 並びと記号は `locale` で決まります（ja-JP は 年/月/日）。',
          '- 値は `Temporal.PlainDate` で受け渡します。年・月・日がそろうまでは `null` です。`name` を渡すと、フォームには「2026-09-20」の形で送ります。',
          '- `min`・`max` の外の日が入ると、欄をエラーの見た目にします。理由の文は `errorText` で渡します。',
          '- `color` で、いま打っている区切りの塗りとフォーカスの枠線の色を選びます。既定はグレーの塗りです。',
          '- `id`・`ref`・`inputProps` は、区切りを並べる要素（`role="group"`）に付きます。`className` は欄の外枠に付きます。',
        ].join('\n'),
      },
    },
  },
  args: {
    label: '生年月日',
    captionPlacement: 'top',
    addonShape: 'attached',
    segmentPlaceholder: 'letters',
    color: 'neutral',
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
    color: {
      control: 'inline-radio',
      options: colors,
      table: { defaultValue: { summary: "'neutral'" } },
    },
    segmentPlaceholder: { control: 'inline-radio', options: placeholders },
    locale: { control: 'inline-radio', options: locales },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    loading: { control: 'boolean' },
    value: { control: false },
    defaultValue: { control: false },
    min: { control: false },
    max: { control: false },
  },
} satisfies Meta<typeof DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  args: { caption: '本人確認に使います' },
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
      focus: ['[data-preview="focus"] [data-segment="year"]'],
    },
    docs: {
      description: {
        story:
          'フォーカスは欄の枠線で示し、いま打っている区切りをグレーの塗りで示します。空の区切りには見本（yyyy・mm・dd）を淡い文字で出します。`min`・`max` の外の日は、欄をエラーの見た目にします。',
      },
      source: sourceCode(`
        <DateField label="生年月日" />
        <DateField label="生年月日" defaultValue={Temporal.PlainDate.from('2026-09-20')} />
        <DateField label="生年月日" errorText="生年月日を入力してください" />
        <DateField
          label="生年月日"
          defaultValue={Temporal.PlainDate.from('2026-09-20')}
          max={Temporal.PlainDate.from('2026-09-01')}
          errorText="9月1日までの日を入力してください"
        />
        <DateField label="生年月日" defaultValue={Temporal.PlainDate.from('2026-09-20')} disabled />
        <DateField label="生年月日" defaultValue={Temporal.PlainDate.from('2026-09-20')} readOnly />
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={stateRows}
      rowLabel={(row) => row.label}
      columns={stateColumns}
      columnWidth="14rem"
      renderCell={(row) => <DateField {...args} {...row.props} />}
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
      focus: ['[data-preview="focus"] [data-segment="year"]'],
    },
    docs: {
      description: {
        story:
          '`color` で欄の色を選びます。既定の `neutral` は、いま打っている区切りをグレーで塗ります。`primary`・`secondary` は、区切りをその色の淡い塗りにし、フォーカスの枠線もその色にします。フォームの中で色をそろえたいときに使います。',
      },
      source: sourceCode(`
        <DateField label="生年月日" />
        <DateField label="生年月日" color="primary" />
        <DateField label="生年月日" color="secondary" />
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={colors.map((color) => ({ label: color }))}
      rowLabel={(row) => row.label}
      columns={colorColumns}
      columnWidth="14rem"
      renderCell={(row) => <DateField {...args} defaultValue={day} color={row.label} />}
    />
  ),
};

export const Placeholders: Story = {
  tags: ['visual'],
  name: '空の区切りの見本',
  parameters: {
    controls: { exclude: ['segmentPlaceholder'] },
    docs: {
      description: {
        story:
          '`segmentPlaceholder` で、空の区切りに出す見本の書き方を選びます。`units` は単位の名前が短い言語（日本語など）だけで働き、ほかの言語では `letters` と同じです。',
      },
    },
  },
  render: (args) => (
    <Gallery columnWidth="14rem">
      {placeholders.map((style) => (
        <Specimen key={style} label={style}>
          <DateField {...args} segmentPlaceholder={style} />
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const Locales: Story = {
  tags: ['visual'],
  name: '言語ごとの並び',
  parameters: {
    controls: { exclude: ['locale'] },
    docs: {
      description: {
        story:
          '区切りの並びと記号は `locale` に従います。指定しないときは ThemeProvider の locale、なければ ja-JP です。',
      },
    },
  },
  render: (args) => (
    <Gallery columnWidth="14rem">
      {locales.map((locale) => (
        <Specimen key={locale} label={locale}>
          <DateField {...args} locale={locale} defaultValue={day} />
        </Specimen>
      ))}
    </Gallery>
  ),
};

// キー操作と読み上げの確かめ
// 値は文字（ISO 8601）にして記録する。Temporal の値どうしは、expect で中身を比べられないため
const keyboardChange = fn();

function KeyboardExample() {
  const [value, setValue] = useState<Temporal.PlainDate | null>(null);
  return (
    <form className="flex max-w-sm flex-col gap-3">
      <DateField
        label="生年月日"
        name="birthday"
        value={value}
        onValueChange={(next) => {
          setValue(next);
          keyboardChange(next?.toString() ?? null);
        }}
      />
      <output className="text-caption text-fg-subtle">値: {value?.toString() ?? 'null'}</output>
    </form>
  );
}

export const Keyboard: Story = {
  name: 'キー操作',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '数字を打つと区切りが埋まり、次へ進みます。月に「1」を打つと、10〜12 月かもしれないので待ち、「2」から先はすぐ次へ進みます。',
      },
    },
  },
  render: () => <KeyboardExample />,
  play: async ({ canvas, canvasElement }) => {
    const group = canvas.getByRole('group', { name: '生年月日' });
    const year = within(group).getByRole('spinbutton', { name: /^年/ });
    const month = within(group).getByRole('spinbutton', { name: /^月/ });
    const dayField = within(group).getByRole('spinbutton', { name: /^日/ });
    await expect(year).toHaveAccessibleName('年 生年月日');
    await expect(year).toHaveAttribute('aria-valuetext', '未入力');

    // ラベルを押すと、最初の空の区切りへ
    await userEvent.click(canvas.getByText('生年月日'));
    await expect(year).toHaveFocus();

    await userEvent.keyboard('2026');
    await expect(month).toHaveFocus();
    await userEvent.keyboard('9');
    await expect(dayField).toHaveFocus();
    await userEvent.keyboard('20');
    await expect(keyboardChange).toHaveBeenLastCalledWith('2026-09-20');
    await expect(month).toHaveAttribute('aria-valuetext', '9月');
    const hidden = canvasElement.querySelector<HTMLInputElement>('input[name="birthday"]');
    await expect(hidden?.value).toBe('2026-09-20');

    // ← で月へ戻り、↑ で 10 月へ
    await userEvent.keyboard('{ArrowLeft}{ArrowUp}');
    await expect(month).toHaveFocus();
    await expect(month).toHaveTextContent('10');
    await expect(keyboardChange).toHaveBeenLastCalledWith('2026-10-20');

    // 12 月の次は 1 月へ回る
    await userEvent.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}');
    await expect(month).toHaveAttribute('aria-valuenow', '1');

    // Backspace で消すと、値は null
    await userEvent.keyboard('{Backspace}');
    await expect(month).toHaveAttribute('aria-valuetext', '未入力');
    await expect(keyboardChange).toHaveBeenLastCalledWith(null);
    await expect(hidden?.value).toBe('');
  },
};

export const Paste: Story = {
  name: '貼り付け',
  args: { onValueChange: fn(), onParseFailed: fn() },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '区切りに文字を貼り付けると、全体を日付として読みます。「2026/09/20」「2026-9-20」「20260920」「令和8年9月20日」「R8.9.20」、全角の数字も読めます。読めないときは値を変えず、`onParseFailed` を呼びます。',
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
  play: async ({ canvas, args }) => {
    const [year] = canvas.getAllByRole('spinbutton');
    await userEvent.click(year);
    await userEvent.paste('令和８年９月２０日');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    const texts = canvas.getAllByRole('spinbutton').map((segment) => segment.textContent);
    await expect(texts).toEqual(['2026', '09', '20']);
    await userEvent.paste('きのう');
    await expect(args.onParseFailed).toHaveBeenCalledWith('きのう');
    await expect(year).toHaveTextContent('2026');
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
    const [year] = canvas.getAllByRole('spinbutton');
    await userEvent.click(year);
    await userEvent.paste('２０２６／０９／２０');
    await expect(canvas.getByText('全角の数字を半角に直しました')).toBeInTheDocument();
  },
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  args: { caption: '本人確認に使います', defaultValue: day },
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
        <DateField {...args} />
      </div>
    </DensityPair>
  ),
};
