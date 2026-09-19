export interface HalfWidthResult {
  value: string;
  /** 直した文字の種類。digit は数字だけ、alnum は英字も含む。直していなければ null */
  converted: 'digit' | 'alnum' | null;
}

/**
 * 全角の英数字・記号（！〜～）と全角の空白を半角に直す。1 文字を 1 文字に直すので、カーソルの位置はずれない
 * IME を入れたまま数字を打つと全角になるので、書式の桁（半角）に当てはまるように直す
 */
export function toHalfWidth(raw: string): HalfWidthResult {
  let converted: HalfWidthResult['converted'] = null;
  const value = raw.replace(/[！-～　]/g, (char) => {
    if (char === '　') return ' ';
    const half = String.fromCharCode(char.charCodeAt(0) - 0xfee0);
    if (/[0-9]/.test(half)) converted ??= 'digit';
    else if (/[A-Za-z]/.test(half)) converted = 'alnum';
    return half;
  });
  return { value, converted };
}
