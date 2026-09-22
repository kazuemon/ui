import { tv } from '../tv';

// お知らせ（Notice）と記事の中の囲み（Callout）で共有する見た目。見た目の決まりをここ 1 か所に置き、読み上げと操作は部品ごとに持つ
// （Button と、ボタンの見た目の Link と同じ分け方）

/** お知らせの状態。情報・成功・警告・危険の色です。書かないときは色を持たないグレー（記事の中のメモなど） */
export type NoticeStatus = 'info' | 'success' | 'warning' | 'danger';

/** 見た目の割り当てに使う状態。状態を書かないときは neutral（色を持たないグレー） */
export type NoticeSurfaceStatus = NoticeStatus | 'neutral';

/**
 * 見た目（design/adr/0043）
 * soft: タグと同じ淡い面に、同じ色相の濃い題とアイコン、濃紺の本文（既定）
 * filled: 白文字が載る濃い塗り。警告だけは黄色の塗りに濃紺（design/adr/0038）
 * outline: 白い面に、1px の状態の色の枠線。アイコンも枠線の色、文字は濃紺
 * muted: 入力欄と同じグレーの面に、状態の色の小さな題と濃紺の本文。アイコンは既定で出さない（記事の中の補足など、控えめに置くとき）
 */
export type NoticeVariant = 'soft' | 'filled' | 'outline' | 'muted';

// お知らせ（design/adr/0043）
// 原則1: 影は付けない。お知らせそのものは押せない。押せるのは中のリンクとボタンだけ（白いボタンは、ボタンなので影がある）
// 形: アイコン → 題・本文・操作を縦に積み、× は右上。角丸は部品と同じ（--radius-control）。余白と文字は部品の寸法（密度で変わる）
//   余白は --spacing-control-x、アイコンと文の間は --spacing-control-x から 4px 引いた値
// 色は状態の役割（--color-{状態}・--color-on-{状態}・--color-fg-{状態}・--color-{状態}-subtle）を status で受け取り、
//   見た目（variant）で --notice-bg・--notice-fg・--notice-title-color・--notice-icon-color・--notice-ring-color に割り当てる
// フォーカスの線（design/adr/0031）: soft と outline は濃紺（--color-focus）。filled は塗りの上で青が見えない（1.00〜1.48:1）ので、
//   中のリンク・ボタン・× の線を文字の色（白か濃紺）にする（ADR-0031 の例外）
// 中のリンクは、お知らせの文字の色にする（塗りの上でも読めるように）。操作の場所のリンクは太字
export const noticeSurface = tv({
  base: [
    'flex items-start gap-x-[calc(var(--spacing-control-x)-var(--spacing))] rounded-control p-(--spacing-control-x)',
    'bg-(color:--notice-bg) text-(color:--notice-fg)',
    '[--color-focus-ring:var(--notice-ring-color)] [&_a]:[--link-color:currentColor]',
    // 中の線は、部品の色に従わせない。お知らせの線の色のまま
    '[--focus-follow-color:initial]',
  ],
  variants: {
    variant: {
      // 淡い面に、状態の色の題とアイコン、濃紺の本文（淡い面の上の濃い色は 4.52〜5.93、本文は 12.20〜12.44）
      soft: [
        '[--notice-bg:var(--notice-subtle)] [--notice-fg:var(--color-fg)]',
        '[--notice-icon-color:var(--notice-ink)] [--notice-ring-color:var(--color-focus)] [--notice-title-color:var(--notice-ink)]',
      ],
      // 濃い塗りに、同じ色の題・本文・アイコン。縁の線は付けない（ADR-0057）。黄色の上は青でも 3.76 あるが、ほかの塗りとそろえて文字の色の線にする
      filled: [
        '[--notice-bg:var(--notice-fill)] [--notice-fg:var(--notice-on-fill)]',
        '[--notice-icon-color:var(--notice-fg)] [--notice-ring-color:var(--notice-fg)] [--notice-title-color:var(--notice-fg)]',
      ],
      // 白い面に、1px の状態の色の枠線。アイコンも枠線の色、文字は濃紺
      outline: [
        'border border-(color:--notice-ink)',
        '[--notice-bg:var(--color-surface)] [--notice-fg:var(--color-fg)]',
        '[--notice-icon-color:var(--notice-ink)] [--notice-ring-color:var(--color-focus)] [--notice-title-color:var(--notice-fg)]',
      ],
      // グレーの面に、状態の色の小さな題（ラベルの大きさ）。色は題とアイコンにだけ出す
      muted: [
        '[--notice-bg:var(--color-field)] [--notice-fg:var(--color-fg)]',
        '[--notice-icon-color:var(--notice-ink)] [--notice-ring-color:var(--color-focus)] [--notice-title-color:var(--notice-ink)]',
        '[&_[data-slot=notice-title]]:text-(length:--notice-small-title-size) [&_[data-slot=notice-title]]:leading-(--notice-small-title-leading)',
      ],
    },
    // 文字の大きさ。control は部品の文字（Notice）、body は読む文字（Callout）
    // アイコンは 1 行目の中央にそろえる（行の高さとアイコンの差の半分だけ下げる）。muted の小さな題は、control でラベル、body で注記の大きさ
    size: {
      control: [
        'text-(length:--text-control) leading-(--leading-control)',
        '[--notice-icon-offset:calc((var(--leading-control)-var(--spacing-icon))/2)]',
        '[--notice-small-title-leading:var(--leading-label)] [--notice-small-title-size:var(--text-label)]',
      ],
      body: [
        'text-body',
        '[--notice-icon-offset:calc((var(--leading-body)-var(--spacing-icon))/2)]',
        '[--notice-small-title-leading:var(--leading-body-sm)] [--notice-small-title-size:var(--text-body-sm)]',
      ],
    },
    status: {
      info: '[--notice-fill:var(--color-info)] [--notice-ink:var(--color-fg-info)] [--notice-on-fill:var(--color-on-info)] [--notice-subtle:var(--color-info-subtle)]',
      success:
        '[--notice-fill:var(--color-success)] [--notice-ink:var(--color-fg-success)] [--notice-on-fill:var(--color-on-success)] [--notice-subtle:var(--color-success-subtle)]',
      warning:
        '[--notice-fill:var(--color-warning)] [--notice-ink:var(--color-fg-warning)] [--notice-on-fill:var(--color-on-warning)] [--notice-subtle:var(--color-warning-subtle)]',
      danger:
        '[--notice-fill:var(--color-danger)] [--notice-ink:var(--color-fg-danger)] [--notice-on-fill:var(--color-on-danger)] [--notice-subtle:var(--color-danger-subtle)]',
      // 色を持たないグレー（原則6）。淡い面は入力欄の塗り、濃い塗りはトグルの ON と同じ濃いグレー
      neutral:
        '[--notice-fill:var(--color-neutral-strong)] [--notice-ink:var(--color-fg-muted)] [--notice-on-fill:var(--color-on-neutral-strong)] [--notice-subtle:var(--color-field)]',
    },
  },
  defaultVariants: { variant: 'soft', size: 'control' },
});

// アイコンは文と並ぶので線は Regular（design/adr/0018）。警告と危険は入力欄の下の行と同じ形（design/adr/0041）
