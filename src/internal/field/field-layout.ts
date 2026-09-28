'use client';

import { createContext } from 'react';

// 試作（Design Review 385）: ラベルの置き場所。決まったら props（labelPlacement・accessibleName）と Form の既定に畳む
//   top: 本体の上（原則4 の現行）
//   start: 本体の左。ラベルの列の幅は --field-label-width（auto で中身なり）、列の間は --field-label-gap
//   hidden: 見た目から外し、読み上げにだけ残す（決まったら label を省いて accessibleName を必須にする形に置き換える）
export type FieldLabelPlacement = 'top' | 'start' | 'hidden';

export interface FieldLayout {
  labelPlacement?: FieldLabelPlacement;
  /** start のとき、キャプションを本体の下に置くか（control）、ラベルの下に置くか（label） */
  captionColumn?: 'control' | 'label';
  /**
   * 置いた場所がいちばん狭いとき（24rem 未満。Pagination の narrowDisplay と同じ幅）のラベルの置き場所
   * start は横のまま（既定。軸 388）、top は上に戻す
   */
  narrowLabelPlacement?: 'start' | 'top';
}

export const FieldLayoutContext = createContext<FieldLayout>({});
