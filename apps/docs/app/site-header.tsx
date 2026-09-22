// サイトの上の帯。ページをまたいで同じものを出す（部品を並べるだけで、見た目は書かない）
//   行き先（はじめに・見本・GitHub）は帯が狭いと右のメニューに畳み、Storybook だけ帯に残す
import { Link, Navbar, NavbarLink, Text } from '@kazuemon/ui';
import NextLink from 'next/link';

const STORYBOOK = 'https://story.ui.k6n.jp/';
const REPOSITORY = 'https://github.com/kazuemon/ui';

export function SiteHeader({ current }: { current: 'home' | 'examples' }) {
  return (
    <Navbar
      sticky
      size="wide"
      menuSide="right"
      brand={<Text as="span">@kazuemon/ui</Text>}
      // 移動するものは Link で作る（Button の render は非推奨）。href・target は Link の props で渡す
      // 渡した要素（render）に書くと、サーバーコンポーネントからは部品が読めず、hydration でずれます
      actions={
        <Link variant="button" color="primary" href={STORYBOOK} target="_blank">
          Storybook
        </Link>
      }
    >
      <NavbarLink render={<NextLink href="/" />} current={current === 'home'}>
        はじめに
      </NavbarLink>
      <NavbarLink render={<NextLink href="/examples" />} current={current === 'examples'}>
        見本
      </NavbarLink>
      {/* 外のサイトなので別のタブで開く（NavbarLink の props は a にそのまま渡ります） */}
      <NavbarLink href={REPOSITORY} target="_blank" rel="noreferrer">
        GitHub
      </NavbarLink>
    </Navbar>
  );
}
