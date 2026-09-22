'use client';

import {
  Button,
  Checkbox,
  Divider,
  Form,
  Heading,
  Link,
  Notice,
  Switch,
  Text,
  TextField,
  useToast,
} from '@kazuemon/ui';
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';

import { town } from './sites';

// サインイン系の画面（Kazue Hub に入る）。サーバーの返事は待つふり（1.2 秒）
// 画面の状態は scenario で作る（切替画面の「状態を再現する」のボタン）。押すとその状態で描き直す

export type ServerReply = 'ok' | 'error';

/** 再現する状態。empty は入力前、invalid は検証のエラー、submitting は送信中、failed・success は返事のあと */
export type Scenario = 'empty' | 'invalid' | 'submitting' | 'failed' | 'success';

/** 状態を再現するときに、欄へ入れておく値 */
const sample = { name: 'かずえもん', email: 'kazuemon@example.com', password: 'password123' };
/** 検証のエラーを再現するときの、正しくない値 */
const wrong = { name: '', email: 'kazuemon', password: '123' };

/** その状態で、欄に入っている値 */
function filledValues(scenario: Scenario) {
  if (scenario === 'invalid') return wrong;
  return scenario === 'empty' ? { name: '', email: '', password: '' } : sample;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const checkEmail = (value: string) => {
  if (!value) return 'メールアドレスを入力してください';
  return emailPattern.test(value) ? undefined : 'メールアドレスの形が正しくありません';
};
const checkPassword = (value: string) => {
  if (!value) return 'パスワードを入力してください';
  return value.length >= 8 ? undefined : '8 文字以上で入力してください';
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const valueOf = (form: HTMLFormElement, name: string) => {
  const field = form.elements.namedItem(name);
  return field instanceof HTMLInputElement ? field.value : '';
};

/** 画面の外枠。カードにはせず、余白と細い幅だけで置く */
export function AuthLayout({
  title,
  lead,
  footer,
  children,
}: {
  title: string;
  lead?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <div className="flex w-full max-w-[400px] flex-col gap-6">
        <div className="flex flex-col gap-1">
          <Text as="span" className="font-heading text-fg-brand">
            {town.name}
          </Text>
          <Heading level={1} size={2}>
            {title}
          </Heading>
          {lead && <Text variant="muted">{lead}</Text>}
        </div>
        {children}
        {footer && (
          <>
            <Divider />
            <Text size="sm" variant="muted">
              {footer}
            </Text>
          </>
        )}
      </div>
    </div>
  );
}

export function SignInScreen({
  scenario = 'empty',
  remember = true,
}: {
  scenario?: Scenario;
  remember?: boolean;
}) {
  const values = filledValues(scenario);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    scenario === 'invalid'
      ? { email: checkEmail(wrong.email), password: checkPassword(wrong.password) }
      : {}
  );
  const [failed, setFailed] = useState(scenario === 'failed');
  const [submitting, setSubmitting] = useState(scenario === 'submitting');
  const toast = useToast();
  const reply: ServerReply = scenario === 'failed' ? 'error' : 'ok';
  // 成功は、描いたときにトーストを出す（押した瞬間に、そのときの画面になる）
  // useToast の返り値は描画のたびに変わるので、出したかどうかを持っておく（出し続けないため）
  const shown = useRef(false);
  useEffect(() => {
    if (scenario !== 'success' || shown.current) return;
    shown.current = true;
    toast.show({ status: 'success', title: 'サインインしました' });
  }, [scenario, toast]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const next = {
      email: checkEmail(valueOf(form, 'email')),
      password: checkPassword(valueOf(form, 'password')),
    };
    setFailed(false);
    setErrors(next);
    if (next.email || next.password) return;
    setSubmitting(true);
    await wait(1200);
    setSubmitting(false);
    if (reply === 'ok') toast.show({ status: 'success', title: 'サインインしました' });
    else setFailed(true);
  };

  return (
    <AuthLayout
      title="サインイン"
      lead="メールアドレスとパスワードを入力してください。"
      footer={
        <>
          アカウントをお持ちでない方は<Link href="#sign-up">新規登録</Link>へ
        </>
      }
    >
      <Form submitting={submitting} onSubmit={onSubmit} className="flex flex-col gap-5">
        {failed && (
          <Notice status="danger" title="サインインできませんでした">
            メールアドレスかパスワードが違います。
          </Notice>
        )}
        <TextField
          name="email"
          type="email"
          label="メールアドレス"
          autoComplete="email"
          defaultValue={values.email}
          errorText={errors.email}
        />
        <div className="flex flex-col gap-2">
          <TextField
            name="password"
            type="password"
            label="パスワード"
            autoComplete="current-password"
            defaultValue={values.password}
            errorText={errors.password}
          />
          <Text size="sm">
            <Link href="#reset">パスワードを忘れたとき</Link>
          </Text>
        </div>
        {remember && (
          <Checkbox label="このブラウザでは、サインインしたままにする" name="remember" />
        )}
        <Button type="submit" color="primary">
          サインインする
        </Button>
      </Form>
    </AuthLayout>
  );
}

export function SignUpScreen({
  scenario = 'empty',
  errorSummary,
}: {
  scenario?: Scenario;
  errorSummary: boolean;
}) {
  const values = filledValues(scenario);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    terms?: string;
  }>(scenario === 'failed' ? { email: 'このメールアドレスは、すでに登録されています' } : {});
  // 検証のエラーは、値を入れたうえで実際に送って出す。エラーの一覧（errorSummary）は
  // 送ったときに作られるので、状態を組み立てるだけでは出ない。一覧の入り切りを変えたときも送り直す
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (scenario === 'invalid') formRef.current?.requestSubmit();
  }, [scenario, errorSummary]);
  const [submitting, setSubmitting] = useState(scenario === 'submitting');
  const [done, setDone] = useState(scenario === 'success');
  const reply: ServerReply = scenario === 'failed' ? 'error' : 'ok';

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = valueOf(form, 'name');
    const terms = form.elements.namedItem('terms');
    const next = {
      name: name ? undefined : '表示名を入力してください',
      email: checkEmail(valueOf(form, 'email')),
      password: checkPassword(valueOf(form, 'password')),
      terms: terms instanceof HTMLInputElement && terms.checked ? undefined : '同意が必要です',
    };
    setDone(false);
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    setSubmitting(true);
    await wait(1200);
    // サーバーの返事は、送信中が終わる描画で渡す（Form が、エラーの欄へフォーカスを移す）
    setSubmitting(false);
    if (reply === 'ok') setDone(true);
    else setErrors({ email: 'このメールアドレスは、すでに登録されています' });
  };

  return (
    <AuthLayout
      title="新規登録"
      lead="1 分ほどで終わります。"
      footer={
        <>
          登録済みの方は<Link href="#sign-in">サインイン</Link>へ
        </>
      }
    >
      <Form
        ref={formRef}
        submitting={submitting}
        showErrorSummary={errorSummary}
        onSubmit={onSubmit}
        className="flex flex-col gap-5"
      >
        {done && (
          <Notice status="success" title="登録しました">
            確認のメールを送りました。メールの中のリンクから、登録を完了してください。
          </Notice>
        )}
        <TextField
          name="name"
          label="表示名"
          caption="ほかの人に表示される名前です"
          autoComplete="nickname"
          defaultValue={values.name}
          errorText={errors.name}
        />
        <TextField
          name="email"
          type="email"
          label="メールアドレス"
          autoComplete="email"
          defaultValue={values.email}
          errorText={errors.email}
        />
        <TextField
          name="password"
          type="password"
          label="パスワード"
          caption="8 文字以上"
          autoComplete="new-password"
          defaultValue={values.password}
          errorText={errors.password}
        />
        <Switch label="お知らせのメールを受け取る" caption="月に 1 回ほど届きます" name="news" />
        <Checkbox
          name="terms"
          defaultChecked={scenario !== 'empty' && scenario !== 'invalid'}
          label={
            <>
              <Link href="#terms">利用規約</Link>に同意する
            </>
          }
          errorText={errors.terms}
        />
        <Button type="submit" color="primary">
          登録する
        </Button>
      </Form>
    </AuthLayout>
  );
}

