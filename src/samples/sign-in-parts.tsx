import { type FormEvent, type ReactNode, useState } from 'react';

import { Button } from '../components/button/Button';
import { Checkbox } from '../components/checkbox/Checkbox';
import { Divider } from '../components/divider/Divider';
import { Form } from '../components/form/Form';
import { Heading } from '../components/heading/Heading';
import { Link } from '../components/link/Link';
import { Notice } from '../components/notice/Notice';
import { Stack } from '../components/stack/Stack';
import { Switch } from '../components/switch/Switch';
import { Text } from '../components/text/Text';
import { TextField } from '../components/text-field/TextField';
import { useToast } from '../components/toast/Toast';

// サインイン系の画面。サーバーの返事は待つふり（1.2 秒）で、返事は Controls で決める

export type ServerReply = 'ok' | 'error';

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
      <Stack gap="lg" className="w-full max-w-[400px]">
        <Stack gap="xs">
          <Text as="span" className="font-heading text-fg-brand">
            kazuemon
          </Text>
          <Heading level={1} size={2}>
            {title}
          </Heading>
          {lead && <Text variant="muted">{lead}</Text>}
        </Stack>
        {children}
        {footer && (
          <>
            <Divider />
            <Text size="sm" variant="muted">
              {footer}
            </Text>
          </>
        )}
      </Stack>
    </div>
  );
}

export function SignInScreen({ reply }: { reply: ServerReply }) {
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [failed, setFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

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
      <Form submitting={submitting} onSubmit={onSubmit}>
        {/* 欄の間隔は Form ではなく、中に入れた Stack で決める（ADR-0254） */}
        <Stack gap="lg">
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
            errorText={errors.email}
          />
          <Stack gap="sm">
            <TextField
              name="password"
              type="password"
              label="パスワード"
              autoComplete="current-password"
              errorText={errors.password}
            />
            <Text size="sm">
              <Link href="#reset">パスワードを忘れたとき</Link>
            </Text>
          </Stack>
          <Checkbox label="このブラウザでは、サインインしたままにする" name="remember" />
          <Button type="submit" color="primary">
            サインインする
          </Button>
        </Stack>
      </Form>
    </AuthLayout>
  );
}

export function SignUpScreen({
  reply,
  showErrorSummary,
}: {
  reply: ServerReply;
  showErrorSummary: boolean;
}) {
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    terms?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

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
      <Form submitting={submitting} showErrorSummary={showErrorSummary} onSubmit={onSubmit}>
        <Stack gap="lg">
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
            errorText={errors.name}
          />
          <TextField
            name="email"
            type="email"
            label="メールアドレス"
            autoComplete="email"
            errorText={errors.email}
          />
          <TextField
            name="password"
            type="password"
            label="パスワード"
            caption="8 文字以上"
            autoComplete="new-password"
            errorText={errors.password}
          />
          <Switch label="お知らせのメールを受け取る" caption="月に 1 回ほど届きます" name="news" />
          <Checkbox
            name="terms"
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
        </Stack>
      </Form>
    </AuthLayout>
  );
}

export function ResetPasswordScreen({ reply }: { reply: ServerReply }) {
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string>();

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
      <Form submitting={submitting} onSubmit={onSubmit}>
        <Stack gap="lg">
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
            errorText={error}
          />
          <Button type="submit" color="primary">
            リンクを送る
          </Button>
        </Stack>
      </Form>
    </AuthLayout>
  );
}
