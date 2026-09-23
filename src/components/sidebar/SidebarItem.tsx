'use client';

import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import { useRender } from '@base-ui/react/use-render';
import {
  Children,
  cloneElement,
  type ComponentProps,
  isValidElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  use,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { ArrowUpRightIcon, CaretDownIcon } from '../../internal/icons';
import { newTabNaming, opensNewTab, withRenderOverrides } from '../../internal/link-parts';
import { useMergedRefs } from '../../internal/use-merged-refs';
import { Menu } from '../menu/Menu';
import { MenuItem, MenuLinkItem, MenuSubmenu } from '../menu/MenuItem';
import { Tooltip } from '../tooltip/Tooltip';
import {
  SidebarLayoutContext,
  SidebarNavContext,
  type SidebarNavContextValue,
} from './sidebar-context';
import { sidebar } from './sidebar-styles';

// 列の 1 行。開いた列・Drawer の中では行を縦に並べ、入れ子は開け閉めする（Tree と同じ動き）
//   畳んだ列では、最上段の行だけがアイコンになる。入れ子のある行は、載せる（か押す）と横に面が出て、そこに入れ子を出す（軸 303・307）
//   入れ子のない行は、載せると名前の札が出る。畳んでも、いまいる行を含む親のアイコンに、いまいる印を付ける（軸 306）
//   面は Menu（入れ子は MenuSubmenu）。矢印キーで移り、→ で入れ子を開き、Esc で閉じる

export interface SidebarItemProps extends Omit<
  ComponentProps<'a'>,
  'children' | 'className' | 'onClick' | 'ref' | 'title'
> {
  /** 行に出す文字。畳んだ列では、読み上げの名前と、載せたときの札になります */
  label: string;
  /**
   * 文字の前に置くアイコン。畳んだ列ではこれだけが残るので、最上段の行には置きます。
   * 置かない最上段の行は、文字の最初の 1 文字を出します
   */
  icon?: ReactNode;
  /**
   * 行き先。渡すとリンクになります。入れ子を持つ行は、開け閉めするボタンになります。
   * `target="_blank"` を足すと、右上向きの矢印（↗）が付き、読み上げに「新しいタブで開きます」が入ります
   */
  href?: string;
  /** 描く要素（Base UI の render と同じ）。Next.js の Link などを渡すと、その要素に行の見た目を重ねます */
  render?: ReactElement;
  /**
   * いまいるページか。true のとき aria-current="page" を付け、印を出します
   * @default false
   */
  current?: boolean;
  /**
   * はじめは開いているか（非制御）。入れ子を持つ行だけに効きます
   * @default false
   */
  defaultExpanded?: boolean;
  /** 開いているか（制御） */
  expanded?: boolean;
  /** 開閉が変わるときに、次の値を渡して呼びます */
  onExpandedChange?: (expanded: boolean) => void;
  /**
   * 押せなくします
   * @default false
   */
  disabled?: boolean;
  /** 押したときに呼ばれます。入れ子を持つ行では、開け閉めと一緒に呼ばれます */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** 入れ子の行（SidebarItem）。渡すと開け閉めできる行になります */
  children?: ReactNode;
  /** 行の要素に付きます */
  className?: string;
  /** 行の要素に付きます */
  ref?: React.Ref<HTMLElement>;
}

/** 子の行に、いまいる行があるか（畳んだ列で、親のアイコンに印を付けるため） */
function hasCurrent(children: ReactNode): boolean {
  return Children.toArray(children).some((child) => {
    if (!isValidElement<{ current?: boolean; children?: ReactNode }>(child)) return false;
    return Boolean(child.props.current) || hasCurrent(child.props.children);
  });
}

/**
 * 列の 1 行。中に SidebarItem を入れると、開け閉めできる行になります
 */
export function SidebarItem(props: SidebarItemProps) {
  const nav = use(SidebarNavContext);
  const layout = use(SidebarLayoutContext);
  if (!nav || !layout) throw new Error('SidebarItem は Sidebar の中に置いてください');
  const { defaultExpanded = false, expanded, onExpandedChange } = props;
  const [uncontrolled, setUncontrolled] = useState(defaultExpanded);
  const open = expanded ?? uncontrolled;
  const setOpen = (next: boolean) => {
    if (expanded === undefined) setUncontrolled(next);
    onExpandedChange?.(next);
  };
  if (nav.mode === 'flyout') return <FlyoutItem {...props} />;
  if (nav.mode === 'rail') return <RailItem {...props} nav={nav} />;
  return (
    <ListItem
      {...props}
      nav={nav}
      open={open}
      setOpen={setOpen}
      closeDrawer={() => layout.setMobileOpen(false)}
    />
  );
}

function ListItem({
  label,
  icon,
  href,
  render,
  current = false,
  defaultExpanded: _defaultExpanded,
  expanded: _expanded,
  onExpandedChange: _onExpandedChange,
  disabled = false,
  onClick,
  children,
  className,
  ref,
  nav,
  open,
  setOpen,
  closeDrawer,
  ...props
}: SidebarItemProps & {
  nav: SidebarNavContextValue;
  open: boolean;
  setOpen: (open: boolean) => void;
  closeDrawer: () => void;
}) {
  const groupId = useId();
  const noteId = useId();
  const hasChildren = children != null && children !== false;
  const nested = nav.depth > 0;
  const s = sidebar({ nested });
  const asLink = !hasChildren && href != null && !disabled;
  // 新しいタブで開く行（Tree・Link と同じ扱い）: ↗ を文字の後ろに付け、読み上げに「新しいタブで開きます」を足す
  const newTab = asLink && (props.target === '_blank' || opensNewTab(render));
  const naming = newTab ? newTabNaming(props, render, noteId) : null;
  const row = useRender({
    render: naming ? withRenderOverrides(render, naming.props) : render,
    defaultTagName: asLink ? 'a' : 'button',
    ref,
    props: {
      ...props,
      ...naming?.props,
      ...(newTab ? { rel: props.rel ?? 'noopener noreferrer' } : {}),
      type: asLink ? undefined : 'button',
      'aria-current': current ? ('page' as const) : undefined,
      'aria-disabled': disabled || undefined,
      'aria-expanded': hasChildren ? open : undefined,
      'aria-controls': hasChildren ? groupId : undefined,
      'data-slot': 'sidebar-item',
      'data-disabled': disabled ? '' : undefined,
      ...(asLink && { href }),
      onClick: (event: MouseEvent<HTMLElement>) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        if (hasChildren) setOpen(!open);
        onClick?.(event);
        // 狭い画面の Drawer では、行き先を押したら閉じてから移る
        if (!hasChildren && nav.mode === 'drawer') closeDrawer();
      },
      className: s.row({ className }),
      children: (
        <>
          {icon || !nested ? (
            <span aria-hidden="true" className={s.icon()}>
              {icon ?? <span className="text-sm font-bold">{label.slice(0, 1)}</span>}
            </span>
          ) : null}
          <span data-slot="sidebar-label" className={s.label()}>
            {label}
          </span>
          {hasChildren && (
            <span aria-hidden="true" className={s.caret()}>
              <CaretDownIcon />
            </span>
          )}
          {newTab && (
            <span aria-hidden="true" className={s.icon()}>
              <ArrowUpRightIcon />
            </span>
          )}
          {naming?.note}
        </>
      ),
    },
  });
  if (!hasChildren) {
    return (
      <li role="none" className="relative flex flex-col">
        {row}
      </li>
    );
  }
  // 開け閉めは Base UI の Collapsible に任せる（中身の高さを動かす。Tree・Accordion と同じ）
  return (
    <BaseCollapsible.Root
      open={open}
      onOpenChange={setOpen}
      render={<li role="none" className="relative flex flex-col" />}
    >
      {row}
      <SidebarNavContext value={{ ...nav, depth: nav.depth + 1 }}>
        <BaseCollapsible.Panel
          id={groupId}
          data-slot="sidebar-group"
          className={s.group()}
          render={<ul />}
        >
          {children}
        </BaseCollapsible.Panel>
      </SidebarNavContext>
    </BaseCollapsible.Root>
  );
}

