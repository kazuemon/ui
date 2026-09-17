import { expect, test } from 'vitest';

import { focusRing, focusRingInProse } from './focus-styles';

const classesOf = (list: readonly string[]) => list.join(' ').split(/\s+/).filter(Boolean);

test('Prose のフォーカスの線は、focusRing の各クラスに [&_:is(a,table)]: を付けたもの', () => {
  expect(classesOf(focusRingInProse)).toEqual(
    classesOf(focusRing).map((name) => `[&_:is(a,table)]:${name}`)
  );
});
