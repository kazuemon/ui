import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, ReactNode } from 'react';
import { expect } from 'storybook/test';

import { Card, CardBody, CardImage } from './Card';
import { landscape } from '../../../design/stories/samples/images';
import { DensityPair, Matrix } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';
import { Heading } from '../heading/Heading';
import { Tag } from '../tag/Tag';
import { Text } from '../text/Text';

const appearances = ['default', 'nested'] as const;

const Content = ({ title = 'やった仕事のタイトルがここに入ります' }: { title?: string }) => (
  <>
    <Text size="sm" tone="subtle">
      2026.09.19
    </Text>
    <Heading level={3} size={4}>
      {title}
    </Heading>
  </>
);

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '画像と文をまとめて見せる面です。作品や記事の一覧に使います。',
          '',
          '- 画像は `CardImage`、文は `CardBody` に入れます。画像は 16:9 の枠に収め、はみ出た分を切ります。',
          '- `appearance` は型です。`default`（既定）は画像をカードの端まで届かせ、`nested` は画像をカードの内側に余白を空けて収めます。',
          '- `href` を渡すと、カード全体が 1 つのリンクになります。Next.js の `Link` は `render` に渡します。`target="_blank"` のときは、読み上げに「新しいタブで開きます」を足します。',
          '- カード全体がリンクになるので、中にほかのリンクやボタンは置けません。置きたいときは `href` を渡さず、題をリンクにします。',
          '- 全体が押せるカードは、ボタンと同じ薄い影で浮かせます。hover で影が減って面が淡く塗られ、押すと沈みます。押せないカードには影を付けません。',
          '- hover で画像を少し大きくしたいときは、`imageZoom` を渡します。',
          '- 幅は置いた場所に合わせます。一覧は grid で並べます。',
        ].join('\n'),
      },
    },
  },
  args: { appearance: 'default', imageZoom: false },
  argTypes: {
    appearance: {
      control: 'inline-radio',
      options: appearances,
      table: { defaultValue: { summary: "'default'" } },
    },
    href: { control: 'text' },
    imageZoom: { control: 'boolean' },
    render: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const narrow = (Story: () => ReactNode) => <div className="max-w-xs">{Story()}</div>;

export const Playground: Story = {
  name: '基本',
  decorators: [narrow],
  parameters: {
    docs: {
      source: sourceCode(`
        <Card href="/works/1">
          <CardImage src="/works/1.png" alt="" />
          <CardBody>
            <Text size="sm" tone="subtle">2026.09.19</Text>
            <Heading level={3} size={4}>やった仕事のタイトルがここに入ります</Heading>
          </CardBody>
        </Card>
      `),
    },
  },
  args: { href: '#' },
  render: (args) => (
    <Card {...args}>
      <CardImage src={landscape} alt="" />
      <CardBody>
        <Content />
      </CardBody>
    </Card>
  ),
};

export const Appearances: Story = {
  tags: ['visual'],
  name: '型',
  parameters: {
    controls: { exclude: ['appearance'] },
    docs: {
      description: {
        story:
          '`default` は画像を端まで届かせ、`nested` は内側に収めます。画像がなければ、文だけのカードになります。',
      },
    },
  },
  decorators: [(Story) => <div className="max-w-3xl">{Story()}</div>],
  render: (args) => (
    <div className="grid grid-cols-3 gap-6">
      {appearances.map((appearance) => (
        <Card key={appearance} {...args} appearance={appearance}>
          <CardImage src={landscape} alt="" />
          <CardBody>
            <Content title={appearance} />
          </CardBody>
        </Card>
      ))}
      <Card {...args}>
        <CardBody>
          <Content title="画像のないカード" />
          <Text size="sm" tone="muted">
            文だけを並べることもできます。
          </Text>
        </CardBody>
      </Card>
    </div>
  ),
};

const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: '押下', state: 'active' },
  { label: 'フォーカス（キーボード）', state: 'focus' },
];

