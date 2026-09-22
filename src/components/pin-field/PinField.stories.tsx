import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
// 引数の userEvent は、LAN の IP で開いたとき（clipboard のない環境）は空になり、click などが呼べない
import { expect, fn, userEvent, waitFor } from 'storybook/test';

import { PinField, type PinFieldProps } from './PinField';
import { DensityPair, Gallery, Matrix, Specimen } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';

type Sample = MatrixColumn & { props: Partial<PinFieldProps> };

const stateRows: Sample[] = [
  { label: '空', props: {} },
  { label: '途中まで', props: { defaultValue: '382' } },
  { label: '全部', props: { defaultValue: '382915' } },
  { label: 'エラー', props: { defaultValue: '382915', errorText: 'コードが違います' } },
  { label: '押せない', props: { defaultValue: '382915', disabled: true } },
  { label: '読み取り専用', props: { defaultValue: '382915', readOnly: true } },
  { label: '伏せ字', props: { defaultValue: '3829', mask: true } },
];

const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'hover（1 桁目）', state: 'hover' },
  { label: 'フォーカス（1 桁目）', state: 'focus' },
];

// 1 桁目の箱だけに状態を当てる
const firstBox = '[data-slot="pin-field-group"]:first-of-type > [data-slot="control"]:first-child';

const behaviors = ['non-blocking', 'blocking'] as const;

const meta = {
  title: 'Components/PinField',
  component: PinField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '確認コードや PIN を、1 桁ずつの箱に打つ欄です。SMS やメールで届いたコードの入力に使います。',
          '',
          '- 打つと次の箱へ進み、Backspace で前の箱へ戻ります。コードを貼り付けると、先頭から埋まります。',
          '- 1 桁目に `autocomplete="one-time-code"` を付けるので、SMS で届いたコードを端末が差し出せます。',
          '- 全角の数字は半角に直して受け取ります。直したことを知らせたいときは `halfWidthNotice` を付けます。`validationType` で、入れてよい文字（数字・英字・英数字）を選びます。',
          '- 全部の桁が埋まったら `onValueCompleted` が呼ばれます。`autoSubmit` を付けると、囲んでいる form を送ります。',
          "- 桁が多いときは `group` で区切ります。`[3, 3]` は 3 桁ずつのあいだに短い横線を置きます。区切りに置くものは `groupSeparator` で変えられます（`'-'` などの文字、`null` で間だけ）。",
          '- `showEmptyDots` を付けると、まだ打っていない箱に淡い点を置きます。あと何桁あるかが一目で分かります。',
          '- コードを確かめているあいだは `loading` を付けます。箱の列の右に回る円を出します。',
        ].join('\n'),
      },
    },
  },
  args: {
    label: '確認コード',
    length: 6,
    validationType: 'numeric',
    mask: false,
    showEmptyDots: false,
    autoSubmit: false,
    disabled: false,
    readOnly: false,
    loading: false,
    loadingBehavior: 'non-blocking',
  },
  argTypes: {
    label: { control: 'text' },
    caption: { control: 'text' },
    errorText: { control: 'text' },
    length: { control: { type: 'number', min: 1, max: 10 } },
    validationType: {
      control: 'inline-radio',
      options: ['numeric', 'alpha', 'alphanumeric', 'none'],
    },
    group: { control: 'object' },
    groupSeparator: { control: 'text' },
    showEmptyDots: { control: 'boolean' },
    mask: { control: 'boolean' },
    autoSubmit: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    loading: { control: 'boolean' },
    loadingBehavior: { control: 'inline-radio', options: behaviors },
  },
} satisfies Meta<typeof PinField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  args: { caption: 'メールで届いた 6 桁の数字を入力してください' },
};

