import type { useFieldCount } from './use-field-count';
import { tv } from '../tv';

// 文字数の表示（TextField・Textarea で共有）。本体の右下の下に「12 / 200」の形で出す
const countStyles = tv({
  slots: {
    count:
      'self-end text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle tabular-nums',
    // 上限を超えた数（文字数の表示の左の数）。エラーの文字と同じ赤
    over: 'text-fg-danger',
    // 上限に近づいた数。警告は送信を止めないので、欄の見た目は変えず、数だけを警告の色にする（原則4）
    near: 'text-fg-warning',
  },
});

/** 文字数の表示と、超えた・戻ったの知らせ。useFieldCount の count を渡す */
export function FieldCount({
  id,
  length,
  limit,
  over,
  near,
  counted,
  maxCount,
  notice,
}: ReturnType<typeof useFieldCount>['count']) {
  const styles = countStyles();
  return (
    <>
      {counted && limit != null && (
        // 読み上げは欄の説明として、フォーカスしたときに 1 回読む（打つたびには知らせない）
        // 超えたことは、数の赤だけでなく文でも伝える
        <div id={id} data-slot="field-count" className={styles.count()}>
          <span aria-hidden>
            <span className={over ? styles.over() : near ? styles.near() : undefined}>
              {length}
            </span>{' '}
            / {limit}
          </span>
          <span className="sr-only">
            {over
              ? `${limit}文字を超えています。いま${length}文字`
              : near
                ? `${limit}文字まで。いま${length}文字。残り${limit - length}文字`
                : `${limit}文字まで。いま${length}文字`}
          </span>
        </div>
      )}
      {maxCount != null && (
        // 超えた・戻ったの知らせ。いつも置いた live region に文を入れる（ADR-0044 と同じ）
        <div aria-live="polite" className="sr-only">
          {notice}
        </div>
      )}
    </>
  );
}
