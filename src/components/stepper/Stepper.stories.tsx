import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  Stepper,
  type StepperColor,
  type StepperOrientation,
  type StepperVariant,
  StepperStep,
} from './Stepper';
import { DensityPair, Matrix } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';

const colors: StepperColor[] = ['neutral', 'primary', 'secondary'];

const steps = ['アカウント', 'お届け先', 'お支払い', '確認'];

/** 見本の Stepper。ネットショップの購入手続き（4 段）で、既定は 3 段目（index 2）がいまの段 */
function Sample({
  color,
  variant,
  orientation,
  defaultIndex = 2,
  invalidIndex,
  clickable = true,
}: {
  color?: StepperColor;
  variant?: StepperVariant;
  orientation?: StepperOrientation;
  defaultIndex?: number;
  invalidIndex?: number;
  clickable?: boolean;
}) {
  const [value, setValue] = useState(defaultIndex);
  return (
    <Stepper
      color={color}
      variant={variant}
      orientation={orientation}
      value={value}
      onStepClick={clickable ? setValue : undefined}
      accessibleName="購入手続き"
    >
      {steps.map((label, index) => (
        <StepperStep key={label} label={label} invalid={index === invalidIndex} />
      ))}
    </Stepper>
  );
}

const meta = {
  title: 'Components/Stepper',
  component: Stepper,
  subcomponents: { StepperStep },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '複数の段階の進み具合を示すナビゲーションです。フォームのウィザードなど、段を追って進む画面で使います。',
          '',
          '- `Stepper` の中に `StepperStep` を、進む順に並べます。段の中身（フォームなど）は持たないので、`value`（いまの段の index。0 から数える）を見て使う側が出し分けます。',
          '- `value` は常に制御です。`defaultValue` や非制御の形はありません。',
          '- `onStepClick` を渡すと、完了した段（いまの段より前、既定）が押せるようになります。押すとその段の index を渡して呼びます。値そのものは書き換えないので、呼ばれた側で `value` を更新します。渡さなければ、すべての段が表示専用になります。',
          '- `orientation` は並べる向きです。既定は `horizontal`（横に並べてラベルを下に）で、`vertical`（縦に積んでラベルを右に）を選べます。',
          '- `color` はいまの段・完了した段のマーカーの色です。指定しないときはグレー（`neutral`）です。',
          '- `variant` は完了した段のマーカーです。既定は `check`（チェックの印に差し替える）で、`number`（数字のまま色だけ変える）を選べます。',
          '- `StepperStep` の `description` にラベルの下へ添える説明を、`invalid` でその段をエラーの見た目にできます。',
        ].join('\n'),
      },
    },
  },
  // value は各ストーリーが Sample（内部で state を持つ見本）や直接の value 指定で渡すので、Controls には出さない
  args: { color: 'neutral', variant: 'check', orientation: 'horizontal', value: 2 },
  argTypes: {
    value: { control: false },
    color: {
      control: 'inline-radio',
      options: colors,
      table: { defaultValue: { summary: "'neutral'" } },
    },
    variant: {
      control: 'inline-radio',
      options: ['number', 'check'],
      table: { defaultValue: { summary: "'check'" } },
    },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      table: { defaultValue: { summary: "'horizontal'" } },
    },
    children: { control: false },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  parameters: {
    docs: {
      source: sourceCode(`
        const [value, setValue] = useState(2);

        <Stepper value={value} onStepClick={setValue} accessibleName="購入手続き">
          <StepperStep label="アカウント" />
          <StepperStep label="お届け先" />
          <StepperStep label="お支払い" />
          <StepperStep label="確認" />
        </Stepper>
      `),
    },
  },
  render: (args) => (
    <Sample color={args.color} variant={args.variant} orientation={args.orientation} />
  ),
};

const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'hover（完了した段）', state: 'hover' },
  { label: 'フォーカス（完了した段）', state: 'focus' },
];

// 1 つ目の段（完了・押せる）に hover・フォーカスを当てる
const firstControl = '[data-slot="stepper-step"]:nth-of-type(1) [data-clickable]';

export const States: Story = {
  tags: ['visual'],
  name: '色と状態',
  parameters: {
    controls: { disable: true },
    pseudo: statePseudo({ hover: firstControl, focusVisible: firstControl }),
  },
  render: () => (
    <Matrix
      rows={colors}
      columns={stateColumns}
      columnWidth="22rem"
      rowLabel={(color) => color}
      renderCell={(color) => <Sample color={color} />}
    />
  ),
};

