import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config.ts';

// Storybook のストーリーをテストとして動かす（@storybook/addon-vitest）
// どのストーリーも描けるか（描けないとエラー）と、play の中の確かめ（expect）を、ヘッドレスの Chromium で走らせる
// 対象は .storybook/main.ts の stories と同じ。ブラウザは `pnpm exec playwright install --only-shell chromium` で入れる
// vite.config.ts（React と Tailwind）を重ねる。重ねないと、テストでは CSS が Tailwind を通らない
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
            browser: {
              enabled: true,
              headless: true,
              provider: playwright({}),
              instances: [{ browser: 'chromium' }],
            },
          },
        },
      ],
    },
  })
);
