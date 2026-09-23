import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { FileTree, FileTreeItem } from '../../src/components/file-tree/FileTree';

// 軸 277: 既定のフォルダ・ファイルのアイコンの色。props にはしていないので、tokens.css の上書きだけで作る
//   --file-tree-icon-folder-color・--file-tree-icon-file-color（渡したアイコンの色は --file-tree-icon-color で別）
const meta = {
  title: 'Design Review/277 FileTree の既定アイコンの色',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

const candidates: Candidate[] = [
  {
    id: 'current',
    name: 'グレー（文字と同じ濃さ）',
    intent: '原則6（色を指定しないときはグレー）のとおり、フォルダもファイルも文字と同じ薄いグレー',
    spec: [
      ['フォルダ', '--color-fg-subtle'],
      ['ファイル', '--color-fg-subtle'],
    ],
  },
  {
    id: 'A',
    name: 'フォルダだけ青',
    intent:
      'フォルダをブランドの Primary の青にし、ファイルは文字と同じグレーのまま。OS のファイラーに近い見分け方',
    spec: [
      ['フォルダ', '--color-primary'],
      ['ファイル', '--color-fg-subtle'],
    ],
    tokens: { '--file-tree-icon-folder-color': 'var(--color-primary)' },
  },
  {
    id: 'B',
    name: 'フォルダだけ濃い文字色',
    intent:
      'フォルダを本文の濃さ（--color-fg）にし、ファイルより一段濃くする。色を増やさずに見分けを付ける案',
    spec: [
      ['フォルダ', '--color-fg'],
      ['ファイル', '--color-fg-subtle'],
    ],
    tokens: { '--file-tree-icon-folder-color': 'var(--color-fg)' },
  },
];

const columns: Column[] = [{ label: '既定（変えないとき）' }, { label: '行ごとに color を指定' }];

const project = (
  <>
    <FileTreeItem label="src">
      <FileTreeItem label="components">
        <FileTreeItem label="Button.tsx" />
      </FileTreeItem>
      <FileTreeItem label="index.ts" />
    </FileTreeItem>
    <FileTreeItem label="package.json" />
    <FileTreeItem label="README.md" />
  </>
);

const withItemColor = (
  <>
    <FileTreeItem label="src">
      <FileTreeItem label="components" color="primary" />
      <FileTreeItem label="index.ts" color="secondary" />
    </FileTreeItem>
    <FileTreeItem label="package.json" />
    <FileTreeItem label="README.md" />
  </>
);

export const IconColor: Story = {
  name: '既定アイコンの色',
  render: () => (
    <Comparison
      index={277}
      axis="FileTree の既定のフォルダ・ファイルのアイコンの色"
      pick="current"
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <div className="w-64">
          <FileTree>{column.label === '既定（変えないとき）' ? project : withItemColor}</FileTree>
        </div>
      )}
    >
      <p>
        決定:
        既定のアイコンの色は現行版（グレー、フォルダとファイルを同じ色）のまま変えない。色を個別に指定しない限りは変わらない。代わりに、行ごとに色を選べる
        FileTreeItem の <code>color</code>（primary・secondary・neutral、既定
        neutral＝グレーのまま）を足した。アイコンだけに色を付け、ラベルの文字色は変えない（Steps の
        markerType が印だけを塗り分け、題の文字は変えないのと同じ考え方）。
      </p>
      <p>
        icon
        を渡さないときに出る、既定のフォルダ・ファイルのアイコンの色を検討しました。現行版はどちらも文字と同じ薄いグレーで、原則6（色を指定しないときはグレー）のとおりです。A（フォルダだけ青）・B（フォルダだけ濃い文字色）は既定を変える案でしたが、採りませんでした。
      </p>
      <p>
        推奨は現行版（グレー、フォルダとファイルを同じ色）です。色を使わない分もっとも静かで、記事の中で悪目立ちしません。アイコンの形（フォルダとファイルの輪郭の違い）だけで十分見分けが付きます。個別に強調したいときは、右の列のように
        FileTreeItem の color で行ごとに選べます。
      </p>
    </Comparison>
  ),
};
