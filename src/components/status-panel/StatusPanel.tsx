import type { ComponentProps, ReactNode } from 'react';

import { noticeStatusIcons } from '../../internal/notice-surface/NoticeIcon';
import type {
  NoticeStatus,
  NoticeSurfaceStatus,
} from '../../internal/notice-surface/notice-surface';
import { tv } from '../../internal/tv';

export type { NoticeStatus as StatusPanelStatus };

/** 見出しの段。404 やエラーのページ全体を StatusPanel に任せるときは 1 も選べます */
export type StatusPanelHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

// 空状態・見つからない・失敗を伝える、縦に積んだ面（design/backlog.md）
//   アイコン（背景つきのバッジ）→ 見出し → 本文 → 操作の順。ページと同じレイヤーで、影は付けない（原則1）
//   色は状態の色（原則6）。Notice・Callout と同じ status（info・success・warning・danger）で、書かないときは色を持たないグレー（neutral）
//   アイコンの既定の割り当ては Notice・Callout と同じもの（internal/notice-surface の NoticeIcon が持つ既定）を参照する。
//     neutral には既定がない（Notice・Callout と同じ）ので、icon を渡す（原則にない判断。design/backlog.md）
//   バッジ（大きな塗りの中にアイコンを置く形）は Notice の行内アイコンにはない、原則にない新しい見た目なので、
//     形（円・角丸四角）・塗りの濃さ・色の範囲・全体の大きさは design/stories/axis-361〜363 で比較して決める。
//     ここではトークン（--status-panel-*）だけで見た目を決め、比べる案もこのトークンの上書きだけで作る
//   常設のページの一部として読む（原則15）。Notice のような role="status"/"alert" は持たない。見出しの段は headingLevel で選ぶ
//     （Steps・Heading と同じ考え方。部品は自分が文書のどの深さに置かれるかを知らない — 原則20）
//   アイコンは見出しと本文が意味を伝えるので、読み上げには出さない（装飾）
const statusPanel = tv({
  slots: {
    root: [
      'mx-auto flex max-w-(--status-panel-width) flex-col items-center gap-(--status-panel-gap) text-center',
    ],
    badge: [
      'grid shrink-0 place-items-center',
      'size-(--status-panel-badge-size) rounded-(--status-panel-badge-radius)',
    ],
    title: [
      'font-bold text-balance',
      'text-(length:--status-panel-title-size) leading-(--status-panel-title-leading)',
    ],
    description: 'max-w-(--status-panel-description-width) text-body text-fg-muted',
    actions: 'mt-(--status-panel-actions-gap) flex flex-wrap items-center justify-center gap-2',
  },
  variants: {
    // 状態を書かないとき（neutral）は、色を持たないグレー（原則6）
    // バッジと見出しの色は、状態ごとに名前を持つトークン（--status-panel-badge-bg-info など、design/tokens.css）を直接読む。
    //   状態の中でどちらの塗りを使うか（軸361）・見出しにも色を使うか（軸362）を、部品の中で1つの変数に間接参照させて組むと、
    //   その変数はいつも部品の同じ要素で確定してしまい、比較ストーリー側（祖先）からの上書きが届かない
    //   （CSS の変数は、参照した時点の要素で解決するため）。状態ごとに名前を分けた実在するトークンを直接読むことで、
    //   tokens.css の値を差し替えるだけで比較できるようにしている
    status: {
      info: {
        badge: 'bg-(color:--status-panel-badge-bg-info) text-(color:--status-panel-badge-fg-info)',
        title: 'text-(color:--status-panel-title-color-info)',
      },
      success: {
        badge:
          'bg-(color:--status-panel-badge-bg-success) text-(color:--status-panel-badge-fg-success)',
        title: 'text-(color:--status-panel-title-color-success)',
      },
      warning: {
        badge:
          'bg-(color:--status-panel-badge-bg-warning) text-(color:--status-panel-badge-fg-warning)',
        title: 'text-(color:--status-panel-title-color-warning)',
      },
      danger: {
        badge:
          'bg-(color:--status-panel-badge-bg-danger) text-(color:--status-panel-badge-fg-danger)',
        title: 'text-(color:--status-panel-title-color-danger)',
      },
      neutral: {
        badge:
          'bg-(color:--status-panel-badge-bg-neutral) text-(color:--status-panel-badge-fg-neutral)',
        title: 'text-(color:--status-panel-title-color-neutral)',
      },
    },
  },
  defaultVariants: { status: 'neutral' },
});

export interface StatusPanelProps extends Omit<ComponentProps<'div'>, 'title' | 'color'> {
  /**
   * 状態。情報・成功・警告・危険の色です（Notice・Callout と同じ）。書かないときは色を持たないグレー（neutral）です
   */
  status?: NoticeStatus;
  /**
   * バッジの中に置く大きなアイコン。渡すときは `Icon`（`<Icon icon={MagnifyingGlassIcon} size="lg" standalone />` のように）でそろえます。
   * 書かないときは status ごとの既定のアイコン（info・success・warning・danger。Notice・Callout と同じ割り当て）です。
   * neutral には既定がないので、渡してください（見つからないときは虫眼鏡、空のときは箱など）。false でバッジごと出しません
   */
  icon?: ReactNode | false;
  /** 太字の見出し。「まだ一つも作成されていません」のような文 */
  title: ReactNode;
  /**
   * 見出しを描く要素の段。記事や画面の構造に合わせて選びます
   * @default 2
   */
  headingLevel?: StatusPanelHeadingLevel;
  /** 見出しの下に置く本文。状況の説明を書きます */
  children?: ReactNode;
  /** 本文の下に横並びで置く操作（Button・Link）。「作成する」「再読み込み」「トップへ戻る」など */
  actions?: ReactNode;
  /** 面に足すクラス */
  className?: string;
}

/**
 * 空状態・見つからない・失敗を、アイコン・見出し・本文・操作で伝える面
 */
export function StatusPanel({
  status,
  icon,
  title,
  headingLevel = 2,
  children,
  actions,
  className,
  ...props
}: StatusPanelProps) {
  // 状態を書かないときは、色を持たないグレー（原則6）
  const surfaceStatus: NoticeSurfaceStatus = status ?? 'neutral';
  const DefaultIcon = noticeStatusIcons[surfaceStatus];
  const shownIcon =
    icon === false
      ? null
      : (icon ??
        (DefaultIcon ? (
          <DefaultIcon standalone className="size-(--status-panel-icon-size)" />
        ) : null));
  const Tag = `h${headingLevel}` as const;
  const s = statusPanel({ status: surfaceStatus });
  return (
    <div
      data-slot="status-panel"
      data-status={surfaceStatus}
      {...props}
      className={s.root({ className })}
    >
      {shownIcon ? (
        // アイコンは見出しと本文が意味を伝える装飾。読み上げには出さない（原則15）
        <span aria-hidden="true" className={s.badge()}>
          {shownIcon}
        </span>
      ) : null}
      <Tag className={s.title()}>{title}</Tag>
      {children ? <p className={s.description()}>{children}</p> : null}
      {actions ? <div className={s.actions()}>{actions}</div> : null}
    </div>
  );
}
