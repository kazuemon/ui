import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { expect, fn, userEvent, waitFor } from 'storybook/test';

import { Image } from '../image/Image';
import { Thumbnails } from '../thumbnails/Thumbnails';
import { Carousel } from './Carousel';
import { screens } from './story-images';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';
import { sourceCode, statePseudo } from '../../stories/story-states';

const slides = screens.map((screen) => (
  <Image key={screen.alt} ratio={16 / 9} src={screen.src} alt={screen.alt} />
));
const thumbs = screens.map((screen) => <img key={screen.alt} src={screen.src} alt={screen.alt} />);

const meta = {
  title: 'Components/Carousel',
  component: Carousel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '横に送って 1 枚ずつ見せる並びです。作品のスクリーンショットや、記事の中の数枚の画像に使います。',
          '',
          '- 並べた子の 1 つずつが 1 枚になります。画像は `Image` に `ratio` を書いて、どの 1 枚も同じ高さにそろえます。',
          '- 指・トラックパッドの横スクロールで 1 枚ずつ止まります。枠にフォーカスしたときは ←→ で 1 枚ずつ、Home・End で最初と最後へ送ります。',
          '- 前へ・次へのボタンの置き場所は `controlsPosition` で選びます。`bottom`（既定）は枠の下の行の両端、`bottom-end` は下の行の右にまとめ、`overlay` は画像の左右の中央に重ねます。端の 1 枚では押せない見た目になります。',
          '- 位置の印は `indicator` で選びます。`dots`（点）、`count`（「3 / 5」）、`none`（出さない）です。既定は点で、`thumbnails` を渡したときは出しません。',
          '- `peek` を付けると、1 枚を少し狭くして中央に止め、両隣のスライドの端を少し見せます。既定は 1 枚を幅いっぱいに見せます。',
          '- `thumbnails` に `Thumbnails` を渡すと、小さな画像の帯で、いまの 1 枚を示して切り替えられます。Thumbnails だけで位置を示す（`indicator="none"`、既定）なら、`controlsPosition="overlay"` と組むと、下に空いた行が残りません。',
          '- `accessibleName` に、何の並びか（「作品の画面」など）を書きます。読み上げでは、いまの 1 枚が変わるたびに「3 / 5」を読みます。',
          '- いまの 1 枚は `value`・`defaultValue`・`onValueChange` で扱います（0 から数えます）。端でつながる送り方と、自動で送る動きは持ちません。',
        ].join('\n'),
      },
    },
  },
  args: {
    accessibleName: '作品の画面',
    indicator: 'dots',
    controlsPosition: 'bottom',
    peek: false,
    children: slides,
  },
  argTypes: {
    children: { control: false },
    thumbnails: { control: false },
    indicator: {
      control: 'inline-radio',
      options: ['dots', 'count', 'none'],
      table: { defaultValue: { summary: "thumbnails があれば 'none'、なければ 'dots'" } },
    },
    controlsPosition: {
      control: 'inline-radio',
      options: ['bottom', 'bottom-end', 'overlay'],
      table: { defaultValue: { summary: "'bottom'" } },
    },
    peek: { control: 'boolean' },
  },
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

const narrow = (Story: () => ReactNode) => <div className="max-w-xl">{Story()}</div>;

export const Playground: Story = {
  name: '基本',
  decorators: [narrow],
  parameters: {
    docs: {
      source: sourceCode(`
        <Carousel accessibleName="作品の画面">
          <Image ratio={16 / 9} src="/works/top.png" alt="トップページ" />
          <Image ratio={16 / 9} src="/works/list.png" alt="作品の一覧" />
          <Image ratio={16 / 9} src="/works/detail.png" alt="作品の詳細" />
        </Carousel>
      `),
    },
  },
};

