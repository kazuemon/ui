import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, fn, userEvent } from 'storybook/test';

import {
  MaskField,
  type MaskFieldHintStyle,
  type MaskFieldProps,
  type MaskFieldValueDetails,
} from './MaskField';
import { DensityPair, Gallery, Matrix, Specimen } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';

// 携帯電話・IP 電話（070・080・090・050）は 3-4-4、ほかは 2-4-4（市外局番の桁は地域で違うので、ここでは 2 桁の例）
const phoneMask = (value: string) =>
  /^0[5789]0/.test(value.replace(/\D/g, '')) ? '###-####-####' : '##-####-####';

type Sample = MatrixColumn & { props: Partial<MaskFieldProps> };

const stateRows: Sample[] = [
  { label: '空', props: {} },
  { label: '途中', props: { defaultValue: '1500' } },
  { label: '値あり', props: { defaultValue: '1500042' } },
  { label: 'エラー', props: { defaultValue: '150', error: '郵便番号は7桁で入力してください' } },
  { label: '押せない', props: { defaultValue: '1500042', disabled: true } },
  { label: '読み取り専用', props: { defaultValue: '1500042', readOnly: true } },
];

const hintStyleRows: { label: string; style: MaskFieldHintStyle }[] = [
  { label: 'sample（既定）', style: 'sample' },
  { label: 'dot', style: 'dot' },
  { label: 'underscore', style: 'underscore' },
];

const hintStyleColumns: (MatrixColumn & { defaultValue?: string })[] = [
  { label: '空' },
  { label: '途中', defaultValue: '1500' },
  { label: '値あり', defaultValue: '1500042' },
];

const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: 'フォーカス', state: 'focus' },
];

