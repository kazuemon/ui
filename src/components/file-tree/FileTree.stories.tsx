import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { FileTree, FileTreeItem } from './FileTree';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';
import { Prose } from '../prose/Prose';

const project = (
  <>
    <FileTreeItem label="src">
      <FileTreeItem label="components">
        <FileTreeItem label="Button.tsx" />
        <FileTreeItem label="Button.stories.tsx" />
      </FileTreeItem>
      <FileTreeItem label="index.ts" comment="公開の入口" highlighted />
    </FileTreeItem>
    <FileTreeItem label="package.json" />
    <FileTreeItem label="README.md" />
  </>
);

const meta = {
  title: 'Components/FileTree',
  component: FileTree,
  subcomponents: { FileTreeItem },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '記事の中で、フォルダとファイルの構成を見せます。行き先や開閉は持たない静的な図版です（フォルダを実際に操作させたいときは Tree を使います）。',
          '',
          '- `FileTree` の中に `FileTreeItem` を並べます。`FileTreeItem` の中に `FileTreeItem` を入れると、フォルダになります。',
          '- `title` でルートの題（プロジェクト名など）を出せます。',
          '- 行のアイコンは、渡さないときはフォルダ・ファイルの既定のアイコンが自動で出ます。`icon` で差し替えられ、`hideIcons` で既定のアイコンだけを消せます（渡したアイコンは残ります）。',
          '- `comment` で、名前の後ろ（行の右端）に短い説明を添えられます。',
          '- `highlighted` を付けた行は強調されます。色は `FileTree` の `color`（既定 `neutral`）に従い、`highlightIndicator` で見せ方を選べます（`fill`＝淡い塗り＋文字＋太字、`text`＝太字だけ）。アイコンは既定でも濃いグレー・太い形になります。',
          '- `FileTreeItem` の `color` で、行ごとにアイコンの色を選べます（`primary`・`secondary`・`neutral`）。既定（`neutral`）はフォルダ・ファイルの色のままで、ラベルの文字色は変わりません。',
          '- `hideFrame` で外枠を消せます。既定は CodeBlock と同じグレーの面で囲みます（内側の余白も CodeBlock と同じです）。',
          '- `line` は段をつなぐ案内線です。既定は細い実線（`solid`）、字下げだけにしたいときは線なし（`none`）にします。',
          '- Prose の中に置けます。',
        ].join('\n'),
      },
    },
  },
  args: {
    hideFrame: false,
    hideIcons: false,
    line: 'solid',
    color: 'neutral',
    highlightIndicator: 'fill',
  },
  argTypes: {
    hideFrame: { control: 'boolean' },
    hideIcons: { control: 'boolean' },
    line: { control: 'inline-radio', options: ['solid', 'none'] },
    color: { control: 'inline-radio', options: ['primary', 'secondary', 'neutral'] },
    highlightIndicator: { control: 'inline-radio', options: ['fill', 'text'] },
    title: { control: 'text' },
    children: { control: false },
  },
  render: (args) => (
    <div className="w-80">
      <FileTree {...args} title="my-app/">
        {project}
      </FileTree>
    </div>
  ),
} satisfies Meta<typeof FileTree>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Frame: Story = {
  tags: ['visual'],
  name: '外枠',
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="20rem">
      <Specimen label="枠あり（既定）">
        <FileTree title="my-app/">{project}</FileTree>
      </Specimen>
      <Specimen label="枠なし（hideFrame）">
        <FileTree title="my-app/" hideFrame>
          {project}
        </FileTree>
      </Specimen>
    </Gallery>
  ),
};

export const Lines: Story = {
  tags: ['visual'],
  name: '案内線の種類',
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="18rem">
      {(
        [
          ['solid', '細い実線（solid・既定）'],
          ['none', '線なし（none）'],
        ] as const
      ).map(([line, label]) => (
        <Specimen key={line} label={label}>
          <FileTree line={line}>{project}</FileTree>
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const IconsAndComments: Story = {
  tags: ['visual'],
  name: 'アイコン・コメント',
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="20rem">
      <Specimen label="既定のアイコン">
        <FileTree>{project}</FileTree>
      </Specimen>
      <Specimen label="アイコンなし（hideIcons）">
        <FileTree hideIcons>{project}</FileTree>
      </Specimen>
      <Specimen label="行ごとのアイコンの色（color）">
        <FileTree>
          <FileTreeItem label="src">
            <FileTreeItem label="app.tsx" color="primary" comment="エントリーポイント" />
            <FileTreeItem label="legacy.ts" color="secondary" comment="そのうち消す" />
            <FileTreeItem label="util.ts" />
          </FileTreeItem>
        </FileTree>
      </Specimen>
    </Gallery>
  ),
};

export const Highlighted: Story = {
  tags: ['visual'],
  name: '強調した行の色と見せ方',
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="18rem">
      {(
        [
          ['neutral', 'fill', 'neutral・fill（既定）'],
          ['primary', 'fill', 'primary・fill'],
          ['secondary', 'fill', 'secondary・fill'],
          ['neutral', 'text', 'neutral・text（太字だけ）'],
        ] as const
      ).map(([color, highlightIndicator, label]) => (
        <Specimen key={`${color}-${highlightIndicator}`} label={label}>
          <FileTree color={color} highlightIndicator={highlightIndicator}>
            <FileTreeItem label="src">
              <FileTreeItem label="app.tsx" comment="エントリーポイント" highlighted />
              <FileTreeItem label="legacy.tsx" />
            </FileTreeItem>
          </FileTree>
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: { controls: { disable: true } },
  render: () => (
    <DensityPair>
      <div className="w-72">
        <FileTree title="my-app/">{project}</FileTree>
      </div>
    </DensityPair>
  ),
};

export const InProse: Story = {
  tags: ['visual'],
  name: 'Prose の中',
  parameters: { controls: { disable: true } },
  render: () => (
    <Prose as="article" className="max-w-xl">
      <h2>プロジェクトの構成</h2>
      <p>
        インストールすると、次のようなファイルが作られます。<code>src/index.ts</code>{' '}
        が公開の入口です。
      </p>
      <FileTree title="my-app/">{project}</FileTree>
      <p>あとは部品を書き足していくだけです。</p>
    </Prose>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  parameters: { controls: { disable: true } },
  render: () => (
    <FileTree title="my-app/">
      <FileTreeItem label="src">
        <FileTreeItem label="index.ts" comment="公開の入口" />
      </FileTreeItem>
      <FileTreeItem label="README.md" />
    </FileTree>
  ),
  play: async ({ canvas }) => {
    // 開閉や行き先を持たない、ふつうの入れ子のリストとして読む（根と、フォルダの中で 1 つずつ role="list"）
    const lists = canvas.getAllByRole('list');
    await expect(lists.length).toBe(2);
    for (const list of lists) await expect(list).toBeVisible();
    const items = canvas.getAllByRole('listitem');
    await expect(items).toHaveLength(3);
    // アイコンは画面だけの飾り（aria-hidden）で、名前は文字だけから読まれる
    await expect(canvas.getByText('src')).toBeVisible();
    await expect(canvas.getByText('index.ts')).toBeVisible();
    await expect(canvas.getByText('公開の入口')).toBeVisible();
    await expect(canvas.getByText('README.md')).toBeVisible();
  },
};
