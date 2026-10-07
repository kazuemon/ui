'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import {
  type ComponentProps,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { ArrowUpRightIcon, CaretRightIcon, CheckIcon } from '../../internal/icons';
import { disabledAnchor, NewTabNote } from '../../internal/link-parts';
import type { ItemIconVariant } from '../../internal/menu/item-icon';
import { type MenuRadioMark, useMenuContext } from '../../internal/menu/menu-context';
import { MenuSlidePanel } from '../../internal/menu/MenuSlide';
import { MenuSurface } from '../../internal/menu/MenuSurface';
import { MenuSlideContext, useMenuSlide } from '../../internal/menu/use-menu-slide';
import { menuGroupLabel, menuItem, menuSeparatorClass } from './menu-styles';

interface MenuItemBaseProps {
  /** 項目の文字 */
  children: ReactNode;
  /** 文字の前に置くアイコン（<svg>）。部品の中のアイコンの大きさにそろえます */
  icon?: ReactNode;
  /**
   * アイコンの見せ方。plain はアイコンだけを置き、soft は入力欄と同じグレーの角丸の箱に入れます（項目は箱の分だけ高くなります）
   * @default 'plain'
   */
  iconVariant?: ItemIconVariant;
  /**
   * 文字の下の 2 行目。押せない項目では、押せない理由を書きます。読み上げでは項目の説明になります
   */
  description?: ReactNode;
  /**
   * 文字を打って項目を探すときの文字。children が文字だけでないときに渡します
   * @default children が文字のときは、その文字
   */
  label?: string;
  /** 面に足すクラス */
  className?: string;
  /** 状態を固定して見せるときなどに使う */
  style?: ComponentProps<'div'>['style'];
}

interface DisableableProps {
  /**
   * 押せない。押せない文字の色にし、押しても何も起きません。矢印キーでは止まり、押せないことが読まれます
   * @default false
   */
  disabled?: boolean;
}

// 項目の中身の並び: [印（前）] [アイコン] [文字と 2 行目] [ショートカット] [後ろの印] [印（後ろ）]
// 印の場所は Menu の markPlacement（DOM では最後に置き、前に置くときは order で前へ出す）。2 行目とショートカットは、読み上げでは項目の説明
function ItemContent({
  icon,
  iconVariant,
  children,
  description,
  labelId,
  descriptionId,
  shortcut,
  shortcutId,
  trailing,
  mark,
  danger,
}: {
  icon?: ReactNode;
  iconVariant: ItemIconVariant;
  children: ReactNode;
  description?: ReactNode;
  labelId: string;
  descriptionId: string;
  shortcut?: ReactNode;
  shortcutId: string;
  trailing?: ReactNode;
  mark?: ReactNode;
  danger?: boolean;
}) {
  const { markPlacement, reserveMarkSpace } = useMenuContext();
  const s = menuItem({ danger, described: description != null, markPlacement, iconVariant });
  return (
    <>
      {icon != null && (
        <span aria-hidden className={s.icon()}>
          {icon}
        </span>
      )}
      <span className={s.label()}>
        <span id={labelId} className={s.text()}>
          {children}
        </span>
        {description != null && (
          <span id={descriptionId} data-slot="menu-item-description" className={s.description()}>
            {description}
          </span>
        )}
      </span>
      {shortcut != null && (
        <span id={shortcutId} data-slot="menu-item-shortcut" className={s.shortcut()}>
          {shortcut}
        </span>
      )}
      {trailing != null && (
        <span aria-hidden className={s.trailing()}>
          {trailing}
        </span>
      )}
      {(mark != null || reserveMarkSpace) && (
        <span aria-hidden className={s.mark()}>
          {mark}
        </span>
      )}
    </>
  );
}

// 読み上げの名前と説明。2 行目・ショートカットがあるときは、名前を文字だけにし（aria-labelledby）、
// 2 行目・ショートカットは説明にする（aria-describedby）。ないときは中の文字がそのまま名前になる
function useItemDescription(description: ReactNode, shortcut: ReactNode) {
  const id = useId();
  const labelId = `${id}label`;
  const descriptionId = `${id}description`;
  const shortcutId = `${id}shortcut`;
  const describedBy =
    [description != null && descriptionId, shortcut != null && shortcutId]
      .filter(Boolean)
      .join(' ') || undefined;
  return {
    labelId,
    descriptionId,
    shortcutId,
    describedBy,
    labelledBy: describedBy ? labelId : undefined,
  };
}

