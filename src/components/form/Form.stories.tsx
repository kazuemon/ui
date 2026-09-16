import type { Meta, StoryObj } from '@storybook/react-vite';
import { type FormEvent, useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
// 引数の userEvent は、LAN の IP で開いたとき（clipboard のない環境）は空になり、click などが呼べない
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button/Button';
import { Checkbox, CheckboxGroup } from '../checkbox/Checkbox';
import { Form, type FormProps } from './Form';
import { Notice } from '../notice/Notice';
import { Select, type SelectItem } from '../select/Select';
import { TextField } from '../text-field/TextField';
import { sourceCode } from '../../stories/story-states';

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
      {done && <Notice color="success" title="登録しました" />}
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

// SignupForm の Show code。formProps は Form に足す props（例: ' errorSummary'）
const signupFormCode = (formProps = '') =>
  sourceCode(
    `
    const areas: SelectItem[] = [
      { label: '千代田区', value: 'chiyoda' },
      { label: '中央区', value: 'chuo' },
      { label: '港区', value: 'minato' },
      { label: '荒川区', value: 'arakawa', note: { kind: 'warning', text: 'お届けが翌日になります' } },
      { label: '八王子市', value: 'hachioji', disabled: true, note: { kind: 'reason', text: 'お届けできません' } },
    ];

    // 値を確かめるのはアプリの役
    const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    const checkEmail = (value: string) => {
      if (!value) return 'メールアドレスを入力してください';
      return emailPattern.test(value) ? undefined : 'メールアドレスの形が正しくありません';
    };
    const checkUsername = (value: string) => (value ? undefined : 'ユーザー名を入力してください');
    const checkArea = (value: string | null) => (value ? undefined : '市区町村を選んでください');
    `,
    `
    function SignupForm() {
      const [errors, setErrors] = useState<{ email?: string; username?: string; area?: string }>({});
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
        // エラーを渡すと、Form は描いたあとで最初のエラーの欄へフォーカスを移す
        setErrors(next);
        setDone(!next.email && !next.username && !next.area);
      };

      return (
        <Form${formProps} onSubmit={onSubmit} className="flex max-w-sm flex-col gap-5">
          {done && <Notice color="success" title="登録しました" />}
          <TextField
            name="email"
            label="メールアドレス"
            caption="ログインに使います"
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
    `
  );

const channels = [
  { label: 'メール', value: 'mail' },
  { label: '電話', value: 'phone' },
  { label: '郵便', value: 'post' },
];

// チェックボックスのグループを確かめるフォーム。2つ以上選んでいないとエラー
function ContactForm(props: Omit<FormProps, 'onSubmit' | 'children'>) {
  const [channel, setChannel] = useState<string[]>(['phone']);
  const [error, setError] = useState<string>();
  return (
    <Form
      {...props}
      onSubmit={(event) => {
        event.preventDefault();
        setError(channel.length >= 2 ? undefined : '2つ以上選んでください');
      }}
      className="flex max-w-sm flex-col gap-5"
    >
      <CheckboxGroup
        label="連絡の方法"
        caption="受け取る方法を選びます"
        value={channel}
        onValueChange={(value) => setChannel(value)}
        error={error}
      >
        {channels.map((item) => (
          <Checkbox key={item.value} value={item.value} label={item.label} />
        ))}
      </CheckboxGroup>
      <Button type="submit" color="primary" className="self-start">
        送る
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
          '- `submitting` を `true` から `false` に戻した描画でエラーの行があれば、送信したときと同じくフォーカスを移します（サーバーから返ってきたエラー）。送っているあいだに別の欄へ移っていたら、フォーカスは動かさず、行を読み上げで知らせます。',
          '- ブラウザの検証の吹き出しは出しません（`noValidate` の既定が `true`）。',
          '',
          '下の例は、メールアドレスの形・ユーザー名・市区町村を確かめます。「登録する」を押して確かめてください。',
        ].join('\n'),
      },
    },
  },
  args: {
    errorSummary: false,
    noValidate: true,
    submitting: false,
    submittingBehavior: 'blocking',
  },
  argTypes: {
    errorSummary: { control: 'boolean' },
    noValidate: { control: 'boolean' },
    submitting: { control: 'boolean' },
    submittingBehavior: { control: 'inline-radio', options: ['blocking', 'none'] },
    errorSummaryTitle: { control: false },
  },
  // 引数を変えたときは、はじめの状態から描き直す
  render: (args) => <SignupForm key={String(args.errorSummary)} {...args} />,
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

