import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { CheckboxGroup as BaseCheckboxGroup } from '@base-ui/react/checkbox-group';
import { Field as BaseField } from '@base-ui/react/field';
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useId,
  useMemo,
} from 'react';
import type { VariantProps } from 'tailwind-variants';

import { type CaptionPlacement, Field, FieldMessageLine } from '../../internal/field/Field';
import { focusRing } from '../../internal/focus-styles';
import { useChoiceLock } from '../../internal/form-context';
import { tv } from '../../internal/tv';

// チェックボックスとラジオ（原則8・原則5）— 後半の軸 40。Radio.tsx もこの見た目を使う
// 入力欄の仲間: ふだんは選んでいない箱の塗り（--color-choice、トグルの OFF と同じグレー）で、枠線・影なし。hover で半段濃くなる
// 選ぶと部品の色の塗りに白い印。色を指定しないときは、トグルの ON と同じ濃いグレー（原則6）
// チェックボックスは小さな角丸の四角（--checkbox-radius）、ラジオは完全な丸（原則5）
// 横の文字は押しても反応するので本体の一部（原則1）。hover も箱に出し、押せないときは箱と一緒にグレーにする
//   キャプションは説明なので、押せないときも読めるまま
// エラーは、選んでいない箱の塗りを淡い赤にする。選んだ箱は部品の色のまま。文はグループの Field の行で出す
//   1つだけ置くチェックボックスは、箱の行の下に入力欄と同じ行で出す。キャプションと同じく、横の文字の始まりにそろえて字下げする
// 押せる範囲は箱と横の文字（間を含む）。文字は幅いっぱいに広げず、見えない広がりは付けない
// 行の高さはトグルと同じ部品の高さ。箱はラベルの行の縦の中央
// フォーカスはキーボードのときだけ、箱から離した線（design/adr/0031）
// 押しているあいだ（原則3。ADR-0063 の E）: 箱か横の文字を押しているあいだ、箱が沈み、塗りが濃くなる
//   深さは平らな要素の押下と同じ（--flat-press-depth）。濃さはトークン（--choice-press-darken・--choice-on-press-darken）

// 箱の大きさは密度（--density-coarse）から計算する。候補の上書き（-fine・-coarse）もここで効く
const choiceSize =
  '[--choice-size:calc(var(--choice-size-fine)_+_var(--density-coarse)_*_(var(--choice-size-coarse)_-_var(--choice-size-fine)))]';

export const choiceStyles = tv({
  slots: {
    // 1つの選択肢の行
    item: ['group/choice grid grid-cols-[auto_minmax(0,1fr)] items-center', choiceSize],
    // 1つだけ置くチェックボックスで、箱・横の文字・キャプションのまとまりの高さを部品の高さにする見えない柱
    // まとまりの上下の行（1fr）が残りを分けるので、まとまりは部品の高さの中で縦の中央になる
    // 下に足すエラー・警告の行は柱の外なので、出ても箱と文字は動かない
    pillar: 'col-start-1 row-[1/-1] min-h-(--spacing-control) w-0',
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
    dot: 'block size-[calc(var(--choice-size)*var(--radio-dot-ratio))] rounded-pill bg-(color:--choice-mark) group-data-unchecked/box:invisible',
    // 間（--choice-gap）は文字の側に持たせ、箱と文字のあいだも押せるようにする
    label: [
      'col-start-2 cursor-pointer justify-self-start pl-(--choice-gap) text-(length:--text-control) leading-(--leading-control) text-fg',
      'peer-data-disabled/box:cursor-not-allowed peer-data-disabled/box:text-(color:--color-on-field-disabled)',
    ],
    caption:
      'col-start-2 justify-self-start pl-(--choice-gap) text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle',
    // 1つだけ置くチェックボックスのエラー・警告の行。柱の下の行に置き、キャプションと同じく横の文字の始まりにそろえて字下げする
    //   列は2列ともまたぐ（2列目だけに置くと、柱の横の空いた1行目に入ってしまう）。字下げは1列目の幅（箱）と文字の側の間
    // 格子には行の間がないので、行の箱の上の間の打ち消し（Field の中で使うとき）をやめる。間は行の上に持つ（--spacing-field-gap）
    message: 'col-span-full mt-0 pl-[calc(var(--choice-size)_+_var(--choice-gap))]',
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
    //   item: グループの中の選択肢。行の高さを部品の高さにし、まとまりを縦の中央に置く
    //   solo: 1つだけ置くチェックボックス。柱（pillar）が高さを持ち、箱と文字は2行目（上下は 1fr の行）
    layout: {
      item: {
        item: 'min-h-(--spacing-control) content-center',
        box: 'row-start-1',
        label: 'row-start-1',
        caption: 'row-start-2',
      },
      solo: { box: 'row-start-2', label: 'row-start-2', caption: 'row-start-3' },
    },
  },
  defaultVariants: { color: 'neutral', layout: 'item' },
});

