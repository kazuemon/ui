import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, ReactNode } from 'react';
import { expect, fn, userEvent } from 'storybook/test';

import { Card, CardBody, CardHeader, CardImage, CardTitle } from './Card';
import { landscape } from '../../samples/images';
import { DensityPair, Matrix, Specimen } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';
import { Button } from '../button/Button';
import { Heading } from '../heading/Heading';
import { Prose } from '../prose/Prose';
import { Tag } from '../tag/Tag';
import { Text } from '../text/Text';

const variants = ['default', 'nested'] as const;

const Content = ({ title = 'やった仕事のタイトルがここに入ります' }: { title?: string }) => (
  <>
    <Text size="sm" variant="subtle">
      2026.09.19
    </Text>
    <Heading level={3} size="md">
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
          '- `variant` は型です。`default`（既定）は画像をカードの端まで届かせ、`nested` は画像をカードの内側に余白を空けて収めます。',
          '- `href` を渡すと、カード全体が 1 つのリンクになります。Next.js・TanStack Router の `Link` は `render` に渡し、`link` を付けます。`target="_blank"` のときは、読み上げに「新しいタブで開きます」を足します。',
          '- カード全体がリンクになるので、中にほかのリンクやボタンは置けません。置きたいときは `href` を渡さず、題をリンクにします。',
          '- 全体が押せるカードは、ボタンと同じ薄い影で浮かせます。hover で影が減って面が淡く塗られ、押すと沈みます。押せないカードには影を付けません。',
          '- `href` を渡さずに `onClick` を渡すと、カード全体が押せるボタンになります。選ぶ・開くなど、ページを移らない操作に使います。題は `CardTitle` に入れると、それがボタンの名前になります。題がないときは `accessibleName` を渡します。中に置いたリンクやボタンは、それぞれ押せます。',
          '- 選択肢として並べるときは、選んでいるカードに `selected` を付けます。ボタンのときは、読み上げに押している状態として伝えます。既定では面を淡く塗って線を重ね、`selectedIndicator="line"` で線だけにします。色は `color`（`primary`・`secondary`・`neutral`）で選びます。',
          '- 題と操作を 1 行に並べる帯は `CardHeader` に入れ、カードのいちばん上に置きます。下の線で中身と分けます。`variant="filled"` で帯を淡いグレーで塗り、`hideDivider` で線を消します。',
          '- 並べたカードのうち 1 枚（おすすめなど）を目立たせるときは、`variant="emphasis"` にします。面と輪郭はそのままで、輪郭の外に淡い輪を足します。輪の色は `color` で選びます。',
          '- 狭い列やたくさん並べる一覧では、`size="sm"` で余白を詰めます。',
          '- hover で画像を少し大きくしたいときは、`imageZoom` を渡します。',
          '- 幅は置いた場所に合わせます。一覧は grid で並べます。',
          '- `Prose`（記事）の中にそのまま置けます。記事の中のリンクの見た目は、押せるカードには付きません。',
        ].join('\n'),
      },
    },
  },
  args: { variant: 'default', imageZoom: false },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: variants,
      table: { defaultValue: { summary: "'default'" } },
    },
    href: { control: 'text' },
    link: { control: 'boolean' },
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
            <Text size="sm" variant="subtle">2026.09.19</Text>
            <Heading level={3} size="md">やった仕事のタイトルがここに入ります</Heading>
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

