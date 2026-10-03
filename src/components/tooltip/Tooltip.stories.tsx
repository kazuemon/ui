import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, FormEvent } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Tooltip, TooltipProvider } from './Tooltip';
import { ScreenFrame } from '../../stories/story-parts';
import { sourceCode } from '../../stories/story-states';
import { Button } from '../button/Button';

// 開いた状態のストーリーも、ドキュメントのページでは閉じて描く
const openOnLoad = (viewMode: string) => viewMode !== 'docs';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '本体にマウスを載せたとき、キーボードでフォーカスしたとき、指で長押ししたときに出す、短い補足です。',
          '',
          '- 本体は `children` に要素を1つ（`Button` など）渡します。出す文は `content` に書きます。',
          '- 指で操作する人は、長押ししないと読めません。欠かせない情報は Tooltip に置かず、押して開く Popover や、キャプションで見せます。',
          '- 長押しで出したときは、指を離しても本体を実行しません。ほかの場所に触れると閉じます。指と手で隠れないよう、上に出します（`longPressSide`。`false` で `side` のままにできます）。',
          '- `side` で出す向きを選びます（既定は下）。画面の端に当たるときは反対側に出します。その辺に沿った寄せは `align` です。',
          '- 影を付けたくないときは `hideShadow` にします。細い輪郭だけで下の内容と切り分けます。',
          '- ツールバーのように Tooltip が並ぶところは `TooltipProvider` で包みます。出るまでの待ち（`delay`）と消えるまでの待ち（`closeDelay`）をそろえ、1 つが出たあとは隣へマウスを移すと待たずに出します。',
          '- 並んだボタンのどれの補足かをはっきりさせたいときは、`showArrow` で本体を指す小さな矢印を出します。',
          '- 押せないボタン（`disabled`）を本体にすると、ボタンは押せないままフォーカスできる形になり、押せない理由を Tooltip で読めます。外したいときは、ボタンに `focusableWhenDisabled={false}` を渡します。効くのは本体そのものにしたボタンだけで、ツールバーのような入れ物を本体にしたときは、中のボタンには効きません。',
        ].join('\n'),
      },
    },
  },
  args: {
    content: 'リンクをコピー',
    side: 'bottom',
    delay: 400,
    longPressDelay: 500,
    longPressSide: 'top',
    disabled: false,
    hideShadow: false,
    showArrow: false,
    children: <Button>共有</Button>,
  },
  argTypes: {
    content: { control: 'text' },
    side: {
      control: 'inline-radio',
      options: ['top', 'bottom', 'left', 'right'],
      table: { defaultValue: { summary: "'bottom'" } },
    },
    children: { control: false },
    portalContainer: { control: false },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  parameters: {
    docs: {
      source: sourceCode(`
        <Tooltip content="リンクをコピー">
          <Button>共有</Button>
        </Tooltip>
      `),
    },
  },
  render: (args) => (
    <div className="p-12">
      <Tooltip {...args} />
    </div>
  ),
};

const sides = ['top', 'bottom', 'left', 'right'] as const;

export const Sides: Story = {
  tags: ['visual'],
  name: '向き',
  parameters: {
    controls: { include: ['content'] },
    docs: { description: { story: '`side` ごとに出した形です。' } },
  },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[300px]">
      {(frame) => (
        <div className="grid w-full grid-cols-2 gap-x-8 gap-y-24 px-24 pt-12">
          {sides.map((side) => (
            <div key={side} className="flex justify-center">
              {/* Tooltip は同時に1つしか出ないので、並べるときは open で固定する */}
              <Tooltip {...args} side={side} open={openOnLoad(viewMode)} portalContainer={frame}>
                <Button>{side}</Button>
              </Tooltip>
            </div>
          ))}
        </div>
      )}
    </ScreenFrame>
  ),
};

