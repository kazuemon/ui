'use client';

import { Navbar, NavbarLink, Text } from '@kazuemon/ui';
import type { CSSProperties, ReactNode } from 'react';

import type { Site } from './sites';
import type { Density } from './types';

// 密度の値（--text-body など）は data-density を付けた要素で決まるので、ページの包みに付け直す。
// Storybook ではツールバーで選ぶ値を、ここでは切替画面で選ぶ値を受け取る。
// auto のときは付けない（付けないと、入力方式（pointer: coarse）で決まる — src/styles/theme.css）

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
  /** 本文の幅。md は記事向け（720px）、sm は設定など細い画面（480px）、lg は一覧など広い画面 */
  width?: 'sm' | 'md' | 'lg';
  /** true なら、ヘッダーとフッターを付けず、children が画面全体を作る（ドキュメントやサインインなど、独自の枠のとき） */
  bare?: boolean;
  children: ReactNode;
}) {
  const max = { sm: 'max-w-[480px]', md: 'max-w-[720px]', lg: 'max-w-[1080px]' }[width];
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
      className="min-h-screen bg-bg text-fg"
    >
      {/* 帯はライブラリの Navbar（実際のドキュメントサイトと同じ部品）。中身の幅は見本の本文とそろえず、
      帯そのものの既定の広さで出す（実際のサイトの上の帯も、本文より広いことが多いため）
      menuSide は auto（指で操作していて狭い画面はシート）ではなく right に固定。実サイトの SiteHeader と同じ */}
      <Navbar sticky size="wide" menuSide="right" brand={<Text as="span">{site?.name}</Text>}>
        {site?.nav.map(({ label, href }) => (
          <NavbarLink key={href} href={href} current={label === current}>
            {label}
          </NavbarLink>
        ))}
      </Navbar>
      <main className={`mx-auto ${max} px-5 py-10`}>{children}</main>
      <footer className="border-t border-line">
        <div className={`mx-auto ${max} px-5 py-6`}>
          <Text size="sm" variant="subtle">
            © 2026 {site?.name}
          </Text>
        </div>
      </footer>
    </div>
  );
}
