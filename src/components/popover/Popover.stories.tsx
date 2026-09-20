import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Popover } from './Popover';
import { PhoneFrame, ScreenFrame } from '../../stories/story-parts';
import { sourceCode } from '../../stories/story-states';
import { Button } from '../button/Button';
import { Switch } from '../switch/Switch';

// 開いた状態のストーリーも、ドキュメントのページでは閉じて描く（開くとフォーカスが移り、ページが流れるため）
const openOnLoad = (viewMode: string) => viewMode !== 'docs';

const meta = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '押して開く、本体のそばに浮かぶ面です。補足の説明や、小さな設定をその場で見せます。ほかの操作は止めず、外を押すか Esc で閉じます。',
          '',
          '- 開くボタンは `trigger` に要素（`Button` など）で渡します。',
          '- `title` は必ず渡します。開いた面の読み上げの名前になります。題を画面に出したくないときは `titleHidden` を付けます（読み上げの名前は残ります）。`description` は省けます。',
          '- `side`・`align` で出す場所を選びます。画面の端に当たるときは反対側に出します。どこから開いたかをはっきりさせたいときは `arrow` で本体を指す矢印を付けます。',
          '- 出し方は `presentation` で決めます。既定の `auto` は、指で操作していて画面が狭いときだけ、画面の下から出るシートにします。',
          '- マウスを載せるだけで出す短い補足は、Tooltip を使います。',
        ].join('\n'),
      },
    },
  },
  args: {
    trigger: <Button appearance="outline">表示</Button>,
    title: '表示の設定',
    titleHidden: false,
    description: 'この端末だけに保存されます。',
    side: 'bottom',
    align: 'center',
    arrow: false,
    presentation: 'auto',
  },
  argTypes: {
    title: { control: 'text' },
    titleHidden: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    description: { control: 'text' },
    side: {
      control: 'inline-radio',
      options: ['top', 'bottom', 'left', 'right'],
      table: { defaultValue: { summary: "'bottom'" } },
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
      table: { defaultValue: { summary: "'center'" } },
    },
    presentation: {
      control: 'inline-radio',
      options: ['auto', 'popover', 'sheet'],
      table: { defaultValue: { summary: "'auto'" } },
    },
    trigger: { control: false },
    children: { control: false },
    container: { control: false },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

const content = (
  <div className="flex flex-col gap-3">
    <Switch label="画像を表示" defaultChecked />
    <Switch label="動きを減らす" />
  </div>
);

export const Playground: Story = {
  name: '基本',
  parameters: {
    docs: {
      source: sourceCode(`
        <Popover
          title="表示の設定"
          description="この端末だけに保存されます。"
          trigger={<Button appearance="outline">表示</Button>}
        >
          <Switch label="画像を表示" defaultChecked />
        </Popover>
      `),
    },
  },
  render: (args) => (
    <Popover {...args} trigger={<Button appearance="outline">表示</Button>}>
      {content}
    </Popover>
  ),
};

export const Open: Story = {
  tags: ['visual'],
  name: '開いた状態',
  parameters: {
    controls: { include: ['title', 'description', 'side', 'align', 'arrow'] },
    docs: {
      description: { story: '本体のそばに浮かべた形です。' },
    },
  },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[320px]">
      {(frame) => (
        <div className="flex w-full justify-center pt-4">
          <Popover
            key={`${args.side}-${args.align}`}
            {...args}
            presentation="popover"
            trigger={<Button appearance="outline">表示</Button>}
            defaultOpen={openOnLoad(viewMode)}
            container={frame}
          >
            {content}
          </Popover>
        </div>
      )}
    </ScreenFrame>
  ),
};

export const TextOnly: Story = {
  tags: ['visual'],
  name: '文だけ',
  args: {
    title: '送料について',
    titleHidden: true,
    description: undefined,
    presentation: 'popover',
  },
  parameters: {
    controls: { include: ['presentation', 'title', 'titleHidden', 'description', 'side', 'align'] },
    docs: {
      description: {
        story:
          '題を画面に出さず（`titleHidden`）、文だけを見せる形です。読み上げの名前は題のままです。押して開くので、指で操作していても読めます（マウスを載せるだけで出す Tooltip とは違います）。シートで出すと、見出しには閉じる × だけが並びます。',
      },
    },
  },
  render: (args, { viewMode }) => {
    const popover = (frame: HTMLElement) => (
      <Popover
        {...args}
        trigger={<Button appearance="outline">送料について</Button>}
        defaultOpen={openOnLoad(viewMode)}
        container={frame}
      >
        3,000円以上のご注文で送料が無料になります。沖縄県と離島は別の料金です。
      </Popover>
    );
    // シートで出すときはスマートフォンの枠で描く
    if (args.presentation === 'sheet') return <PhoneFrame>{popover}</PhoneFrame>;
    return (
      <ScreenFrame height="h-[240px]">
        {(frame) => <div className="flex w-full justify-center pt-4">{popover(frame)}</div>}
      </ScreenFrame>
    );
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    // 題は見えないが、開いた面の読み上げの名前は題のまま
    const popover = await body.findByRole('dialog', { name: '送料について' });
    await expect(within(popover).getByText('送料について')).toHaveClass('sr-only');
  },
};

export const Sheet: Story = {
  tags: ['visual'],
  name: 'シート',
  parameters: {
    controls: { include: ['title', 'description'] },
    docs: {
      description: {
        story:
          '`presentation="sheet"` のとき、または `auto` で指で操作していて画面が狭いときは、画面の下から出るシートにします。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <PhoneFrame>
      {(frame) => (
        <Popover
          {...args}
          presentation="sheet"
          trigger={<Button appearance="outline">表示</Button>}
          defaultOpen={openOnLoad(viewMode)}
          container={frame}
        >
          {content}
        </Popover>
      )}
    </PhoneFrame>
  ),
};

export const Accessibility: Story = {
  name: '読み上げとキーボード',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Popover {...args} presentation="popover" trigger={<Button appearance="outline">表示</Button>}>
      {content}
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: '表示' });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const popover = await body.findByRole('dialog', { name: '表示の設定' });
    await expect(popover).toHaveAccessibleDescription('この端末だけに保存されます。');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
