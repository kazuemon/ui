'use client';

import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import type { ComponentProps, ReactElement, ReactNode } from 'react';

import { CaretDownIcon } from '../../internal/icons';
import { collapsibleStyles } from '../../internal/collapsible-styles';

export type CollapsibleAppearance = 'plain' | 'open-filled' | 'filled' | 'divided';
export type CollapsibleIndicator = 'end' | 'start';

export interface CollapsibleProps extends Omit<
  ComponentProps<'div'>,
  'title' | 'children' | 'className' | 'defaultValue' | 'onChange'
> {
  /** 行に出す題。押すと中身を開閉します。trigger を渡すときは使いません */
  title?: ReactNode;
  /**
   * 行の代わりに置く、開閉のボタン。Button などの要素を渡します。見た目はその要素のままで、開閉の印も付けません
   * 渡した要素には、開いているあいだ data-panel-open と aria-expanded が付きます
   */
  trigger?: ReactElement;
  /**
   * 行の見た目。どれも行全体を押せます
   * - plain: 塗りなし。マウスを載せたときだけ淡いグレーを敷きます。本文や設定の中に置く、ふだん使いの形です
   * - open-filled: 開いている行をグレーで塗ります。いくつも並べて、どれが開いているかを見せたいときに使います
   * - filled: いつもグレーで塗り、押せる範囲を塗りで見せます。周りに線や囲みが少なく、行が押せると気づきにくい場所で使います
   * - divided: 行と中身の上下に区切り線を引きます。FAQ のように続けて並べる一覧で使います。続けて置くと、あいだの線は 1 本になります
   *
   * filled と divided は、行を間をあけずに続けて（兄弟として）置いてください。trigger を渡すときは使いません
   * @default 'plain'
   */
  appearance?: CollapsibleAppearance;
  /**
   * 開閉の印の位置。見た目（appearance）とは別に選べます
   * - end: 題の右。閉じているときは下向きで、開くと上を向きます
   * - start: 題の左。閉じているときは右向きで、開くと下を向きます。中身は題の頭にそろえて字下げします。ファイルの木のように、入れ子で並べるときに向きます
   * @default 'end'
   */
  indicator?: CollapsibleIndicator;
  /** 開いたときに出す中身 */
  children?: ReactNode;
  open?: boolean;
  /**
   * はじめから開いておくか
   * @default false
   */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * 押せなくします。題は押せない文字の色になります
   * @default false
   */
  disabled?: boolean;
  /**
   * 閉じているあいだも中身をページに残し、ブラウザのページ内検索で見つかるようにします。見つかると開きます
   * FAQ のように、閉じた中身も探されるときに使います。keepMounted より優先します
   * @default false
   */
  hiddenUntilFound?: boolean;
  /**
   * 閉じているあいだも中身を DOM に残します（見えず、読み上げにも届きません）。中の入力の値を保ちたいときに使います
   * @default false
   */
  keepMounted?: boolean;
  /** 外側の要素に足すクラス */
  className?: string;
  /** 中身（開閉する部分）の内側に足すクラス。余白を変えるときに使います */
  panelClassName?: string;
}

/**
 * 押して中身を開閉する行。詳しい設定、FAQ の答え、「もっと見る」の続きのように、ふだんは隠しておける中身に使います。
 * 行全体を押せます。開閉の印は、開くと向きが変わります
 */
export function Collapsible({
  title,
  trigger,
  children,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  appearance = 'plain',
  indicator = 'end',
  hiddenUntilFound = false,
  keepMounted = false,
  className,
  panelClassName,
  ...props
}: CollapsibleProps) {
  const styles = collapsibleStyles({ appearance, indicator });
  return (
    <BaseCollapsible.Root
      {...props}
      data-slot="collapsible"
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange ? (next) => onOpenChange(next) : undefined}
      disabled={disabled}
      className={trigger ? className : styles.root({ className })}
    >
      {trigger ? (
        <BaseCollapsible.Trigger render={trigger} />
      ) : (
        <BaseCollapsible.Trigger data-slot="collapsible-trigger" className={styles.trigger()}>
          <span className={styles.title()}>{title}</span>
          <span data-slot="collapsible-indicator" className={styles.indicator()}>
            <CaretDownIcon />
          </span>
        </BaseCollapsible.Trigger>
      )}
      <BaseCollapsible.Panel
        data-slot="collapsible-panel"
        hiddenUntilFound={hiddenUntilFound}
        keepMounted={keepMounted}
        className={styles.panel()}
      >
        <div className={trigger ? panelClassName : styles.content({ className: panelClassName })}>
          {children}
        </div>
      </BaseCollapsible.Panel>
    </BaseCollapsible.Root>
  );
}
