import {
  CaretDown,
  CaretRight,
  CaretLeft,
  HardDrives,
  Info,
  List,
  Medal,
  Plus,
  UsersThree,
  X,
  type Icon as PhosphorIcon,
} from '@phosphor-icons/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { Button } from '../../src/components/button/Button';
import { Navbar } from '../../src/components/navbar/Navbar';

// Sidebar の比較ストーリー（軸 303〜305）が共有する仮の部品。Sidebar の部品ができたら消す
// 見本の中身は、架空のゲーム「ミラージュ・ストライカーズ」の大会の試合管理画面

interface NavNode {
  label: string;
  icon?: PhosphorIcon;
  children?: NavNode[];
  current?: boolean;
  add?: boolean;
  /** 入れ子を閉じておく（いまいる枝のほかは閉じる） */
  closed?: boolean;
}

const NAV: NavNode[] = [
  { label: '大会の概要', icon: Info },
  {
    label: 'ステージ',
    icon: Medal,
    add: true,
    children: [
      {
        label: '予選リーグ',
        children: [
          { label: 'Aグループ', current: true },
          { label: 'Bグループ' },
          { label: 'Cグループ' },
        ],
      },
      { label: '決勝リーグ', closed: true, children: [{ label: '準決勝' }, { label: '決勝' }] },
    ],
  },
  { label: '参加チーム', icon: UsersThree },
  { label: 'マッチサーバー', icon: HardDrives },
];

const TITLE = 'ミラージュ杯 Season2 チーム戦';

export type Motion = 'instant' | 'smooth' | 'smooth-label';
export type Indicator = 'fill' | 'bar' | 'tint';

// 現在地の行の印。色は行の文字と、アイコンの色に使う
const CURRENT: Record<Indicator, { row: string; text: string; icon: string }> = {
  fill: { row: 'bg-neutral font-bold', text: 'text-fg', icon: 'text-fg-muted' },
  bar: {
    row: 'relative font-bold before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-pill before:bg-primary',
    text: 'text-fg',
    icon: 'text-fg-muted',
  },
  tint: {
    row: 'bg-primary-subtle font-bold',
    text: 'text-on-primary-subtle',
    icon: 'text-on-primary-subtle',
  },
};

function hasCurrent(node: NavNode): boolean {
  return !!node.current || !!node.children?.some(hasCurrent);
}

const COLLAPSED = 56;
const EXPANDED = 224;