/** 選んだときの色。Switch と同じ並び */
export type ChoiceColor = NonNullable<VariantProps<typeof choiceStyles>['color']>;

/** CheckboxGroup・RadioGroup が中の選択肢に渡すもの。null ならグループの外（1つだけ置いた Checkbox） */
export const ChoiceGroupContext = createContext<{ color?: ChoiceColor } | null>(null);

/** 行を明示する（キャプションがあれば2行）。箱は1行目（ラベルの行）の中央 */
export const choiceRows = (caption: ReactNode) =>
  caption ? 'grid-rows-[auto_auto]' : 'grid-rows-[auto]';

// 1つだけ置くチェックボックスの行。上下の 1fr の行が、柱の高さ（部品の高さ）の残りを分ける。エラー・警告の行は、その下に足す行
const soloRows = (caption: ReactNode) =>
  caption ? 'grid-rows-[1fr_auto_auto_1fr]' : 'grid-rows-[1fr_auto_1fr]';

/** 「すべて選ぶ」のグループの枠の形。CheckboxGroup の selectAllFrame */
export type ChoiceFrame = 'none' | 'options' | 'notched' | 'all';

// 「すべて選ぶ」のグループの枠（後半の軸 43 で比べている途中。既定は枠なし）
// カードのような薄いフチ: 線は細い境界線、角はカードの角（原則5: 包むものは部品より一段大きい角）、影なし（原則1: ページと同じレイヤー）
// 見た目はトークン（--choice-frame-*）。枠と中の選択肢の左右のあいだは部品の左右の余白（密度で変わる）
const framePadX = '[--choice-frame-pad-x:var(--spacing-control-x)]';
const frameLine = 'border-line';
const frameStyles = tv({
  slots: {
    // options（子の選択肢だけ）と all（「すべて選ぶ」も含めて）の四辺の枠
    box: [
      'flex flex-col rounded-card border-(length:--border-width-thin) px-(--choice-frame-pad-x) py-(--choice-frame-pad-y)',
      frameLine,
      framePadX,
    ],
    // notched: 「すべて選ぶ」の箱が、枠の左上の角を隠す形（後半の軸 43 の B。ユーザーの案）
    //   枠の上の線は「すべて選ぶ」の行の縦の中央（箱の中央）、左の線は箱の横の中央を通る。左上の角は箱の下に隠れるので角丸にしない
    //   線は「すべて選ぶ」の文字のうしろで切れる。文字（箱との間を含む）の面を --color-choice-frame-notch-bg で塗り、右に --choice-frame-notch-gap をあける
    //   「すべて選ぶ」の行を枠より手前に重ね、枠は行の縦の中央まで引き上げる
    //   中の余白は左右と下で同じ（--choice-frame-pad-x）。枠の線から子の箱の端までで測る
    //     下は、子の行の中で箱の下にある間（(部品の高さ − 箱の大きさ) / 2）を引いて、線から箱までを左右と同じにする
    //     上は、「すべて選ぶ」の箱の下端から1番目の子の箱の上端までを同じ余白にする（上の線は箱の中央を通るので、箱の半分を足す）
    //   1番目の子の行は「すべて選ぶ」の行の下半分に重なる。行の空いたところは押しても素通りにし（pointer-events）、下の箱を押せるようにする
    notched: ['flex flex-col', framePadX],
    legend: [
      'pointer-events-none relative z-[1] self-start',
      '[&_label]:pointer-events-auto [&_label]:bg-(color:--color-choice-frame-notch-bg) [&_label]:pr-(--choice-frame-notch-gap)',
      '[&_[role=checkbox]]:pointer-events-auto',
    ],
    body: [
      '-mt-[calc(var(--spacing-control)/2)] ml-[calc(var(--choice-size)/2_-_var(--border-width-thin)/2)] flex flex-col',
      'rounded-card rounded-tl-none border-(length:--border-width-thin)',
      '[--choice-frame-pad-row:max(0px,calc(var(--choice-frame-pad-x)_-_(var(--spacing-control)_-_var(--choice-size))/2))]',
      // 上の線（太さの分）は箱の中央から下にあるので、その分を引く
      '[--choice-frame-pad-top:calc(var(--choice-frame-pad-row)_+_var(--choice-size)/2_-_var(--border-width-thin))]',
      'pt-(--choice-frame-pad-top) pr-(--choice-frame-pad-x) pb-(--choice-frame-pad-row) pl-(--choice-frame-pad-x)',
      frameLine,
      choiceSize,
    ],
  },
});