// Show code: 状態を持ち、ハンドラーが要の例なので、写して使える部品の形を source.code に手で書く
export const FocusFirstError: Story = {
  name: '最初のエラーの欄へ移る',
  parameters: { docs: { source: signupFormCode() } },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '登録する' }));
    await waitFor(() => expect(canvas.getByLabelText('メールアドレス')).toHaveFocus());
  },
};

// Show code: 状態を持ち、ハンドラーが要の例なので、写して使える部品の形を source.code に手で書く
export const ErrorSummary: Story = {
  tags: ['visual'],
  name: 'エラーの一覧',
  args: { errorSummary: true },
  parameters: { docs: { source: signupFormCode(' errorSummary') } },
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

// Show code: 状態を持ち、ハンドラーが要の例なので、写して使える部品の形を source.code に手で書く
export const FocusGroup: Story = {
  name: 'チェックボックスのグループへ移る',
  parameters: {
    docs: {
      description: {
        story:
          'エラーのある欄がチェックボックス・ラジオのグループのときは、中の最初の選んだ項目（なければ最初の押せる項目）へフォーカスを移します。エラーの一覧のリンクも同じです。',
      },
      source: sourceCode(`
        // 2つ以上選んでいないとエラー
        function ContactForm() {
          const [channel, setChannel] = useState<string[]>(['phone']);
          const [error, setError] = useState<string>();
          return (
            <Form
              onSubmit={(event) => {
                event.preventDefault();
                setError(channel.length >= 2 ? undefined : '2つ以上選んでください');
              }}
              className="flex max-w-sm flex-col gap-5"
            >
              <CheckboxGroup
                label="連絡の方法"
                caption="受け取る方法を選びます"
                value={channel}
                onValueChange={(value) => setChannel(value)}
                error={error}
              >
                <Checkbox value="mail" label="メール" />
                <Checkbox value="phone" label="電話" />
                <Checkbox value="post" label="郵便" />
              </CheckboxGroup>
              <Button type="submit" color="primary" className="self-start">
                送る
              </Button>
            </Form>
          );
        }
      `),
    },
  },
  render: (args) => <ContactForm key={String(args.errorSummary)} {...args} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '送る' }));
    await waitFor(() => expect(canvas.getByRole('checkbox', { name: '電話' })).toHaveFocus());
  },
};

export const Submitting: Story = {
  tags: ['visual'],
  name: '送っているあいだ',
  args: { submitting: true },
  parameters: {
    docs: {
      description: {
        story:
          '`submitting` のあいだ、欄は押せない欄の見た目になり、書き換えられなくなります（`submittingBehavior="blocking"`、既定）。フォーカスは外れず、値もそのまま送られます。印は送信のボタンにだけ出します。送信のボタン（`type="submit"` の `Button`）は、`loading` を渡さなくても送信中になります。欄を何も変えないときは `submittingBehavior="none"` にします。',
      },
    },
  },
  render: (args) => (
    <Form {...args} className="flex max-w-sm flex-col gap-5">
      <TextField name="email" label="メールアドレス" defaultValue="kazu@example.com" />
      <Select label="市区町村" prefix="東京都" items={areas} defaultValue="minato" />
      <Button type="submit" color="primary" className="self-start">
        登録する
      </Button>
    </Form>
  ),
  play: async ({ args, canvas }) => {
    if (!args.submitting || args.submittingBehavior !== 'blocking') return;
    const select = canvas.getByRole('combobox');
    await expect(select).toHaveAttribute('aria-disabled', 'true');
    await expect(select.closest('[data-loading]')).toHaveAttribute('data-loading', 'blocking');
    // 押しても開かず、選んだ値はそのまま出す
    await userEvent.click(select);
    await new Promise((resolve) => setTimeout(resolve, 100));
    await expect(select).toHaveAttribute('aria-expanded', 'false');
    await expect(select).toHaveTextContent('港区');
  },
};

