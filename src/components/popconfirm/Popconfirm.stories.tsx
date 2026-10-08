import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Popconfirm } from './Popconfirm';
import { ScreenFrame } from '../../stories/story-parts';
import { Button } from '../button/Button';

// 開いた状態のストーリーも、ドキュメントのページでは閉じて描く（開くとフォーカスが移り、ページが流れるため）
const openOnLoad = (viewMode: string) => viewMode !== 'docs';

const meta = {
  title: 'Components/Popconfirm',
  component: Popconfirm,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'ボタンのそばに出る、小さな確かめの面です。「この下書きを削除しますか？」のような一言の問いと、取り消す・実行するの 2 つのボタンを見せます。',
          '',
          '- 開くボタンは `trigger` に要素（`Button` など）で渡します。問いは `title`、補足は `description`（省けます）、実行する側のボタンの文言は `actionLabel` に動詞で書きます。',
          '- 実行は `onAction` で受けます。Promise を返すと、終わるまで実行する側のボタンを送信中にし、面を閉じずに待ちます。失敗（reject）したときは閉じずに残します。',
          '- `color` は、失うものがある操作は `danger`（既定）、取り消しにくいが失うものはない操作は `primary` にします。',
          '- 開いた直後の焦点は、既定では `danger` なら取り消す側（うっかり Enter で実行しないため）、`primary` なら実行する側です。`autoFocus` で変えられます。',
          '- 外を押す・Esc では取り消したのと同じに閉じます（送信中は閉じません）。取り消せない大きな操作や、入力での確かめが要るときは AlertDialog を使います。',
          '- 読み上げでは dialog として伝わります。',
        ].join('\n'),
      },
    },
  },
  args: {
    trigger: <Button variant="outline">削除</Button>,
    title: 'この下書きを削除しますか？',
    description: '削除すると元に戻せません。',
    actionLabel: '削除する',
    color: 'danger',
    showIcon: false,
    actionsLayout: 'end',
    buttonSize: 'md',
  },
  argTypes: {
    color: {
      control: 'inline-radio',
      options: ['danger', 'primary'],
      table: { defaultValue: { summary: "'danger'" } },
    },
    actionsLayout: {
      control: 'inline-radio',
      options: ['end', 'fill'],
      table: { defaultValue: { summary: "'end'" } },
    },
    buttonSize: {
      control: 'inline-radio',
      options: ['sm', 'md'],
      table: { defaultValue: { summary: "'md'" } },
    },
    autoFocus: {
      control: 'inline-radio',
      options: ['cancel', 'action'],
      table: { defaultValue: { summary: "danger は 'cancel'、primary は 'action'" } },
    },
    side: {
      control: 'inline-radio',
      options: ['top', 'bottom', 'left', 'right'],
      table: { defaultValue: { summary: "'bottom'" } },
    },
    trigger: { control: false },
    portalContainer: { control: false },
  },
} satisfies Meta<typeof Popconfirm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  render: (args) => <Popconfirm {...args} />,
};

export const Open: Story = {
  tags: ['visual'],
  name: '開いた状態',
  parameters: {
    controls: { include: ['title', 'description', 'color', 'showIcon', 'actionsLayout'] },
  },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[240px]">
      {(frame) => (
        <div className="flex w-full justify-center pt-2">
          <Popconfirm
            key={`${args.side}-${args.color}-${args.showIcon}`}
            {...args}
            presentation="popover"
            defaultOpen={openOnLoad(viewMode)}
            portalContainer={frame}
          />
        </div>
      )}
    </ScreenFrame>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    // 読み上げの役割は dialog、名前は問い。開いた直後の焦点は取り消す側
    const popup = await body.findByRole('dialog', { name: 'この下書きを削除しますか？' });
    await expect(within(popup).getByText('削除すると元に戻せません。')).toBeVisible();
    await waitFor(() =>
      expect(within(popup).getByRole('button', { name: 'キャンセル' })).toHaveFocus()
    );
  },
};

export const Primary: Story = {
  tags: ['visual'],
  name: '失うものがない操作',
  args: {
    trigger: <Button variant="outline">公開</Button>,
    title: '今すぐ公開しますか？',
    description: '公開すると、フォロワーに通知が届きます。',
    actionLabel: '公開する',
    color: 'primary',
    showIcon: false,
  },
  parameters: { controls: { include: ['title', 'description', 'actionLabel', 'color'] } },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[240px]">
      {(frame) => (
        <div className="flex w-full justify-center pt-2">
          <Popconfirm
            {...args}
            presentation="popover"
            defaultOpen={openOnLoad(viewMode)}
            portalContainer={frame}
          />
        </div>
      )}
    </ScreenFrame>
  ),
};

export const TitleOnly: Story = {
  tags: ['visual'],
  name: '問いだけ',
  args: { description: undefined, title: '削除しますか？' },
  parameters: { controls: { include: ['title', 'color'] } },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[200px]">
      {(frame) => (
        <div className="flex w-full justify-center pt-2">
          <Popconfirm
            {...args}
            presentation="popover"
            defaultOpen={openOnLoad(viewMode)}
            portalContainer={frame}
          />
        </div>
      )}
    </ScreenFrame>
  ),
};

function SlowDelete(args: React.ComponentProps<typeof Popconfirm>) {
  const [done, setDone] = useState(0);
  return (
    <div className="flex items-center gap-3">
      <Popconfirm
        {...args}
        onAction={() =>
          new Promise((resolve) => setTimeout(resolve, 1200)).then(() => setDone((n) => n + 1))
        }
      />
      <span className="text-sm text-fg-muted">削除した回数: {done}</span>
    </div>
  );
}

export const Pending: Story = {
  name: '終わるまで待つ',
  parameters: {
    docs: {
      description: {
        story:
          '`onAction` が Promise を返すあいだは、実行する側のボタンが送信中になり、取り消すボタンは押せず、外を押す・Esc でも閉じません。終わると閉じます。',
      },
    },
  },
  render: (args) => <SlowDelete {...args} />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(within(canvasElement).getByRole('button', { name: '削除' }));
    const popup = await body.findByRole('dialog');
    await userEvent.click(within(popup).getByRole('button', { name: '削除する' }));
    // 待っているあいだは、Esc でも閉じない
    await userEvent.keyboard('{Escape}');
    await expect(body.getByRole('dialog')).toBeVisible();
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull(), { timeout: 4000 });
  },
};

export const Cancel: Story = {
  name: '取り消す',
  render: (args) => <Popconfirm {...args} onAction={undefined} />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(within(canvasElement).getByRole('button', { name: '削除' }));
    await body.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
  },
};
