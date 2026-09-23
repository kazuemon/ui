import type { Meta, StoryObj } from '@storybook/react-vite';

import { type VideoPlayButtonVariant, Video } from '../../src/components/video/Video';
import sample from '../../src/components/video/__fixtures__/sample.webm?url';
import { statePseudo } from '../../src/stories/story-states';
import { type Candidate, type Column, Comparison } from './Comparison';

// 軸 297: Video の、controls={false} のときに重ねる大きな再生ボタンの見た目。
//   決定: raised（現行）を既定に、flat も props（playButtonVariant）で選べる形にした。
//   raised は tokens.css の --video-play-fill・--video-play-fg・--video-play-shadow のまま、
//   flat は部品の tv の variants で上書きする（ImageZoom の closeButtonVariant と同じ作り）。
//   ここでは実際の playButtonVariant を切り替えて比べる（トークンの上書きではない）
//   controls を出しているとき（既定）はブラウザ自身の再生ボタンと二重になるので重ねない。出番は controls={false} のときだけ

const poster = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc4f8"/><stop offset="1" stop-color="#cfeafc"/></linearGradient></defs><rect width="640" height="360" fill="url(#s)"/><circle cx="500" cy="90" r="36" fill="#fff4cc"/><path d="M0 260 L140 160 L260 240 L400 130 L520 230 L640 170 L640 360 L0 360Z" fill="#2f6b58"/></svg>'
)}`;

const meta = {
  title: 'Design Review/297 Video の再生ボタン',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({ focusVisible: '[data-slot="video-play"]' }),
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

const candidates: Candidate[] = [
  {
    id: 'current',
    name: 'raised（既定）: 円形・塗り（primary）・浮いた影',
    intent:
      'Button の filled・primary と同じ考え方（塗り・浮いた影）。押せるものとして一目で分かり、部品をまたいで見た目がそろう（整然）',
    spec: [
      ['塗り', 'var(--color-primary)'],
      ['アイコン', 'var(--color-on-primary)'],
      ['影', 'var(--shadow-raised)'],
    ],
  },
  {
    id: 'A',
    name: 'flat: 白・半透明・影なし',
    intent:
      '映像の上に軽く重ねる、動画プレイヤーでよく見る形。どんな poster の色にもなじみやすいが、部品としての色（primary）を持たない',
    spec: [
      ['塗り', 'color-mix(in oklab, white 55%, transparent)'],
      ['アイコン', '白'],
      ['影', 'なし'],
    ],
  },
];

const variantOf: Record<string, VideoPlayButtonVariant> = { current: 'raised', A: 'flat' };

const columns: Column[] = [
  { label: 'poster あり' },
  { label: 'poster なし（Skeleton の面の上）' },
  { label: 'フォーカス（キーボード）', preview: 'focus' },
];

const posterOf: Record<string, string | undefined> = {
  'poster あり': poster,
  'poster なし（Skeleton の面の上）': undefined,
  'フォーカス（キーボード）': poster,
};

export const PlayButton: Story = {
  name: '再生ボタン',
  render: () => (
    <Comparison
      index={297}
      axis="Video の、controls={false} のときに重ねる大きな再生ボタンの見た目"
      pick="current"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <div className="w-56">
          <Video
            ratio={16 / 9}
            src={sample}
            poster={posterOf[column.label]}
            fit="cover"
            controls={false}
            loop
            muted
            playButtonVariant={variantOf[candidate.id]}
          />
        </div>
      )}
    >
      <p>
        決定: raised（現行）を既定にし、flat も <code>playButtonVariant</code>{' '}
        で選べるようにしました。controls
        を出しているとき（既定）はブラウザ自身の再生ボタンと二重になるので、この再生ボタンは{' '}
        <code>controls={'{false}'}</code> のとき（自動再生・ループ・音なしの短い動画）だけ重ねます。
      </p>
      <p>
        raised は Button の filled・primary
        と同じ塗り・影で、押せるものとして一目で分かり、他の部品と見た目がそろいます。 flat
        は映像プレイヤーでよく見る、白い半透明の円です。poster
        の色を選ばずになじみますが、部品としての色（primary）を持ちません。
      </p>
    </Comparison>
  ),
};
