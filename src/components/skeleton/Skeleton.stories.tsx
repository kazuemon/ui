import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent } from 'storybook/test';

import { Button } from '../button/Button';
import { Heading } from '../heading/Heading';
import { Text } from '../text/Text';
import { VisuallyHidden } from '../visually-hidden/VisuallyHidden';
import { Skeleton } from './Skeleton';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '読み込み中の場所取りです。実物と同じ形と大きさの面を先に置き、読み込んだら実物に差し替えます。',
          '',
          '- `shape` で形を選びます。`block`（既定）は画像・ボタン・入力欄の代わりの面、`text` は文字の行、`circle` は顔の画像の代わりの丸です。',
          '- `block` の幅は幅いっぱい、高さは `className`（`h-40`・`h-control` など）で決めます。`radius` は代わりに置くものの角に合わせます。ボタンと入力欄は `control`（既定）、画像とカードは `card`、タグとトグルは `pill` です。',
          '- `text` は、周りの文字の大きさと行の高さを受け継ぎます。`className` に `text-body` などを付けるか、Text の中に置きます。`lines` で行の数を決め、2 行以上のときは最後の行が短くなります。',
          '- 読み上げには出しません。包む要素に `aria-busy` を付け、読み込み中であることは VisuallyHidden の文で知らせます。',
          '- `animation` で動きを選びます。`sweep`（既定）は面ごとに縦の光の帯が通ります。`sweep-viewport` は画面を基準にした光で、カードの一覧のように同じ形の面が並ぶ場所で、1 本の光が面をまたいで横切ります。`pulse` は光を出さず、面の濃さをゆっくり明滅させます。',
          '- 動きを減らす設定では、どの動きもその場の明滅に置き換えます。',
        ].join('\n'),
      },
    },
  },
  args: {
    shape: 'block',
    radius: 'control',
    animation: 'sweep',
    lines: 1,
    className: 'h-(--spacing-control)',
  },
  argTypes: {
    shape: { control: 'inline-radio', options: ['block', 'text', 'circle'] },
    radius: { control: 'inline-radio', options: ['control', 'card', 'pill', 'none'] },
    animation: { control: 'inline-radio', options: ['sweep', 'sweep-viewport', 'pulse'] },
    lines: { control: { type: 'number', min: 1, max: 6 } },
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Shapes: Story = {
  tags: ['visual'],
  name: '形',
  parameters: { controls: { disable: true } },
  decorators: [(Story) => <Story />],
  render: () => (
    <Gallery columnWidth="16rem">
      <Specimen label="block・radius=card（画像）">
        <Skeleton radius="card" className="aspect-video" />
      </Specimen>
      <Specimen label="block・radius=control（ボタン・入力欄）">
        <Skeleton className="h-(--spacing-control)" />
      </Specimen>
      <Specimen label="block・radius=pill（タグ）">
        <Skeleton radius="pill" className="h-(--leading-caption) w-16" />
      </Specimen>
      <Specimen label="circle（顔）">
        <Skeleton shape="circle" />
      </Specimen>
      <Specimen label="text・lines=3（本文）">
        <Skeleton shape="text" lines={3} className="text-body" />
      </Specimen>
      <Specimen label="text（見出し）">
        <Skeleton shape="text" className="w-2/3 text-heading-3" />
      </Specimen>
    </Gallery>
  ),
};

// 読み込み中と読み込み後で、行の高さがそろうこと
export const MatchesText: Story = {
  tags: ['visual'],
  name: '実物との高さ',
  parameters: { controls: { disable: true } },
  render: () => (
    <DensityPair>
      <div className="grid w-[36rem] grid-cols-2 gap-6">
        <div className="flex flex-col gap-3">
          <Skeleton shape="text" className="w-1/2 text-heading-3" />
          <Skeleton shape="text" lines={3} className="text-body" />
          <Skeleton className="h-(--spacing-control) w-28" />
        </div>
        <div className="flex flex-col gap-3">
          <Heading level={3}>記事の見出し</Heading>
          <Text>
            読み込んだあとの本文です。和文と English を混ぜた文が、3
            行ほどに折り返す長さにしてあります。
          </Text>
          <Button className="self-start">続きを読む</Button>
        </div>
      </div>
    </DensityPair>
  ),
};

// 動きの一覧。止めた姿はどれも同じなので、撮らない
const animations = [
  ['sweep', '面ごとに光が通る（既定）'],
  ['sweep-viewport', '画面を基準にした光が、並んだ面をまたいで通る'],
  ['pulse', '面の濃さがゆっくり明滅する'],
] as const;

export const Animations: Story = {
  name: '動き',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`sweep` は面ごとに光が通ります。`sweep-viewport` は、並んだカードをまたいで 1 本の光が横切ります。`pulse` は光を出さず、ゆっくり明滅します。',
      },
    },
  },
  decorators: [(Story) => <Story />],
  render: () => (
    <div className="flex flex-col gap-8">
      {animations.map(([animation, label]) => (
        <section key={animation} className="flex flex-col gap-2">
          <Text size="sm" tone="subtle">
            {`animation="${animation}"・${label}`}
          </Text>
          <div aria-busy className="grid w-[36rem] grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton animation={animation} radius="card" className="aspect-video" />
                <Skeleton animation={animation} shape="text" lines={2} className="text-body" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const sections = canvasElement.querySelectorAll('section');
    const [sweep, viewport, pulse] = [...sections].map((section) =>
      section.querySelector<HTMLElement>('[data-slot="skeleton"]')!
    );
    const after = (element: HTMLElement) => getComputedStyle(element, '::after');
    await expect(after(sweep).animationName).toBe('skeleton-sweep');
    await expect(after(sweep).backgroundAttachment).toBe('scroll');
    await expect(after(viewport).animationName).toBe('skeleton-sweep-rest');
    await expect(after(viewport).backgroundAttachment).toBe('fixed');
    await expect(getComputedStyle(pulse).animationName).toBe('pulse');
    await expect(after(pulse).backgroundImage).toBe('none');
  },
};

function LoadingProfile() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="flex flex-col items-start gap-4">
      <div aria-busy={!loaded} className="flex w-72 items-center gap-3">
        {loaded ? (
          <>
            <span className="size-(--spacing-control) shrink-0 rounded-full bg-brand" />
            <Text as="span">かずえもん</Text>
          </>
        ) : (
          <>
            <VisuallyHidden>プロフィールを読み込んでいます</VisuallyHidden>
            <Skeleton shape="circle" />
            <Skeleton shape="text" className="w-32 text-body" />
          </>
        )}
      </div>
      <Button appearance="outline" onClick={() => setLoaded((value) => !value)}>
        {loaded ? '読み込み中に戻す' : '読み込みを終える'}
      </Button>
    </div>
  );
}

export const Usage: Story = {
  name: '使い方',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '読み込み中は、包む要素に `aria-busy` を付け、VisuallyHidden で「読み込んでいます」を読み上げに届けます。Skeleton そのものは読み上げに出ません。',
      },
    },
  },
  render: () => <LoadingProfile />,
  play: async ({ canvas, canvasElement }) => {
    const skeletons = canvasElement.querySelectorAll('[data-slot="skeleton"]');
    await expect(skeletons).toHaveLength(2);
    for (const skeleton of skeletons) await expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    await expect(canvasElement.querySelector('[aria-busy="true"]')).toContainElement(
      canvas.getByText('プロフィールを読み込んでいます')
    );
    await userEvent.click(canvas.getByRole('button', { name: '読み込みを終える' }));
    await expect(canvasElement.querySelector('[aria-busy="false"]')).toContainElement(
      canvas.getByText('かずえもん')
    );
  },
};

export const Accessibility: Story = {
  name: '読み上げ',
  args: { shape: 'text', lines: 3, className: 'text-body' },
  play: async ({ canvasElement }) => {
    const skeleton = canvasElement.querySelector('[data-slot="skeleton"]');
    await expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    await expect(skeleton?.children).toHaveLength(3);
  },
};
