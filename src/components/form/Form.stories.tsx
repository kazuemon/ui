import type { Meta, StoryObj } from '@storybook/react-vite';
import { type FormEvent, useState } from 'react';
import { flushSync } from 'react-dom';
// userEvent は play の引数ではなく storybook/test から読む
// 引数の userEvent は、LAN の IP で開いたとき（clipboard のない環境）は空になり、click などが呼べない
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button/Button';
import { Checkbox } from '../checkbox/Checkbox';
import { CheckboxGroup } from '../checkbox/CheckboxGroup';
import { Form, type FormErrors, type FormProps } from './Form';
import { Notice } from '../notice/Notice';
import { Select } from '../select/Select';
import type { ListboxItem } from '../../internal/listbox/use-listbox-option';
import { TextField } from '../text-field/TextField';
import { sourceCode } from '../../stories/story-states';

const areas: ListboxItem[] = [
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
      {done && <Notice status="success" title="登録しました" />}
      <TextField
        name="email"
        label="メールアドレス"
        caption="ログインに使います"
        defaultValue="kazu@"
        autoComplete="off"
        errorText={errors.email}
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
        errorText={errors.username}
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
        errorText={errors.area}
      />
      <Button type="submit" color="primary" className="self-start">
        登録する
      </Button>
    </Form>
  );
}

