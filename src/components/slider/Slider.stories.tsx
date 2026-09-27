import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, fn, userEvent } from 'storybook/test';

import { Slider, type SliderProps } from './Slider';
import { DensityPair, Matrix } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';

const colors = ['primary', 'secondary', 'neutral'] as const;

type SliderColumn = MatrixColumn & { props?: Partial<SliderProps> };
const stateColumns: SliderColumn[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: 'フォーカス（キーボード）', state: 'focus' },
  { label: 'エラー', props: { errorText: '50 以下にしてください' } },
  { label: '押せない', props: { disabled: true } },
  { label: '読み取り専用', props: { readOnly: true } },
];

const meta = {
  title: 'Components/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'つまみを動かして、決まった範囲の中から 1 つの値を選びます。音量や明るさ、金額の上限のように、おおよその値を手早く決めるときに使います。',
          '決まった値を正確に打ってほしいときは NumberField を使います。',
          '',
          '- `min`〜`max`（既定は 0〜100）の中を、`step`（既定は 1）ずつ動きます。',
          '- キーボードでは ←→（↑↓）で `step`、Shift を押しながら、または PageUp・PageDown で `largeStep`（既定は 10）ずつ動きます。Home・End で端に移ります。',
          '- 値の文字はラベルの行の右端に出ます。`hideValue` で隠せます。`format` で数の整え方を、`getValueText` で文字そのもの（「30 分」）を変えられます。読み上げも同じ文字になります。',
          '- `color` で塗りとフォーカスの線の色を選びます。指定しないときは濃いグレーです。',
          '- `onValueChange` は引いているあいだも呼ばれます。値が決まったときだけ知りたいときは `onValueCommitted` を使います。',
          '- `readOnly` は押せないときと同じ見た目ですが、フォーカスでき、フォームでは値が送られます。',
        ].join('\n'),
      },
    },
  },
  args: { label: '音量', defaultValue: 40, color: 'neutral', hideValue: false },
  argTypes: {
    label: { control: 'text' },
    caption: { control: 'text' },
    errorText: { control: 'text' },
    color: {
      control: 'inline-radio',
      options: colors,
      table: { defaultValue: { summary: "'neutral'" } },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const States: Story = {
  tags: ['visual'],
  name: '色と状態',
  parameters: {
    controls: { exclude: ['color'] },
    pseudo: statePseudo({
      hover: '[data-slot="slider-control"]',
      focusVisible: '[data-slot="slider-thumb"] input',
    }),
    docs: {
      description: {
        story:
          'hover で地が少し濃くなります。フォーカスの線はキーボードで操作したときだけ、つまみの外側に出ます。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[1160px] max-w-none">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Matrix
      rows={colors}
      columns={stateColumns}
      columnWidth="9rem"
      rowLabel={(color) => color}
      renderCell={(color, column) => <Slider {...args} color={color} {...column.props} />}
    />
  ),
};

export const Parts: Story = {
  tags: ['visual'],
  name: 'ラベル・キャプション・値の文字',
  parameters: {
    docs: {
      source: sourceCode(`
        <Slider label="明るさ" defaultValue={0.6} min={0} max={1} step={0.05} format={{ style: 'percent' }} />
        <Slider
          label="作業の時間"
          defaultValue={30}
          min={5}
          max={120}
          step={5}
          getValueText={(_, value) => \`\${value} 分\`}
        />
      `),
    },
  },
  render: () => (
    <div className="flex flex-col gap-6">
      <Slider label="音量" defaultValue={0} />
      <Slider label="音量" defaultValue={100} color="primary" />
      <Slider
        label="明るさ"
        defaultValue={0.6}
        min={0}
        max={1}
        step={0.05}
        format={{ style: 'percent' }}
        caption="画面の明るさを変えます"
      />
      <Slider
        label="作業の時間"
        defaultValue={30}
        min={5}
        max={120}
        step={5}
        getValueText={(_, value) => `${value} 分`}
        caption="5 分ずつ選べます"
        captionPlacement="bottom"
      />
      <Slider label="値の文字なし" defaultValue={25} hideValue />
      <Slider
        label="とても長いラベルが入ったときに、値の文字を押し出さずにラベルの側が折り返すことを確かめる見本"
        defaultValue={1200}
        min={0}
        max={5000}
        step={100}
        format={{ style: 'currency', currency: 'JPY' }}
        locale="ja-JP"
      />
    </div>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  decorators: [
    (Story) => (
      <div className="w-[720px] max-w-none">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <DensityPair>
      <div className="w-[300px]">
        <Slider {...args} color="primary" />
      </div>
    </DensityPair>
  ),
};

const sliderOf = (canvasElement: HTMLElement) => {
  const input = canvasElement.querySelector<HTMLInputElement>('input[type="range"]');
  if (!input) throw new Error('スライダーが見つかりません');
  return input;
};

export const Keyboard: Story = {
  name: 'キーボード',
  args: { onValueChange: fn(), onValueCommitted: fn(), defaultValue: 40 },
  play: async ({ canvas, canvasElement, args }) => {
    const slider = canvas.getByRole('slider', { name: '音量' });
    const valueText = canvasElement.querySelector('[data-slot="slider-value"]');
    await userEvent.tab();
    await expect(slider).toHaveFocus();
    // ←→ で step（1）
    await userEvent.keyboard('{ArrowRight}');
    await expect(slider).toHaveAttribute('aria-valuenow', '41');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(41);
    await expect(args.onValueCommitted).toHaveBeenLastCalledWith(41);
    await expect(valueText).toHaveTextContent('41');
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    await expect(slider).toHaveAttribute('aria-valuenow', '39');
    // Shift と PageUp で largeStep（10）
    await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
    await expect(slider).toHaveAttribute('aria-valuenow', '49');
    await userEvent.keyboard('{PageUp}');
    await expect(slider).toHaveAttribute('aria-valuenow', '59');
    // Home・End で端へ
    await userEvent.keyboard('{End}');
    await expect(slider).toHaveAttribute('aria-valuenow', '100');
    await userEvent.keyboard('{Home}');
    await expect(slider).toHaveAttribute('aria-valuenow', '0');
    await expect(sliderOf(canvasElement).value).toBe('0');
  },
};

// トラックの、左端から幅の ratio の位置を押す
const pressAt = async (control: Element, ratio: number) => {
  const rect = control.getBoundingClientRect();
  await userEvent.pointer({
    keys: '[MouseLeft]',
    target: control,
    coords: { clientX: rect.left + rect.width * ratio, clientY: rect.top + rect.height / 2 },
  });
};

export const Pointer: Story = {
  name: 'トラックを押す',
  args: { onValueCommitted: fn() },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Slider {...args} label="音量" defaultValue={0} />
      <Slider {...args} label="読み取り専用" defaultValue={0} readOnly />
    </div>
  ),
  play: async ({ canvas, canvasElement, args }) => {
    const [control, readOnlyControl] = canvasElement.querySelectorAll(
      '[data-slot="slider-control"]'
    );
    // 押した位置へ動く
    await pressAt(control, 0.75);
    const value = Number(
      canvas.getByRole('slider', { name: '音量' }).getAttribute('aria-valuenow')
    );
    await expect(value).toBeGreaterThan(65);
    await expect(value).toBeLessThan(85);
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
    // 読み取り専用は動かない
    await pressAt(readOnlyControl, 0.75);
    await expect(canvas.getByRole('slider', { name: '読み取り専用' })).toHaveAttribute(
      'aria-valuenow',
      '0'
    );
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
  },
};

export const Accessibility: Story = {
  name: '読み上げ',
  args: {
    label: '作業の時間',
    defaultValue: 30,
    min: 5,
    max: 120,
    step: 5,
    getValueText: (_, value) => `${value} 分`,
    caption: '5 分ずつ選べます',
    errorText: '60 分以下にしてください',
  },
  play: async ({ canvas, canvasElement }) => {
    // 名前はラベル、値は aria-valuenow と、getValueText の文
    const slider = canvas.getByRole('slider', { name: '作業の時間' });
    await expect(slider).toHaveAttribute('aria-valuenow', '30');
    await expect(slider).toHaveAttribute('min', '5');
    await expect(slider).toHaveAttribute('max', '120');
    await expect(slider).toHaveAttribute('aria-valuetext', '30 分');
    await expect(slider).toHaveAttribute('aria-invalid', 'true');
    // 説明は見た目の順（キャプション → エラー）で、1 回ずつ
    const describedBy = (slider.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean);
    await expect(new Set(describedBy).size).toBe(describedBy.length);
    await expect(describedBy.map((id) => document.getElementById(id)?.textContent)).toEqual([
      '5 分ずつ選べます',
      '60 分以下にしてください',
    ]);
    // 見えている値の文字は、読み上げから外す（値は本体が伝える）
    const valueText = canvasElement.querySelector('[data-slot="slider-value"]');
    await expect(valueText).toHaveTextContent('30 分');
    await expect(valueText).toHaveAttribute('aria-hidden', 'true');
  },
};

export const ReadOnly: Story = {
  name: '読み取り専用・押せない',
  args: { onValueChange: fn() },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Slider {...args} label="読み取り専用" defaultValue={40} readOnly />
      <Slider {...args} label="押せない" defaultValue={40} disabled />
    </div>
  ),
  play: async ({ canvas, args }) => {
    // 読み取り専用: フォーカスでき、読み上げで伝わり、キーでも値は変わらない
    const readOnly = canvas.getByRole('slider', { name: '読み取り専用' });
    await userEvent.tab();
    await expect(readOnly).toHaveFocus();
    await expect(readOnly).toHaveAttribute('aria-readonly', 'true');
    await userEvent.keyboard('{ArrowRight}{End}');
    await expect(readOnly).toHaveAttribute('aria-valuenow', '40');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    // 押せない: フォーカスもできない
    const disabled = canvas.getByRole('slider', { name: '押せない' });
    await expect(disabled).toBeDisabled();
    await userEvent.tab();
    await expect(disabled).not.toHaveFocus();
  },
};

export const InForm: Story = {
  name: 'フォームに送る値',
  render: () => (
    <form className="flex flex-col gap-6">
      <Slider label="音量" name="volume" defaultValue={40} />
      <Slider label="読み取り専用" name="fixed" defaultValue={70} readOnly />
      <Slider label="押せない" name="off" defaultValue={10} disabled />
    </form>
  ),
  play: async ({ canvasElement }) => {
    const form = canvasElement.querySelector('form');
    if (!form) throw new Error('フォームが見つかりません');
    const data = new FormData(form);
    await expect(data.get('volume')).toBe('40');
    // 読み取り専用は送り、押せないものは送らない
    await expect(data.get('fixed')).toBe('70');
    await expect(data.has('off')).toBe(false);
  },
};
