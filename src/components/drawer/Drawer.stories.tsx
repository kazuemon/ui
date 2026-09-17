import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Drawer } from './Drawer';
import { OverlayClose } from '../../internal/overlay/overlay-close';
import { PhoneFrame, ScreenFrame } from '../../stories/story-parts';
import { sourceCode } from '../../stories/story-states';
import { Button } from '../button/Button';
import { Link } from '../link/Link';
import { Switch } from '../switch/Switch';

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
          '- `side` で出す向きを選びます。`bottom`（既定）はシート、`left`・`right` はナビゲーションや詳細を出す横のパネルです。出した向きへはじくと閉じます（`closeOnSwipe={false}` で止められます）。',
          '- シートの上端のつまみは「引けること」の印です。はじいて閉じられるか、上へ引いて広げられるときに出ます。どちらもできないときは出ません。横から出すパネルには出しません。',
          '- 下から出すとき、中身が画面の半分より長ければ、半分の高さで開いてつまみを出します（`detent="half"`、既定）。つまみを上へ引くと高さいっぱいに広がります。`full` は中身の高さで開きます。',
          '- 中身が長いときはスクロールし、上の端に区切り線、上下の端に続きの影を出します。',
          '- 下に並べるボタンは `actions` に渡します。中身をスクロールしても動きません。押して閉じるボタンは `OverlayClose` の `render` に渡します。並べ方は `actionsLayout` で選びます。既定の `auto` は、下から出すシートでは幅いっぱいで縦に積み（最後に渡した主な操作が上）、横から出すパネルでは右に寄せます。渡した順に上から積むときは `stack`、横に並べるときは `end`（右寄せ）か `fill`（幅を等分）です。',
          '- 開いた直後は面そのものにフォーカスが移ります。中身の要素に `autoFocus` を付けると、その要素に移ります。',
          '- 開いているあいだ、後ろの画面は暗くなり、押すと閉じます（`dismissible={false}` で閉じないようにできます）。Esc で閉じないようにするときは `closeOnEscape={false}`、右上の × を置かないときは `closeButton={false}` を渡し、`actions` に閉じる手段を置きます。',
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
    closeButton: true,
    closeLabel: '閉じる',
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    side: {
      control: 'inline-radio',
      options: ['bottom', 'left', 'right'],
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
    container: { control: false },
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
          container={frame}
        >
          {settings}
        </Drawer>
      )}
    </PhoneFrame>
  ),
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
        'closeButton',
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
          container={frame}
        >
          {longText}
        </Drawer>
      )}
    </PhoneFrame>
  ),
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
          container={frame}
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
          container={frame}
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
