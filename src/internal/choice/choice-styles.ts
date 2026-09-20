import type { ReactNode } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { focusRing } from '../focus-styles';
import { tv } from '../tv';

// チェックボックスとラジオ（原則8・原則5）— 後半の軸 40。Checkbox.tsx と Radio.tsx が使う
// 入力欄の仲間: ふだんは選んでいない箱の塗り（--color-choice、トグルの OFF と同じグレー）で、枠線・影なし。hover で半段濃くなる
// 選ぶと部品の色の塗りに白い印。色を指定しないときは、トグルの ON と同じ濃いグレー（原則6）
// チェックボックスは小さな角丸の四角（--checkbox-radius）、ラジオは完全な丸（原則5）
// 横の文字は押しても反応するので本体の一部（原則1）。hover も箱に出し、押せないときは箱と一緒にグレーにする
//   キャプションは説明なので、押せないときも読めるまま
// エラーは、選んでいない箱の塗りを淡い赤にする。選んだ箱は部品の色のまま。文はグループの Field の行で出す
//   1つだけ置くチェックボックスは、箱の行の下に入力欄と同じ行で出す。キャプションと同じく、横の文字の始まりにそろえて字下げする
// 押せる範囲は箱と横の文字（間を含む）。文字は幅いっぱいに広げず、見えない広がりは付けない
// 行は、横の文字の行の上下に余白を付けて組む（design/adr/0101）。余白は、部品の高さから文字の行を引いた残りの半分
//   キャプションのない行はトグルと同じ部品の高さになり、キャプションのある行はその分だけ高くなる。箱はラベルの行の縦の中央
//   選択肢のすぐ下のエラー・警告の行は、この余白を間に数え、文字との間を入力欄と同じ間にする
// フォーカスはキーボードのときだけ、箱から離した線（design/adr/0031）
// 押しているあいだ（原則3。ADR-0063 の E）: 箱か横の文字を押しているあいだ、箱が沈み、塗りが濃くなる
//   深さは平らな要素の押下と同じ（--flat-press-depth）。濃さはトークン（--choice-press-darken・--choice-on-press-darken）

// 箱の大きさは密度（--density-coarse）から計算する。候補の上書き（-fine・-coarse）もここで効く
export const choiceSize =
  '[--choice-size:calc(var(--choice-size-fine)_+_var(--density-coarse)_*_(var(--choice-size-coarse)_-_var(--choice-size-fine)))]';

// 行の上下の余白（design/adr/0101）。部品の高さから横の文字の行を引いた残りの半分
const choiceRowPad =
  '[--choice-row-pad-y:calc((var(--spacing-control)_-_var(--leading-control))/2)]';

/** 選択肢のすぐ下に出すエラー・警告の行の上の間から、行の下の余白を引く（design/adr/0101） */
export const choiceMessagePull = [choiceRowPad, '[--field-message-pull:var(--choice-row-pad-y)]'];

