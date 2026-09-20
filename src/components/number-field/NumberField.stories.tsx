import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
// 引数の userEvent は、LAN の IP で開いたとき（clipboard のない環境）は空になり、click などが呼べない
import { expect, fn, userEvent, waitFor } from 'storybook/test';

import { NumberField, type NumberFieldProps } from './NumberField';
import { DensityPair, Gallery, Matrix, Specimen } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';

type Sample = MatrixColumn & { props: Partial<NumberFieldProps> };

const steppers = ['split', 'stacked', 'none'] as const;

const stateRows: Sample[] = [
  { label: '空', props: { defaultValue: undefined, placeholder: '例: 3' } },
  { label: '値あり', props: { defaultValue: 3 } },
  { label: '上限に届いた', props: { defaultValue: 99 } },
  { label: 'エラー', props: { defaultValue: 0, error: '1 個以上にしてください' } },
  { label: '押せない', props: { defaultValue: 3, disabled: true } },
  { label: '読み取り専用', props: { defaultValue: 3, readOnly: true } },
];

const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: 'フォーカス', state: 'focus' },
];

const meta = {
  title: 'Components/NumberField',
  component: NumberField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '数を入力する欄です。増減ボタンと ↑↓ キーで増減し、表示の形（通貨・%・桁区切り）をそろえます。ラベル・キャプション・エラーなどは TextField と同じです。',
          '',
          '- `stepper` で増減ボタンの置き方を選びます。`split`（既定）は左に −・右に ＋、`stacked` は右端に ▲▼ を縦に積み、`none` はボタンを置きません。',
          '- `min`・`max` に届くと、その向きのボタンが押せなくなります。`step` はボタンと ↑↓ キーの幅で、Shift を押すと `largeStep`、Alt を押すと `smallStep` で増減します。',
          '- `format` に `Intl.NumberFormat` のオプションを渡すと、フォーカスが外れたときに表示の形をそろえます。`locale` で地域を決めます。',
          '- 全角の数字・「，」「．」・全角のマイナスも打てます。フォーカスが外れると半角の形に直ります。直したことを知らせたいときは `halfWidthNotice` を付けます。',
          '- `stepper="none"` では、ラベルを押したまま左右に動かしても増減できます（`scrub`）。フォーカス中のホイールでも増減します（`allowWheelScrub`）。',
          '- `prefix`・`suffix` は TextField と同じく文字かボタンを渡します。`split` では、文字は値のすぐ横に淡く置きます。',
        ].join('\n'),
      },
    },
  },
  // Controls で既定の値を選んだ状態から始める（部品の既定と同じ値）
  args: {
    label: '数量',
    defaultValue: 3,
    min: 0,
    max: 99,
    locale: 'ja-JP',
    stepper: 'split',
    captionPlacement: 'top',
    addonShape: 'attached',
    disabled: false,
    readOnly: false,
    loading: false,
    loadingBehavior: 'non-blocking',
    loadingIndicator: 'spinner',
  },
  argTypes: {
    label: { control: 'text' },
    caption: { control: 'text' },
    placeholder: { control: 'text' },
    error: { control: 'text' },
    warning: { control: 'text' },
    prefix: { control: 'text' },
    suffix: { control: 'text' },
    stepper: { control: 'inline-radio', options: steppers },
    captionPlacement: {
      control: 'inline-radio',
      options: ['top', 'bottom'],
      table: { defaultValue: { summary: "'top'" } },
    },
    addonShape: { control: 'inline-radio', options: ['attached', 'floating'] },
    scrub: { control: 'boolean', table: { defaultValue: { summary: "stepper === 'none'" } } },
    allowWheelScrub: {
      control: 'boolean',
      table: { defaultValue: { summary: "stepper === 'none'" } },
    },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number', table: { defaultValue: { summary: '1' } } },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  args: { caption: '99 個まで' },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
};

