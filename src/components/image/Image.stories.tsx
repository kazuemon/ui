import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, ReactNode } from 'react';
import { expect, waitFor } from 'storybook/test';

import { Heading } from '../heading/Heading';
import { Tag } from '../tag/Tag';
import { Text } from '../text/Text';
import { Image } from './Image';
import { Gallery, Specimen } from '../../stories/story-parts';

// 見本の画像（外に取りに行かない）
const svg = (body: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">${body}</svg>`)}`;
const landscape = svg(
  '<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc4f8"/><stop offset="1" stop-color="#cfeafc"/></linearGradient></defs><rect width="640" height="360" fill="url(#s)"/><circle cx="520" cy="90" r="36" fill="#fff4cc"/><path d="M0 250 L130 140 L230 230 L360 110 L480 220 L580 150 L640 200 L640 360 L0 360Z" fill="#9fb3cf"/><path d="M0 300 L120 250 L240 300 L380 240 L520 310 L640 270 L640 360 L0 360Z" fill="#2f6b58"/>'
);
// 縦長の画像（寸法を書く・書かないで、枠の取り方が変わる見本）
const portrait = `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 480" width="360" height="480"><rect width="360" height="480" fill="#cfeafc"/><circle cx="180" cy="170" r="70" fill="#fff4cc"/><path d="M0 380 L120 300 L240 360 L360 290 L360 480 L0 480Z" fill="#2f6b58"/></svg>')}`;
// 読み込めない画像（壊れたデータ）
const broken = 'data:image/png;base64,AAAA';
// landscape を 16×9 px に縮めた仮画像（ぼかして敷く）
const landscapeTiny =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAIAAAC0SDtlAAAA0UlEQVR42mNoOPqDJMTQefIHQbTn9hMggrAZJp37gRVNPvMNiCDsj+8vAhGEzTD70k8QuvBtzonXUDaYO3fHNSACMoDcRVe+AdHsc5+BbIal134uvvhl/s5r8zefX3TiJZC75Mo3CBeEdl4DcoGCCw49hChgWHXp4/ytF6HSm88vO/F84a7rcC4QAbnIIgwLtl6cuOpAQlcPEAEZEFEgI7KtxbYkLb1/8ox1x+GqgeIMQY21+tkRcATketeWIouY5ccDteVNnuVSkQfkMiDLEYMAA9EatvHG6TMAAAAASUVORK5CYII=';

// Next.js の Image の代わり。src などを受け取り、渡された className を img に付ける
function FrameworkImage(props: ComponentProps<'img'> & { src: string; alt: string }) {
  return <img data-framework-image="" loading="lazy" decoding="async" {...props} />;
}

const meta = {
  title: 'Components/Image',
  component: Image,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '画像です。読み込むまでは同じ場所に読み込み中の面を置き、読み込んだら画像を出します。キャプションを付けるときは Figure を使います。',
          '',
          '- 枠は読み込む前から幅いっぱいに取ります。`ratio`（`16 / 9` など）を書くと、その比の枠に収め、はみ出た分を切ります。`width`・`height` を書くと、その比の枠を取ります。',
          '- `ratio` も `width`・`height` もないときは、16:9 の画像だと仮定して、読み込み中と失敗したときは 16:9 の枠を取ります。読み込めたら、画像本来の比の高さに変わります。このとき下の内容が動くので、動かしたくないときは `width`・`height` か `ratio` を書きます。',
          '- `fit` は枠への収め方です。`cover`（既定）ははみ出た分を切り、`contain` は切らずに収めて余白を残します。',
          '- `src` を書かずにおくと、読み込み中の面を出します。画像の URL をまだ読み込んでいるあいだに使います。',
          '- 読み込みに失敗したときは、面の上に破れた画像のアイコンと「読み込みに失敗しました」を出します。文は `errorText` で変えられます。',
          '- `radius` は角です。`card`（既定）はカードの角、`nested` は入れ子のカードの内側の角、`none` はカードの端まで届かせる画像です。',
          '- 細い輪郭は既定で付きます。白っぽい画像が白地に溶けないようにするためです。外すときは `hideOutline` を渡します。',
          '- `placeholder` に小さな画像の URL（数十 px の縮小版や data URL）か要素を渡すと、読み込み中の面の代わりに、それをぼかして敷きます。読み込めたら本物にすぐ替わります。',
          '- `placeholderBlur` は仮画像のぼかしの強さです。`sm`（既定）・`md`・`lg` の順に強くなり、`none` はぼかしません。BlurHash のように、はじめからぼやけた仮画像は `none` にします。',
          '- `fallbackSrc` を渡すと、`src` が読み込めなかったときに一度だけその画像に替えます。それも読み込めなかったときは、失敗の面を出します。',
          '- Next.js の `Image` は `render` に渡します。',
        ].join('\n'),
      },
    },
  },
  args: { src: landscape, alt: '空と山の絵', radius: 'card' },
  argTypes: {
    src: { control: false },
    ratio: { control: 'inline-radio', options: [undefined, '16 / 9', '4 / 3', '1'] },
    radius: { control: 'inline-radio', options: ['card', 'nested', 'none'] },
    fit: {
      control: 'inline-radio',
      options: ['cover', 'contain'],
      table: { defaultValue: { summary: "'cover'" } },
    },
    hideOutline: { control: 'boolean' },
  },
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

