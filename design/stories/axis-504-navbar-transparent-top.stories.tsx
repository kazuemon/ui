import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Navbar, NavbarLink } from '../../src/components/navbar/Navbar';
import { Text } from '../../src/components/text/Text';
import { landscape, night, sunset } from '../../src/samples/images';

// 軸 504: Navbar をいちばん上では透かす（stickyBackdrop="transparent-until-scroll"）ときの、文字の読みやすさ
const meta = {
  title: 'Design Review/504 いちばん上で透ける帯',
  id: 'design-review-504-navbar-transparent-top',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      hover: ['[data-preview="hover"] [data-slot="navbar-link"][href="#Works"]'],
    },
  },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D', 'E'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const white = 'oklch(1 0 0)';
const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'いつも白い面',
    intent: 'stickyBackdrop="solid"。いちばん上でも白い面と細い線',
    spec: [['いちばん上', '白い面・細い線']],
  },
  {
    id: 'A',
    name: '透かすだけ',
    intent:
      '面と線を消し、文字は本文の色のまま。明るい画像の上では読めるが、暗い画像では使う側が色を合わせる必要がある',
    spec: [
      ['面', 'なし'],
      ['文字', '本文の色'],
    ],
    tokens: {
      '--navbar-top-bg': 'transparent',
      '--navbar-top-scrim': 'none',
      '--navbar-top-blur': '0px',
      '--navbar-top-fg': 'var(--color-fg)',
      '--navbar-top-fg-muted': 'var(--color-fg-muted)',
      '--navbar-top-text-shadow': 'none',
    },
  },
  {
    id: 'B',
    name: '白い幕',
    intent:
      '上は白く濃く、下へ向けて透ける幕を敷く。文字は本文の色のまま。たいていの画像で読め、画像の上端は少し白っぽくなる',
    spec: [
      ['面', '白 85% → 透明（上から下へ）'],
      ['文字', '本文の色'],
    ],
    tokens: {
      '--navbar-top-bg': 'transparent',
      '--navbar-top-scrim':
        'linear-gradient(to bottom, color-mix(in oklab, var(--color-bg) 85%, transparent), transparent)',
      '--navbar-top-blur': '0px',
      '--navbar-top-fg': 'var(--color-fg)',
      '--navbar-top-fg-muted': 'var(--color-fg-muted)',
      '--navbar-top-text-shadow': 'none',
    },
  },
  {
    id: 'C',
    name: '暗い幕と白い文字',
    intent:
      '上は暗く、下へ向けて透ける幕を敷き、文字を白くする。写真の見出しの上で読みやすく、明るい画像では上端が暗くなる',
    spec: [
      ['面', '黒 45% → 透明（上から下へ）'],
      ['文字', '白（淡い文字は白 80%）'],
    ],
    tokens: {
      '--navbar-top-bg': 'transparent',
      '--navbar-top-scrim': 'linear-gradient(to bottom, oklch(0 0 0 / 0.45), transparent)',
      '--navbar-top-blur': '0px',
      '--navbar-top-fg': white,
      '--navbar-top-fg-muted': 'oklch(1 0 0 / 0.8)',
      '--navbar-top-text-shadow': 'none',
    },
  },
  {
    id: 'D',
    name: '淡いすりガラス',
    intent:
      '白を 40% だけ敷き、後ろを 12px ぼかす（blur の面より薄い）。画像の色は透けて見え、文字は本文の色のまま',
    spec: [
      ['面', '白 40%・後ろを 12px ぼかす'],
      ['文字', '本文の色'],
    ],
    tokens: {
      '--navbar-top-bg': 'color-mix(in oklab, var(--color-bg) 40%, transparent)',
      '--navbar-top-scrim': 'none',
      '--navbar-top-blur': 'calc(var(--spacing) * 3)',
      '--navbar-top-fg': 'var(--color-fg)',
      '--navbar-top-fg-muted': 'var(--color-fg-muted)',
      '--navbar-top-text-shadow': 'none',
    },
  },
  {
    id: 'E',
    name: '白い文字と影',
    intent:
      '面は敷かず、文字を白くして、文字の後ろに淡い影を落とす。画像をいちばん素のまま見せ、白い背景では読めない',
    spec: [
      ['面', 'なし'],
      ['文字', '白・黒 40% の淡い影'],
    ],
    tokens: {
      '--navbar-top-bg': 'transparent',
      '--navbar-top-scrim': 'none',
      '--navbar-top-blur': '0px',
      '--navbar-top-fg': white,
      '--navbar-top-fg-muted': 'oklch(1 0 0 / 0.85)',
      '--navbar-top-text-shadow': '0 1px 3px oklch(0 0 0 / 0.4)',
    },
  },
];

const columns: Column[] = [
  { label: '明るい画像', note: 'いちばん上' },
  { label: '中間の色の画像', note: 'いちばん上' },
  { label: '暗い画像', note: 'いちばん上' },
  { label: '行き先に hover', note: '暗い画像・Works', preview: 'hover' },
  { label: 'スクロールしたあと', note: '不透明な面に戻る（枠の中をスクロールして試せます）' },
];

const pages = ['Works', 'Blog', 'About'];
const heroes = { light: landscape, middle: sunset, dark: night };

function Hero({
  transparent,
  image,
  scrolled,
}: {
  transparent: boolean;
  image: string;
  scrolled: boolean;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrolled && scroller.current) scroller.current.scrollTop = 240;
  }, [scrolled]);
  return (
    <div
      ref={scroller}
      style={{ width: 800 }}
      className="h-[260px] overflow-auto border border-line"
    >
      <Navbar
        sticky
        stickyBackdrop={transparent ? 'transparent-until-scroll' : 'solid'}
        className="-mb-(--navbar-height)"
        brand={<span>k6n</span>}
        actions={<Button variant="outline">Contact</Button>}
      >
        {pages.map((page) => (
          <NavbarLink
            key={page}
            href={`#${page}`}
            current={page === 'Blog'}
            onClick={(event) => event.preventDefault()}
          >
            {page}
          </NavbarLink>
        ))}
      </Navbar>
      {/* 見出しの画像は帯の下から始める（帯を画像に重ねる） */}
      <img src={image} alt="" className="block h-[300px] w-full object-cover" />
      <div className="flex flex-col gap-4 p-6">
        {Array.from({ length: 6 }, (_, i) => (
          <Text key={i} variant="muted">
            画像の下に続く本文です。スクロールすると帯が不透明な面に戻ります。
          </Text>
        ))}
      </div>
    </div>
  );
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={504}
      axis="いちばん上で透ける帯"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <Hero
          transparent={candidate.id !== '現行版'}
          image={
            column.label === '明るい画像'
              ? heroes.light
              : column.label === '中間の色の画像'
                ? heroes.middle
                : heroes.dark
          }
          scrolled={column.label === 'スクロールしたあと'}
        />
      )}
    >
      <p>
        Navbar の stickyBackdrop に transparent-until-scroll
        を足しました。いちばん上では面と境目を消して、見出しの画像を帯の後ろまで見せます。少しでもスクロールすると、solid
        と同じ白い面と境目（stickyEdge）に 200ms
        で移ります。帯を画像に重ねるには、帯の下の余白を使う側で詰めます（見本では className
        で帯の高さぶん詰めています）。
      </p>
      <p>
        選ぶのは、透けているあいだの文字の読みやすさの守り方です。画像は利用者が選ぶので、明るい・中間・暗いの
        3 つで比べます。
      </p>
    </Comparison>
  ),
};
