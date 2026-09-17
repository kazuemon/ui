import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { expect } from 'storybook/test';

import { Figure } from './Figure';
import { DensityPair } from '../../stories/story-parts';

// 見本の画像（外に取りに行かない）
const svg = (body: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">${body}</svg>`)}`;
const landscape = svg(
  '<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc4f8"/><stop offset="1" stop-color="#cfeafc"/></linearGradient></defs><rect width="640" height="360" fill="url(#s)"/><circle cx="520" cy="90" r="36" fill="#fff4cc"/><path d="M0 250 L130 140 L230 230 L360 110 L480 220 L580 150 L640 200 L640 360 L0 360Z" fill="#9fb3cf"/><path d="M0 300 L120 250 L240 300 L380 240 L520 310 L640 270 L640 360 L0 360Z" fill="#2f6b58"/>'
);
const whiteScreen = svg(
  '<rect width="640" height="360" fill="#ffffff"/><rect x="48" y="48" width="200" height="20" rx="6" fill="#eef0f1"/><rect x="48" y="96" width="544" height="10" rx="5" fill="#eef0f1"/><rect x="48" y="120" width="440" height="10" rx="5" fill="#eef0f1"/><rect x="48" y="176" width="260" height="130" rx="12" fill="#f4f5f6"/><rect x="332" y="176" width="260" height="130" rx="12" fill="#f4f5f6"/>'
);

// Next.js の Image の代わり。src などを受け取り、渡された className を img に付ける
function FrameworkImage(props: ComponentProps<'img'> & { src: string; alt: string }) {
  return <img data-framework-image="" loading="lazy" decoding="async" {...props} />;
}

const meta = {
  title: 'Components/Figure',
  component: Figure,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '記事の中の画像と、そのキャプションです。',
          '',
          '- 画像は幅いっぱいまで広がり、はみ出しません。角はカードと同じ角です。',
          '- `outline`（既定は `true`）で細い輪郭を付けます。白っぽい画像が白地に溶けないようにするためです。写真のように縁がはっきりした画像では `false` にできます。',
          '- `caption` は画像の下の中央に小さく出します。`alt` と同じ文にはしません。',
        ].join('\n'),
      },
    },
  },
  args: { src: landscape, alt: '空と山の絵', caption: '図 1. 空と山', outline: true },
  argTypes: {
    src: { control: false },
    caption: { control: 'text' },
    outline: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div data-reading className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Figure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Outline: Story = {
  tags: ['visual'],
  name: '輪郭と密度',
  parameters: { controls: { disable: true } },
  decorators: [(Story) => <Story />],
  render: () => (
    <DensityPair>
      <div data-reading className="flex w-[20rem] flex-col gap-6">
        <Figure src={whiteScreen} alt="白っぽい画面の絵" caption="輪郭あり（既定）" />
        <Figure
          src={whiteScreen}
          alt="白っぽい画面の絵"
          caption="outline={false}"
          outline={false}
        />
        <Figure src={landscape} alt="空と山の絵" />
      </div>
    </DensityPair>
  ),
};

export const FrameworkImages: Story = {
  name: 'フレームワークの画像',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: [
          '`render` に Next.js の `Image` などを渡すと、その要素に Figure の画像の見た目を重ねます。`src`・`alt`・`width` などは渡す要素に書きます（例: `render={<Image src={photo} alt="空と山" />}`）。',
          '',
          'Astro の `<Image />` は React の中に置けないので、`getImage()` で作った値を Figure に渡します（例: `<Figure src={image.src} srcSet={image.srcSet.attribute} {...image.attributes} alt="空と山" />`）。',
        ].join('\n'),
      },
    },
  },
  render: () => (
    <Figure render={<FrameworkImage src={landscape} alt="空と山の絵" />} caption="図 1. 空と山" />
  ),
  play: async ({ canvas }) => {
    const image = canvas.getByRole('img', { name: '空と山の絵' });
    await expect(image).toHaveAttribute('data-framework-image');
    await expect(image.className).toContain('rounded-card');
    await expect(image.closest('figure')).toContainElement(canvas.getByText('図 1. 空と山'));
  },
};

export const Accessibility: Story = {
  name: '読み上げ',
  play: async ({ canvas }) => {
    const image = canvas.getByRole('img', { name: '空と山の絵' });
    await expect(image.closest('figure')).toContainElement(canvas.getByText('図 1. 空と山'));
  },
};