const narrow = (Story: () => ReactNode) => <div className="max-w-md">{Story()}</div>;

export const Playground: Story = {
  name: '基本',
  decorators: [narrow],
};

export const States: Story = {
  tags: ['visual'],
  name: '読み込み中・読み込み後・失敗',
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="16rem">
      <Specimen label="読み込み中（src なし）">
        <Image ratio={16 / 9} alt="空と山の絵" />
      </Specimen>
      <Specimen label="読み込み後">
        <Image ratio={16 / 9} src={landscape} alt="空と山の絵" />
      </Specimen>
      <Specimen label="失敗">
        <Image ratio={16 / 9} src={broken} alt="空と山の絵" />
      </Specimen>
      <Specimen label="失敗（errorText を変える）">
        <Image ratio={16 / 9} src={broken} alt="空と山の絵" errorText="画像を表示できません" />
      </Specimen>
    </Gallery>
  ),
  play: async ({ canvasElement }) => {
    const frames = [...canvasElement.querySelectorAll('[data-slot="image"]')];
    await waitFor(() =>
      expect(frames.map((frame) => frame.getAttribute('data-status'))).toEqual([
        'loading',
        'loaded',
        'error',
        'error',
      ])
    );
  },
};

// 枠の取り方。縦長の画像で、寸法なし（読み込めたら本来の比）・width と height（その比）・ratio（切り取って埋める）
export const Sizing: Story = {
  tags: ['visual'],
  name: '枠の取り方',
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="12rem">
      <Specimen label="寸法なし（読み込めたら本来の比）">
        <Image src={portrait} alt="縦長の絵" />
      </Specimen>
      <Specimen label="width・height（その比）">
        <Image width={360} height={480} src={portrait} alt="縦長の絵" />
      </Specimen>
      <Specimen label="ratio={1}（切り取る）">
        <Image ratio={1} src={portrait} alt="縦長の絵" />
      </Specimen>
      <Specimen label="寸法なし・読み込み中（16:9）">
        <Image alt="縦長の絵" />
      </Specimen>
      <Specimen label="寸法なし・失敗（16:9）">
        <Image src={broken} alt="縦長の絵" />
      </Specimen>
    </Gallery>
  ),
  play: async ({ canvasElement }) => {
    const frames = [...canvasElement.querySelectorAll<HTMLElement>('[data-slot="image"]')];
    await waitFor(() => expect(frames[0]).toHaveAttribute('data-status', 'loaded'));
    await waitFor(() => expect(frames[4]).toHaveAttribute('data-status', 'error'));
    const ratioOf = (frame: HTMLElement) => frame.offsetWidth / frame.offsetHeight;
    await expect(ratioOf(frames[0])).toBeCloseTo(360 / 480, 1);
    await expect(ratioOf(frames[1])).toBeCloseTo(360 / 480, 1);
    await expect(ratioOf(frames[2])).toBeCloseTo(1, 1);
    for (const frame of frames.slice(3)) await expect(ratioOf(frame)).toBeCloseTo(16 / 9, 1);
    // 寸法なしの画像は、読み込めたら枠いっぱいに重ねず、画像の高さで枠を広げる
    await expect(getComputedStyle(frames[0].querySelector('img')!).position).toBe('relative');
  },
};