const meta = {
  title: 'Components/MaskField',
  component: MaskField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '郵便番号・電話番号・カード番号・日付のように、書式の決まった値を打つ欄です。打つと区切りの記号を補い、書式にない文字は受け付けません。',
          '',
          '- `mask` は書式です。`#` は数字、`@` は英字、`*` は英数字の 1 桁で、ほかの文字はそのまま入ります（`###-####`）。桁数で書式が変わるときは、配列（短い順に当てはめます）か、打った値から書式を返す関数を渡します。桁の記号は `tokens` で足せます。',
          '- `onValueChange` は、書式付きの値（`150-0042`）と、記号を除いた値・桁が埋まったか（`{ unmasked: "1500042", completed: true }`）を渡します。フォームで送られるのは書式付きの値です。',
          '- `value`・`defaultValue` には、書式付きの値も記号を除いた値も渡せます。書式を当てて出します。',
          '- 全角の英数字（IME を入れたまま打った数字など）は、黙って半角に直して受けます。変換を確定するまでは書式を当てません。直したことを知らせたいときは `halfWidthNotice` を付けます。',
          '- 数字だけの書式では、スマートフォンで数字のキーボードを出します（`inputMode="numeric"`）。',
          '- 残りの桁の見本（`000-0000`）を淡く出し、打つ形と桁数を見せます。`maskHint` は出し方（既定はいつも出す `always`、フォーカスしているあいだだけの `focus`、出さない `none`）、`maskHintStyle` は見本の形です（既定は見本の文字の `sample`。数字の桁は 0、英字の桁は A）。',
          '- 打つ形は見本で見えるので、`placeholder` は使いません（非推奨）。書式や例は `caption`（「ハイフンは自動で入ります」「例: 150-0042」）で伝えます。',
          '- 電話番号の欄・郵便番号の欄のような個別の部品はありません。書式を渡して使います。',
          '- そのほかの props は TextField と同じです。',
        ].join('\n'),
      },
    },
  },
  args: {
    label: '郵便番号',
    mask: '###-####',
    caption: 'ハイフンは自動で入ります',
    maskHint: 'always',
    maskHintStyle: 'sample',
    disabled: false,
    readOnly: false,
    loading: false,
  },
  argTypes: {
    label: { control: 'text' },
    caption: { control: 'text' },
    mask: { control: 'text' },
    error: { control: 'text' },
    maskHint: { control: 'inline-radio', options: ['always', 'focus', 'none'] },
    maskHintStyle: { control: 'inline-radio', options: ['sample', 'dot', 'underscore'] },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
} satisfies Meta<typeof MaskField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  decorators: [
    (Story) => (
      <div className="max-w-sm">
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
          '空の欄でも、残りの桁の見本を淡く出します。押せない欄と読み取り専用の欄には、見本を出しません。',
      },
      source: sourceCode(`
        <MaskField label="郵便番号" mask="###-####" caption="ハイフンは自動で入ります" />
        <MaskField label="郵便番号" mask="###-####" defaultValue="1500042" />
        <MaskField label="郵便番号" mask="###-####" defaultValue="150" error="郵便番号は7桁で入力してください" />
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={stateRows}
      rowLabel={(row) => row.label}
      columns={stateColumns}
      columnWidth="16rem"
      renderCell={(row) => <MaskField {...args} {...row.props} />}
    />
  ),
};

export const HintStyles: Story = {
  tags: ['visual'],
  name: '見本の形',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`maskHintStyle` で残りの桁の見本の形を選びます。既定の `sample` は淡い見本の文字（数字の桁は 0、英字の桁は A）で、打ち終えたときの形がそのまま見えます。`dot` は •、`underscore` は _ を 1 桁ずつ出します。`underscore` は打った文字にも字間を空けるので、値も少し広がって見えます。',
      },
      source: sourceCode(`
        <MaskField label="郵便番号" mask="###-####" />
        <MaskField label="郵便番号" mask="###-####" maskHintStyle="dot" />
        <MaskField label="郵便番号" mask="###-####" maskHintStyle="underscore" />
      `),
    },
  },
  render: () => (
    <Matrix
      rows={hintStyleRows}
      rowLabel={(row) => row.label}
      columns={hintStyleColumns}
      columnWidth="16rem"
      renderCell={(row, column) => (
        <MaskField
          label="郵便番号"
          mask="###-####"
          maskHintStyle={row.style}
          defaultValue={column.defaultValue}
        />
      )}
    />
  ),
};

export const Formats: Story = {
  tags: ['visual'],
  name: 'よく使う書式',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '郵便番号、電話番号（桁で書式が変わる）、カード番号、日付の見本です。電話番号は、打った値から書式を返す関数で、携帯電話（090 など）と固定電話で区切りを変えています。',
      },
      source: sourceCode(`
        <MaskField label="郵便番号" mask="###-####" autoComplete="postal-code" />

        // 携帯電話（070・080・090・050）は 3-4-4、ほかは 2-4-4
        const phoneMask = (value: string) =>
          /^0[5789]0/.test(value.replace(/\\D/g, '')) ? '###-####-####' : '##-####-####';
        <MaskField label="電話番号" mask={phoneMask} type="tel" autoComplete="tel" />

        <MaskField label="カード番号" mask="#### #### #### ####" autoComplete="cc-number" />
        <MaskField label="生年月日" mask="####/##/##" caption="西暦で、年・月・日の順に入れます" />
      `),
    },
  },
  render: () => (
    <Gallery>
      <Specimen label="郵便番号">
        <MaskField
          label="郵便番号"
          mask="###-####"
          autoComplete="postal-code"
          defaultValue="1500042"
        />
      </Specimen>
      <Specimen label="電話番号（携帯）">
        <MaskField
          label="電話番号"
          mask={phoneMask}
          type="tel"
          autoComplete="tel"
          defaultValue="09012345678"
        />
      </Specimen>
      <Specimen label="電話番号（固定）">
        <MaskField
          label="電話番号"
          mask={phoneMask}
          type="tel"
          autoComplete="tel"
          defaultValue="0312345678"
        />
      </Specimen>
      <Specimen label="カード番号">
        <MaskField
          label="カード番号"
          mask="#### #### #### ####"
          autoComplete="cc-number"
          defaultValue="4242424242424242"
        />
      </Specimen>
      <Specimen label="日付">
        <MaskField
          label="生年月日"
          mask="####/##/##"
          caption="西暦で、年・月・日の順に入れます"
          defaultValue="20260920"
        />
      </Specimen>
    </Gallery>
  ),
};

function Controlled() {
  const [value, setValue] = useState('');
  const [details, setDetails] = useState<MaskFieldValueDetails>({
    unmasked: '',
    completed: false,
  });
  return (
    <div className="flex max-w-sm flex-col gap-3">
      <MaskField
        label="郵便番号"
        mask="###-####"
        value={value}
        onValueChange={(next, nextDetails) => {
          setValue(next);
          setDetails(nextDetails);
        }}
      />
      <p className="text-sm text-fg-muted">
        書式付き: {value || '（空）'} / 記号なし: {details.unmasked || '（空）'} /{' '}
        {details.completed ? '埋まった' : 'まだ'}
      </p>
    </div>
  );
}

export const ControlledValue: Story = {
  name: '値を受け取る',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`onValueChange` は、書式付きの値と、記号を除いた値・桁が埋まったかを渡します。サーバーに記号なしで送るときは `details.unmasked` を使います。',
      },
      source: sourceCode(`
        const [value, setValue] = useState('');
        <MaskField
          label="郵便番号"
          mask="###-####"
          value={value}
          onValueChange={(next, { unmasked, completed }) => setValue(next)}
        />
      `),
    },
  },
  render: () => <Controlled />,
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText<HTMLInputElement>('郵便番号');
    await expect(input).toHaveAttribute('inputmode', 'numeric');
    await userEvent.type(input, '1500042');
    await expect(input).toHaveValue('150-0042');
    await expect(canvas.getByText(/記号なし: 1500042/)).toBeInTheDocument();
    await expect(canvas.getByText(/埋まった/)).toBeInTheDocument();

    // 途中の桁を消しても、カーソルがその場に残る
    input.setSelectionRange(2, 2);
    await userEvent.keyboard('{Backspace}');
    await expect(input).toHaveValue('100-042');
    await expect(input.selectionStart).toBe(1);
    await userEvent.keyboard('5');
    await expect(input).toHaveValue('150-0042');
    await expect(input.selectionStart).toBe(2);
  },
};

export const FullWidth: Story = {
  name: '全角の数字',
  args: { onValueChange: fn() },
  parameters: {
    docs: {
      description: {
        story:
          'IME を入れたまま打った全角の数字は、黙って半角に直して受けます。変換を確定するまでは書式を当てず、確定したときに直します。',
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
    const input = canvas.getByLabelText('郵便番号');
    await userEvent.type(input, '１５０ー００４２');
    await expect(input).toHaveValue('150-0042');
    // 既定では知らせない
    await expect(canvas.queryByText('全角の数字を半角に直しました')).not.toBeInTheDocument();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('150-0042', {
      unmasked: '1500042',
      completed: true,
    });

    // IME で変換を確定するまでは書式を当てず、確定したときに直す
    await userEvent.clear(input);
    const valueDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    valueDescriptor?.set?.call(input, '１５００');
    input.dispatchEvent(
      new InputEvent('input', { bubbles: true, isComposing: true, data: '１５００' })
    );
    await expect(input).toHaveValue('１５００');
    input.dispatchEvent(
      new CompositionEvent('compositionend', { bubbles: true, data: '１５００' })
    );
    await expect(input).toHaveValue('150-0');
  },
};

export const FullWidthNotice: Story = {
  name: '全角を直したことを知らせる',
  args: { halfWidthNotice: true },
  parameters: {
    docs: {
      description: {
        story:
          '`halfWidthNotice` を付けると、全角を半角に直したときに、本体の下の情報の行で知らせます。文を渡すと、その文を出します。',
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
    const input = canvas.getByLabelText('郵便番号');
    await userEvent.type(input, '１５０ー００４２');
    await expect(input).toHaveValue('150-0042');
    await expect(canvas.getByText('全角の数字を半角に直しました')).toBeInTheDocument();
  },
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  args: { defaultValue: '1500042' },
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
        <MaskField {...args} />
      </div>
    </DensityPair>
  ),
};
