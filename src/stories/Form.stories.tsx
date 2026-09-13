import type { Meta, StoryObj } from '@storybook/react-vite';
import { type FormEvent, useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
// 引数の userEvent は、LAN の IP で開いたとき（clipboard のない環境）は空になり、click などが呼べない
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../components/Button';
import { Form, type FormProps } from '../components/Form';
import { Notice } from '../components/Notice';
import { Select, type SelectItem } from '../components/Select';
import { TextField } from '../components/TextField';

const areas: SelectItem[] = [
  { label: '千代田区', value: 'chiyoda' },
  { label: '中央区', value: 'chuo' },
  { label: '港区', value: 'minato' },
  { label: '荒川区', value: 'arakawa', note: { kind: 'warning', text: 'お届けが翌日になります' } },
  {
    label: '八王子市',
    value: 'hachioji',
    disabled: true,
    note: { kind: 'reason', text: 'お届けできません' },
  },
];

// 値を確かめるのはアプリの役。ここではストーリーが受け持つ
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const checkEmail = (value: string) => {
  if (!value) return 'メールアドレスを入力してください';
  return emailPattern.test(value) ? undefined : 'メールアドレスの形が正しくありません';
};
const checkUsername = (value: string) => (value ? undefined : 'ユーザー名を入力してください');
const checkArea = (value: string | null) => (value ? undefined : '市区町村を選んでください');

interface Errors {
  email?: string;
  username?: string;
  area?: string;
}

function SignupForm(props: Omit<FormProps, 'onSubmit' | 'children'>) {
  const [errors, setErrors] = useState<Errors>({});
  const [area, setArea] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const value = (name: string) => {
      const field = form.elements.namedItem(name);
      return field instanceof HTMLInputElement ? field.value : '';
    };
    const next = {
      email: checkEmail(value('email')),
      username: checkUsername(value('username')),
      area: checkArea(area),
    };
    setErrors(next);
    setDone(!next.email && !next.username && !next.area);
  };

  return (
    <Form {...props} onSubmit={onSubmit} className="flex max-w-sm flex-col gap-5">
      {done && <Notice tone="success" title="登録しました" />}
      <TextField
        name="email"
        label="メールアドレス"
        caption="ログインに使います"
        defaultValue="kazu@"
        autoComplete="off"
        error={errors.email}
        // 欄を離れたときにも確かめる。このときの行は、読み上げで知らせる
        onBlur={(event) => {
          const email = checkEmail(event.currentTarget.value);
          setErrors((current) => ({ ...current, email }));
        }}
      />
      <TextField
        name="username"
        label="ユーザー名"
        caption="プロフィールの URL に使います"
        autoComplete="off"
        error={errors.username}
      />
      <Select
        label="市区町村"
        prefix="東京都"
        placeholder="選んでください"
        items={areas}
        value={area}
        onValueChange={(value) => {
          setArea(value);
          setErrors((current) => ({ ...current, area: checkArea(value) }));
        }}
        error={errors.area}
      />
      <Button type="submit" color="primary" className="self-start">
        登録する
      </Button>
    </Form>
  );
}

const meta = {
  title: 'Components/Form',
  component: Form,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '送信したときの、エラーの知らせ方を受け持つフォームです。値を確かめるのはアプリで、`onSubmit` の中で各欄の `error`・`warning` を決めます。Form は、その描画のあとでフォーカスを移します。',
          '',
          '- 既定では、エラーのある最初の欄へフォーカスを移し、入力した文字を選びます。その欄の名前と説明（キャプション → エラー）が読まれます。',
          '- `errorSummary` を付けると、フォームの上にエラーの一覧（題と、各欄へのリンク）を出し、一覧へフォーカスを移します。長いフォームに向きます。欄を直すと一覧から消え、なくなると一覧を閉じます。',
          '- 警告は送信を止めないので、フォーカスの移る先にも一覧にも入りません。',
          '- 送信で出た行は読み上げで知らせません（フォーカスの移った先で読むため）。欄を離れたときなど、あとから出た行は知らせます。',
          '- ブラウザの検証の吹き出しは出しません（`noValidate` の既定が `true`）。',
          '',
          '下の例は、メールアドレスの形・ユーザー名・市区町村を確かめます。「登録する」を押して確かめてください。',
        ].join('\n'),
      },
    },
  },
  args: { errorSummary: false, noValidate: true },
  argTypes: {
    errorSummary: { control: 'boolean' },
    noValidate: { control: 'boolean' },
    errorSummaryTitle: { control: false },
  },
  // 引数を変えたときは、はじめの状態から描き直す
  render: (args) => <SignupForm key={String(args.errorSummary)} {...args} />,
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FocusFirstError: Story = {
  name: '最初のエラーの欄へ移る',
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '登録する' }));
    await waitFor(() => expect(canvas.getByLabelText('メールアドレス')).toHaveFocus());
  },
};

export const ErrorSummary: Story = {
  name: 'エラーの一覧',
  args: { errorSummary: true },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '登録する' }));
    const summary = await canvas.findByRole('group', { name: '入力を確かめてください（3件）' });
    await waitFor(() => expect(summary).toHaveFocus());
    await userEvent.click(
      within(summary).getByRole('link', { name: 'ユーザー名: ユーザー名を入力してください' })
    );
    await expect(canvas.getByLabelText('ユーザー名')).toHaveFocus();
  },
};
