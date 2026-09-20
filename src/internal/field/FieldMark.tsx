'use client';

import { useUIConfig } from '../ui-config';
import { tv } from '../tv';

// ラベルの後ろに置く「必須」「任意」の印（原則4: ラベルの行の一部）
// 印は読み上げから外し（aria-hidden）、必須であることは欄の required（aria-required）で伝える。
//   見えている文字を二度読ませない（原則15）。Form のエラーの一覧も、欄の名前から印を外す（form-dom.ts）
// 必須の pill はタグの見た目に寄せる（原則5: 小物は pill。原則6: 淡い面に同じ色相の濃い文字）。
//   面は危険の淡い色、文字は危険の前景用の色（原則12: 文字は前景用）
// 押せない欄でもラベルは薄くしないので、印も薄くしない（原則13）
const mark = tv({
  base: '',
  variants: {
    kind: {
      // タグと同じ形（rounded-pill・px-2・py-0.5・キャプションの大きさ・太字）
      // 高さ（キャプションの行の高さ＋上下の余白）がラベルの行より大きいので、上下の余白を負にして、行を押し広げない
      //   ラベルの行が伸びると、欄が下にずれる（必須の印が付いたときだけ）
      // align-middle だと、文字の中心より 1.5〜2px 下に来る。レイアウトに影響しない relative で、見た目だけ 2px 上げる
      tag: 'relative -top-0.5 -my-0.5 ms-2 inline-flex items-center rounded-pill bg-danger-subtle px-2 py-0.5 align-middle text-(length:--text-caption) leading-(--leading-caption) font-bold whitespace-nowrap text-fg-danger',
      // ラベルと同じ大きさの太字。ラベルとの間はタグより詰める
      // 文字なので、ラベルと基準線をそろえる（行を押し広げない）
      asterisk: 'ms-1 align-baseline font-bold text-fg-danger',
      // 任意の欄の印。ラベルの太字には引きずられない
      optional:
        'ms-2 align-middle text-(length:--text-caption) leading-(--leading-caption) font-normal text-fg-subtle',
    },
  },
});

/**
 * 必須の欄のラベルに出す印の形
 * tag: 「必須」の小さなタグ（pill）、asterisk: 赤い「*」、none: 出さない
 */
export type RequiredMark = 'tag' | 'asterisk' | 'none';

/**
 * 任意の欄のラベルに出す印の形
 * text: 淡いグレーの「任意」、none: 出さない
 */
export type OptionalMark = 'text' | 'none';

/** ラベルの印に関わる props。Field を通る部品が共通で持つ */
export interface FieldMarkProps {
  /**
   * 必須の欄にします。ラベルの後ろに印を出し、欄に required（aria-required）を付けます
   * @default false
   */
  required?: boolean;
  /**
   * 必須の印の形。tag は「必須」のタグ、asterisk は赤い「*」、none は出しません。
   * asterisk を選ぶときは、フォームの先頭などに「* は必須の項目です」の一文を置いてください（文は使う側が書きます）。
   * 書かないときは Form・ThemeProvider の requiredMark に従います
   * @default 'tag'
   */
  requiredMark?: RequiredMark;
  /**
   * 任意の欄（required でない欄）の印の形。text はラベルの後ろに淡いグレーの「任意」を出し、none は出しません。
   * 必須の印と組み合わせられます。書かないときは Form・ThemeProvider の optionalMark に従います
   * @default 'none'
   */
  optionalMark?: OptionalMark;
}

// 部品の props と、Form・ThemeProvider の既定から、この欄の印を決める
function useFieldMark({ required, requiredMark, optionalMark }: FieldMarkProps) {
  const config = useUIConfig();
  return required
    ? (requiredMark ?? config.requiredMark ?? 'tag')
    : (optionalMark ?? config.optionalMark ?? 'none') === 'text'
      ? 'optional'
      : 'none';
}

/**
 * ラベルの後ろに置く印。ラベルの中に置くので、ラベルが折り返すと印も一緒に折り返す
 * 読み上げからは外す（aria-hidden）。必須であることは欄の required が伝える
 */
export function FieldMark(props: FieldMarkProps) {
  const kind = useFieldMark(props);
  if (kind === 'none') return null;
  return (
    <span aria-hidden data-slot="field-mark" className={mark({ kind })}>
      {kind === 'asterisk' ? '*' : kind === 'tag' ? '必須' : '任意'}
    </span>
  );
}
