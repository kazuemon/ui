import type { ReactNode } from 'react';

// 打った文字をタグに確定するときの計算。DOM も状態も持たない純粋な関数だけを置く

/** タグにならなかった理由。duplicate: すでにある、max: 上限に達した、invalid: validate を通らなかった */
export type TagsInputRejectReason = 'duplicate' | 'max' | 'invalid';

/** タグにならなかったもの。message は validate が返した文 */
export interface TagsInputRejection {
  tag: string;
  reason: TagsInputRejectReason;
  message?: ReactNode;
}

export interface CommitResult {
  /** 確定したあとのタグの並び */
  next: string[];
  /** 新しく足されたタグ */
  added: string[];
  /** はじめに弾かれたもの（なければ null） */
  rejected: TagsInputRejection | null;
}

export interface CommitOptions {
  /** 同じ文字のタグを 2 つ以上足せるか */
  allowDuplicates: boolean;
  /** タグの数の上限 */
  max?: number;
  /** タグにしてよいかを確かめる関数。通らないときはエラーの文を返す */
  validate?: (tag: string, tags: string[]) => ReactNode;
}

/**
 * 文字を区切りで分ける。区切りは 1 文字とはかぎらないので、順に分けていく
 * 前後の空白は落とさない（切れ端を入力欄に残すため）
 */
export function splitBySeparators(text: string, separators: string[]): string[] {
  let parts = [text];
  for (const separator of separators) {
    if (!separator) continue;
    parts = parts.flatMap((part) => part.split(separator));
  }
  return parts;
}

/**
 * 打っている文字のうち、区切りで終わった分をタグの候補として取り出す
 * 最後の切れ端（区切りで終わっていない分）は、入力欄に残す文字として返す
 */
export function takeTags(text: string, separators: string[]): { tags: string[]; rest: string } {
  const parts = splitBySeparators(text, separators);
  const rest = parts.pop() ?? '';
  return { tags: parts, rest };
}

/**
 * タグの候補を、いまのタグに足す。前後の空白を落とし、空のものは数えない
 * 重複・上限・validate で弾かれたものはタグにならず、はじめに弾かれたものを rejected で返す
 */
export function commitTags(
  current: string[],
  candidates: string[],
  { allowDuplicates, max, validate }: CommitOptions
): CommitResult {
  const next = [...current];
  const added: string[] = [];
  let rejected: TagsInputRejection | null = null;
  const reject = (rejection: TagsInputRejection) => {
    rejected ??= rejection;
  };
  for (const candidate of candidates) {
    const tag = candidate.trim();
    if (tag === '') continue;
    if (!allowDuplicates && next.includes(tag)) {
      reject({ tag, reason: 'duplicate' });
      continue;
    }
    if (max !== undefined && next.length >= max) {
      reject({ tag, reason: 'max' });
      continue;
    }
    const message = validate?.(tag, next);
    if (message) {
      reject({ tag, reason: 'invalid', message });
      continue;
    }
    next.push(tag);
    added.push(tag);
  }
  return { next, added, rejected };
}