const typeaheadLabel = (children: ReactNode, label: string | undefined) =>
  label ?? (typeof children === 'string' ? children : undefined);

/** 項目の状態。danger は、削除など取り消せない操作 */
export type MenuItemStatus = 'danger';

export interface MenuItemProps extends MenuItemBaseProps, DisableableProps {
  /** 押したときの処理 */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /**
   * 文字の後ろに出すショートカット（例: 「Ctrl+C」）。表示だけで、キーの操作は利用者が付けます。シートでは出しません
   */
  shortcut?: ReactNode;
  /**
   * 削除など、取り消せない操作の状態。danger は文字とアイコンを危険の色にし、hover で赤を淡く敷きます
   */
  status?: MenuItemStatus;
  /**
   * 押したあと一覧を閉じるか
   * @default true
   */
  closeOnClick?: boolean;
}

/** その場で実行する項目 */
export function MenuItem({
  children,
  icon,
  iconVariant = 'plain',
  description,
  label,
  shortcut,
  status,
  disabled,
  onClick,
  closeOnClick,
  className,
  style,
}: MenuItemProps) {
  const { sheet } = useMenuContext();
  const danger = status === 'danger';
  // 指で操作するシートでは、キーボードのショートカットを出さない
  const shownShortcut = sheet ? undefined : shortcut;
  const ids = useItemDescription(description, shownShortcut);
  return (
    <BaseMenu.Item
      data-slot="menu-item"
      data-status={status}
      disabled={disabled}
      label={typeaheadLabel(children, label)}
      onClick={onClick}
      closeOnClick={closeOnClick}
      aria-labelledby={ids.labelledBy}
      aria-describedby={ids.describedBy}
      className={menuItem({
        danger,
        described: description != null,
        iconVariant: icon != null ? iconVariant : 'plain',
      }).root({ className })}
      style={style}
    >
      <ItemContent
        icon={icon}
        iconVariant={iconVariant}
        description={description}
        labelId={ids.labelId}
        descriptionId={ids.descriptionId}
        shortcut={shownShortcut}
        shortcutId={ids.shortcutId}
        danger={danger}
      >
        {children}
      </ItemContent>
    </BaseMenu.Item>
  );
}

export interface MenuLinkItemProps extends MenuItemBaseProps, DisableableProps {
  /** 移る先 */
  href?: string;
  /** _blank のときは、後ろに右上向きの矢印を付け、読み上げに「新しいタブで開きます」を足します */
  target?: string;
  /** リンクと先の関係。target="_blank" のときは noopener noreferrer を自動で足します */
  rel?: string;
  /** ルーターのリンクの部品などで描くとき、その要素を渡す（Base UI の render） */
  render?: ReactElement;
  /** 押したときの処理（移る前に呼びます。移るのを止めるときは event.preventDefault()）。押せないときは呼びません */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /**
   * 押したあと一覧を閉じるか
   * @default true
   */
  closeOnClick?: boolean;
}

/**
 * 別の場所へ移る項目。リンク（<a>）として描きます
 *
 * `disabled` にすると、押せない MenuItem と同じ見た目になり、押しても移りません。Base UI のリンクは
 * ネイティブの disabled を持たないため、href・render を外し、読み上げには aria-disabled で伝えます
 */
export function MenuLinkItem({
  children,
  icon,
  iconVariant = 'plain',
  description,
  label,
  href,
  target,
  rel,
  render,
  disabled = false,
  onClick,
  closeOnClick = true,
  className,
  style,
}: MenuLinkItemProps) {
  const ids = useItemDescription(description, undefined);
  const newTab = target === '_blank';
  return (
    <BaseMenu.LinkItem
      data-slot="menu-item"
      data-disabled={disabled || undefined}
      aria-disabled={disabled || undefined}
      href={disabled ? undefined : href}
      target={disabled ? undefined : target}
      rel={disabled ? undefined : (rel ?? (newTab ? 'noopener noreferrer' : undefined))}
      render={disabled ? disabledAnchor(render) : render}
      onClick={disabled ? undefined : onClick}
      label={typeaheadLabel(children, label)}
      closeOnClick={disabled ? false : closeOnClick}
      aria-labelledby={ids.labelledBy}
      aria-describedby={ids.describedBy}
      className={menuItem({
        described: description != null,
        iconVariant: icon != null ? iconVariant : 'plain',
      }).root({ className })}
      style={style}
    >
      <ItemContent
        icon={icon}
        iconVariant={iconVariant}
        description={description}
        labelId={ids.labelId}
        descriptionId={ids.descriptionId}
        shortcutId={ids.shortcutId}
        trailing={newTab && !disabled ? <ArrowUpRightIcon /> : undefined}
      >
        {children}
        {newTab && !disabled && <NewTabNote />}
      </ItemContent>
    </BaseMenu.LinkItem>
  );
}

