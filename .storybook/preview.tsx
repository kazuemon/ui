import type { Decorator, Preview } from '@storybook/react-vite';
import { create } from 'storybook/theming';

import '../src/styles/globals.css';

// 密度（原則11）をツールバーから固定する。Select の選択肢は body の直下に出るので、html に付ける
const withDensity: Decorator = (Story, { globals }) => {
  const root = document.documentElement;
  if (globals.density === 'coarse' || globals.density === 'fine') {
    root.dataset.density = globals.density;
  } else {
    delete root.dataset.density;
  }
  // 大きい指用（design/adr/0045）。指用の高さを 52px にする。マウス用では変わらない
  root.classList.toggle('coarse-large', globals.coarseSize === 'large');
  return <Story />;
};

const preview: Preview = {
  decorators: [withDensity],
  globalTypes: {
    coarseSize: {
      description: '指用の高さ（原則11・ADR-0045）',
      toolbar: {
        title: '指用の高さ',
        icon: 'ruler',
        items: [
          { value: 'default', title: '44px（既定）' },
          { value: 'large', title: '52px（coarse-large）' },
        ],
        dynamicTitle: true,
      },
    },
    density: {
      description: '密度（原則11）',
      toolbar: {
        title: '密度',
        icon: 'mobile',
        items: [
          { value: 'auto', title: '入力方式に合わせる' },
          { value: 'coarse', title: '指（coarse）' },
          { value: 'fine', title: 'マウス（fine）' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { density: 'auto', coarseSize: 'default' },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    htmlLang: 'ja',
    docs: {
      lang: 'ja',
      theme: create({ base: 'light', fontBase: 'var(--font-sans)', fontCode: 'var(--font-mono)' }),
    },
    options: {
      storySort: {
        order: ['Introduction', '*', 'Design Review'],
      },
    },
  },
};

export default preview;
