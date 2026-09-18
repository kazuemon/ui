import { CheckMarkIcon, CopyIcon } from '../icons';

// コピーのボタンの中身で、CodeBlock と CopyButton が共有するもの

/** コピーの印。コピーしたあとはチェックに変わる。飾りなので読み上げない（アイコンは aria-hidden） */
export function CopyGlyph({ copied, standalone }: { copied: boolean; standalone?: boolean }) {
  return copied ? <CheckMarkIcon standalone={standalone} /> : <CopyIcon standalone={standalone} />;
}

/**
 * コピーしたことを読み上げる。箱は先に置いておき、中身だけを入れる（role="status" は、あとから置いた箱では読まれないことがある）
 * ボタンの外に置く。中に置くと、文字のボタンの名前に混ざる
 */
export function CopiedStatus({ copied, label }: { copied: boolean; label: string }) {
  return (
    <span role="status" className="sr-only">
      {copied ? label : ''}
    </span>
  );
}
