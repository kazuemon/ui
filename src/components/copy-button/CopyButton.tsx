import { useState } from 'react';

import {
  CopiedStatus,
  CopyErrorContent,
  CopyErrorTooltip,
  CopyGlyph,
  copyErrorTooltipClass,
} from '../../internal/copy/copy-parts';
import { useCopy } from '../../internal/copy/use-copy';
import { Button, type ButtonProps, type ButtonShape } from '../button/Button';
import { Tooltip } from '../tooltip/Tooltip';

// 文字列をクリップボードに写すボタン。見た目は Button（枠線のグレーが既定。原則7: 画面で最も進めたい操作ではないため）
// コピーできたことの見せ方は CodeBlock のコピーのボタンに倣う（design/adr/0092）: 印がチェックに変わり、読み上げで知らせる
//   印と読み上げの箱は CodeBlock と共有する（internal/copy）
// feedback（軸 102）: tooltip（既定）は Tooltip で「コピーしました」を出す。ボタンの幅は変わらない
//   アイコンだけのボタンの tooltip では、マウスを載せたとき・キーボードでフォーカスしたときにも名前（「コピー」）を出す
//   label は「コピーしました」の文字をボタンの中に出す（CodeBlock と同じ）。文字の分だけ横に伸びる
//   どちらも印はチェックに変わる。読み上げの名前はいつも label（aria-label）。「コピーしました」は読み上げの箱（CopiedStatus）で知らせる
// 形（shape、軸 101）: アイコンだけのボタンの形。square（既定）は部品の角、round は丸
// 押すと写せたあいだ（2 秒）だけ、コピーしたあとの見た目になる
// 写せなかったとき（権限がない・安全でない接続、軸 176）: 印は変えず、同じ長さだけ淡い赤の吹き出しで知らせる
//   吹き出しは成功のものと同じ道（Tooltip）で出し、面と文字の色だけを差し替える。feedback="label" でも吹き出しで出す
//   onCopyError を渡しているときは、使う側が知らせる前提なので、部品は何も出さない

const COPIED_DURATION = 2000;

/** コピーできたことの見せ方 */
export type CopyButtonFeedback = 'tooltip' | 'label';

export interface CopyButtonProps extends Omit<
  ButtonProps,
  | 'children'
  | 'iconOnly'
  | 'loading'
  | 'loadingIndicator'
  | 'inlineSpinner'
  | 'type'
  | 'render'
  | 'appearance'
  | 'shape'
> {
  /** 写す文字列。関数を渡すと、押したときに呼んで、返した文字列を写します */
  text: string | (() => string);
  /**
   * ボタンの文字と読み上げの名前。アイコンだけのボタンでは、読み上げの名前になります。
   * 何を写すのかが周りから分からないときは、「URL をコピー」のように書きます
   * @default 'コピー'
   */
  label?: string;
  /**
   * 写せたあとに出して読み上げる文
   * @default 'コピーしました'
   */
  copiedLabel?: string;
  /**
   * 写せなかったとき（権限がない・安全でない接続）に、吹き出しに出して読み上げる文。
   * onCopyError を渡しているときは出しません
   * @default 'コピーできませんでした'
   */
  errorLabel?: string;
  /**
   * アイコンだけのボタンにします。部品の高さの正方形になり、label は読み上げの名前になります
   * @default false
   */
  iconOnly?: boolean;
  /**
   * アイコンだけのボタン（iconOnly）の形。square は文字のボタンと同じ角の正方形、round は丸です
   * @default 'square'
   */
  shape?: ButtonShape;
  /**
   * 写せたことの見せ方。どちらも印がチェックに変わり、読み上げでは copiedLabel を知らせます。
   * tooltip は吹き出しで「コピーしました」を出し、ボタンの幅は変わりません（アイコンだけのボタンでは、
   * マウスを載せたとき・キーボードでフォーカスしたときにも label を出します）。
   * label は「コピーしました」の文字をボタンの中に出し、文字の分だけボタンが横に伸びます。
   * 写せなかったことは、どちらでも同じ吹き出しで知らせます
   * @default 'tooltip'
   */
  feedback?: CopyButtonFeedback;
  /**
   * 見た目。filled は塗り、outline は枠線です。
   * @default 'outline'
   */
  appearance?: ButtonProps['appearance'];
  /** 写せたときに、写した文字列を受け取ります */
  onCopied?: (text: string) => void;
  /**
   * 写せなかったとき（権限がない・安全でない接続）に呼びます。
   * 渡すと、部品は吹き出しも読み上げも出しません（使う側が知らせる前提です）
   */
  onCopyError?: () => void;
}

