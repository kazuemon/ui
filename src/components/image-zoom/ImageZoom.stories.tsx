import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { ImageZoom } from './ImageZoom';
import { Gallery, Matrix, PhoneFrame, ScreenFrame, Specimen } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';

// 見本の画像（外に取りに行かない）
const svg = (width: number, height: number, body: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="${width}" height="${height}">${body}</svg>`)}`;
const landscapeBody =
  '<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc4f8"/><stop offset="1" stop-color="#cfeafc"/></linearGradient></defs><rect width="640" height="360" fill="url(#s)"/><circle cx="520" cy="90" r="36" fill="#fff4cc"/><path d="M0 250 L130 140 L230 230 L360 110 L480 220 L580 150 L640 200 L640 360 L0 360Z" fill="#9fb3cf"/><path d="M0 300 L120 250 L240 300 L380 240 L520 310 L640 270 L640 360 L0 360Z" fill="#2f6b58"/>';
const landscape = svg(640, 360, landscapeBody);
// 同じ絵の大きな版（zoomSrc の見本）
const landscapeLarge = svg(1920, 1080, landscapeBody);
// 縦長の画像
const portrait = `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 480" width="360" height="480"><rect width="360" height="480" fill="#cfeafc"/><circle cx="180" cy="170" r="70" fill="#fff4cc"/><path d="M0 380 L120 300 L240 360 L360 290 L360 480 L0 480Z" fill="#2f6b58"/></svg>')}`;
// 白っぽい画像（画面のスクリーンショット風）
const whiteScreen = svg(
  640,
  360,
  '<rect width="640" height="360" fill="#ffffff"/><rect x="48" y="48" width="200" height="20" rx="6" fill="#eef0f1"/><rect x="48" y="96" width="544" height="10" rx="5" fill="#eef0f1"/><rect x="48" y="120" width="440" height="10" rx="5" fill="#eef0f1"/><rect x="48" y="176" width="260" height="130" rx="12" fill="#f4f5f6"/><rect x="332" y="176" width="260" height="130" rx="12" fill="#f4f5f6"/>'
);
// 読み込めない画像（壊れたデータ）
const broken = 'data:image/png;base64,AAAA';

// 開いた状態のストーリーも、ドキュメントのページでは閉じて描く（開くとフォーカスが移り、ページが流れるため）
const openOnLoad = (viewMode: string) => viewMode !== 'docs';

const meta = {
  title: 'Components/ImageZoom',
  component: ImageZoom,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '押すと、画面いっぱいに拡大して見られる画像です。記事や作品のページで、細部まで見てほしい画像に使います。',
          '',
          '- 画像の props（`src`・`alt`・`width`・`height`・`ratio`・`radius`・`render` など）は Image と同じです。拡大するのは、画像の本来の比の全体です（`ratio` で切り取っていても、拡大すると全体が見えます）。',
          '- `caption` を渡すと、Figure と同じく画像の下にキャプションを出し、拡大したときも画像の下に出します。',
          '- ページに出す画像が小さいときは、`zoomSrc` に大きな画像の URL を渡します。拡大した時点で読み込み、読み込めるまではページの画像を引き伸ばして見せます。`zoomSrc` がないときは、画像本来の大きさまでしか拡大しません。',
          '- 押せることは、マウスでは拡大のカーソルと、マウスを載せたときに画像の右下に出る虫眼鏡の印で伝えます。印をいつも出す（指の画面でも見せる）ときは `showZoomIcon` を渡します。',
          '- 拡大した面は、右上の ×、Esc、面のどこか（画像や後ろ）を押す、指で上下に引く、のどれでも閉じます。押しても閉じないようにするときは `dismissible={false}`、指で引いて閉じないようにするときは `closeOnSwipe={false}` です。ホイールでスクロールしたときにも閉じるときは `closeOnScroll` を渡します。',
          '- 後ろの面は、既定の `variant="light"` がページの地の色で覆ってぼかし、画像だけを前に出します。`variant="dark"` は Dialog と同じ後ろの暗さで、ページが透けて見えます。',
          '- 開閉の動きは、既定の `motion="expand"` が押した画像の位置から広がり、閉じると元の位置へ戻ります。`motion="fade"` は画面の中央で、濃さと少し小さい姿から出ます。',
          '- キャプションの出方は `captionMotion` で選べます。`move` はページのキャプションの位置から拡大した画像の下へ移り、`fade` はページのキャプションが消えてから出ます。書かないときは `motion` に従います（`expand` なら `move`、`fade` なら `fade`）。',
          '- 閉じる × は、既定の `closeButtonVariant="flat"` が面のない形で、画像には重ねません。`closeButtonVariant="raised"` は白い丸の面を持ち、画像に重なってもよい形で、縦に長い画像が大きく出ます。',
          '- 指で拡大して細部を見るときは、端末のピンチで拡大します。',
          '- 読み込みに失敗した画像は押せません。',
          '- 読み上げでは、画像を包むボタンが「画像の代わりの文 ＋ 拡大する」と読まれます。後ろの文は `zoomName` で変えられます。拡大した面の名前は `alt`、説明はキャプションです。',
        ].join('\n'),
      },
    },
  },
  args: { src: landscape, alt: '空と山の絵' },
  argTypes: {
    src: { control: false },
    zoomSrc: { control: false },
    caption: { control: 'text' },
    ratio: { control: 'inline-radio', options: [undefined, '16 / 9', '4 / 3', '1'] },
    radius: {
      control: 'inline-radio',
      options: ['card', 'nested', 'none'],
      table: { defaultValue: { summary: "'card'" } },
    },
    dismissible: { control: 'boolean' },
    hideCloseButton: { control: 'boolean' },
    portalContainer: { control: false },
  },
} satisfies Meta<typeof ImageZoom>;

