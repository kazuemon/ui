import { useEffect, useLayoutEffect } from 'react';

// サーバーで描くときは useLayoutEffect が警告を出すので、ブラウザでだけ useLayoutEffect を使う
export const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;
