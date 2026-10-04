import { createElement, type ReactElement } from 'react';
import { expect, test } from 'vitest';

import { renderElement } from './render-element';

// Flight が Server Component の要素を渡すときの lazy の包み（解くと要素になる）
function lazyOf(element: ReactElement): ReactElement {
  return {
    $$typeof: Symbol.for('react.lazy'),
    _payload: element,
    _init: (payload: ReactElement) => payload,
  } as unknown as ReactElement;
}

test('render が lazy の包みでも、解いた要素に props を重ねる', () => {
  const render = lazyOf(createElement('a', { href: '/page' }));
  const result = renderElement('div', render, { className: 'stack' });
  expect(result.type).toBe('a');
  expect(result.props).toMatchObject({ href: '/page', className: 'stack' });
});

test('render がないときは tag の要素を描く', () => {
  const result = renderElement('div', undefined, { className: 'stack' });
  expect(result.type).toBe('div');
});