export interface MenuCheckboxItemProps extends MenuItemBaseProps, DisableableProps {
  /** 入っているか（制御） */
  checked?: boolean;
  /**
   * はじめに入っているか（非制御）
   * @default false
   */
  defaultChecked?: boolean;
  /** 入・切が変わるときに、次の値を渡して呼びます */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * 文字の後ろに出すショートカット（例: 「Ctrl+Shift+H」）。表示だけで、キーの操作は利用者が付けます。シートでは出しません
   */
  shortcut?: ReactNode;
  /**
   * 押したあと一覧を閉じるか。続けて切り替えられるよう、既定では閉じません
   * @default false
   */
  closeOnClick?: boolean;
}

/** 押すたびに入・切を切り替える項目。入のときはチェックの印を出します */
export function MenuCheckboxItem({
  children,
  icon,
  iconVariant = 'plain',
  description,
  label,
  disabled,
  checked,
  defaultChecked,
  onCheckedChange,
  shortcut,
  closeOnClick,
  className,
  style,
}: MenuCheckboxItemProps) {
  const { sheet } = useMenuContext();
  // 指で操作するシートでは、キーボードのショートカットを出さない
  const shownShortcut = sheet ? undefined : shortcut;
  const ids = useItemDescription(description, shownShortcut);
  return (
    <BaseMenu.CheckboxItem
      data-slot="menu-item"
      disabled={disabled}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange ? (next) => onCheckedChange(next) : undefined}
      label={typeaheadLabel(children, label)}
      closeOnClick={closeOnClick}
      aria-labelledby={ids.labelledBy}
      aria-describedby={ids.describedBy}
      className={menuItem({
        described: description != null,
        iconVariant: icon != null ? iconVariant : 'plain',
      }).root({ className })}
      style={style}
    >
      <ItemContent
        icon={icon}
        iconVariant={iconVariant}
        description={description}
        labelId={ids.labelId}
        descriptionId={ids.descriptionId}
        shortcut={shownShortcut}
        shortcutId={ids.shortcutId}
        mark={
          <BaseMenu.CheckboxItemIndicator className="flex">
            <CheckIcon />
          </BaseMenu.CheckboxItemIndicator>
        }
      >
        {children}
      </ItemContent>
    </BaseMenu.CheckboxItem>
  );
}

export interface MenuRadioGroupProps {
  /** MenuRadioItem を並べる */
  children?: ReactNode;
  /** 選んでいる項目の値（制御） */
  value?: string;
  /** はじめに選んでいる項目の値（非制御） */
  defaultValue?: string;
  /** 値が変わるときに、次の値を渡して呼びます */
  onValueChange?: (value: string) => void;
  /**
   * グループの項目をすべて押せなくする
   * @default false
   */
  disabled?: boolean;
}

/** 1 つだけを選ぶ項目（MenuRadioItem）のまとまり。見出しを付けるときは MenuGroup で包みます */
export function MenuRadioGroup({ onValueChange, ...props }: MenuRadioGroupProps) {
  return (
    <BaseMenu.RadioGroup
      {...props}
      onValueChange={onValueChange ? (value: string) => onValueChange(value) : undefined}
    />
  );
}

export interface MenuRadioItemProps extends MenuItemBaseProps, DisableableProps {
  /** この項目の値。MenuRadioGroup の value と同じなら、選んだ印を出します */
  value: string;
  /**
   * 押したあと一覧を閉じるか
   * @default false
   */
  closeOnClick?: boolean;
}

