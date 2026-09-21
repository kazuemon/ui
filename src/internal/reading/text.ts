// 読む文字（Text）の見た目。Text と Prose の根が同じクラス列を使う（書き方は heading.ts の先頭）
// 部品の中の文字（--text-control）とは別の大きさを持ち、密度で変わる（原則11）
// 文字は濃紺（判断の基準「やわらかい」）。薄くするときは muted・subtle の役割の色だけを使う
// 本文はマウスで 16px、指で 14px（部品の文字と同じ）。読みもの（data-reading の中）では指でも 16px — 軸 51 の E
// Prose では根に付け、中の段落・リスト・引用が受け継ぐ
// variant は濃さ（body・muted・subtle）と、大きさ・太さ・色をまとめて決める組（label・caption）
//   label・caption の値は Text 自身のトークン（--text-variant-label-*・--text-variant-caption-*）。既定は欄のラベル・キャプション
//   （src/internal/field/field-styles.ts）と同じで、軸 266 で決めるまでは仮
export const textStyles = {
  size: {
    md: 'text-body',
    sm: 'text-body-sm',
  },
  // 濃さ。Text・Time・RelativeTime・NumberFormat が同じ値を持つ
  variant: {
    body: 'text-fg',
    muted: 'text-fg-muted',
    subtle: 'text-fg-subtle',
  },
  // 大きさ・太さ・色をまとめて決める組（Text だけが持つ）。値は Text 自身のトークン（design/tokens.css の部品の層）
  fieldVariant: {
    label:
      'text-(length:--text-variant-label-size) leading-(--text-variant-label-leading) font-(weight:--text-variant-label-weight) text-(color:--text-variant-label-color)',
    caption:
      'text-(length:--text-variant-caption-size) leading-(--text-variant-caption-leading) font-(weight:--text-variant-caption-weight) text-(color:--text-variant-caption-color)',
  },
  weight: {
    normal: 'font-normal',
    medium: 'font-medium',
    bold: 'font-bold',
  },
} as const;
