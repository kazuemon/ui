import { CheckIcon, RocketLaunchIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { List, ListItem } from '../../src/components/list/List';

// 軸 474: List の項目の状態（status）と、印のアイコン（icon）の大きさと色、文の色
const meta = {
  title: 'Design Review/474 リストの状態と印のアイコン',
  id: 'design-review-474-list-status-icon',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '状態を持たない',
    intent:
      'いまのリスト。印は短い線だけで、結果は文に書く。料金プランのチェックは、アイコンと flex を手で組んでいる',
    spec: [
      ['印の大きさ', '—'],
      ['icon の色', '—'],
      ['status の文', '—'],
    ],
  },
  {
    id: 'A',
    name: 'チェックの箱と同じ大きさ',
    intent:
      '印のアイコンを、チェックリストの箱と同じ 16px にする。状態は印の色と形だけで、文は本文の色。icon の既定の色は箇条書きの印と同じ薄いグレー',
    spec: [
      ['印の大きさ', '16px（チェックリストの箱と同じ）'],
      ['icon の色', '薄いグレー'],
      ['status の文', '本文の色'],
    ],
    tokens: {
      '--list-icon-size': 'var(--list-task-size)',
      '--list-icon-color': 'var(--color-fg-subtle)',
      '--list-status-text-k': '0',
    },
  },
  {
    id: 'B',
    name: '文字に合わせた大きさ',
    intent:
      '印のアイコンを、文字の 1.25 倍（本文 16px で 20px）にする。部品の中のアイコンと同じ比。字下げの幅は変えないので、印と文の間が少し詰まる',
    spec: [
      ['印の大きさ', '文字の 1.25 倍（20px）'],
      ['icon の色', '薄いグレー'],
      ['status の文', '本文の色'],
    ],
    tokens: {
      '--list-icon-size': '1.25em',
      '--list-icon-color': 'var(--color-fg-subtle)',
      '--list-status-text-k': '0',
    },
  },
  {
    id: 'C',
    name: 'A ＋ 文も状態の色',
    intent:
      'A の形で、status の項目は文も状態の色にする。結果がひと目で分かるが、警告のオリーブと危険の赤の文が続くと読みにくい',
    spec: [
      ['印の大きさ', '16px'],
      ['icon の色', '薄いグレー'],
      ['status の文', '状態の色'],
    ],
    tokens: {
      '--list-icon-size': 'var(--list-task-size)',
      '--list-icon-color': 'var(--color-fg-subtle)',
      '--list-status-text-k': '1',
    },
  },
  {
    id: 'D',
    name: 'A ＋ icon は本文の色',
    intent:
      'A の形で、icon の既定の色を本文と同じ濃紺にする。料金プランのチェックのように、印そのものを読ませたいときに強く出る',
    spec: [
      ['印の大きさ', '16px'],
      ['icon の色', '本文の色'],
      ['status の文', '本文の色'],
    ],
    tokens: {
      '--list-icon-size': 'var(--list-task-size)',
      '--list-icon-color': 'currentColor',
      '--list-status-text-k': '0',
    },
  },
];

const columns: Column[] = [
  { label: '状態', note: 'status の 3 つと、状態なしの項目' },
  { label: '折り返す', note: '幅 240px' },
  { label: '自分のアイコン', note: 'icon。料金プランの特徴' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={474}
      axis="リストの状態と印のアイコン"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const current = candidate.id === '現行版';
        switch (column.label) {
          case '状態':
            return (
              <div data-reading className="w-[300px]">
                <List>
                  <ListItem status={current ? undefined : 'success'}>型を確かめる: 通った</ListItem>
                  <ListItem status={current ? undefined : 'warning'}>書式: 2 件の警告</ListItem>
                  <ListItem status={current ? undefined : 'danger'}>テスト: 3 件の失敗</ListItem>
                  <ListItem>配布物を作る: まだ</ListItem>
                </List>
              </div>
            );
          case '折り返す':
            return (
              <div data-reading className="w-[240px]">
                <List>
                  <ListItem status={current ? undefined : 'success'}>
                    見た目の基準画像は、すべて前と同じでした。
                  </ListItem>
                  <ListItem status={current ? undefined : 'danger'}>
                    カレンダーの今日の下線が、印と重なっています。
                  </ListItem>
                </List>
              </div>
            );
          default:
            return current ? (
              // いまの組み立て: アイコンを 1 行分の高さの入れ物に入れ、flex で並べる
              <ul data-reading className="flex w-[300px] flex-col gap-2 text-body">
                {['部品をすべて使える', 'ドキュメントの見本', 'メールで質問できる'].map((text) => (
                  <li key={text} className="flex gap-2">
                    <span className="flex h-[1lh] items-center text-fg-success">
                      <CheckIcon aria-hidden size={16} />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            ) : (
              <div data-reading className="w-[300px]">
                <List>
                  <ListItem icon={<CheckIcon />}>部品をすべて使える</ListItem>
                  <ListItem icon={<CheckIcon />}>ドキュメントの見本</ListItem>
                  <ListItem icon={<RocketLaunchIcon />}>はじめの設定を手伝う</ListItem>
                </List>
              </div>
            );
        }
      }}
    >
      <p>
        決定: 印のアイコン（status・icon）は B（文字の 1.25
        倍）。アイコンの色と文の色は、それぞれ使う側が指定できる。指定しないときは文字の色。ユーザーの返事「どのパターンもあり得ると思いましたが、アイコンについては文字に合わせた大きさのB、アイコン・テキストの色は自由に指定できると良さそうです（未指定なら文字色の原則）」候補の見た目は、トークンを畳む前のこのコミットで比べられます。
      </p>
      <p>
        ListItem に、結果を並べるための status（success・warning・danger）と、印をアイコンにする
        icon を足しました。status
        は状態の色と形のアイコン（丸のチェック・三角・丸の「!」）を印に置きます。印は飾りなので読み上げません。
      </p>
      <p>
        選ぶのは、印のアイコンの大きさ、icon の既定の色、status
        の文を状態の色にするかです。折り返した 2 行目は、どの案も文の頭にそろいます。
      </p>
    </Comparison>
  ),
};