/** MenuRadioGroup の中で、1 つだけを選ぶ項目。選んだ項目に印を出します */
export function MenuRadioItem({
  children,
  icon,
  iconVariant = 'plain',
  description,
  label,
  disabled,
  value,
  closeOnClick,
  className,
  style,
}: MenuRadioItemProps) {
  const { radioMark } = useMenuContext();
  const ids = useItemDescription(description, undefined);
  return (
    <BaseMenu.RadioItem
      data-slot="menu-item"
      value={value}
      disabled={disabled}
      label={typeaheadLabel(children, label)}
      closeOnClick={closeOnClick}
      aria-labelledby={ids.labelledBy}
      aria-describedby={ids.describedBy}
      className={menuItem({
        described: description != null,
        iconVariant: icon != null ? iconVariant : 'plain',
      }).root({ className })}
      style={style}
    >
      <ItemContent
        icon={icon}
        iconVariant={iconVariant}
        description={description}
        labelId={ids.labelId}
        descriptionId={ids.descriptionId}
        shortcutId={ids.shortcutId}
        mark={<RadioMark mark={radioMark} />}
      >
        {children}
      </ItemContent>
    </BaseMenu.RadioItem>
  );
}

// ラジオの印（Menu の radioMark）。選んだ項目に面は敷かず、文字もそのまま（印だけで示す）
//   radio: ラジオと同じ形を小さく。どの項目にもグレーの丸を置き、選んだ丸は印の色に白い点。押せない項目は押せない丸の色
//   dot: 選んだ項目にだけ小さな点
//   check: 選んだ項目にだけチェック（チェックの項目と同じ印）
function RadioMark({ mark }: { mark: MenuRadioMark }) {
  if (mark === 'check') {
    return (
      <span className="flex group-data-unchecked/menu-item:invisible">
        <CheckIcon />
      </span>
    );
  }
  if (mark === 'dot') {
    return (
      <span className="size-2 rounded-pill bg-current group-data-unchecked/menu-item:invisible" />
    );
  }
  return (
    <span className="flex size-4 items-center justify-center rounded-pill bg-(color:--color-choice) group-data-checked/menu-item:bg-current group-data-disabled/menu-item:bg-(color:--color-choice-disabled) group-data-disabled/menu-item:group-data-checked/menu-item:bg-current">
      <span className="size-1.5 rounded-pill bg-surface group-data-unchecked/menu-item:invisible" />
    </span>
  );
}

export interface MenuGroupProps {
  /** 見出し。読み上げでは、まとまりの名前になります */
  label?: ReactNode;
  /** まとまりに入れる項目 */
  children?: ReactNode;
}

/** 項目のまとまり。見出しを付けられます。見出しの文字は Menu の groupLabelStyle で選びます */
export function MenuGroup({ label, children }: MenuGroupProps) {
  const { groupLabelStyle } = useMenuContext();
  return (
    <BaseMenu.Group data-slot="menu-group">
      {label != null && (
        <BaseMenu.GroupLabel
          data-slot="menu-group-label"
          className={menuGroupLabel({ style: groupLabelStyle })}
        >
          {label}
        </BaseMenu.GroupLabel>
      )}
      {children}
    </BaseMenu.Group>
  );
}

/** 項目のあいだの区切り線 */
export function MenuSeparator() {
  return <BaseMenu.Separator data-slot="menu-separator" className={menuSeparatorClass} />;
}

export interface MenuSubmenuProps extends Omit<MenuItemBaseProps, 'style'>, DisableableProps {
  /** 入れ子のメニューの項目 */
  items: ReactNode;
  /**
   * シートで出すときの見出しの題
   * @default children
   */
  title?: ReactNode;
  /**
   * はじめから開いておくか（親のメニューが開いたとき）
   * @default false
   */
  defaultOpen?: boolean;
}

/**
 * 押すと、横に入れ子のメニューを開く項目。マウスでは載せるだけで開きます。
 * シートで出すときは、Menu の submenuSheet の形で開き、見出しのボタンで親に戻ります
 */
export function MenuSubmenu(props: MenuSubmenuProps) {
  // slide のシートでは、入れ子を同じシートの中のパネルとして描く（Base UI の入れ子の Popup を使わない）
  const slide = useMenuSlide();
  return slide ? <SlideSubmenu {...props} /> : <PopupSubmenu {...props} />;
}

