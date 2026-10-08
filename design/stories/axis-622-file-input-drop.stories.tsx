import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { FileInput } from '../../src/components/file-input/FileInput';

// 軸 622: 欄へのドロップを受けるか、受けたときの印。右端の列は実際に OS のファイルを落とせる
const meta = {
  title: 'Design Review/622 ファイル選択欄へのドロップ',
  id: 'design-review-622-file-input-drop',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A,C' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

// ドラッグ中の見た目を固定して並べる（ファイルを持ってきた状態は静止画では出ないので、印だけ付ける）
function Forced({ drag, children }: { drag: 'accept' | 'reject'; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector('[data-slot="file-input-content"]')?.setAttribute('data-drag', drag);
  }, [drag]);
  return <div ref={ref}>{children}</div>;
}

const candidates: Candidate[] = [
  {
    id: 'A',
    name: '受ける。面と線だけ変える',
    intent: '文は変えず、名前のまま。Dropzone と同じ印だけ。欄の幅を使わない',
    spec: [
      ['受け付ける', 'グレーの線＋面'],
      ['受け付けない', '危険の線＋面'],
      ['ドロップ', '受ける（droppable）'],
    ],
  },
  {
    id: 'C',
    name: '受けない（押して選ぶだけ）',
    intent:
      '落としても何も起きない。ファイルを落とすのは Dropzone の仕事にして、欄は 1 行の入力に徹する。フォームの欄が増えたときの誤ドロップがない',
    spec: [
      ['受け付ける', '印なし'],
      ['ドロップ', '受けない（droppable={false}）'],
    ],
  },
];

const columns: Column[] = [
  { label: '通常' },
  { label: '持ってきた（受け付ける）', note: '画像を想定。固定' },
  { label: '持ってきた（受け付けない）', note: '画像以外。固定' },
  { label: '実際に落とす', note: 'OS のファイルを落として確かめる（画像だけ受け付ける）' },
];

export const Drop: Story = {
  name: 'ドロップの受け方',
  render: ({ pick }) => (
    <Comparison
      index={622}
      axis="ファイル選択欄へのドロップ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const base = {
          label: '添付ファイル',
          accept: 'image/*',
          droppable: candidate.id !== 'C',
        };
        return (
          <div className="max-w-xs">
            {column.label === '通常' && <FileInput {...base} />}
            {candidate.id === 'C' && column.label.startsWith('持ってきた') && (
              <p className="py-3 text-sm text-fg-subtle">落としても何も起きない（印は出ない）</p>
            )}
            {candidate.id !== 'C' && column.label === '持ってきた（受け付ける）' && (
              <Forced drag="accept">
                <FileInput {...base} />
              </Forced>
            )}
            {candidate.id !== 'C' && column.label === '持ってきた（受け付けない）' && (
              <Forced drag="reject">
                <FileInput {...base} />
              </Forced>
            )}
            {column.label === '実際に落とす' && <FileInput {...base} clearable />}
          </div>
        );
      }}
    >
      <p>
        決定: 受けるときは面と線だけ変える（A）。落とせない形（C）は droppable={false}{' '}
        で選べる。文の差し替えは持たない（文を変えたいときは Dropzone を使う）。
      </p>
      <p>
        ファイルを欄に落として選べるようにするか、落としたときにどう知らせるかを決めます。右端の列には、OS
        のファイルをそのまま落とせます（画像だけ受け付けます）。
      </p>
      <p>現行版を既定のおすすめにしています。落とせない形（C）は、選べる props にして残せます。</p>
    </Comparison>
  ),
};
