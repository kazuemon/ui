'use client';

import { createContext, type ReactNode, useRef, useState } from 'react';

import type { TagsInputRejectReason } from './tags-input-commit';
import { type TagsFlash, useTagsFlash } from './use-tags-flash';

/**
 * 弾いた・通らなかったことの合図と文。本体（TagsInputControl）が立て、外枠（Field）の下の行にも出す
 * validate を通らなかったときの文は、次に足せたときと、打ち直したときに消す
 */
export function useTagsFeedback() {
  const [invalidMessage, setInvalidMessage] = useState<ReactNode>(null);
  // 弾いたことの一瞬の合図（軸 261）。欄の計算済みの値から、見せる長さを読む
  const controlRef = useRef<HTMLDivElement | null>(null);
  const { flash, fire } = useTagsFlash(controlRef);
  return { invalidMessage, setInvalidMessage, controlRef, flash, fire };
}

export type TagsFeedback = ReturnType<typeof useTagsFeedback>;

/**
 * 内蔵の形（TagsInput）が、合図の状態を外枠の側で持ち、本体に渡す箱
 * info は、利用者が渡した元の infoText（弾いた文と入れ替える前のもの）
 */
export const TagsFeedbackContext = createContext<{
  feedback: TagsFeedback;
  info: ReactNode;
} | null>(null);

/** 弾いたことを、本体の下の行でも一瞬だけ知らせる文。文は呼び出し側が書く（原則20） */
export function tagsRejectText(
  flash: TagsFlash | null,
  rejectMessage: ((reason: TagsInputRejectReason, tag: string) => ReactNode | false) | undefined
): ReactNode {
  const rejected = flash && rejectMessage ? rejectMessage(flash.reason, flash.tag) : null;
  return rejected === false ? null : rejected;
}
