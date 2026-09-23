'use client';

import {
  type ComponentProps,
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { ListIcon } from '../../internal/icons';
import { useMergedRefs } from '../../internal/use-merged-refs';
import { Button } from '../button/Button';
import {
  type SidebarMotion,
  type SidebarPlacement,
  SidebarLayoutContext,
  useSidebarLayout,
} from './sidebar-context';
import { layout } from './sidebar-styles';

// 列のあるページの骨組み — 軸 303（置き方）・304（狭い画面）・305（開閉の動き）
//   置き方: below は Header が動かず、その下で列と本文が並ぶ（既定）。full は列が上から下まで通り、Header は本文の側に入る
//   置かれた面の幅が 48rem より狭いと、列をやめて Drawer にする。Navbar と同じく、画面ではなく面の幅で決める（コンテナ）

// 列を出す幅（rem）。これより狭いと Drawer にする。Navbar の畳む幅と同じ
const WIDE_REM = 48;

export interface SidebarLayoutProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** 列（Sidebar） */
  sidebar: ReactNode;
  /** 帯（Navbar など）。開閉のボタン（SidebarTrigger）は、ここに置けます。なくてもかまいません */
  header?: ReactNode;
  /** 本文。長いときは、ここだけスクロールします */
  children?: ReactNode;
  /**
   * 列の置き方。below は帯を動かさず、その下で列と本文を並べます。full は列を上から下まで通し、帯は本文の側に入れます
   * @default 'below'
   */
  placement?: SidebarPlacement;
  /**
   * 広い画面で、列を畳んでいるか（制御）。畳むと、アイコンだけが残ります
   */
  collapsed?: boolean;
  /**
   * 広い画面で、はじめに列を畳んでいるか（非制御）
   * @default false
   */
  defaultCollapsed?: boolean;
  /** 畳む・開くが変わるときに、次の値を渡して呼びます */
  onCollapsedChange?: (collapsed: boolean) => void;
  /**
   * 列を畳む・開くときの動き。smooth は列の幅が滑らかに変わり、none はすぐ切り替わります。動きを減らす設定のときは、どちらもすぐ切り替わります
   * @default 'smooth'
   */
  motion?: SidebarMotion;
  /** いちばん外の要素に付きます。高さは、置く場所で決めます（親の高さいっぱいに広がります） */
  className?: string;
}

/**
 * 列（Sidebar）と本文を横に並べるページの骨組み。開閉の状態を持ち、置かれた面が狭いときは列を Drawer に切り替えます
 */
export function SidebarLayout({
  sidebar,
  header,
  children,
  placement = 'below',
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  motion = 'smooth',
  className,
  ref,
  ...props
}: SidebarLayoutProps) {
  const [collapsedState, setCollapsedState] = useState(defaultCollapsed);
  const collapsed = collapsedProp ?? collapsedState;
  const setCollapsed = (next: boolean) => {
    if (collapsedProp === undefined) setCollapsedState(next);
    onCollapsedChange?.(next);
  };
  const [narrow, setNarrow] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRefs(rootRef, ref);

  // 置かれた面の幅で、列か Drawer かを決める（描く前に読んで、ちらつかせない）
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const read = () => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const next = root.offsetWidth < WIDE_REM * rem;
      setNarrow(next);
      // 面が広がって列に戻ったら、開いていた Drawer を閉じる
      if (!next) setMobileOpen(false);
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const s = layout({ placement });
  const content = (
    <div data-slot="sidebar-content" className={s.content()}>
      {children}
    </div>
  );
  return (
    <SidebarLayoutContext
      value={{ collapsed, setCollapsed, narrow, mobileOpen, setMobileOpen, motion, navId }}
    >
      <div
        {...props}
        ref={mergedRef}
        data-slot="sidebar-layout"
        data-placement={placement}
        data-narrow={narrow || undefined}
        className={s.root({ className })}
      >
        {placement === 'full' ? (
          <>
            {sidebar}
            <div className={s.body()}>
              {header}
              {content}
            </div>
          </>
        ) : (
          <>
            {header}
            <div className={s.body()}>
              {sidebar}
              {content}
            </div>
          </>
        )}
      </div>
    </SidebarLayoutContext>
  );
}

export interface SidebarTriggerProps {
  /**
   * ボタンの読み上げの名前
   * @default 'メニューを開閉する'
   */
  accessibleName?: string;
  /** ボタンに付きます */
  className?: string;
}

/**
 * 列を開け閉めするボタン。SidebarLayout の header の中などに置きます。広い画面では列を畳む・開くを切り替え、狭い画面では Drawer を開きます
 */
export function SidebarTrigger({
  accessibleName = 'メニューを開閉する',
  className,
}: SidebarTriggerProps) {
  const { collapsed, setCollapsed, narrow, mobileOpen, setMobileOpen, navId } =
    useSidebarLayout('SidebarTrigger');
  const expanded = narrow ? mobileOpen : !collapsed;
  return (
    <Button
      iconOnly
      variant="outline"
      aria-label={accessibleName}
      aria-expanded={expanded}
      aria-controls={narrow ? undefined : navId}
      className={className}
      onClick={() => (narrow ? setMobileOpen(!mobileOpen) : setCollapsed(!collapsed))}
    >
      <ListIcon standalone />
    </Button>
  );
}