// 送ると 1 秒だけ submitting にし、サーバーのエラー（ユーザー名がもう使われている）が返るフォーム
// エラーを渡すのと submitting を false にするのは、同じ描画で行う
function ServerErrorForm(props: Omit<FormProps, 'onSubmit' | 'children'>) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  return (
    <Form
      {...props}
      submitting={submitting}
      onSubmit={(event) => {
        event.preventDefault();
        setError(undefined);
        setSubmitting(true);
        setTimeout(() => {
          setError('このユーザー名はもう使われています');
          setSubmitting(false);
        }, 1000);
      }}
      className="flex max-w-sm flex-col gap-5"
    >
      <TextField
        name="username"
        label="ユーザー名"
        caption="プロフィールの URL に使います"
        defaultValue="kazuemon"
        autoComplete="off"
        error={error}
      />
      <TextField name="displayName" label="表示名" defaultValue="かずえもん" autoComplete="off" />
      <Button type="submit" color="primary" className="self-start">
        登録する
      </Button>
    </Form>
  );
}

const serverErrorDocs =
  '送ると 1 秒ほど送っていて、サーバーのエラー（ユーザー名がもう使われている）が返ります。エラーは、`submitting` を `false` にするのと同じ描画で渡します。送ったときの場所（押した送信のボタン、Enter を押した欄）にフォーカスが残っていれば、送信したときと同じく最初のエラーの欄へ移り、行は読み上げで知らせません（移った先で説明として読むため）。送っているあいだに別の欄へ移っていたら、フォーカスは動かさず、行を読み上げで知らせます。';

const serverErrorCode = sourceCode(`
  function ServerErrorForm() {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string>();
    return (
      <Form
        submitting={submitting}
        onSubmit={(event) => {
          event.preventDefault();
          setError(undefined);
          setSubmitting(true);
          // サーバーに送る代わり。1 秒後にエラーが返る
          setTimeout(() => {
            // エラーを渡すのと submitting を false にするのは、同じ描画で行う
            setError('このユーザー名はもう使われています');
            setSubmitting(false);
          }, 1000);
        }}
        className="flex max-w-sm flex-col gap-5"
      >
        <TextField
          name="username"
          label="ユーザー名"
          caption="プロフィールの URL に使います"
          defaultValue="kazuemon"
          autoComplete="off"
          error={error}
        />
        <TextField name="displayName" label="表示名" defaultValue="かずえもん" autoComplete="off" />
        <Button type="submit" color="primary" className="self-start">
          登録する
        </Button>
      </Form>
    );
  }
`);

// Show code: 状態を持ち、ハンドラーが要の例なので、写して使える部品の形を source.code に手で書く
export const ServerError: Story = {
  name: 'サーバーから返ってきたエラー',
  parameters: {
    controls: { exclude: ['submitting'] },
    docs: { description: { story: serverErrorDocs }, source: serverErrorCode },
  },
  render: (args) => <ServerErrorForm key={String(args.errorSummary)} {...args} />,
  play: async ({ args, canvas }) => {
    if (args.errorSummary) return;
    await userEvent.click(canvas.getByRole('button', { name: '登録する' }));
    // 送り終えると、押したボタンに残っていたフォーカスがエラーの欄へ移る
    const username = canvas.getByLabelText('ユーザー名');
    await waitFor(() => expect(username).toHaveFocus(), { timeout: 3000 });
    const line = canvas.getByText('このユーザー名はもう使われています');
    await expect(line.closest('[data-slot="field-message"]')).toHaveAttribute('aria-live', 'off');
  },
};

