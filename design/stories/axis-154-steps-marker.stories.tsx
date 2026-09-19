import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Prose } from '../../src/components/prose/Prose';
import { Step, Steps } from '../../src/components/steps/Steps';

// 後半の軸 154: 手順（Steps）の番号の印
//   --steps-marker-size（印の大きさ）・--steps-marker-radius（角）・--steps-marker-text・--steps-marker-weight（数字）
//   --color-steps-marker（塗り）・--color-steps-marker-fg（数字の色）・--steps-marker-ring・--color-steps-marker-ring（輪郭）
//   段をつなぐ線（軸 155）はどの案も現行版の細い線のまま

function Titled() {
  return (
    <div data-reading className="w-80">
      <Steps>
        <Step title="インストールする">パッケージを追加します。</Step>
        <Step title="設定する">
          設定のファイルを置き、書き換えたら開発のサーバーを立て直します。
        </Step>
        <Step title="確かめる">画面を開いて見ます。</Step>
      </Steps>
    </div>
  );
}

function Untitled() {
  return (
    <div data-reading className="w-80">
      <Steps start={9}>
        <Step>設定の画面を開きます。</Step>
        <Step>「通知」を選び、メールの受け取りを切り替えます。</Step>
        <Step>保存します。</Step>
      </Steps>
    </div>
  );
}

function InArticle() {
  return (
    <Prose className="w-80">
      <h2>はじめかた</h2>
      <p>3 つの手順で、ブログに部品を載せられます。</p>
      <Steps>
        <Step title="インストールする">
          <p>パッケージを追加します。</p>
          <pre>
            <code>pnpm add @kazuemon/ui</code>
          </pre>
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
    name: 'グレーの丸',
    intent:
      'グレーのボタンやタグと同じ淡いグレーの丸に、濃紺の太い数字。色を指定しないときはグレー、という決まりに沿う。静かで、題が主役になる。',
    spec: [
      ['印', '28px の丸・グレーの塗り'],
      ['数字', '14px・太字・濃紺'],
    ],
    tokens: {
      '--steps-marker-size': 'calc(var(--spacing) * 7)',
      '--steps-marker-radius': 'var(--radius-pill)',
      '--steps-marker-text': '14px',
      '--steps-marker-weight': 'var(--font-weight-heading)',
      '--steps-marker-ring': '0px',
      '--color-steps-marker': 'var(--color-neutral)',
      '--color-steps-marker-fg': 'var(--color-fg)',
      '--color-steps-marker-ring': 'transparent',
    },
  },
  {
    id: 'A',
    name: '水色の丸',
    intent:
      'ブランドの水色の丸に、濃紺の数字（水色の面の文字は濃紺）。手順が一目で分かり、人懐っこい。記事の中で色が付くのは、こことリンクくらいになる。',
    spec: [
      ['印', '28px の丸・水色の塗り'],
      ['数字', '14px・太字・濃紺'],
    ],
    tokens: {
      '--steps-marker-size': 'calc(var(--spacing) * 7)',
      '--steps-marker-radius': 'var(--radius-pill)',
      '--steps-marker-text': '14px',
      '--steps-marker-weight': 'var(--font-weight-heading)',
      '--steps-marker-ring': '0px',
      '--color-steps-marker': 'var(--color-brand)',
      '--color-steps-marker-fg': 'var(--color-on-brand)',
      '--color-steps-marker-ring': 'transparent',
    },
  },
  {
    id: 'B',
    name: '輪郭の丸',
    intent:
      '塗らずに、細い輪郭の丸と少し淡い数字。いちばん軽い。押せない箱（リストのチェック）と同じ考えで、押せるものには見えない。',
    spec: [
      ['印', '28px の丸・1.5px の輪郭（3:1 のグレー）'],
      ['数字', '14px・太字・一段淡い濃紺'],
    ],
    tokens: {
      '--steps-marker-size': 'calc(var(--spacing) * 7)',
      '--steps-marker-radius': 'var(--radius-pill)',
      '--steps-marker-text': '14px',
      '--steps-marker-weight': 'var(--font-weight-heading)',
      '--steps-marker-ring': 'var(--border-width-medium)',
      '--color-steps-marker': 'transparent',
      '--color-steps-marker-fg': 'var(--color-fg-muted)',
      '--color-steps-marker-ring': 'var(--color-line-strong)',
    },
  },
  {
    id: 'C',
    name: '丸なしの大きな数字',
    intent:
      '丸を置かず、題と同じ大きさの淡い数字だけ。雑誌の手順のような組み方。形が減って軽いが、番号と題が同じ行に並ぶので、題の頭が少し読みにくい。',
    spec: [
      ['印', 'なし（28px の枠の中央に数字）'],
      ['数字', '20px・太字・淡いグレー'],
    ],
    tokens: {
      '--steps-marker-size': 'calc(var(--spacing) * 7)',
      '--steps-marker-radius': '0px',
      '--steps-marker-text': '20px',
      '--steps-marker-weight': 'var(--font-weight-heading)',
      '--steps-marker-ring': '0px',
      '--color-steps-marker': 'transparent',
      '--color-steps-marker-fg': 'var(--color-fg-subtle)',
      '--color-steps-marker-ring': 'transparent',
    },
  },
];

const columns: Column[] = [
  { label: '題と本文', note: '題は h3' },
  { label: '題なし', note: '番号は本文の 1 行目にそろう。start=9' },
  { label: '記事の中', note: 'Prose の中。見出し・段落・コードと並ぶ' },
];

const meta = {
  title: 'Design Review/154 手順の番号の印',
  id: 'design-review-154-steps-marker',
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
      index={154}
      axis="手順の番号の印"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => {
        if (column.label === '題なし') return <Untitled />;
        if (column.label === '記事の中') return <InArticle />;
        return <Titled />;
      }}
    >
      <p>
        記事の中の番号付きの手順（Steps）で、各段の番号をどう見せるかを選びます。題・本文・段をつなぐ線は、どの案も同じです。
      </p>
      <p>
        記事の中のものなので、どの案も影を付けず、押せる見た目にはしません。既定にする案と、ほかに選べるようにする案があれば教えてください。
      </p>
    </Comparison>
  ),
};