// カードの画像。標準の型は端まで届かせ（radius="none"）、入れ子の型は内側に収めて同心の角にする
export const InCards: Story = {
  tags: ['visual'],
  name: 'カードの中',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-[repeat(2,18rem)] gap-6">
      {(['none', 'nested'] as const).map((radius) => (
        <article
          key={radius}
          className="flex flex-col overflow-hidden rounded-card border border-line bg-surface"
        >
          <div className={radius === 'nested' ? 'p-(--card-nested-inset) pb-0' : undefined}>
            <Image ratio="var(--card-media-aspect)" radius={radius} src={landscape} alt="" />
          </div>
          <div className="flex flex-col gap-2 p-4">
            <Heading level={3} size="md">
              {radius === 'none' ? '標準の型' : '入れ子の型'}
            </Heading>
            <Text size="sm" variant="subtle">
              2026.09.18
            </Text>
            <div className="flex gap-1">
              <Tag>デザイン</Tag>
            </div>
          </div>
        </article>
      ))}
    </div>
  ),
};

export const FrameworkImages: Story = {
  name: 'フレームワークの画像',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`render` に Next.js の `Image` などを渡すと、その要素に画像の見た目を重ねます。`src`・`alt`・`width` などは渡す要素に書きます（例: `render={<NextImage src={photo} alt="空と山" />}`）。',
      },
    },
  },
  render: () => (
    <Image ratio={16 / 9} render={<FrameworkImage src={landscape} alt="空と山の絵" />} />
  ),
  play: async ({ canvas }) => {
    const image = canvas.getByRole('img', { name: '空と山の絵' });
    await expect(image).toHaveAttribute('data-framework-image');
    await expect(image.className).toContain('rounded-(--image-radius)');
    await waitFor(() =>
      expect(image.closest('[data-slot="image"]')).toHaveAttribute('data-status', 'loaded')
    );
  },
};

export const Accessibility: Story = {
  name: '読み上げ',
  args: { src: broken },
  decorators: [narrow],
  play: async ({ canvas, canvasElement }) => {
    const frame = canvasElement.querySelector('[data-slot="image"]');
    await waitFor(() => expect(frame).toHaveAttribute('data-status', 'error'));
    // 失敗しても、画像は alt の文で読まれ、そのあとに失敗の文が読まれる。アイコンは読み上げに出さない
    const image = canvas.getByRole('img', { name: '空と山の絵' });
    const message = canvas.getByText('読み込みに失敗しました');
    await expect(message.closest('[aria-hidden]')).toBeNull();
    await expect(
      image.compareDocumentPosition(message) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    await expect(frame?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  },
};

export const Fit: Story = {
  name: '収め方',
  render: () => (
    <div className="flex w-48 flex-col gap-4">
      <Image ratio={1} src={portrait} alt="切り取る" />
      <Image ratio={1} fit="contain" src={portrait} alt="収める" />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByAltText('切り取る')).objectFit).toBe('cover');
    await expect(getComputedStyle(canvas.getByAltText('収める')).objectFit).toBe('contain');
  },
};

export const PlaceholderAndFallback: Story = {
  name: '仮画像・代わりの画像',
  decorators: [narrow],
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6">
      <Specimen label="読み込み中（仮画像）">
        <Image alt="読み込み中の絵" placeholder={landscapeTiny} />
      </Specimen>
      <Specimen label="読み込めない src と、代わりの画像">
        <Image src={broken} fallbackSrc={landscape} alt="空と山の絵" ratio="16 / 9" />
      </Specimen>
      <Specimen label="代わりの画像も読み込めない">
        <Image src={broken} fallbackSrc={broken} alt="壊れた絵" ratio="16 / 9" />
      </Specimen>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const frames = [...canvasElement.querySelectorAll('[data-slot="image"]')];
    await expect(frames[0]).toHaveAttribute('data-status', 'loading');
    await expect(frames[0]).toHaveAttribute('data-placeholder');
    await waitFor(() => expect(frames[1]).toHaveAttribute('data-status', 'loaded'));
    await expect(frames[1].querySelector('img')).toHaveAttribute('src', landscape);
    await waitFor(() => expect(frames[2]).toHaveAttribute('data-status', 'error'));
  },
};

export const PlaceholderBlur: Story = {
  name: '仮画像のぼかしの強さ',
  tags: ['visual'],
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="16rem">
      {(['none', 'sm', 'md', 'lg'] as const).map((blur) => (
        <Specimen key={blur} label={blur === 'sm' ? 'sm（既定）' : blur}>
          <Image
            alt="読み込み中の絵"
            ratio="16 / 9"
            placeholder={landscapeTiny}
            placeholderBlur={blur}
          />
        </Specimen>
      ))}
    </Gallery>
  ),
};
