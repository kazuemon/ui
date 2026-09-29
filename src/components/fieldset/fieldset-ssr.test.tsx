import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { Fieldset } from './Fieldset';

// サーバーで描いた HTML でも、まとまりの名前（aria-labelledby → 見出し）が入っている
test('サーバーで描いた Fieldset は、見出しを名前につなぐ', () => {
  const html = renderToStaticMarkup(<Fieldset label="住所" />);
  const labelledBy = /<fieldset[^>]*aria-labelledby="([^"]+)"/.exec(html)?.[1];
  expect(labelledBy).toBeTruthy();
  expect(html).toContain(`id="${labelledBy}"`);
});
