import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Container } from '../components/container/Container';
import { Link } from '../components/link/Link';
import { Text } from '../components/text/Text';
import { sourceCode } from '../stories/story-states';

// レシピ: 部品にせず、既存の部品を組み合わせて作るもの。ここに置くのは組み方の見本で、公開の入口（src/index.ts）には足さない

const columns = [
  {
    label: 'Site',
    links: [
      { label: 'Works', href: '#works' },
      { label: 'Blog', href: '#blog' },
      { label: 'About', href: '#about' },
    ],
  },
  {
    label: 'Social',
    links: [
      { label: 'GitHub', href: 'https://github.com/kazuemon' },
      { label: 'X', href: 'https://x.com/kazuemon' },
    ],
  },
];

const meta = {
  title: 'Recipes/Footer',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          'ページの下の帯です。部品としては用意していません。`Container`・`Link`・`Text` を組み合わせて作ります。',
          '',
          '- 外側は `<footer>` にします。読み上げでは、ページのフッター（contentinfo）として読まれます。',
          '- 幅と左右の余白は `Container` で決めます。`Navbar` と同じ `size` にすると、上の帯と端がそろいます。',
          '- 本文との境目は、`Navbar` の下と同じ細い線（`border-line`）です。',
          '- リンクの列は、列ごとに `<nav aria-label>` で名前を付けた `<ul>` に並べます。外のサイトへのリンクは `target="_blank"` にすると、矢印と読み上げの「新しいタブで開きます」が付きます。',
          '- 著作の行は `Text` の小さく薄い文字です。',
        ].join('\n'),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Columns: Story = {
  tags: ['visual'],
  name: 'リンクの列と著作の行',
  parameters: {
    docs: {
      source: sourceCode(`
        <footer className="border-t border-line">
          <Container className="flex flex-col gap-8 py-10">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              <nav aria-label="Site" className="flex flex-col gap-3">
                <p className="text-(length:--text-caption) leading-(--leading-caption) font-bold text-fg-subtle">
                  Site
                </p>
                <ul className="flex flex-col gap-2">
                  <li><Link href="/works">Works</Link></li>
                  <li><Link href="/blog">Blog</Link></li>
                </ul>
              </nav>
            </div>
            <Text size="sm" variant="subtle">© 2026 kazuemon</Text>
          </Container>
        </footer>
      `),
    },
  },
  render: () => (
    <footer className="border-t border-line">
      <Container className="flex flex-col gap-8 py-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {columns.map((column) => (
            <nav key={column.label} aria-label={column.label} className="flex flex-col gap-3">
              <p className="text-(length:--text-caption) leading-(--leading-caption) font-bold text-fg-subtle">
                {column.label}
              </p>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <Text size="sm" variant="subtle">
          © 2026 kazuemon
        </Text>
      </Container>
    </footer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('contentinfo')).toBeInTheDocument();
    await expect(canvas.getByRole('navigation', { name: 'Social' })).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: /GitHub.*新しいタブで開きます/ })).toBeVisible();
  },
};

export const Compact: Story = {
  tags: ['visual'],
  name: '1 行だけ',
  parameters: {
    docs: {
      description: {
        story: 'リンクが少ないときは、著作の行と同じ行に並べます。狭い画面では折り返します。',
      },
      source: sourceCode(`
        <footer className="border-t border-line">
          <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-6">
            <Text size="sm" variant="subtle">© 2026 kazuemon</Text>
            <nav aria-label="フッター">
              <ul className="flex gap-4">
                <li><Link href="/privacy">プライバシー</Link></li>
                <li><Link href="https://github.com/kazuemon" target="_blank">GitHub</Link></li>
              </ul>
            </nav>
          </Container>
        </footer>
      `),
    },
  },
  render: () => (
    <footer className="border-t border-line">
      <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-6">
        <Text size="sm" variant="subtle">
          © 2026 kazuemon
        </Text>
        <nav aria-label="フッター">
          <ul className="flex gap-4">
            <li>
              <Link href="#privacy">プライバシー</Link>
            </li>
            <li>
              <Link href="https://github.com/kazuemon" target="_blank">
                GitHub
              </Link>
            </li>
          </ul>
        </nav>
      </Container>
    </footer>
  ),
};
