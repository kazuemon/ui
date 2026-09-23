import type { ComponentProps, ReactNode } from 'react';

import { FileIcon, FolderIcon } from '../../internal/icons';
import { tv } from '../../internal/tv';

// 記事の中で、フォルダとファイルの構成を見せる（README の「本文」の仲間。CodeBlock・Callout・Steps と同じ並び）
//   Tree（src/components/tree）はナビゲーション（開閉・行き先・キーボード操作）の部品。こちらは読みものの中の図版で、
//   行き先も開閉も持たない静的な一覧（実際にフォルダを操作させたいときは Tree を使う）。フック・ref・イベントの props を
//   持たないので、サーバーコンポーネントのまま描ける（'use client' が要らない）
//   文字は CodeBlock の本文と同じ等幅・大きさ（14/24。マウスでも指でも変わらない。原則11・19）
//   ページと同じレイヤーの読みものなので、外枠に影は付けない（原則1）
//
// 字下げと案内線は、深さを JS で数えずに CSS の入れ子だけで作る（Tree は --tree-depth を JS で足すが、
//   こちらは開閉がなく最初から全部描くので、入れ子の ul の margin・padding が積み重なるだけで済む）
//   li 自身は margin・padding を持たない（起点は 0）。行の中身（row）だけが --file-tree-row-px 左を空け、
//     アイコンの中心が --file-tree-guide-left（row-px + アイコン幅/2）に来る
//   子を持つ行の ul（group）は margin-inline-start: --file-tree-guide-left（親の行のアイコン中心に起点をそろえる）、
//     padding-inline-start: --file-tree-indent − --file-tree-guide-left（次の depth の row-px にそろえる）、
//     border-inline-start が案内線そのもの（親のアイコンの中心の真下から、その depth の最後の子の行の高さまで届く）
//   この 2 つの値はどの depth でも同じ値なので、JS の depth を持たずに何段でも同じ計算式になる
//
// Prose の中に置いても、Prose が素の ul・li に当てる見た目（li::before の印・字下げ・項目の間）を打ち消す
//   （書き方は Steps と同じ。list-none・before:content-none・自前の margin をクラスの詳細度で勝たせる）
//
// 軸 275〜278（design/stories/axis-275〜278。決定は下の JSDoc に反映済み）:
//   275 枠の有無・276 案内線の見せ方・277 既定アイコンの色・278 強調した行の見せ方
//   275・276 は props（hideFrame・line）で選べる。277 は FileTreeItem の color、278 は FileTree の color・highlightIndicator

// Prose が素の ul・li に当てる印・字下げ・項目の間を打ち消す（クラス 1 つ以上の詳細度で勝つ。書き方は Steps と同じ）
// list（根）と group（入れ子）の両方に要る。Prose は木の深さに関わらず、中にあるどの ul にも印を当てるため
const listReset = [
  'list-none',
  '[&>li]:relative [&>li]:list-none [&>li]:before:content-none [&>li+li]:mt-0',
];