export const Invalid: Story = {
  tags: ['visual'],
  name: 'エラーの段',
  parameters: {
    controls: { include: ['color'] },
    docs: {
      description: {
        story:
          '`StepperStep` の `invalid` を付けると、位置に関わらずその段を danger の色にします。完了・いまの段・これからの段のどれでも同じ見た目です。',
      },
    },
  },
  render: (args) => <Sample color={args.color} invalidIndex={1} />,
};

export const Variants: Story = {
  tags: ['visual'],
  name: '完了した段のマーカー',
  parameters: {
    controls: { include: ['color'] },
    docs: {
      description: {
        story: '`variant` で選びます。既定は `check`（チェックの印に差し替える）です。',
      },
    },
  },
  render: (args) => (
    <div className="grid gap-8">
      {(['number', 'check'] as const).map((variant) => (
        <div key={variant} className="grid gap-2">
          <span className="text-xs text-fg-subtle">variant=&quot;{variant}&quot;</span>
          <Sample color={args.color} variant={variant} />
        </div>
      ))}
    </div>
  ),
};

export const Vertical: Story = {
  tags: ['visual'],
  name: '縦向き',
  parameters: {
    controls: { include: ['color', 'variant'] },
    docs: {
      description: {
        story: '`orientation="vertical"` にすると、縦に積んでラベルを右に置きます。',
      },
      source: sourceCode(`
        <Stepper orientation="vertical" value={2} accessibleName="購入手続き">
          <StepperStep label="アカウント" description="メールアドレスとパスワード" />
          <StepperStep label="お届け先" />
          <StepperStep label="お支払い" />
          <StepperStep label="確認" />
        </Stepper>
      `),
    },
  },
  render: (args) => (
    <div className="w-[320px] max-w-full">
      <Stepper
        color={args.color}
        variant={args.variant}
        orientation="vertical"
        value={2}
        accessibleName="購入手続き"
      >
        <StepperStep label="アカウント" description="メールアドレスとパスワード" />
        <StepperStep label="お届け先" />
        <StepperStep label="お支払い" />
        <StepperStep label="確認" />
      </Stepper>
    </div>
  ),
};

export const Static: Story = {
  name: '表示専用',
  parameters: {
    controls: { include: ['color'] },
    docs: {
      description: {
        story:
          '`onStepClick` を渡さないと、完了した段も含めてすべての段が表示専用になります。注文の状況のように、戻れない進み具合を示すときはこの形にします。',
      },
    },
  },
  render: (args) => <Sample color={args.color} clickable={false} />,
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: { controls: { include: ['color'] } },
  render: (args) => (
    <DensityPair>
      <Sample color={args.color} />
    </DensityPair>
  ),
};

// play: 読み上げ（aria-current="step"・完了/エラーの状態文・aria-labelledby）、操作（onStepClick）、
//   押した段が表示専用に入れ替わったあとのフォーカスの戻りを確かめる
export const Accessibility: Story = {
  name: '読み上げと操作',
  parameters: { controls: { disable: true } },
  render: () => <Sample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const current = () => canvasElement.querySelector('[aria-current="step"]');
    await expect(current()).toHaveTextContent('お支払い');

    // 完了した段（アカウント・お届け先）だけが押せる。読み上げの名前にはラベルの後ろに「完了」が付く
    const account = canvas.getByRole('button', { name: 'アカウント 完了' });
    const address = canvas.getByRole('button', { name: 'お届け先 完了' });

    // いまの段・これからの段はボタンではない（表示専用。role="button" を付けない）
    await expect(canvas.queryByRole('button', { name: 'お支払い' })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: '確認' })).not.toBeInTheDocument();
    await expect(canvas.getByText('確認')).toBeVisible();

    // Tab は押せる段（アカウント → お届け先）だけを回る
    await userEvent.tab();
    await expect(account).toHaveFocus();
    await userEvent.tab();
    await expect(address).toHaveFocus();

    // 完了した段を押すと onStepClick(index) が呼ばれ、見本が value を更新していまの段になる。
    // 押した段（button）はその場で表示専用（div）に入れ替わるが、フォーカスは同じ場所（いまの段）に戻る
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(current()).toHaveTextContent('お届け先'));
    await waitFor(() => expect(current()).toHaveFocus());
    await expect(current()).not.toHaveAttribute('role');

    // それより前の段（アカウント）だけが引き続き完了で押せる
    await expect(canvas.getByRole('button', { name: 'アカウント 完了' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'お支払い' })).not.toBeInTheDocument();
  },
};
