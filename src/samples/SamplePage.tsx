import type { CSSProperties, ReactNode } from 'react';

import { Container, type ContainerSize } from '../components/container/Container';
import { Navbar, NavbarLink, NavbarLinks } from '../components/navbar/Navbar';
import { SkipLink } from '../components/skip-link/SkipLink';
import { Text } from '../components/text/Text';

// 密度の値（--text-body など）は data-density を付けた要素で決まる。トークンを上書きして比べるときに効くよう、
// ページの包みにも密度を付け直す。ツールバーが「入力方式に合わせる」なら、いまの入力方式から決める
export function densityOf(globals: Record<string, unknown>) {
  if (globals.density === 'coarse' || globals.density === 'fine') return globals.density;
  return window.matchMedia('(pointer: coarse)').matches ? 'coarse' : 'fine';
}

// 本文の幅。帯と本文の端をそろえるため、Navbar と Container に同じ size を渡す
//   sm は Container の prose の中で、さらに細い列（480px）に寄せる（設定や SNS のような 1 列の画面）
const sizes: Record<'sm' | 'md' | 'lg', ContainerSize> = {
  sm: 'prose',
  md: 'prose',
  lg: 'default',
};

export function SamplePage({
  density,
  style,
  width = 'md',
  bare = false,
  children,
}: {
  density: 'coarse' | 'fine';
  style?: CSSProperties;
  /** 本文の幅。md は記事向け（Container の prose）、sm は設定など細い画面（480px）、lg は一覧など広い画面（Container の default） */
  width?: 'sm' | 'md' | 'lg';
  /** true なら、ヘッダーとフッターを付けず、children が画面全体を作る（ドキュメントやサインインなど、独自の枠のとき） */
  bare?: boolean;
  children: ReactNode;
}) {
  if (bare) {
    return (
      <div style={style} data-density={density} className="min-h-screen bg-bg text-fg">
        {children}
      </div>
    );
  }
  const size = sizes[width];
  return (
    <div style={style} data-density={density} className="flex min-h-screen flex-col bg-bg text-fg">
      <SkipLink href="#sample-main" />
      <Navbar
        size={size}
        brand={
          <a href="#top" className="font-heading text-fg-brand no-underline">
            kazuemon
          </a>
        }
      >
        <NavbarLinks>
          <NavbarLink href="#works">Works</NavbarLink>
          <NavbarLink href="#blog">Blog</NavbarLink>
          <NavbarLink href="#about">About</NavbarLink>
        </NavbarLinks>
      </Navbar>
      <Container size={size} py="xl" render={<main id="sample-main" />} className="flex-1">
        {width === 'sm' ? <div className="mx-auto max-w-120">{children}</div> : children}
      </Container>
      <footer className="border-t border-line">
        <Container size={size} py="lg">
          <Text size="sm" variant="subtle">
            © 2026 kazuemon
          </Text>
        </Container>
      </footer>
    </div>
  );
}
