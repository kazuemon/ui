import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import tokens from '../../../design/tokens.css?raw';
import { ArrowUDownLeftIcon } from '../../internal/icons';

// Prose は、脚注の戻るリンクの文字 ↩ を隠し、tokens の --footnote-backref-icon（SVG）を mask で描く
// 部品の FootnoteItem が置くアイコン（ArrowUDownLeftIcon）と、形・線の太さが同じかを確かめる

const shapesOf = (svg: string) =>
  [...svg.matchAll(/<(polyline|path)\s+(points|d)=['"]([^'"]+)['"]/g)].map(
    ([, tag, attr, value]) => `${tag} ${attr}=${value}`
  );

test('脚注の戻るリンクの SVG は、部品のアイコンと同じ形・同じ線の太さ', () => {
  const declaration = /--footnote-backref-icon:\s*url\("data:image\/svg\+xml,([^"]+)"\)/.exec(
    tokens
  );
  expect(declaration).not.toBeNull();
  const maskSvg = decodeURIComponent(declaration![1]);
  const iconSvg = renderToStaticMarkup(ArrowUDownLeftIcon({}));

  expect(shapesOf(maskSvg)).toEqual(shapesOf(iconSvg));
  expect(shapesOf(maskSvg).length).toBeGreaterThan(0);

  const iconStroke = /--icon-stroke:\s*(\d+);/.exec(tokens)?.[1];
  expect(/stroke-width='(\d+)'/.exec(maskSvg)?.[1]).toBe(iconStroke);
});
