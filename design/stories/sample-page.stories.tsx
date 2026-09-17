import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';

import { Button } from '../../src/components/button/Button';
import { Heading } from '../../src/components/heading/Heading';
import { Link } from '../../src/components/link/Link';
import { Prose } from '../../src/components/prose/Prose';
import { Text } from '../../src/components/text/Text';
import { TextField } from '../../src/components/text-field/TextField';
import { MarkdownArticleScreen } from './samples/markdown-article';
import { markdownArticleHtml } from './samples/markdown-html';
import { ArticleScreen, type CalloutStyle, SettingsScreen, SnsScreen } from './samples/screens';

// 見本のページ: 部品を実際の画面に並べ、選べる見た目を Controls で組み合わせて見る。密度はツールバーの「密度」で切り替える

interface PageArgs {
  callout: CalloutStyle;
  blockquoteAppearance: 'line' | 'surface';
  blockquoteColor: 'neutral' | 'brand' | 'primary' | 'secondary';
  blockquoteIcon: boolean;
}

// 密度の値（--text-body など）は data-density を付けた要素で決まる。トークンを上書きして比べるときに効くよう、
// ページの包みにも密度を付け直す。ツールバーが「入力方式に合わせる」なら、いまの入力方式から決める
function densityOf(globals: Record<string, unknown>) {
  if (globals.density === 'coarse' || globals.density === 'fine') return globals.density;
  return window.matchMedia('(pointer: coarse)').matches ? 'coarse' : 'fine';
}

function Page({
  density,
  style,
  children,
}: {
  density: 'coarse' | 'fine';
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div style={style} data-density={density} className="min-h-screen bg-bg text-fg">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[720px] items-center justify-between gap-4 px-5 py-3">
          <Text as="span" className="font-heading text-fg-brand">
            kazuemon
          </Text>
          <nav className="flex gap-4">
            <Link href="#works">Works</Link>
            <Link href="#blog">Blog</Link>
            <Link href="#about">About</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[720px] px-5 py-10">{children}</main>
      <footer className="border-t border-line">
        <div className="mx-auto max-w-[720px] px-5 py-6">
          <Text size="sm" tone="subtle">
            © 2026 kazuemon
          </Text>
        </div>
      </footer>
    </div>
  );
}

const meta = {
  title: 'Design Review/00 見本のページ',
  id: 'design-review-00-sample-page',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '決めている途中の軸の候補と、選べる見た目を組み合わせて、実際の画面で確かめるページです。密度はツールバーで切り替えます。',
      },
    },
  },
  args: {
    callout: 'soft',
    blockquoteAppearance: 'line',
    blockquoteColor: 'neutral',
    blockquoteIcon: false,
  },
  argTypes: {
    callout: {
      name: '記事の中の囲み（Callout）',
      control: {
        type: 'select',
        labels: {
          soft: 'soft（淡い面）',
          'soft-no-icon': 'soft・icon={false}（題だけ）',
          muted: 'muted（グレーの面に小さな題）',
          outline: 'outline（白い面に輪郭）',
          filled: 'filled（濃い塗り）',
        },
      },
      options: ['soft', 'soft-no-icon', 'muted', 'outline', 'filled'],
    },
    blockquoteAppearance: {
      name: '引用: appearance',
      control: 'inline-radio',
      options: ['line', 'surface'],
    },
    blockquoteColor: {
      name: '引用: color',
      control: 'inline-radio',
      options: ['neutral', 'brand', 'primary', 'secondary'],
    },
    blockquoteIcon: { name: '引用: icon（引用符）', control: 'boolean' },
  },
} satisfies Meta<PageArgs>;

export default meta;
type Story = StoryObj<PageArgs>;

export const Article: Story = {
  name: '記事',
  render: (args, { globals }) => (
    <Page density={densityOf(globals)}>
      {/* 記事は読みもの。Prose ができるまでは data-reading を直接付ける */}
      <div data-reading>
        <ArticleScreen
          full
          callout={args.callout}
          blockquote={{
            appearance: args.blockquoteAppearance,
            color: args.blockquoteColor,
            icon: args.blockquoteIcon,
          }}
        />
      </div>
      <section className="mt-12 flex flex-col gap-4 border-t border-line pt-8">
        <Heading level={2} size={3}>
          コメント
        </Heading>
        <TextField label="名前" placeholder="かずえもん" />
        <TextField label="コメント" caption="公開されます" />
        <div>
          <Button color="primary">送信する</Button>
        </div>
      </section>
    </Page>
  ),
};

export const Settings: Story = {
  name: '設定画面',
  render: (_args, { globals }) => (
    <Page density={densityOf(globals)}>
      <div className="max-w-[480px]">
        <SettingsScreen />
      </div>
    </Page>
  ),
};

export const Sns: Story = {
  name: 'SNS',
  render: (_args, { globals }) => (
    <Page density={densityOf(globals)}>
      <div className="max-w-[480px]">
        <SnsScreen />
      </div>
    </Page>
  ),
};

export const MarkdownArticle: Story = {
  name: 'Markdown の記事',
  render: (_args, { globals }) => (
    <Page density={densityOf(globals)}>
      <MarkdownArticleScreen />
    </Page>
  ),
};

export const MarkdownProse: Story = {
  name: 'Markdown（Prose）',
  render: (_args, { globals }) => (
    <Page density={densityOf(globals)}>
      <article className="flex flex-col">
        <Text size="sm" tone="subtle">
          2026年9月17日・Design
        </Text>
        <Heading level={1} className="mt-1">
          Markdown で書いた記事の見本
        </Heading>
        {/* 変換した HTML は、Prose の子の div に入れる。見本の文字列は手で書いたもの（ビルド時に自分で作った HTML だけを入れる） */}
        <Prose className="mt-4">
          <div dangerouslySetInnerHTML={{ __html: markdownArticleHtml }} />
        </Prose>
      </article>
    </Page>
  ),
};