function Rows({
  nodes,
  depth,
  collapsed,
  fade,
  indicator,
}: {
  nodes: NavNode[];
  depth: number;
  collapsed: boolean;
  fade: string;
  indicator: Indicator;
}) {
  return (
    <>
      {nodes.map((node) => {
        const Icon = node.icon;
        // 畳んだ列では、いまいる行を含む親のアイコンに印を付ける（入れ子は隠れているため）
        const marked = node.current || (collapsed && depth === 0 && hasCurrent(node));
        const look = CURRENT[indicator];
        return (
          <div key={node.label} className="flex flex-col gap-0.5">
            <div
              className={`flex w-full items-center gap-3 rounded-md text-sm hover:bg-flat-hover ${
                depth === 0 ? 'h-10 px-3' : 'h-9 pl-3'
              } ${marked ? `${look.row} ${look.text}` : depth === 0 ? 'text-fg' : 'text-fg-muted'}`}
            >
              {Icon && (
                <Icon
                  size={20}
                  aria-hidden
                  className={`shrink-0 ${marked ? look.icon : 'text-fg-muted'}`}
                />
              )}
              <span className={`flex min-w-0 flex-1 items-center gap-2 ${fade}`}>
                <span className="min-w-0 flex-1 truncate">{node.label}</span>
                {node.add && <Plus size={16} aria-hidden className="text-fg-muted" />}
                {node.children && depth > 0 && (
                  <CaretDown
                    size={14}
                    aria-hidden
                    className={`mr-2 text-fg-subtle ${node.closed ? '-rotate-90' : ''}`}
                  />
                )}
              </span>
            </div>
            {node.children && !node.closed && !collapsed && (
              <div className="ml-6 flex flex-col gap-0.5 border-l border-line pl-2">
                <Rows
                  nodes={node.children}
                  depth={depth + 1}
                  collapsed={collapsed}
                  fade={fade}
                  indicator={indicator}
                />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

function FlyoutPanel({
  nodes,
  left,
  hovered,
}: {
  nodes: NavNode[];
  left: number;
  hovered?: string;
}) {
  return (
    <div
      role="group"
      className="shadow-md absolute z-10 flex w-40 flex-col gap-0.5 rounded-lg border border-line bg-surface p-1.5"
      style={{ left, top: 84 }}
    >
      {nodes.map((node) => (
        <div
          key={node.label}
          className={`flex h-9 items-center justify-between rounded-md pr-2 pl-3 text-sm ${
            node.label === hovered ? 'bg-flat-hover text-fg' : 'text-fg-muted'
          } ${node.current ? 'bg-neutral font-bold text-fg' : ''}`}
        >
          {node.label}
          {node.children && <CaretRight size={14} aria-hidden />}
        </div>
      ))}
    </div>
  );
}

const stage = NAV[1].children ?? [];
const qualifier = stage[0].children ?? [];

export function SidebarNav({
  collapsed,
  flyout,
  motion = 'instant',
  footerToggle,
  onToggle,
  fullWidth,
  indicator = 'fill',
}: {
  collapsed: boolean;
  indicator?: Indicator;
  /** 畳んだまま、ステージの入れ子を横に出す（hover の状態を固定） */
  flyout?: boolean;
  motion?: Motion;
  /** 列の下端に開閉のボタンを置く */
  footerToggle?: boolean;
  onToggle?: () => void;
  /** 幅を決めず、置かれた面いっぱいに広げる（Drawer の中） */
  fullWidth?: boolean;
}) {
  const smooth = motion !== 'instant';
  // 開くときはラベルを遅れて出し、畳むときはすぐ消す（幅が広がりきる前に文字が折り返して見えるのを避ける）
  const fade =
    motion === 'smooth-label'
      ? collapsed
        ? 'opacity-0 transition-none'
        : 'opacity-100 transition-opacity delay-100 duration-100'
      : collapsed
        ? 'opacity-0'
        : 'opacity-100';
  return (
    <div
      className="relative z-10 h-full shrink-0"
      style={{
        width: fullWidth ? '100%' : collapsed ? COLLAPSED : EXPANDED,
        transition: smooth ? 'width var(--duration-normal) ease-out' : undefined,
      }}
    >
      <nav
        aria-label="試合管理"
        className={`flex h-full flex-col gap-1 overflow-hidden bg-surface p-2 ${fullWidth ? '' : 'border-r border-line'}`}
      >
        <p className={`flex h-7 shrink-0 items-center px-3 text-xs text-fg-subtle ${fade}`}>
          試合管理
        </p>
        <Rows nodes={NAV} depth={0} collapsed={collapsed} fade={fade} indicator={indicator} />
        {footerToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? '列を開く' : '列を畳む'}
            aria-expanded={!collapsed}
            className="mt-auto flex h-10 w-full shrink-0 items-center gap-3 rounded-md px-3 text-sm text-fg-muted hover:bg-flat-hover"
          >
            {collapsed ? (
              <CaretRight size={20} aria-hidden className="shrink-0" />
            ) : (
              <CaretLeft size={20} aria-hidden className="shrink-0" />
            )}
            <span className={fade}>畳む</span>
          </button>
        )}
      </nav>
      {flyout && (
        <>
          <FlyoutPanel nodes={stage} left={COLLAPSED - 4} hovered="予選リーグ" />
          <FlyoutPanel nodes={qualifier} left={COLLAPSED - 4 + 160 + 4} />
        </>
      )}
    </div>
  );
}

export function Header({ onToggle, title = TITLE }: { onToggle?: () => void; title?: string }) {
  return (
    <Navbar
      brand={
        <span className="flex min-w-0 items-center gap-2">
          <Button iconOnly variant="outline" aria-label="メニューを開閉する" onClick={onToggle}>
            <List size={20} aria-hidden />
          </Button>
          <span className="truncate text-sm">{title}</span>
        </span>
      }
      actions={<Button variant="outline">同期</Button>}
    />
  );
}

export function Body() {
  return (
    <main className="min-w-0 flex-1 p-6">
      <h2 className="text-xl font-heading">Aグループ</h2>
      <p className="mt-3 text-sm text-fg-muted">第1試合　ノヴァ隊 対 月影ギルド</p>
      <p className="mt-2 text-sm text-fg-muted">第2試合　ハーヴェスト 対 アイアンフォックス</p>
    </main>
  );
}

export type Placement = 'full' | 'below';

export function Frame({
  placement,
  collapsed,
  flyout,
  motion,
  footerToggle,
  onToggle,
  label,
  indicator,
}: {
  indicator?: Indicator;
  placement: Placement;
  collapsed: boolean;
  flyout?: boolean;
  motion?: Motion;
  footerToggle?: boolean;
  onToggle?: () => void;
  label: string;
}) {
  const nav = (
    <SidebarNav
      collapsed={collapsed}
      flyout={flyout}
      motion={motion}
      footerToggle={footerToggle}
      onToggle={onToggle}
      indicator={indicator}
    />
  );
  const header = <Header onToggle={footerToggle ? undefined : onToggle} />;
  return (
    <div
      role="group"
      aria-label={label}
      className="h-[520px] w-[640px] overflow-hidden rounded-lg border border-line-strong bg-bg"
    >
      {placement === 'full' ? (
        <div className="flex h-full">
          {nav}
          <div className="flex min-w-0 flex-1 flex-col">
            {header}
            <Body />
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          {header}
          <div className="flex min-h-0 flex-1">
            {nav}
            <Body />
          </div>
        </div>
      )}
    </div>
  );
}

/** 押すと畳む・開くを切り替えられる枠（動きと、開閉のボタンの置き場所を比べる） */
export function InteractiveFrame({
  motion,
  footerToggle,
  label,
}: {
  motion: Motion;
  footerToggle?: boolean;
  label: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <Frame
        placement="below"
        collapsed={collapsed}
        motion={motion}
        footerToggle={footerToggle}
        onToggle={() => setCollapsed((c) => !c)}
        label={label}
      />
      <p className="text-xs text-fg-subtle">
        {footerToggle ? '列の下の「畳む」' : 'Header の左のボタン'}を押して開閉を試せます
      </p>
    </div>
  );
}

/** 狭い画面。Drawer と同じ挙動（後ろを暗くして、押すと閉じる）で、列の中身を出す */
export function NarrowFrame({
  variant,
  open,
  label,
}: {
  variant: 'panel' | 'sheet';
  open: boolean;
  label: string;
}) {
  const list: ReactNode = <SidebarNav collapsed={false} fullWidth />;
  return (
    <div
      role="group"
      aria-label={label}
      className="relative h-[640px] w-[320px] overflow-hidden rounded-lg border border-line-strong bg-bg"
    >
      <Header title="ミラージュ杯 Season2" />
      <Body />
      {open && (
        <>
          <div className="absolute inset-0 z-20 bg-shadow/40" />
          {variant === 'panel' ? (
            <div className="shadow-lg absolute inset-y-0 left-0 z-30 flex w-[280px] flex-col rounded-r-xl bg-surface">
              <div className="flex h-14 shrink-0 items-center justify-between pr-2 pl-5">
                <span className="text-base font-heading">メニュー</span>
                <Button iconOnly variant="outline" aria-label="閉じる">
                  <X size={20} aria-hidden />
                </Button>
              </div>
              <div className="min-h-0 flex-1 overflow-auto">{list}</div>
            </div>
          ) : (
            <div className="shadow-lg absolute inset-x-0 bottom-0 z-30 flex h-[78%] flex-col rounded-t-xl bg-surface">
              <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-pill bg-line-strong" />
              <div className="flex h-12 shrink-0 items-center justify-between pr-2 pl-5">
                <span className="text-base font-heading">メニュー</span>
                <Button iconOnly variant="outline" aria-label="閉じる">
                  <X size={20} aria-hidden />
                </Button>
              </div>
              <div className="min-h-0 flex-1 overflow-auto">{list}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export type RailOpen = 'instant' | 'delay' | 'click';

const ROW = 44;
const TOP = 40;

function Panel({
  nodes,
  left,
  top,
  hovered,
  onHover,
  onEnter,
  onLeave,
  label,
}: {
  nodes: NavNode[];
  left: number;
  top: number;
  hovered?: string | null;
  onHover?: (label: string) => void;
  onEnter: () => void;
  onLeave: () => void;
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="shadow-md absolute z-10 flex w-40 flex-col gap-0.5 rounded-lg border border-line bg-surface p-1.5"
      style={{ left, top }}
    >
      {nodes.map((node) => (
        <div
          key={node.label}
          onMouseEnter={() => onHover?.(node.label)}
          className={`flex h-9 items-center justify-between rounded-md pr-2 pl-3 text-sm hover:bg-flat-hover ${
            node.current
              ? 'bg-neutral font-bold text-fg'
              : node.label === hovered
                ? 'bg-flat-hover text-fg'
                : 'text-fg-muted'
          }`}
        >
          {node.label}
          {node.children && <CaretRight size={14} aria-hidden />}
        </div>
      ))}
    </div>
  );
}

/** 畳んだ列に hover（か押す）と、入れ子が横に出る。開き方の動きを試す枠 */
export function RailFrame({
  mode,
  label,
  openDelay,
  closeDelay,
}: {
  mode: RailOpen;
  label: string;
  openDelay: number;
  closeDelay: number;
}) {
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const [sub, setSub] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  const later = (fn: () => void, ms: number) => {
    clear();
    if (ms === 0) fn();
    else timer.current = setTimeout(fn, ms);
  };
  const close = () => {
    setOpenLabel(null);
    setSub(null);
  };
  const enterRow = (node: NavNode) => {
    // 押して開く形は、開いている間だけ、ほかの行に hover して切り替える
    if (mode === 'click' && openLabel === null) return;
    later(
      () => {
        setOpenLabel(node.label);
        setSub(null);
      },
      mode === 'delay' ? openDelay : 0
    );
  };
  const leave = () => {
    if (mode === 'click') return;
    later(close, mode === 'delay' ? closeDelay : 0);
  };
  useEffect(() => {
    if (mode !== 'click' || openLabel === null) return undefined;
    const onDown = (event: MouseEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) {
        setOpenLabel(null);
        setSub(null);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [mode, openLabel]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const index = NAV.findIndex((n) => n.label === openLabel);
  const node = index >= 0 ? NAV[index] : undefined;
  // 入れ子のない行（大会の概要など）は、名前だけの札を出す
  const list = node ? (node.children ?? [{ label: node.label }]) : [];
  const top = TOP + index * ROW;
  const subNode = node?.children?.find((c) => c.label === sub);
  return (
    <div className="flex flex-col gap-2">
      <div
        ref={root}
        role="group"
        aria-label={label}
        className="h-[360px] w-[640px] overflow-hidden rounded-lg border border-line-strong bg-bg"
      >
        <div className="flex h-full flex-col">
          <Header />
          <div className="flex min-h-0 flex-1">
            <div className="relative z-10 w-14 shrink-0 border-r border-line bg-surface p-2">
              <div className="h-7" />
              <div className="flex flex-col gap-1">
                {NAV.map((n) => {
                  const Icon = n.icon;
                  return (
                    <button
                      key={n.label}
                      type="button"
                      aria-label={n.label}
                      aria-expanded={openLabel === n.label}
                      onMouseEnter={() => enterRow(n)}
                      onMouseLeave={leave}
                      onClick={() => {
                        if (mode !== 'click') return;
                        if (openLabel === n.label) close();
                        else {
                          setOpenLabel(n.label);
                          setSub(null);
                        }
                      }}
                      className={`grid h-10 w-10 place-items-center rounded-md text-fg-muted hover:bg-flat-hover ${
                        openLabel === n.label ? 'bg-flat-hover text-fg' : ''
                      }`}
                    >
                      {Icon && <Icon size={20} aria-hidden />}
                    </button>
                  );
                })}
              </div>
              {node && (
                <Panel
                  nodes={list}
                  left={52}
                  top={top}
                  label={node.label}
                  hovered={sub}
                  onHover={(l) => setSub(l)}
                  onEnter={clear}
                  onLeave={leave}
                />
              )}
              {subNode?.children && (
                <Panel
                  nodes={subNode.children}
                  left={52 + 160 + 4}
                  top={top}
                  label={subNode.label}
                  onEnter={clear}
                  onLeave={leave}
                />
              )}
            </div>
            <Body />
          </div>
        </div>
      </div>
      <p className="text-xs text-fg-subtle">
        {mode === 'click'
          ? 'アイコンを押すと開き、外を押すまで開いたままです。開いている間は、ほかのアイコンに hover すると切り替わります'
          : 'アイコンに hover して試せます。ステージから、予選リーグを通ってグループへ、斜めにマウスを動かしてみてください'}
      </p>
    </div>
  );
}
