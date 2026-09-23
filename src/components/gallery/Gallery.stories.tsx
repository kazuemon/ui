import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Gallery } from './Gallery';
import { galleryImages } from '../../samples/images';
import {
  Matrix,
  PhoneFrame,
  ScreenFrame,
  Specimen,
  Gallery as SpecimenGallery,
} from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';

// 読み込めない画像（壊れたデータ）
const broken = 'data:image/png;base64,AAAA';

// 開いた状態のストーリーも、ドキュメントのページでは閉じて描く（開くとフォーカスが移り、ページが流れるため）
const openOnLoad = (viewMode: string) => viewMode !== 'docs';

const meta = {
  title: 'Components/Gallery',
  component: Gallery,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '画像を並べ、押すと画面いっぱいに拡大して、前後に送って見られる部品です。作品のページの画像や、記事の図をまとめて見せるのに使います。1 枚だけなら ImageZoom を使います。',
          '',
          '- `items` に画像を渡します。`src`・`alt`・`width`・`height`・`render` は Image と同じです。`zoomSrc` を渡すと、拡大したときだけ大きな画像を読み込みます。',
          "- 並べた画像は、同じ比（`ratio`、既定は 4 / 3）に切り取ってそろえます。`ratio` には `16 / 9` のような数か `'16 / 9'` の文字を渡せます（Image と同じ）。拡大すると全体が見えます。",
          '- `columns` で列の数を決めます（既定は 3）。入れ物が狭いとき（28rem 未満）は 2 列にまとめます。画像のあいだは `gap` で、Stack と同じ段から選びます。',
          '- 画像ごとの `caption` は、拡大したときに画像の下に出します。並びの下に全体のキャプションを出すときは、Gallery の `caption` に渡します。',
          '- 拡大した面では、前後のボタン・←→ キー・指で左右にはじく、で送ります。送ったときは、画像の名前と位置を読み上げで知らせます。',
          '- 送るときの動きは `slideMotion` で選びます。既定の `shift` は少し滑って入れ替わり、`slide` は画像が並んだ帯のように幅いっぱいに滑ります。',
          '- 前後のボタンの置き場所は `controlsPosition` で選びます。既定の `bottom` は画像の下に前後のボタンと位置の示しをまとめ、`sides` は左右の端に画像と重ねずに置き、`overlay` は白い丸のボタンを画像に重ねます。',
          '- いまの位置の示し方は `indicator` で選びます。既定の `dots` は点（Carousel と同じ）、`count` は「3 / 6」、`none` は出しません。枚数が多いときは `count` が向きます。',
          '- 端では、送るボタンを押せない見た目にします。最後の次を最初につなげるときは `loop` を渡します。',
          '- 閉じると、そのとき見ている画像の位置へ戻り、フォーカスもその画像へ戻ります。',
          '- 後ろの面（`variant`）・開閉の動き（`motion`）・キャプションの出方（`captionMotion`）・閉じる ×（`closeButtonVariant`）・押せることの印（`showZoomIcon`）・閉じ方（`dismissible`・`closeOnSwipe`・`closeOnEscape`・`closeOnScroll`）は、ImageZoom と同じです。',
          '- 見せている画像の番号（0 から）は `value`・`defaultValue`・`onValueChange` で受け渡しできます。',
        ].join('\n'),
      },
    },
  },
  args: { items: galleryImages },
  argTypes: {
    items: { control: false },
    columns: {
      control: 'inline-radio',
      options: [1, 2, 3, 4],
      table: { defaultValue: { summary: '3' } },
    },
    ratio: { control: 'inline-radio', options: [undefined, '1', '4 / 3', '3 / 2', '16 / 9'] },
    gap: {
      control: 'inline-radio',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
      table: { defaultValue: { summary: "'sm'" } },
    },
    slideMotion: { control: 'inline-radio', options: ['shift', 'slide'] },
    controlsPosition: { control: 'inline-radio', options: ['bottom', 'sides', 'overlay'] },
    indicator: { control: 'inline-radio', options: ['dots', 'count', 'none'] },
    caption: { control: 'text' },
    portalContainer: { control: false },
  },
} satisfies Meta<typeof Gallery>;

export default meta;
type Story = StoryObj<typeof meta>;

const wide = (Story: () => ReactNode) => <div className="max-w-2xl">{Story()}</div>;

