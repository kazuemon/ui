import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Button } from '../button/Button';
import { Checkbox } from '../checkbox/Checkbox';
import { FieldGroup } from '../field/FieldGroup';
import { Radio, RadioGroup } from '../radio/Radio';
import { Select } from '../select/Select';
import { Switch } from '../switch/Switch';
import { TextField } from '../text-field/TextField';
import { Fieldset } from './Fieldset';

const meta = {
  title: 'Components/Fieldset',
  component: Fieldset,
  parameters: {
    docs: {
      description: {
        component: [
          'いくつかの欄を、1 つの問いのまとまりにします（住所、支払い方法など）。',
          '',
          '- 見出し（`label`）はまとまりの名前として、ヘルプテキスト（`caption`）はまとまりの説明として読み上げます',
          '- 選択肢が 1 つの問いに答えるときは、Fieldset ではなく RadioGroup・CheckboxGroup を使います。どちらも見出しがグループの名前になります',
          '- `disabled` で、中の欄とボタンをまとめて押せなくします',
          '- ラベルを横に置いて列をそろえるときは、中に `FieldGroup` を置きます',
        ].join('\n'),
      },
    },
  },
  args: { label: '住所' },
} satisfies Meta<typeof Fieldset>;
export default meta;
type Story = StoryObj<typeof meta>;

const prefectures = [
  { label: '東京都', value: 'tokyo' },
  { label: '大阪府', value: 'osaka' },
];

function AddressFields() {
  return (
    <>
      <TextField label="郵便番号" defaultValue="150-0001" />
      <Select label="都道府県" items={prefectures} defaultValue="tokyo" />
      <TextField label="市区町村・番地" defaultValue="渋谷区神宮前 1-2-3" />
    </>
  );
}

export const Playground: Story = {
  args: { caption: '請求書の送り先です' },
  render: (args) => (
    <div className="max-w-md">
      <Fieldset {...args}>
        <AddressFields />
      </Fieldset>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: '住所' });
    await expect(group).toHaveAccessibleDescription('請求書の送り先です');
  },
};

export const States: Story = {
  tags: ['visual'],
  render: () => (
    <div className="flex max-w-md flex-col gap-12">
      <Fieldset label="住所" caption="請求書の送り先です">
        <AddressFields />
      </Fieldset>
      <Fieldset label="配送">
        <RadioGroup label="配送方法" defaultValue="normal">
          <Radio value="normal" label="通常配送" caption="3〜5 日" />
          <Radio value="express" label="お急ぎ便" caption="翌日" />
        </RadioGroup>
        <Checkbox label="置き配を使う" />
      </Fieldset>
    </div>
  ),
};

export const Disabled: Story = {
  tags: ['visual'],
  render: () => (
    <div className="max-w-md">
      <Fieldset label="通知" caption="プランを変えると設定できます" disabled>
        <Switch label="メールで知らせる" defaultChecked />
        <TextField label="知らせるアドレス" defaultValue="me@example.com" />
        <Button>送って試す</Button>
      </Fieldset>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox', { name: '知らせるアドレス' })).toBeDisabled();
    await expect(canvas.getByRole('switch', { name: 'メールで知らせる' })).toHaveAttribute(
      'data-disabled'
    );
  },
};

export const WithFieldGroup: Story = {
  tags: ['visual'],
  render: () => (
    <div className="max-w-lg">
      <Fieldset label="住所">
        <FieldGroup>
          <AddressFields />
        </FieldGroup>
      </Fieldset>
    </div>
  ),
};

export const WithoutVisibleLabel: Story = {
  render: () => (
    <div className="max-w-md">
      <Fieldset accessibleName="住所">
        <AddressFields />
      </Fieldset>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('group', { name: '住所' })).toBeInTheDocument();
  },
};