export const choiceStyles = tv({
  slots: {
    // 1つの選択肢の行
    item: [
      'group/choice grid grid-cols-[auto_minmax(0,1fr)] items-center',
      choiceSize,
      choiceRowPad,
    ],
    box: [
      'group/box peer/box col-start-1 inline-flex size-(--choice-size) shrink-0 cursor-pointer items-center justify-center',
      'bg-(color:--color-choice) [--choice-mark:var(--color-surface)]',
      // hover は箱か横の文字に載せたとき。エラーと押せないときは下で hover の値も差し替えるので、塗りは変わらない
      'group-has-[label:hover]/choice:[--color-choice:var(--color-choice-hover)] hover:[--color-choice:var(--color-choice-hover)]',
      // エラーは押せる箱だけ。押せなくてエラーでもある箱は、押せないほうを優先する（押せない箱の色）
      //   :where で包み、詳しさ（specificity）を data-invalid だけのときと同じにする（hover・押したときの規則との強さを変えない）
      'data-invalid:[&:where(:not([data-disabled]))]:[--color-choice-hover:var(--color-choice-invalid)] data-invalid:[&:where(:not([data-disabled]))]:[--color-choice:var(--color-choice-invalid)]',
      'data-disabled:cursor-not-allowed data-disabled:[--color-choice-hover:var(--color-choice-disabled)] data-disabled:[--color-choice:var(--color-choice-disabled)]',
      // エラーの箱の内側の線（後半の軸 50 で比べている途中。既定は太さ 0 で引かない）。選んでいない、押せる箱だけ
      //   inset の影で描き、寸法を変えない。フォーカスの ring とは Tailwind の影の枠が別なので、重ねて描ける
      'shadow-[inset_0_0_0_var(--choice-invalid-line,0px)_var(--color-choice-invalid-line)]',
      'data-invalid:[&:where(:not([data-disabled],[data-checked],[data-indeterminate]))]:[--choice-invalid-line:var(--choice-invalid-line-width)]',
      // 選んだ箱（中間も）は部品の色。hover では変えない（トグルの ON と同じ）
      // 押しているあいだは --choice-on-pressed（下）。押していないときは置かないので、部品の色のまま
      'data-checked:bg-[var(--choice-on-pressed,var(--choice-on))] data-indeterminate:bg-[var(--choice-on-pressed,var(--choice-on))]',
      // 押せない選んだ箱: 色を持つものは色を残して薄くする（design/adr/0026）。色を持たないものは下の neutral でグレーにする
      'data-disabled:data-checked:opacity-[var(--choice-disabled-opacity,var(--disabled-opacity))]',
      'data-disabled:data-indeterminate:opacity-[var(--choice-disabled-opacity,var(--disabled-opacity))]',
      // 押しているあいだ（箱か横の文字）。押せないときは変えない
      //   --choice-press（0 か 1）で沈む深さを掛ける。塗りは、選んでいない箱は hover の塗りに本文の色を、選んだ箱は部品の色に黒を混ぜる
      '[translate:0_calc(var(--choice-press)*var(--flat-press-depth))] [--choice-press:0]',
      'not-data-disabled:group-has-[label:active]/choice:[--choice-press:1] not-data-disabled:active:[--choice-press:1]',
      'not-data-disabled:active:[--color-choice:color-mix(in_oklab,var(--color-choice-hover),var(--color-fg)_var(--choice-press-darken))]',
      'not-data-disabled:group-has-[label:active]/choice:[--color-choice:color-mix(in_oklab,var(--color-choice-hover),var(--color-fg)_var(--choice-press-darken))]',
      'not-data-disabled:active:[--choice-on-pressed:color-mix(in_oklab,var(--choice-on),black_var(--choice-on-press-darken))]',
      'not-data-disabled:group-has-[label:active]/choice:[--choice-on-pressed:color-mix(in_oklab,var(--choice-on),black_var(--choice-on-press-darken))]',
      ...focusRing,
      // 沈む動きはボタンの押下と同じ長さと緩急
      // 塗りは動かさない。印（チェック・点）はすぐ出入りするので、塗りだけが遅れると、印のない濃い箱や、薄い箱の上の白い印が一瞬見えてちらつく
      //   状態の移り変わりは速くする（原則2）。押したときに沈む動きとフォーカスの線は動かす
      '[transition:translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
      'motion-reduce:[transition:none]',
    ],
    // 印は、箱が選んでいない状態になった描画で隠す。Base UI の Indicator は外れてから1フレーム残るので、そのままだと薄い箱の上に白い印が一瞬見える
    mark: 'flex size-full items-center justify-center text-(color:--choice-mark) group-data-unchecked/box:invisible',
    dot: 'block size-[round(var(--choice-size)*var(--radio-dot-ratio),2px)] rounded-pill bg-(color:--choice-mark) group-data-unchecked/box:invisible',
    // 間（--choice-gap）は文字の側に持たせ、箱と文字のあいだも押せるようにする
    label: [
      'col-start-2 cursor-pointer justify-self-start pl-(--choice-gap) text-(length:--text-control) leading-(--leading-control) text-fg',
      'peer-data-disabled/box:cursor-not-allowed peer-data-disabled/box:text-(color:--color-on-field-disabled)',
    ],
    caption:
      'col-start-2 justify-self-start pl-(--choice-gap) text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle',
    // 1つだけ置くチェックボックスのエラー・警告の行。下の余白の行の下に置き、キャプションと同じく横の文字の始まりにそろえて字下げする
    //   列は2列ともまたぐ。字下げは1列目の幅（箱）と文字の側の間
    //   下の余白を間に数えるので、余白が間より広いときは、開いているあいだその差だけ上に寄せる
    // 格子には行の間がないので、行の箱の上の間の打ち消し（Field の中で使うとき）をやめる。間は行の上に持つ（--spacing-field-gap）
    message:
      'col-span-full mt-0 pl-[calc(var(--choice-size)_+_var(--choice-gap))] data-open:-mt-(--field-message-overlap)',
    // 「すべて選ぶ」の箱の下に並べる子の箱。字下げして、箱の左端を「すべて選ぶ」の横の文字の始まりにそろえる
    children: ['flex flex-col pl-[calc(var(--choice-size)+var(--choice-gap))]', choiceSize],
  },
  variants: {
    // --color-own-focus: フォーカスの線を部品の色に従わせるとき（--focus-follow-color: 1 — 後半の軸 41）の線の色
    //   線なので、ピンクは前景用。neutral は置かない
    color: {
      primary: {
        box: '[--choice-on:var(--color-primary)] [--color-own-focus:var(--color-primary)]',
      },
      // ピンクは面用（トグルの ON と同じ）。白い印は図形なので 3:1（白地・印とも 3.76）
      secondary: {
        box: '[--choice-on:var(--color-secondary)] [--color-own-focus:var(--color-fg-secondary)]',
      },
      // 色を持たない箱。選ぶとトグルの ON と同じ濃いグレー。押せないときは、押せないグレーのトグルと同じ塗りと印（薄くしない）
      neutral: {
        box: [
          '[--choice-disabled-opacity:1] [--choice-on:var(--color-neutral-strong)]',
          'data-disabled:[--choice-mark:var(--color-choice-neutral-mark-disabled)] data-disabled:[--choice-on:var(--color-choice-neutral-on-disabled)]',
        ],
      },
    },
    // 行の組み方
    //   item: グループの中の選択肢。上下に余白を付ける
    //   solo: 1つだけ置くチェックボックス。上下の余白は格子の行で持ち、箱と文字は2行目。エラー・警告の行はその下に足す
    layout: {
      item: {
        item: 'py-(--choice-row-pad-y)',
        box: 'row-start-1',
        label: 'row-start-1',
        caption: 'row-start-2',
      },
      solo: { box: 'row-start-2', label: 'row-start-2', caption: 'row-start-3' },
    },
  },
  defaultVariants: { color: 'neutral', layout: 'item' },
});

