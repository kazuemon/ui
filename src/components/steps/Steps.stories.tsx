import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Step, Steps } from './Steps';
import { Code } from '../code/Code';
import { CodeBlock } from '../code-block/CodeBlock';
import { Heading } from '../heading/Heading';
import { List, ListItem } from '../list/List';
import { Prose } from '../prose/Prose';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';

const meta = {
  title: 'Components/Steps',
  component: Steps,
  subcomponents: { Step },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '記事の中の番号付きの手順です。「1. インストールする 2. 設定する」のように、題と本文の段を順に並べます。番号は並びの順に付きます。',
          '',
          '- `Steps` の中に `Step` を並べます。`Step` の `title` が段の題、children が本文です。本文には段落・コード・リストなどを置けます。',
          '- `headingLevel` は題を描く見出しの段です。既定は 3（`h3`）です。手順を置く節の見出しより 1 段下にします。題の大きさは段に従います。',
          '- `line` は段をつなぐ縦の線です。既定は細い実線（`solid`）です。軽くしたいときは点線（`dotted`）、普通の番号付きリストのように静かにしたいときは線なし（`none`）にします。本文が長い段が続くときは、次の番号を目で追えるよう線を残します。',
          '- `start` で最初の番号を決めます。',
          '- `title` を省くと、番号を本文の 1 行目にそろえます。短い手順を文だけで並べるときに使います。',
          '- Prose の中に置けます。MDX では `<Steps>` と `<Step title="…">` を書き、その中に Markdown で本文を書きます。',
        ].join('\n'),
      },
    },
  },
  args: { headingLevel: 3, line: 'solid' },
  argTypes: {
    headingLevel: { control: 'inline-radio', options: [2, 3, 4, 5, 6] },
    line: { control: 'inline-radio', options: ['solid', 'dotted', 'none'] },
    start: { control: 'number' },
  },
  render: (args) => (
    <div data-reading className="max-w-xl">
      <Steps {...args}>
        <Step title="インストールする">
          <p>パッケージを追加します。</p>
          <CodeBlock>
            <code>pnpm add @kazuemon/ui</code>
          </CodeBlock>
        </Step>
        <Step title="スタイルを読み込む">
          <p>
            アプリの入口で <Code>@kazuemon/ui/styles.css</Code> を読み込みます。
          </p>
        </Step>
        <Step title="部品を置く">
          <p>使いたい部品を読み込んで、ページに置きます。</p>
        </Step>
      </Steps>
    </div>
  ),
} satisfies Meta<typeof Steps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Kinds: Story = {
  tags: ['visual'],
  name: '種類',
  parameters: { controls: { disable: true } },
  render: () => (
    <div data-reading>
      <Gallery columnWidth="22rem">
        <Specimen label="題と本文（h3・既定）">
          <Steps>
            <Step title="インストールする">パッケージを追加します。</Step>
            <Step title="設定する">
              <p>設定のファイルを置きます。</p>
              <p>書き換えたら、開発のサーバーを立て直します。</p>
            </Step>
            <Step title="確かめる">画面を開いて、部品が表示されるかを見ます。</Step>
          </Steps>
        </Specimen>
        <Specimen label="題なし（start=8）">
          <Steps start={8}>
            <Step>設定の画面を開きます。</Step>
            <Step>
              「通知」を選び、メールの受け取りを切り替えます。長い文は折り返して、番号の右にそろいます。
            </Step>
            <Step>保存します。</Step>
            <Step>確認のメールが届きます。</Step>
            <Step>届いたメールのリンクを押します。</Step>
          </Steps>
        </Specimen>
        <Specimen label="小さい題（headingLevel=4）">
          <Steps headingLevel={4}>
            <Step title="リポジトリを作る">空のリポジトリを作ります。</Step>
            <Step title="長い題は、番号の右で折り返して 2 行目も題の頭にそろいます">
              本文は題の下に続きます。
            </Step>
          </Steps>
        </Specimen>
        <Specimen label="本文にリスト">
          <Steps>
            <Step title="用意するもの">
              <p>次のものを手元に用意します。</p>
              <List>
                <ListItem>Node.js 22 以上</ListItem>
                <ListItem>
                  pnpm
                  <List>
                    <ListItem>corepack で入れられます</ListItem>
                  </List>
                </ListItem>
              </List>
            </Step>
            <Step title="始める">準備ができたら、次の節へ進みます。</Step>
          </Steps>
        </Specimen>
      </Gallery>
    </div>
  ),
};

