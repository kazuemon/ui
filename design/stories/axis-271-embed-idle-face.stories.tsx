import type { Meta, StoryObj } from '@storybook/react-vite';

import { Embed } from '../../src/components/embed/Embed';
import { statePseudo } from '../../src/stories/story-states';
import { type Candidate, type Column, Comparison } from './Comparison';

// 軸 271: Embed の、クリックする前の面（プレースホルダー）の見た目。
//   値は tokens.css の --embed-idle-fill（面の色）・--embed-idle-motion-play-state（光の帯を動かすか）。
//   候補はこの 2 つの上書きだけで作る
const demo = (label: string) =>
  `data:text/html;charset=utf-8,${encodeURIComponent(
    `<body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#cfeafc;font:16px system-ui">${label}</body>`
  )}`;

const meta = {
  title: 'Design Review/271 Embed の読み込む前の面',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({ focusVisible: '[data-slot="embed-load"]' }),
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

const candidates: Candidate[] = [
  {
    id: 'current',
    name: 'Skeleton の面・光は動いたまま',
    intent:
      '読み込み中の場所取り（Skeleton・Image）と同じグレーの面を使い、クリックする前から光の帯を動かす。「ここに何か読み込むものがある」と静止画でも伝わる',
    spec: [
      ['面の色', 'グレー（--skeleton-fill）'],
      ['光の帯', '動く'],
    ],
    tokens: { '--embed-idle-motion-play-state': 'running' },
  },
  {
    id: 'A',
    name: 'Skeleton の面・光は止める',
    intent:
      '面の色は同じグレーのまま、光の帯はクリックするまで動かさない。何も起きていないことを動きのなさで伝える',
    spec: [
      ['面の色', 'グレー（--skeleton-fill）'],
      ['光の帯', '止まる'],
    ],
    tokens: { '--embed-idle-motion-play-state': 'paused' },
  },
  {
    id: 'B',
    name: '白い面・光は止める',
    intent:
      '面を白（--color-surface）にし、光の帯も止める。読み込み中の場所取りと区別し、押せるボタン・カードに近い見た目にする',
    spec: [
      ['面の色', '白（--color-surface）'],
      ['光の帯', '止まる'],
    ],
    tokens: {
      '--embed-idle-fill': 'var(--color-surface)',
      '--embed-idle-motion-play-state': 'paused',
    },
  },
];

const columns: Column[] = [
  { label: 'YouTube' },
  { label: 'X の投稿' },
  { label: 'CodePen' },
  { label: 'フォーカス（キーボード）', preview: 'focus' },
];

const contentOf: Record<string, { provider: 'youtube' | 'x' | 'codepen'; title: string }> = {
  YouTube: { provider: 'youtube', title: '空と山の紹介動画' },
  'X の投稿': { provider: 'x', title: 'デザインの進捗についての投稿' },
  CodePen: { provider: 'codepen', title: 'ボタンのホバーのデモ' },
  'フォーカス（キーボード）': { provider: 'youtube', title: '空と山の紹介動画' },
};

export const IdleFace: Story = {
  name: '読み込む前の面',
  render: () => (
    <Comparison
      index={271}
      axis="Embed の、クリックする前の面（プレースホルダー）の見た目"
      pick="A"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const { provider, title } = contentOf[String(column.label)];
        return (
          <div className="w-56">
            <Embed
              key={`${candidate.id}-${column.label}`}
              provider={provider}
              clickToLoad
              src={demo(title)}
              title={title}
            />
          </div>
        );
      }}
    >
      <p>
        決定: A（グレーの面のまま、光の帯は止める）。既定は最初から iframe
        を読み込むように変わったので、ここで比べている「クリックする前の面」は{' '}
        <code>clickToLoad</code> を渡したときだけ出ます。
      </p>
      <p>
        クリックするまで iframe を作らない形（<code>clickToLoad</code>
        ）に対して、クリックする前の面をどう見せるかを選びます。決めるのは 2
        つです。1つめは面の色（読み込み中の場所取りと同じグレーか、白か）。2つめは、クリックする前から光の帯を動かすか（動かすと「読み込むものがある」と伝わりますが、実際にはまだ何も読み込んでいません）。
      </p>
      <p>
        推奨は current です。Skeleton・Image
        の読み込み中の面と同じ塗りを使うので、部品をまたいで「ここに何かが入る」がそろいます（整然）。光を動かすのは、クリックしていないのに動きがあるのは大げさという見方もありますが、動画・投稿・デモのどれもまだ静止画では中身が分からないので、軽い予告として残しました。A
        は同じ面で光だけ止め、落ち着いた見た目になります。B
        は白い面にして、読み込み中というより「押せるカード」に寄せます。
      </p>
      <p>
        既定をどれにしますか。フォーカスの線はどの案でも同じです（枠の外側、キーボード操作のときだけ）。
      </p>
    </Comparison>
  ),
};
