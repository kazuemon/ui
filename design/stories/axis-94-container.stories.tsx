import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import type { ContainerSize } from '../../src/components/container/Container';
import {
  SamplePage as GuidedPage,
  ScreenOf,
  SiteSamplePage,
} from '../../src/components/container/story-page';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 94: ページの幅と左右の余白（Container）
// 変えるのは --container-* だけ。全案（現行版を含む）で軸の値を明示する

const px = (n: number) => `calc(var(--spacing) * ${n / 4})`;

function widths(prose: number, main: number, wide: number) {
  return {
    '--container-width-prose': px(prose),
    '--container-width-default': px(main),
    '--container-width-wide': px(wide),
  };
}

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '680・1040・1280／マウス 24・指 16',
    intent:
      '読みものは本文 16px で 1 行 42 字前後。余白はマウスで 24px、画面の狭い指で 16px に詰める。',
    spec: [
      ['幅（prose・default・wide）', '680・1040・1280px'],
      ['左右の余白', 'マウス 24px・指 16px'],
    ],
    tokens: {
      ...widths(680, 1040, 1280),
      '--container-gutter-fine': px(24),
      '--container-gutter-coarse': px(16),
    },
  },
  {
    id: 'A',
    name: '640・960・1200',
    intent: '幅を一段狭くする。読みものは 1 行 40 字。余白は現行版と同じ。',
    spec: [
      ['幅（prose・default・wide）', '640・960・1200px'],
      ['左右の余白', 'マウス 24px・指 16px'],
    ],
    tokens: {
      ...widths(640, 960, 1200),
      '--container-gutter-fine': px(24),
      '--container-gutter-coarse': px(16),
    },
  },
  {
    id: 'B',
    name: '720・1040・1280／どちらも 20',
    intent: 'いまの見本のページ（720px・左右 20px）に合わせる。余白は入力方式で変えない。',
    spec: [
      ['幅（prose・default・wide）', '720・1040・1280px'],
      ['左右の余白', 'どちらも 20px'],
    ],
    tokens: {
      ...widths(720, 1040, 1280),
      '--container-gutter-fine': px(20),
      '--container-gutter-coarse': px(20),
    },
  },
  {
    id: 'C',
    name: '余白を画面の幅に比例',
    intent:
      '余白を置いた場所の幅の 5%（16〜48px）にする。スマートフォン（390px）では約 20px、タブレット（768px）では約 38px、デスクトップでは 48px。入力方式では変えない。',
    spec: [
      ['幅（prose・default・wide）', '680・1040・1280px'],
      ['左右の余白', '幅の 5%（16〜48px）'],
    ],
    tokens: {
      ...widths(680, 1040, 1280),
      '--container-gutter-fine': `clamp(${px(16)}, 5%, ${px(48)})`,
      '--container-gutter-coarse': `clamp(${px(16)}, 5%, ${px(48)})`,
    },
  },
  {
    id: 'D',
    name: '余白を広く',
    intent: '「余白は多い」に寄せて、マウスで 40px、指で 24px 空ける。',
    spec: [
      ['幅（prose・default・wide）', '680・1040・1280px'],
      ['左右の余白', 'マウス 40px・指 24px'],
    ],
    tokens: {
      ...widths(680, 1040, 1280),
      '--container-gutter-fine': px(40),
      '--container-gutter-coarse': px(24),
    },
  },
  {
    id: 'E',
    name: 'Tailwind の段にそろえ、余白を画面の幅に比例',
    intent:
      '幅を Tailwind の max-w-2xl・5xl・7xl と同じ値にする。prose は本文 16px でちょうど 1 行 42 字（42em）。余白は C と同じく置いた場所の幅の 5%（16〜48px）で、入力方式では変えない。',
    spec: [
      ['幅（prose・default・wide）', '672・1024・1280px'],
      ['左右の余白', '幅の 5%（16〜48px）'],
    ],
    tokens: {
      ...widths(672, 1024, 1280),
      '--container-gutter-fine': `clamp(${px(16)}, 5%, ${px(48)})`,
      '--container-gutter-coarse': `clamp(${px(16)}, 5%, ${px(48)})`,
    },
  },
];

const screens = [
  { label: 'スマートフォン', width: 390, scale: 0.6 },
  { label: 'タブレット', width: 768, scale: 0.5 },
  { label: 'デスクトップ', width: 1280, scale: 0.4 },
] as const;

const columns: Column[] = screens.map((screen) => ({
  label: screen.label,
  note: `${screen.width}px を縮めて表示`,
}));

function Cell({ width, scale, tokens }: { width: number; scale: number; tokens?: CSSProperties }) {
  return (
    <ScreenOf width={width} height={900} scale={scale} style={tokens}>
      <GuidedPage guides />
    </ScreenOf>
  );
}

interface ComparisonArgs {
  pick: string;
  /** 見本のページで当てる版（SamplePage だけ） */
  version?: string;
  /** 見本のページの Container の幅（SamplePage だけ）。mixed は記事を prose、ほかを default */
  size?: ContainerSize | 'mixed';
  /** 余白をグレー、中身の幅を破線で見せる（SamplePage だけ） */
  guides?: boolean;
}

const meta = {
  title: 'Design Review/94 ページの幅と左右の余白（Container）',
  id: 'design-review-94-container',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'E' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D', 'E'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={94}
      axis="ページの幅と左右の余白（Container）"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const screen = screens.find((s) => s.label === column.label);
        return (
          screen && <Cell width={screen.width} scale={screen.scale} tokens={candidate.tokens} />
        );
      }}
    >
      <p>
        決定: E（672・1024・1280px、余白は置いた場所の幅の 5%・16〜48px）。余白を 1
        つの値に畳んだので、 ほかの版の余白は E と同じに描かれます（ADR はあとで書く）。
      </p>
      <p>
        ページの本文の幅の段（prose・default・wide）と、左右の余白を選びます。見本のページは、ヘッダーとフッターと作品のカードが
        default、記事の文が prose です。グレーの部分が左右の余白、破線の内側が中身の幅です。
      </p>
      <p>
        見どころは、記事の 1 行の長さ（原則11:
        読みものは読みやすさを優先）、スマートフォンで端に寄りすぎないか、デスクトップで default と
        prose
        の差が大きすぎないか、です。余白はツールバーの「密度」で、マウスと指を切り替えて比べられます。
      </p>
      <p>「X を既定にして、Y を選べるようにする」形でも選べます（例: 余白の比例を選べる）。</p>
    </Comparison>
  ),
};

// 見本のページを、ブラウザの幅いっぱいに描く。Controls の「version」で版（現行版・A〜E）を切り替え、ページの根に候補のトークンを当てる
// 密度はツールバーの「密度」で切り替わる
export const SamplePage: Story = {
  name: '見本のページ',
  args: { version: 'E', size: 'mixed', guides: false },
  argTypes: {
    pick: { table: { disable: true } },
    version: {
      description: '当てる版',
      control: 'inline-radio',
      options: candidates.map((candidate) => candidate.id),
    },
    size: {
      description: 'Container の幅。mixed は記事を prose、ほかを default',
      control: 'inline-radio',
      options: ['mixed', 'prose', 'default', 'wide'],
    },
    guides: { description: '余白をグレー、中身の幅を破線で見せる', control: 'boolean' },
  },
  render: ({ version, size, guides }) => {
    const candidate = candidates.find((c) => c.id === version) ?? candidates[0];
    return (
      <div style={candidate.tokens}>
        <SiteSamplePage size={size === 'mixed' ? undefined : size} guides={guides} />
      </div>
    );
  },
};
