'use client';

import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import { type ReactNode, use, useId, useState } from 'react';

import { CaretDownIcon } from '../../internal/icons';
import { SidebarNavContext } from './sidebar-context';
import { sidebar } from './sidebar-styles';

export interface SidebarSectionProps {
  /** 節の題。小さく出します。畳んだ列では出さず、読み上げの名前として残します */
  title: string;
  /** 行（SidebarItem）を並べます */
  children?: ReactNode;
  /**
   * 題を押して、節の行を畳めるようにするか。畳んだ列（アイコンだけ）では、いつも全部の行を出します
   * @default false
   */
  collapsible?: boolean;
  /**
   * はじめは開いているか（非制御）。collapsible のときだけ効きます
   * @default true
   */
  defaultExpanded?: boolean;
  /** 開いているか（制御） */
  expanded?: boolean;
  /** 開閉が変わるときに、次の値を渡して呼びます */
  onExpandedChange?: (expanded: boolean) => void;
  /** 節の要素に付きます */
  className?: string;
}

/**
 * 列の中の節。題を付けて、行（SidebarItem）をまとめます。何個でも並べられます。
 * 畳んだ列では題を出さず、次の節とのあいだに線を引きます
 */
export function SidebarSection({
  title,
  children,
  collapsible = false,
  defaultExpanded = true,
  expanded,
  onExpandedChange,
  className,
}: SidebarSectionProps) {
  const nav = use(SidebarNavContext);
  const titleId = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultExpanded);
  const open = expanded ?? uncontrolled;
  const setOpen = (next: boolean) => {
    if (expanded === undefined) setUncontrolled(next);
    onExpandedChange?.(next);
  };
  const rail = nav?.mode === 'rail';
  const s = sidebar({ railed: rail });

  // 畳める節: 題をボタンにし、行の並びを Collapsible で開け閉めする（行の入れ子と同じ動き）
  if (collapsible && !rail) {
    return (
      <BaseCollapsible.Root
        open={open}
        onOpenChange={setOpen}
        render={<li role="none" data-slot="sidebar-section" className={s.section({ className })} />}
      >
        <BaseCollapsible.Trigger
          id={titleId}
          data-slot="sidebar-section-title"
          className={s.sectionToggle()}
        >
          <span className="min-w-0 flex-1 truncate">{title}</span>
          <span aria-hidden="true" className={s.sectionCaret()}>
            <CaretDownIcon />
          </span>
        </BaseCollapsible.Trigger>
        <BaseCollapsible.Panel
          render={<ul aria-labelledby={titleId} />}
          className={s.sectionPanel()}
        >
          {children}
        </BaseCollapsible.Panel>
      </BaseCollapsible.Root>
    );
  }

  return (
    <li role="none" data-slot="sidebar-section" className={s.section({ className })}>
      {rail ? null : (
        <p id={titleId} data-slot="sidebar-section-title" className={s.sectionTitle()}>
          {title}
        </p>
      )}
      <ul
        aria-label={rail ? title : undefined}
        aria-labelledby={rail ? undefined : titleId}
        className="flex flex-col gap-0.5"
      >
        {children}
      </ul>
    </li>
  );
}
