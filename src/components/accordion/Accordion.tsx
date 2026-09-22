'use client';

import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import { type ComponentProps, createContext, type ReactNode, useContext } from 'react';

import { collapsibleStyles } from '../../internal/collapsible-styles';
import { CaretDownIcon } from '../../internal/icons';
import { tv } from '../../internal/tv';
import type { CollapsibleVariant, CollapsibleIndicator } from '../collapsible/Collapsible';

// 開閉の行を束ねた一覧。行・印・中身の見た目は Collapsible と同じ（internal/collapsible-styles。ADR-0117）
// Accordion だけが持つのは、項目のあいだの扱い
//   filled: 塗りの面がつながらないよう、項目のあいだを少し離す（Collapsible と同じ --collapsible-row-gap）
//   divided: あいだの線は 1 本に重ねる。一覧の上端と下端には引かない（軸 96 の A）。見出しや本文とのあいだに線を増やさない
// 中身の高さは Base UI が --accordion-panel-height に測るので、Collapsible の変数に渡して同じ動きにする
const accordionStyles = tv({
  slots: {
    root: 'flex flex-col',
    item: '',
    panel: '[--collapsible-panel-height:var(--accordion-panel-height)]',
  },
  variants: {
    variant: {
      plain: {},
      'open-filled': {},
      filled: { root: 'gap-(--collapsible-row-gap)' },
      divided: {
        item: [
          '[[data-slot=accordion-item]+&]:-mt-(--border-width-thin)',
          'first:border-t-0 last:border-b-0',
        ],
      },
    },
  },
});

export type AccordionVariant = CollapsibleVariant;
export type AccordionIndicator = CollapsibleIndicator;

interface AccordionContextValue {
  variant: AccordionVariant;
  indicator: AccordionIndicator;
  headingLevel: 2 | 3 | 4 | 5 | 6;
}

const AccordionContext = createContext<AccordionContextValue>({
  variant: 'divided',
  indicator: 'end',
  headingLevel: 3,
});

export interface AccordionProps extends Omit<
  ComponentProps<'div'>,
  'className' | 'defaultValue' | 'onChange' | 'dir'
> {
  /** 並べる項目。AccordionItem を間をあけずに続けて置きます */
  children?: ReactNode;
  /**
   * 項目の見た目。Collapsible と同じ 4 つです。どれも行全体を押せます
   * - divided: 項目のあいだと一覧の上下に区切り線を引きます。FAQ のように、問いを続けて並べる一覧の形です
   * - plain: 塗りも線もなし。マウスを載せたときだけ淡いグレーを敷きます。項目が 2〜3 個で、周りに見出しや余白があるときに使います
   * - open-filled: 開いている項目をグレーで塗ります。どれが開いているかを見せたいときに使います
   * - filled: いつもグレーで塗り、項目のあいだを少し離します。周りに線や囲みが少なく、押せると気づきにくい場所で使います
   * @default 'divided'
   */
  variant?: AccordionVariant;
  /**
   * 開閉の印の位置。見た目（variant）とは別に選べます
   * - end: 題の右。閉じているときは下向きで、開くと上を向きます
   * - start: 題の左。閉じているときは右向きで、開くと下を向きます。中身は題の頭にそろえて字下げします
   * @default 'end'
   */
  indicator?: AccordionIndicator;
  /**
   * 同時にいくつも開けるか。false のときは、1 つ開くとほかは閉じます
   * @default false
   */
  multiple?: boolean;
  /** 開いている項目の value（制御） */
  value?: unknown[];
  /** はじめに開いている項目の value（非制御） */
  defaultValue?: unknown[];
  /** 開いている項目が変わるときに、次の値を渡して呼びます */
  onValueChange?: (value: unknown[]) => void;
  /**
   * すべての項目を押せなくします
   * @default false
   */
  disabled?: boolean;
  /**
   * 閉じているあいだも中身をページに残し、ブラウザのページ内検索で見つかるようにします。見つかると開きます
   * FAQ のように、閉じた答えも探されるときに使います。keepMounted より優先します
   * @default false
   */
  hiddenUntilFound?: boolean;
  /**
   * 閉じているあいだも中身を DOM に残します（見えず、読み上げにも届きません）。中の入力の値を保ちたいときに使います
   * @default false
   */
  keepMounted?: boolean;
  /**
   * 題を包む見出しの段（h2〜h6）。ページの見出しの並びに合わせます。見た目は変わりません
   * @default 3
   */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** いちばん外の要素（項目を包む div）に付きます */
  className?: string;
}