// チェック（✓）と中間の横線。線の太さは画面の px（--checkbox-mark-width）で、箱の大きさによらない
function CheckboxMark() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-full"
      style={{ strokeWidth: 'var(--checkbox-mark-width)' }}
    >
      <polyline
        points="4 8.5 6.75 11.25 12 5.5"
        vectorEffect="non-scaling-stroke"
        className="group-data-indeterminate/box:hidden"
      />
      <line
        x1="4.5"
        y1="8"
        x2="11.5"
        y2="8"
        vectorEffect="non-scaling-stroke"
        className="hidden group-data-indeterminate/box:inline"
      />
    </svg>
  );
}

export interface CheckboxProps extends Omit<
  ComponentProps<typeof BaseCheckbox.Root>,
  'className' | 'render' | 'color' | 'parent'
> {
  /** 箱の横の文字。押しても切り替わります（本体の一部）。押せないときは箱と一緒にグレーになります */
  label: ReactNode;
  /** 横の文字の下の説明。押せないときも読めるままです */
  caption?: ReactNode;
  /**
   * 選んだときの色。利用者が選ぶ primary・secondary に加え、色を持たない neutral（濃いグレー）を選べます（原則6）。
   * 選んでいない箱は、色を指定していてもトグルの OFF と同じグレーです。CheckboxGroup の中では、指定しなければグループの color になります
   * @default 'neutral'
   */
  color?: ChoiceColor;
  /**
   * エラーの内容。1つだけ置くとき（同意など）に使います。箱の行の下に丸の「!」と赤い文字で出し、選んでいない箱の塗りを淡い赤にします。
   * 行は箱の説明（aria-describedby）につなぎ、読み上げと出る・消える動きは入力欄と同じです。
   * Form で送信したときは、エラーのある最初の欄としてこの箱にフォーカスが移ります。
   * CheckboxGroup の中では使いません（グループの error を使います）
   */
  error?: ReactNode;
  /**
   * 警告の内容。1つだけ置くときに使います。箱の行の下に三角とオリーブ色の文字で出します。箱の見た目は変えません。
   * error と両方あるときは、エラーの行が上です。CheckboxGroup の中では使いません（グループの warning を使います）
   */
  warning?: ReactNode;
  /**
   * 必須にします。1つだけ置くとき（同意など）に使い、箱に aria-required を付けます（読み上げで必須と伝わります）。
   * 見た目は変わらないので、必須であることは横の文字かキャプションでも伝えます。
   * CheckboxGroup の必須は、グループの caption の文で書きます
   * @default false
   */
  required?: boolean;
  className?: string;
}

/**
 * チェックボックス。箱と横の文字（とキャプション）を並べる。横の文字を押しても切り替わる
 * 1つだけ置くとき（同意など）はそのまま、複数を1つの問いにまとめるときは CheckboxGroup の中に置く
 * 中間の状態は indeterminate で表します。「すべて選ぶ」の箱は、CheckboxGroup の selectAll で部品が持ちます
 */
export function Checkbox(props: CheckboxProps) {
  return <CheckboxBase {...props} />;
}

