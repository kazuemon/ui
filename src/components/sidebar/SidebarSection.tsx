'use client';

import { type ReactNode, use, useId } from 'react';

import { SidebarNavContext } from './sidebar-context';
import { sidebar } from './sidebar-styles';

export interface SidebarSectionProps {
  /** 節の題。小さく出します。畳んだ列では出さず、読み上げの名前として残します */
  title: string;
  /** 行（SidebarItem）を並べます */
  children?: ReactNode;
  /** 節の要素に付きます */
  className?: string;
}

/**
 * 列の中の節。題を付けて、行（SidebarItem）をまとめます。何個でも並べられます。
 * 畳んだ列では題を出さず、次の節とのあいだに線を引きます
 */
export function SidebarSection({ title, children, className }: SidebarSectionProps) {
  const nav = use(SidebarNavContext);
  const titleId = useId();
  const rail = nav?.mode === 'rail';
  const s = sidebar({ railed: rail });
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
