'use client';

import {
  Container,
  type ContainerSize,
  Navbar,
  NavbarLink,
  NavbarLinks,
  SkipLink,
  Text,
} from '@kazuemon/ui';
import type { CSSProperties, ReactNode } from 'react';

import type { Site } from './sites';
import type { Density } from './types';

// 密度の値（--text-body など）は data-density を付けた要素で決まるので、ページの包みに付け直す。
// Storybook ではツールバーで選ぶ値を、ここでは切替画面で選ぶ値を受け取る。
// auto のときは付けない（付けないと、入力方式（pointer: coarse）で決まる — src/styles/theme.css）

// 本文の幅は Container の size で決める。sm は prose の中で、さらに細い列（480px）に寄せる（設定や SNS のような 1 列の画面）
const sizes: Record<'sm' | 'md' | 'lg' | 'full', ContainerSize> = {
  sm: 'prose',
  md: 'prose',
  lg: 'default',
  full: 'full',
};

export function SamplePage({
  density,
  site,
  current,
  style,
  width = 'md',
  bare = false,
  children,
}: {
  density: Density;
  /** 架空のサイト。ヘッダーの名前とメニュー、フッターの名前になる（bare のときは使わない） */
  site?: Site;
  /** メニューのうち、いまいるページ（label） */
  current?: string;
  style?: CSSProperties;
  /** 本文の幅。md は記事向け（Container の prose）、sm は設定など細い画面（480px）、lg は一覧など広い画面（Container の default）、full はボードなど画面いっぱいに使うアプリ */
  width?: 'sm' | 'md' | 'lg' | 'full';
  /** true なら、ヘッダーとフッターを付けず、children が画面全体を作る（ドキュメントやサインインなど、独自の枠のとき） */
  bare?: boolean;
  children: ReactNode;
}) {
  // full は帯・本文・フッターを同じ Container（full）で包み、左右の端を帯とそろえる
  const full = width === 'full';
  const copyright = (
    <Text size="sm" variant="subtle">
      © 2026 {site?.name}
    </Text>
  );
  if (bare) {
    return (
      <div
        style={style}
        data-density={density === 'auto' ? undefined : density}
        className="min-h-screen bg-bg text-fg"
      >
        {children}
      </div>
    );
  }
  return (
    <div
      style={style}
      data-density={density === 'auto' ? undefined : density}
      className="flex min-h-screen flex-col bg-bg text-fg"
    >
      <SkipLink href="#sample-main" />
      {/* 帯はライブラリの Navbar（実際のドキュメントサイトと同じ部品）。中身の幅は見本の本文とそろえず、
      帯そのものの既定の広さで出す（実際のサイトの上の帯も、本文より広いことが多いため）
      menuSide は auto（指で操作していて狭い画面はシート）ではなく right に固定。実サイトの SiteHeader と同じ */}
      <Navbar
        sticky
        size={full ? 'full' : 'wide'}
        menuSide="right"
        brand={<Text as="span">{site?.name}</Text>}
      >
        {/* 行き先がないときは置かない（置くと、狭い帯で空のメニューのボタンが出る） */}
        {site && site.nav.length > 0 && (
          <NavbarLinks>
            {site.nav.map(({ label, href }) => (
              <NavbarLink key={href} href={href} current={label === current}>
                {label}
              </NavbarLink>
            ))}
          </NavbarLinks>
        )}
      </Navbar>
      <Container size={sizes[width]} py="xl" render={<main id="sample-main" />} className="flex-1">
        {width === 'sm' ? <div className="mx-auto max-w-120">{children}</div> : children}
      </Container>
      <footer className="border-t border-line">
        <Container size={sizes[width]} py="lg">
          {copyright}
        </Container>
      </footer>
    </div>
  );
}