export const Long: Story = {
  tags: ['visual'],
  name: '長い文',
  args: {
    content: '公開すると、URL を知っている人は誰でも記事を読めます。あとから非公開に戻せます。',
  },
  parameters: {
    controls: { include: ['content'] },
    docs: { description: { story: '文が長いときは、幅の上限で折り返します。' } },
  },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[200px]">
      {(frame) => (
        <div className="flex w-full justify-center pt-2">
          <Tooltip {...args} defaultOpen={openOnLoad(viewMode)} portalContainer={frame}>
            <Button>公開する</Button>
          </Tooltip>
        </div>
      )}
    </ScreenFrame>
  ),
};

export const NoShadow: Story = {
  tags: ['visual'],
  name: '影なし',
  args: { hideShadow: true },
  parameters: {
    controls: { include: ['content', 'hideShadow'] },
    docs: { description: { story: '`hideShadow` で影を外し、細い輪郭だけにした形です。' } },
  },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[160px]">
      {(frame) => (
        <div className="flex w-full justify-center pt-2">
          <Tooltip {...args} open={openOnLoad(viewMode)} portalContainer={frame}>
            <Button>共有</Button>
          </Tooltip>
        </div>
      )}
    </ScreenFrame>
  ),
};

export const Arrow: Story = {
  tags: ['visual'],
  name: '矢印',
  args: { showArrow: true },
  parameters: {
    controls: { include: ['content', 'showArrow'] },
    docs: {
      description: { story: '`showArrow` で、本体を指す小さな矢印を出した形です。' },
      source: sourceCode(`
        <Tooltip content="リンクをコピー" showArrow>
          <Button>共有</Button>
        </Tooltip>
      `),
    },
  },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[300px]">
      {(frame) => (
        <div className="grid w-full grid-cols-2 gap-x-8 gap-y-24 px-24 pt-12">
          {sides.map((side) => (
            <div key={side} className="flex justify-center">
              <Tooltip {...args} side={side} open={openOnLoad(viewMode)} portalContainer={frame}>
                <Button>{side}</Button>
              </Tooltip>
            </div>
          ))}
        </div>
      )}
    </ScreenFrame>
  ),
};

const onPublish = fn();

export const DisabledTrigger: Story = {
  name: '押せないボタンに理由を出す',
  args: { content: '下書きを保存すると公開できます', showArrow: true },
  parameters: {
    controls: { include: ['content', 'showArrow'] },
    docs: {
      description: {
        story:
          '押せないボタンを本体にすると、Tab で止まり、Tooltip で押せない理由を読めます。理由はボタンの説明として読み上げられます。押しても `onClick` は呼びません。右は `focusableWhenDisabled={false}` を渡して外した形で、Tab では止まりません。',
      },
      source: sourceCode(`
        <Tooltip content="下書きを保存すると公開できます" showArrow>
          <Button color="primary" disabled>公開する</Button>
        </Tooltip>
      `),
    },
  },
  render: (args) => (
    <div className="flex gap-3 p-12">
      <Tooltip {...args}>
        <Button color="primary" disabled onClick={onPublish}>
          公開する
        </Button>
      </Tooltip>
      <Tooltip {...args} content="フォーカスしない">
        <Button disabled focusableWhenDisabled={false}>
          外した形
        </Button>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const publish = canvas.getByRole('button', { name: '公開する' });
    const optedOut = canvas.getByRole('button', { name: '外した形' });
    // Tooltip の本体の押せないボタンは、disabled 属性を付けず aria-disabled で伝える
    await expect(publish).not.toBeDisabled();
    await expect(publish).toHaveAttribute('aria-disabled', 'true');
    await expect(optedOut).toBeDisabled();
    // 押せない理由は、出す前から本体の説明として読み上げられる。外した形は結ばない
    await expect(publish).toHaveAccessibleDescription('下書きを保存すると公開できます');
    await expect(optedOut).not.toHaveAttribute('aria-describedby');
    // Tab で止まり、押せない理由が出る。押しても onClick を呼ばない
    onPublish.mockClear();
    await userEvent.tab();
    await expect(publish).toHaveFocus();
    // 本体の説明に結ぶ隠した文と区別して、出た面を見る
    await waitFor(() =>
      expect(
        body.getByText('下書きを保存すると公開できます', { selector: '[data-slot="tooltip"]' })
      ).toBeVisible()
    );
    await userEvent.keyboard('{Enter}');
    await expect(onPublish).not.toHaveBeenCalled();
    // 外した形には止まらない
    await userEvent.tab();
    await expect(optedOut).not.toHaveFocus();
    publish.blur();
  },
};