function RailItem({
  label,
  icon,
  href,
  render,
  current = false,
  defaultExpanded: _defaultExpanded,
  expanded: _expanded,
  onExpandedChange: _onExpandedChange,
  disabled = false,
  onClick,
  children,
  className,
  ref,
  nav,
  ...props
}: SidebarItemProps & { nav: SidebarNavContextValue }) {
  const noteId = useId();
  const hasChildren = children != null && children !== false;
  const s = sidebar();
  const asLink = !hasChildren && href != null && !disabled;
  const newTab = asLink && (props.target === '_blank' || opensNewTab(render));
  const naming = newTab ? newTabNaming(props, render, noteId) : null;
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const mergedRef = useMergedRefs(triggerRef, ref);
  // Base UI の入れ子の面は、いちばん奥の面から出ても、手前の面を閉じない。マウスが行と面のどこにもないまま closeDelay が過ぎたら、まとめて閉じる
  useEffect(() => {
    if (!flyoutOpen) return undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const target = event.target;
      const inside =
        target instanceof Element &&
        (triggerRef.current?.contains(target) || target.closest('[role="menu"]') != null);
      if (inside) {
        clearTimeout(timer);
        timer = undefined;
      } else if (timer === undefined) {
        timer = setTimeout(() => setFlyoutOpen(false), nav.closeDelay);
      }
    };
    document.addEventListener('pointermove', onMove);
    return () => {
      document.removeEventListener('pointermove', onMove);
      clearTimeout(timer);
    };
  }, [flyoutOpen, nav.closeDelay]);
  const row = useRender({
    render: naming ? withRenderOverrides(render, naming.props) : render,
    defaultTagName: asLink ? 'a' : 'button',
    ref: mergedRef,
    props: {
      ...props,
      ...naming?.props,
      ...(newTab ? { rel: props.rel ?? 'noopener noreferrer' } : {}),
      type: asLink ? undefined : 'button',
      'aria-current': current ? ('page' as const) : undefined,
      'aria-disabled': disabled || undefined,
      'data-slot': 'sidebar-item',
      'data-disabled': disabled ? '' : undefined,
      // 入れ子の中にいまいる行があるとき、親のアイコンに同じ印を付ける
      'data-current-branch': hasChildren && hasCurrent(children) ? '' : undefined,
      ...(asLink && { href }),
      onClick: (event: MouseEvent<HTMLElement>) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      },
      className: s.row({ className }),
      children: (
        <>
          <span aria-hidden="true" className={s.icon()}>
            {icon ?? <span className="text-sm font-bold">{label.slice(0, 1)}</span>}
          </span>
          {/* 畳んだ列では文字は見せない。読み上げの名前として残す */}
          <span className="sr-only">{label}</span>
          {naming?.note}
        </>
      ),
    },
  });

  if (!hasChildren) {
    return (
      <li role="none" className="flex flex-col">
        <Tooltip content={label} side="right" delay={nav.openDelay}>
          {row}
        </Tooltip>
      </li>
    );
  }
  return (
    <li role="none" className="flex flex-col">
      <Menu
        trigger={row}
        open={flyoutOpen}
        onOpenChange={setFlyoutOpen}
        title={label}
        side="right"
        align="start"
        modal={false}
        presentation="popover"
        color={nav.color}
        openOnHover
        openDelay={nav.openDelay}
        closeDelay={nav.closeDelay}
      >
        <SidebarNavContext value={{ ...nav, mode: 'flyout', depth: 1 }}>
          {children}
        </SidebarNavContext>
      </Menu>
    </li>
  );
}

function FlyoutItem({
  label,
  icon,
  href,
  render,
  current = false,
  disabled = false,
  onClick,
  children,
  className,
  target,
  rel,
}: SidebarItemProps) {
  const hasChildren = children != null && children !== false;
  if (hasChildren) {
    return (
      <MenuSubmenu
        icon={icon}
        title={label}
        items={children}
        disabled={disabled}
        className={className}
      >
        {label}
      </MenuSubmenu>
    );
  }
  // 行き先のない行（「作成」など）は、押すと onClick を呼ぶ項目にする
  if (href == null && render == null) {
    return (
      <MenuItem icon={icon} disabled={disabled} onClick={onClick} className={className}>
        {label}
      </MenuItem>
    );
  }
  // 面の中の行には、いまいる印（太字）と aria-current だけを付ける
  const linkRender = current ? cloneElement(render ?? <a />, { 'aria-current': 'page' }) : render;
  return (
    <MenuLinkItem
      icon={icon}
      href={href}
      target={target}
      rel={rel}
      render={linkRender}
      disabled={disabled}
      className={current ? `font-bold ${className ?? ''}` : className}
    >
      {label}
    </MenuLinkItem>
  );
}
