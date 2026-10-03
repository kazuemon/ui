import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む
import { useState } from 'react';
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test';

import { Dialog, DialogActions } from './Dialog';
import { OverlayClose } from '../../internal/overlay/overlay-close';
import { PhoneFrame, ScreenFrame } from '../../stories/story-parts';
import { sourceCode } from '../../stories/story-states';
import { Button } from '../button/Button';
import { Form } from '../form/Form';
import { Stack } from '../stack/Stack';
import { TextField } from '../text-field/TextField';
import { Textarea } from '../textarea/Textarea';

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
          '- 中身の `Form` の送信のボタンを下に並べるときは、`actions` の代わりに、`Form` の中の最後に `DialogActions` を置きます。見た目は `actions` と同じ下の帯のままで、送信のボタンが `Form` の送信・Enter・送信中にそのまま加わります。`actions` と `DialogActions` は、どちらか一方にします。',
          '- 下のボタンの左に、保存の状態や注記、「次から表示しない」のチェックボックスを置くときは `actionsStart` に渡します（`DialogActions` では `start`）。文字列だけを渡すと小さい淡い文字で描きます。要素を渡すときは、文字の大きさや色を `Text` などで決めます。',
          '- 中央に浮かべるときの幅は `size` で選びます。`sm` は確かめや短い問い、既定の `md` は入力が数個の面、`lg` は表や長い文を読ませる面です。画面が狭いときは、どの段も左右に余白を残して縮みます。',
          '- 中身が画面より高いときは、題と下のボタンを残して中身だけがスクロールします（`scrollBehavior="content"`）。面ごとスクロールさせるときは `scrollBehavior="viewport"` にします。シートで出すときは、いつも中身だけがスクロールします。',
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

export const LongContent: Story = {
  tags: ['visual'],
  name: '中身が長い',
  parameters: {
    controls: { include: ['title', 'description'] },
    docs: {
      description: {
        story:
          '中身が画面より高いときは、題と下のボタンを残して中身だけがスクロールします。続きがあるあいだは、下の帯の上に影が出ます。下のボタンの左には、`actionsStart` で保存の状態を置いています。',
      },
    },
  },
  args: {
    title: '利用規約',
    description: '最後まで読んでから同意してください。',
  },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[420px]">
      {(frame) => (
        <Dialog
          {...args}
          presentation="popover"
          trigger={<Button>利用規約を読む</Button>}
          actions={
            <>
              <OverlayClose render={<Button variant="outline">あとで</Button>} />
              <OverlayClose render={<Button color="primary">同意する</Button>} />
            </>
          }
          actionsStart="第 1 版"
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        >
          <Stack gap="sm">
            {terms.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </Stack>
        </Dialog>
      )}
    </ScreenFrame>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog', { name: '利用規約' });
    // 中身だけがスクロールし、題と下の帯は面の中に残る
    const content = dialog.querySelector<HTMLElement>('[data-slot="dialog-content"]')!;
    await expect(content.scrollHeight).toBeGreaterThan(content.clientHeight);
    await expect(dialog).toHaveAttribute('data-scroll-behavior', 'content');
  },
};

const terms = [
  'このサービスは、登録した人がプロフィールと作品を公開するための場所です。登録した時点で、この規約に同意したものとします。',
  '公開した作品の権利は、作った人にあります。運営は、サービスの紹介のために、作品の題と画像を使うことがあります。',
  '他の人の権利を侵す作品や、法律に反する作品は公開できません。見つけたときは、予告なく非公開にします。',
  'アカウントは 1 人につき 1 つです。パスワードは他の人に教えないでください。',
  '運営は、サービスを止めたり内容を変えたりすることがあります。大きく変えるときは、30 日前までに知らせます。',
  '退会すると、公開していた作品とプロフィールは 30 日後に消えます。消えるまでのあいだは、元に戻せます。',
];

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

// 送ると少しのあいだ送信中にし、終わったら閉じる。送った値は面の外に書き出す
function ProfileFormDialog({
  presentation,
  frame,
  defaultOpen,
  long = false,
}: {
  presentation: 'popover' | 'sheet';
  frame: HTMLElement;
  defaultOpen: boolean;
  long?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  return (
    <>
      <Dialog
        title="プロフィールを編集"
        description="公開するプロフィールに表示されます。"
        presentation={presentation}
        trigger={<Button>プロフィールを編集</Button>}
        open={open}
        onOpenChange={setOpen}
        portalContainer={frame}
      >
        <Form
          submitting={submitting}
          onFormSubmit={(values) => {
            setSubmitting(true);
            setTimeout(() => {
              setSubmitting(false);
              setSaved(String(values.displayName));
              setOpen(false);
            }, 300);
          }}
        >
          <Stack>
            <TextField
              name="displayName"
              label="表示名"
              defaultValue="かずえもん"
              required
              validate={(value) => (value ? null : '表示名を入力してください')}
            />
            <Textarea name="bio" label="自己紹介" />
            {long && (
              <>
                <TextField name="location" label="場所" />
                <TextField name="website" label="ウェブサイト" />
                <Textarea name="note" label="メモ" />
              </>
            )}
          </Stack>
          <DialogActions>
            <OverlayClose render={<Button variant="outline">キャンセル</Button>} />
            <Button type="submit" color="primary">
              保存する
            </Button>
          </DialogActions>
        </Form>
      </Dialog>
      {saved != null && <output>保存しました: {saved}</output>}
    </>
  );
}

const formSource = sourceCode(`
  <Dialog title="プロフィールを編集" trigger={<Button>プロフィールを編集</Button>} open={open} onOpenChange={setOpen}>
    <Form submitting={submitting} onFormSubmit={save}>
      <Stack>
        <TextField name="displayName" label="表示名" required />
        <Textarea name="bio" label="自己紹介" />
      </Stack>
      <DialogActions>
        <OverlayClose render={<Button variant="outline">キャンセル</Button>} />
        <Button type="submit" color="primary">保存する</Button>
      </DialogActions>
    </Form>
  </Dialog>
`);

export const WithForm: Story = {
  tags: ['visual'],
  name: 'Form と組む',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`Form` の中の最後に `DialogActions` を置くと、下のボタンが `Form` の中に入ります。入力欄で Enter を押すと送信し、送っているあいだ（`submitting`）は送信のボタンが送信中になります。値は欄の `name` で `onFormSubmit` に届きます。',
      },
      source: formSource,
    },
  },
  render: (_args, { viewMode }) => (
    <ScreenFrame>
      {(frame) => (
        <ProfileFormDialog
          presentation="popover"
          frame={frame}
          defaultOpen={openOnLoad(viewMode)}
        />
      )}
    </ScreenFrame>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog', { name: 'プロフィールを編集' });
    const save = within(dialog).getByRole('button', { name: '保存する' });
    const input = within(dialog).getByRole('textbox', { name: '表示名' });
    // 下の帯は Form の中にあり、送信のボタンは Form の送信のボタン
    const form = input.closest('form');
    await expect(form).not.toBeNull();
    await expect(save.closest('[data-slot="dialog-footer"]')?.closest('form')).toBe(form);
    await expect(save).toHaveProperty('form', form);
    await expect(new FormData(form!).get('displayName')).toBe('かずえもん');
  },
};

