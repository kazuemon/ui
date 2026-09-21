import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useEffect, useRef } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';

import {
  ToastProvider,
  type ToastOptions,
  type ToastPosition,
  type ToastStack,
  type ToastVariant,
  useToast,
} from './Toast';
import { ScreenFrame, Specimen } from '../../stories/story-parts';
import { Button } from '../button/Button';
import { Link } from '../link/Link';

// ストーリーの中で、枠（ScreenFrame）の中にトーストを出す見本
// 出したままにして撮るので、visual のストーリーでは timeout={0}（消えない）にする
function ShowOnMount({ toasts }: { toasts: ToastOptions[] }) {
  const toast = useToast();
  const shown = useRef(false);
  useEffect(() => {
    // 出すのは最初の一度だけ
    if (shown.current) return;
    shown.current = true;
    for (const options of toasts) toast.show(options);
  }, [toast, toasts]);
  return null;
}

function Demo({
  toasts,
  children,
  container,
  ...props
}: {
  toasts?: ToastOptions[];
  children?: ReactNode;
  container: HTMLElement;
  timeout?: number;
  limit?: number;
  position?: ToastPosition;
  stack?: ToastStack;
  variant?: ToastVariant;
  hideOutline?: boolean;
}) {
  return (
    <ToastProvider portalContainer={container} {...props}>
      {toasts ? <ShowOnMount toasts={toasts} /> : null}
      {children}
    </ToastProvider>
  );
}

const saved: ToastOptions = { status: 'success', title: '保存しました' };
const sample: ToastOptions[] = [
  { status: 'info', title: '下書きを保存しました', description: '3 分前の内容に戻せます。' },
  { status: 'success', title: '記事を公開しました' },
  {
    status: 'danger',
    title: '保存できませんでした',
    description: '通信を確かめて、もう一度お試しください。',
  },
];

const meta = {
  title: 'Components/Toast',
  component: ToastProvider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '一定の時間で消えるお知らせです。操作した結果を、画面を止めずに知らせるときに使います。',
          '',
          '- アプリ全体を `ToastProvider` で包み、どこからでも `useToast().show({ … })` で出します。',
          '- `status` は状態の色（`info`・`success`・`warning`・`danger`）です。書かないと、色を持たないグレーになります。危険だけが読み上げに割り込み、ほかは静かに知らせます。',
          '- 既定では自動で消えません（`timeout` は 0）。消えるまでの時間を決めると、その時間で消え、面の下に残り時間の線が出ます。読んでいるあいだ（マウスを載せている・触れている・キーボードで入っている）は、時間も線も止まります。',
          '- 時間は、全体（`ToastProvider` の `timeout`）でも、トーストごと（`useToast().show({ timeout })`）でも決められます。',
          '- 出る場所は `position` です。`auto`（既定）は、指で操作していて画面が狭いときは下の中央、それ以外は右下に出します。',
          '- 積み方は `stack` です。`auto`（既定）は、3 枚までは縦に並べ、4 枚めからは重ねます。いちど重ねたら、全部消えるまで重ねたままです（読んでいる途中で形が変わらないように）。重ねると手前の 1 枚だけが見え、載せる・触れる・キーボードで入ると開いて全部見えます。',
          '- 面は `variant`（`soft`（既定）・`filled`）と `hideOutline`（細い輪郭。既定は出す）で決めます。',
          '- はじく（スワイプする）と消せます。× でも閉じられます。',
          '- `useToast().promise` に Promise を渡すと、待ち・成功・失敗のトーストを順に出せます。',
          '- 押して何かをさせたいとき（「元に戻す」など）は `actions` にボタンかリンクを渡します。読まないと困ることは、消えてしまうトーストではなく `Notice` に置きます。',
        ].join('\n'),
      },
    },
  },
  args: { position: 'auto', stack: 'auto', timeout: 0, limit: 5, variant: 'soft' },
  argTypes: {
    position: {
      control: 'inline-radio',
      options: [
        'bottom-end',
        'bottom-center',
        'bottom-start',
        'top-end',
        'top-center',
        'top-start',
      ],
    },
    stack: { control: 'inline-radio', options: ['auto', 'stacked', 'list'] },
    variant: { control: 'inline-radio', options: ['soft', 'filled'] },
    hideOutline: { control: 'boolean' },
    timeout: { control: 'number' },
    limit: { control: 'number' },
    children: { control: false },
  },
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

function Buttons() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => toast.show(saved)}>保存する</Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.show({
            status: 'danger',
            title: '保存できませんでした',
            description: '通信を確かめて、もう一度お試しください。',
          })
        }
      >
        失敗させる
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.show({
            status: 'info',
            title: '下書きを保存しました',
            actions: <Link href="#">元に戻す</Link>,
          })
        }
      >
        操作つきで出す
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.show({ title: '5 秒で消えます', timeout: 5000 })}
      >
        時間つきで出す
      </Button>
    </div>
  );
}

