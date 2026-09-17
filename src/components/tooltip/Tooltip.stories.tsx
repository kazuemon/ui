import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Tooltip } from './Tooltip';
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
          '- `side` で出す向きを選びます（既定は下）。画面の端に当たるときは反対側に出します。',
          '- 影を付けたくないときは `shadow={false}` にします。細い輪郭だけで下の内容と切り分けます。',
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
    shadow: true,
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
    container: { control: false },
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
              <Tooltip {...args} side={side} open={openOnLoad(viewMode)} container={frame}>
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
          <Tooltip {...args} defaultOpen={openOnLoad(viewMode)} container={frame}>
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
  args: { shadow: false },
  parameters: {
    controls: { include: ['content', 'shadow'] },
    docs: { description: { story: '`shadow={false}` で影を外し、細い輪郭だけにした形です。' } },
  },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[160px]">
      {(frame) => (
        <div className="flex w-full justify-center pt-2">
          <Tooltip {...args} open={openOnLoad(viewMode)} container={frame}>
            <Button>共有</Button>
          </Tooltip>
        </div>
      )}
    </ScreenFrame>
  ),
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