const fileTree = tv({
  slots: {
    root: [
      'flex min-w-0 flex-col',
      'font-mono text-(length:--text-body-sm-fine) leading-(--leading-body-sm-fine)',
    ],
    head: 'min-w-0 truncate pb-(--spacing) font-bold text-(color:--file-tree-title-fg)',
    // px は frame（枠あり・枠なし）が付ける。ps-0 は Prose の字下げの打ち消し用だが、frame の px と競うので持たせない
    list: [...listReset],
    item: 'flex flex-col',
    row: 'flex min-w-0 items-center gap-(--file-tree-gap) ps-(--file-tree-row-px) pe-(--file-tree-row-pe) text-fg-muted',
    // アイコンの箱。既定のアイコンだけ hideIcons（--file-tree-icon-display）で消せる。渡したアイコンは icon 変体で常に出す
    // grid は使わず [display:var(...)] だけにする（grid クラスと二重に持つと、どちらが勝つかが不定になる）
    // 色は下の kind（folder・file）が既定を付け、itemColor（軸 277）が上書きする
    iconDefault: [
      'size-(--file-tree-icon-size) shrink-0 place-items-center',
      '[display:var(--file-tree-icon-display,grid)] [&_svg]:size-(--file-tree-icon-size)',
    ],
    icon: 'grid size-(--file-tree-icon-size) shrink-0 place-items-center [&_svg]:size-(--file-tree-icon-size)',
    label: 'min-w-0 flex-1 truncate',
    comment: 'ms-auto shrink-0 truncate text-(color:--file-tree-comment-color)',
    group: [
      ...listReset,
      'flex flex-col',
      'ms-(--file-tree-guide-left) ps-[calc(var(--file-tree-indent)-var(--file-tree-guide-left))]',
      '[border-inline-start:var(--file-tree-guide-width)_var(--file-tree-line-style)_var(--file-tree-guide-color)]',
    ],
  },
  variants: {
    // 外枠（軸 275・決定）。既定は CodeBlock と同じグレーの面で囲む。hideFrame で消せる
    // 内側の余白は CodeBlock と同じ値（--file-tree-frame-px・-py。CodeBlock の px-4・py-3 と同じ計算式）を指す
    frame: {
      true: {
        root: 'rounded-control bg-(color:--file-tree-frame-bg)',
        head: 'px-(--file-tree-frame-px) pt-(--file-tree-frame-py) [box-shadow:inset_0_calc(var(--border-width-thin)*-1)_0_0_var(--file-tree-title-line)]',
        list: 'px-(--file-tree-frame-px)',
      },
      false: { list: 'px-0' },
    },
    // 題があるかどうかで、list の上の余白を出し分ける（下の compoundVariants）。
    //   題があるときは head が自分の pt で上の余白を持つので、list は下だけ（pb）。ないときは list が上下（py）を持つ
    titled: { true: {}, false: {} },
    // 段をつなぐ案内線（軸 276・決定。solid・none の 2 つ。dotted は外した）。Steps の line と同じ語
    // root だけに付ける（group は入れ子のたびに描かれるので、そこに付けると子の group が自分の値で上書きしてしまい、
    //   root の指定が下まで届かない。root に付けて、group 側は継承した値を var() で読むだけにする）
    line: {
      solid: { root: '[--file-tree-line-style:solid]' },
      none: { root: '[--file-tree-line-style:none]' },
    },
    // 行の強調（軸 278・決定）。部品の色（FileTree の color）の淡い塗り＋部品の色の文字＋太字。左の線はなし
    //   塗りの色と、塗りを出すか（fill・text）は下の compoundVariants（color × highlightIndicator）が --file-tree-highlight-* に入れる
    //   文字色・太さはここで、強調した行なら常に付ける（indicator に関わらず文字は色付き＋太字のまま）
    highlighted: {
      true: {
        row: '[font-weight:var(--file-tree-highlight-weight)] text-(color:--file-tree-highlight-fg)',
      },
      false: {},
    },
    // FileTree 全体の強調の色（軸 278・決定）。Tree の color・CodeBlock の強調行と同じ語彙
    color: { primary: {}, secondary: {}, neutral: {} },
    // 強調の見せ方（軸 278・決定）。fill は塗りあり（既定）、text は太字だけ（Tree の currentIndicator="text" と同じ考え方）
    highlightIndicator: { fill: {}, text: {} },
    // 既定のフォルダ・ファイルのアイコンの色（軸 277）。フォルダ・ファイルで別トークンにしている
    kind: {
      folder: { iconDefault: 'text-(color:--file-tree-icon-folder-color)' },
      file: { iconDefault: 'text-(color:--file-tree-icon-file-color)' },
    },
    // 行ごとのアイコンの色（軸 277・決定）。既定（neutral）はフォルダ・ファイルの色のまま（iconDefault は kind が付ける。
    //   渡したアイコン＝icon 変体は kind の対象外なので、neutral の既定色はここで付ける）。指定したときだけ変える
    itemColor: {
      neutral: { icon: 'text-(color:--file-tree-icon-color)' },
      primary: {
        iconDefault: 'text-(color:--color-primary)',
        icon: 'text-(color:--color-primary)',
      },
      secondary: {
        iconDefault: 'text-(color:--color-secondary)',
        icon: 'text-(color:--color-secondary)',
      },
    },
  },
  compoundVariants: [
    // list の上下の余白（frame ありのときだけ。titled の有無で出し分ける）
    { frame: true, titled: false, class: { list: 'py-(--file-tree-frame-py)' } },
    { frame: true, titled: true, class: { list: 'pb-(--file-tree-frame-py)' } },
    // 強調の塗り（color × highlightIndicator）。root にだけ付け、行は var() で読む（line と同じ理由）
    {
      color: 'primary',
      highlightIndicator: 'fill',
      class: {
        root: '[--file-tree-highlight-bg:var(--color-primary-subtle)] [--file-tree-highlight-fg:var(--color-on-primary-subtle)]',
      },
    },
    {
      color: 'secondary',
      highlightIndicator: 'fill',
      class: {
        root: '[--file-tree-highlight-bg:var(--color-secondary-subtle)] [--file-tree-highlight-fg:var(--color-on-secondary-subtle)]',
      },
    },
    {
      color: 'neutral',
      highlightIndicator: 'fill',
      class: {
        root: '[--file-tree-highlight-bg:var(--color-select-neutral-selected)] [--file-tree-highlight-fg:var(--color-fg)]',
      },
    },
    {
      color: 'primary',
      highlightIndicator: 'text',
      class: {
        root: '[--file-tree-highlight-bg:transparent] [--file-tree-highlight-fg:var(--color-on-primary-subtle)]',
      },
    },
    {
      color: 'secondary',
      highlightIndicator: 'text',
      class: {
        root: '[--file-tree-highlight-bg:transparent] [--file-tree-highlight-fg:var(--color-on-secondary-subtle)]',
      },
    },
    {
      color: 'neutral',
      highlightIndicator: 'text',
      class: {
        root: '[--file-tree-highlight-bg:transparent] [--file-tree-highlight-fg:var(--color-fg)]',
      },
    },
    // fill のときだけ、行に塗りを敷く
    {
      highlighted: true,
      highlightIndicator: 'fill',
      class: { row: 'bg-(color:--file-tree-highlight-bg)' },
    },
    // 強調した行のアイコンは、kind・itemColor より優先して部品の色（--file-tree-highlight-fg）にする
    //   太さ（bold のパス）は部品側（FileTreeItem）が FolderIcon・FileIcon に渡す
    {
      highlighted: true,
      class: {
        iconDefault: 'text-(color:--file-tree-highlight-fg)',
        icon: 'text-(color:--file-tree-highlight-fg)',
      },
    },
  ],
  defaultVariants: {
    frame: true,
    titled: false,
    line: 'solid',
    highlighted: false,
    kind: 'file',
    itemColor: 'neutral',
    color: 'neutral',
    highlightIndicator: 'fill',
  },
});

