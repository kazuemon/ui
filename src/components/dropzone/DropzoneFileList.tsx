'use client';

import { type ComponentProps, type ReactNode, useEffect, useRef, useState } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { formatFileSize } from './dropzone-utils';
import { Button } from '../button/Button';
import { Progress } from '../progress/Progress';
import { focusRing } from '../../internal/focus-styles';
import { FileIcon, XIcon } from '../../internal/icons';
import { NewTabNote } from '../../internal/link-parts';
import { tv } from '../../internal/tv';

// Dropzone で選んだファイルの一覧。Dropzone 自身は選ぶ場所だけを持つので、見せ方はこちらに分ける（アップロードは行わない）
// variant（ADR-0333）: list は名前・大きさを1行ずつ、thumbnail は画像をタイルに並べる。どちらも外すボタンと、
//   渡せば進み具合（Progress）・失敗の文を持てる
// 保存済みのファイル（file を持たず、name・size・url で書いた項目）は、いま選んだものと同じ行で並べる（軸 491）
//   url があれば名前を下線のリンクにする。それが見分けになる。「保存済み」などの文は部品が付けず、項目の caption で使う側が添える
const savedLink = [
  'rounded-xs text-inherit underline underline-offset-[0.2em]',
  'decoration-(--color-link-underline) hover:decoration-(--color-link-underline-hover)',
  'transition-[outline-color,outline-offset] duration-(--focus-ring-duration)',
  ...focusRing,
];

const row = tv({
  slots: {
    root: 'flex flex-col gap-2',
    list: 'flex items-center gap-3 rounded-control bg-field px-(--spacing-control-x) py-2',
    icon: 'size-(--spacing-icon) shrink-0 text-fg-muted',
    body: 'flex min-w-0 flex-1 flex-col gap-0.5',
    // リンクのフォーカスの線が切れないよう、線の分だけ内側に余白を取り、外側の余白で打ち消す
    name: '-m-1 truncate p-1 text-(length:--text-input) leading-(--leading-input) text-fg',
    meta: 'text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle',
    error: 'text-(length:--text-caption) leading-(--leading-caption) text-fg-danger',
    remove: 'shrink-0',
    link: savedLink,
  },
  variants: {
    variant: {
      list: {},
      thumbnail: {
        root: 'grid grid-cols-2 gap-3 sm:grid-cols-3',
      },
    },
  },
});

const tile = tv({
  slots: {
    base: [
      'group relative flex aspect-square flex-col overflow-hidden rounded-control bg-field',
      'data-invalid:outline data-invalid:outline-(length:--border-width-thick) data-invalid:outline-(color:--color-fg-danger)',
    ],
    caption:
      'truncate bg-surface px-2 py-1 text-(length:--text-caption) leading-(--leading-caption) text-fg',
    link: savedLink,
    // 項目の caption。左上に小さな札で置き、長ければ切る
    mark: 'absolute top-1 left-1 max-w-[calc(100%-var(--spacing)*2)] rounded-pill bg-surface px-2 py-0.5 text-(length:--text-caption) leading-(--leading-caption) text-fg-muted',
    // 切るのは中の文。札の中に置いたリンクのフォーカスの線が切れないよう、内側に余白を取り、外側の余白で打ち消す。
    // 左右は札の余白の分まで取る（Link は自分の左右の余白を外へ張り出すので、そのぶん広く要る）
    markText: '-mx-2 -my-1 block truncate px-2 py-1',
  },
});

export type DropzoneFileListVariant = NonNullable<VariantProps<typeof row>['variant']>;

/**
 * DropzoneFileList の1項目。いま選んだファイルは file を、保存済みのファイル（サーバーにあるもの）は file を書かずに name・size・url を渡す
 */