/**
 * 読み取り専用（軸 177）の上書き。箱の見た目は押せないときと同じままで、横の文字だけ本文の色に戻す
 * 横の文字は読むための文字なので薄くしません（原則13）。カーソルも、押せないときの禁止の形にはしません
 */
export const choiceReadOnly = {
  box: 'data-disabled:cursor-default',
  label: 'peer-data-disabled/box:cursor-default peer-data-disabled/box:text-fg',
};

/** 選んだときの色。Switch と同じ並び */
export type ChoiceColor = NonNullable<VariantProps<typeof choiceStyles>['color']>;

/**
 * グループ（RadioGroup・CheckboxGroup）の Field に付ける、エラー・警告の行の詰め方（design/adr/0101）。
 * 行が選択肢のすぐ下に来るとき（キャプションが上）だけ使う。枠で囲んだグループは、行が枠の線の下に来るので詰めない
 */
export const choiceGroupMessagePull = (captionPlacement: 'top' | 'bottom' | undefined) =>
  captionPlacement === 'bottom'
    ? []
    : [...choiceMessagePull, 'has-[[data-choice-frame]]:[--field-message-pull:0px]'];

/** 行を明示する（キャプションがあれば2行）。箱は1行目（ラベルの行）の中央 */
export const choiceRows = (caption: ReactNode) =>
  caption ? 'grid-rows-[auto_auto]' : 'grid-rows-[auto]';
