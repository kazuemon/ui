'use client';

import { type ComponentProps, type ReactNode, useEffect, useRef } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { formatFileSize } from './dropzone-utils';
import { Button } from '../button/Button';
import { Progress } from '../progress/Progress';
import { FileIcon, XIcon } from '../../internal/icons';
import { tv } from '../../internal/tv';

// Dropzone で選んだファイルの一覧。Dropzone 自身は選ぶ場所だけを持つので、見せ方はこちらに分ける（アップロードは行わない）
// variant（ADR-0333）: list は名前・大きさを1行ずつ、thumbnail は画像をタイルに並べる。どちらも外すボタンと、
//   渡せば進み具合（Progress）・失敗の文を持てる
const row = tv({
  slots: {
    root: 'flex flex-col gap-2',
    list: 'flex items-center gap-3 rounded-control bg-field px-(--spacing-control-x) py-2',
    icon: 'size-(--spacing-icon) shrink-0 text-fg-muted',
    body: 'flex min-w-0 flex-1 flex-col gap-0.5',
    name: 'truncate text-(length:--text-input) leading-(--leading-input) text-fg',
    meta: 'text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle',
    error: 'text-(length:--text-caption) leading-(--leading-caption) text-fg-danger',
    remove: 'shrink-0',
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
  base: [
    'group relative flex aspect-square flex-col overflow-hidden rounded-control bg-field',
    'data-invalid:outline data-invalid:outline-(length:--border-width-thick) data-invalid:outline-(color:--color-fg-danger)',
  ],
});

export type DropzoneFileListVariant = NonNullable<VariantProps<typeof row>['variant']>;

/** DropzoneFileList の1項目 */
export interface DropzoneFileEntry {
  /** 選んだファイル */
  file: File;
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
  /** 外すボタンを押したときに呼ぶ。渡さないと外すボタンを出さない */
  onRemove?: (file: File, index: number) => void;
  /** 外すボタンの読み上げの名前を作る関数。既定は「外す: {ファイル名}」 */
  removeName?: (file: File) => string;
  /** いちばん外の要素（ul）に付く */
  className?: string;
}

function defaultRemoveName(file: File) {
  return `外す: ${file.name}`;
}

/** thumbnail のタイルに置く画像。ブラウザの中だけの URL（createObjectURL）を、file が変わるたびに作り直す */
function Thumbnail({ file }: { file: File }) {
  const isImage = file.type.startsWith('image/');
  const imgRef = useRef<HTMLImageElement>(null);
  // URL は描画の途中ではなく effect の中で作り、同じ effect の片付けで解放する（描画が中断されても URL が残らない）。
  // setState はせず、img に直接渡す
  useEffect(() => {
    const img = imgRef.current;
    if (!img || !isImage) return undefined;
    const url = URL.createObjectURL(file);
    img.src = url;
    return () => {
      img.removeAttribute('src');
      URL.revokeObjectURL(url);
    };
  }, [file, isImage]);
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
  if (files.length === 0) return null;
  return (
    <ul data-slot="dropzone-file-list" className={s.root({ className })} {...props}>
      {files.map(({ file, progress, errorText }, index) => (
        <li key={`${file.name}-${file.lastModified}-${index}`}>
          {variant === 'list' ? (
            <div className="flex flex-col gap-1">
              <div className={s.list()} data-invalid={errorText ? '' : undefined}>
                <FileIcon className={s.icon()} />
                <div className={s.body()}>
                  <span className={s.name()}>{file.name}</span>
                  <span className={s.meta()}>
                    {formatFileSize(file.size)}
                    {errorText && <span className={s.error()}> ・ {errorText}</span>}
                  </span>
                </div>
                {onRemove && (
                  <Button
                    iconOnly
                    shape="circle"
                    variant="outline"
                    className={s.remove()}
                    aria-label={removeName(file)}
                    onClick={() => onRemove(file, index)}
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
                  aria-label={`${file.name} の進み具合`}
                />
              )}
            </div>
          ) : (
            <div className={tile()} data-invalid={errorText ? '' : undefined}>
              <Thumbnail file={file} />
              {onRemove && (
                <Button
                  iconOnly
                  shape="circle"
                  variant="filled"
                  color="neutral"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  aria-label={removeName(file)}
                  onClick={() => onRemove(file, index)}
                >
                  <XIcon standalone />
                </Button>
              )}
              <span className="truncate bg-surface px-2 py-1 text-(length:--text-caption) leading-(--leading-caption) text-fg">
                {file.name}
              </span>
              {progress != null && (
                <Progress
                  value={progress}
                  size="xs"
                  hideTrack
                  hideValue
                  color="primary"
                  aria-label={`${file.name} の進み具合`}
                  className="absolute inset-x-0 bottom-0"
                />
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
