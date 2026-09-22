import type { CSSProperties, ReactNode } from 'react';

import { Link } from '../components/link/Link';
import { Text } from '../components/text/Text';

// 密度の値（--text-body など）は data-density を付けた要素で決まる。トークンを上書きして比べるときに効くよう、
// ページの包みにも密度を付け直す。ツールバーが「入力方式に合わせる」なら、いまの入力方式から決める
export function densityOf(globals: Record<string, unknown>) {
  if (globals.density === 'coarse' || globals.density === 'fine') return globals.density;
  return window.matchMedia('(pointer: coarse)').matches ? 'coarse' : 'fine';
}

export function SamplePage({
  density,
  style,
  width = 'md',
  bare = false,
  children,
}: {
  density: 'coarse' | 'fine';
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
      <div style={style} data-density={density} className="min-h-screen bg-bg text-fg">
        {children}
      </div>
    );
  }
  return (
    <div style={style} data-density={density} className="min-h-screen bg-bg text-fg">
      <header className="border-b border-line">
        <div className={`mx-auto flex ${max} items-center justify-between gap-4 px-5 py-3`}>
          <Text as="span" className="font-heading text-fg-brand">
            kazuemon
          </Text>
          <nav className="flex gap-4">
            <Link href="#works">Works</Link>
            <Link href="#blog">Blog</Link>
            <Link href="#about">About</Link>
          </nav>
        </div>
      </header>
      <main className={`mx-auto ${max} px-5 py-10`}>{children}</main>
      <footer className="border-t border-line">
        <div className={`mx-auto ${max} px-5 py-6`}>
          <Text size="sm" variant="subtle">
            © 2026 kazuemon
          </Text>
        </div>
      </footer>
    </div>
  );
}