export interface DropzoneFileEntry {
  /** いま選んだファイル。書かない項目は保存済みのファイルとして、url があれば名前を下線のリンクにする */
  file?: File;
  /** 名前。書かないときは file の名前 */
  name?: string;
  /** 大きさ（バイト）。書かないときは file の大きさ。どちらもないときは大きさを出さない */
  size?: number;
  /** 保存済みのファイルの URL。名前のリンクの行き先になり、thumbnail では画像として出す */
  url?: string;
  /** ファイルの種類（MIME タイプ）。thumbnail で画像として出すかを決める。書かないときは file の種類、なければ url の拡張子（data URL なら種類）で決める */
  type?: string;
  /**
   * 名前に小さく添える文（「保存済み」、保存した日時など）。list では大きさの後ろに、thumbnail では左上の札に出す。
   * 渡さないときは何も添えない
   */
  caption?: ReactNode;
  /** アップロードの進み具合（0〜100）。渡さないときは進み具合の行を出さない */
  progress?: number;
  /** そのファイルだけの失敗（アップロードの失敗など）。渡すと名前の下に赤い文字で出す */
  errorText?: ReactNode;
}

export interface DropzoneFileListProps extends Omit<ComponentProps<'ul'>, 'children' | 'color'> {
  /** 並べるファイル */
  files: DropzoneFileEntry[];
  /**
   * 見せ方。list は名前・大きさを1行ずつ、thumbnail は画像を正方形のタイルに並べる（画像でないファイルはアイコン）
   * @default 'list'
   */
  variant?: DropzoneFileListVariant;
  /**
   * 外すボタンを押したときに呼ぶ。押した項目と、その位置を受け取る。渡さないと外すボタンを出さない。
   * 受け取るのは File ではなく項目（DropzoneFileEntry）。いま選んだファイルは entry.file で取り出す
   */
  onRemove?: (entry: DropzoneFileEntry, index: number) => void;
  /**
   * 外すボタンの読み上げの名前を作る関数。既定は、いま選んだものが「外す: {ファイル名}」、保存済みのものが「削除: {ファイル名}」。
   * 受け取るのは File ではなく項目（DropzoneFileEntry）
   */
  removeName?: (entry: DropzoneFileEntry) => string;
  /** いちばん外の要素（ul）に付く */
  className?: string;
}