// parent: CheckboxGroup の「すべて選ぶ」の箱（Base UI の親の箱）。部品の中だけで使う
function CheckboxBase({
  label,
  caption,
  color,
  error,
  warning,
  className,
  disabled,
  readOnly,
  parent,
  'aria-describedby': ariaDescribedBy,
  'aria-disabled': ariaDisabled,
  ...props
}: CheckboxProps & { parent?: boolean }) {
  const group = useContext(ChoiceGroupContext);
  const id = useId();
  const solo = !group;
  const s = choiceStyles({ color: color ?? group?.color, layout: solo ? 'solo' : 'item' });
  const locked = useChoiceLock(disabled);
  const box = (describedBy: string | undefined) => (
    <BaseCheckbox.Root
      disabled={disabled}
      readOnly={locked.readOnly || readOnly}
      aria-disabled={locked.readOnly || ariaDisabled}
      parent={parent}
      aria-describedby={describedBy}
      className={s.box({ className: 'rounded-(--checkbox-radius)' })}
      {...locked.data}
      {...props}
    >
      <BaseCheckbox.Indicator className={s.mark()}>
        <CheckboxMark />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
  // グループの中では Field.Item（横の文字とキャプションをこの箱に結ぶ）
  if (!solo) {
    return (
      <BaseField.Item
        disabled={disabled}
        className={s.item({ className: [choiceRows(caption), className] })}
      >
        {box(ariaDescribedBy)}
        <BaseField.Label className={s.label()}>{label}</BaseField.Label>
        {caption && (
          <BaseField.Description className={s.caption()}>{caption}</BaseField.Description>
        )}
      </BaseField.Item>
    );
  }
  // 1つだけ置くときは自分の Field.Root。エラー・警告の行（入力欄と同じ — design/adr/0041・0044）を箱の行の下に置き、
  // 箱の説明を見た目の順（キャプション → エラー → 警告）でつなぐ
  // data-slot="field-label": Form のエラーの一覧が、欄の名前として読む（Field と同じ）
  const ids = { caption: `${id}caption`, error: `${id}error`, warning: `${id}warning` };
  const describedBy =
    [ariaDescribedBy, caption && ids.caption, error && ids.error, warning && ids.warning]
      .filter(Boolean)
      .join(' ') || undefined;
  return (
    <BaseField.Root
      disabled={disabled}
      invalid={error ? true : undefined}
      className={s.item({ className: [soloRows(caption), className] })}
    >
      <span aria-hidden className={s.pillar()} />
      {box(describedBy)}
      <BaseField.Label data-slot="field-label" className={s.label()}>
        {label}
      </BaseField.Label>
      {caption && (
        <BaseField.Description id={ids.caption} className={s.caption()}>
          {caption}
        </BaseField.Description>
      )}
      <FieldMessageLine kind="error" content={error} id={ids.error} className={s.message()} />
      <FieldMessageLine kind="warning" content={warning} id={ids.warning} className={s.message()} />
    </BaseField.Root>
  );
}

// 「すべて選ぶ」の箱を付けるときは、子の value をすべて渡す（Base UI の allValues）
type SelectAllProps =
  | {
      /** 「すべて選ぶ」の箱の横の文字。渡すと、選択肢の上に「すべて選ぶ」の箱を置きます */
      selectAll?: undefined;
      /** 中の選択肢の value のすべて。selectAll を渡すときに要ります */
      allValues?: undefined;
      /** 「すべて選ぶ」のグループの枠。selectAll を渡すときに使います */
      selectAllFrame?: undefined;
    }
  | {
      /**
       * 「すべて選ぶ」の箱の横の文字。渡すと、選択肢の上に「すべて選ぶ」の箱を置き、子の選択肢を字下げします。
       * 箱は、子がすべて選ばれていれば選んだ状態、いくつか選ばれていれば中間の状態に、部品が自分で切り替えます（数え直さなくてよい）。
       * 押すと、すべて選ぶ・すべて外す・押す前の選び方に戻す、を順に切り替えます。押せない子の選び方は変えません。
       * 箱の値は送信しません（value には入りません）
       */
      selectAll: ReactNode;
      /** 中の選択肢の value のすべて（並べる順）。「すべて選ぶ」の箱が、選んだ数と比べるのに使います */
      allValues: string[];
      /**
       * 「すべて選ぶ」のグループを枠で囲むか（後半の軸 43 では採用していません。見た目を練り直すまで none のまま使います）。枠はカードのような薄いフチです（細い境界線・カードの角・影なし）。
       * none は枠を付けず、子の選択肢を「すべて選ぶ」の横の文字の始まりまで字下げします。
       * options は子の選択肢だけを囲み、「すべて選ぶ」は枠の外の上に置きます。
       * notched は「すべて選ぶ」の箱が枠の左上の角を隠す形です。枠の上の線は箱の縦の中央、左の線は箱の横の中央を通り、線は「すべて選ぶ」の文字のうしろで切れます。子の選択肢は枠の中で字下げされます。
       * 文字の下は置く面の色（--color-choice-frame-notch-bg）で塗って線を切るので、白くない面に置くときはこのトークンを面の色にします。
       * all は「すべて選ぶ」も含めて囲み、中の子の選択肢は none と同じく字下げします
       * @default 'none'
       */
      selectAllFrame?: ChoiceFrame;
    };

export type CheckboxGroupProps = Omit<
  ComponentProps<typeof BaseCheckboxGroup>,
  'className' | 'render' | 'color' | 'allValues' | 'aria-required'
> &
  SelectAllProps & {
    /** グループの見出し（太字）。グループ（role="group"）の名前になります */
    label: ReactNode;
    /**
     * 見出しの補足（ヘルプテキスト）。エラー・警告のあいだも消えません。
     * 必須のグループは、ここに文で書きます（「1つ以上選んでください」など）。role="group" には aria-required を付けられないためです
     */
    caption?: ReactNode;
    /**
     * キャプションの場所。top は見出しと選択肢のあいだ、bottom は選択肢の下（design/adr/0041）
     * @default 'top'
     */
    captionPlacement?: CaptionPlacement;
    /** エラーの内容。選択肢の下に丸の「!」と赤い文字で出し、選んでいない箱の塗りを淡い赤にします。押せない箱は、押せない色のままです */
    error?: ReactNode;
    /** 警告の内容。選択肢の下に三角とオリーブ色の文字で出します。箱の見た目は変えません */
    warning?: ReactNode;
    /**
     * 中の選択肢の色。選択肢ごとの color で上書きできます
     * @default 'neutral'
     */
    color?: ChoiceColor;
    className?: string;
    children: ReactNode;
  };

/**
 * チェックボックスのグループ。見出し / 選択肢 / キャプション・エラー・警告の3層（原則4）
 * 中には Checkbox を value 付きで置きます。選んだ value の並びが value（defaultValue）です
 * 「すべて選ぶ」の箱は selectAll と allValues で付けます。selectAllFrame で、グループを枠で囲めます
 * エラー・警告の行と読み上げは入力欄と同じ（design/adr/0041・0044）。行はグループの説明（aria-describedby）につなぐ
 * 必須は caption の文で書きます（グループには aria-required を付けられません）
 */
export function CheckboxGroup({
  label,
  caption,
  captionPlacement,
  error,
  warning,
  disabled,
  color,
  className,
  children,
  selectAll,
  allValues,
  selectAllFrame = 'none',
  'aria-describedby': ariaDescribedBy,
  ...props
}: CheckboxGroupProps) {
  const context = useMemo(() => ({ color }), [color]);
  const withSelectAll = selectAll !== undefined && selectAll !== null;
  return (
    <ChoiceGroupContext.Provider value={context}>
      <Field
        label={label}
        caption={caption}
        captionPlacement={captionPlacement}
        error={error}
        warning={warning}
        disabled={disabled}
        className={className}
        nativeLabel={false}
      >
        {(describedBy) => (
          <BaseCheckboxGroup
            {...props}
            allValues={withSelectAll ? allValues : undefined}
            disabled={disabled}
            aria-describedby={[ariaDescribedBy, describedBy].filter(Boolean).join(' ') || undefined}
            className="flex flex-col"
          >
            {withSelectAll ? (
              <SelectAllItems selectAll={selectAll} frame={selectAllFrame}>
                {children}
              </SelectAllItems>
            ) : (
              children
            )}
          </BaseCheckboxGroup>
        )}
      </Field>
    </ChoiceGroupContext.Provider>
  );
}

// 「すべて選ぶ」の箱と子の選択肢。枠の形（frame）で組み方を変える。枠の線は飾りなので、読み上げの構造には入れない
function SelectAllItems({
  selectAll,
  frame,
  children,
}: {
  selectAll: ReactNode;
  frame: ChoiceFrame;
  children: ReactNode;
}) {
  const s = choiceStyles();
  const f = frameStyles();
  const indented = <div className={s.children()}>{children}</div>;
  switch (frame) {
    case 'options':
      return (
        <>
          <CheckboxBase parent label={selectAll} />
          <div className={f.box()}>{children}</div>
        </>
      );
    case 'all':
      return (
        <div className={f.box()}>
          <CheckboxBase parent label={selectAll} />
          {indented}
        </div>
      );
    case 'notched':
      return (
        <div className={f.notched()}>
          <CheckboxBase parent label={selectAll} className={f.legend()} />
          <div className={f.body()}>{children}</div>
        </div>
      );
    default:
      return (
        <>
          <CheckboxBase parent label={selectAll} />
          {indented}
        </>
      );
  }
}