// 入力欄の Enter で送信し、送っているあいだは送信のボタンが送信中になり、送り終えたら閉じる
export const FormSubmit: Story = {
  name: 'Form と組む（送信）',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true } },
  render: () => (
    <ScreenFrame>
      {(frame) => <ProfileFormDialog presentation="popover" frame={frame} defaultOpen />}
    </ScreenFrame>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog', { name: 'プロフィールを編集' });
    const save = within(dialog).getByRole('button', { name: '保存する' });
    const input = within(dialog).getByRole('textbox', { name: '表示名' });
    // 欄の確かめを通らないときは送らない
    await userEvent.clear(input);
    await userEvent.keyboard('{Enter}');
    const error = await within(dialog).findByText('表示名を入力してください');
    await waitFor(() => expect(error).toBeVisible());
    await expect(save).not.toHaveAttribute('data-loading');
    await expect(body.getByRole('dialog')).toBeInTheDocument();
    await userEvent.type(input, 'かずえもんさん{Enter}');
    await waitFor(() => expect(save).toHaveAttribute('data-loading'));
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    await expect(within(canvasElement).getByText('保存しました: かずえもんさん')).toBeVisible();
  },
};

export const WithFormSheet: Story = {
  tags: ['visual'],
  name: 'Form と組む（シート）',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'シートで出すときも、`DialogActions` は `actions` と同じ下の帯になります。中身が長いときは中身だけがスクロールし、帯は下の端に残ります。',
      },
      source: formSource,
    },
  },
  render: (_args, { viewMode }) => (
    <PhoneFrame>
      {(frame) => (
        <ProfileFormDialog
          presentation="sheet"
          frame={frame}
          defaultOpen={openOnLoad(viewMode)}
          long
        />
      )}
    </PhoneFrame>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog', { name: 'プロフィールを編集' });
    const footer = dialog.querySelector<HTMLElement>('[data-slot="sheet-footer"]')!;
    const content = dialog.querySelector<HTMLElement>('[data-slot="sheet-content"]')!;
    await expect(footer.closest('form')).not.toBeNull();
    // 帯は下から出すシートの並べ方（縦に積む）のまま
    await expect(footer).toHaveAttribute('data-layout', 'stack-reverse');
    // 中身はスクロールし、上の端にいても下の端にいても、帯は面の下の端にある
    await waitFor(() => expect(content.scrollHeight).toBeGreaterThan(content.clientHeight));
    const atBottom = () =>
      Math.abs(footer.getBoundingClientRect().bottom - content.getBoundingClientRect().bottom);
    await waitFor(() => expect(atBottom()).toBeLessThan(1));
    content.scrollTop = content.scrollHeight;
    await waitFor(() => expect(atBottom()).toBeLessThan(1));
    content.scrollTop = 0;
    // 帯の下に隠れた欄へ Tab で進むと、欄を帯の上まで送る（帯の高さの scroll-padding）
    const note = within(dialog).getByRole('textbox', { name: 'メモ' });
    within(dialog).getByRole('textbox', { name: 'ウェブサイト' }).focus();
    content.scrollTop = 0;
    await userEvent.tab();
    await expect(note).toHaveFocus();
    await waitFor(() =>
      expect(note.getBoundingClientRect().top).toBeLessThan(footer.getBoundingClientRect().top)
    );
    note.blur();
    content.scrollTop = 0;
  },
};

// actions と DialogActions を両方渡したときは、開発時に警告する
export const BothActions: Story = {
  name: 'actions と両方渡したとき',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Dialog
      {...args}
      presentation="popover"
      trigger={<Button>プロフィールを編集</Button>}
      actions={actions}
    >
      <TextField label="表示名" defaultValue="かずえもん" />
      <DialogActions>
        <Button color="primary">保存する</Button>
      </DialogActions>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    try {
      await userEvent.click(
        within(canvasElement).getByRole('button', { name: 'プロフィールを編集' })
      );
      await within(canvasElement.ownerDocument.body).findByRole('dialog');
      await waitFor(() =>
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('DialogActions: 面の actions'))
      );
    } finally {
      warn.mockRestore();
    }
  },
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
    <ScreenFrame height="h-[460px]">
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
