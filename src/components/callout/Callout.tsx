import { type ComponentProps, type ReactNode, useId } from 'react';

import { NoticeIcon } from '../../internal/notice-surface/NoticeIcon';
import {
  type NoticeAppearance,
  type NoticeColor,
  noticeSurface,
} from '../../internal/notice-surface/notice-surface';

// 記事の中の囲み（補足・注意・メモ）。見た目はお知らせ（Notice）と同じ決まり（internal/notice-surface）で、働きが違う
//   お知らせ: 画面の上であとから出る知らせ。status・alert で読み上げ、閉じる・操作を持つ
//   囲み: 本文にはじめからある補足。role="note" で題を名前にし、読み上げで割り込まない。閉じる・操作を持たない
// 文字は読む文字（--text-body）。記事の本文と同じ大きさで、密度で変わる（原則11）

export type CalloutColor = NoticeColor;
export type CalloutAppearance = NoticeAppearance;

export interface CalloutProps extends Omit<ComponentProps<'div'>, 'title' | 'role' | 'color'> {
  /**
   * 色。情報・成功・警告・危険の状態の色と、色を持たないグレー（neutral）です
   * @default 'neutral'
   */
  color?: CalloutColor;
  /**
   * 見た目。soft は淡い面、muted はグレーの面に小さな題、outline は白い面に状態の色の枠線、filled は濃い塗りです
   * @default 'soft'
   */
  appearance?: CalloutAppearance;
  /**
   * 1 行目の左に置くアイコン。指定しないときは状態の色ごとのアイコン（muted と neutral ではなし）です。false でアイコンを出しません
   */
  icon?: ReactNode | false;
  /** 太字の題。読み上げでは囲みの名前になります */
  title?: ReactNode;
  children?: ReactNode;
}

/**
 * 記事の中の囲み（補足・注意・メモ）
 */
export function Callout({
  color = 'neutral',
  appearance = 'soft',
  icon,
  title,
  children,
  className,
  ...props
}: CalloutProps) {
  const titleId = useId();
  return (
    <div
      role="note"
      aria-labelledby={title ? titleId : undefined}
      data-slot="callout"
      data-color={color}
      data-appearance={appearance}
      {...props}
      className={noticeSurface({ appearance, color, size: 'body', className })}
    >
      <NoticeIcon color={color} appearance={appearance} icon={icon} />
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
