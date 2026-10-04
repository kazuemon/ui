import { expect, test } from 'vitest';

import { focusRing, focusRingForCardAction, focusRingInProse } from './focus-styles';

const classesOf = (list: readonly string[]) => list.join(' ').split(/\s+/).filter(Boolean);

test('Prose のフォーカスの線は、focusRing の各クラスに [&_:is(a,table)]: を付けたもの', () => {
  expect(classesOf(focusRingInProse)).toEqual(
    classesOf(focusRing).map((name) => `[&_:is(a,table)]:${name}`)
  );
});

test('押すカードのフォーカスの線は、focusRing の focus-visible: を中の button の has-[…] に置き換えたもの', () => {
  expect(classesOf(focusRingForCardAction)).toEqual(
    classesOf(focusRing).map((name) =>
      name.replace(/^focus-visible:/, 'has-[[data-slot=card-action]:focus-visible]:')
    )
  );
});