// Show code: 表（Matrix）の中身は出ないので、行ごとの使い方を source.code に手で書く
export const States: Story = {
  tags: ['visual'],
  name: '状態',
  parameters: {
    pseudo: statePseudo({ hover: firstBox, focusWithin: firstBox }),
    docs: {
      description: {
        story:
          '箱 1 つずつは、ほかの入力欄と同じ見え方です。グレーの塗りで枠線がなく、フォーカスした箱にだけ枠線が付きます。エラーのあいだは、全部の箱が赤い枠線になります。',
      },
      source: sourceCode(`
        <PinField label="確認コード" />
        <PinField label="確認コード" defaultValue="382915" errorText="コードが違います" />
        <PinField label="確認コード" defaultValue="382915" disabled />
        <PinField label="確認コード" defaultValue="382915" readOnly />
        <PinField label="PIN" length={4} mask />
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={stateRows}
      rowLabel={(row) => row.label}
      columns={stateColumns}
      columnWidth="20rem"
      renderCell={(row) => <PinField {...args} {...row.props} />}
    />
  ),
};

export const Messages: Story = {
  tags: ['visual'],
  name: 'キャプション・エラー・区切り',
  render: (args) => (
    <Gallery columnWidth="21rem">
      <Specimen label="caption">
        <PinField {...args} caption="メールで届いた 6 桁の数字を入力してください" />
      </Specimen>
      <Specimen label="errorText">
        <PinField
          {...args}
          caption="メールで届いた 6 桁の数字を入力してください"
          defaultValue="382915"
          errorText="コードが違います。もう一度お確かめください"
        />
      </Specimen>
      <Specimen label="successText">
        <PinField {...args} defaultValue="382915" successText="確かめました" />
      </Specimen>
      <Specimen label="group={[3, 3]}">
        <PinField {...args} group={[3, 3]} defaultValue="3829" />
      </Specimen>
      <Specimen label="length={4}・mask">
        <PinField {...args} label="PIN" length={4} mask defaultValue="38" />
      </Specimen>
    </Gallery>
  ),
};

export const Separators: Story = {
  tags: ['visual'],
  name: '区切りと空の箱の点',
  parameters: {
    docs: {
      description: {
        story:
          '`group` の区切りには、既定で短い横線を置きます。`groupSeparator` に文字を渡すと、打った文字と同じ大きさで淡く描きます。`null` は何も置かず、間だけ空けます。区切りは読み上げません。`showEmptyDots` は、まだ打っていない箱に淡い点を置きます。伏せ字と合わせても使えます。',
      },
    },
  },
  render: (args) => (
    <Gallery columnWidth="21rem">
      <Specimen label="group={[3, 3]}">
        <PinField {...args} group={[3, 3]} defaultValue="3829" />
      </Specimen>
      <Specimen label={'groupSeparator="-"'}>
        <PinField {...args} group={[3, 3]} groupSeparator="-" defaultValue="3829" />
      </Specimen>
      <Specimen label={'groupSeparator="/"・group={[2, 2, 2]}'}>
        <PinField {...args} group={[2, 2, 2]} groupSeparator="/" defaultValue="3829" />
      </Specimen>
      <Specimen label="groupSeparator={null}">
        <PinField {...args} group={[3, 3]} groupSeparator={null} defaultValue="3829" />
      </Specimen>
      <Specimen label="showEmptyDots">
        <PinField {...args} showEmptyDots defaultValue="382" />
      </Specimen>
      <Specimen label="showEmptyDots・mask">
        <PinField {...args} label="PIN" length={4} mask showEmptyDots defaultValue="38" />
      </Specimen>
      <Specimen label="showEmptyDots・errorText">
        <PinField {...args} showEmptyDots defaultValue="382" errorText="コードが違います" />
      </Specimen>
      <Specimen label={'showEmptyDots・group・groupSeparator="-"'}>
        <PinField {...args} showEmptyDots group={[3, 3]} groupSeparator="-" defaultValue="38" />
      </Specimen>
    </Gallery>
  ),
  play: async ({ canvasElement }) => {
    // 区切りは読ませない
    for (const separator of canvasElement.querySelectorAll('[data-slot="pin-field-separator"]')) {
      await expect(separator).toHaveAttribute('aria-hidden', 'true');
    }
  },
};

// Show code: 表（Matrix）の中身は出ないので、行の使い方を source.code に手で書く
export const Loading: Story = {
  name: '待っているあいだ',
  args: { defaultValue: '382915', loading: true },
  parameters: {
    controls: { exclude: ['loadingBehavior'] },
    docs: {
      description: {
        story:
          'コードを確かめているあいだは、箱の列の右に回る円を出します。`blocking` では押せない欄と同じ見た目にし、書き換えられなくします。どちらもフォーカスは外れません。',
      },
      source: sourceCode(`
        <PinField label="確認コード" defaultValue="382915" loading />
        <PinField label="確認コード" defaultValue="382915" loading loadingBehavior="blocking" />
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={behaviors}
      rowLabel={(behavior) => behavior}
      columns={[{ label: 'spinner' }]}
      columnWidth="22rem"
      renderCell={(behavior) => <PinField {...args} loadingBehavior={behavior} />}
    />
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  args: { caption: 'メールで届いた 6 桁の数字を入力してください', defaultValue: '382' },
  render: (args) => (
    <DensityPair>
      <div className="w-80">
        <PinField {...args} />
      </div>
    </DensityPair>
  ),
};

// 読み上げ・値の直し・埋まったときの呼び出しを確かめる
function Controlled({ onComplete }: { onComplete: (value: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <div className="flex flex-col gap-3">
      <PinField
        label="確認コード"
        caption="メールで届いた 6 桁の数字"
        value={value}
        onValueChange={setValue}
        onValueCompleted={onComplete}
      />
      <output data-testid="value">{value}</output>
    </div>
  );
}

export const Behavior: Story = {
  name: '打つ',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '打つと次の箱へ進みます。全角の数字は半角に直し、数字でない文字は受け取りません。全部の桁が埋まると `onValueCompleted` が呼ばれます。',
      },
    },
  },
  args: { onValueCompleted: fn() },
  render: (args) => <Controlled onComplete={args.onValueCompleted ?? (() => {})} />,
  play: async ({ canvas, args }) => {
    const first = canvas.getByRole('textbox', { name: '確認コード' });
    await expect(first).toHaveAttribute('autocomplete', 'one-time-code');
    await expect(first).toHaveAttribute('inputmode', 'numeric');
    // 2 桁目からは「n 桁目」で読む
    await expect(canvas.getByLabelText('2 桁目（全 6 桁）')).toBeInTheDocument();
    // キャプションが、1 桁目と箱の並び（group）の説明につながる
    const caption = canvas.getByText('メールで届いた 6 桁の数字');
    await expect(first.getAttribute('aria-describedby')).toContain(caption.id);
    await expect(canvas.getByRole('group').getAttribute('aria-describedby')).toContain(caption.id);

    await userEvent.click(first);
    // 全角の数字は半角に、英字は捨てる
    await userEvent.keyboard('３8a2');
    await expect(canvas.getByTestId('value')).toHaveTextContent('382');
    await expect(canvas.getByLabelText('4 桁目（全 6 桁）')).toHaveFocus();
    await userEvent.keyboard('915');
    await waitFor(() => expect(args.onValueCompleted).toHaveBeenCalledWith('382915'));
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
          '`halfWidthNotice` を付けると、全角を半角に直したときに、本体の下の情報の行で知らせます。文を渡すと、その文を出します。既定は知らせません。',
      },
    },
  },
  play: async ({ canvas }) => {
    const first = canvas.getByRole('textbox', { name: '確認コード' });
    await userEvent.click(first);
    await userEvent.keyboard('３８２');
    await expect(canvas.getByText('全角の数字を半角に直しました')).toBeInTheDocument();
  },
};

export const Invalid: Story = {
  name: 'エラーの読み上げ',
  parameters: { controls: { disable: true } },
  args: { errorText: 'コードが違います', defaultValue: '382915' },
  play: async ({ canvas }) => {
    const first = canvas.getByRole('textbox', { name: '確認コード' });
    await expect(first).toHaveAttribute('aria-invalid', 'true');
    const message = canvas.getByText('コードが違います').closest('[id]');
    await expect(first.getAttribute('aria-describedby')).toContain(message?.id);
  },
};