// SignupForm の Show code。formProps は Form に足す props（例: ' showErrorSummary'）
const signupFormCode = (formProps = '') =>
  sourceCode(
    `
    const areas: ListboxItem[] = [
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
          {done && <Notice status="success" title="登録しました" />}
          <TextField
            name="email"
            label="メールアドレス"
            caption="ログインに使います"
            autoComplete="off"
            errorText={errors.email}
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
            errorText={errors.username}
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
            errorText={errors.area}
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
        errorText={error}
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
          '送信したときの、エラーの知らせ方を受け持つフォームです（Base UI の Form の上に作っています）。値を確かめるのは、`onSubmit` の中でアプリが各欄の `errorText`・`warningText` を決めるか、欄の `validate` を渡すか、外から返ってきたエラーを `errors` で渡すかです。Form は、その描画のあとでフォーカスを移します。',
          '',
          '- 既定では、エラーのある最初の欄へフォーカスを移し、入力した文字を選びます。その欄の名前と説明（キャプション → エラー）が読まれます。',
          '- `showErrorSummary` を付けると、フォームの上にエラーの一覧（題と、各欄へのリンク）を出し、一覧へフォーカスを移します。長いフォームに向きます。欄を直すと一覧から消え、なくなると一覧を閉じます。',
          '- どの欄にも結び付かないエラー（「通信できませんでした」などのサーバーのエラー）は `formErrorText` に渡します。フォームの上に危険のお知らせとして出し、送信したあとはそこへフォーカスを移します。エラーの一覧と両方あるときは、一覧の上に別のお知らせとして並べます。',
          '- 「このメールアドレスはすでに登録されています」のように、欄の値が原因のサーバーのエラーは、その欄のエラー（`errors`）にも、フォームのエラー（`formErrorText`）にもできます。直す場所が欄にあるなら欄のエラーに、サインインへ案内するなどフォームの外の行動を促すならフォームのエラーにします。',
          '- 警告は送信を止めないので、フォーカスの移る先にも一覧にも入りません。',
          '- 送信で出た行は読み上げで知らせません（フォーカスの移った先で読むため）。欄を離れたときなど、あとから出た行は知らせます。',
          '- `submitting` を `true` から `false` に戻した描画でエラーの行があれば、送信したときと同じくフォーカスを移します（サーバーから返ってきたエラー）。送っているあいだに別の欄へ移っていたら、フォーカスは動かさず、行を読み上げで知らせます。',
          '- ブラウザ自身の検証（`required`・`type="email"` など）には寄せません。欄は `required` を渡してもブラウザの制約は付けず、`aria-required` だけで必須であることを伝えます。送信を止め、行の文を出すのは `validate`・`errors` だけです。',
          '- `errors`（キーは欄の `name`、値はエラーの文）を渡すと、一致した欄の下の行に出し、その欄をエラーの状態にします。`onFormSubmit` は、Base UI の検証を通ったときに、欄の名前と値の組を 1 つのオブジェクトにして呼びます。',
          "- react-hook-form などのライブラリを使うときは、ライブラリの検証結果を `errors` に渡し、欄の `validate` は使いません（二重に検証しないため）。`inputProps={register('email')}`・`errors={toFormErrors(formState.errors)}` のように、欄とフォームへ渡します。",
          '- `requiredMark`・`optionalMark` で、中の欄の必須・任意の印をまとめて決められます。欄に書いた props が勝ちます。「*」（`asterisk`）を使うときは、その意味を伝える一文をフォームの先頭などに置いてください。エラーの一覧の欄の名前には、印の文字は入りません。',
          '',
          '下の例は、メールアドレスの形・ユーザー名・市区町村を確かめます。「登録する」を押して確かめてください。',
        ].join('\n'),
      },
    },
  },
  args: {
    showErrorSummary: false,
    noValidate: true,
    submitting: false,
    submittingBehavior: 'blocking',
  },
  argTypes: {
    showErrorSummary: { control: 'boolean' },
    noValidate: { control: 'boolean' },
    submitting: { control: 'boolean' },
    submittingBehavior: { control: 'inline-radio', options: ['blocking', 'none'] },
    errorSummaryTitle: { control: false },
  },
  // 引数を変えたときは、はじめの状態から描き直す
  render: (args) => <SignupForm key={String(args.showErrorSummary)} {...args} />,
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
  args: { showErrorSummary: true },
  parameters: { docs: { source: signupFormCode(' showErrorSummary') } },
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
                errorText={error}
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
  render: (args) => <ContactForm key={String(args.showErrorSummary)} {...args} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '送る' }));
    await waitFor(() => expect(canvas.getByRole('checkbox', { name: '電話' })).toHaveFocus());
  },
};

// name は validate（design/adr/0255）で確かめる。メールアドレスは既定（onSubmit）、ユーザー名は欄を離れたとき（onBlur）
function ValidationForm(props: Omit<FormProps, 'onSubmit' | 'children'>) {
  return (
    <Form {...props} className="flex max-w-sm flex-col gap-5">
      <TextField
        name="email"
        label="メールアドレス"
        caption="ログインに使います"
        autoComplete="off"
        validate={(value) => {
          const text = typeof value === 'string' ? value : '';
          if (!text) return 'メールアドレスを入力してください';
          return emailPattern.test(text) ? null : 'メールアドレスの形が正しくありません';
        }}
      />
      <TextField
        name="username"
        label="ユーザー名"
        caption="欄を離れたときにも確かめます"
        autoComplete="off"
        validationMode="onBlur"
        validate={(value) => (value ? null : 'ユーザー名を入力してください')}
      />
      <Button type="submit" color="primary" className="self-start">
        送る
      </Button>
    </Form>
  );
}

// Show code: 状態を持ち、ハンドラーが要の例なので、写して使える部品の形を source.code に手で書く
export const FieldValidation: Story = {
  name: '欄の検証',
  parameters: {
    docs: {
      description: {
        story:
          '`validate` は、いまの値とフォーム全体の値を受け取り、正しくないときはエラーの文を返します。`validationMode` で確かめるタイミングを選べます（既定は送信したとき）。Form の `onSubmit`・`errors` は要りません。react-hook-form などのライブラリを使うときは、ライブラリの検証結果を Form の `errors` に渡し、`validate` は使いません（二重に検証しないため）。',
      },
      source: sourceCode(`
        function ValidationForm() {
          return (
            <Form className="flex max-w-sm flex-col gap-5">
              <TextField
                name="email"
                label="メールアドレス"
                caption="ログインに使います"
                autoComplete="off"
                validate={(value) => {
                  const text = typeof value === 'string' ? value : '';
                  if (!text) return 'メールアドレスを入力してください';
                  return emailPattern.test(text) ? null : 'メールアドレスの形が正しくありません';
                }}
              />
              <TextField
                name="username"
                label="ユーザー名"
                caption="欄を離れたときにも確かめます"
                autoComplete="off"
                validationMode="onBlur"
                validate={(value) => (value ? null : 'ユーザー名を入力してください')}
              />
              <Button type="submit" color="primary">送る</Button>
            </Form>
          );
        }
      `),
    },
  },
  render: (args) => <ValidationForm key={String(args.showErrorSummary)} {...args} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '送る' }));
    await waitFor(() => expect(canvas.getByLabelText('メールアドレス')).toHaveFocus());
    // 送信では、validationMode を書いていない欄（既定の onSubmit）も、書いた欄（onBlur）も、両方確かめる
    await expect(canvas.getByText('メールアドレスを入力してください')).toBeInTheDocument();
    await expect(canvas.getByText('ユーザー名を入力してください')).toBeInTheDocument();
    // ユーザー名を打って離れると、行が閉じる（validationMode="onBlur"）。説明（キャプションだけ）が1つに戻る
    const username = canvas.getByLabelText('ユーザー名');
    await expect(username.getAttribute('aria-describedby')?.split(' ')).toHaveLength(2);
    await userEvent.type(username, 'kazuemon');
    await userEvent.tab();
    await waitFor(() =>
      expect(username.getAttribute('aria-describedby')?.split(' ')).toHaveLength(1)
    );
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
        errorText={error}
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
          errorText={error}
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
  render: (args) => <ServerErrorForm key={String(args.showErrorSummary)} {...args} />,
  play: async ({ args, canvas }) => {
    if (args.showErrorSummary) return;
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
  render: (args) => <ServerErrorForm key={String(args.showErrorSummary)} {...args} />,
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

// 送ると 1 秒後に、どの欄にも結び付かないサーバーのエラーが返るフォーム
function FormErrorTextForm(props: Omit<FormProps, 'onSubmit' | 'children'>) {
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>();
  return (
    <Form
      formErrorText={formError}
      {...props}
      submitting={submitting}
      onSubmit={(event) => {
        event.preventDefault();
        setFormError(undefined);
        setSubmitting(true);
        setTimeout(() => {
          // エラーを渡すのと submitting を false にするのは、同じ描画で行う
          setFormError('通信できませんでした。時間をおいて、もう一度送ってください。');
          setSubmitting(false);
        }, 1000);
      }}
      className="flex max-w-sm flex-col gap-5"
    >
      <TextField name="email" label="メールアドレス" defaultValue="kazuemon@example.com" />
      <TextField name="displayName" label="表示名" defaultValue="かずえもん" autoComplete="off" />
      <Button type="submit" color="primary" className="self-start">
        登録する
      </Button>
    </Form>
  );
}

export const FormErrorText: Story = {
  name: 'どの欄にも結び付かないエラー',
  parameters: {
    controls: { exclude: ['submitting'] },
    docs: {
      description: {
        story:
          '送ると 1 秒ほど送っていて、サーバーのエラー（通信できなかった）が返ります。`formErrorText` に渡すと、フォームの上に危険のお知らせとして出し、そこへフォーカスを移します。',
      },
    },
  },
  render: (args) => <FormErrorTextForm key={String(args.showErrorSummary)} {...args} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '登録する' }));
    const text = await canvas.findByText(
      '通信できませんでした。時間をおいて、もう一度送ってください。',
      undefined,
      { timeout: 3000 }
    );
    const panel = text.closest('[data-slot="form-error-summary"]');
    await waitFor(() => expect(panel).toHaveFocus());
    await expect(panel).toHaveAccessibleName(
      '通信できませんでした。時間をおいて、もう一度送ってください。'
    );
  },
};

// 一覧と両方あるとき: どの欄にも結び付かないエラーを、一覧の上に別のお知らせとして並べる
export const FormErrorTextWithSummary: Story = {
  name: 'どの欄にも結び付かないエラーと、エラーの一覧',
  tags: ['visual'],
  args: { showErrorSummary: true },
  render: (args) => (
    <Form
      {...args}
      formErrorText="通信できませんでした。時間をおいて、もう一度送ってください。"
      errors={{ email: 'メールアドレスを入力してください' }}
      onSubmit={(event) => event.preventDefault()}
      className="flex max-w-sm flex-col gap-5"
    >
      <TextField name="email" label="メールアドレス" />
      <TextField name="displayName" label="表示名" defaultValue="かずえもん" autoComplete="off" />
      <Button type="submit" color="primary" className="self-start">
        登録する
      </Button>
    </Form>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '登録する' }));
    await canvas.findByRole('link', { name: /メールアドレスを入力してください/ });
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
  },
};

// 送ると 1 秒後に Form の errors（design/adr/0255）でエラーが返るフォーム。onFormSubmit は Base UI の検証を通ったときに呼ばれる
function FormErrorsForm(props: Omit<FormProps, 'onFormSubmit' | 'children'>) {
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>();
  return (
    <Form
      {...props}
      submitting={submitting}
      errors={errors}
      onFormSubmit={() => {
        setErrors(undefined);
        setSubmitting(true);
        // サーバー（や react-hook-form などの検証結果）に送る代わり。1 秒後にエラーが返る
        setTimeout(() => {
          // errors を渡すのと submitting を false にするのは、同じ描画で行う
          setErrors({ email: 'このメールアドレスはもう使われています' });
          setSubmitting(false);
        }, 1000);
      }}
      className="flex max-w-sm flex-col gap-5"
    >
      <TextField
        name="email"
        label="メールアドレス"
        defaultValue="kazu@example.com"
        autoComplete="off"
      />
      <Button type="submit" color="primary" className="self-start">
        登録する
      </Button>
    </Form>
  );
}

const formErrorsCode = sourceCode(`
  function FormErrorsForm() {
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>();
    return (
      <Form
        submitting={submitting}
        errors={errors}
        onFormSubmit={() => {
          setErrors(undefined);
          setSubmitting(true);
          // サーバーに送る代わり。1 秒後にエラーが返る
          setTimeout(() => {
            // errors を渡すのと submitting を false にするのは、同じ描画で行う
            setErrors({ email: 'このメールアドレスはもう使われています' });
            setSubmitting(false);
          }, 1000);
        }}
        className="flex max-w-sm flex-col gap-5"
      >
        <TextField name="email" label="メールアドレス" defaultValue="kazu@example.com" autoComplete="off" />
        <Button type="submit" color="primary">登録する</Button>
      </Form>
    );
  }
`);

// Show code: 状態を持ち、ハンドラーが要の例なので、写して使える部品の形を source.code に手で書く
export const FormLevelErrors: Story = {
  name: 'サーバーのエラー',
  parameters: {
    controls: { exclude: ['submitting'] },
    docs: {
      description: {
        story:
          '`onFormSubmit` は、Base UI の検証を通ったときに、欄の名前と値の組を1つのオブジェクトにして呼びます。送った先（サーバーや react-hook-form など）が返したエラーは、`errors`（キーは欄の `name`）に渡します。name が一致した欄の下に出て、欄をエラーの状態にし、`submitting` を `false` に戻すのと同じ描画で渡せば、送信したときと同じくフォーカスも移ります。',
      },
      source: formErrorsCode,
    },
  },
  render: (args) => <FormErrorsForm key={String(args.showErrorSummary)} {...args} />,
  play: async ({ args, canvas }) => {
    if (args.showErrorSummary) return;
    await userEvent.click(canvas.getByRole('button', { name: '登録する' }));
    const email = canvas.getByLabelText('メールアドレス');
    await waitFor(() => expect(email).toHaveFocus(), { timeout: 3000 });
    await expect(canvas.getByText('このメールアドレスはもう使われています')).toBeInTheDocument();
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
        <Button type="submit" variant="outline" name="draft" value="1">
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
                <Button type="submit" variant="outline" name="draft" value="1">
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

// 人が押したときの描画の区切りを、テストで再現する。ブラウザが送る submit（人が押した・Enter を押した）では、
// React のキャプチャのリスナーとバブルのリスナーのあいだでマイクロタスクが走り、キャプチャで積んだ更新がそこで描かれる。
// userEvent（JS から送るイベント）ではこの区切りが起きないので、フォーム自身のリスナー（2 つのあいだに呼ばれる）で描かせる
function splitRenderLikeUser(form: HTMLFormElement) {
  form.addEventListener('submit', () => flushSync(() => {}), { once: true });
}

// onSubmit で errorText を決め、直して送り直すフォーム
function ResubmitForm(props: Omit<FormProps, 'onSubmit' | 'children'>) {
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [done, setDone] = useState(false);
  return (
    <Form
      {...props}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const email = data.get('email');
        const next = {
          name: data.get('name') ? undefined : '名前を入力してください',
          email: checkEmail(typeof email === 'string' ? email : ''),
        };
        setErrors(next);
        setDone(!next.name && !next.email);
      }}
      className="flex max-w-sm flex-col gap-5"
    >
      {done && <Notice status="success" title="送りました" />}
      <TextField name="name" label="名前" autoComplete="off" errorText={errors.name} />
      <TextField name="email" label="メールアドレス" autoComplete="off" errorText={errors.email} />
      <Button type="submit" color="primary" className="self-start">
        送る
      </Button>
    </Form>
  );
}

export const Resubmit: Story = {
  name: '直して送り直す',
  parameters: {
    docs: {
      description: {
        story:
          '`onSubmit` の中で決めた `errorText` は、送信を止めません。欄を直して送り直すと、もう一度 `onSubmit` が呼ばれ、そこでエラーを決め直します。',
      },
    },
  },
  render: (args) => <ResubmitForm key={String(args.showErrorSummary)} {...args} />,
  play: async ({ args, canvas, canvasElement }) => {
    const form = canvasElement.querySelector('form');
    if (!form) throw new Error('form がありません');
    const submit = canvas.getByRole('button', { name: '送る' });
    const name = canvas.getByLabelText('名前');
    const email = canvas.getByLabelText('メールアドレス');

    // 送ると、最初のエラーの欄（一覧を出すときは一覧）へフォーカスが移る
    splitRenderLikeUser(form);
    await userEvent.click(submit);
    if (args.showErrorSummary) {
      const summary = await canvas.findByRole('group', { name: '入力を確かめてください（2件）' });
      await waitFor(() => expect(summary).toHaveFocus());
    } else {
      await waitFor(() => expect(name).toHaveFocus());
    }

    // 1 つだけ直して送り直すと、残ったエラーへ移る
    await userEvent.type(name, 'かずえもん');
    splitRenderLikeUser(form);
    await userEvent.click(submit);
    if (args.showErrorSummary) {
      const summary = await canvas.findByRole('group', { name: '入力を確かめてください（1件）' });
      await waitFor(() => expect(summary).toHaveFocus());
    } else {
      await waitFor(() => expect(email).toHaveFocus());
    }
    await expect(name).not.toHaveAttribute('aria-invalid');

    // 全部直して送り直すと、onSubmit が呼ばれて送れる
    await userEvent.type(email, 'kazu@example.com');
    splitRenderLikeUser(form);
    await userEvent.click(submit);
    await expect(await canvas.findByText('送りました')).toBeInTheDocument();
    await expect(email).not.toHaveAttribute('aria-invalid');
  },
};

export const ResubmitWithSummary: Story = {
  ...Resubmit,
  name: '直して送り直す（エラーの一覧）',
  args: { showErrorSummary: true },
};