/**
 * 押して中身を開閉する項目を束ねた一覧。FAQ や、記事の中の補足のように、いくつもの中身を題だけ並べて見せるときに使います。
 * 既定では 1 つ開くとほかは閉じます。見た目は Collapsible と同じです
 */
export function Accordion({
  children,
  variant = 'divided',
  indicator = 'end',
  multiple = false,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  hiddenUntilFound = false,
  keepMounted = false,
  headingLevel = 3,
  className,
  ...props
}: AccordionProps) {
  const styles = accordionStyles({ variant });
  return (
    <AccordionContext.Provider value={{ variant, indicator, headingLevel }}>
      <BaseAccordion.Root
        {...props}
        data-slot="accordion"
        multiple={multiple}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange ? (next) => onValueChange(next) : undefined}
        disabled={disabled}
        hiddenUntilFound={hiddenUntilFound}
        keepMounted={keepMounted}
        className={styles.root({ className })}
      >
        {children}
      </BaseAccordion.Root>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps extends Omit<
  ComponentProps<'div'>,
  'title' | 'children' | 'className' | 'onChange'
> {
  /** 行に出す題。押すと中身を開閉します */
  title: ReactNode;
  /** 開いたときに出す中身。文章でも、入力欄や一覧でも置けます */
  children?: ReactNode;
  /** 項目を見分ける値。Accordion の defaultValue・value で、この値を指して開きます。渡さないときは自動で付きます */
  value?: unknown;
  /** この項目の開閉が変わるときに、次の値を渡して呼びます */
  onOpenChange?: (open: boolean) => void;
  /**
   * この項目だけ押せなくします。題は押せない文字の色になります
   * @default false
   */
  disabled?: boolean;
  /** 項目のいちばん外の要素に付きます */
  className?: string;
  /**
   * 中身（開閉する部分）の内側の要素に渡す props。余白を変えるときや、id・data-* を付けるときに使います。
   * className は部品の見た目に重ねます
   */
  panelProps?: ComponentProps<'div'>;
}

/**
 * Accordion の中の 1 項目。題の行を押すと中身を開閉します
 */
export function AccordionItem({
  title,
  children,
  value,
  onOpenChange,
  disabled,
  className,
  panelProps,
  ...props
}: AccordionItemProps) {
  const { className: panelClassName, ...panelRest } = panelProps ?? {};
  const { variant, indicator, headingLevel } = useContext(AccordionContext);
  const styles = collapsibleStyles({ variant, indicator });
  const own = accordionStyles({ variant });
  const Heading = `h${headingLevel}` as const;
  return (
    <BaseAccordion.Item
      {...props}
      data-slot="accordion-item"
      value={value}
      onOpenChange={onOpenChange ? (next) => onOpenChange(next) : undefined}
      disabled={disabled}
      className={styles.root({ className: own.item({ className }) })}
    >
      <BaseAccordion.Header render={<Heading />} className="m-0">
        <BaseAccordion.Trigger data-slot="accordion-trigger" className={styles.trigger()}>
          <span className={styles.title()}>{title}</span>
          <span data-slot="accordion-indicator" className={styles.indicator()}>
            <CaretDownIcon />
          </span>
        </BaseAccordion.Trigger>
      </BaseAccordion.Header>
      <BaseAccordion.Panel
        data-slot="accordion-panel"
        className={styles.panel({ className: own.panel() })}
      >
        <div {...panelRest} className={styles.content({ className: panelClassName })}>
          {children}
        </div>
      </BaseAccordion.Panel>
    </BaseAccordion.Item>
  );
}
