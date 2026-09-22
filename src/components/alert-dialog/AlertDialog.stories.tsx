import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { AlertDialog } from './AlertDialog';
import { PhoneFrame, ScreenFrame } from '../../stories/story-parts';
import { sourceCode } from '../../stories/story-states';
import { Button } from '../button/Button';

// 開いた状態のストーリーも、ドキュメントのページでは閉じて描く（開くとフォーカスが移り、ページが流れるため）
const openOnLoad = (viewMode: string) => viewMode !== 'docs';

const meta = {
  title: 'Components/AlertDialog',
  component: AlertDialog,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '取り消せない操作（削除・送信など）の前に、続けるかを確かめる面です。見た目は Dialog と同じで、閉じるのは下の 2 つのボタンだけです。後ろの画面を押しても、Esc でも、下へはじいても閉じず、右上の × もありません。',
          '',
          '- `title` は問いの形で書きます（「下書きを削除しますか？」）。何が起きるか、元に戻せないことは `description` に書きます。',
          '- 実行する側のボタンの文言は `actionLabel` に、何が起きるかを動詞で書きます（「削除する」）。「OK」「はい」は使いません。取り消す側は `cancelLabel`（既定は「キャンセル」）です。',
          '- 押したときの処理は `onAction` に渡します。Promise を返すと、終わるまでボタンを送信中にして、終わってから閉じます。失敗したときは閉じずに残すので、失敗の知らせは `onAction` の中で出します。',
          '- 実行する側のボタンの色は `color` で選びます。既定の `danger` は危険の色で、消す・外すなど失うものがある操作に使います。失うものはないが取り消せない操作（送信・公開など）は `primary` にします。',
          '- 開いた直後のフォーカスは、取り消す側のボタンに置きます。うっかり Enter を押しても実行しません。',
          '- 出し方（`presentation`）は Dialog と同じです。シートで出すときも、下へはじいて閉じることはできず、つまみも出ません。',
          '- 入力を求めるとき、閉じる手段を複数残したいときは、Dialog を使います。',
        ].join('\n'),
      },
    },
  },
  args: {
    title: '下書きを削除しますか？',
    description: '削除した下書きは元に戻せません。',
    actionLabel: '削除する',
    cancelLabel: 'キャンセル',
    color: 'danger',
    presentation: 'auto',
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    actionLabel: { control: 'text' },
    cancelLabel: { control: 'text' },
    color: {
      control: 'inline-radio',
      options: ['danger', 'primary'],
      table: { defaultValue: { summary: "'danger'" } },
    },
    presentation: {
      control: 'inline-radio',
      options: ['auto', 'popover', 'sheet'],
      table: { defaultValue: { summary: "'auto'" } },
    },
    trigger: { control: false },
    children: { control: false },
    portalContainer: { control: false },
    onAction: { control: false },
  },
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  parameters: {
    docs: {
      source: sourceCode(`
        <AlertDialog
          title="下書きを削除しますか？"
          description="削除した下書きは元に戻せません。"
          actionLabel="削除する"
          onAction={() => deleteDraft()}
          trigger={<Button>下書きを削除</Button>}
        />
      `),
    },
  },
  render: (args) => <AlertDialog {...args} trigger={<Button>下書きを削除</Button>} />,
};