const onCheckSubmit = fn((event: FormEvent) => event.preventDefault());

// 子を受け取らない自作の部品（受け取った props を外側の要素に渡し、中にボタンを持つ）
function CheckToolbar(props: ComponentProps<'div'>) {
  return (
    <div role="toolbar" aria-label="自作の部品" className="flex gap-2" {...props}>
      <Button disabled>自作の部品の中</Button>
    </div>
  );
}

export const DisabledTriggerCheck: Story = {
  name: '押せないボタンの本体（確かめ）',
  tags: ['!autodocs'],
  args: { content: '下書きを保存すると公開できます' },
  render: (args) => (
    <form className="flex gap-3 p-12" onSubmit={onCheckSubmit}>
      <input aria-label="題名" />
      <Tooltip {...args}>
        <Button type="submit" color="primary" disabled>
          公開する
        </Button>
      </Tooltip>
      <Tooltip {...args} disabled>
        <Button disabled>止めた Tooltip</Button>
      </Tooltip>
      {/* 入れ物を本体にしたときは、中のボタンには効かない */}
      <Tooltip {...args} content="入れ物の補足">
        <div role="toolbar" aria-label="入れ物" className="flex gap-2">
          <Button disabled>入れ物の中</Button>
        </div>
      </Tooltip>
      {/* 子を受け取らない自作の部品を本体にしたときも、中のボタンには効かない */}
      <Tooltip {...args} content="自作の部品の補足">
        <CheckToolbar />
      </Tooltip>
      {/* Tooltip を重ねたとき、本体のボタンは外の Tooltip の本体でもある */}
      <Tooltip {...args} content="外の Tooltip">
        <Tooltip {...args} disabled>
          <Button disabled>重ねた本体</Button>
        </Tooltip>
      </Tooltip>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submit = canvas.getByRole('button', { name: '公開する' });
    // Tooltip を止めているときは、ふつうの押せないボタンのまま（Tab で止まらない）
    await expect(canvas.getByRole('button', { name: '止めた Tooltip' })).toBeDisabled();
    // 効くのは本体そのものにしたボタンだけ。入れ物を本体にしたときの中のボタンは、ふつうの押せないボタン
    await expect(submit).not.toBeDisabled();
    await expect(submit).toHaveAttribute('aria-disabled', 'true');
    await expect(canvas.getByRole('button', { name: '入れ物の中' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: '自作の部品の中' })).toBeDisabled();
    // 重ねた Tooltip の本体は、外の Tooltip のためにフォーカスできる形のまま
    const nested = canvas.getByRole('button', { name: '重ねた本体' });
    await expect(nested).not.toBeDisabled();
    // 押せない理由は、本体のボタンの説明に入る（重ねたときは外の Tooltip の文）。入れ物・自作の部品の中のボタンには入らない
    await expect(submit).toHaveAccessibleDescription('下書きを保存すると公開できます');
    await expect(nested).toHaveAccessibleDescription('外の Tooltip');
    await expect(canvas.getByRole('button', { name: '入れ物の中' })).not.toHaveAttribute(
      'aria-describedby'
    );
    await expect(canvas.getByRole('button', { name: '自作の部品の中' })).not.toHaveAttribute(
      'aria-describedby'
    );
    // フォーカスできる押せない送信のボタン: 押しても、Enter・Space でも、入力欄で Enter を押しても送らない
    onCheckSubmit.mockClear();
    await userEvent.click(submit);
    submit.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await userEvent.click(canvas.getByRole('textbox', { name: '題名' }));
    await userEvent.keyboard('{Enter}');
    await expect(onCheckSubmit).not.toHaveBeenCalled();
  },
};

