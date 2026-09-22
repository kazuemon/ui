import { textStyles } from '../reading/text';
import { tv } from '../tv';

// 日時（Time・RelativeTime）の見た目。Text と同じ役割（src/internal/reading/text.ts）の大きさと見た目（濃さ）を、既定なしで持つ
// 指定しなければ周りの文字のまま。数字の幅は変えない（欧文フォント Mulish の数字は、はじめから等幅）
export const timeText = tv({
  variants: {
    size: textStyles.size,
    variant: textStyles.variant,
  },
});