export const Open: Story = {
  tags: ['visual'],
  name: '開いた状態',
  parameters: {
    controls: { include: ['title', 'description', 'actionLabel', 'color'] },
    docs: {
      description: {
        story:
          '中央に浮かべた形です。取り消す側のボタンにフォーカスがあります。ここでは画面の代わりの枠の中に描いています。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[360px]">
      {(frame) => (
        <AlertDialog
          {...args}
          presentation="popover"
          trigger={<Button>下書きを削除</Button>}
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        />
      )}
    </ScreenFrame>
  ),
};

export const Primary: Story = {
  tags: ['visual'],
  name: '失うものがない操作（primary）',
  args: {
    title: '記事を公開しますか？',
    description: '公開すると、読者に通知が届きます。通知は取り消せません。',
    actionLabel: '公開する',
    color: 'primary',
  },
  parameters: {
    controls: { include: ['title', 'description', 'actionLabel', 'color'] },
    docs: {
      description: {
        story:
          '消えるものはないが取り消せない操作では、`color="primary"` で実行する側を主な色にします。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[360px]">
      {(frame) => (
        <AlertDialog
          {...args}
          presentation="popover"
          trigger={<Button>公開</Button>}
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        />
      )}
    </ScreenFrame>
  ),
};

export const WithContent: Story = {
  tags: ['visual'],
  name: '中身つき',
  args: {
    title: '3 件の下書きを削除しますか？',
    description: '次の下書きを削除します。削除した下書きは元に戻せません。',
    actionLabel: '3 件を削除する',
  },
  parameters: {
    controls: { include: ['title', 'description', 'actionLabel'] },
    docs: {
      description: {
        story: '消えるものを一覧で見せるときは、中身（children）に渡します。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[420px]">
      {(frame) => (
        <AlertDialog
          {...args}
          presentation="popover"
          trigger={<Button>選んだ下書きを削除</Button>}
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        >
          <ul className="list-disc pl-5 text-fg-muted">
            <li>週末の買い物メモ</li>
            <li>デザインの原則について</li>
            <li>新しい部品の案</li>
          </ul>
        </AlertDialog>
      )}
    </ScreenFrame>
  ),
};

export const Sheet: Story = {
  tags: ['visual'],
  name: 'シート',
  parameters: {
    controls: { include: ['title', 'description', 'actionLabel', 'color'] },
    docs: {
      description: {
        story:
          '`presentation="sheet"` のとき、または `auto` で指で操作していて画面が狭いときは、画面の下から出るシートにします。下へはじいても閉じないので、つまみは出しません。ボタンは幅いっぱいで縦に積み、実行する側を上にします。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <PhoneFrame>
      {(frame) => (
        <AlertDialog
          {...args}
          presentation="sheet"
          trigger={<Button>下書きを削除</Button>}
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        />
      )}
    </PhoneFrame>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('alertdialog', { name: '下書きを削除しますか？' });
    await expect(within(dialog).queryByRole('button', { name: '閉じる' })).toBeNull();
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'キャンセル' })).toHaveFocus()
    );
  },
};

export const Accessibility: Story = {
  name: '読み上げとキーボード',
  args: { onAction: fn() },
  parameters: { controls: { disable: true } },
  render: (args) => (
    <AlertDialog {...args} presentation="popover" trigger={<Button>下書きを削除</Button>} />
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: '下書きを削除' });
    await userEvent.click(trigger);
    const dialog = await body.findByRole('alertdialog', { name: '下書きを削除しますか？' });
    await expect(dialog).toHaveAccessibleDescription('削除した下書きは元に戻せません。');
    await expect(within(dialog).queryByRole('button', { name: '閉じる' })).toBeNull();
    // 開いた直後のフォーカスは取り消す側
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'キャンセル' })).toHaveFocus()
    );
    // Esc では閉じない
    await userEvent.keyboard('{Escape}');
    await expect(body.getByRole('alertdialog')).toBeInTheDocument();
    // 取り消すと、実行せずに閉じて、開いたボタンにフォーカスが戻る
    await userEvent.click(within(dialog).getByRole('button', { name: 'キャンセル' }));
    await waitFor(() => expect(body.queryByRole('alertdialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(args.onAction).not.toHaveBeenCalled();
    // 実行すると、onAction を呼んで閉じる
    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole('button', { name: '削除する' }));
    await waitFor(() => expect(body.queryByRole('alertdialog')).toBeNull());
    await expect(args.onAction).toHaveBeenCalledTimes(1);
  },
};

export const Pending: Story = {
  name: '終わるまで待つ',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`onAction` が Promise を返すと、終わるまで実行する側のボタンを送信中にし、取り消す側を押せなくします。終わってから閉じます。',
      },
      source: sourceCode(`
        <AlertDialog
          title="下書きを削除しますか？"
          actionLabel="削除する"
          onAction={async () => {
            await deleteDraft();
          }}
          trigger={<Button>下書きを削除</Button>}
        />
      `),
    },
  },
  render: (args) => (
    <AlertDialog
      {...args}
      presentation="popover"
      onAction={() => new Promise((resolve) => setTimeout(resolve, 1000))}
      trigger={<Button>下書きを削除</Button>}
    />
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(within(canvasElement).getByRole('button', { name: '下書きを削除' }));
    const dialog = await body.findByRole('alertdialog');
    const action = within(dialog).getByRole('button', { name: '削除する' });
    await userEvent.click(action);
    await waitFor(() => expect(action).toHaveAttribute('aria-busy', 'true'));
    await expect(within(dialog).getByRole('button', { name: 'キャンセル' })).toBeDisabled();
    await waitFor(() => expect(body.queryByRole('alertdialog')).toBeNull(), { timeout: 3000 });
  },
};
