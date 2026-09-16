import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Button } from '../../src/components/Button';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 31: ボタンのキャプション
// 原則4 では、ボタンにもキャプションが付くのが既定で、本体の下に中央寄せ・小さくグレー（参照画像 component-buttons.webp）
// Button に caption を足した。ここで選ぶのは、ボタンとの間・文字の大きさ・色
// 変えるのは次のトークンだけ（src/components/Button.tsx が読む）
//   --button-caption-gap-fine・-coarse: ボタンとキャプションの間（マウス用・指用）
//   --text-button-caption-fine・-coarse: 文字の大きさ（マウス用・指用）
//   --leading-button-caption: 行の高さ
//   --color-button-caption: 色
// 現行版はキャプションを持たない（caption を渡さずに描く）
// どの案も、キャプションはボタンの幅に収めて折り返し、押せないとき・送信中も薄くしない（原則1）

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'キャプションなし',
    intent: 'いまの Button はキャプションを持たない。ボタンの下に説明を置くには、使う側が組む。',
    spec: [['キャプション', 'なし（caption を渡さずに描く）']],
  },
  {
    id: 'A',
    name: '入力欄のキャプションと同じ',
    intent:
      '入力欄のキャプションと同じ大きさ・色・間。ラベル / 本体 / キャプションの3層が、ボタンと入力欄でそろう。参照画像にいちばん近い。',
    spec: [
      ['間', 'マウス用 6px・指用 8px'],
      ['文字', '11px・12px（行の高さ 16px）'],
      ['色', 'キャプションのグレー（fg-subtle）'],
    ],
    tokens: {
      '--button-caption-gap-fine': '6px',
      '--button-caption-gap-coarse': '8px',
      '--text-button-caption-fine': 'var(--text-caption-fine)',
      '--text-button-caption-coarse': 'var(--text-caption-coarse)',
      '--leading-button-caption': 'var(--leading-caption)',
      '--color-button-caption': 'var(--color-fg-subtle)',
    },
  },
  {
    id: 'B',
    name: 'ボタンに寄せる',
    intent:
      '大きさと色は A のまま、間を詰める。キャプションがボタンに付いたものに見え、並んだほかの部品と離れる。',
    spec: [
      ['間', 'マウス用 2px・指用 4px'],
      ['文字', '11px・12px（行の高さ 16px）'],
      ['色', 'キャプションのグレー（fg-subtle）'],
    ],
    tokens: {
      '--button-caption-gap-fine': '2px',
      '--button-caption-gap-coarse': '4px',
      '--text-button-caption-fine': 'var(--text-caption-fine)',
      '--text-button-caption-coarse': 'var(--text-caption-coarse)',
      '--leading-button-caption': 'var(--leading-caption)',
      '--color-button-caption': 'var(--color-fg-subtle)',
    },
  },
  {
    id: 'C',
    name: '大きく、濃く',
    intent:
      '間は A のまま、文字をラベルの大きさにし、色を一段濃いグレーにする。「削除すると復旧できません」のような注意を読み落としにくい。',
    spec: [
      ['間', 'マウス用 6px・指用 8px'],
      ['文字', '13px・14px（ラベルと同じ。行の高さ 20px）'],
      ['色', '一段濃いグレー（fg-muted）'],
    ],
    tokens: {
      '--button-caption-gap-fine': '6px',
      '--button-caption-gap-coarse': '8px',
      '--text-button-caption-fine': 'var(--text-label-fine)',
      '--text-button-caption-coarse': 'var(--text-label-coarse)',
      '--leading-button-caption': 'var(--leading-label)',
      '--color-button-caption': 'var(--color-fg-muted)',
    },
  },
];

const columns: Column[] = [
  { label: '単独', note: '塗りの危険のボタン' },
  { label: '並べたとき', note: '塗りと枠線。キャプションの有無が混ざる' },
  { label: '幅いっぱい', note: 'className="w-full"。下はボタンの見た目のリンク' },
  { label: '押せないとき', note: 'キャプションは薄くしない（原則1）' },
  { label: '送信中', note: 'loading。キャプションは薄くしない' },
];

