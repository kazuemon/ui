import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { FileTree, type FileTreeLine, FileTreeItem } from '../../src/components/file-tree/FileTree';

// 軸 276: FileTree の段をつなぐ案内線。real prop（line）で選べる。Steps の line と同じ語彙（このコンポーネントでは solid・none の 2 つ）
const meta = {
  title: 'Design Review/276 FileTree の案内線',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

const candidates: (Candidate & { line: FileTreeLine })[] = [
  {
    id: 'current',
    name: '細い実線（solid）',
    intent: 'Tree の案内線（ADR-0162）と同じ、細い実線。段の親子が目で追える',
    spec: [['line', 'solid（既定）']],
    line: 'solid',
  },
  {
    id: 'A',
    name: '線なし（none）',
    intent: '字下げだけで段を見せる。行の余白が少ないときや、罫線を減らしたい記事で使う',
    spec: [['line', 'none']],
    line: 'none',
  },
];

const columns: Column[] = [
  { label: '浅い木', note: '2 段' },
  { label: '深い木', note: '4 段' },
];

const shallow = (
  <>
    <FileTreeItem label="src">
      <FileTreeItem label="index.ts" />
      <FileTreeItem label="Button.tsx" />
    </FileTreeItem>
    <FileTreeItem label="package.json" />
  </>
);

const deep = (
  <>
    <FileTreeItem label="src">
      <FileTreeItem label="components">
        <FileTreeItem label="button">
          <FileTreeItem label="Button.tsx" />
          <FileTreeItem label="Button.stories.tsx" />
        </FileTreeItem>
      </FileTreeItem>
    </FileTreeItem>
  </>
);

export const Lines: Story = {
  name: '案内線',
  render: () => (
    <Comparison
      index={276}
      axis="FileTree の案内線（段をつなぐ縦の線）"
      pick="current"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <div className="w-56">
          <FileTree line={(candidate as Candidate & { line: FileTreeLine }).line}>
            {column.label === '浅い木' ? shallow : deep}
          </FileTree>
        </div>
      )}
    >
      <p>
        決定: 現行版（solid）を既定にし、A（none）も line
        で選べるようにする。点線（dotted）の案は外した。
      </p>
      <p>
        フォルダの段をつなぐ縦の線を選びます。現行版（細い実線）は Tree
        の案内線（ADR-0162）と同じ見た目で、木の仲間として一貫します。A（線なし）は、字下げだけで段を見せ、浅い木ではほとんど気になりません。深い木（4
        段）では、段を目で追えるかの違いが大きくなります。
      </p>
      <p>
        推奨は現行版（solid）です。Tree
        ですでに検証済みの見た目で、部品の仲間として一貫します。A（none）も line
        で選べるようにしています。行の余白が少ない記事や、コードブロックの直後など罫線が多い場面では
        none が軽く見えます。
      </p>
    </Comparison>
  ),
};
