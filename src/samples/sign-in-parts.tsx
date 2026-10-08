import { type FormEvent, type ReactNode, useState } from 'react';

import { Button } from '../components/button/Button';
import { Checkbox } from '../components/checkbox/Checkbox';
import { Divider } from '../components/divider/Divider';
import { Form } from '../components/form/Form';
import { Heading } from '../components/heading/Heading';
import { Link } from '../components/link/Link';
import { Notice } from '../components/notice/Notice';
import { PasswordField } from '../components/password-field/PasswordField';
import { PinField } from '../components/pin-field/PinField';
import { Stack } from '../components/stack/Stack';
import { Stepper, StepperStep } from '../components/stepper/Stepper';
import { Switch } from '../components/switch/Switch';
import { Text } from '../components/text/Text';
import { TextField } from '../components/text-field/TextField';

// 新規登録の画面。アカウント → 確認コード → プロフィールの 3 段を、Stepper で進み具合を見せながら進む
// サーバーの返事は待つふり（1.2 秒）で、返事は Controls で決める

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
function AuthLayout({
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
          <Heading level={1} size="xl">
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

const steps = ['アカウント', '確認コード', 'プロフィール'];

/** 1 段目: メールアドレスとパスワード、利用規約への同意 */
function AccountStep({
  reply,
  showErrorSummary,
  onDone,
}: {
  reply: ServerReply;
  showErrorSummary: boolean;
  onDone: (email: string) => void;
}) {
  const [errors, setErrors] = useState<{ email?: string; password?: string; terms?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const email = valueOf(form, 'email');
    const terms = form.elements.namedItem('terms');
    const next = {
      email: checkEmail(email),
      password: checkPassword(valueOf(form, 'password')),
      terms: terms instanceof HTMLInputElement && terms.checked ? undefined : '同意が必要です',
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    setSubmitting(true);
    await wait(1200);
    // サーバーの返事は、送信中が終わる描画で渡す（Form が、エラーの欄へフォーカスを移す）
    setSubmitting(false);
    if (reply === 'ok') onDone(email);
    else setErrors({ email: 'このメールアドレスは、すでに登録されています' });
  };

  return (
    <Form submitting={submitting} showErrorSummary={showErrorSummary} onSubmit={onSubmit}>
      {/* 欄の間隔は Form ではなく、中に入れた Stack で決める */}
      <Stack gap="lg">
        <TextField
          name="email"
          type="email"
          label="メールアドレス"
          autoComplete="email"
          errorText={errors.email}
        />
        <PasswordField
          name="password"
          label="パスワード"
          caption="8 文字以上"
          autoComplete="new-password"
          errorText={errors.password}
        />
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
          次へ
        </Button>
      </Stack>
    </Form>
  );
}

/** 2 段目: メールに届いた 6 桁の確認コード */
function CodeStep({
  email,
  reply,
  onDone,
}: {
  email: string;
  reply: ServerReply;
  onDone: () => void;
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [resent, setResent] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const invalid = code.length === 6 ? undefined : '6 桁のコードを入力してください';
    setError(invalid);
    if (invalid) return;
    setSubmitting(true);
    await wait(1200);
    setSubmitting(false);
    if (reply === 'ok') onDone();
    else setError('コードが違います。メールをもう一度確かめてください');
  };

  return (
    <Form submitting={submitting} onSubmit={onSubmit}>
      <Stack gap="lg">
        {resent && (
          <Notice status="info" title="コードを送り直しました">
            {email} に、新しいコードを送りました。
          </Notice>
        )}
        <PinField
          label="確認コード"
          caption={`${email} に送った 6 桁のコードです`}
          value={code}
          onValueChange={setCode}
          errorText={error}
        />
        <Button type="submit" color="primary">
          確認する
        </Button>
        <Text size="sm" variant="muted">
          メールが届かないときは、
          <Link
            href="#resend"
            onClick={(event) => {
              event.preventDefault();
              setResent(true);
            }}
          >
            コードを送り直す
          </Link>
          か、迷惑メールのフォルダを確かめてください。
        </Text>
      </Stack>
    </Form>
  );
}

/** 3 段目: ほかの人に見える名前と、お知らせの受け取り */
function ProfileStep({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string>();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = valueOf(event.currentTarget, 'name');
    const invalid = name ? undefined : '表示名を入力してください';
    setError(invalid);
    if (!invalid) onDone();
  };

  return (
    <Form onSubmit={onSubmit}>
      <Stack gap="lg">
        <TextField
          name="name"
          label="表示名"
          caption="ほかの人に表示される名前です。あとから変えられます"
          autoComplete="nickname"
          errorText={error}
        />
        <Switch label="お知らせのメールを受け取る" caption="月に 1 回ほど届きます" name="news" />
        <Button type="submit" color="primary">
          登録を終える
        </Button>
      </Stack>
    </Form>
  );
}

export function SignUpScreen({
  reply,
  showErrorSummary,
}: {
  reply: ServerReply;
  showErrorSummary: boolean;
}) {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const done = step >= steps.length;

  return (
    <AuthLayout
      title="新規登録"
      lead="3 つの手順で、1 分ほどで終わります。"
      footer={
        <>
          アカウントをお持ちの方は<Link href="#sign-in">サインイン</Link>へ
        </>
      }
    >
      <Stepper value={step} size="sm" accessibleName="登録の進み具合">
        {steps.map((label) => (
          <StepperStep key={label} label={label} />
        ))}
      </Stepper>
      {step === 0 && (
        <AccountStep
          reply={reply}
          showErrorSummary={showErrorSummary}
          onDone={(next) => {
            setEmail(next);
            setStep(1);
          }}
        />
      )}
      {step === 1 && <CodeStep email={email} reply={reply} onDone={() => setStep(2)} />}
      {step === 2 && <ProfileStep onDone={() => setStep(3)} />}
      {done && (
        <Notice status="success" title="登録が終わりました">
          ようこそ。さっそく、はじめての投稿をしてみましょう。
        </Notice>
      )}
    </AuthLayout>
  );
}