const Label = ({ children }: { children: ReactNode }) => (
  <p className="text-xs font-bold text-fg-subtle">{children}</p>
);

// 列の中身。caption は、現行版では渡さない
function Content({ column, caption }: { column: Column; caption: (text: string) => ReactNode }) {
  switch (column.label) {
    case '単独':
      return (
        <div>
          <Button color="danger" caption={caption('削除すると復旧できません')}>
            アカウントを削除する
          </Button>
        </div>
      );
    case '並べたとき':
      return (
        <div className="flex flex-wrap items-start gap-3">
          <Button color="primary" caption={caption('下書きは自動で残ります')}>
            保存する
          </Button>
          <Button appearance="outline">キャンセル</Button>
        </div>
      );
    case '幅いっぱい':
      return (
        <div className="flex flex-col gap-3">
          <Button color="primary" className="w-full" caption={caption('3日以内にお返事します')}>
            送信する
          </Button>
          <Button
            render={<a href="#axis-31" />}
            appearance="outline"
            className="w-full"
            caption={caption('k6n.jp の Works に移ります')}
          >
            作品を見る
          </Button>
        </div>
      );
    case '押せないとき':
      return (
        <div className="flex flex-col gap-3">
          <Button
            disabled
            className="w-full"
            caption={caption('ただいまの時間はご利用いただけません')}
          >
            チャットサポートを開く
          </Button>
          <Button
            disabled
            color="primary"
            className="w-full"
            caption={caption('入力を終えると送れます')}
          >
            送信する
          </Button>
        </div>
      );
    default:
      return (
        <div>
          <Button loading color="primary" caption={caption('送信には数秒かかります')}>
            問い合わせを送信する
          </Button>
        </div>
      );
  }
}

// 列ごとに、上をマウス用、下を指用に固定して描く
const Cell = ({ column, candidate }: { column: Column; candidate: Candidate }) => {
  const caption = (text: string) => (candidate.id === '現行版' ? undefined : text);
  return (
    <div className="flex max-w-[320px] flex-col gap-3">
      <Label>マウス用</Label>
      <div data-density="fine">
        <Content column={column} caption={caption} />
      </div>
      <Label>指用</Label>
      <div data-density="coarse">
        <Content column={column} caption={caption} />
      </div>
    </div>
  );
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/31 ボタンのキャプション',
  id: 'design-review-31-button-caption',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={31}
      axis="ボタンのキャプション"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => <Cell column={column} candidate={candidate} />}
    >
      <p>
        <strong className="text-fg">決まったこと</strong>（ADR-0052）。原則4
        では、ボタンにもキャプションが付くのが既定で、本体の下に中央寄せ・小さくグレーです。いまの
        Button にはキャプションがないので、<code>caption</code>{' '}
        を足しました（1行目の現行版はキャプションなしです）。
      </p>
      <p>
        ここで選ぶのは、キャプションの<strong className="text-fg">ボタンとの間</strong>・
        <strong className="text-fg">文字の大きさ</strong>・<strong className="text-fg">色</strong>
        です。A は入力欄のキャプションと同じ、B は間を詰めた形、C は文字を大きく濃くした形です。
      </p>
      <p>
        列は、単独・塗りと枠線を並べたとき（キャプションの有無が混ざる並び）・幅いっぱい（下はボタンの見た目のリンク）・押せないとき・送信中です。各列の上がマウス用、下が指用です。押せないときと送信中も、キャプションは薄くしません（原則1）。
      </p>
      <p>
        どの案でも、キャプションはボタンの幅に収め、長いときは折り返します（並べたときの「保存する」）。並べるときは上端でそろえます。
      </p>
      <p>どれを既定にするかを一言添えてください。</p>
    </Comparison>
  ),
};
