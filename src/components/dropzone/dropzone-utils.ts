// Dropzone の判定（accept・multiple・大きさ・数の上限）。DOM を読まない純粋な関数だけを置く

/** ファイルを受け付けなかった理由。accept: 種類が違う、maxSize: 大きすぎる、maxFiles: 数の上限を超えた */
export type DropzoneRejectReason = 'accept' | 'maxSize' | 'maxFiles';

/** 受け付けなかったファイルと理由の組 */
export interface DropzoneRejection {
  file: File;
  reason: DropzoneRejectReason;
}

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
  /** すでに選ばれているファイルの数（maxFiles の計算に使う） */
  currentCount: number;
}

export interface EvaluateFilesResult {
  accepted: File[];
  rejected: DropzoneRejection[];
}

/** 選んだ・落としたファイルを、accept・multiple・大きさ・数の上限で受け付ける分と弾く分に分ける */
export function evaluateFiles(
  files: File[],
  { accept, multiple, maxSize, maxFiles, currentCount }: EvaluateFilesOptions
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
