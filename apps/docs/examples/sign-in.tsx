'use client';

import { ToastProvider } from '@kazuemon/ui';

import { SamplePage } from './sample-page';
import { ResetPasswordScreen, type Scenario, SignInScreen, SignUpScreen } from './sign-in-parts';
import type { Example } from './types';

// サインイン・新規登録・パスワードの再設定。自分で打って送ると、検証のエラー →
// 1.2 秒の送信中 → サーバーの返事、と順に出ます。「状態を再現する」のボタンは、その途中の画面をすぐ出します

const scenarios = [
  { label: '検証のエラー', args: { scenario: 'invalid' } },
  { label: '送信中', args: { scenario: 'submitting' } },
  { label: 'サーバーが失敗', args: { scenario: 'failed' } },
  { label: '成功', args: { scenario: 'success' } },
];

export const signIn: Example = {
  slug: 'sign-in',
  title: 'サインイン',
  description: '検証のエラー・送信中・サーバーの返事を、ボタン 1 つで出せます',
  presets: scenarios,
  initialLabel: '入力前',
  controls: [{ name: 'remember', label: 'サインインしたままにする欄を出す', type: 'switch' }],
  defaults: { scenario: 'empty', remember: true },
  Screen: ({ args, density }) => (
    <SamplePage density={density} bare>
      <ToastProvider timeout={4000}>
        <SignInScreen scenario={args.scenario as Scenario} remember={args.remember as boolean} />
      </ToastProvider>
    </SamplePage>
  ),
};

export const signUp: Example = {
  slug: 'sign-up',
  title: '新規登録',
  description: '複数の欄の検証と、エラーの一覧（errorSummary）を確かめます',
  presets: scenarios,
  initialLabel: '入力前',
  controls: [{ name: 'errorSummary', label: 'エラーの一覧を出す', type: 'switch' }],
  defaults: { scenario: 'empty', errorSummary: false },
  Screen: ({ args, density }) => (
    <SamplePage density={density} bare>
      <SignUpScreen
        scenario={args.scenario as Scenario}
        errorSummary={args.errorSummary as boolean}
      />
    </SamplePage>
  ),
};

export const resetPassword: Example = {
  slug: 'reset-password',
  title: 'パスワードの再設定',
  description: '1 つの欄だけの画面。送ったあとの案内まで出します',
  presets: scenarios,
  initialLabel: '入力前',
  controls: [],
  defaults: { scenario: 'empty' },
  Screen: ({ args, density }) => (
    <SamplePage density={density} bare>
      <ResetPasswordScreen scenario={args.scenario as Scenario} />
    </SamplePage>
  ),
};