export const Playground: Story = {
  name: '基本',
  decorators: [wide],
  parameters: {
    docs: {
      source: sourceCode(`
        <Gallery
          items={[
            { src: '/images/mountain.png', alt: '空と山の絵', width: 1600, height: 900, caption: '山並みと空' },
            { src: '/images/sunset.png', alt: '夕焼けの海の絵', width: 1600, height: 900 },
            { src: '/images/flower.png', alt: 'ピンクの花の絵', width: 900, height: 1200 },
          ]}
        />
      `),
    },
  },
};

export const Layout: Story = {
  tags: ['visual'],
  name: '並べ方',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`columns` で列の数を決めます。入れ物が狭いとき（28rem 未満）は、3 列・4 列も 2 列にまとめます。`caption` は並びの下に出します。',
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-start gap-x-10 gap-y-8">
      <Specimen label="columns={3}（既定）＋ caption">
        <div className="w-[30rem]">
          <Gallery items={galleryImages} caption="図 4. 作品の画像" />
        </div>
      </Specimen>
      <Specimen label="columns={4}">
        <div className="w-[36rem]">
          <Gallery items={galleryImages.slice(0, 4)} columns={4} />
        </div>
      </Specimen>
      <Specimen label="columns={2}">
        <div className="w-[30rem]">
          <Gallery items={galleryImages.slice(0, 2)} columns={2} />
        </div>
      </Specimen>
      <Specimen label="狭い入れ物（columns={3} が 2 列になる）">
        <div className="w-72">
          <Gallery items={galleryImages.slice(0, 4)} />
        </div>
      </Specimen>
    </div>
  ),
};

export const Open: Story = {
  tags: ['visual'],
  name: '拡大した状態',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '拡大した状態です。下に前後のボタンと、いまの位置を出します。ここでは画面の代わりの枠の中に描いています。',
      },
    },
  },
  render: (_args, { viewMode }) => (
    <ScreenFrame>
      {(frame) => (
        <div className="w-96">
          <Gallery
            items={galleryImages}
            defaultValue={1}
            defaultOpen={openOnLoad(viewMode)}
            portalContainer={frame}
          />
        </div>
      )}
    </ScreenFrame>
  ),
};

export const Phone: Story = {
  tags: ['visual'],
  name: 'スマートフォン',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '指で操作するときも、同じ形で拡大します。左右にはじくと前後の画像へ送り、上下に引くと閉じます。端では、送るボタンを押せない見た目にします。',
      },
    },
  },
  render: (_args, { viewMode }) => (
    <div className="flex flex-wrap items-start gap-6">
      <PhoneFrame>
        {(frame) => (
          <Gallery
            items={galleryImages}
            defaultValue={2}
            defaultOpen={openOnLoad(viewMode)}
            portalContainer={frame}
          />
        )}
      </PhoneFrame>
      <PhoneFrame>
        {(frame) => (
          <Gallery
            items={galleryImages}
            defaultValue={0}
            defaultOpen={openOnLoad(viewMode)}
            portalContainer={frame}
          />
        )}
      </PhoneFrame>
    </div>
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
      hover: '[data-slot="gallery-trigger"]',
      focusVisible: '[data-slot="gallery-trigger"]',
    }),
    docs: {
      description: {
        story:
          '並べた画像も ImageZoom と同じく、マウスを載せると拡大のカーソルと右下の虫眼鏡の印を出し、キーボードで来たときはフォーカスの線と印を出します。読み込みに失敗した画像は押せません。',
      },
    },
  },
  render: () => (
    <Matrix
      rows={[{ label: 'showZoomIcon なし' }, { label: 'showZoomIcon', showZoomIcon: true }]}
      columns={stateColumns}
      columnWidth="13rem"
      rowLabel={(row) => row.label}
      renderCell={(row, column) => (
        <Gallery
          items={galleryImages
            .slice(0, 2)
            .map((image, i) => (column.failed && i === 0 ? { ...image, src: broken } : image))}
          columns={2}
          showZoomIcon={row.showZoomIcon}
        />
      )}
    />
  ),
  play: async ({ canvasElement }) => {
    const buttons = [
      ...canvasElement.querySelectorAll<HTMLButtonElement>('[data-slot="gallery-trigger"]'),
    ];
    // 失敗した画像だけが押せない
    await waitFor(() =>
      expect(buttons.map((button) => button.disabled)).toEqual([
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
      ])
    );
  },
};

