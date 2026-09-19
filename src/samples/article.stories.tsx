import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../components/button/Button';
import { Heading } from '../components/heading/Heading';
import { Prose } from '../components/prose/Prose';
import { Text } from '../components/text/Text';
import { TextField } from '../components/text-field/TextField';
import { SamplePage, densityOf } from './SamplePage';
import { MarkdownArticleScreen } from './markdown-article';
import { markdownArticleHtml } from './markdown-html';
import { ArticleScreen, type CalloutStyle } from './screens';

// 見本のページ: 部品を実際の画面に並べ、選べる見た目を Controls で組み合わせて見る。密度はツールバーの「密度」で切り替える

interface PageArgs {
  callout: CalloutStyle;
  blockquoteAppearance: 'line' | 'surface';
  blockquoteColor: 'neutral' | 'brand' | 'primary' | 'secondary';
  blockquoteIcon: boolean;
}

const meta = {
  title: 'Overview/見本',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'ブログの記事の見本です。囲みや引用の見た目を Controls で組み合わせて確かめます。密度はツールバーで切り替えます。',
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
    <SamplePage density={densityOf(globals)}>
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
    </SamplePage>
  ),
};

export const MarkdownArticle: Story = {
  name: 'Markdown の記事',
  render: (_args, { globals }) => (
    <SamplePage density={densityOf(globals)}>
      <MarkdownArticleScreen />
    </SamplePage>
  ),
};

export const MarkdownProse: Story = {
  name: 'Markdown（Prose）',
  render: (_args, { globals }) => (
    <SamplePage density={densityOf(globals)}>
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
    </SamplePage>
  ),
};
