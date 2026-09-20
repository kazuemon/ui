import { createContext } from 'react';

import type { ChoiceColor } from './choice-styles';

/** CheckboxGroup・RadioGroup が中の選択肢に渡すもの。null ならグループの外（1つだけ置いた Checkbox） */
export const ChoiceGroupContext = createContext<{ color?: ChoiceColor; readOnly?: boolean } | null>(
  null
);
