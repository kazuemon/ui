import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Breadcrumb, BreadcrumbItem } from '../../src/components/breadcrumb/Breadcrumb';

// 後半の軸 144: パンくずリストの行き先の見た目
//   --breadcrumb-link-underline（ふだんの下線）・--breadcrumb-link-underline-hover（hover の下線）
//   --breadcrumb-link-hover-color（hover の文字の色）・--breadcrumb-link-hover-bg・--breadcrumb-link-press-bg（敷く塗り）
//   --breadcrumb-link-radius・--breadcrumb-link-px・--breadcrumb-link-py（角丸と余白）
//   いまいるページ（本文の色の太字）はどの案でも同じ。行き先との差がどう見えるかを一緒に見る

const path = [
  { label: 'ホーム', href: '#home' },
  { label: '作品', href: '#works' },
  { label: 'デザインシステム', href: '#ui' },
];

function Sample() {
  return (
    <Breadcrumb>
      {path.map((page, index) => (
        <BreadcrumbItem
          key={page.label}
          href={page.href}
          current={index === path.length - 1}
          onClick={(event) => event.preventDefault()}
        >
          {page.label}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}

// 文字のリンクと同じ余白・角丸（現行版・A・B で共通）
const textShape = {
  '--breadcrumb-link-radius': 'var(--link-text-radius)',
  '--breadcrumb-link-px': 'var(--spacing)',
  '--breadcrumb-link-py': 'calc(var(--spacing) / 2)',
} as const;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '淡い下線（文字のリンクと同じ）',
    intent:
      '原則3 のまま。ふだんは文字の色を透かした淡い下線を引き、hover で下線だけが濃くなる。文字の色は変えない。押せることが、止まる前から分かる。',
    spec: [
      ['ふだん', 'グレーの文字＋淡い下線'],
      ['hover', '下線だけ濃くなる'],
      ['押下', '1px 沈む'],
    ],
    tokens: {
      ...textShape,
      '--breadcrumb-link-underline': 'var(--color-link-underline)',
      '--breadcrumb-link-underline-hover': 'var(--color-link-underline-hover)',
      '--breadcrumb-link-hover-color': 'var(--color-fg-muted)',
      '--breadcrumb-link-hover-bg': 'transparent',
      '--breadcrumb-link-press-bg': 'transparent',
    },
  },
  {
    id: 'A',
    name: '下線なし → hover で下線',
    intent:
      'ふだんは下線を引かず、hover で濃い下線が出る。行が静かになり、いまいるページの太字が目立つ。押せることは、載せるまで分からない。',
    spec: [
      ['ふだん', 'グレーの文字だけ'],
      ['hover', '濃い下線が出る'],
      ['押下', '1px 沈む'],
    ],
    tokens: {
      ...textShape,
      '--breadcrumb-link-underline': 'transparent',
      '--breadcrumb-link-underline-hover': 'var(--color-link-underline-hover)',
      '--breadcrumb-link-hover-color': 'var(--color-fg-muted)',
      '--breadcrumb-link-hover-bg': 'transparent',
      '--breadcrumb-link-press-bg': 'transparent',
    },
  },
  {
    id: 'B',
    name: '下線なし → hover で文字が濃くなる',
    intent:
      'ふだんは下線を引かず、hover で文字が本文の色まで濃くなる。線を増やさずに反応を返す。いまいるページ（本文の色の太字）と、hover 中の行き先が近い色になる。',
    spec: [
      ['ふだん', 'グレーの文字だけ'],
      ['hover', '文字が本文の色に濃くなる'],
      ['押下', '1px 沈む'],
    ],
    tokens: {
      ...textShape,
      '--breadcrumb-link-underline': 'transparent',
      '--breadcrumb-link-underline-hover': 'transparent',
      '--breadcrumb-link-hover-color': 'var(--color-fg)',
      '--breadcrumb-link-hover-bg': 'transparent',
      '--breadcrumb-link-press-bg': 'transparent',
    },
  },
  {
    id: 'C',
    name: '平らな pill（Navbar と同じ）',
    intent:
      'ページの上の帯の行き先と同じ扱い。下線を引かず、hover で文字の色を淡く敷き、押すと濃くして沈む。案内どうしの見た目がそろう代わりに、余白の分だけ行が高くなる。',
    spec: [
      ['ふだん', 'グレーの文字だけ（pill の余白）'],
      ['hover', '文字の色を 8% 敷く'],
      ['押下', '16% まで濃くして 1px 沈む'],
    ],
    tokens: {
      '--breadcrumb-link-radius': 'var(--radius-pill)',
      '--breadcrumb-link-px': 'calc(var(--spacing) * 3)',
      '--breadcrumb-link-py': 'var(--spacing)',
      '--breadcrumb-link-underline': 'transparent',
      '--breadcrumb-link-underline-hover': 'transparent',
      '--breadcrumb-link-hover-color': 'var(--color-fg-muted)',
      '--breadcrumb-link-hover-bg':
        'color-mix(in oklab, var(--color-fg) var(--flat-hover-mix), transparent)',
      '--breadcrumb-link-press-bg':
        'color-mix(in oklab, var(--color-fg) var(--flat-press-mix), transparent)',
    },
  },
];

const columns: Column[] = [
  { label: '通常', note: '3 段。右端がいまいるページ' },
  { label: 'hover', note: '2 つ目の行き先', preview: 'hover' },
  { label: '押下', note: '2 つ目の行き先', preview: 'active' },
  { label: 'フォーカス（キーボード）', note: '2 つ目の行き先', preview: 'focus' },
];

const target = 'li:nth-child(2) [data-slot="breadcrumb-link"]';

const meta = {
  title: 'Design Review/144 パンくずリストの行き先の見た目',
  id: 'design-review-144-breadcrumb-link',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      hover: [`[data-preview="hover"] ${target}`, `[data-preview="active"] ${target}`],
      active: [`[data-preview="active"] ${target}`],
      focusVisible: [`[data-preview="focus"] ${target}`],
    },
  },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={144}
      axis="パンくずリストの行き先の見た目"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={() => <Sample />}
    >
      <p>
        <strong>
          決定: 現行版（淡い下線）を既定にしました。A は{' '}
          <code>appearance=&quot;hover-underline&quot;</code>
          、C は <code>appearance=&quot;pill&quot;</code> で選べます。B は採りませんでした。
        </strong>
      </p>
      <p>
        パンくずの行き先を、文章の中の文字のリンクとして見せるか、案内の中の押すものとして見せるかを選びます。いまいるページ（右端）は、どの案でも本文の色の太字です。
      </p>
      <p>
        現行版は原則3 のまま（淡い下線）。A・B は下線を外して、hover のときだけ反応を返します。C は
        Navbar の行き先と同じ平らな pill です。
      </p>
      <p>実際にマウスを載せて、Tab でも動かして確かめられます。</p>
    </Comparison>
  ),
};
