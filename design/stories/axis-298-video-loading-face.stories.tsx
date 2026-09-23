import type { Meta, StoryObj } from '@storybook/react-vite';

import { Video } from '../../src/components/video/Video';
import { type Candidate, type Column, Comparison } from './Comparison';

// 軸 298: Video の、poster がないときの読み込み中の面（Skeleton と同じ塗り）の扱い。
//   決定: 原則14（動きは手応えと待ちを伝える）どおり、実際に読み込んでいるあいだは動く面にする。A（光を止める）・
//   B（面を出さない）は候補から外した。値は tokens.css の --video-loading-opacity・--video-loading-motion-play-state
//   （比較のためのトークンを部品へ畳む作業はあとでまとめて行うので、ここでは残したまま）
//   失敗したときの面（アイコン・文）はこのトークンを見ず、常に出す（このストーリーの対象外）
//   src を渡さず、ずっと読み込み中のままにして見た目を確かめる（poster があるときは、この面自体を出さない）

const meta = {
  title: 'Design Review/298 Video の読み込み中の面',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

const candidates: Candidate[] = [
  {
    id: 'current',
    name: 'Skeleton の面・光は動く',
    intent:
      'Image・Embed の読み込み中と同じ、光の帯が動く面。実際に読み込んでいるので、進んでいることを動きで伝える（原則14）',
    spec: [
      ['面', '出す'],
      ['光の帯', '動く'],
    ],
    tokens: { '--video-loading-opacity': '1', '--video-loading-motion-play-state': 'running' },
  },
];

const columns: Column[] = [{ label: '読み込み中' }, { label: '読み込み中（狭い枠）' }];

export const LoadingFace: Story = {
  name: '読み込み中の面',
  render: () => (
    <Comparison
      index={298}
      axis="Video の、poster がないときの読み込み中の面"
      pick="current"
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <div className={column.label.includes('狭い') ? 'w-32' : 'w-56'}>
          <Video ratio={16 / 9} fit="cover" />
        </div>
      )}
    >
      <p>
        決定: current（Skeleton の面・光は動く）。poster がない動画は、読み込むまで Image と同じ
        Skeleton
        の面を出し、実際に読み込んでいるあいだは光の帯を動かして進んでいることを伝えます（原則14）。
        光を止める案・面を出さない案は、候補から外しました。
      </p>
      <p>失敗したとき（形式に非対応など）の面は、このトークンを見ずに常に出ます。</p>
    </Comparison>
  ),
};
