import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { expect, waitFor } from 'storybook/test';

import { Card, CardBody, CardImage } from '../card/Card';
import { Heading } from '../heading/Heading';
import { Text } from '../text/Text';
import { Masonry } from './Masonry';
import { labelClass } from '../../stories/story-states';

// 見本の画像。縦横の比率をそろえず作る（外のネットワークに頼らない。Image.stories.tsx と同じ data URL の作り方）
const photo = (w: number, h: number, fill: string, accent: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">` +
      `<rect width="${w}" height="${h}" fill="${fill}"/>` +
      `<circle cx="${w * 0.28}" cy="${h * 0.26}" r="${Math.min(w, h) * 0.16}" fill="${accent}"/>` +
      '</svg>'
  )}`;

const works = [
  { title: '春の高台から', date: '2026.03.02', w: 640, h: 420, fill: '#cfeafc', accent: '#7cc4f8' },
  { title: '路地裏の光', date: '2026.02.18', w: 480, h: 640, fill: '#fce9d8', accent: '#f2b378' },
  { title: '朝の水面', date: '2026.02.03', w: 640, h: 480, fill: '#dff3ea', accent: '#6fc39a' },
  {
    title: '記録：とある一日',
    date: '2026.01.22',
    w: 480,
    h: 720,
    fill: '#f6e6f4',
    accent: '#d98fce',
  },
  { title: '街の音', date: '2026.01.10', w: 640, h: 360, fill: '#fdeada', accent: '#f0a35c' },
  { title: '窓辺', date: '2025.12.28', w: 480, h: 480, fill: '#e6ecfb', accent: '#7f96e0' },
  { title: '遠くの山', date: '2025.12.14', w: 640, h: 400, fill: '#eaf6d9', accent: '#94c25a' },
  {
    title: '手のひらの上で',
    date: '2025.11.30',
    w: 480,
    h: 600,
    fill: '#fde3e3',
    accent: '#e77e7e',
  },
  { title: '夜の看板', date: '2025.11.09', w: 640, h: 480, fill: '#e3f0fb', accent: '#5aa0e0' },
] as const;

const meta = {
  title: 'Components/Masonry',
  component: Masonry,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '縦横の比率が違う画像やカードを、隙間なく列に積んで並べる部品です。作品の一覧やブログの見出し画像のように、高さがそろわないカードを並べるときに使います。',
          '',
          '- 中身は問いません。`Card`・`Image`・`ImageZoom` など、好きな部品を子に置けます。',
          '- `minColumnWidth` は列の最小の幅（px）です。入れ物の幅をこの値で割った数だけ列になります（既定 240）。`columns` を渡すと、入れ物の幅によらず列の数を固定します。',
          '- `gap` は子の間隔です（`Stack` の `gap` と同じ段）。既定は `md` です。',
          '- 並びは、渡した順のまま「1 行目を左から右へ、埋まったら次の行へ」詰まります。タブで送る順・読み上げの順も、この見た目の順と同じです。',
          '- 子の高さを測ってから積むので、スクリプトが動く前（サーバーで描いた直後）は、ふつうのグリッドとして並びます。動いたあとに、隙間なく積み直します。',
        ].join('\n'),
      },
    },
  },
  args: { gap: 'md', minColumnWidth: 240 },
  argTypes: {
    gap: {
      control: 'inline-radio',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
      table: { defaultValue: { summary: "'md'" } },
    },
    minColumnWidth: { control: 'number', table: { defaultValue: { summary: '240' } } },
    columns: { control: 'number' },
    render: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof Masonry>;

export default meta;
type Story = StoryObj<typeof meta>;

// 積み終わる（data-measured）まで待つ。ResizeObserver の測定は非同期で、1 ページに複数置くと終わる時点がずれるので、
// 全部の Masonry を確かめる。visual のストーリーはこれを play に置く
async function waitMeasured(canvasElement: HTMLElement) {
  await waitFor(async () => {
    const roots = canvasElement.querySelectorAll('[data-slot="masonry"]');
    await expect(roots.length).toBeGreaterThan(0);
    for (const root of roots) {
      await expect(root).toHaveAttribute('data-measured');
    }
  });
}

export const Playground: Story = {
  name: '基本',
  render: (args) => (
    <Masonry {...args}>
      {works.map((work) => (
        <Card key={work.title}>
          <CardImage
            src={photo(work.w, work.h, work.fill, work.accent)}
            alt=""
            ratio={work.w / work.h}
            width={work.w}
            height={work.h}
          />
          <CardBody>
            <Text size="sm" variant="subtle">
              {work.date}
            </Text>
            <Heading level={3} size={4}>
              {work.title}
            </Heading>
          </CardBody>
        </Card>
      ))}
    </Masonry>
  ),
};

// 高さの違うブロック。間隔・列の幅の見本に使う（画像の読み込みを待たず、確かめを速くする）
// Masonry の子は、渡した順のまま直接の children にする（<Blocks /> のような 1 つの部品にまとめて渡すと、
// Masonry は展開前の 1 個の要素としてしか数えられない）
const heights = [64, 120, 88, 156, 72, 108, 140, 96, 60] as const;

function Block({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center rounded-control bg-neutral p-2 text-center">
      <Text size="sm">{children}</Text>
    </div>
  );
}

function blocks(n: number) {
  return heights.slice(0, n).map((h, i) => (
    <div key={i} style={{ height: h }}>
      <Block>{i + 1}</Block>
    </div>
  ));
}

export const Gaps: Story = {
  tags: ['visual'],
  name: '間隔',
  parameters: {
    controls: { disable: true },
    // 4 段 × 9 個ぶんの高さがある。撮る枠を高くする（既定は 1200×900。visual-testing.md）
    viewport: {
      defaultViewport: 'tall',
      viewports: { tall: { name: 'tall', styles: { width: '1200px', height: '1700px' } } },
    },
  },
  render: () => (
    <div className="flex flex-col gap-8">
      {(['none', 'sm', 'md', 'lg'] as const).map((gap) => (
        <div key={gap} className="flex flex-col gap-2">
          <span className={labelClass}>gap=&quot;{gap}&quot;</span>
          <div className="w-96">
            <Masonry gap={gap} columns={3}>
              {blocks(9)}
            </Masonry>
          </div>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitMeasured(canvasElement);
  },
};

export const ColumnWidth: Story = {
  tags: ['visual'],
  name: '幅ごとの列数',
  parameters: {
    controls: { disable: true },
    // 1 列（幅 420px）の段が縦に長い。撮る枠を高くする（既定は 1200×900。visual-testing.md）
    viewport: {
      defaultViewport: 'tall',
      viewports: { tall: { name: 'tall', styles: { width: '1200px', height: '1600px' } } },
    },
  },
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <span className={labelClass}>入れ物の幅 720px（既定の列の最小幅 240 → 3 列）</span>
        <div style={{ width: 720 }}>
          <Masonry gap="sm">{blocks(6)}</Masonry>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className={labelClass}>入れ物の幅 420px（既定の列の最小幅 240 → 1 列）</span>
        <div style={{ width: 420 }}>
          <Masonry gap="sm">{blocks(6)}</Masonry>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className={labelClass}>columns={3}（入れ物の幅によらず 3 列に固定）</span>
        <div className="w-64">
          <Masonry gap="sm" columns={3}>
            {blocks(9)}
          </Masonry>
        </div>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitMeasured(canvasElement);
  },
};

// 並び順の確かめ: DOM の順（タブ順・読み上げ順）が、渡した順のまま保たれているか
export const Accessibility: Story = {
  name: '読み上げ',
  render: () => (
    <div className="w-96">
      <Masonry gap="sm" columns={3} data-testid="masonry">
        {blocks(9)}
      </Masonry>
    </div>
  ),
  play: async ({ canvasElement, canvas }) => {
    await waitMeasured(canvasElement);
    const root = canvas.getByTestId('masonry');
    const items = root.querySelectorAll('[data-slot="masonry-item"]');
    await expect(items).toHaveLength(9);
    // DOM の順は、渡した順のまま（1〜9）。CSS が見た目の列に振り分けても、タブ順・読み上げ順は変わらない
    for (const [i, item] of items.entries()) {
      await expect(item.textContent).toBe(String(i + 1));
    }
  },
};

export const Props: Story = {
  name: 'props',
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="w-64">
        <Masonry data-testid="fixed" columns={2} minColumnWidth={999}>
          {blocks(4)}
        </Masonry>
      </div>
      <div className="w-64">
        <Masonry data-testid="default-gap">{blocks(2)}</Masonry>
      </div>
    </div>
  ),
  play: async ({ canvasElement, canvas }) => {
    await waitMeasured(canvasElement);
    const fixed = canvas.getByTestId('fixed');
    // columns を渡すと、minColumnWidth を無視して列数を固定する
    await expect(getComputedStyle(fixed).gridTemplateColumns.split(' ')).toHaveLength(2);
    const defaultGap = canvas.getByTestId('default-gap');
    // 既定の gap は Stack と同じ md（16px）。測ったあとは行の間隔を 0 にして子の下に含めるので、列の間隔で確かめる
    await expect(getComputedStyle(defaultGap).columnGap).toBe('16px');
  },
};
