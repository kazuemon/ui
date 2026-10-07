import {
  BrowserIcon,
  DeviceMobileIcon,
  MicrophoneStageIcon,
  PaintBrushIcon,
} from '@phosphor-icons/react';
import { useEffect, useRef } from 'react';

import { Button } from '../../src/components/button/Button';
import { Navbar } from '../../src/components/navbar/Navbar';
import {
  NavigationMenu,
  NavigationMenuGroup,
  NavigationMenuItem,
  NavigationMenuLink,
} from '../../src/components/navigation-menu/NavigationMenu';
import { ScreenFrame } from '../../src/stories/story-parts';

// 軸 561〜564 で共有する見本（NavigationMenu を Navbar に置き、面を開いた姿）。軸が決まったら一緒に消す

const brand = (
  <a href="#top" className="flex items-center gap-2 text-fg no-underline">
    <span aria-hidden="true" className="size-6 rounded-lg bg-primary" />
    k6n
  </a>
);

const items = (
  <>
    <NavigationMenuItem label="Works" value="works">
      <NavigationMenuLink
        href="#web"
        icon={<BrowserIcon />}
        description="企業とイベントのサイト"
        current
      >
        Web サイト
      </NavigationMenuLink>
      <NavigationMenuLink
        href="#apps"
        icon={<DeviceMobileIcon />}
        description="iOS と Web のアプリ"
      >
        アプリ
      </NavigationMenuLink>
      <NavigationMenuLink
        href="#illustrations"
        icon={<PaintBrushIcon />}
        description="キャラクターと挿絵"
      >
        イラスト
      </NavigationMenuLink>
      <NavigationMenuLink
        href="#talks"
        icon={<MicrophoneStageIcon />}
        description="勉強会とカンファレンスの登壇"
      >
        登壇
      </NavigationMenuLink>
    </NavigationMenuItem>
    <NavigationMenuItem label="Blog" value="blog" columns={2}>
      <NavigationMenuGroup label="技術">
        <NavigationMenuLink href="#frontend" description="React・CSS・アクセシビリティ">
          フロントエンド
        </NavigationMenuLink>
        <NavigationMenuLink href="#design-system" description="この UI ライブラリの作り方">
          デザインシステム
        </NavigationMenuLink>
        <NavigationMenuLink href="#a11y" description="読み上げとキーボードの確かめ">
          アクセシビリティ
        </NavigationMenuLink>
      </NavigationMenuGroup>
      <NavigationMenuGroup label="そのほか">
        <NavigationMenuLink href="#diary" description="月に一度のふりかえり">
          日記
        </NavigationMenuLink>
        <NavigationMenuLink href="#books" description="読んだ本のメモ">
          本
        </NavigationMenuLink>
      </NavigationMenuGroup>
    </NavigationMenuItem>
    <NavigationMenuLink href="#about">About</NavigationMenuLink>
  </>
);

/** Navbar に置いた NavigationMenu。open に開く項目の value を渡すと、開いた姿で描く */
export function NavbarSample({
  open,
  height = 'h-[340px]',
}: {
  open: string | null;
  height?: string;
}) {
  return (
    <ScreenFrame height={height} width="w-[800px]">
      {(frame) => (
        <div className="-mx-6 -mt-6 w-[calc(100%+3rem)]">
          <Navbar brand={brand} actions={<Button color="primary">Contact</Button>}>
            <NavigationMenu defaultValue={open} portalContainer={frame}>
              {items}
            </NavigationMenu>
          </Navbar>
        </div>
      )}
    </ScreenFrame>
  );
}

/**
 * 開く項目を Works と Blog のあいだで自動で切り替え続ける（動きの比較）。
 * 面の大きさを滑らせる処理は開くボタンを押したときに走るので、閉じている側のボタンを押して切り替える
 */
export function SwitchingSample({ interval = 1600 }: { interval?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const id = window.setInterval(() => {
      const triggers = ref.current?.querySelectorAll<HTMLButtonElement>(
        '[data-slot="navigation-menu-trigger"]'
      );
      const next = [...(triggers ?? [])].find((t) => t.getAttribute('aria-expanded') !== 'true');
      next?.click();
    }, interval);
    return () => window.clearInterval(id);
  }, [interval]);
  return (
    <ScreenFrame height="h-[340px]" width="w-[800px]">
      {(frame) => (
        <div ref={ref} className="-mx-6 -mt-6 w-[calc(100%+3rem)]">
          <Navbar brand={brand} actions={<Button color="primary">Contact</Button>}>
            <NavigationMenu portalContainer={frame}>{items}</NavigationMenu>
          </Navbar>
        </div>
      )}
    </ScreenFrame>
  );
}
