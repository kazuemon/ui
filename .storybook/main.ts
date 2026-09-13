import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    // デザイン原則の後半の比較（design/README.md）
    '../design/stories/**/*.stories.@(ts|tsx)',
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
