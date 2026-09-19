import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Prose } from '../../src/components/prose/Prose';
import { Step, Steps } from '../../src/components/steps/Steps';

// 後半の軸 155: 手順（Steps）の段をつなぐ線
//   --steps-line-width（太さ。0 で線なし）・--steps-line-style（線の種類）・--color-steps-line（色）
//   --steps-line-gap（印と線の端のあいだ）・--steps-gap（段と段のあいだ）
//   番号の印（軸 154）はどの案も現行版のグレーの丸のまま

function Short() {
  return (
    <div data-reading className="w-80">
      <Steps>
        <Step title="インストールする">パッケージを追加します。</Step>
        <Step title="設定する">設定のファイルを置きます。</Step>
        <Step title="確かめる">画面を開いて見ます。</Step>
      </Steps>
    </div>
  );
}

function Long() {
  return (
    <Prose className="w-80">
      <Steps>
        <Step title="インストールする">
          <p>パッケージを追加します。</p>
          <pre>
            <code>pnpm add @kazuemon/ui</code>
          </pre>
          <p>Tailwind を使っているときは、テーマも読み込みます。</p>
        </Step>
        <Step title="部品を置く">
          <p>使いたい部品を読み込んで、ページに置きます。</p>
        </Step>
      </Steps>
    </Prose>
  );
}

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '細い線',
    intent:
      'ほかの細い境界線と同じ色で、印の下から次の印の上まで縦に引く。本文が長い段でも、次の番号がどこか目で追える。印との間を少し空ける。',
    spec: [
      ['線', '1px・細い境界線の色・実線'],
      ['印との間', '4px'],
      ['段の間', '32px'],
    ],
    tokens: {
      '--steps-line-width': 'var(--border-width-thin)',
      '--steps-line-style': 'solid',
      '--steps-line-gap': 'calc(var(--spacing) * 1)',
      '--color-steps-line': 'var(--color-line)',
      '--steps-gap': 'calc(var(--spacing) * 8)',
    },
  },
  {
    id: 'A',
    name: '線なし',
    intent:
      '線を引かず、番号と余白だけで段を見せる。いちばん静かで、普通の番号付きリストに近い。本文が長い段では、段の境目が余白頼みになる。',
    spec: [
      ['線', 'なし'],
      ['段の間', '32px'],
    ],
    tokens: {
      '--steps-line-width': '0px',
      '--steps-line-style': 'solid',
      '--steps-line-gap': 'calc(var(--spacing) * 1)',
      '--color-steps-line': 'var(--color-line)',
      '--steps-gap': 'calc(var(--spacing) * 8)',
    },
  },
  {
    id: 'B',
    name: '点線',
    intent:
      '同じ色の点線にして、線そのものを軽くする。「次へ進む」道筋の感じが出る。破線は読み取り専用の欄の印でもあるので、そちらと重なって見えないかに注意。',
    spec: [
      ['線', '2px・細い境界線の色・点線'],
      ['印との間', '6px'],
      ['段の間', '32px'],
    ],
    tokens: {
      '--steps-line-width': 'var(--border-width-thick)',
      '--steps-line-style': 'dotted',
      '--steps-line-gap': 'calc(var(--spacing) * 1.5)',
      '--color-steps-line': 'var(--color-line)',
      '--steps-gap': 'calc(var(--spacing) * 8)',
    },
  },
  {
    id: 'C',
    name: '印とつながる太い線',
    intent:
      '現行版と同じ色の 2px の線を、丸に隙間なく接して引く。番号と線がひと続きの道になり、手順の道筋がいちばんはっきりする。そのぶん重く見える。',
    spec: [
      ['線', '2px・細い境界線の色・実線'],
      ['印との間', '0'],
      ['段の間', '32px'],
    ],
    tokens: {
      '--steps-line-width': 'var(--border-width-thick)',
      '--steps-line-style': 'solid',
      '--steps-line-gap': '0px',
      '--color-steps-line': 'var(--color-line)',
      '--steps-gap': 'calc(var(--spacing) * 8)',
    },
  },
];

const columns: Column[] = [
  { label: '短い段', note: '題と 1 行の本文' },
  { label: '長い段', note: 'Prose の中。本文に段落とコード' },
];

const meta = {
  title: 'Design Review/155 手順の段をつなぐ線',
  id: 'design-review-155-steps-line',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={155}
      axis="手順の段をつなぐ線"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (column.label === '長い段' ? <Long /> : <Short />)}
    >
      <p>
        記事の中の番号付きの手順（Steps）で、段と段のあいだに、番号をつなぐ縦の線を引くかどうかと、その線の形を選びます。番号の印（軸
        154）はどの案も現行版です。
      </p>
      <p>既定にする案と、ほかに選べるようにする案があれば教えてください。</p>
    </Comparison>
  ),
};