export type FileTreeLine = 'solid' | 'none';

export interface FileTreeProps extends Omit<ComponentProps<'div'>, 'title' | 'color'> {
  /** 木の上に出す題（プロジェクト名やルートのフォルダ名など）。省略すると出しません */
  title?: ReactNode;
  /**
   * 外枠を消します。既定では CodeBlock と同じグレーの面で囲みます
   * @default false
   */
  hideFrame?: boolean;
  /**
   * 既定のフォルダ・ファイルのアイコンを出さないようにします。行に渡した icon はそのまま出ます
   * @default false
   */
  hideIcons?: boolean;
  /**
   * 段をつなぐ案内線。solid は細い実線、none は線を引かず字下げだけで見せます
   * @default 'solid'
   */
  line?: FileTreeLine;
  /**
   * 強調した行（FileTreeItem の highlighted）の色。primary・secondary は利用者が選ぶ色、neutral は色を持たないグレーです（原則6）。
   * neutral のとき、アイコンは本文の文字と同じ濃さになります
   * @default 'neutral'
   */
  color?: 'primary' | 'secondary' | 'neutral';
  /**
   * 強調した行の見せ方。fill は淡い塗り＋文字＋太字、text は太字だけです（Tree の currentIndicator="text" と同じ考え方）
   * @default 'fill'
   */
  highlightIndicator?: 'fill' | 'text';
  /** 行（FileTreeItem）を並べます */
  children?: ReactNode;
  /** いちばん外の要素に付きます */
  className?: string;
}