export const Lines: Story = {
  tags: ['visual'],
  name: '線の種類',
  parameters: { controls: { disable: true } },
  render: () => (
    <div data-reading>
      <Gallery columnWidth="18rem">
        {(
          [
            ['solid', '細い実線（solid・既定）'],
            ['dotted', '点線（dotted）'],
            ['none', '線なし（none）'],
          ] as const
        ).map(([line, label]) => (
          <Specimen key={line} label={label}>
            <Steps line={line}>
              <Step title="インストールする">パッケージを追加します。</Step>
              <Step title="設定する">
                <p>設定のファイルを置きます。</p>
                <p>書き換えたら、開発のサーバーを立て直します。</p>
              </Step>
              <Step title="確かめる">画面を開いて見ます。</Step>
            </Steps>
          </Specimen>
        ))}
      </Gallery>
    </div>
  ),
};

// MDX で書いたときに近い形。Prose の中の素の段落・コード・リストが、段の本文になる
export const InProse: Story = {
  tags: ['visual'],
  name: 'Prose の中',
  parameters: { controls: { disable: true } },
  render: () => (
    <Prose as="article" className="max-w-xl">
      <h2>はじめかた</h2>
      <p>3 つの手順で、ブログに部品を載せられます。</p>
      <Steps>
        <Step title="インストールする">
          <p>パッケージを追加します。</p>
          <pre>
            <code>pnpm add @kazuemon/ui</code>
          </pre>
        </Step>
        <Step title="スタイルを読み込む">
          <p>
            アプリの入口で <code>@kazuemon/ui/styles.css</code> を読み込みます。
          </p>
          <ul>
            <li>Tailwind を使っているときは、テーマも読み込みます</li>
            <li>使っていないときは、このファイルだけで足ります</li>
          </ul>
        </Step>
        <Step title="部品を置く">
          <p>
            使いたい部品を読み込んで、ページに置きます。<a href="#components">部品の一覧</a>
            から探せます。
          </p>
        </Step>
      </Steps>
      <p>これで準備ができました。</p>
    </Prose>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: { controls: { disable: true } },
  render: () => (
    <DensityPair>
      <div className="w-80">
        <Steps>
          <Step title="インストールする">パッケージを追加します。</Step>
          <Step title="設定する">設定のファイルを置きます。</Step>
        </Steps>
      </div>
    </DensityPair>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  parameters: { controls: { disable: true } },
  render: () => (
    <div data-reading className="max-w-xl">
      <Heading level={2}>はじめかた</Heading>
      <Steps start={2}>
        <Step title="インストールする">パッケージを追加します。</Step>
        <Step title="設定する">設定のファイルを置きます。</Step>
      </Steps>
    </div>
  ),
  play: async ({ canvas }) => {
    // 番号付きの一覧として読み、段ごとの題は見出し（既定は h3）になる
    const list = canvas.getByRole('list');
    await expect(list.tagName).toBe('OL');
    await expect(list).toHaveAttribute('start', '2');
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    await expect(canvas.getByRole('heading', { level: 3, name: 'インストールする' })).toBeVisible();
    // 印の番号は画面にだけ出し、読み上げの文には含めない（ol が番号を伝える）
    const inner = list.querySelector('[data-slot="step-inner"]')!;
    const content = getComputedStyle(inner, '::before').content;
    await expect(content).toContain('counter(list-item)');
  },
};
