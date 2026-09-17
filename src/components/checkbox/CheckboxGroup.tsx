import { CheckboxGroup as BaseCheckboxGroup } from '@base-ui/react/checkbox-group';
import { type ComponentProps, type ReactNode, useMemo } from 'react';

import { ChoiceGroupContext } from '../../internal/choice/choice-group-context';
import {
  type ChoiceColor,
  choiceGroupMessagePull,
  choiceSize,
  choiceStyles,
} from '../../internal/choice/choice-styles';
import { type CaptionPlacement, Field } from '../../internal/field/Field';
import { tv } from '../../internal/tv';
import { CheckboxBase } from './Checkbox';

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
        className={[...choiceGroupMessagePull(captionPlacement), className]
          .filter(Boolean)
          .join(' ')}
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
          <div data-choice-frame="" className={f.box()}>
            {children}
          </div>
        </>
      );
    case 'all':
      return (
        <div data-choice-frame="" className={f.box()}>
          <CheckboxBase parent label={selectAll} />
          {indented}
        </div>
      );
    case 'notched':
      return (
        <div data-choice-frame="" className={f.notched()}>
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