export const Playground: Story = {
  name: '基本',
  render: (args) => (
    <ScreenFrame>
      {(frame) => (
        <Demo {...args} container={frame}>
          <Buttons />
        </Demo>
      )}
    </ScreenFrame>
  ),
};

export const Colors: Story = {
  tags: ['visual'],
  name: '色',
  parameters: { controls: { disable: true } },
  render: () => (
    <ScreenFrame height="h-[560px]">
      {(frame) => (
        <Demo
          container={frame}
          timeout={0}
          limit={5}
          stack="list"
          toasts={[
            {
              status: 'info',
              title: '下書きを保存しました',
              description: '3 分前の内容に戻せます。',
            },
            { status: 'success', title: '記事を公開しました' },
            {
              status: 'warning',
              title: '画像が大きすぎます',
              description: '2MB まで縮めて載せました。',
            },
            { status: 'danger', title: '保存できませんでした' },
            { title: '同期しています' },
          ]}
        />
      )}
    </ScreenFrame>
  ),
  play: async ({ canvas }) => {
    await waitFor(async () => {
      // 読み上げのための控えが同時にあるので、数は数えずに「出ている」ことだけを見る
      await expect(canvas.getAllByText('同期しています').length).toBeGreaterThan(0);
    });
  },
};

export const Appearances: Story = {
  tags: ['visual'],
  name: '面の見た目',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-8">
      {(
        [
          ['soft（既定）', 'soft', false],
          ['filled', 'filled', false],
          ['soft・輪郭なし', 'soft', true],
        ] as const
      ).map(([label, variant, hideOutline]) => (
        <Specimen key={label} label={label}>
          <ScreenFrame height="h-[300px]">
            {(frame) => (
              <Demo
                container={frame}
                timeout={0}
                limit={3}
                position="bottom-end"
                stack="list"
                variant={variant}
                hideOutline={hideOutline}
                toasts={[
                  { status: 'success', title: '記事を公開しました' },
                  { status: 'danger', title: '保存できませんでした' },
                ]}
              />
            )}
          </ScreenFrame>
        </Specimen>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    await waitFor(async () => {
      await expect(canvas.getAllByText('記事を公開しました').length).toBeGreaterThanOrEqual(3);
    });
  },
};

export const Timed: Story = {
  tags: ['visual'],
  name: '残り時間の線',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '消えるまでの時間を決めたトーストには、面の下に残り時間の線が出ます。読んでいるあいだは止まります。',
      },
    },
  },
  render: () => (
    <ScreenFrame height="h-[300px]">
      {(frame) => (
        <Demo
          container={frame}
          position="bottom-end"
          stack="list"
          toasts={[
            { status: 'success', title: '記事を公開しました', timeout: 5000 },
            { status: 'info', title: '下書きを保存しました', timeout: 10000 },
          ]}
        />
      )}
    </ScreenFrame>
  ),
  play: async ({ canvas }) => {
    await waitFor(async () => {
      await expect(canvas.getAllByText('記事を公開しました').length).toBeGreaterThan(0);
    });
  },
};

export const Stacked: Story = {
  tags: ['visual'],
  name: '重ねたところ',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '重ねると、手前の 1 枚だけが見え、後ろは少しのぞきます。載せると開いて全部見えます。',
      },
    },
  },
  render: () => (
    <ScreenFrame height="h-[420px]">
      {(frame) => <Demo container={frame} timeout={0} toasts={sample} />}
    </ScreenFrame>
  ),
  play: async ({ canvas }) => {
    await waitFor(async () => {
      await expect(canvas.getAllByText('保存できませんでした').length).toBeGreaterThan(0);
    });
  },
};

export const Positions: Story = {
  tags: ['visual'],
  name: '出る場所',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-8">
      {(['bottom-end', 'bottom-center', 'top-end'] as const).map((position) => (
        <Specimen key={position} label={position}>
          <ScreenFrame height="h-[300px]">
            {(frame) => <Demo container={frame} timeout={0} position={position} toasts={[saved]} />}
          </ScreenFrame>
        </Specimen>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    await waitFor(async () => {
      await expect(canvas.getAllByText('保存しました').length).toBeGreaterThanOrEqual(3);
    });
  },
};

export const Accessibility: Story = {
  name: '読み上げと閉じる',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <ScreenFrame>
      {(frame) => (
        <Demo {...args} container={frame} timeout={0}>
          <Buttons />
        </Demo>
      )}
    </ScreenFrame>
  ),
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: '保存する' }));
    await waitFor(async () => {
      await expect(canvas.getAllByText('保存しました').length).toBeGreaterThan(0);
    });
    // × で閉じられる
    // 出ているあいだ、トーストの中の操作は読み上げから外れている（Base UI が、読み上げには
    // 専用の領域を用意し、F6 でトーストへ移ったときに中の操作を届ける）。ここでは要素を直に押す
    const close = canvasElement.querySelector<HTMLButtonElement>('[data-slot="toast"] button');
    await expect(close).not.toBeNull();
    await userEvent.click(close!);
    await waitFor(async () => {
      await expect(canvas.queryAllByText('保存しました')).toHaveLength(0);
    });
  },
};