export const Options: Story = {
  tags: ['visual'],
  name: '選べる形',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '左から `variant="dark"`（Dialog と同じ後ろの暗さ）、`closeButtonVariant="raised"`（白い丸の ×）です。ImageZoom と同じ props です。',
      },
    },
  },
  render: (_args, { viewMode }) => (
    <div className="flex flex-wrap items-start gap-6">
      <PhoneFrame>
        {(frame) => (
          <Gallery
            variant="dark"
            items={galleryImages}
            defaultValue={1}
            defaultOpen={openOnLoad(viewMode)}
            portalContainer={frame}
          />
        )}
      </PhoneFrame>
      <PhoneFrame>
        {(frame) => (
          <Gallery
            closeButtonVariant="raised"
            items={galleryImages}
            defaultValue={2}
            defaultOpen={openOnLoad(viewMode)}
            portalContainer={frame}
          />
        )}
      </PhoneFrame>
    </div>
  ),
};

export const ControlsPositions: Story = {
  tags: ['visual'],
  name: '前後のボタンの置き場所',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '左から `controlsPosition="bottom"`（既定。下の帯に位置と一緒にまとめる）、`"sides"`（左右の端に、画像と重ねずに置く）、`"overlay"`（白い丸のボタンを画像に重ねる）です。`sides`・`overlay` では、位置を左上に出します。最初の画像なので、前へ送るボタンは押せない見た目です。',
      },
    },
  },
  render: (_args, { viewMode }) => (
    <div className="flex flex-wrap items-start gap-6">
      {(['bottom', 'sides', 'overlay'] as const).map((position) => (
        <PhoneFrame key={position}>
          {(frame) => (
            <Gallery
              items={galleryImages}
              controlsPosition={position}
              defaultOpen={openOnLoad(viewMode)}
              portalContainer={frame}
            />
          )}
        </PhoneFrame>
      ))}
    </div>
  ),
};

export const Indicators: Story = {
  tags: ['visual'],
  name: '位置の示し方',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '左から `indicator="count"`（「3 / 6」）、`indicator="dots"` と `controlsPosition="sides"`、`indicator="none"`（出さない）です。既定の `dots`（点）は「拡大した状態」にあります。',
      },
    },
  },
  render: (_args, { viewMode }) => (
    <div className="flex flex-wrap items-start gap-6">
      <PhoneFrame>
        {(frame) => (
          <Gallery
            items={galleryImages}
            indicator="count"
            defaultValue={2}
            defaultOpen={openOnLoad(viewMode)}
            portalContainer={frame}
          />
        )}
      </PhoneFrame>
      <PhoneFrame>
        {(frame) => (
          <Gallery
            items={galleryImages}
            indicator="dots"
            controlsPosition="sides"
            defaultValue={2}
            defaultOpen={openOnLoad(viewMode)}
            portalContainer={frame}
          />
        )}
      </PhoneFrame>
      <PhoneFrame>
        {(frame) => (
          <Gallery
            items={galleryImages}
            indicator="none"
            defaultValue={2}
            defaultOpen={openOnLoad(viewMode)}
            portalContainer={frame}
          />
        )}
      </PhoneFrame>
    </div>
  ),
};

export const Loop: Story = {
  name: '最後の次を最初につなげる',
  args: { loop: true },
  decorators: [wide],
  parameters: {
    docs: {
      description: {
        story:
          '`loop` を渡すと、最後の画像の次は最初の画像、最初の前は最後の画像です。端がないので、送るボタンはいつも押せます。',
      },
    },
  },
};

