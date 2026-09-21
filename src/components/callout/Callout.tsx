'use client';

import { type ComponentProps, type ReactNode, useId } from 'react';

import { NoticeIcon } from '../../internal/notice-surface/NoticeIcon';
import {
  type NoticeStatus,
  type NoticeVariant,
  noticeSurface,
} from '../../internal/notice-surface/notice-surface';

// 記事の中の囲み（補足・注意・メモ）。見た目はお知らせ（Notice）と同じ決まり（internal/notice-surface）で、働きが違う
//   お知らせ: 画面の上であとから出る知らせ。status・alert で読み上げ、閉じる・操作を持つ
//   囲み: 本文にはじめからある補足。role="note" で題を名前にし、読み上げで割り込まない。閉じる・操作を持たない
// 文字は読む文字（--text-body）。記事の本文と同じ大きさで、密度で変わる（原則11）

export interface CalloutProps extends Omit<ComponentProps<'div'>, 'title' | 'role' | 'color'> {
  /** 状態。情報・成功・警告・危険の色です。書かないときは色を持たないグレーです */
  status?: NoticeStatus;
  /**
   * 見た目。soft は淡い面、muted はグレーの面に小さな題、outline は白い面に状態の色の枠線、filled は濃い塗りです
   * @default 'soft'
   */
  variant?: NoticeVariant;
  /**
   * 1 行目の左に置くアイコン。書かないときは状態ごとのアイコン（muted と状態なしではなし）です。false でアイコンを出しません
   */
  icon?: ReactNode | false;
  /** 太字の題。読み上げでは囲みの名前になります */
  title?: ReactNode;
  /** 囲みの中身（補足の文） */
  children?: ReactNode;
  /** 囲みの面に足すクラス */
  className?: string;
}

/**
 * 記事の中の囲み（補足・注意・メモ）
 */
export function Callout({
  status,
  variant = 'soft',
  icon,
  title,
  children,
  className,
  ...props
}: CalloutProps) {
  const titleId = useId();
  // 状態を書かないときは、色を持たないグレー
  const surfaceStatus = status ?? 'neutral';
  return (
    <div
      role="note"
      aria-labelledby={title ? titleId : undefined}
      data-slot="callout"
      data-status={surfaceStatus}
      data-variant={variant}
      {...props}
      className={noticeSurface({ variant, status: surfaceStatus, size: 'body', className })}
    >
      <NoticeIcon status={surfaceStatus} variant={variant} icon={icon} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title ? (
          <p
            id={titleId}
            data-slot="notice-title"
            className="font-bold text-(color:--notice-title-color)"
          >
            {title}
          </p>
        ) : null}
        {children ? <div>{children}</div> : null}
      </div>
    </div>
  );
}
