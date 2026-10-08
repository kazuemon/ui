'use client';

import {
  Button,
  Checkbox,
  Divider,
  Form,
  Heading,
  Link,
  Notice,
  PasswordField,
  PinField,
  Stack,
  Stepper,
  StepperStep,
  Switch,
  Text,
  TextField,
} from '@kazuemon/ui';
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';

import { town } from './sites';

// 新規登録の画面（Kazue Hub に入る）。アカウント → 確認コード → プロフィールの 3 段を、Stepper で進み具合を見せながら進む
// サーバーの返事は待つふり（1.2 秒）。画面の状態は scenario で作る（切替画面の「状態を再現する」のボタン）。押すとその状態で描き直す

export type ServerReply = 'ok' | 'error';

/**
 * 再現する状態。empty は入力前、invalid は検証のエラー、submitting は送信中、failed はサーバーが断ったあと（1 段目）、
 * code は確認コードの段、success は登録が終わったあと
 */
export type Scenario = 'empty' | 'invalid' | 'submitting' | 'failed' | 'code' | 'success';

/** 状態を再現するときに、欄へ入れておく値 */
const sample = { email: 'kazuemon@example.com', password: 'password123' };
/** 検証のエラーを再現するときの、正しくない値 */
const wrong = { email: 'kazuemon', password: '123' };

/** その状態で、1 段目の欄に入っている値 */
function filledValues(scenario: Scenario) {
  if (scenario === 'invalid') return wrong;
  return scenario === 'empty' ? { email: '', password: '' } : sample;
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
            {town.name}
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
  scenario,
  reply,
  errorSummary,
  onDone,
}: {
  scenario: Scenario;
  reply: ServerReply;
  errorSummary: boolean;
  onDone: (email: string) => void;
}) {
  const values = filledValues(scenario);
  const [errors, setErrors] = useState<{ email?: string; password?: string; terms?: string }>(
    scenario === 'failed' ? { email: 'このメールアドレスは、すでに登録されています' } : {}
  );
  const [submitting, setSubmitting] = useState(scenario === 'submitting');
  // 検証のエラーは、値を入れたうえで実際に送って出す。エラーの一覧（errorSummary）は
  // 送ったときに作られるので、状態を組み立てるだけでは出ない。一覧の入り切りを変えたときも送り直す
  const formRef = useRef<HTMLFormElement>(null);
  // effect の中で直に送ると、Form が送信の中で描く（flushSync）ときに React の描画と重なるので、描き終えてから送る
  useEffect(() => {
    if (scenario === 'invalid') queueMicrotask(() => formRef.current?.requestSubmit());
    // oxlint-disable-next-line react/exhaustive-effect-dependencies -- errorSummary が変わったら送り直す（本体では読まない）
  }, [scenario, errorSummary]);

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
    <Form ref={formRef} submitting={submitting} showErrorSummary={errorSummary} onSubmit={onSubmit}>
      {/* 欄の間隔は Form ではなく、中に入れた Stack で決める */}
      <Stack gap="lg">
        <TextField
          name="email"
          type="email"
          label="メールアドレス"
          autoComplete="email"
          defaultValue={values.email}
          errorText={errors.email}
        />
        <PasswordField
          name="password"
          label="パスワード"
          caption="8 文字以上"
          autoComplete="new-password"
          defaultValue={values.password}
          errorText={errors.password}
        />
        <Checkbox
          name="terms"
          label={
            <>
              <Link href="#terms">利用規約</Link>に同意する
            </>
          }
          defaultChecked={scenario === 'submitting' || scenario === 'failed'}
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
          <Button variant="underline" size="sm" onClick={() => setResent(true)}>
            コードを送り直す
          </Button>
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

/** その状態で、はじめに開いている段 */
function initialStep(scenario: Scenario) {
  if (scenario === 'code') return 1;
  return scenario === 'success' ? steps.length : 0;
}

export function SignUpScreen({
  scenario = 'empty',
  errorSummary,
}: {
  scenario?: Scenario;
  errorSummary: boolean;
}) {
  const [step, setStep] = useState(initialStep(scenario));
  const [email, setEmail] = useState(scenario === 'empty' ? '' : sample.email);
  const reply: ServerReply = scenario === 'failed' ? 'error' : 'ok';
  const done = step >= steps.length;
  // 段が変わったら、新しい段の最初の欄へ（終わったら完了の知らせへ）フォーカスを移す。前の段の欄は消えるので、移さないと body に落ちる
  //   開いた直後（最初の描画）は動かさない
  const stepRef = useRef<HTMLDivElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  const shown = useRef(false);
  useEffect(() => {
    if (!shown.current) {
      shown.current = true;
      return;
    }
    if (step >= steps.length) noticeRef.current?.focus();
    else stepRef.current?.querySelector<HTMLElement>('input, textarea, select')?.focus();
  }, [step]);

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
      <div ref={stepRef} className="contents">
        {step === 0 && (
          <AccountStep
            scenario={scenario}
            reply={reply}
            errorSummary={errorSummary}
            onDone={(next) => {
              setEmail(next);
              setStep(1);
            }}
          />
        )}
        {step === 1 && <CodeStep email={email} reply={reply} onDone={() => setStep(2)} />}
        {step === 2 && <ProfileStep onDone={() => setStep(3)} />}
      </div>
      {done && (
        <Notice
          ref={noticeRef}
          tabIndex={-1}
          status="success"
          title="登録が終わりました"
          actions={
            <Link href="#new-post" variant="button" color="primary">
              はじめての投稿をする
            </Link>
          }
        >
          ようこそ。さっそく、はじめての投稿をしてみましょう。
        </Notice>
      )}
    </AuthLayout>
  );
}
