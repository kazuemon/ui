'use client';

import type { ReactElement } from 'react';

import { CheckMarkIcon, CopyIcon, WarningCircleIcon } from '../icons';
import { Tooltip } from '../../components/tooltip/Tooltip';

// コピーのボタンの中身で、CodeBlock と CopyButton が共有するもの

/** コピーの印。コピーしたあとはチェックに変わる。飾りなので読み上げない（アイコンは aria-hidden） */
export function CopyGlyph({ copied, standalone }: { copied: boolean; standalone?: boolean }) {
  return copied ? <CheckMarkIcon standalone={standalone} /> : <CopyIcon standalone={standalone} />;
}

/**
 * コピーの結果を読み上げる。箱は先に置いておき、中身だけを入れる（role="status" は、あとから置いた箱では読まれないことがある）
 * ボタンの外に置く。中に置くと、文字のボタンの名前に混ざる
 * 写せなかったことも割り込ませずに知らせる（原則15）
 */
export function CopiedStatus({
  copied,
  copiedText,
  failed,
  copyErrorText,
}: {
  copied: boolean;
  copiedText: string;
  failed?: boolean;
  copyErrorText?: string;
}) {
  const message = copied ? copiedText : failed && copyErrorText ? copyErrorText : '';
  return (
    <span role="status" className="sr-only">
      {message}
    </span>
  );
}

/**
 * 写せなかったことを知らせる吹き出しの色。淡い危険の面に、同じ色相の濃い文字（原則6・原則12）
 * 大きさ・角・影・輪郭・文字の大きさは、写せたことを知らせる吹き出しとまったく同じ（面と文字の色だけを差し替える）
 */
export const copyErrorTooltipClass = 'bg-danger-subtle text-fg-danger';

/** 写せなかったことを知らせる吹き出しの中身。丸の「!」を文の前に置く（原則6）。文と並ぶので線は Regular（原則21） */
export function CopyErrorContent({ text }: { text: string }) {
  return (
    <span className="flex items-start gap-(--field-message-gap)">
      <WarningCircleIcon className="size-(--leading-caption) shrink-0" />
      {text}
    </span>
  );
}

/**
 * 吹き出しを持たない形（CopyButton の feedback="label"、CodeBlock のコピーのボタン）で、
 * 写せなかったことだけを吹き出しで知らせる。出ていないあいだは Tooltip を止めておき、
 * マウスを載せたとき・長押ししたときの振る舞いを変えない
 */
export function CopyErrorTooltip({
  open,
  text,
  children,
}: {
  open: boolean;
  text: string;
  children: ReactElement;
}) {
  return (
    <Tooltip
      content={<CopyErrorContent text={text} />}
      className={copyErrorTooltipClass}
      open={open}
      disabled={!open}
    >
      {children}
    </Tooltip>
  );
}
