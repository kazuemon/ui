import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Dialog } from './Dialog';
import { OverlayClose } from '../../internal/overlay/overlay-close';
import { PhoneFrame, ScreenFrame } from '../../stories/story-parts';
import { sourceCode } from '../../stories/story-states';
import { Button } from '../button/Button';
import { TextField } from '../text-field/TextField';

// 開いた状態のストーリーも、ドキュメントのページでは閉じて描く（開くとフォーカスが移り、ページが流れるため）
const openOnLoad = (viewMode: string) => viewMode !== 'docs';

const actions = (
  <>
    <OverlayClose render={<Button variant="outline">キャンセル</Button>} />
    <OverlayClose render={<Button color="primary">保存する</Button>} />
  </>
);

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'ページの上に重ねて、ほかの操作を止めて答えや入力を求める面です。開いているあいだ、後ろの画面は暗くなり、押せません。',
          '',
          '- `title` は見出しの題で、読み上げでは開いた面の名前になります。補足は `description` に書きます。中身の見出しや画像で何の面か分かるときは `title` を省けます。そのときは `accessibleName` に読み上げの名前を書きます（どちらか一方が要ります）。',
          '- 開くボタンは `trigger` に要素（`Button` など）で渡します。開閉を外から決めるときは `open`・`onOpenChange` を使います。',
          '- 下に並べるボタンは `actions` に渡します。押して閉じるボタンは `OverlayClose` の `render` に渡します。最も進めたい操作を右端に置き、色を付けます。',
          '- 閉じる手段は、右上の ×、Esc、後ろの画面を押す、の3つです。入力の途中で閉じると困るときは `dismissible={false}` で後ろの画面を押しても閉じないようにし、答えるまで閉じたくないときは `closeOnEscape={false}` と `hideCloseButton` も付けて、`actions` のボタンだけで閉じるようにします。',
          '- 出し方は `presentation` で決めます。既定の `auto` は、指で操作していて画面が狭いときだけ、画面の下から出るシートにします。シートのときは、下のボタンを幅いっぱいで縦に積み、最後に渡した主な操作を上にします。並べ方は `actionsLayout` で変えられます（`stack` 渡した順に上から・`end` 右寄せ・`fill` 幅を等分）。中央に浮かべるときは、いつも右寄せです。',
          '- 裏を止めたくないときは `modal={false}`、後ろを見せたまま外を押しても閉じないようにするときは `modal="passive"` にします。シートで出すときに、はじいて閉じるかだけを変えるときは `closeOnSwipe` です。',
          '- 面の要素に `id`・`data-*` などを付けるときは `popupProps`、開閉の動きが終わったことを知るには `onOpenChangeComplete` を使います。',
          '- 開いた直後のフォーカスは、最初に Tab で止まるもの（右上の ×）に移ります。別の場所に置くときは、その要素に `autoFocus`（Dialog の `autoFocus` に要素か ref を渡しても決められます）を付けます。閉じたあとの戻り先は `returnFocus` です。入力を求めるときは最初の入力欄に、取り消せない操作を確かめるときは取り消しのボタン（キャンセル）に付けます。',
        ].join('\n'),
      },
    },
  },
  args: {
    title: 'プロフィールを編集',
    description: '公開するプロフィールに表示されます。',
    presentation: 'auto',
    dismissible: true,
    closeOnEscape: true,
    hideCloseButton: false,
    closeName: '閉じる',
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    presentation: {
      control: 'inline-radio',
      options: ['auto', 'popover', 'sheet'],
      table: { defaultValue: { summary: "'auto'" } },
    },
    trigger: { control: false },
    actions: { control: false },
    children: { control: false },
    portalContainer: { control: false },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  parameters: {
    docs: {
      source: sourceCode(`
        <Dialog
          title="プロフィールを編集"
          description="公開するプロフィールに表示されます。"
          trigger={<Button>プロフィールを編集</Button>}
          actions={
            <>
              <OverlayClose render={<Button variant="outline">キャンセル</Button>} />
              <OverlayClose render={<Button color="primary">保存する</Button>} />
            </>
          }
        >
          <TextField label="表示名" defaultValue="かずえもん" />
        </Dialog>
      `),
    },
  },
  render: (args) => (
    <Dialog {...args} trigger={<Button>プロフィールを編集</Button>} actions={actions}>
      <TextField label="表示名" defaultValue="かずえもん" />
    </Dialog>
  ),
};

