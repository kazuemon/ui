// Dropzone と FileInput の判定（accept・multiple・大きさ・数の上限）と、DropzoneFileList と Attachment が共有する
// ファイルの項目（名前・大きさ・画像かどうか・外すボタンの名前）。DOM を読まない純粋な関数だけを置く
import type { ReactNode } from 'react';

/**
 * ファイルを受け付けなかった理由。accept: 種類が違う、maxSize: 大きすぎる、maxFiles: 数の上限を超えた、
 * custom: validateFile が文を返した
 */
export type DropzoneRejectReason = 'accept' | 'maxSize' | 'maxFiles' | 'custom';

/** 受け付けなかったファイルと理由の組 */
export interface DropzoneRejection {
  file: File;
  reason: DropzoneRejectReason;
  /** reason が custom のとき、validateFile が返した文 */
  message?: string;
}

/** ファイルを独自の条件で確かめる関数。受け付けないときは理由の文を返します（受け付けるときは null・undefined・空文字） */
export type DropzoneValidateFile = (file: File) => string | null | undefined;

/** input[type=file] の accept と同じ書式（拡張子・MIME タイプ・"image/*" のワイルドカード、","区切り）で、ファイルが当たるか */
export function matchesAccept(file: File, accept: string): boolean {
  const patterns = accept
    .split(',')
    .map((pattern) => pattern.trim())
    .filter(Boolean);
  if (patterns.length === 0) return true;
  return patterns.some((pattern) => {
    if (pattern.startsWith('.')) return file.name.toLowerCase().endsWith(pattern.toLowerCase());
    if (pattern.endsWith('/*')) return file.type.startsWith(pattern.slice(0, -1));
    return file.type === pattern;
  });
}

/**
 * ドラッグ中（dragenter・dragover）の判定。DataTransferItem には種類（kind）と型（type）しかなく、
 * 大きさ（size）は分からないので、accept・multiple だけで受け付けるかどうかの見た目を決める
 * （大きさ・数の上限は drop で実際のファイルを読めたときに確かめる）
 */
export function evaluateDragItems(
  items: DataTransferItem[] | DataTransferItemList,
  { accept, multiple }: { accept?: string; multiple?: boolean }
): boolean {
  const files = Array.from(items).filter((item) => item.kind === 'file');
  if (files.length === 0) return false;
  if (!multiple && files.length > 1) return false;
  if (!accept) return true;
  // dragenter の時点では拡張子（ファイル名）が読めない。MIME タイプだけで確かめる（拡張子の指定は判定できず、受け付ける扱いにする）
  const patterns = accept
    .split(',')
    .map((pattern) => pattern.trim())
    .filter(Boolean);
  return files.every((item) =>
    patterns.some((pattern) => {
      if (pattern.startsWith('.')) return true;
      if (pattern.endsWith('/*')) return item.type.startsWith(pattern.slice(0, -1));
      return item.type === pattern;
    })
  );
}

export interface EvaluateFilesOptions {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  validateFile?: DropzoneValidateFile;
  /** すでに選ばれているファイルの数（maxFiles の計算に使う） */
  currentCount: number;
}

export interface EvaluateFilesResult {
  accepted: File[];
  rejected: DropzoneRejection[];
}

/**
 * 選んだ・落としたファイルを、accept・multiple・大きさ・validateFile・数の上限で受け付ける分と弾く分に分ける
 * validateFile は種類と大きさのあと、数の上限の前に確かめる（弾いたファイルは数に入れない）
 */
export function evaluateFiles(
  files: File[],
  { accept, multiple, maxSize, maxFiles, validateFile, currentCount }: EvaluateFilesOptions
): EvaluateFilesResult {
  const accepted: File[] = [];
  const rejected: DropzoneRejection[] = [];
  // 複数選べない欄は 1 つまで受け付ける。2 つ目以降も評価し、数の上限（maxFiles）の理由で弾いたと知らせる
  const limit = multiple ? maxFiles : Math.min(maxFiles ?? 1, 1);
  let count = currentCount;
  for (const file of files) {
    if (accept && !matchesAccept(file, accept)) {
      rejected.push({ file, reason: 'accept' });
      continue;
    }
    if (maxSize != null && file.size > maxSize) {
      rejected.push({ file, reason: 'maxSize' });
      continue;
    }
    const message = validateFile?.(file);
    if (message) {
      rejected.push({ file, reason: 'custom', message });
      continue;
    }
    if (limit != null && count >= limit) {
      rejected.push({ file, reason: 'maxFiles' });
      continue;
    }
    accepted.push(file);
    count += 1;
  }
  return { accepted, rejected };
}

/** input.files（FileList）を、渡した配列に合わせる。Form で送るときに、選んだファイルが値として送れるようにする */
export function syncInputFiles(input: HTMLInputElement | null | undefined, files: File[]): void {
  if (!input) return;
  const dataTransfer = new DataTransfer();
  for (const file of files) dataTransfer.items.add(file);
  input.files = dataTransfer.files;
}

/** バイト数を「1.2 MB」のような文字にする。1000 区切り（OS のファイルの大きさの表示に合わせる） */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000;
    unitIndex += 1;
  }
  const digits = unitIndex === 0 || value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(digits)} ${units[unitIndex]}`;
}

// ワイルドカードの MIME タイプ（"image/*" など）を、人が読む名前にする
const acceptGroupNames: Record<string, string> = {
  image: '画像',
  video: '動画',
  audio: '音声',
  text: 'テキスト',
};

/**
 * accept（input[type=file] の書式）を、案内の文で読む形にする。
 * 拡張子（".pdf"）と MIME タイプ（"image/png"）は大文字の形式名（PDF・PNG）に、"image/*" は「画像」にする。
 * MIME タイプの x- と +xml などの後ろは外す（image/svg+xml → SVG）。形式名にできないものは、書いたまま残す
 */
export function formatAccept(accept: string): string {
  const names = accept
    .split(',')
    .map((pattern) => pattern.trim())
    .filter(Boolean)
    .map((pattern) => {
      if (pattern.startsWith('.')) return pattern.slice(1).toUpperCase();
      const [type, subtype] = pattern.toLowerCase().split('/');
      if (!type || !subtype) return pattern;
      if (subtype === '*') return acceptGroupNames[type] ?? pattern;
      const name = subtype.replace(/^x-/, '').replace(/\+.*$/, '');
      return /^[a-z0-9]+$/.test(name) ? name.toUpperCase() : pattern;
    });
  return [...new Set(names)].join('、');
}

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

export const entryName = (entry: DropzoneFileEntry) => entry.name ?? entry.file?.name ?? '';
export const entrySize = (entry: DropzoneFileEntry) => entry.size ?? entry.file?.size;
const IMAGE_EXTENSION = /\.(avif|bmp|gif|jpe?g|png|svg|webp)(?:[?#]|$)/i;
export const entryIsImage = (entry: DropzoneFileEntry) => {
  const type = entry.type ?? entry.file?.type;
  if (type) return type.startsWith('image/');
  return (
    entry.url != null && (entry.url.startsWith('data:image/') || IMAGE_EXTENSION.test(entry.url))
  );
};

export function defaultRemoveName(entry: DropzoneFileEntry) {
  return `${entry.file ? '外す' : '削除'}: ${entryName(entry)}`;
}
