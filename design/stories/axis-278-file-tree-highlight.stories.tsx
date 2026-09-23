import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  FileTree,
  type FileTreeProps,
  FileTreeItem,
} from '../../src/components/file-tree/FileTree';

// 軸 278: FileTree の強調した行（highlighted）の見せ方。決定後は real props（FileTree の color・highlightIndicator）で選べる
const meta = {
  title: 'Design Review/278 FileTree の強調した行',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

const candidates: (Candidate & Pick<FileTreeProps, 'color' | 'highlightIndicator'>)[] = [
  {
    id: 'current',
    name: '既定グレーの淡い塗り＋濃いグレーの文字とアイコン＋太字',
    intent:
      '部品の色の淡い塗り＋部品の色の文字＋太字（左の線なし）を土台に、色の既定を neutral にする。アイコンも濃いグレー・太い形にする',
    spec: [
      ['color', 'neutral（既定）'],
      ['highlightIndicator', 'fill（既定）'],
      ['アイコン', '本文の文字の濃さ・Bold の太さ'],
      ['左の線', 'なし'],
    ],
    color: 'neutral',
    highlightIndicator: 'fill',
  },
  {
    id: 'A',
    name: '太字だけ（text）',
    intent:
      '塗りを消し、太字＋濃いグレーの文字とアイコンだけで強調する。Tree の currentIndicator="text" と同じ軽さ',
    spec: [
      ['color', 'neutral（既定）'],
      ['highlightIndicator', 'text'],
      ['アイコン', '本文の文字の濃さ・Bold の太さ'],
      ['左の線', 'なし'],
    ],
    color: 'neutral',
    highlightIndicator: 'text',
  },
];

const columns: Column[] = [{ label: '通常' }, { label: 'コメントつき' }];

export const Highlighted: Story = {
  name: '強調した行',
  render: () => (
    <Comparison
      index={278}
      axis="FileTree の強調した行（highlighted）の見せ方"
      pick="current"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <div className="w-64">
          <FileTree
            color={(candidate as Candidate & Pick<FileTreeProps, 'color'>).color}
            highlightIndicator={
              (candidate as Candidate & Pick<FileTreeProps, 'highlightIndicator'>)
                .highlightIndicator
            }
          >
            <FileTreeItem label="src">
              <FileTreeItem
                label="app.tsx"
                highlighted
                comment={column.label === 'コメントつき' ? 'エントリーポイント' : undefined}
              />
              <FileTreeItem label="legacy.tsx" />
            </FileTreeItem>
          </FileTree>
        </div>
      )}
    >
      <p>
        決定: 塗り＋部品の色の文字＋太字（左の線なし）の形は変えず、FileTree の <code>color</code>{' '}
        の既定を neutral（グレー）にする（primary・secondary は選べるまま）。強調した行のアイコンは
        kind・itemColor より優先して濃いグレー（color を指定したらその色）にし、Phosphor の Bold
        相当のパスに差し替えて太くする。文字は今までどおり部品の色＋太字。
        <code>highlightIndicator="text"</code> のときもアイコンは濃く太いまま。
      </p>
      <p>
        「このファイルに注目してほしい」ときの highlighted の見せ方です。既定を neutral
        にしたのは、ユーザーの「FileTree
        は既定グレーでいいと思っていて、アイコンが濃いグレーになって太くなる、でどうでしょうか」という一言のとおりです。塗りは
        枠のグレーの面（--color-codeblock-bg）より一段濃い --color-select-neutral-selected
        を使い、実際に撮って枠の面と見分けられることを確かめました。A（text）は塗りをやめ、太字＋濃いアイコンだけで軽く強調します。
      </p>
      <p>
        推奨は現行版（fill・neutral）です。色を増やさずに強調でき、記事の中で悪目立ちしません。A（text）も選べるようにしておくと、塗りを持たない静かな一覧に合います。primary・secondary
        の見え方は Components/FileTree の「強調した行の色と見せ方」ストーリーで確かめられます。
      </p>
    </Comparison>
  ),
};