export function ResetPasswordScreen({ scenario = 'empty' }: { scenario?: Scenario }) {
  const values = filledValues(scenario);
  const [error, setError] = useState<string | undefined>(() => {
    if (scenario === 'invalid') return checkEmail(wrong.email);
    if (scenario === 'failed')
      return '送信できませんでした。しばらくしてからもう一度お試しください';
    return undefined;
  });
  const [submitting, setSubmitting] = useState(scenario === 'submitting');
  const [sentTo, setSentTo] = useState<string | undefined>(
    scenario === 'success' ? sample.email : undefined
  );
  const reply: ServerReply = scenario === 'failed' ? 'error' : 'ok';

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = valueOf(event.currentTarget, 'email');
    const invalid = checkEmail(email);
    setError(invalid);
    setSentTo(undefined);
    if (invalid) return;
    setSubmitting(true);
    await wait(1200);
    setSubmitting(false);
    if (reply === 'ok') setSentTo(email);
    else setError('送信できませんでした。しばらくしてからもう一度お試しください');
  };

  return (
    <AuthLayout
      title="パスワードの再設定"
      lead="登録したメールアドレスに、再設定のリンクを送ります。"
      footer={<Link href="#sign-in">サインインに戻る</Link>}
    >
      <Form submitting={submitting} onSubmit={onSubmit} className="flex flex-col gap-5">
        {sentTo && (
          <Notice status="info" title="メールを送りました">
            {sentTo} に届くリンクから、新しいパスワードを設定してください。
          </Notice>
        )}
        <TextField
          name="email"
          type="email"
          label="メールアドレス"
          autoComplete="email"
          defaultValue={values.email}
          errorText={error}
        />
        <Button type="submit" color="primary">
          リンクを送る
        </Button>
      </Form>
    </AuthLayout>
  );
}
