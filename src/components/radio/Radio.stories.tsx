import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, userEvent } from 'storybook/test';

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
          '- グループの `caption`・`error`・`warning` は、グループの説明です。選択肢1つずつの説明は、その `Radio` の `caption`（2 行目）だけです。',
          '- `color` は選んだときの色です。指定しないときは濃いグレー（`neutral`）です。',
          '- `readOnly` にすると、丸が押せないときと同じ見た目になります。横の文字は本文の色のままです。フォーカスはでき、読み上げでは「読み取り専用」と伝わります。値は変わりませんが、フォームでは送られます。',
        ].join('\n'),
      },
    },
  },
  args: {
    label: '配送の時間',
    color: 'neutral',
    disabled: false,
    readOnly: false,
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
    readOnly: { control: 'boolean' },
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
    const group = canvas.getByRole('radiogroup', { name: '配送の時間' });
    await expect(group).toHaveAttribute('aria-required', 'true');
    // グループのキャプションは、グループにだけ付く
    await expect(group).toHaveAccessibleDescription('必ず選んでください');
    // 1つずつのラジオの説明は、その選択肢の 2 行目だけ（グループのキャプションは二度読まない）
    await expect(canvas.getByRole('radio', { name: '午前' })).toHaveAccessibleDescription('');
    await expect(canvas.getByRole('radio', { name: '午後' })).toHaveAccessibleDescription(
      '14 時から 18 時'
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

export const ReadOnly: Story = {
  tags: ['visual'],
  name: '読み取り専用',
  args: { readOnly: true, defaultValue: 'am' },
  parameters: {
    controls: { exclude: ['readOnly'] },
    docs: {
      description: {
        story:
          '`readOnly` のグループは、丸が押せないときと同じ見た目になります。横の文字は読むための文字なので、本文の色のままです。フォーカスはでき、読み上げではグループが「読み取り専用」と伝わります。矢印キーでも押しても選び直せませんが、フォームでは値が送られます。',
      },
    },
  },
  play: async ({ canvas }) => {
    // 読み上げは「読み取り専用」（aria-readonly はグループが持つ。role="radio" は持てない）
    const group = canvas.getByRole('radiogroup', { name: '配送の時間' });
    await expect(group).toHaveAttribute('aria-readonly', 'true');
    const am = canvas.getByRole('radio', { name: '午前' });
    const pm = canvas.getByRole('radio', { name: '午後' });
    // 押せない（aria-disabled）とは伝えない
    await expect(am).not.toHaveAttribute('aria-disabled');
    // 押しても選び直せない
    await userEvent.click(pm);
    await expect(am).toHaveAttribute('aria-checked', 'true');
    await expect(pm).toHaveAttribute('aria-checked', 'false');
    // フォーカスできる（見た目の比較は、線のない状態で撮るので最後に外す）
    am.focus();
    await expect(am).toHaveFocus();
    am.blur();
  },
};
