import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config.ts';

// Storybook のストーリーをテストとして動かす（@storybook/addon-vitest）
// どのストーリーも描けるか（描けないとエラー）と、play の中の確かめ（expect）を、ヘッドレスの Chromium で走らせる
// 対象は .storybook/main.ts の stories と同じ。ブラウザは `pnpm exec playwright install --only-shell chromium` で入れる
// vite.config.ts（React と Tailwind）を重ねる。重ねないと、テストでは CSS が Tailwind を通らない
// tags: ['visual'] の付いたストーリーは、見た目もくらべる（.storybook/visual.setup.ts）
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        {
          extends: true,
          plugins: [
            storybookTest({ configDir: fileURLToPath(new URL('.storybook', import.meta.url)) }),
          ],
          test: {
            name: 'storybook',
            setupFiles: [fileURLToPath(new URL('.storybook/visual.setup.ts', import.meta.url))],
            browser: {
              enabled: true,
              headless: true,
              provider: playwright({
                // CSS の 1px を画像の 1px で撮る。
                // ストーリーを描く枠（@storybook/addon-vitest の既定は 1200×900）が窓に収まらないと、
                // Vitest が枠ごと縮めて表示する（既定の窓 1280×720 では 0.8 倍）。縮むと 1px のずれが
                // ふちのぼかしになり、pixelmatch がふちのぼかしを数えないので見のがす。窓を枠より大きく取る
                contextOptions: {
                  deviceScaleFactor: 1,
                  viewport: { width: 1400, height: 1100 },
                },
                launchOptions: {
                  args: [
                    // 動きを減らす設定（prefers-reduced-motion: reduce）で撮る
                    '--force-prefers-reduced-motion',
                    // headless の既定は「マウスなし」で、hover の見た目（@media (hover: hover)）も
                    // 密度（@media (pointer: coarse)）も出ない。マウスがある状態に固定する
                    '--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4',
                  ],
                },
              }),
              // 画面の大きさは @storybook/addon-vitest がストーリーごとに当てる（既定 1200×900）。
              // 変えたいストーリーでは parameters.viewport を指定する
              expect: {
                toMatchScreenshot: {
                  comparatorName: 'pixelmatch',
                  // 食い違いは 1px も許さない。割合で許すと（0.2% でも）角を 12px から 0px にした違いが
                  // 通ってしまう。ふちのぼかしは pixelmatch が数えない（includeAA の既定）
                  comparatorOptions: { allowedMismatchedPixels: 0 },
                },
              },
              instances: [{ browser: 'chromium' }],
            },
          },
        },
      ],
    },
  })
);