export default meta;
type Story = StoryObj<typeof meta>;

const narrow = (Story: () => ReactNode) => <div className="max-w-md">{Story()}</div>;

export const Playground: Story = {
  name: '基本',
  args: { caption: '図 1. 空と山' },
  decorators: [narrow],
  parameters: {
    docs: {
      source: sourceCode(`
        <ImageZoom src="/images/mountain.png" alt="空と山の絵" width={640} height={360} caption="図 1. 空と山" />
      `),
    },
  },
};

export const Open: Story = {
  tags: ['visual'],
  name: '拡大した状態',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: '拡大した状態です。ここでは画面の代わりの枠の中に描いています。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <ScreenFrame>
      {(frame) => (
        <div className="w-64">
          <ImageZoom {...args} defaultOpen={openOnLoad(viewMode)} portalContainer={frame} />
        </div>
      )}
    </ScreenFrame>
  ),
};

export const WithCaption: Story = {
  tags: ['visual'],
  name: 'キャプション',
  args: {
    src: whiteScreen,
    alt: '設定の画面',
    caption: '図 2. 設定の画面。項目は左から順に並びます',
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`caption` は、ページでは画像の下に、拡大したときも画像の下に出ます。白っぽい画像でも、細い輪郭で後ろの面と分かれます。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <ScreenFrame>
      {(frame) => (
        <div className="w-64">
          <ImageZoom {...args} defaultOpen={openOnLoad(viewMode)} portalContainer={frame} />
        </div>
      )}
    </ScreenFrame>
  ),
};

export const Phone: Story = {
  tags: ['visual'],
  name: 'スマートフォン',
  args: { src: portrait, alt: '縦長の絵', caption: '縦長の画像は、画面の高さに収めます' },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '指で操作するときも、同じ形で拡大します。上下に引くと、引いた分だけ後ろが薄くなり、離すと閉じます。細部は端末のピンチで拡大します。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <PhoneFrame>
      {(frame) => (
        <div className="w-40">
          <ImageZoom {...args} defaultOpen={openOnLoad(viewMode)} portalContainer={frame} />
        </div>
      )}
    </PhoneFrame>
  ),
};

const stateColumns: (MatrixColumn & { failed?: boolean })[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: 'フォーカス（キーボード）', state: 'focus' },
  { label: '読み込みに失敗', failed: true },
];

export const States: Story = {
  tags: ['visual'],
  name: '押せることの見せ方',
  parameters: {
    controls: { disable: true },
    pseudo: statePseudo({
      hover: '[data-slot="image-zoom-trigger"]',
      focusVisible: '[data-slot="image-zoom-trigger"]',
    }),
    docs: {
      description: {
        story:
          'マウスを載せると拡大のカーソルになり、画像の右下に虫眼鏡の印が出ます。キーボードで来たときは、フォーカスの線と印が出ます。読み込みに失敗した画像は押せません。',
      },
    },
  },
  render: () => (
    <Matrix
      rows={[
        { label: '比のまま', ratio: undefined },
        { label: 'ratio={1}（切り取る）', ratio: 1 },
      ]}
      columns={stateColumns}
      columnWidth="12rem"
      rowLabel={(row) => row.label}
      renderCell={(row, column) => (
        <ImageZoom
          src={column.failed ? broken : landscape}
          alt="空と山の絵"
          width={640}
          height={360}
          ratio={row.ratio}
        />
      )}
    />
  ),
  play: async ({ canvasElement }) => {
    const buttons = [
      ...canvasElement.querySelectorAll<HTMLButtonElement>('[data-slot="image-zoom-trigger"]'),
    ];
    // 失敗した画像だけが押せない
    await waitFor(() =>
      expect(buttons.map((button) => button.disabled)).toEqual([
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        true,
      ])
    );
  },
};

