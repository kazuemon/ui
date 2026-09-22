import type { Meta, StoryObj } from '@storybook/react-vite';

import { ToastProvider } from '../components/toast/Toast';
import { SamplePage, densityOf } from './SamplePage';
import { ResetPasswordScreen, type ServerReply, SignInScreen, SignUpScreen } from './sign-in-parts';

// 見本のページ: サインイン・新規登録・パスワードの再設定。検証のエラー、送信中、サーバーの返事を、実際に操作して確かめる

interface PageArgs {
  reply: ServerReply;
  showErrorSummary: boolean;
}

const meta = {
  title: 'Overview/見本',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'サインイン・新規登録・パスワードの再設定の見本です。空のまま送ると検証のエラー、正しく入れると 1.2 秒の送信中のあと、サーバーの返事（Controls）が出ます。',
      },
    },
  },
  args: { reply: 'ok', showErrorSummary: false },
  argTypes: {
    reply: {
      name: 'サーバーの返事',
      control: { type: 'inline-radio', labels: { ok: '成功', error: '失敗' } },
      options: ['ok', 'error'],
    },
    showErrorSummary: {
      name: '新規登録: エラーの一覧（showErrorSummary）',
      control: 'boolean',
    },
  },
} satisfies Meta<PageArgs>;

export default meta;
type Story = StoryObj<PageArgs>;

export const SignIn: Story = {
  name: 'サインイン',
  render: ({ reply }, { globals }) => (
    <SamplePage density={densityOf(globals)} bare>
      <ToastProvider timeout={4000}>
        <SignInScreen reply={reply} />
      </ToastProvider>
    </SamplePage>
  ),
};

export const SignUp: Story = {
  name: '新規登録',
  render: ({ reply, showErrorSummary }, { globals }) => (
    <SamplePage density={densityOf(globals)} bare>
      <SignUpScreen reply={reply} showErrorSummary={showErrorSummary} />
    </SamplePage>
  ),
};

export const ResetPassword: Story = {
  name: 'パスワードの再設定',
  render: ({ reply }, { globals }) => (
    <SamplePage density={densityOf(globals)} bare>
      <ResetPasswordScreen reply={reply} />
    </SamplePage>
  ),
};
