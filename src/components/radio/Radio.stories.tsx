import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Radio, RadioGroup } from './Radio';

const colors = ['primary', 'secondary', 'neutral'] as const;

const meta = {
  title: 'Components/Radio',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '1つだけ選ぶ問いのラジオです。`RadioGroup` の中に `Radio` を `value` 付きで置きます。横の文字を押しても選ばれます。',
          '',
          '- `required` で必須にします。見出しの後ろに印（既定は「必須」のタグ）が出て、グループに aria-required が付きます。印は読み上げから外れ、必須であることは aria-required が伝えます。印の形は `requiredMark` で変えられます。',
          '- `error`・`warning` は選択肢の下に、入力欄と同じ行で出します。',
          '- `color` は選んだときの色です。指定しないときは濃いグレー（`neutral`）です。',
        ].join('\n'),
      },
    },
  },
  args: {
    label: '配送の時間',
    color: 'neutral',
    disabled: false,
    required: false,
    children: null,
  },
  argTypes: {
    label: { control: 'text' },
    caption: { control: 'text' },
    error: { control: 'text' },
    warning: { control: 'text' },
    color: {
      control: 'inline-radio',
      options: colors,
      table: { defaultValue: { summary: "'neutral'" } },
    },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    children: { control: false },
  },
  render: (args) => (
    <div className="max-w-sm">
      <RadioGroup {...args}>
        <Radio value="am" label="午前" />
        <Radio value="pm" label="午後" caption="14 時から 18 時" />
        <Radio value="night" label="夜" disabled />
      </RadioGroup>
    </div>
  ),
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  args: { defaultValue: 'am' },
};

export const Required: Story = {
  name: '必須',
  args: { required: true, caption: '必ず選んでください' },
  parameters: {
    docs: {
      description: {
        story:
          '`required` を付けると、見出しの後ろに「必須」のタグが出て、グループ（role="radiogroup"）に aria-required が付きます。印は読み上げから外れます。印の形は `requiredMark`（`tag`・`asterisk`・`none`）で変えられます。',
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('radiogroup', { name: '配送の時間' })).toHaveAttribute(
      'aria-required',
      'true'
    );
  },
};

export const Messages: Story = {
  tags: ['visual'],
  name: 'エラー',
  args: { required: true, error: '配送の時間を選んでください' },
  parameters: {
    docs: {
      description: {
        story:
          'エラーは選択肢の下に丸の「!」と赤い文字で出し、選んでいない丸の塗りを淡い赤にします。押せない選択肢（夜）は、エラーでも押せない丸の色のままです。行はグループの説明につながります。',
      },
    },
  },
};
