import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    // ストーリーはそれぞれのディレクトリの直下だけを見る（** にしない）。見た目の基準画像が入る
    // __screenshots__/Button.stories.tsx はディレクトリなので、** だと索引作りが EISDIR で落ちる
    '../src/components/*/*.stories.@(js|jsx|mjs|ts|tsx)',
    // 部品をまたぐ一覧（押せない状態の一覧など）
    '../src/stories/*.stories.@(js|jsx|mjs|ts|tsx)',
    // レシピ: 部品にせず、既存の部品を組み合わせて作るものの見本
    '../src/recipes/*.stories.@(js|jsx|mjs|ts|tsx)',
    // デザイン原則の後半の比較（design/README.md）
    '../design/stories/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-docs',
    'storybook-addon-pseudo-states',
    // ストーリーを Vitest のテストとして動かす（vitest.config.ts）
    '@storybook/addon-vitest',
  ],
  framework: '@storybook/react-vite',
};
export default config;