/**
 * 記事の中で、フォルダとファイルの構成を見せます。行き先や開閉は持たない静的な図版です
 * （フォルダの中を実際に操作させたいときは Tree を使います）
 */
export function FileTree({
  title,
  hideFrame = false,
  hideIcons = false,
  line = 'solid',
  color = 'neutral',
  highlightIndicator = 'fill',
  className,
  children,
  style,
  ...props
}: FileTreeProps) {
  const hasTitle = title != null && title !== false;
  const slots = fileTree({ frame: !hideFrame, titled: hasTitle, line, color, highlightIndicator });
  return (
    <div
      data-slot="file-tree"
      className={slots.root({ className })}
      style={hideIcons ? { ...style, ['--file-tree-icon-display' as string]: 'none' } : style}
      {...props}
    >
      {hasTitle ? <div className={slots.head()}>{title}</div> : null}
      <ul role="list" data-slot="file-tree-list" className={slots.list()}>
        {children}
      </ul>
    </div>
  );
}

export interface FileTreeItemProps extends Omit<ComponentProps<'li'>, 'children' | 'color'> {
  /** ファイル・フォルダの名前 */
  label: ReactNode;
  /**
   * 名前の前に置くアイコン。渡さないときは、子を持つかどうかでフォルダ・ファイルの既定のアイコンを出します
   * （FileTree の hideIcons で既定のアイコンだけ消せます。渡したアイコンは残ります）
   */
  icon?: ReactNode;
  /**
   * アイコンの色。指定しないとき（neutral）はフォルダ・ファイルの既定のグレーのままです。ラベルの文字色は変わりません
   * @default 'neutral'
   */
  color?: 'primary' | 'secondary' | 'neutral';
  /** 名前の後ろ、行の右端に添える文（役割や変更点の説明など） */
  comment?: ReactNode;
  /**
   * この行を強調します。色と見せ方は FileTree の color・highlightIndicator に従います
   * @default false
   */
  highlighted?: boolean;
  /** 入れ子の行（FileTreeItem）。渡すとフォルダになります */
  children?: ReactNode;
  /** 行の要素（li）に付きます。知らない props（id・data-*・aria-*）も li に流します */
  className?: string;
}

/**
 * 木の 1 行。中に FileTreeItem を入れると、フォルダになります
 */
export function FileTreeItem({
  label,
  icon,
  color = 'neutral',
  comment,
  highlighted = false,
  className,
  children,
  ...props
}: FileTreeItemProps) {
  const hasChildren = children != null && children !== false;
  const slots = fileTree({
    highlighted,
    kind: hasChildren ? 'folder' : 'file',
    itemColor: color,
  });
  return (
    <li
      data-slot="file-tree-item"
      data-type={hasChildren ? 'folder' : 'file'}
      className={slots.item({ className })}
      {...props}
    >
      <span className={slots.row()}>
        {icon != null ? (
          <span aria-hidden="true" className={slots.icon()}>
            {icon}
          </span>
        ) : (
          <span aria-hidden="true" className={slots.iconDefault()}>
            {hasChildren ? <FolderIcon bold={highlighted} /> : <FileIcon bold={highlighted} />}
          </span>
        )}
        <span data-slot="file-tree-label" className={slots.label()}>
          {label}
        </span>
        {comment != null ? <span className={slots.comment()}>{comment}</span> : null}
      </span>
      {hasChildren ? (
        <ul role="list" data-slot="file-tree-group" className={slots.group()}>
          {children}
        </ul>
      ) : null}
    </li>
  );
}