/**
 * 文字列をクリップボードに写すボタン。写せると印がチェックに変わり、読み上げでも知らせます。
 * 写せなかったときは、淡い赤の吹き出しで知らせます
 */
export function CopyButton({
  text,
  label = 'コピー',
  copiedLabel = 'コピーしました',
  errorLabel = 'コピーできませんでした',
  iconOnly = false,
  feedback = 'tooltip',
  shape,
  appearance = 'outline',
  onCopied,
  onCopyError,
  onClick,
  className,
  'aria-label': ariaLabel,
  ...props
}: CopyButtonProps) {
  const { copied, failed, copy } = useCopy(COPIED_DURATION);
  // onCopyError を渡しているときは、使う側が知らせる前提なので、部品は何も出さない
  const showError = failed && !onCopyError;
  // アイコンだけのボタンの tooltip で、マウスを載せて名前を出しているか
  const [hovered, setHovered] = useState(false);

  const handleClick: ButtonProps['onClick'] = (event) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    const value = typeof text === 'function' ? text() : text;
    void copy(value).then((ok) => (ok ? onCopied?.(value) : onCopyError?.()));
  };

  const showLabel = feedback === 'label';
  const glyph = <CopyGlyph copied={copied} standalone={iconOnly} />;
  const common = {
    ...props,
    appearance,
    onClick: handleClick,
    'data-slot': 'copy-button',
    'data-copied': copied ? '' : undefined,
  };

  let button;
  if (iconOnly) {
    // 文字が加わるときは、CodeBlock のボタンと同じく、印の左右の余白を (高さ − 印) / 2 にして横に伸ばす
    const grown = showLabel && copied;
    button = (
      <Button
        {...common}
        iconOnly
        shape={shape}
        aria-label={ariaLabel ?? label}
        className={[
          grown && 'gap-1.5 px-[calc((var(--spacing-control)-var(--spacing-icon))/2)]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {glyph}
        {grown ? <span aria-hidden="true">{copiedLabel}</span> : null}
      </Button>
    );
  } else {
    // 名前はいつも label（「コピーしました」は読み上げの箱で知らせるので、名前には入れない）
    button = (
      <Button {...common} aria-label={ariaLabel ?? label} className={className}>
        {glyph}
        {showLabel && copied ? <span aria-hidden="true">{copiedLabel}</span> : label}
      </Button>
    );
  }

  // 写せなかったことは、feedback によらず同じ吹き出しで知らせる（軸 176）
  //   tooltip では、写せたことと同じ吹き出しの色だけを差し替える
  //   label では、出すあいだだけ Tooltip を動かす（止めているあいだは、マウスを載せたとき・長押ししたときの振る舞いが変わらない）
  if (feedback !== 'label') {
    button = (
      <Tooltip
        content={showError ? <CopyErrorContent label={errorLabel} /> : copied ? copiedLabel : label}
        className={showError ? copyErrorTooltipClass : undefined}
        open={showError || copied || (iconOnly && hovered)}
        onOpenChange={setHovered}
        disabled={props.disabled}
      >
        {button}
      </Tooltip>
    );
  } else {
    button = (
      <CopyErrorTooltip open={showError} label={errorLabel}>
        {button}
      </CopyErrorTooltip>
    );
  }

  return (
    <>
      {button}
      <CopiedStatus
        copied={copied}
        label={copiedLabel}
        failed={showError}
        errorLabel={errorLabel}
      />
    </>
  );
}
