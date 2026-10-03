import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Drawer, DrawerActions } from './Drawer';
import { OverlayClose } from '../../internal/overlay/overlay-close';
import { PhoneFrame, ScreenFrame } from '../../stories/story-parts';
import { sourceCode } from '../../stories/story-states';
import { Button } from '../button/Button';
import { Form } from '../form/Form';
import { Link } from '../link/Link';
import { Stack } from '../stack/Stack';
import { Switch } from '../switch/Switch';
import { TextField } from '../text-field/TextField';

// 開いた状態のストーリーも、ドキュメントのページでは閉じて描く（開くとフォーカスが移り、ページが流れるため）
const openOnLoad = (viewMode: string) => viewMode !== 'docs';

const settings = (
  <div className="flex flex-col gap-4">
    <Switch label="新着の通知" defaultChecked />
    <Switch label="メールでも受け取る" />
    <Switch label="おすすめの記事を表示" defaultChecked />
  </div>
);

const longText = Array.from({ length: 14 }, (_, i) => (
  <p key={i} className="mb-3">
    {i + 1}. 利用規約の条文です。サービスを使う前に、内容を確かめてください。
  </p>
));

const pages = ['ホーム', 'Works', 'Blog', 'About', 'Contact'];

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '画面の端から出す面です。既定は画面の下から出すシートで、Select のシートと同じ見出し（つまみ・題・右上の ×）を持ちます。',
          '',
          '- `side` で出す向きを選びます。`bottom`（既定）はシート、`top` は画面の上から出すシート（知らせの一覧など）、`left`・`right` はナビゲーションや詳細を出す横のパネルです。出した向きへはじくと閉じます（`closeOnSwipe={false}` で止められます）。',
          '- シートのつまみは「引けること」の印です。はじいて閉じられるか、上へ引いて広げられるときに出ます。どちらもできないときは出ません。下から出すシートでは上の端に、上から出すシートでは下の端に出します。横から出すパネルには出しません。上から出すシートは、半分の高さで止めず中身の高さで開きます。',
          '- 下から出すとき、中身が画面の半分より長ければ、半分の高さで開いてつまみを出します（`detent="half"`、既定）。つまみを上へ引くと高さいっぱいに広がります。`full` は中身の高さで開きます。',
          '- 中身が長いときはスクロールし、上の端に区切り線、上下の端に続きの影を出します。',
          '- 下に並べるボタンは `actions` に渡します。中身をスクロールしても動きません。押して閉じるボタンは `OverlayClose` の `render` に渡します。並べ方は `actionsLayout` で選びます。既定の `auto` は、下から出すシートでは幅いっぱいで縦に積み（最後に渡した主な操作が上）、横から出すパネルでは右に寄せます。渡した順に上から積むときは `stack`、横に並べるときは `end`（右寄せ）か `fill`（幅を等分）です。',
          '- 下のボタンの左（縦に積むときは上）に、保存の状態や注記を置くときは `actionsStart` に渡します（`DrawerActions` では `start`）。文字列だけを渡すと小さい淡い文字で描きます。',
          '- 中身の `Form` の送信のボタンを下に並べるときは、`actions` の代わりに、`Form` の中の最後に `DrawerActions` を置きます。見た目と並べ方は `actions` と同じ下の帯のままで（中身が長いときも下に残ります）、送信のボタンが `Form` の送信・Enter・送信中にそのまま加わります。`actions` と `DrawerActions` は、どちらか一方にします。',
          '- `title` は見出しの題で、読み上げでは開いた面の名前になります。中身の見出しで何の面か分かるときは `title` を省き、`accessibleName` に読み上げの名前を書きます（どちらか一方が要ります）。',
          '- 開いた直後は面そのものにフォーカスが移ります。中身の要素に `autoFocus` を付けると、その要素に移ります。',
          '- 開いているあいだ、後ろの画面は暗くなり、押すと閉じます（`dismissible={false}` で閉じないようにできます）。Esc で閉じないようにするときは `closeOnEscape={false}`、右上の × を置かないときは `hideCloseButton` を渡し、`actions` に閉じる手段を置きます。',
          '- 後ろを見せたまま開いたままにするときは `modal="passive"` にします。裏を止めず後ろも暗くせず、外を押しても閉じません。',
        ].join('\n'),
      },
    },
  },
  args: {
    title: '通知の設定',
    side: 'bottom',
    detent: 'half',
    actionsLayout: 'auto',
    modal: true,
    dismissible: true,
    closeOnEscape: true,
    closeOnSwipe: true,
    hideCloseButton: false,
    closeName: '閉じる',
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    side: {
      control: 'inline-radio',
      options: ['bottom', 'top', 'left', 'right'],
      table: { defaultValue: { summary: "'bottom'" } },
    },
    actionsLayout: {
      control: 'inline-radio',
      options: ['auto', 'end', 'fill', 'stack', 'stack-reverse'],
      table: { defaultValue: { summary: "'auto'" } },
    },
    detent: {
      control: 'inline-radio',
      options: ['half', 'full'],
      table: { defaultValue: { summary: "'half'" } },
    },
    trigger: { control: false },
    actions: { control: false },
    children: { control: false },
    portalContainer: { control: false },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  parameters: {
    docs: {
      source: sourceCode(`
        <Drawer title="通知の設定" trigger={<Button>通知の設定</Button>}>
          <Switch label="新着の通知" defaultChecked />
        </Drawer>
      `),
    },
  },
  render: (args) => (
    <Drawer {...args} trigger={<Button>通知の設定</Button>}>
      {settings}
    </Drawer>
  ),
};

