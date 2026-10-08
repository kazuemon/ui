import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { SamplePage, densityOf } from './SamplePage';
import { type ServerReply, SignUpScreen } from './sign-up-parts';

// 見本のページ: 新規登録。アカウント → 確認コード → プロフィールの 3 段を、検証のエラー、送信中、サーバーの返事ごと操作して確かめる

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
          '新規登録の見本です。空のまま進むと検証のエラー、正しく入れると 1.2 秒の送信中のあと、サーバーの返事（Controls）で次の段に進むか、エラーを出します。確認コードは 6 桁なら何でも通ります。',
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
      name: 'エラーの一覧（showErrorSummary）',
      control: 'boolean',
    },
  },
} satisfies Meta<PageArgs>;

export default meta;
type Story = StoryObj<PageArgs>;

// 送信中は 1.2 秒続くので、返事を待つ確かめは長めに待つ
const afterReply = { timeout: 4000 };

export const SignUp: Story = {
  name: '新規登録',
  render: ({ reply, showErrorSummary }, { globals }) => (
    <SamplePage density={densityOf(globals)} bare>
      <SignUpScreen reply={reply} showErrorSummary={showErrorSummary} />
    </SamplePage>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const current = () =>
      canvas
        .getByRole('navigation', { name: '登録の進み具合' })
        .querySelector('[aria-current="step"]');

    await step('空のまま進むと、欄ごとにエラーを出す', async () => {
      await userEvent.click(canvas.getByRole('button', { name: '次へ' }));
      await waitFor(() =>
        expect(canvas.getByText('メールアドレスを入力してください')).toBeVisible()
      );
      await waitFor(() => expect(canvas.getByText('パスワードを入力してください')).toBeVisible());
      await waitFor(() => expect(canvas.getByText('同意が必要です')).toBeVisible());
    });

    await step('正しく入れると、送信中のあと確認コードの段に進む', async () => {
      await userEvent.type(canvas.getByLabelText('メールアドレス'), 'kazuemon@example.com');
      await userEvent.type(canvas.getByLabelText('パスワード'), 'correct-horse');
      await userEvent.click(canvas.getByRole('checkbox', { name: '利用規約に同意する' }));
      await userEvent.click(canvas.getByRole('button', { name: '次へ' }));
      await waitFor(() => expect(current()).toHaveTextContent('確認コード'), afterReply);
      // 前の段の欄は消えるので、新しい段の最初の欄へフォーカスが移る
      await waitFor(() => expect(canvas.getAllByRole('textbox')[0]).toHaveFocus());
    });

    await step('6 桁に満たないコードはエラー、6 桁で次の段に進む', async () => {
      await userEvent.click(canvas.getByRole('button', { name: '確認する' }));
      await waitFor(() => expect(canvas.getByText('6 桁のコードを入力してください')).toBeVisible());
      await userEvent.type(canvas.getAllByRole('textbox')[0], '123456');
      await userEvent.click(canvas.getByRole('button', { name: '確認する' }));
      await waitFor(() => expect(current()).toHaveTextContent('プロフィール'), afterReply);
    });

    await step('表示名を入れると登録が終わる', async () => {
      await userEvent.type(canvas.getByLabelText('表示名'), 'かずえもん');
      await userEvent.click(canvas.getByRole('button', { name: '登録を終える' }));
      // 知らせは現れる動きを持つので、見えきるまで待つ
      await waitFor(() => expect(canvas.getByText('登録が終わりました')).toBeVisible(), afterReply);
      await expect(
        canvas.getByText('登録が終わりました').closest('[data-slot="notice"]')
      ).toHaveFocus();
    });
  },
};