export const States: Story = {
  tags: ['visual'],
  name: '押せるカードの状態',
  parameters: {
    controls: { exclude: ['appearance', 'href'] },
    pseudo: statePseudo({
      hover: '[data-slot="card"]',
      active: '[data-slot="card"]',
      focusVisible: '[data-slot="card"]',
    }),
  },
  decorators: [(Story) => <div className="max-w-5xl">{Story()}</div>],
  render: (args) => (
    <Matrix
      rows={appearances}
      columns={stateColumns}
      columnWidth="12rem"
      rowLabel={(appearance) => appearance}
      renderCell={(appearance) => (
        <Card {...args} appearance={appearance} href="#">
          <CardImage src={landscape} alt="" />
          <CardBody>
            <Content />
          </CardBody>
        </Card>
      )}
    />
  ),
};

export const List: Story = {
  tags: ['visual'],
  name: '一覧',
  parameters: {
    docs: {
      description: {
        story: '一覧は grid で並べます。文の長さが違っても、同じ行のカードは高さがそろいます。',
      },
    },
  },
  decorators: [(Story) => <div className="max-w-4xl">{Story()}</div>],
  render: (args) => (
    <ul className="grid grid-cols-3 gap-6">
      {[
        'やった仕事のタイトルがここに入ります',
        '短いタイトル',
        'デザインシステムを作った話と、候補を並べて選ぶループのこと',
      ].map((title) => (
        <li key={title} className="flex">
          <Card {...args} href="#" className="w-full">
            <CardImage src={landscape} alt="" />
            <CardBody>
              <Content title={title} />
              <div className="flex gap-1.5">
                <Tag>Design</Tag>
                <Tag>React</Tag>
              </div>
            </CardBody>
          </Card>
        </li>
      ))}
    </ul>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  decorators: [(Story) => <div className="max-w-2xl">{Story()}</div>],
  render: (args) => (
    <DensityPair>
      <div className="w-64">
        <Card {...args} href="#">
          <CardImage src={landscape} alt="" />
          <CardBody>
            <Content />
          </CardBody>
        </Card>
      </div>
    </DensityPair>
  ),
};

// Next.js の Link の代わり。href などを受け取り、渡された props を a に付ける
function FrameworkLink(props: ComponentProps<'a'> & { href: string }) {
  return <a data-framework-link="" {...props} />;
}

export const FrameworkLinkStory: Story = {
  name: 'Next.js の Link',
  decorators: [narrow],
  parameters: {
    docs: {
      description: {
        story:
          'Next.js の `Link` などは `render` に渡します。`href` は渡した要素に書きます。カードの見た目と、カード全体が押せることはそのままです。',
      },
      source: sourceCode(`
        import NextLink from 'next/link';

        <Card render={<NextLink href="/works/1" />}>
          <CardImage src="/works/1.png" alt="" />
          <CardBody>…</CardBody>
        </Card>
      `),
    },
  },
  render: (args) => (
    <Card {...args} render={<FrameworkLink href="/works/1" />}>
      <CardImage src={landscape} alt="" />
      <CardBody>
        <Content />
      </CardBody>
    </Card>
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: /やった仕事/ });
    await expect(link).toHaveAttribute('href', '/works/1');
    await expect(link).toHaveAttribute('data-framework-link');
    await expect(link).toHaveAttribute('data-interactive');
  },
};

export const Accessibility: Story = {
  name: '読み上げ',
  decorators: [narrow],
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Card {...args} href="/works/1">
        <CardBody>
          <Content title="同じタブで開くカード" />
        </CardBody>
      </Card>
      <Card {...args} href="https://example.com" target="_blank">
        <CardBody>
          <Content title="新しいタブで開くカード" />
        </CardBody>
      </Card>
      <Card {...args}>
        <CardBody>
          <Content title="押せないカード" />
        </CardBody>
      </Card>
    </div>
  ),
  play: async ({ canvas }) => {
    const same = canvas.getByRole('link', { name: /同じタブで開くカード/ });
    await expect(same).toHaveAttribute('href', '/works/1');
    await expect(same).not.toHaveAttribute('target');

    const newTab = canvas.getByRole('link', {
      name: /新しいタブで開くカード.*新しいタブで開きます/,
    });
    await expect(newTab).toHaveAttribute('rel', 'noopener noreferrer');

    // href のないカードはリンクにならない
    await expect(canvas.getAllByRole('link')).toHaveLength(2);
    await expect(canvas.getByText('押せないカード').closest('[data-slot="card"]')?.tagName).toBe(
      'DIV'
    );
  },
};