export const Open: Story = {
  tags: ['visual'],
  name: '開いた状態',
  parameters: {
    controls: { include: ['title', 'description'] },
    docs: {
      description: {
        story: '中央に浮かべた形です。ここでは画面の代わりの枠の中に描いています。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <ScreenFrame>
      {(frame) => (
        <Dialog
          {...args}
          presentation="popover"
          trigger={<Button>プロフィールを編集</Button>}
          actions={actions}
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        >
          <TextField label="表示名" defaultValue="かずえもん" />
        </Dialog>
      )}
    </ScreenFrame>
  ),
};

export const Confirm: Story = {
  tags: ['visual'],
  name: '確かめる（中身なし）',
  args: {
    title: '下書きを削除しますか？',
    description: '削除した下書きは元に戻せません。',
  },
  parameters: {
    controls: { include: ['title', 'description', 'dismissible'] },
    docs: {
      description: {
        story:
          '題と説明だけで答えを求める形です。取り消せない操作は、ボタンの文言で何が起きるかを書きます。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[360px]">
      {(frame) => (
        <Dialog
          {...args}
          presentation="popover"
          trigger={<Button>下書きを削除</Button>}
          actions={
            <>
              {/* 取り消せない操作では、開いた直後のフォーカスを取り消しのボタンに置く */}
              <OverlayClose
                render={
                  <Button variant="outline" autoFocus>
                    キャンセル
                  </Button>
                }
              />
              <OverlayClose render={<Button color="danger">削除する</Button>} />
            </>
          }
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        />
      )}
    </ScreenFrame>
  ),
};

export const Sheet: Story = {
  tags: ['visual'],
  name: 'シート',
  parameters: {
    controls: { include: ['title', 'description'] },
    docs: {
      description: {
        story:
          '`presentation="sheet"` のとき、または `auto` で指で操作していて画面が狭いときは、画面の下から出るシートにします。見出しは Select のシートと同じ形で、下へはじくと閉じます。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <PhoneFrame>
      {(frame) => (
        <Dialog
          {...args}
          presentation="sheet"
          trigger={<Button>プロフィールを編集</Button>}
          actions={actions}
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        >
          <TextField label="表示名" defaultValue="かずえもん" />
        </Dialog>
      )}
    </PhoneFrame>
  ),
};

export const Required: Story = {
  tags: ['visual'],
  name: '答えるまで閉じない',
  args: {
    title: '利用規約が変わりました',
    description: '続けるには、新しい利用規約に同意してください。',
    dismissible: false,
    closeOnEscape: false,
    hideCloseButton: true,
  },
  parameters: {
    controls: { include: ['dismissible', 'closeOnEscape', 'hideCloseButton'] },
    docs: {
      description: {
        story:
          '`dismissible={false}`・`closeOnEscape={false}`・`hideCloseButton` で、後ろの画面・Esc・× のどれでも閉じないようにした形です。閉じる手段を `actions` に必ず置きます。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[360px]">
      {(frame) => (
        <Dialog
          {...args}
          presentation="popover"
          trigger={<Button>利用規約</Button>}
          actions={
            <>
              <OverlayClose render={<Button variant="outline">あとで</Button>} />
              <OverlayClose render={<Button color="primary">同意する</Button>} />
            </>
          }
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        />
      )}
    </ScreenFrame>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog', { name: '利用規約が変わりました' });
    await expect(within(dialog).queryByRole('button', { name: '閉じる' })).toBeNull();
    await userEvent.keyboard('{Escape}');
    await expect(body.getByRole('dialog')).toBeInTheDocument();
  },
};

export const NarrowCentered: Story = {
  tags: ['visual'],
  name: '狭い画面の中央',
  args: {
    title: '利用規約が変わりました',
    description: '続けるには、新しい利用規約に同意してください。',
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '中央に出す面（`presentation="popover"`）は、画面が面の幅より狭いときも、左右に余白を残して画面の幅に収まります。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[360px]" width="w-[400px]">
      {(frame) => (
        <Dialog
          {...args}
          presentation="popover"
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
          actions={actions}
        />
      )}
    </ScreenFrame>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog', { name: '利用規約が変わりました' });
    const frame = canvasElement.ownerDocument.querySelector('[data-density="fine"].relative');
    await waitFor(() => {
      const box = dialog.getBoundingClientRect();
      const bounds = frame!.getBoundingClientRect();
      void expect(box.left).toBeGreaterThanOrEqual(bounds.left);
      void expect(box.right).toBeLessThanOrEqual(bounds.right);
    });
  },
};

export const WithoutTitle: Story = {
  tags: ['visual'],
  name: '題を置かない',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '中身の見出しや画像で何の面か分かるときは、`title` を省き、`accessibleName` に読み上げの名前を書きます。右上の × の行は残り、中身はその下から始まります。',
      },
      source: sourceCode(`
        <Dialog
          accessibleName="新しい機能のお知らせ"
          trigger={<Button>お知らせ</Button>}
          actions={<OverlayClose render={<Button color="primary">わかった</Button>} />}
        >
          <img src="/images/whats-new.png" alt="" />
          <p>下書きを予約して公開できるようになりました。</p>
        </Dialog>
      `),
    },
  },
  render: (_args, { viewMode }) => (
    <ScreenFrame height="h-[440px]">
      {(frame) => (
        <Dialog
          accessibleName="新しい機能のお知らせ"
          presentation="popover"
          trigger={<Button>お知らせ</Button>}
          actions={<OverlayClose render={<Button color="primary">わかった</Button>} />}
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        >
          <div className="flex flex-col gap-3">
            <div aria-hidden className="aspect-[2/1] rounded-control bg-primary-subtle" />
            <p>下書きを予約して公開できるようになりました。</p>
          </div>
        </Dialog>
      )}
    </ScreenFrame>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog', { name: '新しい機能のお知らせ' });
    await expect(dialog).not.toHaveAttribute('aria-labelledby');
    await expect(within(dialog).getByRole('button', { name: '閉じる' })).toBeInTheDocument();
  },
};

export const AccessibleName: Story = {
  name: '読み上げの名前',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`title` と `accessibleName` を両方渡すと、読み上げでは `accessibleName` が面の名前になります。シートで出すときも同じです。',
      },
    },
  },
  render: () => (
    <div className="flex gap-2">
      <Dialog
        title="編集"
        accessibleName="プロフィールを編集"
        presentation="popover"
        trigger={<Button>中央に浮かべる</Button>}
      />
      <Dialog
        accessibleName="新しい機能のお知らせ"
        presentation="sheet"
        trigger={<Button>シート</Button>}
      >
        <p>下書きを予約して公開できるようになりました。</p>
      </Dialog>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: '中央に浮かべる' }));
    const centered = await body.findByRole('dialog', { name: 'プロフィールを編集' });
    await waitFor(() => expect(within(centered).getByText('編集')).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    await userEvent.click(canvas.getByRole('button', { name: 'シート' }));
    const sheet = await body.findByRole('dialog', { name: '新しい機能のお知らせ' });
    await expect(sheet).not.toHaveAttribute('aria-labelledby');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
  },
};

export const Accessibility: Story = {
  name: '読み上げとキーボード',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Dialog
      {...args}
      presentation="popover"
      trigger={<Button>プロフィールを編集</Button>}
      actions={actions}
    >
      <TextField label="表示名" defaultValue="かずえもん" />
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'プロフィールを編集' });
    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog', { name: 'プロフィールを編集' });
    await expect(dialog).toHaveAccessibleDescription('公開するプロフィールに表示されます。');
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: '閉じる' })).toBeVisible()
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
    // 下のボタンで閉じる
    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole('button', { name: 'キャンセル' }));
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
  },
};
