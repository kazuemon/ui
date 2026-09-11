import type { Preview } from '@storybook/react-vite';
import { create } from 'storybook/theming';

import '../src/styles/globals.css';

const preview: Preview = {
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
        order: ['Introduction', '*'],
      },
    },
  },
};

export default preview;
