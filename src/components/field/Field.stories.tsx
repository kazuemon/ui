import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { expect, within } from 'storybook/test';

import { Button } from '../button/Button';
import { Select } from '../select/Select';
import { Text } from '../text/Text';
import { TextField, TextFieldControl } from '../text-field/TextField';
import { Textarea } from '../textarea/Textarea';
import { Field, FieldCaption, FieldControl, FieldLabel, FieldMessages, useField } from './Field';
import { FieldGroup } from './FieldGroup';

const meta = {
  title: 'Components/Field',
  component: Field,
  parameters: {
    docs: {
      description: {
        component: [
          '入力欄のラベルの置き場所を変えたり、部位を好きな順に並べて欄を組み立てたりします。',
          '',
          '- ふだんは TextField・Select などの入力欄をそのまま使います。ラベルは本体の上です',
          '- `labelPlacement="start"` でラベルを本体の左に置きます。キャプションと状態の行は本体の下です。表の帯のように 1 行に詰める場所で使います',
          '- 複数の欄のラベルの列をそろえるときは、`FieldGroup` で包みます。ラベルの列は、中で最も長いラベルの幅になります',
          '- 見えるラベルを置かないときは、`label` の代わりに `accessibleName` を渡します。置き場所や見本の文字で何の欄か分かるときだけにします',
          '- 並べ方を変えたいとき・ライブラリにない本体を入れたいときは、`Field` の中に `FieldLabel`・`FieldCaption`・`FieldMessages` と本体（`TextFieldControl`・`FieldControl` など）を置きます',
          '- 自作の本体は `useField` で欄の状態（エラー・押せない・止めている・必須）を読めます。Field の外では `null` です',
        ].join('\n'),
      },
    },
  },
} satisfies Meta<typeof Field>;
export default meta;
type Story = StoryObj<typeof meta>;

const pageSizes = [5, 10, 20].map((size) => ({ label: `${size} 件`, value: String(size) }));

/** 表の帯: ラベルを横に置く（太字・軽い）、ラベルを出さない */
export const LabelPlacement: Story = {
  tags: ['visual'],
  args: { label: '', children: null },
  render: () => (
    <div className="flex max-w-xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <Text as="span" size="sm" variant="muted">
          12 件中 1〜5 件
        </Text>
        <Select
          label="1 ページの件数"
          labelPlacement="start"
          items={pageSizes}
          defaultValue="5"
          className="w-56"
        />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <Text as="span" size="sm" variant="muted">
          12 件中 1〜5 件
        </Text>
        <Select
          label="1 ページの件数"
          labelPlacement="start"
          labelVariant="muted"
          items={pageSizes}
          defaultValue="5"
          className="w-56"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TextField accessibleName="注文を検索" placeholder="注文番号・お店" className="w-64" />
        <Button variant="outline">書き出す</Button>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // ラベルを出さない欄も、読み上げの名前を持つ
    await expect(canvas.getByRole('textbox', { name: '注文を検索' })).toBeInTheDocument();
  },
};

/** FieldGroup: ラベルの列をそろえる。狭いと上に戻す指定も */
export const Group: Story = {
  tags: ['visual'],
  args: { label: '', children: null },
  render: () => (
    <div className="flex flex-wrap items-start gap-8">
      <FieldGroup className="w-[480px]">
        <TextField
          label="表示名"
          caption="ほかの人に見える名前です"
          defaultValue="かずえもん"
          required
        />
        <Select
          label="言語"
          items={[
            { label: '日本語', value: 'ja' },
            { label: 'English', value: 'en' },
          ]}
          defaultValue="ja"
        />
        <Textarea
          label="自己紹介"
          defaultValue="UI を作っています。"
          errorText="URL は入れられません"
        />
      </FieldGroup>
      <FieldGroup narrowLabelPlacement="top" className="w-[320px]">
        <TextField label="表示名" defaultValue="かずえもん" />
        <Textarea label="自己紹介" defaultValue="UI を作っています。" />
      </FieldGroup>
    </div>
  ),
};

/** 組み立て: 説明をラベルの列に置く（設定画面の形）と、ライブラリにない本体 */
export const Composition: Story = {
  tags: ['visual'],
  args: { label: '', children: null },
  render: () => (
    <div className="flex max-w-xl flex-col gap-10">
      <FieldGroup>
        <Field
          label="表示名"
          caption="ほかの人に見える名前です"
          errorText="表示名を入力してください"
        >
          <div className="flex flex-col gap-1 pt-3">
            <FieldLabel />
            <FieldCaption />
          </div>
          <div className="flex flex-col gap-2">
            <TextFieldControl />
            <FieldMessages />
          </div>
        </Field>
        <Field label="テーマの色" caption="ボタンの色になります">
          <div className="flex flex-col gap-1 pt-3">
            <FieldLabel />
            <FieldCaption />
          </div>
          <div className="flex flex-col gap-2">
            <FieldControl
              render={<input type="color" defaultValue="#3aa6e0" className="h-11 w-20" />}
            />
            <FieldMessages />
          </div>
        </Field>
      </FieldGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: /表示名/ });
    // 組み立てても、キャプション → エラーの順で説明につながる
    const describedBy = input.getAttribute('aria-describedby')?.split(' ') ?? [];
    await expect(describedBy.length).toBe(2);
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.getByLabelText(/テーマの色/)).toHaveAttribute('type', 'color');
  },
};

// 自作の本体: useField で欄の状態を読み、エラーのときは枠を赤くする
function ColorInput(props: ComponentProps<'input'>) {
  const field = useField();
  return (
    <input
      {...props}
      type="color"
      data-field-invalid={field?.invalid ? '' : undefined}
      className="h-11 w-20 rounded-control border border-line-strong data-field-invalid:border-danger"
    />
  );
}

/** 自作の本体が useField で欄の状態を読む */
export const CustomControl: Story = {
  args: { label: '', children: null },
  render: () => (
    <Field label="テーマの色" errorText="明るすぎる色は選べません" required>
      <FieldLabel />
      <FieldControl render={<ColorInput defaultValue="#ffff00" />} />
      <FieldMessages />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/テーマの色/);
    await expect(input).toHaveAttribute('data-field-invalid');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
  },
};