const entryName = (entry: DropzoneFileEntry) => entry.name ?? entry.file?.name ?? '';
const entrySize = (entry: DropzoneFileEntry) => entry.size ?? entry.file?.size;
const IMAGE_EXTENSION = /\.(avif|bmp|gif|jpe?g|png|svg|webp)(?:[?#]|$)/i;
const entryIsImage = (entry: DropzoneFileEntry) => {
  const type = entry.type ?? entry.file?.type;
  if (type) return type.startsWith('image/');
  return (
    entry.url != null && (entry.url.startsWith('data:image/') || IMAGE_EXTENSION.test(entry.url))
  );
};

function defaultRemoveName(entry: DropzoneFileEntry) {
  return `${entry.file ? '外す' : '削除'}: ${entryName(entry)}`;
}

/** 項目の名前。保存済みで url があればリンクにする（新しいタブで開く） */
function EntryName({ entry, className }: { entry: DropzoneFileEntry; className: string }) {
  const name = entryName(entry);
  if (entry.file || !entry.url) return name;
  return (
    <a href={entry.url} target="_blank" rel="noreferrer" className={`relative ${className}`}>
      {name}
      <NewTabNote />
    </a>
  );
}

/**
 * thumbnail のタイルに置く画像。保存済みのものは url をそのまま使い、いま選んだものはブラウザの中だけの URL（createObjectURL）を、
 * file が変わるたびに作り直す。保存済みの url の画像が読めないときは、画像でないファイルと同じアイコンにする
 */
function Thumbnail({ entry }: { entry: DropzoneFileEntry }) {
  const { file, url: savedUrl } = entry;
  // 読めなかった url を覚える。url が変われば、もう一度画像として読む
  const [failedUrl, setFailedUrl] = useState<string>();
  const failed = !file && savedUrl != null && failedUrl === savedUrl;
  const isImage = entryIsImage(entry) && (file != null || savedUrl != null) && !failed;
  const imgRef = useRef<HTMLImageElement>(null);
  // URL は描画の途中ではなく effect の中で作り、同じ effect の片付けで解放する（描画が中断されても URL が残らない）。
  // setState はせず、img に直接渡す
  useEffect(() => {
    const img = imgRef.current;
    if (!img || !isImage || !file) return undefined;
    const url = URL.createObjectURL(file);
    img.src = url;
    return () => {
      img.removeAttribute('src');
      URL.revokeObjectURL(url);
    };
  }, [file, isImage]);
  if (isImage && !file) {
    return (
      <img
        src={savedUrl}
        alt=""
        className="size-full object-cover"
        onError={() => setFailedUrl(savedUrl)}
      />
    );
  }
  if (!isImage) {
    return (
      <div className="flex flex-1 items-center justify-center text-fg-muted">
        <FileIcon className="size-(--icon-size-lg)" />
      </div>
    );
  }
  return <img ref={imgRef} alt="" className="size-full object-cover" />;
}

/**
 * Dropzone で選んだファイルの一覧。名前・大きさと外すボタンを見せる（アップロードそのものは行わない）
 *
 * 進み具合を見せたいときは、files に progress（0〜100）を渡す。アップロードの実行と、値の更新は使う側が行う
 */
export function DropzoneFileList({
  files,
  variant = 'list',
  onRemove,
  removeName = defaultRemoveName,
  className,
  ...props
}: DropzoneFileListProps) {
  const s = row({ variant });
  const t = tile();
  if (files.length === 0) return null;
  return (
    <ul data-slot="dropzone-file-list" className={s.root({ className })} {...props}>
      {files.map((entry, index) => {
        const { file, progress, errorText, caption } = entry;
        const name = entryName(entry);
        const size = entrySize(entry);
        const saved = file ? undefined : '';
        return (
          <li key={`${name}-${file?.lastModified ?? entry.url ?? ''}-${index}`}>
            {variant === 'list' ? (
              <div className="flex flex-col gap-1">
                <div
                  className={s.list()}
                  data-invalid={errorText ? '' : undefined}
                  data-saved={saved}
                >
                  <FileIcon className={s.icon()} />
                  <div className={s.body()}>
                    <span className={s.name()}>
                      <EntryName entry={entry} className={s.link()} />
                    </span>
                    <span className={s.meta()}>
                      {size != null && formatFileSize(size)}
                      {caption != null && (
                        <span>
                          {size != null && ' ・ '}
                          {caption}
                        </span>
                      )}
                      {errorText && <span className={s.error()}> ・ {errorText}</span>}
                    </span>
                  </div>
                  {onRemove && (
                    <Button
                      iconOnly
                      shape="circle"
                      variant="outline"
                      className={s.remove()}
                      aria-label={removeName(entry)}
                      onClick={() => onRemove(entry, index)}
                    >
                      <XIcon standalone />
                    </Button>
                  )}
                </div>
                {progress != null && (
                  <Progress
                    value={progress}
                    size="xs"
                    color="primary"
                    aria-label={`${name} の進み具合`}
                  />
                )}
              </div>
            ) : (
              <div
                className={t.base()}
                data-invalid={errorText ? '' : undefined}
                data-saved={saved}
              >
                <Thumbnail entry={entry} />
                {caption != null && (
                  <span className={t.mark()}>
                    <span className={t.markText()}>{caption}</span>
                  </span>
                )}
                {onRemove && (
                  <Button
                    iconOnly
                    shape="circle"
                    variant="filled"
                    color="neutral"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                    aria-label={removeName(entry)}
                    onClick={() => onRemove(entry, index)}
                  >
                    <XIcon standalone />
                  </Button>
                )}
                <span className={t.caption()}>
                  <EntryName entry={entry} className={t.link()} />
                </span>
                {progress != null && (
                  <Progress
                    value={progress}
                    size="xs"
                    hideTrack
                    hideValue
                    color="primary"
                    aria-label={`${name} の進み具合`}
                    className="absolute inset-x-0 bottom-0"
                  />
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
