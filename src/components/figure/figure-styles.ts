import { figureImageStyles } from '../../internal/reading/blocks';
import { tv } from '../../internal/tv';

// 画像（軸 59）。キャプション付きは <figure><img><figcaption>
// 見た目のクラス列は src/internal/reading/blocks.ts（Prose が素の img に同じ見た目を当てる）
// キャプションは中央、注記の大きさ・--color-fg-subtle
export const figureImage = tv({
  base: figureImageStyles.base,
  variants: {
    outline: {
      true: figureImageStyles.outline,
      false: '',
    },
  },
  defaultVariants: { outline: true },
});

/** 画像の見た目のクラス（輪郭あり）。Markdown の <p><img> にも同じ見た目を当てるときに使います */
export const figureImageClassName = figureImage();