// 位置の印と、前へ・次への置き場所。途中の 1 枚と、端の 1 枚（押せないボタン）
export const Variants: Story = {
  tags: ['visual'],
  name: '位置の印と置き場所',
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="16rem">
      <Specimen label="dots・bottom（最初の 1 枚）">
        <Carousel accessibleName="作品の画面">{slides}</Carousel>
      </Specimen>
      <Specimen label="count・bottom（途中の 1 枚）">
        <Carousel accessibleName="作品の画面" indicator="count" defaultValue={2}>
          {slides}
        </Carousel>
      </Specimen>
      <Specimen label="none・bottom（最後の 1 枚）">
        <Carousel accessibleName="作品の画面" indicator="none" defaultValue={4}>
          {slides}
        </Carousel>
      </Specimen>
      <Specimen label="dots・bottom-end（途中の 1 枚）">
        <Carousel accessibleName="作品の画面" controlsPosition="bottom-end" defaultValue={2}>
          {slides}
        </Carousel>
      </Specimen>
      <Specimen label="dots・overlay（途中の 1 枚）">
        <Carousel accessibleName="作品の画面" controlsPosition="overlay" defaultValue={2}>
          {slides}
        </Carousel>
      </Specimen>
      <Specimen label="none・overlay（最初の 1 枚）">
        <Carousel accessibleName="作品の画面" controlsPosition="overlay" indicator="none">
          {slides}
        </Carousel>
      </Specimen>
      <Specimen label="peek（途中の 1 枚）">
        <Carousel accessibleName="作品の画面" peek defaultValue={2}>
          {slides}
        </Carousel>
      </Specimen>
    </Gallery>
  ),
  play: async ({ canvasElement }) => {
    const carousels = [...canvasElement.querySelectorAll<HTMLElement>('[data-slot="carousel"]')];
    const current = (carousel: HTMLElement) =>
      carousel
        .querySelector('[data-slot="carousel-slide"][data-current]')
        ?.getAttribute('aria-label');
    await waitFor(() =>
      expect(carousels.map(current)).toEqual([
        '1 / 5',
        '3 / 5',
        '5 / 5',
        '3 / 5',
        '3 / 5',
        '1 / 5',
        '3 / 5',
      ])
    );
    // はじめの 1 枚（defaultValue）の位置まで、滑らせずに送ってある
    const viewport = carousels[1].querySelector<HTMLElement>('[data-slot="carousel-viewport"]')!;
    const slide = carousels[1].querySelectorAll<HTMLElement>('[data-slot="carousel-slide"]')[2];
    await waitFor(() => expect(Math.abs(viewport.scrollLeft - slide.offsetLeft)).toBeLessThan(1));
    // peek は、いまの 1 枚を枠の中央に止め、両隣の端を見せる
    const peekViewport = carousels[6].querySelector<HTMLElement>(
      '[data-slot="carousel-viewport"]'
    )!;
    const peekSlide = carousels[6].querySelector<HTMLElement>(
      '[data-slot="carousel-slide"][data-current]'
    )!;
    const offCenter = () => {
      const v = peekViewport.getBoundingClientRect();
      const c = peekSlide.getBoundingClientRect();
      return Math.abs(c.left - v.left - (v.right - c.right));
    };
    await waitFor(() => expect(offCenter()).toBeLessThan(1));
    await expect(peekSlide.offsetWidth).toBeLessThan(peekViewport.clientWidth * 0.9);
  },
};

export const WithThumbnails: Story = {
  tags: ['visual'],
  name: 'Thumbnails と組む',
  decorators: [narrow],
  args: {
    thumbnails: <Thumbnails>{thumbs}</Thumbnails>,
    indicator: undefined,
    controlsPosition: 'overlay',
  },
  parameters: {
    docs: {
      source: sourceCode(`
        <Carousel
          accessibleName="作品の画面"
          controlsPosition="overlay"
          thumbnails={
            <Thumbnails>
              <img src="/works/top.png" alt="トップページ" />
              <img src="/works/list.png" alt="作品の一覧" />
              <img src="/works/detail.png" alt="作品の詳細" />
            </Thumbnails>
          }
        >
          <Image ratio={16 / 9} src="/works/top.png" alt="トップページ" />
          <Image ratio={16 / 9} src="/works/list.png" alt="作品の一覧" />
          <Image ratio={16 / 9} src="/works/detail.png" alt="作品の詳細" />
        </Carousel>
      `),
    },
  },
  play: async ({ canvas, canvasElement }) => {
    // Thumbnails を押すと Carousel が送る。Thumbnails のタブはスライドを指す
    const tab = canvas.getByRole('tab', { name: '作品の詳細' });
    await expect(tab).toHaveAttribute('aria-controls');
    await userEvent.click(tab);
    await waitFor(() => expect(tab).toHaveAttribute('aria-selected', 'true'));
    const slide = canvasElement.querySelector(`#${CSS.escape(tab.getAttribute('aria-controls')!)}`);
    await waitFor(() => expect(slide).toHaveAttribute('data-current'));
    await expect(slide).toHaveAttribute('role', 'tabpanel');
    // 次へを押すと、Thumbnails の選んでいる 1 つも移る
    await userEvent.click(canvas.getByRole('button', { name: '次のスライド' }));
    await waitFor(() =>
      expect(canvas.getByRole('tab', { name: 'ブログの一覧' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    );
    // Thumbnails を組んだときは、位置の印を出さない（既定）。overlay と組むと、下の行も残らない
    await expect(canvasElement.querySelector('[data-slot="carousel-dots"]')).toBeNull();
    await expect(canvasElement.querySelector('[data-slot="carousel-controls"]')).toBeNull();
    // 撮る前に、はじめの 1 枚に戻し、フォーカスを外す
    const first = canvas.getByRole('tab', { name: 'トップページ' });
    await userEvent.click(first);
    await waitFor(() => expect(first).toHaveAttribute('aria-selected', 'true'));
    // 枠が最初の 1 枚の位置まで戻ってから撮る
    const viewport = canvasElement.querySelector<HTMLElement>('[data-slot="carousel-viewport"]')!;
    await waitFor(() => expect(viewport.scrollLeft).toBeLessThan(1));
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  },
};

// キーボードで止まったとき（枠）と、前へ・次へのボタン
export const Focus: Story = {
  tags: ['visual'],
  name: 'フォーカス',
  parameters: {
    controls: { disable: true },
    pseudo: statePseudo({
      focusVisible: '[data-slot="carousel-viewport"]',
    }),
  },
  render: () => (
    <Gallery columnWidth="22rem">
      <Specimen label="枠（bottom）">
        <div data-preview="focus">
          <Carousel accessibleName="作品の画面">{slides}</Carousel>
        </div>
      </Specimen>
      <Specimen label="枠（overlay）">
        <div data-preview="focus">
          <Carousel accessibleName="作品の画面" controlsPosition="overlay" defaultValue={1}>
            {slides}
          </Carousel>
        </div>
      </Specimen>
    </Gallery>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: { controls: { disable: true } },
  render: () => (
    <DensityPair>
      <div className="w-80">
        <Carousel accessibleName="作品の画面" defaultValue={1}>
          {slides}
        </Carousel>
      </div>
    </DensityPair>
  ),
};

export const Keyboard: Story = {
  name: 'キーボード',
  decorators: [narrow],
  args: { onValueChange: fn() },
  play: async ({ args, canvas, canvasElement }) => {
    const viewport = canvasElement.querySelector<HTMLElement>('[data-slot="carousel-viewport"]')!;
    const live = canvasElement.querySelector('[aria-live="polite"]')!;
    viewport.focus();
    await waitFor(() => expect(viewport).toHaveFocus());
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(live).toHaveTextContent('2 / 5'));
    await expect(args.onValueChange).toHaveBeenCalledWith(1);
    await userEvent.keyboard('{End}');
    await waitFor(() => expect(live).toHaveTextContent('5 / 5'));
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: '次のスライド' })).toBeDisabled()
    );
    // 送った 1 枚の位置まで、枠がスクロールしている
    const last = canvasElement.querySelectorAll<HTMLElement>('[data-slot="carousel-slide"]')[4];
    await waitFor(() =>
      expect(
        Math.abs(viewport.scrollLeft - (viewport.scrollWidth - viewport.clientWidth))
      ).toBeLessThan(1)
    );
    await waitFor(() => expect(last).toHaveAttribute('data-current'));
    await userEvent.keyboard('{Home}');
    await waitFor(() => expect(live).toHaveTextContent('1 / 5'));
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: '前のスライド' })).toBeDisabled()
    );
    await waitFor(() => expect(viewport.scrollLeft).toBeLessThan(1));
  },
};

