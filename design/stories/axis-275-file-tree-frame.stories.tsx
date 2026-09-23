import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { CodeBlock } from '../../src/components/code-block/CodeBlock';
import { FileTree, FileTreeItem } from '../../src/components/file-tree/FileTree';

// 軸 275: FileTree の外枠の有無。既定は hideFrame（真偽値）で選べる。
//   内側の余白（--file-tree-frame-px・-py）は CodeBlock の px-4・py-3 と同じ計算式を指す（決定後に直した）
const meta = {
  title: 'Design Review/275 FileTree の外枠',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

const candidates: (Candidate & { hideFrame?: boolean })[] = [
  {
    id: 'current',
    name: '枠あり（グレーの面）',
    intent:
      'CodeBlock と同じグレーの面で囲む。内側の余白も CodeBlock と同じ。既定（hideFrame=false）',
    spec: [
      ['hideFrame', 'false（既定）'],
      ['面', 'グレー（--color-codeblock-bg）'],
      ['内側の余白', 'CodeBlock と同じ（px-4・py-3 相当）'],
    ],
  },
  {
    id: 'A',
    name: '枠なし',
    intent: '面を持たず、記事の地にそのまま置く（hideFrame）',
    spec: [
      ['hideFrame', 'true'],
      ['面', 'なし'],
    ],
    hideFrame: true,
  },
];

const columns: Column[] = [{ label: 'FileTree' }, { label: 'CodeBlock（余白の比較用）' }];

const project = (
  <>
    <FileTreeItem label="src">
      <FileTreeItem label="components">
        <FileTreeItem label="Button.tsx" />
      </FileTreeItem>
      <FileTreeItem label="index.ts" comment="公開の入口" />
    </FileTreeItem>
    <FileTreeItem label="README.md" />
  </>
);

export const Frame: Story = {
  name: '外枠',
  render: () => (
    <Comparison
      index={275}
      axis="FileTree の外枠"
      pick="current"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <div className="w-64">
          {column.label === 'FileTree' ? (
            <FileTree title="my-app/" hideFrame={(candidate as { hideFrame?: boolean }).hideFrame}>
              {project}
            </FileTree>
          ) : (
            <CodeBlock title="my-app/index.ts">
              <code>{'export { Button } from "./Button";'}</code>
            </CodeBlock>
          )}
        </div>
      )}
    >
      <p>
        決定:
        現行版（枠あり）を既定にし、A（hideFrame・枠なし）も選べるようにする。白い面＋輪郭の案（旧
        B）は外した。あわせて、枠ありの内側の余白が CodeBlock より狭く見えていた点を、CodeBlock
        と同じ値（px-4・py-3 相当）を指すように直した。
      </p>
      <p>
        記事の中に置く図版として、フォルダの構成をどう囲むかを選びます。現行版は CodeBlock
        と同じグレーの面です（すでにコード・お知らせ・引用などで使っている「淡い面で囲む」語彙にそろいます）。A（枠なし）は面を持たず、地の文にそのまま溶け込みます。段落の中に短い木を挟みたいときに軽く見えます。列に
        CodeBlock を並べ、面の色と内側の余白が同じに見えるかを確かめます。
      </p>
      <p>
        推奨は現行版（枠あり）です。CodeBlock・Callout
        など「本文の中の図版」と見た目の語彙がそろい、記事の中で目立つ場所（フォルダの構成を説明する場面）だと分かりやすいためです。A（枠なし）も
        hideFrame
        で選べるようにしています。記事の地の色が白でないとき（ダークモードなど）にも馴染みます。
      </p>
    </Comparison>
  ),
};