function PopupSubmenu({
  children,
  icon,
  iconVariant = 'plain',
  description,
  label,
  disabled,
  items,
  title,
  defaultOpen = false,
  className,
}: MenuSubmenuProps) {
  const { sheet } = useMenuContext();
  const [open, setOpen] = useState(defaultOpen);
  const ids = useItemDescription(description, undefined);
  return (
    <BaseMenu.SubmenuRoot open={open} onOpenChange={setOpen}>
      <BaseMenu.SubmenuTrigger
        data-slot="menu-item"
        disabled={disabled}
        label={typeaheadLabel(children, label)}
        openOnHover={!sheet}
        aria-labelledby={ids.labelledBy}
        aria-describedby={ids.describedBy}
        className={menuItem({
          described: description != null,
          iconVariant: icon != null ? iconVariant : 'plain',
        }).root({ className })}
      >
        <ItemContent
          icon={icon}
          iconVariant={iconVariant}
          description={description}
          labelId={ids.labelId}
          descriptionId={ids.descriptionId}
          shortcutId={ids.shortcutId}
          trailing={<CaretRightIcon />}
        >
          {children}
        </ItemContent>
      </BaseMenu.SubmenuTrigger>
      <MenuSurface nested title={title ?? children} onClose={() => setOpen(false)}>
        {items}
      </MenuSurface>
    </BaseMenu.SubmenuRoot>
  );
}

// slide のシートの入れ子。項目は親のメニューの項目（押しても閉じない）で、押すと子のパネルへ滑る
//   子のパネルは、親のパネルの中から舞台へ portal で描く（Base UI の項目の登録と、React の文脈はそのまま）
//   → でも開き、子のパネルでは ← で戻る。キーボードで開いたときは最初の項目へ、指・マウスではパネルへフォーカスを移す
//   戻ったときは、この項目へフォーカスを戻す（data-submenu-id で探す）
function SlideSubmenu({
  children,
  icon,
  iconVariant = 'plain',
  description,
  label,
  disabled,
  items,
  title,
  defaultOpen = false,
  className,
}: MenuSubmenuProps) {
  const slide = useMenuSlide();
  const id = useId();
  const ids = useItemDescription(description, undefined);
  const keyboard = useRef(false);
  const depth = (slide?.depth ?? 0) + 1;
  const entry = { id, title: title ?? children };
  const inPath = slide?.path[depth - 1]?.id === id;
  const current = inPath && slide?.path.length === depth;
  const openInitially = slide?.openInitially;
  useLayoutEffect(() => {
    if (defaultOpen) openInitially?.({ id, title: title ?? children }, depth);
    // はじめに 1 回だけ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // 舞台に「入れ子がある」ことを知らせる（fixed のつまみを出す条件）。描き切ってから測るとつまみが遅れて出るので、
  // 最初の描画がブラウザに映る前（useLayoutEffect）に済ませる
  const registerSubmenu = slide?.registerSubmenu;
  useLayoutEffect(() => registerSubmenu?.(), [registerSubmenu]);
  if (!slide) return null;
  const open = () => slide.open(entry, depth, keyboard.current ? 'first' : 'panel');
  return (
    <>
      <BaseMenu.Item
        data-slot="menu-item"
        data-submenu-id={id}
        disabled={disabled}
        label={typeaheadLabel(children, label)}
        closeOnClick={false}
        aria-labelledby={ids.labelledBy}
        aria-describedby={ids.describedBy}
        onPointerDown={() => {
          keyboard.current = false;
        }}
        onKeyDown={(event) => {
          keyboard.current = true;
          const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
          if (event.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) {
            event.preventDefault();
            if (!disabled) open();
          }
        }}
        onClick={open}
        className={menuItem({
          described: description != null,
          iconVariant: icon != null ? iconVariant : 'plain',
        }).root({ className })}
      >
        <ItemContent
          icon={icon}
          iconVariant={iconVariant}
          description={description}
          labelId={ids.labelId}
          descriptionId={ids.descriptionId}
          shortcutId={ids.shortcutId}
          trailing={<CaretRightIcon />}
        >
          {children}
        </ItemContent>
      </BaseMenu.Item>
      {slide.stage &&
        createPortal(
          <MenuSlideContext value={{ ...slide, depth }}>
            <MenuSlidePanel
              id={id}
              depth={depth}
              position={current ? 'current' : inPath ? 'before' : 'after'}
              label={typeof entry.title === 'string' ? entry.title : undefined}
            >
              {items}
            </MenuSlidePanel>
          </MenuSlideContext>,
          slide.stage
        )}
    </>
  );
}