export const Navigate: Story = {
  name: '送る操作と読み上げ',
  // 位置の数（3 / 6）を読んで確かめるので count で描く
  args: { indicator: 'count' },
  decorators: [wide],
  parameters: {
    docs: {
      description: {
        story:
          '前後のボタン・←→ キー・指で左右にはじく、で送ります。送ると、画像の名前と位置を読み上げで知らせます。閉じると、そのとき見ている画像へフォーカスが戻ります。',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    // 並べた画像は一覧。ボタンは画像の代わりの文のあとに「拡大する」
    await expect(canvas.getByRole('list')).toBeInTheDocument();
    const second = canvas.getByRole('button', { name: '夕焼けの海の絵 拡大する' });
    await expect(second).toHaveAttribute('aria-haspopup', 'dialog');

    await userEvent.click(second);
    // 面の名前は押した画像の alt、説明はその画像のキャプション
    const dialog = await body.findByRole('dialog', { name: '夕焼けの海の絵' });
    await expect(dialog).toHaveAccessibleDescription('夕焼けの海');
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    const counter = dialog.querySelector('[data-slot="gallery-indicator"]');
    await expect(counter).toHaveTextContent('2 / 6');
    await expect(counter).toHaveAttribute('aria-hidden', 'true');
    const live = dialog.querySelector('[aria-live="polite"]');
    // 開いたときは知らせない（面の名前と説明が読まれる）
    await expect(live).toHaveTextContent('');

    // 次へ: 名前・位置・知らせが変わる
    await userEvent.click(within(dialog).getByRole('button', { name: '次の画像' }));
    await waitFor(() => expect(dialog).toHaveAccessibleName('ピンクの花の絵'));
    await expect(counter).toHaveTextContent('3 / 6');
    await expect(live).toHaveTextContent('ピンクの花の絵、6 枚中 3 枚目');

    // ←→ キー
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(dialog).toHaveAccessibleName('夜の街の絵'));
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}');
    await waitFor(() => expect(dialog).toHaveAccessibleName('空と山の絵'));
    await expect(counter).toHaveTextContent('1 / 6');
    // 最初の画像では、前へ送るボタンは押せず、← キーでも送らない
    const prev = within(dialog).getByRole('button', { name: '前の画像' });
    await expect(prev).toBeDisabled();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(counter).toHaveTextContent('1 / 6');

    // 指で左へはじくと次へ、右へはじくと前へ。縦に引くのとは分ける
    const stage = dialog.querySelector('[data-slot="image-zoom-stage"]')!;
    const swipe = async (dx: number, dy: number) => {
      const at = (type: string, x: number, y: number) =>
        stage.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            pointerId: 9,
            pointerType: 'touch',
            isPrimary: true,
            clientX: x,
            clientY: y,
          })
        );
      at('pointerdown', 300, 200);
      for (let step = 1; step <= 4; step++) {
        at('pointermove', 300 + (dx * step) / 4, 200 + (dy * step) / 4);
      }
      await new Promise((resolve) => setTimeout(resolve, 150));
      at('pointerup', 300 + dx, 200 + dy);
    };
    await swipe(-160, 10);
    await waitFor(() => expect(counter).toHaveTextContent('2 / 6'));
    await swipe(160, -10);
    await waitFor(() => expect(counter).toHaveTextContent('1 / 6'));
    // 少しだけなら送らない
    await swipe(-20, 0);
    await expect(counter).toHaveTextContent('1 / 6');

    // 送ってから閉じると、そのとき見ている画像へフォーカスが戻る
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
    await waitFor(() => expect(counter).toHaveTextContent('4 / 6'));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: '夜の街の絵 拡大する' })).toHaveFocus()
    );
  },
};

export const Ends: Story = {
  name: '端のボタン',
  decorators: [wide],
  parameters: {
    docs: {
      description: {
        story:
          '最後の画像では、次へ送るボタンを押せない見た目にします。そのボタンにフォーカスがあったときは、前へ送るボタンへフォーカスを移します。',
      },
    },
  },
  args: { items: galleryImages.slice(0, 2) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: '空と山の絵 拡大する' }));
    const dialog = await body.findByRole('dialog', { name: '空と山の絵' });
    const next = within(dialog).getByRole('button', { name: '次の画像' });
    next.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(dialog).toHaveAccessibleName('夕焼けの海の絵'));
    await expect(next).toBeDisabled();
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: '前の画像' })).toHaveFocus()
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
  },
};

export const Single: Story = {
  name: '1 枚だけのとき',
  decorators: [wide],
  args: { items: galleryImages.slice(0, 1), columns: 2 },
  parameters: {
    docs: {
      description: {
        story: '1 枚だけのときは、送るボタンと位置を出しません。1 枚なら ImageZoom を使います。',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: '空と山の絵 拡大する' }));
    const dialog = await body.findByRole('dialog', { name: '空と山の絵' });
    await expect(dialog.querySelector('[data-slot="gallery-indicator"]')).toBeNull();
    await expect(within(dialog).queryByRole('button', { name: '次の画像' })).toBeNull();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
  },
};

export const Motions: Story = {
  name: '開閉と送る動き（押して試す）',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`motion="expand"`（既定）は押した画像の位置から広がり、送ってから閉じると、そのとき見ている画像の位置へ戻ります。`motion="fade"` は画面の中央で出ます。送るときの動きは、`slideMotion="shift"`（既定）が少し滑り、`slideMotion="slide"` が幅いっぱいに滑ります。',
      },
    },
  },
  render: () => (
    <SpecimenGallery columnWidth="20rem">
      <Specimen label='motion="expand"（既定）'>
        <Gallery items={galleryImages} />
      </Specimen>
      <Specimen label='motion="fade"'>
        <Gallery items={galleryImages} motion="fade" />
      </Specimen>
      <Specimen label='slideMotion="slide"'>
        <Gallery items={galleryImages} slideMotion="slide" />
      </Specimen>
    </SpecimenGallery>
  ),
};
