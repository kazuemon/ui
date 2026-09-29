import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む（LAN の IP で開くと、引数の userEvent が空になる）
import { type FormEvent, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button/Button';
import { Checkbox } from '../checkbox/Checkbox';
import { FieldGroup } from '../field/FieldGroup';
import { Form } from '../form/Form';
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
          '- 囲み方は `variant` で選びます。既定の `plain` は囲まず、`framed` は枠で囲み、`indented` は中の欄だけを縦線で字下げします',
          '- `errorText` は、欄どうしを照らし合わせたエラー（「チェックアウトはチェックインより後の日」など）です。見出しの下に出し、中の欄をすべてエラーの見た目にします。1 つの欄だけのエラーは、その欄の `errorText` に渡します',
          '- `disabled` で、中の欄とボタンをまとめて押せなくします',
          '- 見出しの大きさは `labelSize` で、Heading の size と同じ段から選びます（既定は本文と同じ大きさの `md`）',
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
    // 祖先の <fieldset disabled> だけでなく、欄そのものが押せない状態になる（見た目も Field が受け持つ）
    const address = canvas.getByRole('textbox', { name: '知らせるアドレス' });
    await expect(address).toHaveAttribute('disabled');
    await expect(address.closest('[data-slot="field"]')).toHaveAttribute('data-disabled');
    await expect(canvas.getByRole('switch', { name: 'メールで知らせる' })).toHaveAttribute(
      'data-disabled'
    );
    // ボタンは <fieldset disabled> の働きで押せない（:disabled の見た目）
    await expect(canvas.getByRole('button', { name: '送って試す' })).toBeDisabled();
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

export const LabelSize: Story = {
  tags: ['visual'],
  render: () => (
    <div className="grid max-w-5xl grid-cols-3 gap-8">
      <Fieldset label="住所" caption="md（既定）">
        <AddressFields />
      </Fieldset>
      <Fieldset label="住所" caption="lg" labelSize="lg">
        <AddressFields />
      </Fieldset>
      <Fieldset label="住所" caption="xl" labelSize="xl">
        <AddressFields />
      </Fieldset>
    </div>
  ),
};

export const Variants: Story = {
  tags: ['visual'],
  render: () => (
    <div className="grid max-w-5xl grid-cols-3 gap-8">
      <Fieldset label="住所" caption="plain（既定）">
        <AddressFields />
      </Fieldset>
      <Fieldset label="住所" caption="framed" variant="framed">
        <AddressFields />
      </Fieldset>
      <Fieldset label="住所" caption="indented" variant="indented">
        <AddressFields />
      </Fieldset>
    </div>
  ),
};

function StayFields({ checkOutError }: { checkOutError?: string }) {
  return (
    <>
      <TextField label="チェックイン" defaultValue="2026-10-10" />
      <TextField label="チェックアウト" defaultValue="2026-10-08" errorText={checkOutError} />
    </>
  );
}

export const ErrorText: Story = {
  tags: ['visual'],
  render: () => (
    <div className="flex max-w-md flex-col gap-12">
      <Fieldset
        label="宿泊の期間"
        caption="チェックインとチェックアウトの日です"
        errorText="チェックアウトは、チェックインより後の日にしてください"
      >
        <StayFields />
      </Fieldset>
      <Fieldset
        label="宿泊の期間"
        variant="framed"
        errorText="チェックアウトは、チェックインより後の日にしてください"
      >
        <StayFields />
      </Fieldset>
      <Fieldset label="宿泊の期間" warningText="連泊の割引は 3 泊からです">
        <StayFields checkOutError="日付の形で入れてください" />
      </Fieldset>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [group] = canvas.getAllByRole('group', { name: '宿泊の期間' });
    await expect(group).toHaveAccessibleDescription(
      'チェックインとチェックアウトの日です チェックアウトは、チェックインより後の日にしてください'
    );
    const [checkIn] = canvas.getAllByRole('textbox', { name: 'チェックイン' });
    await expect(checkIn).toHaveAttribute('aria-invalid', 'true');
    // 警告は中の欄の見た目を変えない。1 つの欄のエラーは、その欄だけ
    const checkIns = canvas.getAllByRole('textbox', { name: 'チェックイン' });
    const checkOuts = canvas.getAllByRole('textbox', { name: 'チェックアウト' });
    await expect(checkIns[2]).not.toHaveAttribute('aria-invalid', 'true');
    await expect(checkOuts[2]).toHaveAttribute('aria-invalid', 'true');
    const groups = canvas.getAllByRole('group', { name: '宿泊の期間' });
    await expect(groups[2]).not.toHaveAttribute('data-invalid');
    // 説明につなぐ id は、どれも開いている行（閉じた行はつながない）
    for (const fieldset of groups) {
      for (const id of (fieldset.getAttribute('aria-describedby') ?? '').split(' ')) {
        await expect(canvasElement.ownerDocument.getElementById(id)).not.toBeNull();
      }
    }
  },
};

export const Nested: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-12">
      <Fieldset label="予約" errorText="予約の内容を確かめてください">
        <Fieldset label="宿泊の期間">
          <StayFields />
        </Fieldset>
        <Checkbox label="朝食を付ける" />
        <Switch label="禁煙の部屋" />
      </Fieldset>
      <Fieldset label="オプション" disabled>
        <Fieldset label="送迎">
          <TextField label="到着の時刻" defaultValue="15:00" />
        </Fieldset>
        <Checkbox label="駐車場を使う" />
        <Switch label="レイトチェックアウト" />
      </Fieldset>
      <Fieldset accessibleName="連絡先" errorText="">
        <TextField label="電話番号" defaultValue="03-1234-5678" />
      </Fieldset>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 入れ子の中の欄にも、外のまとまりのエラーが届く。Field を通らない 1 つだけの Checkbox・Switch も
    await expect(canvas.getByRole('textbox', { name: 'チェックイン' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    await expect(canvas.getByRole('checkbox', { name: '朝食を付ける' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    await expect(canvas.getByRole('switch', { name: '禁煙の部屋' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    // 押せない状態も、入れ子の中の欄まで届く
    const arrival = canvas.getByRole('textbox', { name: '到着の時刻' });
    await expect(arrival).toHaveAttribute('disabled');
    await expect(arrival.closest('[data-slot="field"]')).toHaveAttribute('data-disabled');
    await expect(canvas.getByRole('checkbox', { name: '駐車場を使う' })).toHaveAttribute(
      'data-disabled'
    );
    await expect(canvas.getByRole('switch', { name: 'レイトチェックアウト' })).toHaveAttribute(
      'data-disabled'
    );
    // 空の文字のエラーは、ないのと同じ（行を開かず、中の欄も赤くしない）
    const contact = canvas.getByRole('group', { name: '連絡先' });
    await expect(contact).not.toHaveAttribute('data-invalid');
    await expect(contact).not.toHaveAttribute('aria-describedby');
    await expect(canvas.getByRole('textbox', { name: '電話番号' })).not.toHaveAttribute(
      'aria-invalid',
      'true'
    );
  },
};

function StayForm() {
  const [error, setError] = useState<string>();
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const checkIn = data.get('checkIn');
    const checkOut = data.get('checkOut');
    setError(
      typeof checkIn === 'string' && typeof checkOut === 'string' && checkOut > checkIn
        ? undefined
        : 'チェックアウトは、チェックインより後の日にしてください'
    );
  };
  return (
    <Form showErrorSummary onSubmit={onSubmit} className="flex max-w-md flex-col gap-6">
      <Fieldset label="宿泊の期間" errorText={error}>
        <TextField label="チェックイン" name="checkIn" defaultValue="2026-10-10" />
        <TextField label="チェックアウト" name="checkOut" defaultValue="2026-10-08" />
      </Fieldset>
      <Button type="submit" color="primary" className="self-start">
        予約する
      </Button>
    </Form>
  );
}

export const InForm: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Form の中では、まとまりのエラーもエラーの一覧に載ります（名前はまとまりの見出し）。一覧のリンクを押すと、まとまりの中の最初の欄へフォーカスを移します。',
      },
    },
  },
  render: () => <StayForm />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '予約する' }));
    const summary = await canvas.findByRole('group', { name: '入力を確かめてください（1件）' });
    await userEvent.click(
      within(summary).getByRole('link', {
        name: '宿泊の期間: チェックアウトは、チェックインより後の日にしてください',
      })
    );
    await waitFor(() =>
      expect(canvas.getByRole('textbox', { name: 'チェックイン' })).toHaveFocus()
    );
  },
};
