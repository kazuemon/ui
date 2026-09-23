import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, fn, userEvent } from 'storybook/test';

import { Toggle, type ToggleProps } from './Toggle';
import { EyeIcon } from '../../internal/icons';
import { DensityPair, Matrix } from '../../stories/story-parts';
import { pressColumns, sourceCode, statePseudo } from '../../stories/story-states';

const variants = ['filled', 'soft', 'outline'] as const;
const colors = ['primary', 'secondary', 'neutral'] as const;
const colorColumns = colors.map((color) => ({ label: color, color }));

const meta = {
  title: 'Components/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '押した・押していないの二値を切り替えるボタンです。単独でも、値（`value`）を付けて `ToggleGroup` の中に並べても使えます。',
          '',
          '- 押していない（OFF）ときは、`color` を指定していても同じグレーです。色が付くのは押した（ON）ときだけです。',
          '- ON の塗りの強さは `variant` で選びます。`filled`（既定）は部品の色の濃い塗り、`soft` は淡い面（Chip・Tag と同じ）、`outline` は淡い面に部品の色の枠線を足します。',
          '- 色は `color` で選びます。指定しないときはグレー（`neutral`）です。',
          '- アイコンだけのトグルは `iconOnly` を付け、`aria-label` で読み上げの名前を必ず付けます。部品の高さの正方形になります。`shape="circle"` で丸にできます。',
        ].join('\n'),
      },
      source: { type: 'dynamic' },
    },
  },
  args: {
    children: '太字',
    variant: 'filled',
    color: 'neutral',
    disabled: false,
    defaultPressed: false,
    onPressedChange: fn(),
  },
  argTypes: {
    children: { control: 'text' },
    variant: {
      control: 'inline-radio',
      options: variants,
      table: { defaultValue: { summary: "'filled'" } },
    },
    color: {
      control: 'inline-radio',
      options: colors,
      table: { defaultValue: { summary: "'neutral'" } },
    },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<ToggleProps>;

export default meta;
type Story = StoryObj<Meta<ToggleProps>>;

export const Playground: Story = {
  name: '基本',
};

// Show code: 表（Matrix）の中身は出ないので、代表の使い方を source.code に手で書く
export const Variants: Story = {
  name: '色と塗りの強さ',
  tags: ['visual'],
  parameters: {
    controls: { exclude: ['variant', 'color'] },
    docs: {
      description: {
        story:
          '行が ON の塗りの強さ（`variant`）、列が色（`color`）です。どの行も、押していない（OFF）ときは同じグレーで、押す（ON）と色が付きます。',
      },
      source: sourceCode(`
        {/* variant: filled（既定）・soft・outline / color: primary・secondary・neutral（既定） */}
        <Toggle color="primary" defaultPressed>
          太字
        </Toggle>
        <Toggle variant="soft" color="primary" defaultPressed>
          太字
        </Toggle>
        <Toggle variant="outline" color="primary">
          太字
        </Toggle>
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={variants}
      rowLabel={(variant) => variant}
      columns={colorColumns}
      renderCell={(variant, { color }) => (
        <div className="flex gap-2">
          <Toggle {...args} variant={variant} color={color} defaultPressed={false} />
          <Toggle {...args} variant={variant} color={color} defaultPressed />
        </div>
      )}
    />
  ),
  play: async ({ canvas }) => {
    // outline は枠線の太さを常に確保しており（軸270）、OFF・ON・ほかの variant と外寸が1pxも変わらない
    const rects = canvas
      .getAllByRole('button', { name: '太字' })
      .map((button) => button.getBoundingClientRect());
    const [first, ...rest] = rects;
    for (const rect of rest) {
      await expect(rect.width).toBe(first.width);
      await expect(rect.height).toBe(first.height);
    }
  },
};

// Show code: 表（Matrix）の中身は出ないので、代表の使い方を source.code に手で書く
export const States: Story = {
  name: '状態',
  tags: ['visual'],
  parameters: {
    pseudo: statePseudo({ hover: 'button', active: 'button', focusVisible: 'button' }),
    controls: { exclude: ['variant', 'color', 'disabled'] },
    docs: {
      description: {
        story:
          'OFF は平らな押すものと同じ hover・押下（塗りの濃さ）です。ON はどちらの押下（OFF→ON・ON→OFF）でも沈み、塗りが濃くなります。フォーカスの線はキーボードで操作したときだけ出ます。',
      },
      source: sourceCode(`
        <Toggle color="primary">太字</Toggle>
        <Toggle color="primary" defaultPressed>
          太字
        </Toggle>
        <Toggle color="primary" disabled>
          太字
        </Toggle>
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={[false, true] as const}
      rowLabel={(pressed) => (pressed ? 'ON' : 'OFF')}
      columns={pressColumns}
      renderCell={(pressed, { disabled }) => (
        <Toggle {...args} color="primary" defaultPressed={pressed} disabled={disabled} />
      )}
    />
  ),
};

export const IconOnly: Story = {
  name: 'アイコンだけ',
  tags: ['visual'],
  parameters: {
    pseudo: statePseudo({ hover: 'button', active: 'button', focusVisible: 'button' }),
    controls: { exclude: ['variant', 'color', 'disabled', 'children'] },
    docs: {
      description: {
        story:
          '`iconOnly` を付けると、部品の高さの正方形になります。各セルの左が `shape="square"`（既定）、右が `shape="circle"`（丸）です。文字がないので、`aria-label` で読み上げの名前を必ず付けます（付けないと型で止まります）。',
      },
      source: sourceCode(`
        <Toggle iconOnly aria-label="表示を切り替える" color="primary">
          <EyeIcon standalone />
        </Toggle>
        <Toggle iconOnly shape="circle" aria-label="表示を切り替える" color="primary">
          <EyeIcon standalone />
        </Toggle>
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={variants}
      rowLabel={(variant) => variant}
      columns={pressColumns}
      columnWidth="5rem"
      renderCell={(variant, { disabled }) => (
        <div className="flex gap-2">
          <Toggle
            {...args}
            iconOnly
            aria-label="表示を切り替える"
            variant={variant}
            color="primary"
            disabled={disabled}
            defaultPressed
          >
            <EyeIcon standalone />
          </Toggle>
          <Toggle
            {...args}
            iconOnly
            shape="circle"
            aria-label="表示を切り替える"
            variant={variant}
            color="primary"
            disabled={disabled}
            defaultPressed
          >
            <EyeIcon standalone />
          </Toggle>
        </div>
      )}
    />
  ),
  play: async ({ canvas }) => {
    const buttons = canvas.getAllByRole('button', { name: '表示を切り替える' });
    const [square, circle] = buttons;
    const { width, height } = square.getBoundingClientRect();
    await expect(width).toBe(height);
    await expect(circle).toHaveAttribute('data-icon-only', 'circle');
  },
};

export const Densities: Story = {
  name: '密度',
  tags: ['visual'],
  render: (args) => (
    <DensityPair>
      <div className="flex flex-wrap gap-2">
        <Toggle {...args} color="primary" defaultPressed />
        <Toggle {...args} variant="outline" color="primary" />
      </div>
    </DensityPair>
  ),
};

// play: 読み上げや props の確かめ
export const Accessibility: Story = {
  name: '読み上げ',
  args: { color: 'primary' },
  play: async ({ args, canvas }) => {
    const button = canvas.getByRole('button', { name: '太字' });
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(args.onPressedChange).toHaveBeenCalledWith(true);
  },
};