export const Bottom: Story = {
  tags: ['visual'],
  name: '下から（短い中身）',
  parameters: {
    controls: { include: ['title', 'description'] },
    docs: {
      description: {
        story:
          '中身が短いときは、中身の高さで開きます。つまみは出しません。ここでは画面の代わりの枠の中に描いています。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <PhoneFrame>
      {(frame) => (
        <Drawer
          {...args}
          trigger={<Button>通知の設定</Button>}
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        >
          {settings}
        </Drawer>
      )}
    </PhoneFrame>
  ),
};

const notices = (
  <div className="flex flex-col gap-3">
    <p>新しいコメントが 2 件あります</p>
    <p>「設計の見直し」の締め切りは明日です</p>
    <p>かずえもんさんがあなたを招待しました</p>
  </div>
);

export const Top: Story = {
  tags: ['visual'],
  name: '上から',
  args: { title: 'お知らせ', side: 'top' },
  parameters: {
    controls: { include: ['title', 'description'] },
    docs: {
      description: {
        story:
          '`side="top"` は画面の上から出すシートです。中身の高さで開き、はじいて閉じられるときは、はじく向きの下の端につまみを出します。下のボタンは、下から出すシートと同じく縦に積みます。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <PhoneFrame>
      {(frame) => (
        <Drawer
          {...args}
          trigger={<Button>お知らせ</Button>}
          actions={<OverlayClose render={<Button variant="outline">閉じる</Button>} />}
          actionsStart="3 件の新着"
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        >
          {notices}
        </Drawer>
      )}
    </PhoneFrame>
  ),
};

export const TopWithForm: Story = {
  name: '上から（Form と組む）',
  args: { title: 'さがす', side: 'top' },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '上から出すシートでも、`Form` の中の最後に `DrawerActions` を置けます。`start` に渡した文は、縦に積んだボタンの上に置きます。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <PhoneFrame>
      {(frame) => (
        <Drawer
          {...args}
          trigger={<Button>さがす</Button>}
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        >
          <Form onFormSubmit={fn()}>
            <TextField name="q" label="キーワード" defaultValue="デザイン" />
            <DrawerActions start="3 件の条件で絞り込み中">
              <Button type="submit" color="primary">
                さがす
              </Button>
            </DrawerActions>
          </Form>
        </Drawer>
      )}
    </PhoneFrame>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const drawer = await body.findByRole('dialog', { name: 'さがす' });
    await expect(drawer).toHaveAttribute('data-side', 'top');
    const footer = drawer.querySelector<HTMLElement>('[data-slot="sheet-footer"]')!;
    await expect(footer.closest('form')).not.toBeNull();
    // start の文は、縦に積んだボタンの上に置く
    const start = footer.querySelector<HTMLElement>('[data-slot="overlay-actions-start"]')!;
    const submit = within(footer).getByRole('button', { name: 'さがす' });
    await expect(start.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      submit.getBoundingClientRect().top
    );
    // つまみは下の端（下の帯のボタンより下）に置く
    const handles = drawer.querySelectorAll<HTMLElement>('[data-slot="sheet-handle"]');
    const bar = handles[handles.length - 1].firstElementChild!;
    await expect(bar.getBoundingClientRect().top).toBeGreaterThan(
      submit.getBoundingClientRect().bottom
    );
    await expect(
      Math.abs(drawer.getBoundingClientRect().bottom - bar.getBoundingClientRect().bottom)
    ).toBeLessThan(16);
    // 面は枠の上の端に着く
    const frame = canvasElement.querySelector('[data-density]')!;
    await waitFor(() =>
      expect(
        Math.abs(drawer.getBoundingClientRect().top - frame.getBoundingClientRect().top)
      ).toBeLessThan(2)
    );
  },
};

export const Long: Story = {
  tags: ['visual'],
  name: '下から（長い中身）',
  args: {
    title: '利用規約',
    description: '2026年9月18日 改定',
  },
  parameters: {
    controls: {
      include: [
        'detent',
        'actionsLayout',
        'title',
        'description',
        'closeOnEscape',
        'closeOnSwipe',
        'hideCloseButton',
      ],
    },
    docs: {
      description: {
        story:
          '中身が画面の半分より長いときは、半分の高さで開き、つまみを出します。下に置いた操作は、スクロールしても動きません。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <PhoneFrame>
      {(frame) => (
        <Drawer
          key={`${args.detent}-${args.actionsLayout}`}
          {...args}
          trigger={<Button>利用規約</Button>}
          actions={<OverlayClose render={<Button color="primary">同意する</Button>} />}
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        >
          {longText}
        </Drawer>
      )}
    </PhoneFrame>
  ),
};

const addressSubmit = fn();

export const WithForm: Story = {
  tags: ['visual'],
  name: 'Form と組む',
  args: { title: '届け先を変更' },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`Form` の中の最後に `DrawerActions` を置くと、下のボタンが `Form` の中に入ります。中身が長く半分の高さで開いたときも、帯は画面の下の端に残ります。入力欄で Enter を押すと送信します。',
      },
      source: sourceCode(`
        <Drawer title="届け先を変更" trigger={<Button>届け先を変更</Button>}>
          <Form onFormSubmit={save}>
            <Stack>
              <TextField name="postalCode" label="郵便番号" />
              …
            </Stack>
            <DrawerActions>
              <Button type="submit" color="primary">保存する</Button>
            </DrawerActions>
          </Form>
        </Drawer>
      `),
    },
  },
  render: (args, { viewMode }) => (
    <PhoneFrame>
      {(frame) => (
        <Drawer
          {...args}
          trigger={<Button>届け先を変更</Button>}
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        >
          <Form onFormSubmit={addressSubmit}>
            <Stack>
              <TextField name="postalCode" label="郵便番号" defaultValue="100-0001" />
              <TextField name="prefecture" label="都道府県" defaultValue="東京都" />
              <TextField name="city" label="市区町村" />
              <TextField name="street" label="番地" />
              <TextField name="building" label="建物名・部屋番号" />
              <TextField name="phone" label="電話番号" />
            </Stack>
            <DrawerActions>
              <Button type="submit" color="primary">
                保存する
              </Button>
            </DrawerActions>
          </Form>
        </Drawer>
      )}
    </PhoneFrame>
  ),
  play: async ({ canvasElement }) => {
    addressSubmit.mockClear();
    const body = within(canvasElement.ownerDocument.body);
    const drawer = await body.findByRole('dialog', { name: '届け先を変更' });
    const footer = drawer.querySelector<HTMLElement>('[data-slot="sheet-footer"]')!;
    const content = drawer.querySelector<HTMLElement>('[data-slot="sheet-content"]')!;
    await expect(footer.closest('form')).not.toBeNull();
    // 半分の高さで開いても、帯は中身の下の端（画面の下の端）にある
    await waitFor(() =>
      expect(
        Math.abs(footer.getBoundingClientRect().bottom - content.getBoundingClientRect().bottom)
      ).toBeLessThan(1)
    );
    await expect(footer.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      canvasElement.querySelector('[data-density]')!.getBoundingClientRect().bottom + 1
    );
    // 入力欄の Enter で Form を送信する
    await userEvent.type(within(drawer).getByRole('textbox', { name: '郵便番号' }), '{Enter}');
    await waitFor(() => expect(addressSubmit).toHaveBeenCalledTimes(1));
    await expect(addressSubmit.mock.calls[0]?.[0]).toMatchObject({
      postalCode: '100-0001',
      prefecture: '東京都',
    });
  },
};

export const NoSwipe: Story = {
  tags: ['visual'],
  name: 'はじいて閉じない',
  args: { closeOnSwipe: false },
  parameters: {
    controls: { include: ['closeOnSwipe', 'title'] },
    docs: {
      description: {
        story:
          '`closeOnSwipe={false}` では、下へはじいても閉じません。上へ引いて広げることもできない（中身が短い）ときは、引けることの印であるつまみを出しません。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <PhoneFrame>
      {(frame) => (
        <Drawer
          {...args}
          trigger={<Button>通知の設定</Button>}
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        >
          {settings}
        </Drawer>
      )}
    </PhoneFrame>
  ),
};

export const Side: Story = {
  tags: ['visual'],
  name: '横から',
  args: { title: 'メニュー', side: 'left' },
  parameters: {
    controls: { include: ['side', 'title'] },
    docs: {
      description: {
        story:
          '`side="left"`・`"right"` は、画面の横から出すパネルです。つまみは出さず、出した向きへはじくと閉じます。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <ScreenFrame>
      {(frame) => (
        <Drawer
          key={args.side}
          {...args}
          trigger={<Button>メニュー</Button>}
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        >
          <nav className="flex flex-col items-start gap-2">
            {pages.map((page) => (
              <Link key={page} href="#">
                {page}
              </Link>
            ))}
          </nav>
        </Drawer>
      )}
    </ScreenFrame>
  ),
};

export const OutsidePress: Story = {
  name: '外を押して閉じる',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Drawer title="下から" side="bottom" trigger={<Button>下から</Button>}>
        {settings}
      </Drawer>
      <Drawer title="右から" side="right" trigger={<Button>右から</Button>}>
        {settings}
      </Drawer>
      <Drawer
        title="閉じない"
        side="bottom"
        dismissible={false}
        trigger={<Button>閉じない</Button>}
      >
        {settings}
      </Drawer>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const document = canvasElement.ownerDocument;
    const body = within(document.body);
    // 後ろの暗いところ（面のない左上）を、指で押すのと同じように押す
    const pressOutside = async () => {
      const target = document.elementFromPoint(20, 20);
      await expect(target).not.toBeNull();
      // 暗いところを引いてもシートは動かさない（印は暗い面そのものに付ける — src/internal/sheet/SheetPopup.tsx）
      await expect(target).toHaveAttribute('data-base-ui-swipe-ignore');
      await userEvent.click(target as Element);
    };

    // 既定では、暗いところを押すと閉じる
    for (const name of ['下から', '右から']) {
      await userEvent.click(canvas.getByRole('button', { name }));
      await body.findByRole('dialog', { name });
      await pressOutside();
      await waitFor(() => expect(body.queryByRole('dialog', { name })).toBeNull());
    }

    // dismissible={false} では閉じない。Esc では閉じる
    await userEvent.click(canvas.getByRole('button', { name: '閉じない' }));
    await body.findByRole('dialog', { name: '閉じない' });
    await pressOutside();
    await expect(body.getByRole('dialog', { name: '閉じない' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog', { name: '閉じない' })).toBeNull());
  },
};

export const Accessibility: Story = {
  name: '読み上げとキーボード',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Drawer {...args} trigger={<Button>通知の設定</Button>}>
      {settings}
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: '通知の設定' });
    await userEvent.click(trigger);
    const drawer = await body.findByRole('dialog', { name: '通知の設定' });
    await waitFor(() =>
      expect(within(drawer).getByRole('switch', { name: '新着の通知' })).toBeVisible()
    );
    await userEvent.click(within(drawer).getByRole('button', { name: '閉じる' }));
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const AccessibleName: Story = {
  name: '題を置かない',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`title` を省いたときは、`accessibleName` が読み上げの名前になります。右上の × の行は残ります。',
      },
    },
  },
  render: () => (
    <Drawer accessibleName="メニュー" side="left" trigger={<Button>メニュー</Button>}>
      <nav className="flex flex-col gap-2">
        {pages.map((page) => (
          <Link key={page} href="#">
            {page}
          </Link>
        ))}
      </nav>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'メニュー' }));
    const drawer = await body.findByRole('dialog', { name: 'メニュー' });
    await expect(drawer).not.toHaveAttribute('aria-labelledby');
    await expect(within(drawer).getByRole('button', { name: '閉じる' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
  },
};
