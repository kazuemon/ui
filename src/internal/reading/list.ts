// 記事の中のリスト（List）の見た目。List と Prose の ul・ol が同じクラス列を使う（書き方は heading.ts の先頭）
// 軸 60 の B（印は短い線、番号は右揃え）
// Markdown（GFM）を変換した HTML と同じ要素に当てる: <ul>・<ol start>・<li>、チェックリストは
//   <ul class="contains-task-list"><li class="task-list-item"><input type="checkbox" disabled checked> 文</li></ul>
// ページと同じレイヤーなので影は付けない（原則1）
//
// 印は li::before に描く（::marker は形と大きさを選べないため）。位置は li の左の外（字下げの中）で、文字との間は --list-marker-gap
//   縦は 1 行目の中央（行の高さと印の高さの差の半分）。折り返した 2 行目以降は文字の始まりにそろう
//   箇条書き: 中身のない箱。幅・高さ・角・塗り・輪郭（白抜きのときは塗りを透明にして輪郭を付ける）をトークンで持つ
//   入れ子（li の中の ul）は -nested のトークンに差し替える
//   番号: content に counter(list-item) と後ろの「.」。<ol start> は list-item の数に効く
//     箱は最小の幅（--list-number-width）を持ち、中は右揃え
// チェックリストの箱は <input type="checkbox" disabled> そのもの。appearance: none にして、印の位置に置く
//   押せないので、hover・押下の変化は付けない。塗らずに細い輪郭の四角にし、済んだ項目は輪郭を消して ✓（--list-task-mark-checked）だけにする
//
// 文字の大きさは読む文字（--text-body）。脚注の一覧のように小さくするときは、外側で --list-text・--list-leading を置く
//
// 入れ子の規則（li の中の ul）は、:where() の外に :is(li_*) を置き、入れ子でない規則より詳細度を高くする

