import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Breadcrumb, BreadcrumbItem } from '../../src/components/breadcrumb/Breadcrumb';
import { CaretRightIcon } from '../../src/internal/icons';

// 後半の軸 143: パンくずリストの区切りの印
//   形は部品の separator（ReactNode）で渡す。色・大きさ・項目とのあいだは
//   --color-breadcrumb-separator・--breadcrumb-separator-size・--breadcrumb-gap

const path = [
  { label: 'ホーム', href: '#home' },
  { label: '作品', href: '#works' },
  { label: 'デザインシステム', href: '#ui' },
  { label: 'パンくずリスト', href: '#breadcrumb' },
];

// 区切りの形。行（候補）ごとに部品の props で変える
const separators: Record<string, ReactNode> = {
  現行版: '/',
  A: <CaretRightIcon />,
  B: '・',
  C: null,
  D: '/',
};

function Sample({ id, depth = 3 }: { id: string; depth?: number }) {
  const pages = path.slice(0, depth);
  return (
    <Breadcrumb separator={separators[id]}>
      {pages.map((page, index) => (
        <BreadcrumbItem
          key={page.label}
          href={page.href}
          current={index === pages.length - 1}
          onClick={(event) => event.preventDefault()}
        >
          {page.label}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '斜線',
    intent:
      'URL の区切りと同じ「/」。向きを持たない記号で、階層の深さだけを示す。周りの文字と同じ大きさ、キャプションの色。',
    spec: [
      ['形', '「/」'],
      ['色・大きさ', 'キャプションの色・周りの文字と同じ'],
      ['項目とのあいだ', '8px'],
    ],
    tokens: {
      '--color-breadcrumb-separator': 'var(--color-fg-subtle)',
      '--breadcrumb-separator-size': '1em',
      '--breadcrumb-gap': 'var(--spacing)',
    },
  },
  {
    id: 'A',
    name: '右向きの山（アイコン）',
    intent:
      '部品のアイコン（Phosphor の CaretRight）。ページをたどる向きが出る。線の太さは文字と並ぶアイコンと同じ。',
    spec: [
      ['形', '›（CaretRight）'],
      ['色・大きさ', 'キャプションの色・周りの文字と同じ'],
      ['項目とのあいだ', '8px'],
    ],
    tokens: {
      '--color-breadcrumb-separator': 'var(--color-fg-subtle)',
      '--breadcrumb-separator-size': '1em',
      '--breadcrumb-gap': 'var(--spacing)',
    },
  },
  {
    id: 'B',
    name: '中点',
    intent:
      '和文の並びに合う「・」。向きも階層も強く出さず、項目を軽く分けるだけ。日本語の見出しの並びになじむ。',
    spec: [
      ['形', '「・」'],
      ['色・大きさ', 'キャプションの色・周りの文字と同じ'],
      ['項目とのあいだ', '8px'],
    ],
    tokens: {
      '--color-breadcrumb-separator': 'var(--color-fg-subtle)',
      '--breadcrumb-separator-size': '1em',
      '--breadcrumb-gap': 'var(--spacing)',
    },
  },
  {
    id: 'C',
    name: '印なし・余白だけ',
    intent:
      '記号を置かず、あいだを広げて分ける。いちばん軽い。折り返したときに、どこまでが 1 つの項目か読みにくくならないかを見る。',
    spec: [
      ['形', 'なし'],
      ['色・大きさ', '—'],
      ['項目とのあいだ', '20px（文字どうし）'],
    ],
    tokens: {
      '--color-breadcrumb-separator': 'var(--color-fg-subtle)',
      '--breadcrumb-separator-size': '1em',
      '--breadcrumb-gap': 'calc(var(--spacing) * 3)',
    },
  },
  {
    id: 'D',
    name: '斜線を薄く小さく',
    intent:
      '現行版と同じ「/」を、3:1 の輪郭の色まで薄くし、少し小さくする。区切りを地の模様に近づけ、文字だけを読ませる。',
    spec: [
      ['形', '「/」'],
      ['色・大きさ', '輪郭の色（3:1）・0.85 倍'],
      ['項目とのあいだ', '8px'],
    ],
    tokens: {
      '--color-breadcrumb-separator': 'var(--color-line-strong)',
      '--breadcrumb-separator-size': '0.85em',
      '--breadcrumb-gap': 'var(--spacing)',
    },
  },
];

const columns: Column[] = [
  { label: '3 段', note: '通常' },
  { label: 'hover', note: '2 つ目の行き先', preview: 'hover' },
  { label: '4 段・狭いとき', note: '幅 260px で折り返す' },
];

const meta = {
  title: 'Design Review/143 パンくずリストの区切りの印',
  id: 'design-review-143-breadcrumb-separator',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      hover: ['[data-preview="hover"] li:nth-child(2) [data-slot="breadcrumb-link"]'],
    },
  },
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={143}
      axis="パンくずリストの区切りの印"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) =>
        column.label === '4 段・狭いとき' ? (
          <div className="w-[260px] border border-line p-3">
            <Sample id={candidate.id} depth={4} />
          </div>
        ) : (
          <Sample id={candidate.id} />
        )
      }
    >
      <p>
        <strong>
          決定: A（右向きの山）を既定にしました。現行版の「/」も <code>separator="slash"</code>{' '}
          で選べます（ほかの形は ReactNode を渡して差し替えられます）。
        </strong>
      </p>
      <p>
        項目のあいだに置く印の形・色・大きさを選びます。印は読み上げから外してあるので、見た目だけの話です。
      </p>
      <p>
        いちばん右の列は、狭いところで 4
        段が折り返したところです。折り返したときに、区切りの印が行の頭に落ちても読めるかを見てください。
      </p>
    </Comparison>
  ),
};
