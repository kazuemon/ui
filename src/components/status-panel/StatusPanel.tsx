import type { ComponentProps, ReactNode } from 'react';

import { noticeStatusIcons } from '../../internal/notice-surface/NoticeIcon';
import {
  type NoticeStatus,
  type NoticeSurfaceStatus,
  type NoticeVariant,
  noticeSurface,
} from '../../internal/notice-surface/notice-surface';
import { cn, tv } from '../../internal/tv';

export type { NoticeStatus as StatusPanelStatus, NoticeVariant };

/** 見出しの段。404 やエラーのページ全体を StatusPanel に任せるときは 1 も選べます */
export type StatusPanelHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** バッジの形（design/props.md の shape） */
export type StatusPanelShape = 'circle' | 'square';

/** 全体の大きさ。sm は一覧の中の空状態など控えめな場面、lg は 404・エラーのページ全体を任せる場面向け（ADR-0328） */
export type StatusPanelSize = 'sm' | 'md' | 'lg';

// 空状態・見つからない・失敗を伝える、縦に積んだ面（design/backlog.md）
//   アイコン（背景つきのバッジ）→ 見出し → 本文 → 操作の順。ページと同じレイヤーで、影は付けない（原則1）
//   Notice の別の形として作る（ADR-0326・0327）。色は internal/notice-surface の noticeSurface（Notice・Callout・Toast と共有）をそのまま計算に使い、
//     variant（soft・filled・outline・muted）と status で、バッジの塗り・アイコンの色・見出しの色を Notice と同じ配分にする。
//     色の計算ロジックを重複させないため、ここでは自分で status ごとの色を持たない
//   noticeSurface の出力には Notice の並べ方（横並び・お知らせの余白・面の塗り）も含まれるが、StatusPanel は縦積みで面を持たない（原則1）ので、
//     root では色の変数（--notice-*）だけを受け取り、並び・余白・塗り・枠線は打ち消す（tv の変数はあとに書いたクラスが勝つ）
//   バッジの形（shape）と全体の大きさ（size）は Notice にはない、StatusPanel 固有の軸（ADR-0326・0328）
//   常設のページの一部として読む（原則15）。Notice のような role="status"/"alert" は持たない。見出しの段は headingLevel で選ぶ
//     （Steps・Heading と同じ考え方。部品は自分が文書のどの深さに置かれるかを知らない — 原則20）
//   アイコンは見出しと本文が意味を伝えるので、読み上げには出さない（装飾）
const statusPanel = tv({
  slots: {
    root: [
      'mx-auto flex max-w-(--status-panel-width) flex-col items-center gap-(--status-panel-gap) text-center',
      // noticeSurface が持ち込む横並び・余白・面の塗り・枠線を打ち消す（色の変数 --notice-* は打ち消さず、下の要素へ引き継ぐ）
      'rounded-none border-0 bg-transparent p-0',
    ],
    badge: [
      'grid shrink-0 place-items-center',
      'size-(--status-panel-badge-size)',
      // 塗りとアイコンの色は、root が受け取った Notice の変数をそのまま使う
      'bg-(color:--notice-bg) text-(color:--notice-icon-color)',
      // アイコンの大きさは size で決める。既定のアイコンだけでなく、icon に渡したアイコン（Icon など）にも同じ大きさを強制する
      //   （子孫セレクタなので、アイコン側が自分で付けた大きさのクラスより詳細度が高く、必ず勝つ）
      '[&_svg]:size-(--status-panel-icon-size)',
    ],
    title: ['font-bold text-balance'],
    description: 'max-w-(--status-panel-description-width) text-body text-fg-muted',
    actions: 'mt-(--status-panel-actions-gap) flex flex-wrap items-center justify-center gap-2',
  },
  variants: {
    // 見出しの色は Notice の --notice-title-color を使うが、filled だけは例外（下のコメント）。
    // outline だけ、Notice と同じくバッジに状態の色の枠線を引く（バッジは面ではないので枠線は付けない）
    variant: {
      soft: { title: 'text-(color:--notice-title-color)' },
      // Notice の filled は面そのものが塗りなので、見出しは塗りの上で読める色（白 or 濃紺）にする。
      // StatusPanel は塗りを持つのがバッジだけでページの地は白いままなので、同じ色（--notice-title-color）を見出しに使うと
      // 白地に白文字で消える。ここだけ、バッジの前景色と同じ状態のインク色（白地でも読める前景用の値）にする
      filled: { title: 'text-(color:--notice-ink)' },
      outline: {
        title: 'text-(color:--notice-title-color)',
        badge: 'border border-(color:--notice-ink)',
      },
      muted: { title: 'text-(color:--notice-title-color)' },
    },
    shape: {
      circle: { badge: 'rounded-pill' },
      square: { badge: 'rounded-card' },
    },
    size: {
      sm: {
        root: '[--status-panel-gap:var(--status-panel-gap-sm)] [--status-panel-width:var(--status-panel-width-sm)]',
        badge:
          '[--status-panel-badge-size:var(--status-panel-badge-size-sm)] [--status-panel-icon-size:var(--status-panel-icon-size-sm)]',
        title: 'text-heading-md',
        actions: '[--status-panel-actions-gap:var(--status-panel-gap-sm)]',
      },
      md: {
        root: '[--status-panel-gap:var(--status-panel-gap-md)] [--status-panel-width:var(--status-panel-width-md)]',
        badge:
          '[--status-panel-badge-size:var(--status-panel-badge-size-md)] [--status-panel-icon-size:var(--status-panel-icon-size-md)]',
        title: 'text-heading-lg',
        actions: '[--status-panel-actions-gap:var(--status-panel-gap-md)]',
      },
      lg: {
        root: '[--status-panel-gap:var(--status-panel-gap-lg)] [--status-panel-width:var(--status-panel-width-lg)]',
        badge:
          '[--status-panel-badge-size:var(--status-panel-badge-size-lg)] [--status-panel-icon-size:var(--status-panel-icon-size-lg)]',
        title: 'text-heading-xl',
        actions: '[--status-panel-actions-gap:var(--status-panel-gap-lg)]',
      },
    },
  },
  // muted は Notice と同じく、見出しを 1 段小さくする（色だけでなく大きさでも控えめにする）。
  //   Notice は data-slot="notice-title" を持つ要素にだけ効くセレクタで小さくするが、StatusPanel の見出しにはその data-slot がないので効かない。
  //   ここで size ごとに、見出しの大きさを直接指定する（sm は見出しの段の外の --text-label、md・lg は 1 段小さい見出し）
  compoundVariants: [
    { variant: 'muted', size: 'sm', class: { title: 'text-label' } },
    { variant: 'muted', size: 'md', class: { title: 'text-heading-md' } },
    { variant: 'muted', size: 'lg', class: { title: 'text-heading-lg' } },
  ],
  defaultVariants: { variant: 'soft', shape: 'square', size: 'md' },
});

