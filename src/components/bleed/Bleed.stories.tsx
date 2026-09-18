import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { Bleed } from './Bleed';
import { Container } from '../container/Container';
import { ScreenOf } from '../container/story-page';
import { Figure } from '../figure/Figure';
import { Prose } from '../prose/Prose';
import { sourceCode } from '../../stories/story-states';

// 見本の画像（外に取りに行かない）
const landscape = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc4f8"/><stop offset="1" stop-color="#cfeafc"/></linearGradient></defs><rect width="640" height="360" fill="url(#s)"/><circle cx="520" cy="90" r="36" fill="#fff4cc"/><path d="M0 250 L130 140 L230 230 L360 110 L480 220 L580 150 L640 200 L640 360 L0 360Z" fill="#9fb3cf"/><path d="M0 300 L120 250 L240 300 L380 240 L520 310 L640 270 L640 360 L0 360Z" fill="#2f6b58"/></svg>'
)}`;

const meta = {
  title: 'Components/Bleed',
  component: Bleed,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '画像やコードを、本文の幅の外へ広げる枠です。Container の左右の余白いっぱいまで、左右に同じだけ広がります。記事の中で、大きく見せたい画像に使います。',
          '',
          '- Container の中の本文に置きます。Prose の中では、段落と同じ並びに置きます（Prose の直下）。',
          '- 本文の幅いっぱいの要素の直下に置きます。リストの中や、左右に余白のある要素の中では、広がる幅が合いません。',
          '- 画面が Container の幅の上限より狭いとき（スマートフォンなど）は、Container の左右の余白いっぱい、つまり画面の端まで広がります。広い画面では、本文の幅の 1/18（`prose` で約 37px）ずつ左右に広がります。',
          '- 見た目（色・線・角）は持たず、中の画像やコードの見た目はそのままです。`render` で描く要素を変えられます（既定は `div`）。',
        ].join('\n'),
      },
    },
  },
} satisfies Meta<typeof Bleed>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 記事の見本。グレーが Container の左右の余白 */
function Article() {
  return (
    <div className="py-6">
      <Container size="prose" className="bg-neutral">
        <Prose className="bg-bg">
          <p>
            記事の本文は、1
            行の字数を抑えて読みやすくします。画像を大きく見せたいときは、本文の幅の外へ広げます。
          </p>
          <Bleed>
            <Figure
              src={landscape}
              alt="空と山の絵"
              caption="図 1. 左右の余白いっぱいまで広げた画像"
            />
          </Bleed>
          <p>本文の幅のままの画像と比べると、広げた分だけ大きく見えます。</p>
          <Figure src={landscape} alt="空と山の絵" caption="図 2. 本文の幅の画像" />
        </Prose>
      </Container>
    </div>
  );
}

export const Playground: Story = {
  name: '基本',
  parameters: {
    docs: {
      source: sourceCode(`
        <Container size="prose" render={<main />}>
          <Prose>
            <p>…</p>
            <Bleed>
              <Figure src="/photo.jpg" alt="…" caption="…" />
            </Bleed>
          </Prose>
        </Container>
      `),
    },
  },
  render: () => <Article />,
};

// 画面の幅ごと。縮めて並べる。グレーが Container の左右の余白
// 狭い画面では余白いっぱい（画面の端まで）。広い画面では本文の幅の 1/18 だけ広がり、余白の端までは届かない
export const Screens: Story = {
  tags: ['visual'],
  name: '画面の幅',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-start gap-6 p-6">
      <div data-density="coarse">
        <ScreenOf width={390} height={760} scale={0.6}>
          <Article />
        </ScreenOf>
      </div>
      <div data-density="fine">
        <ScreenOf width={1280} height={760} scale={0.45}>
          <Article />
        </ScreenOf>
      </div>
    </div>
  ),
};

// props の確かめ: Prose の中で、Container の余白の端まで広がる（Container が幅の上限より狭いとき）
export const FillsGutter: Story = {
  name: '余白の端まで広がる',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6">
      {[320, 390, 600, 1000].map((width) => (
        <div key={width} style={{ width }} data-width={width}>
          <Container size={width === 1000 ? 'full' : 'prose'} className="bg-neutral">
            <Prose className="bg-bg">
              <p>本文</p>
              <Bleed>
                <div className="h-4 bg-primary" />
              </Bleed>
            </Prose>
          </Container>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cases = canvasElement.querySelectorAll<HTMLElement>('[data-width]');
    await waitFor(() => expect(cases.length).toBe(4));
    for (const box of cases) {
      const container = box
        .querySelector<HTMLElement>('[data-slot="container"]')!
        .getBoundingClientRect();
      const bleed = box.querySelector<HTMLElement>('[data-slot="bleed"]')!.getBoundingClientRect();
      await expect(Math.abs(bleed.left - container.left)).toBeLessThan(0.5);
      await expect(Math.abs(bleed.right - container.right)).toBeLessThan(0.5);
    }
  },
};

// render で要素を変えられる
export const Render: Story = {
  name: '描く要素',
  render: () => (
    <Container size="prose">
      <Bleed render={<section />}>本文の外へ広げる</Bleed>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('[data-slot="bleed"]');
    await expect(el?.tagName).toBe('SECTION');
  },
};
