'use client';

import { SamplePage } from './sample-page';
import { type Scenario, SignUpScreen } from './sign-in-parts';
import type { Example } from './types';

// 新規登録。アカウント → 確認コード → プロフィールの 3 段を進む。自分で打って送ると、検証のエラー →
// 1.2 秒の送信中 → サーバーの返事、と順に出ます。「状態を再現する」のボタンは、その途中の画面をすぐ出します

export const signUp: Example = {
  slug: 'sign-up',
  title: '新規登録',
  description: 'アカウント・確認コード・プロフィールの 3 段で、アカウントを作る画面',
  presets: [
    { label: '検証のエラー', args: { scenario: 'invalid' } },
    { label: '送信中', args: { scenario: 'submitting' } },
    { label: 'サーバーが断った', args: { scenario: 'failed' } },
    { label: '確認コード', args: { scenario: 'code' } },
    { label: '登録が終わった', args: { scenario: 'success' } },
  ],
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