export const Buttons: Story = {
  name: '前へ・次へ',
  decorators: [narrow],
  args: { onValueChange: fn() },
  play: async ({ args, canvas }) => {
    const prev = canvas.getByRole('button', { name: '前のスライド' });
    const next = canvas.getByRole('button', { name: '次のスライド' });
    await expect(prev).toBeDisabled();
    for (let i = 1; i <= 4; i += 1) {
      await userEvent.click(next);
      await waitFor(() => expect(args.onValueChange).toHaveBeenLastCalledWith(i));
    }
    // 最後の 1 枚で次へが押せなくなったら、フォーカスは前へに移る（ページの先頭に戻らない）
    await waitFor(() => expect(next).toBeDisabled());
    await waitFor(() => expect(prev).toHaveFocus());
  },
};

// 指やトラックパッドで横にスクロールしたときも、いまの 1 枚が変わる
export const Scroll: Story = {
  name: 'スクロールで送る',
  decorators: [narrow],
  args: { onValueChange: fn() },
  play: async ({ args, canvasElement }) => {
    const viewport = canvasElement.querySelector<HTMLElement>('[data-slot="carousel-viewport"]')!;
    const third = canvasElement.querySelectorAll<HTMLElement>('[data-slot="carousel-slide"]')[2];
    // ホイールで動かした合図のあとに、位置を変える（使う人が動かしたときだけ知らせる）
    viewport.dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaX: third.offsetLeft }));
    viewport.scrollTo({ left: third.offsetLeft, behavior: 'instant' });
    await waitFor(() => expect(args.onValueChange).toHaveBeenLastCalledWith(2));
    await waitFor(() => expect(third).toHaveAttribute('data-current'));
  },
};

export const Accessibility: Story = {
  name: '読み上げ',
  decorators: [narrow],
  play: async ({ canvas, canvasElement }) => {
    const region = canvas.getByRole('region', { name: '作品の画面' });
    await expect(region).toHaveAttribute('aria-roledescription', 'カルーセル');
    const groups = canvas.getAllByRole('group');
    await expect(groups.map((group) => group.getAttribute('aria-label'))).toEqual([
      '1 / 5',
      '2 / 5',
      '3 / 5',
      '4 / 5',
      '5 / 5',
    ]);
    await expect(groups[0]).toHaveAttribute('aria-roledescription', 'スライド');
    // 位置の点は読み上げに出さない（知らせの箱が「1 / 5」を読む）
    await expect(canvasElement.querySelector('[data-slot="carousel-dots"]')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
    const viewportId = canvasElement.querySelector('[data-slot="carousel-viewport"]')!.id;
    await expect(canvas.getByRole('button', { name: '次のスライド' })).toHaveAttribute(
      'aria-controls',
      viewportId
    );
  },
};