// 縦に長いスクリーンショット（closeButtonVariant の見本）
const tallScreen = `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 780" width="360" height="780"><rect width="360" height="780" fill="#ffffff"/><rect x="24" y="56" width="160" height="20" rx="6" fill="#cfeafc"/><rect x="24" y="104" width="312" height="180" rx="16" fill="#7cc4f8"/><rect x="24" y="308" width="312" height="10" rx="5" fill="#eef0f1"/><rect x="24" y="332" width="260" height="10" rx="5" fill="#eef0f1"/><rect x="24" y="372" width="312" height="72" rx="12" fill="#f4f5f6"/><rect x="24" y="460" width="312" height="72" rx="12" fill="#f4f5f6"/><rect x="24" y="700" width="312" height="48" rx="24" fill="#2474df"/></svg>')}`;

const captionMotions = [
  { motion: 'expand', captionMotion: undefined, label: 'motion="expand"（キャプションは move）' },
  { motion: 'fade', captionMotion: undefined, label: 'motion="fade"（キャプションは fade）' },
  { motion: 'fade', captionMotion: 'move', label: 'motion="fade" ＋ captionMotion="move"' },
  { motion: 'expand', captionMotion: 'fade', label: 'motion="expand" ＋ captionMotion="fade"' },
] as const;

