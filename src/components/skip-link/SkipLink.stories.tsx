import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { SkipLink } from './SkipLink';
import { SkipLinkPage } from './story-page';
import { DensityPair } from '../../stories/story-parts';
import { sourceCode } from '../../stories/story-states';

// フォーカスした見た目に固定する。出るのは :focus、線は :focus-visible
const focusPseudo = {
  rootSelector: 'body',
  focus: ['[data-preview="focus"] [data-slot="skip-link"]'],
  focusVisible: ['[data-preview="focus"] [data-slot="skip-link"]'],
};

const meta = {
  title: 'Components/SkipLink',
  component: SkipLink,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '本文へ移るリンクです。ふだんは見えず、Tab でフォーカスしたときだけ画面の左上に出ます。キーボードで操作する人が、ヘッダーのナビを飛ばして本文へ移れます。',
          '',
          '- ページの最初（ヘッダーより前）に 1 つ置きます。',
          '- `href`（既定は `#main`）は移り先の id です。本文の要素に同じ id を付けます（`<main id="main">`）。移り先に `tabIndex` は要りません。',
          '- 文字（children）の既定は「本文へ移動」です。',
          '- 画面に固定して出るので、置く場所の見た目には影響しません。',
        ].join('\n'),
      },
    },
  },
  args: { href: '#main', children: '本文へ移動' },
  argTypes: {
    href: { control: 'text', table: { defaultValue: { summary: "'#main'" } } },
    children: { control: 'text', table: { defaultValue: { summary: "'本文へ移動'" } } },
  },
} satisfies Meta<typeof SkipLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  parameters: {
    controls: { exclude: ['href'] },
    docs: {
      description: { story: 'Tab でフォーカスを進めると、見本のページの最初で左上に出ます。' },
      source: sourceCode(`
        <body>
          <SkipLink />
          <header>…</header>
          <Container size="prose" render={<main id="main" />}>…</Container>
        </body>
      `),
    },
  },
  render: (args) => <SkipLinkPage idPrefix="playground" label={args.children} />,
};

// フォーカスしたときの見た目。画面の幅と密度ごと
export const Focused: Story = {
  tags: ['visual'],
  name: 'フォーカスしたとき',
  parameters: { controls: { disable: true }, pseudo: focusPseudo },
  render: () => (
    <div data-preview="focus">
      <DensityPair>
        <SkipLinkPage width={360} idPrefix="focused" />
      </DensityPair>
    </div>
  ),
};

// 読み上げと props の確かめ: ふだんは隠れ、Tab で最初に止まって見える。href の既定は #main
export const Accessibility: Story = {
  name: '読み上げ',
  render: () => <SkipLinkPage idPrefix="a11y" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: '本文へ移動' });
    await expect(link).toHaveAttribute('href', '#a11y-main');
    await expect(link.getBoundingClientRect().width).toBeLessThanOrEqual(1);
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(link.getBoundingClientRect().width).toBeGreaterThan(40);
    await userEvent.tab();
    await expect(link.getBoundingClientRect().width).toBeLessThanOrEqual(1);
  },
};

// href の既定
export const DefaultHref: Story = {
  name: '既定の移り先',
  render: () => <SkipLink />,
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: '本文へ移動' });
    await expect(link).toHaveAttribute('href', '#main');
  },
};
