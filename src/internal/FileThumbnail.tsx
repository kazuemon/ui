'use client';

import { useEffect, useRef, useState } from 'react';

import { type DropzoneFileEntry, entryIsImage } from './dropzone-utils';
import { FileIcon } from './icons';

/**
 * thumbnail のタイルに置く画像。保存済みのものは url をそのまま使い、いま選んだものはブラウザの中だけの URL（createObjectURL）を、
 * file が変わるたびに作り直す。保存済みの url の画像が読めないときは、画像でないファイルと同じアイコンにする
 * DropzoneFileList の thumbnail と、Attachment の縮小画像が使う（iconClassName でアイコンの大きさを差し替える）
 */
export function FileThumbnail({
  entry,
  iconClassName = 'size-(--icon-size-lg)',
}: {
  entry: DropzoneFileEntry;
  iconClassName?: string;
}) {
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
        <FileIcon className={iconClassName} />
      </div>
    );
  }
  return <img ref={imgRef} alt="" className="size-full object-cover" />;
}