export interface StatusPanelProps extends Omit<ComponentProps<'div'>, 'title' | 'color'> {
  /**
   * 状態。情報・成功・警告・危険の色です（Notice・Callout と同じ）。書かないときは色を持たないグレー（neutral）です
   */
  status?: NoticeStatus;
  /**
   * 見た目。soft は淡い塗りに状態の色の濃いバッジと見出し、filled は白文字が載る濃い塗り（警告だけ黄色に濃紺）、
   * outline は白い面に状態の色の枠線、muted はグレーの面に、状態の色の小さめの見出しです。Notice・Callout と同じ見た目の決まりです
   * @default 'soft'
   */
  variant?: NoticeVariant;
  /**
   * バッジの形
   * @default 'square'
   */
  shape?: StatusPanelShape;
  /**
   * 全体の大きさ。sm は一覧やカードの中の空状態など控えめな場面、lg は 404・エラーのページ全体を任せる場面向けです
   * @default 'md'
   */
  size?: StatusPanelSize;
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
  variant = 'soft',
  shape = 'square',
  size = 'md',
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
  // 大きさは badge の [&_svg]:size-(--status-panel-icon-size) がそろえるので、ここでは付けない
  const shownIcon =
    icon === false ? null : (icon ?? (DefaultIcon ? <DefaultIcon standalone /> : null));
  const Tag = `h${headingLevel}` as const;
  const s = statusPanel({ variant, shape, size });
  // Notice・Callout と同じ色の計算（--notice-bg・-icon-color・-title-color・-ink など）を、root で受け取る
  const surface = noticeSurface({ variant, status: surfaceStatus, size: 'control' });
  return (
    <div
      data-slot="status-panel"
      data-status={surfaceStatus}
      data-variant={variant}
      {...props}
      className={cn(surface, s.root({ className }))}
    >
      {shownIcon ? (
        // アイコンは見出しと本文が意味を伝える装飾。読み上げには出さない（原則15）
        <span aria-hidden="true" className={s.badge()}>
          {shownIcon}
        </span>
      ) : null}
      <Tag className={s.title()}>{title}</Tag>
      {/* children は ReactNode なので、ブロック要素を渡しても不正なネストにならない div にする */}
      {children ? <div className={s.description()}>{children}</div> : null}
      {actions ? <div className={s.actions()}>{actions}</div> : null}
    </div>
  );
}
