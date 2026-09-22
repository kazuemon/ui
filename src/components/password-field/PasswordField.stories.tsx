import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, userEvent } from 'storybook/test';

import { PasswordField, type PasswordFieldProps } from './PasswordField';
import { DensityPair, Matrix } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';

type Sample = MatrixColumn & { props: Partial<PasswordFieldProps> };

const stateRows: Sample[] = [
  { label: '空', props: {} },
  { label: '値あり', props: { defaultValue: 'kazuemon-2026' } },
  {
    label: 'エラー',
    props: { defaultValue: 'kazu', errorText: '8文字以上で入力してください' },
  },
  { label: '押せない', props: { defaultValue: 'kazuemon-2026', disabled: true } },
  { label: '読み取り専用', props: { defaultValue: 'kazuemon-2026', readOnly: true } },
  {
    label: '読み取り専用（エラー）',
    props: { defaultValue: 'kazu', readOnly: true, errorText: '8文字以上で入力してください' },
  },
  {
    label: '待っている（止める）',
    props: { defaultValue: 'kazuemon-2026', loading: true, loadingBehavior: 'blocking' },
  },
];

const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: 'フォーカス', state: 'focus' },
];

const meta = {
  title: 'Components/PasswordField',
  component: PasswordField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'パスワードを打つ欄です。右端のボタンで、伏せ字と文字の表示を切り替えます。',
          '',
          '- ボタンの名前は「パスワードを表示」のまま変えず、表示しているかを `aria-pressed` で伝えます。',
          '- 切り替えは見え方だけを変えるので、欄を止めているあいだ（待っているあいだ・フォームの送信中・読み取り専用）も押せます。押せない欄では押せません。',
          '- フォームを送ると伏せ字に戻します。切り替えても、カーソルの位置はそのままです。',
          '- `autoComplete` の既定は `current-password`（ログイン）です。登録やパスワードの変更で新しく決める欄には `autoComplete="new-password"` を渡します。ブラウザが強いパスワードを提案できるようになります。',
          '- 綴りの確かめと、先頭の大文字への自動の切り替えは切っています。',
          '- そのほかの props は TextField と同じです。',
        ].join('\n'),
      },
    },
  },
  args: {
    label: 'パスワード',
    disabled: false,
    readOnly: false,
    loading: false,
  },
  argTypes: {
    label: { control: 'text' },
    caption: { control: 'text' },
    errorText: { control: 'text' },
    autoComplete: { control: 'inline-radio', options: ['current-password', 'new-password'] },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
} satisfies Meta<typeof PasswordField>;

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
          '待っているあいだ止める欄でも、表示の切り替えは押せます。押せない欄では押せません。読み取り専用の欄でも押せるので、ボタンのグレー地は残ります（エラーのときは欄と同じ赤みになります）。',
      },
      source: sourceCode(`
        <PasswordField label="パスワード" />
        <PasswordField label="パスワード" errorText="8文字以上で入力してください" />
        <PasswordField label="パスワード" disabled />
        <PasswordField label="パスワード" loading loadingBehavior="blocking" />
        <PasswordField label="パスワード" readOnly />
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={stateRows}
      rowLabel={(row) => row.label}
      columns={stateColumns}
      columnWidth="16rem"
      renderCell={(row) => <PasswordField {...args} {...row.props} />}
    />
  ),
};

export const NewPassword: Story = {
  name: '新しいパスワード',
  args: {
    label: '新しいパスワード',
    caption: '8文字以上で入力してください',
    autoComplete: 'new-password',
  },
  parameters: {
    docs: {
      description: {
        story:
          '登録やパスワードの変更では `autoComplete="new-password"` を渡します。ブラウザやパスワード管理が、強いパスワードを提案できるようになります。',
      },
      source: sourceCode(`
        <PasswordField
          label="新しいパスワード"
          caption="8文字以上で入力してください"
          autoComplete="new-password"
        />
      `),
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
    const input = canvas.getByLabelText('新しいパスワード');
    await expect(input).toHaveAttribute('autocomplete', 'new-password');
  },
};

export const Toggle: Story = {
  name: '表示を切り替える',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '打っている途中で切り替えても、カーソルの位置は保たれ、そのまま打ち続けられます。フォームを送ると伏せ字に戻ります。',
      },
    },
  },
  render: () => (
    <form className="flex max-w-sm flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
      <PasswordField label="パスワード" />
      <button type="submit" className="sr-only">
        送る
      </button>
    </form>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText<HTMLInputElement>('パスワード');
    const button = canvas.getByRole('button', { name: 'パスワードを表示' });
    await expect(input).toHaveAttribute('type', 'password');
    await expect(input).toHaveAttribute('autocomplete', 'current-password');
    await expect(input).toHaveAttribute('spellcheck', 'false');
    await expect(input).toHaveAttribute('autocapitalize', 'off');
    await expect(button).toHaveAttribute('aria-pressed', 'false');

    // 途中にカーソルを置いて切り替え、位置が保たれるか
    await userEvent.type(input, 'kazuemon');
    input.setSelectionRange(4, 4);
    await userEvent.click(button);
    await expect(input).toHaveAttribute('type', 'text');
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(input).toHaveFocus();
    await expect(input.selectionStart).toBe(4);
    await userEvent.keyboard('-');
    await expect(input).toHaveValue('kazu-emon');

    // 送ったら伏せ字に戻る
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveAttribute('type', 'password');
    await expect(button).toHaveAttribute('aria-pressed', 'false');
  },
};

export const Locked: Story = {
  name: '止めているあいだ',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '待っているあいだ止める欄でも、切り替えは押せます（見え方だけを変えるため）。押せない欄では押せません。',
      },
    },
  },
  render: () => (
    <div className="flex max-w-sm flex-col gap-6">
      <PasswordField
        label="止めている欄"
        defaultValue="kazuemon-2026"
        loading
        loadingBehavior="blocking"
      />
      <PasswordField label="押せない欄" defaultValue="kazuemon-2026" disabled />
    </div>
  ),
  play: async ({ canvas }) => {
    const [blocked, disabled] = canvas.getAllByRole('button', { name: 'パスワードを表示' });
    await expect(blocked).toBeEnabled();
    await userEvent.click(blocked);
    await expect(canvas.getByLabelText('止めている欄')).toHaveAttribute('type', 'text');
    await expect(disabled).toBeDisabled();
  },
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  args: { defaultValue: 'kazuemon-2026' },
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
        <PasswordField {...args} />
      </div>
    </DensityPair>
  ),
};