export const Variants: Story = {
  tags: ['visual'],
  name: '型',
  parameters: {
    controls: { exclude: ['variant'] },
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
      {variants.map((variant) => (
        <Card key={variant} {...args} variant={variant}>
          <CardImage src={landscape} alt="" />
          <CardBody>
            <Content title={variant} />
          </CardBody>
        </Card>
      ))}
      <Card {...args}>
        <CardBody>
          <Content title="画像のないカード" />
          <Text size="sm" variant="muted">
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
    controls: { exclude: ['variant', 'href'] },
    pseudo: statePseudo({
      hover: '[data-slot="card"]',
      active: '[data-slot="card"]',
      focusVisible: '[data-slot="card"]',
    }),
  },
  decorators: [(Story) => <div className="max-w-5xl">{Story()}</div>],
  render: (args) => (
    <Matrix
      rows={variants}
      columns={stateColumns}
      columnWidth="12rem"
      rowLabel={(variant) => variant}
      renderCell={(variant) => (
        <Card {...args} variant={variant} href="#">
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
          'Next.js・TanStack Router の `Link` などは `render` に渡し、`link` を付けます。行き先（`href`・`to`）は渡した要素に書きます。カードの見た目と、カード全体が押せることはそのままです。',
      },
      source: sourceCode(`
        import NextLink from 'next/link';

        <Card link render={<NextLink href="/works/1" />}>
          <CardImage src="/works/1.png" alt="" />
          <CardBody>…</CardBody>
        </Card>
      `),
    },
  },
  render: (args) => (
    <Card {...args} link render={<FrameworkLink href="/works/1" />}>
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

// TanStack Router の Link の代わり。href の代わりに to を受け取る
function RouterLink({ to, ...props }: ComponentProps<'a'> & { to: string }) {
  return <a href={to} {...props} />;
}

export const LinkOrNot: Story = {
  name: 'リンクとして描くか',
  decorators: [narrow],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: [
          '`link` は、カード全体をリンクとして描くかです。渡さないときは、`href` があればリンクにします。',
          '',
          '- `render` にルーターのリンクを渡すときは、`link` を付けます。`render` に渡した要素の `href` は見ません。',
          '- `render` だけを渡したとき（`article`・`li` など）は、リンクにしません。',
          '- `link={false}` にすると、`href` を渡していてもリンクにせず、ただのカードとして描きます。',
        ].join('\n'),
      },
      source: sourceCode(`
        import { Link as RouterLink } from '@tanstack/react-router';

        <Card link render={<RouterLink to="/works/1" />}>
          <CardBody>…</CardBody>
        </Card>
      `),
    },
  },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Card {...args} href="/works/1">
        <CardBody>
          <Content title="href だけ" />
        </CardBody>
      </Card>
      <Card {...args} render={<article />}>
        <CardBody>
          <Content title="render だけ" />
        </CardBody>
      </Card>
      <Card {...args} link render={<RouterLink to="/works/3" />}>
        <CardBody>
          <Content title="render と link" />
        </CardBody>
      </Card>
      <Card {...args} href="/works/4" target="_blank" link={false}>
        <CardBody>
          <Content title="href と link=false" />
        </CardBody>
      </Card>
    </div>
  ),
  play: async ({ canvas }) => {
    const card = (title: string) =>
      canvas.getByText(title).closest<HTMLElement>('[data-slot="card"]');

    // href だけ: a で描き、浮いた押すもの（影）になる
    const hrefOnly = card('href だけ');
    await expect(hrefOnly?.tagName).toBe('A');
    await expect(hrefOnly).toHaveAttribute('data-interactive');
    await expect(getComputedStyle(hrefOnly!).boxShadow).not.toBe('none');

    // render だけ: 渡した要素のまま、リンクにしない（影なし）
    const renderOnly = card('render だけ');
    await expect(renderOnly?.tagName).toBe('ARTICLE');
    await expect(renderOnly).not.toHaveAttribute('data-interactive');
    await expect(getComputedStyle(renderOnly!).boxShadow).toBe('none');

    // render と link: href を持たないルーターのリンク（to）でも、押せるカードになる
    const router = canvas.getByRole('link', { name: /render と link/ });
    await expect(router).toHaveAttribute('href', '/works/3');
    await expect(router).toHaveAttribute('data-interactive');

    // href と link={false}: div で描き、href・target・rel を付けず、読み上げの文も足さない
    const off = card('href と link=false');
    await expect(off?.tagName).toBe('DIV');
    await expect(off).not.toHaveAttribute('href');
    await expect(off).not.toHaveAttribute('target');
    await expect(off).not.toHaveAttribute('rel');
    await expect(off).not.toHaveAttribute('data-interactive');
    await expect(off?.textContent).not.toContain('新しいタブで開きます');

    await expect(canvas.getAllByRole('link')).toHaveLength(2);
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

export const Sizes: Story = {
  tags: ['visual'],
  name: '余白の段',
  parameters: {
    controls: { exclude: ['variant'] },
    docs: {
      description: {
        story:
          '`size="sm"` は中身の余白と、入れ子の画像の周りの余白を詰めます。縦の間と角は `md` と同じです。',
      },
    },
  },
  render: (args) => (
    <Matrix
      rows={variants}
      columns={
        [
          { label: 'md', size: 'md' },
          { label: 'sm', size: 'sm' },
        ] as const
      }
      columnWidth="13.75rem"
      rowLabel={(variant) => variant}
      renderCell={(variant, column) => (
        <Card {...args} variant={variant} size={column.size}>
          <CardImage src={landscape} alt="" />
          <CardBody>
            <Content />
          </CardBody>
        </Card>
      )}
    />
  ),
};

const selectedColumns: MatrixColumn[] = [
  { label: '選んでいない' },
  { label: '選んでいる' },
  { label: '選んでいる・hover', state: 'hover' },
  { label: '選んでいる・フォーカス', state: 'focus' },
];

export const Selected: Story = {
  tags: ['visual'],
  name: '選んでいる見た目',
  parameters: {
    controls: { exclude: ['variant', 'href'] },
    docs: {
      description: {
        story:
          '`selected` を付けたカードです。`fill`（既定）は面を淡く塗って線を重ね、`line` は線だけを重ねます。色は `color` で選び、既定は `primary` です。',
      },
    },
    pseudo: statePseudo({
      hover: '[data-slot="card"]',
      focusVisible: '[data-slot="card-action"]',
    }),
  },
  render: () => (
    <Matrix
      rows={
        [
          ['fill', 'primary'],
          ['fill', 'secondary'],
          ['fill', 'neutral'],
          ['line', 'primary'],
          ['line', 'neutral'],
        ] as const
      }
      columns={selectedColumns}
      columnWidth="11rem"
      rowLabel={([indicator, color]) => `${indicator}・${color}`}
      renderCell={([indicator, color], column) => (
        <Card
          onClick={() => {}}
          selected={column.label !== '選んでいない'}
          selectedIndicator={indicator}
          color={color}
        >
          <CardBody>
            <CardTitle>スタンダード</CardTitle>
            <Text size="sm" variant="muted">
              月 500 円
            </Text>
          </CardBody>
        </Card>
      )}
    />
  ),
};

const Plan = ({
  name,
  price,
  ...props
}: { name: string; price: string } & ComponentProps<typeof Card>) => (
  <Card {...props}>
    <CardBody>
      <Text size="sm" variant="subtle">
        {props.variant === 'emphasis' ? 'おすすめ' : 'プラン'}
      </Text>
      <CardTitle>{name}</CardTitle>
      <Text size="sm" variant="muted">
        {price}
      </Text>
    </CardBody>
  </Card>
);

const emphasisColumns: MatrixColumn[] = [
  { label: '押せない' },
  { label: '押せる' },
  { label: '押せる・hover', state: 'hover' },
  { label: '押せる・フォーカス', state: 'focus' },
];

export const Emphasis: Story = {
  tags: ['visual'],
  name: '強調の形',
  parameters: {
    controls: { exclude: ['variant', 'href'] },
    docs: {
      description: {
        story:
          '`variant="emphasis"` は、並べたカードのうち 1 枚を目立たせます。面と輪郭は `default` のままで、輪郭の外に淡い輪を足します。輪の色は `color` で選び、既定は `primary` です。選んでいるカード（`selected`）と並べても、線ではなく外側の輪で見分けられます。',
      },
    },
    pseudo: statePseudo({
      hover: '[data-slot="card"]',
      focusVisible: '[data-slot="card-action"]',
    }),
  },
  render: () => (
    // 輪が左端で切れないよう、内側に空ける
    <div className="flex flex-col gap-8 p-1">
      <Specimen label="並べたとき（真ん中が emphasis）">
        <div className="grid max-w-md grid-cols-3 gap-4">
          <Plan name="フリー" price="0 円" />
          <Plan name="スタンダード" price="月 500 円" variant="emphasis" />
          <Plan name="チーム" price="月 1,500 円" />
        </div>
      </Specimen>
      <Matrix
        rows={['primary', 'secondary', 'neutral'] as const}
        columns={emphasisColumns}
        columnWidth="11rem"
        rowLabel={(color) => color}
        renderCell={(color, column) => (
          <Plan
            name="スタンダード"
            price="月 500 円"
            variant="emphasis"
            color={color}
            onClick={column.label === '押せない' ? undefined : () => {}}
          />
        )}
      />
      <div className="flex flex-wrap gap-x-10 gap-y-8">
        {(['fill', 'line'] as const).map((indicator) => (
          <Specimen
            key={indicator}
            label={`選んでいるカード（${indicator}）と並べる（左が emphasis）`}
          >
            <div className="grid w-md grid-cols-3 gap-4">
              <Plan name="スタンダード" price="月 500 円" variant="emphasis" onClick={() => {}} />
              <Plan
                name="チーム"
                price="月 1,500 円"
                selected
                selectedIndicator={indicator}
                onClick={() => {}}
              />
              <Plan name="フリー" price="0 円" onClick={() => {}} />
            </div>
          </Specimen>
        ))}
      </div>
    </div>
  ),
};

export const Header: Story = {
  tags: ['visual'],
  name: '頭の帯',
  parameters: {
    controls: { exclude: ['variant', 'href'] },
    docs: {
      description: {
        story:
          '`CardHeader` は題と操作を 1 行に並べる帯です。既定はカードの面のまま下に線を引き、`variant="filled"` で淡いグレーに塗り、`hideDivider` で線を消します。入れ子（`nested`）では帯を内側に収め、下の線はまっすぐ端まで引きます。',
      },
    },
  },
  render: () => (
    <Matrix
      rows={variants}
      columns={
        [
          { label: '既定', header: 'default', hideDivider: false },
          { label: 'filled', header: 'filled', hideDivider: false },
          { label: 'filled・hideDivider', header: 'filled', hideDivider: true },
          { label: 'hideDivider', header: 'default', hideDivider: true },
        ] as const
      }
      columnWidth="15rem"
      rowLabel={(variant) => variant}
      renderCell={(variant, column) => (
        <Card variant={variant}>
          <CardHeader variant={column.header} hideDivider={column.hideDivider}>
            <Heading level={3} size="md">
              通知の設定
            </Heading>
            <Button variant="outline">編集</Button>
          </CardHeader>
          <CardImage src={landscape} alt="" />
          <CardBody>
            <Text size="sm" variant="muted">
              メールで受け取る通知と、受け取る時間帯を決めます。
            </Text>
          </CardBody>
        </Card>
      )}
    />
  ),
};

export const ButtonCard: Story = {
  name: '押すカード（ボタン）',
  decorators: [narrow],
  args: { onClick: fn() },
  parameters: {
    docs: {
      description: {
        story:
          '`onClick` を渡すと、カード全体が押せるボタンになります。`CardTitle` の文がボタンの名前になり、`selected` は押している状態として伝わります。題がないときは `accessibleName` で名前を付けます。中に置いたリンクやボタンは、それぞれ押せます。',
      },
      source: sourceCode(`
        <Card onClick={() => choose('standard')} selected={plan === 'standard'}>
          <CardBody>
            <CardTitle>スタンダード</CardTitle>
            <Text size="sm" variant="muted">月 500 円</Text>
          </CardBody>
        </Card>
      `),
    },
  },
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Card onClick={args.onClick} selected={false}>
        <CardBody>
          <CardTitle>フリー</CardTitle>
          <Text size="sm" variant="muted">
            0 円
          </Text>
        </CardBody>
      </Card>
      <Card onClick={args.onClick} selected>
        <CardBody>
          <CardTitle>スタンダード</CardTitle>
          <Text size="sm" variant="muted">
            月 500 円。<a href="#details">くわしい違い</a>
          </Text>
        </CardBody>
      </Card>
      <Card onClick={args.onClick} accessibleName="画像だけのカード">
        <CardImage src={landscape} alt="" />
      </Card>
    </div>
  ),
  play: async ({ args, canvas }) => {
    // カードは div のまま、中の button が CardTitle の文を名前にする
    const free = canvas.getByRole('button', { name: 'フリー' });
    const standard = canvas.getByRole('button', { name: 'スタンダード' });
    await expect(free).toHaveAttribute('aria-pressed', 'false');
    await expect(standard).toHaveAttribute('aria-pressed', 'true');
    await expect(standard).toHaveAttribute('type', 'button');
    await expect(standard.closest('[data-slot="card"]')?.tagName).toBe('DIV');
    // 題がないカードは accessibleName が名前になる
    await expect(canvas.getByRole('button', { name: '画像だけのカード' })).toBeInTheDocument();

    // カードのどこを押しても（題の外の文でも）、その場所にあるのはボタン（広げた範囲）
    const centerOf = (element: Element) => {
      const rect = element.getBoundingClientRect();
      return document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    };
    const onText = centerOf(canvas.getByText('0 円'));
    await expect(onText).toBe(free);
    await userEvent.click(onText!);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await expect(free).toHaveFocus();

    // キーボードで次のボタンに来ると、カードの輪郭にフォーカスの線が出る
    await userEvent.tab();
    await expect(standard).toHaveFocus();
    await expect(getComputedStyle(standard.closest('[data-slot="card"]')!).outlineStyle).toBe(
      'solid'
    );

    // 中のリンクは、広げた範囲の上に出る（押すとリンクだけが押される）
    const link = canvas.getByRole('link', { name: 'くわしい違い' });
    await expect(link.contains(centerOf(link))).toBe(true);
  },
};

export const InProse: Story = {
  tags: ['visual'],
  name: '記事の中',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'MDX の記事では、段落のあいだにそのまま置きます。上下の余白は `Prose` が付けます。記事の中のリンクの見た目は、カードには付きません。',
      },
      source: sourceCode(`
        前に書いた記事も読んでみてください。

        <Card href="/works/1">
          <CardImage src="/works/1.png" alt="" />
          <CardBody>…</CardBody>
        </Card>

        ここから本題です。
      `),
    },
  },
  decorators: [(Story) => <div className="max-w-2xl">{Story()}</div>],
  render: () => (
    <Prose>
      <p>
        進め方の全体は、<a href="#">前に書いた記事</a>にまとめています。
      </p>
      <Card href="/works/1">
        <CardImage src={landscape} alt="" />
        <CardBody>
          <Content />
        </CardBody>
      </Card>
      <p>ここから本題です。今回は押せるカードを作りました。</p>
    </Prose>
  ),
};