export const CaptionMotions: Story = {
  name: 'キャプションの出方（押して試す）',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '画像の動き（`motion`）とキャプションの出方（`captionMotion`）の組み合わせです。画像を押して開き、もう一度押すと閉じます。`captionMotion` を書かないときは `motion` に従い、`expand` ではキャプションがページの位置から移り、`fade` ではページのキャプションが消えてから拡大した画像の下に出ます。',
      },
    },
  },
  render: () => (
    <Gallery columnWidth="16rem">
      {captionMotions.map((item) => (
        <Specimen key={item.label} label={item.label}>
          <ImageZoom
            src={landscape}
            alt="空と山の絵"
            width={640}
            height={360}
            caption="図 1. 空と山"
            motion={item.motion}
            captionMotion={item.captionMotion}
          />
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const Options: Story = {
  tags: ['visual'],
  name: '選べる形',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '左から `variant="dark"`（Dialog と同じ後ろの暗さ）、`closeButtonVariant="raised"`（白い丸の ×。画像に重なってよい）、`showZoomIcon`（虫眼鏡の印をいつも出す）です。',
      },
    },
  },
  render: (_args, { viewMode }) => (
    <div className="flex flex-wrap items-start gap-6">
      <PhoneFrame>
        {(frame) => (
          <div className="w-40">
            <ImageZoom
              variant="dark"
              src={portrait}
              alt="縦長の絵"
              caption="後ろのページが透けて見える"
              defaultOpen={openOnLoad(viewMode)}
              portalContainer={frame}
            />
          </div>
        )}
      </PhoneFrame>
      <PhoneFrame>
        {(frame) => (
          <div className="w-40">
            <ImageZoom
              closeButtonVariant="raised"
              src={tallScreen}
              alt="スマートフォンの画面"
              defaultOpen={openOnLoad(viewMode)}
              portalContainer={frame}
            />
          </div>
        )}
      </PhoneFrame>
      <div className="w-60">
        <ImageZoom showZoomIcon src={landscape} alt="空と山の絵" width={640} height={360} />
      </div>
    </div>
  ),
};

export const LargeImage: Story = {
  name: '大きな画像を読み込む',
  args: { zoomSrc: landscapeLarge, width: 640, height: 360 },
  decorators: [narrow],
  parameters: {
    docs: {
      description: {
        story:
          'ページには小さな画像を出し、拡大したときだけ大きな画像を読み込むときは、`zoomSrc` に渡します。読み込めるまでは、ページの画像を引き伸ばして見せます。',
      },
      source: sourceCode(`
        <ImageZoom src="/images/mountain-640.png" zoomSrc="/images/mountain-1920.png" alt="空と山の絵" width={640} height={360} />
      `),
    },
  },
};

export const Accessibility: Story = {
  name: '読み上げとフォーカス',
  args: { caption: '図 1. 空と山' },
  decorators: [narrow],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    // 画像を包むボタン: 画像の代わりの文のあとに「拡大する」。開くのはダイアログ
    const trigger = canvas.getByRole('button', { name: '空と山の絵 拡大する' });
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    // 面の名前は alt、説明はキャプション。拡大した画像そのものは二度読ませない
    const dialog = await body.findByRole('dialog', { name: '空と山の絵' });
    await expect(dialog).toHaveAccessibleDescription('図 1. 空と山');
    await expect(within(dialog).queryByRole('img')).toBeNull();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // 開いているあいだも、ボタンの名前から画像の代わりの文が抜けない（元の画像は濃さで隠す）
    await expect(trigger).toHaveAccessibleName('空と山の絵 拡大する');
    // 開くと、フォーカスは面の中（右上の ×）へ
    const close = within(dialog).getByRole('button', { name: '閉じる' });
    await waitFor(() => expect(close).toHaveFocus());

    // Esc で閉じ、フォーカスは押した画像へ戻る
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const Dismiss: Story = {
  name: '閉じ方',
  decorators: [narrow],
  parameters: {
    docs: {
      description: {
        story:
          '拡大した面は、画像や後ろを押すと閉じます。`dismissible={false}` のときは、右上の × と Esc でだけ閉じます。ホイールでスクロールして閉じるのは `closeOnScroll` のときだけです。',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <ImageZoom {...args} alt="押して閉じる絵" />
      <ImageZoom {...args} alt="× で閉じる絵" dismissible={false} />
      <ImageZoom {...args} alt="スクロールで閉じる絵" closeOnScroll />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    // 画像を押すと閉じる
    await userEvent.click(canvas.getByRole('button', { name: '押して閉じる絵 拡大する' }));
    const dialog = await body.findByRole('dialog', { name: '押して閉じる絵' });
    const image = dialog.querySelector<HTMLElement>('[data-slot="image-zoom-image"]');
    await waitFor(() => expect(image?.getAnimations().length ?? 0).toBe(0));
    await userEvent.click(image!);
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());

    // 指で上下に引く: 少しだけなら戻り、十分に引くと閉じる
    const swipe = async (stage: Element, distance: number) => {
      const at = (type: string, y: number) =>
        stage.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            pointerId: 7,
            pointerType: 'touch',
            isPrimary: true,
            clientX: 100,
            clientY: y,
          })
        );
      at('pointerdown', 200);
      for (let step = 1; step <= 4; step++) at('pointermove', 200 + (distance * step) / 4);
      await new Promise((resolve) => setTimeout(resolve, 150));
      at('pointerup', 200 + distance);
    };
    await userEvent.click(canvas.getByRole('button', { name: '押して閉じる絵 拡大する' }));
    const swiped = await body.findByRole('dialog', { name: '押して閉じる絵' });
    const stage = swiped.querySelector('[data-slot="image-zoom-stage"]')!;
    await swipe(stage, 20);
    await expect(body.getByRole('dialog', { name: '押して閉じる絵' })).toBeInTheDocument();
    await swipe(stage, 160);
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());

    // dismissible={false} は、押しても閉じず、× で閉じる
    await userEvent.click(canvas.getByRole('button', { name: '× で閉じる絵 拡大する' }));
    const fixed = await body.findByRole('dialog', { name: '× で閉じる絵' });
    const fixedImage = fixed.querySelector<HTMLElement>('[data-slot="image-zoom-image"]');
    await waitFor(() => expect(fixedImage?.getAnimations().length ?? 0).toBe(0));
    await userEvent.click(fixedImage!);
    await expect(body.getByRole('dialog', { name: '× で閉じる絵' })).toBeInTheDocument();
    await userEvent.click(within(fixed).getByRole('button', { name: '閉じる' }));
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());

    // ホイールでスクロールしても、既定では閉じない。closeOnScroll のときだけ閉じる（開いてすぐの惰性は受けないので待つ）
    const scroll = async (name: string) => {
      await userEvent.click(canvas.getByRole('button', { name: `${name} 拡大する` }));
      const opened = await body.findByRole('dialog', { name });
      await new Promise((resolve) => setTimeout(resolve, 450));
      opened
        .querySelector('[data-slot="image-zoom-stage"]')!
        .dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 120 }));
    };
    await scroll('押して閉じる絵');
    await new Promise((resolve) => setTimeout(resolve, 100));
    await expect(body.getByRole('dialog', { name: '押して閉じる絵' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    await scroll('スクロールで閉じる絵');
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
  },
};