export const listStyles = {
  base: [
    '[:where(&:not([data-prose]),&_:is(ul,ol))]:ps-(--list-indent)',
    '[:where(&:not([data-prose]),&_:is(ul,ol))]:[font-size:var(--list-text,var(--text-body))] [:where(&:not([data-prose]),&_:is(ul,ol))]:[line-height:var(--list-leading,var(--leading-body))]',
    // 入れ子のリストは、親の項目の文との間を項目の間と同じにする
    '[:where(li>&:not([data-prose]),&_li>:is(ul,ol))]:mt-(--list-item-gap)',
    // 項目
    '[:where(&:not([data-prose]),&_:is(ul,ol))>li]:relative [:where(&:not([data-prose]),&_:is(ul,ol))>li]:list-none',
    '[:where(&:not([data-prose]),&_:is(ul,ol))>li+li]:mt-(--list-item-gap)',
    // ゆるいリスト（項目の中に段落）: 項目の間と段落の間を広げる
    '[:where(&:not([data-prose]),&_:is(ul,ol))>li:has(>p)+li]:mt-(--list-item-gap-loose) [:where(&:not([data-prose]),&_:is(ul,ol))>li>p+p]:mt-(--list-item-gap-loose)',
    // 印の箱（箇条書き・番号で共通。中身と寸法は下の ul・ol が --lm-* に入れる）
    '[:where(&:not([data-prose]),&_:is(ul,ol))>li]:before:absolute [:where(&:not([data-prose]),&_:is(ul,ol))>li]:before:[content:var(--lm-content)]',
    '[:where(&:not([data-prose]),&_:is(ul,ol))>li]:before:[right:calc(100%+var(--list-marker-gap))]',
    '[:where(&:not([data-prose]),&_:is(ul,ol))>li]:before:[top:calc((var(--list-leading,var(--leading-body))-var(--lm-h))/2)]',
    '[:where(&:not([data-prose]),&_:is(ul,ol))>li]:before:flex [:where(&:not([data-prose]),&_:is(ul,ol))>li]:before:items-center [:where(&:not([data-prose]),&_:is(ul,ol))>li]:before:[justify-content:var(--lm-align)]',
    '[:where(&:not([data-prose]),&_:is(ul,ol))>li]:before:[height:var(--lm-h)] [:where(&:not([data-prose]),&_:is(ul,ol))>li]:before:[min-width:var(--lm-w)] [:where(&:not([data-prose]),&_:is(ul,ol))>li]:before:[padding-inline:var(--lm-pad-x)]',
    '[:where(&:not([data-prose]),&_:is(ul,ol))>li]:before:[border-radius:var(--lm-radius)] [:where(&:not([data-prose]),&_:is(ul,ol))>li]:before:[background-color:var(--lm-bg)]',
    '[:where(&:not([data-prose]),&_:is(ul,ol))>li]:before:[box-shadow:inset_0_0_0_var(--lm-ring)_var(--lm-ring-color)]',
    '[:where(&:not([data-prose]),&_:is(ul,ol))>li]:before:[font-size:var(--lm-text)] [:where(&:not([data-prose]),&_:is(ul,ol))>li]:before:[font-weight:var(--lm-weight)] [:where(&:not([data-prose]),&_:is(ul,ol))>li]:before:[color:var(--lm-color)]',
    '[:where(&:not([data-prose]),&_:is(ul,ol))>li]:before:[line-height:var(--lm-h)] [:where(&:not([data-prose]),&_:is(ul,ol))>li]:before:tabular-nums',
    // チェックリストの項目: 箇条書きの印を出さず、箱を印の位置に置く
    '[:where(&:not([data-prose]),&_:is(ul,ol))>li.task-list-item]:before:[content:none]',
    '[:where(&:not([data-prose]),&_:is(ul,ol))>li>input]:absolute [:where(&:not([data-prose]),&_:is(ul,ol))>li>input]:m-0 [:where(&:not([data-prose]),&_:is(ul,ol))>li>input]:appearance-none',
    '[:where(&:not([data-prose]),&_:is(ul,ol))>li>input]:[right:calc(100%+var(--list-marker-gap))]',
    '[:where(&:not([data-prose]),&_:is(ul,ol))>li>input]:[top:calc((var(--list-leading,var(--leading-body))-var(--list-task-size))/2)]',
    '[:where(&:not([data-prose]),&_:is(ul,ol))>li>input]:size-(--list-task-size) [:where(&:not([data-prose]),&_:is(ul,ol))>li>input]:rounded-sm [:where(&:not([data-prose]),&_:is(ul,ol))>li>input]:bg-transparent',
    '[:where(&:not([data-prose]),&_:is(ul,ol))>li>input]:[box-shadow:inset_0_0_0_var(--list-task-ring)_var(--color-list-task-ring)]',
    '[:where(&:not([data-prose]),&_:is(ul,ol))>li>input:checked]:shadow-none [:where(&:not([data-prose]),&_:is(ul,ol))>li>input:checked]:[background:var(--list-task-mark-checked)_center/100%_no-repeat]',
    // 済んだ項目の文
    '[:where(&:not([data-prose]),&_:is(ul,ol))>li.task-list-item:has(>input:checked)]:[color:var(--color-list-task-done)]',
  ],
  ul: [
    '[:where(&:not([data-prose]),&_ul)]:[--lm-align:center] [:where(&:not([data-prose]),&_ul)]:[--lm-color:currentColor] [:where(&:not([data-prose]),&_ul)]:[--lm-content:""] [:where(&:not([data-prose]),&_ul)]:[--lm-pad-x:0px] [:where(&:not([data-prose]),&_ul)]:[--lm-text:1em] [:where(&:not([data-prose]),&_ul)]:[--lm-weight:400]',
    '[:where(&:not([data-prose]),&_ul)]:[--lm-h:var(--list-bullet-height)] [:where(&:not([data-prose]),&_ul)]:[--lm-radius:var(--list-bullet-radius)] [:where(&:not([data-prose]),&_ul)]:[--lm-w:var(--list-bullet-width)]',
    '[:where(&:not([data-prose]),&_ul)]:[--lm-bg:var(--color-list-bullet)] [:where(&:not([data-prose]),&_ul)]:[--lm-ring-color:var(--color-list-bullet-ring)] [:where(&:not([data-prose]),&_ul)]:[--lm-ring:var(--list-bullet-ring)]',
    // 入れ子の箇条書き（li の中の ul）
    '[:where(&:not([data-prose]),&_ul):is(li_*)]:[--lm-h:var(--list-bullet-nested-height)] [:where(&:not([data-prose]),&_ul):is(li_*)]:[--lm-radius:var(--list-bullet-nested-radius)] [:where(&:not([data-prose]),&_ul):is(li_*)]:[--lm-w:var(--list-bullet-nested-width)]',
    '[:where(&:not([data-prose]),&_ul):is(li_*)]:[--lm-bg:var(--color-list-bullet-nested)] [:where(&:not([data-prose]),&_ul):is(li_*)]:[--lm-ring-color:var(--color-list-bullet-nested-ring)] [:where(&:not([data-prose]),&_ul):is(li_*)]:[--lm-ring:var(--list-bullet-nested-ring)]',
  ],
  ol: [
    '[:where(&:not([data-prose]),&_ol)]:[--lm-align:flex-end] [:where(&:not([data-prose]),&_ol)]:[--lm-content:counter(list-item)_"."]',
    '[:where(&:not([data-prose]),&_ol)]:[--lm-h:1lh] [:where(&:not([data-prose]),&_ol)]:[--lm-pad-x:0px] [:where(&:not([data-prose]),&_ol)]:[--lm-radius:0px] [:where(&:not([data-prose]),&_ol)]:[--lm-w:var(--list-number-width)]',
    '[:where(&:not([data-prose]),&_ol)]:[--lm-bg:transparent] [:where(&:not([data-prose]),&_ol)]:[--lm-ring-color:transparent] [:where(&:not([data-prose]),&_ol)]:[--lm-ring:0px]',
    '[:where(&:not([data-prose]),&_ol)]:[--lm-color:var(--color-list-number)] [:where(&:not([data-prose]),&_ol)]:[--lm-text:1em] [:where(&:not([data-prose]),&_ol)]:[--lm-weight:400]',
  ],
} as const;
