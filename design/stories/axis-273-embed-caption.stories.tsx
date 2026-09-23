import type { Meta, StoryObj } from '@storybook/react-vite';

import { Embed } from '../../src/components/embed/Embed';
import { type Candidate, type Column, Comparison } from './Comparison';

// 軸 273: Embed とキャプションの関係。
//   値は tokens.css の --embed-caption-align（寄せ）・--embed-caption-order（枠の上下どちらに置くか）。
//   候補はこの 2 つの上書きだけで作る
const demo = (label: string) =>
  `data:text/html;charset=utf-8,${encodeURIComponent(
    `<body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#cfeafc;font:16px system-ui">${label}</body>`
  )}`;

const meta = {
  title: 'Design Review/273 Embed のキャプション',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '下・中央（Figure と同じ）',
    intent: '画像のキャプション（Figure）と同じ、枠の下に中央寄せ・注記の大きさ・subtle',
    spec: [
      ['位置', '枠の下'],
      ['寄せ', '中央'],
    ],
  },
  {
    id: 'A',
    name: '下・左',
    intent:
      '枠の下のまま、寄せだけ左に変える。地の文の左端とそろい、キャプションが説明文らしくなる',
    spec: [
      ['位置', '枠の下'],
      ['寄せ', '左'],
    ],
    tokens: { '--embed-caption-align': 'start' },
  },
  {
    id: 'B',
    name: '上・左（見出しのような扱い）',
    intent:
      'キャプションを枠の上・左寄せに置き、「これから何を埋め込むか」を先に知らせる小さな見出しにする。CodeBlock の題の帯に近い役割',
    spec: [
      ['位置', '枠の上'],
      ['寄せ', '左'],
    ],
    tokens: { '--embed-caption-align': 'start', '--embed-caption-order': '-1' },
  },
];

const columns: Column[] = [{ label: '短いキャプション' }, { label: '長いキャプション' }];

const captionOf: Record<string, string> = {
  短いキャプション: '図 1. 空と山',
  長いキャプション:
    '図 2. 前回のリリースで直した、ボタンを押したときの手応えの動き（等速から緩急のある動きへ）',
};

export const Caption: Story = {
  name: 'キャプションの置き方',
  render: () => (
    <Comparison
      index={273}
      axis="Embed とキャプションの関係（置き場所と寄せ）"
      pick="current"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <div className="w-64">
          <Embed
            key={`${candidate.id}-${column.label}`}
            provider="youtube"
            src={demo('動画')}
            title="空と山の紹介動画"
            caption={captionOf[String(column.label)]}
          />
        </div>
      )}
    >
      <p>決定: current（下・中央のまま。Figure のキャプションと同じ見た目です）。</p>
      <p>
        caption を渡したときの置き場所と寄せを選びます。Embed
        は画像より内容が重く（動画・投稿・デモ）、クリックするまで中身が見えないので、キャプションを先に読ませたいかどうかも論点です。
      </p>
      <p>
        推奨は current
        です。画像のキャプション（Figure）とそろえ、部品をまたいで同じ見た目にします（整然）。A
        は寄せだけ左にし、長い説明文でも読み始めがそろいます。B
        はキャプションを枠の上に出し、クリックする前に「これは何か」を読んでから中身を選べるようにします。ただし
        figure・figcaption の並びとしては見慣れない形になります。
      </p>
      <p>
        既定をどれにしますか。B を選ぶ場合、Figure（画像）のキャプションは current
        のままにするか、Embed だけ変えるかも決めます。
      </p>
    </Comparison>
  ),
};