// Show code: 表（Matrix）の中身は出ないので、行ごとの使い方を source.code に手で書く
export const States: Story = {
  tags: ['visual'],
  name: '状態',
  parameters: {
    pseudo: statePseudo({ hover: '[data-slot="control"]', focusWithin: '[data-slot="control"]' }),
    docs: {
      description: {
        story:
          '見た目は TextField と同じです。`max` に届くと ＋ が、`min` に届くと − が押せなくなります。読み取り専用の欄には増減ボタンを出しません。',
      },
      source: sourceCode(`
        <NumberField label="数量" min={0} max={99} placeholder="例: 3" />
        <NumberField label="数量" min={0} max={99} defaultValue={3} />
        <NumberField label="数量" min={0} max={99} defaultValue={99} />
        <NumberField label="数量" min={0} max={99} defaultValue={0} error="1 個以上にしてください" />
        <NumberField label="数量" defaultValue={3} disabled />
        <NumberField label="数量" defaultValue={3} readOnly />
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={stateRows}
      rowLabel={(row) => row.label}
      columns={stateColumns}
      columnWidth="15rem"
      renderCell={(row) => <NumberField {...args} {...row.props} />}
    />
  ),
};

// Show code: 表（Matrix）の中身は出ないので、行と列の使い方を source.code に手で書く
export const Steppers: Story = {
  tags: ['visual'],
  name: '増減ボタンの置き方',
  parameters: {
    controls: { exclude: ['stepper', 'suffix', 'addonShape'] },
    docs: {
      description: {
        story: [
          '行が `stepper`、列が suffix と `addonShape` です。',
          '',
          '- `split`（既定）: 左に −、右に ＋。ボタンは本体と同じ高さで、指でも押しやすい大きさです。`prefix`・`suffix` の文字は値のすぐ横に置きます。',
          '- `stacked`: 右端に ▲▼ を縦に積みます。幅をとりませんが、1 つのボタンは本体の半分の高さです。マウスで使う画面に向きます。',
          '- `none`: ボタンを置きません。金額のように、打って入れる値に向きます。',
        ].join('\n'),
      },
      source: sourceCode(`
        <NumberField label="価格" defaultValue={1200} step={100} min={0} suffix="円" />
        <NumberField label="価格" defaultValue={1200} step={100} min={0} suffix="円" stepper="stacked" />
        <NumberField label="価格" defaultValue={1200} step={100} min={0} suffix="円" stepper="none" />
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={steppers}
      rowLabel={(stepper) => stepper}
      columns={[
        { label: 'suffix なし', props: {} },
        { label: 'suffix', props: { suffix: '円' } },
        { label: 'floating', props: { suffix: '円', addonShape: 'floating' as const } },
      ]}
      columnWidth="15rem"
      renderCell={(stepper, column) => (
        <NumberField
          {...args}
          label="価格"
          defaultValue={1200}
          step={100}
          min={0}
          max={undefined}
          {...column.props}
          stepper={stepper}
        />
      )}
    />
  ),
};

export const Formats: Story = {
  tags: ['visual'],
  name: '表示の形',
  parameters: {
    controls: { exclude: ['format', 'locale'] },
    docs: {
      description: {
        story:
          '`format` に `Intl.NumberFormat` のオプションを渡します。通貨（`style: "currency"`）・割合（`style: "percent"`。値は 0〜1）・小数の桁（`minimumFractionDigits`）などを指定できます。桁区切りは既定で付きます。数字は幅をそろえて並べます。',
      },
    },
  },
  render: (args) => (
    <Gallery>
      <Specimen label="桁区切り">
        <NumberField {...args} label="人数" defaultValue={1234567} max={undefined} />
      </Specimen>
      <Specimen label="通貨（円）">
        <NumberField
          {...args}
          label="価格"
          defaultValue={1200}
          step={100}
          max={undefined}
          format={{ style: 'currency', currency: 'JPY' }}
        />
      </Specimen>
      <Specimen label="割合">
        <NumberField
          {...args}
          label="割引"
          defaultValue={0.15}
          step={0.05}
          max={1}
          format={{ style: 'percent' }}
        />
      </Specimen>
      <Specimen label="小数 1 桁">
        <NumberField
          {...args}
          label="体重"
          defaultValue={62.5}
          step={0.1}
          max={undefined}
          suffix="kg"
          format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
        />
      </Specimen>
    </Gallery>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  args: { caption: '99 個まで' },
  parameters: {
    docs: {
      description: {
        story:
          '高さ・文字・余白は入力方式で切り替わります。`stacked` の 1 つのボタンは、どちらの密度でも本体の半分の高さです。',
      },
    },
  },
  render: (args) => (
    <DensityPair>
      {steppers.map((stepper) => (
        <div key={stepper} className="w-60">
          <NumberField {...args} stepper={stepper} />
        </div>
      ))}
    </DensityPair>
  ),
};

// 全角で打った値を、フォーカスが外れたときに半角の形に直す
function FullWidthField({ onValueChange }: { onValueChange: NumberFieldProps['onValueChange'] }) {
  const [value, setValue] = useState<number | null>(null);
  return (
    <NumberField
      label="価格"
      locale="ja-JP"
      suffix="円"
      value={value}
      onValueChange={(next, details) => {
        setValue(next);
        onValueChange?.(next, details);
      }}
    />
  );
}

export const FullWidth: Story = {
  name: '全角で打つ',
  args: { onValueChange: fn() },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '全角の数字と「，」も数として読みます。打っているあいだはそのまま見せ、フォーカスが外れると半角の桁区切りに直ります。',
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
  render: (args) => <FullWidthField onValueChange={args.onValueChange} />,
  play: async ({ canvas, args }) => {
    const input = canvas.getByLabelText('価格');
    await userEvent.click(input);
    await userEvent.keyboard('１，２３４');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(1234, expect.anything());
    await userEvent.tab();
    await expect(input).toHaveValue('1,234');
    // 全角のマイナスと小数点
    await userEvent.clear(input);
    await userEvent.keyboard('－１２．５');
    await userEvent.tab();
    await expect(args.onValueChange).toHaveBeenLastCalledWith(-12.5, expect.anything());
    await expect(input).toHaveValue('-12.5');
  },
};

export const FullWidthNotice: Story = {
  name: '全角を直したことを知らせる',
  args: { defaultValue: undefined, max: undefined, halfWidthNotice: true },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`halfWidthNotice` を付けると、全角を半角に直したときに、本体の下の情報の行で知らせます。文を渡すと、その文を出します。既定は知らせません。',
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
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('数量');
    await userEvent.click(input);
    await userEvent.keyboard('１２３');
    await expect(canvas.getByText('全角の数字を半角に直しました')).toBeInTheDocument();
    // 値を消すと知らせも消える（行は閉じる動きのあいだ残るので、見えなくなったことで確かめる）
    await userEvent.clear(input);
    await waitFor(() => expect(canvas.getByText('全角の数字を半角に直しました')).not.toBeVisible());
  },
};

export const Boundaries: Story = {
  name: '上限と下限',
  args: { defaultValue: 98, min: 0, max: 99 },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`max` に届くと ＋ が押せなくなります。ボタンはキーボードのフォーカスに入らず、キーボードでは ↑↓ キーで増減します。',
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
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('数量');
    const plus = canvas.getByRole('button', { name: '増やす' });
    const minus = canvas.getByRole('button', { name: '減らす' });
    await expect(plus).toBeEnabled();
    await userEvent.click(plus);
    await expect(input).toHaveValue('99');
    await expect(plus).toBeDisabled();
    await expect(minus).toBeEnabled();
    await userEvent.keyboard('{ArrowDown}');
    await expect(input).toHaveValue('98');
    await expect(plus).toBeEnabled();
  },
};

export const Scrub: Story = {
  name: 'ボタンなしで増減する',
  args: { stepper: 'none', label: '音量', defaultValue: 50, min: 0, max: 100 },
  parameters: {
    controls: { include: ['step', 'largeStep', 'smallStep', 'allowWheelScrub'] },
    docs: {
      description: {
        story:
          '`stepper="none"` では、ラベルを押したまま左右に動かすと増減します。フォーカスしているあいだは、↑↓ キーとホイールでも増減します。ボタンがないので、指で使う画面では打って入れる値に使います。',
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
    const input = canvas.getByLabelText('音量');
    await expect(canvas.queryByRole('button')).toBeNull();
    // ラベルの上の押せる範囲は、ラベルと同じ大きさ
    const scrub = canvasElement.querySelector<HTMLElement>('[data-slot="number-field-scrub"]');
    const label = canvasElement.querySelector<HTMLElement>('[data-slot="field-label"]');
    await expect(scrub?.getBoundingClientRect().height).toBe(label?.getBoundingClientRect().height);
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}{Shift>}{ArrowUp}{/Shift}');
    await expect(input).toHaveValue('61');
  },
};