// Show code: 状態を持ち、ハンドラーが要の例なので、写して使える部品の形を source.code に手で書く
export const ServerErrorMoved: Story = {
  name: '送っているあいだに別の欄へ移ったとき',
  parameters: {
    controls: { exclude: ['submitting'] },
    docs: { description: { story: serverErrorDocs }, source: serverErrorCode },
  },
  render: (args) => <ServerErrorForm key={String(args.errorSummary)} {...args} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '登録する' }));
    // 送っているあいだに、表示名の欄へ移る（送信のボタンの1つ前の欄）
    const other = canvas.getByLabelText('表示名');
    await userEvent.tab({ shift: true });
    await expect(other).toHaveFocus();
    const line = await canvas.findByText('このユーザー名はもう使われています', undefined, {
      timeout: 3000,
    });
    // フォーカスは奪わず、行は polite で知らせる
    await new Promise((resolve) => setTimeout(resolve, 100));
    await expect(other).toHaveFocus();
    await expect(line.closest('[data-slot="field-message"]')).toHaveAttribute(
      'aria-live',
      'polite'
    );
  },
};

// 送信のボタンが2つあるフォーム。送ると 1.5 秒だけ submitting にする
function PostForm(props: Omit<FormProps, 'onSubmit' | 'children'>) {
  const [submitting, setSubmitting] = useState(false);
  return (
    <Form
      {...props}
      submitting={submitting}
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitting(true);
        setTimeout(() => setSubmitting(false), 1500);
      }}
      className="flex max-w-sm flex-col gap-5"
    >
      <TextField name="title" label="題名" defaultValue="旅行の記録" autoComplete="off" />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" color="primary">
          公開する
        </Button>
        <Button type="submit" appearance="outline" name="draft" value="1">
          下書きに保存
        </Button>
      </div>
    </Form>
  );
}

// Show code: 状態を持ち、ハンドラーが要の例なので、写して使える部品の形を source.code に手で書く
export const SubmitButtons: Story = {
  name: '送信のボタンが2つあるとき',
  parameters: {
    controls: { exclude: ['submitting'] },
    docs: {
      description: {
        story:
          '送信のボタン（`type="submit"` の `Button`）は、`Form` の `submitting` を受け取ります。回る円は押したボタンにだけ出し、ほかの送信のボタンは押せない見た目にします。欄の中で Enter を押して送ったときは、最初の送信のボタンに出します。ボタンに `loading` を渡したときは、その値を優先します。',
      },
      source: sourceCode(`
        function PostForm() {
          const [submitting, setSubmitting] = useState(false);
          return (
            <Form
              submitting={submitting}
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitting(true);
                // サーバーに送る代わり。1.5 秒で終わる
                setTimeout(() => setSubmitting(false), 1500);
              }}
              className="flex max-w-sm flex-col gap-5"
            >
              <TextField name="title" label="題名" defaultValue="旅行の記録" autoComplete="off" />
              <div className="flex flex-wrap gap-3">
                {/* 送信のボタンは、loading を渡さなくても Form の submitting を受け取る */}
                <Button type="submit" color="primary">
                  公開する
                </Button>
                <Button type="submit" appearance="outline" name="draft" value="1">
                  下書きに保存
                </Button>
              </div>
            </Form>
          );
        }
      `),
    },
  },
  render: (args) => <PostForm {...args} />,
  play: async ({ canvas }) => {
    const publish = canvas.getByRole('button', { name: '公開する' });
    const draft = canvas.getByRole('button', { name: '下書きに保存' });
    // 押したボタンにだけ印を出す。ほかの送信のボタンは押せないだけ
    await userEvent.click(draft);
    await waitFor(() => expect(draft).toHaveAttribute('aria-busy', 'true'));
    await expect(publish).toHaveAttribute('aria-disabled', 'true');
    await expect(publish).not.toHaveAttribute('aria-busy');
    // 送り終えたら、Enter で送る。印は最初の送信のボタンに出る
    await waitFor(() => expect(draft).not.toHaveAttribute('aria-busy'), { timeout: 3000 });
    await userEvent.type(canvas.getByLabelText('題名'), '{Enter}');
    await waitFor(() => expect(publish).toHaveAttribute('aria-busy', 'true'));
    await expect(draft).not.toHaveAttribute('aria-busy');
    await expect(draft).toHaveAttribute('aria-disabled', 'true');
  },
};