// 指で長押しする。pointerdown を出し、長押しの時間より長く待つ
function touch(element: Element, type: 'pointerdown' | 'pointerup') {
  const { left, top } = element.getBoundingClientRect();
  element.dispatchEvent(
    new PointerEvent(type, {
      pointerId: 1,
      pointerType: 'touch',
      isPrimary: true,
      clientX: left + 4,
      clientY: top + 4,
      bubbles: true,
      cancelable: true,
      composed: true,
    })
  );
}

const onShare = fn();

export const Accessibility: Story = {
  name: '読み上げと長押し',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="p-12">
      <Tooltip {...args} longPressDelay={300}>
        <Button onClick={onShare}>共有</Button>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: '共有' });
    // キーボードでフォーカスすると、待たずに出る。Esc で消える
    await userEvent.tab();
    // 押せるボタンの読み上げは変えない（Tooltip の文を説明に結ばない）
    await expect(trigger).not.toHaveAttribute('aria-describedby');
    await expect(trigger).toHaveFocus();
    await waitFor(() => expect(body.getByText('リンクをコピー')).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByText('リンクをコピー')).toBeNull());
    trigger.blur();

    // 指で長押しすると出る。離したときの click では本体を実行しない
    onShare.mockClear();
    touch(trigger, 'pointerdown');
    await new Promise((resolve) => setTimeout(resolve, 400));
    touch(trigger, 'pointerup');
    trigger.click();
    await waitFor(() => expect(body.getByText('リンクをコピー')).toBeVisible());
    await expect(onShare).not.toHaveBeenCalled();
    // ほかの場所に触れると閉じる
    touch(canvasElement.ownerDocument.body, 'pointerdown');
    await waitFor(() => expect(body.queryByText('リンクをコピー')).toBeNull());
  },
};

export const Provider: Story = {
  name: '待ち時間をそろえる',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`TooltipProvider` で包むと、中の Tooltip の待ち時間がそろいます。1 つが出たあとは、隣へマウスを移すと待たずに出ます。',
      },
      source: sourceCode(`
        <TooltipProvider delay={800}>
          <Tooltip content="太字"><Button iconOnly aria-label="太字">…</Button></Tooltip>
          <Tooltip content="斜体"><Button iconOnly aria-label="斜体">…</Button></Tooltip>
        </TooltipProvider>
      `),
    },
  },
  render: () => (
    <TooltipProvider delay={800}>
      <div className="flex gap-2">
        <Tooltip content="太字にする">
          <Button variant="outline">太字</Button>
        </Tooltip>
        <Tooltip content="斜体にする">
          <Button variant="outline">斜体</Button>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    // Provider の delay（800ms）が、Tooltip の既定（400ms）の代わりに効く
    await userEvent.hover(canvas.getByRole('button', { name: '太字' }));
    await new Promise((resolve) => setTimeout(resolve, 500));
    await expect(body.queryByText('太字にする')).toBeNull();
    await waitFor(() => expect(body.getByText('太字にする')).toBeVisible(), { timeout: 2000 });
    // 1 つが出たあとは、隣は待たずに出る
    await userEvent.unhover(canvas.getByRole('button', { name: '太字' }));
    await userEvent.hover(canvas.getByRole('button', { name: '斜体' }));
    await waitFor(() => expect(body.getByText('斜体にする')).toBeVisible(), { timeout: 300 });
    await userEvent.unhover(canvas.getByRole('button', { name: '斜体' }));
  },
};
