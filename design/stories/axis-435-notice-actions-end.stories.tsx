import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Link } from '../../src/components/link/Link';
import { Notice } from '../../src/components/notice/Notice';

// 軸 435: Notice の操作を文の右に置く形（actionsPlacement="end"）。縦のそろえ方・間・下へ回る幅・はみ出し
const meta = {
  title: 'Design Review/435 お知らせの操作を右に置く',
  id: 'design-review-435-notice-actions-end',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'C,B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['C,B', '', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '本文の下（bottom）',
    intent:
      'いまのお知らせ。操作は本文の下に 4px 空けて左寄せで置く（actionsPlacement="bottom"）。比べるための基準',
    spec: [
      ['縦のそろえ方', '—（本文の下）'],
      ['はみ出し', '—'],
      ['下へ回る幅', '—'],
    ],
  },
  {
    id: 'A',
    name: '右・1 行目の頭にそろえる・狭いと下へ',
    intent:
      '操作を文の右に置き、上端を 1 行目の頭にそろえる。ボタンは行より高いので、その分お知らせが高くなる。文の列が 16rem より狭くなると、操作は本文の下（左寄せ）に回る',
    spec: [
      ['縦のそろえ方', '1 行目の頭'],
      ['はみ出し', 'なし（ボタンの分お知らせが高くなる）'],
      ['下へ回る幅', '文の列が 16rem 未満'],
    ],
    tokens: {
      '--notice-actions-align': 'flex-start',
      '--notice-actions-gap': 'calc(var(--spacing) * 4)',
      '--notice-actions-text-min': '16rem',
      '--notice-actions-margin-y': '0px',
    },
  },
  {
    id: 'B',
    name: '右・真ん中・余白へはみ出す・下へ回らない',
    intent:
      '操作を文の塊の縦の真ん中にそろえ、上下の余白へはみ出させる（× と同じ）。1 行のお知らせにボタンを置いても高さが文だけのときと同じで、アイコン・文・ボタンが 1 本の線にそろう。狭くても右に置き続けるので、文の列が細くなる',
    spec: [
      ['縦のそろえ方', '真ん中'],
      ['はみ出し', '上下に（部品の高さ − 行の高さ）÷ 2'],
      ['下へ回る幅', '回らない'],
    ],
    tokens: {
      '--notice-actions-align': 'center',
      '--notice-actions-gap': 'calc(var(--spacing) * 4)',
      '--notice-actions-text-min': '0px',
      '--notice-actions-margin-y': 'calc((var(--leading-control) - var(--spacing-control)) / 2)',
    },
  },
  {
    id: 'C',
    name: '右・真ん中・余白へはみ出す・狭いと下へ',
    intent:
      'B と同じで、文の列が 16rem より狭くなると操作を本文の下（左寄せ）に回す。回ったときもボタンは下の余白へはみ出すので、下の余白が bottom より狭くなる',
    spec: [
      ['縦のそろえ方', '真ん中'],
      ['はみ出し', '上下に（部品の高さ − 行の高さ）÷ 2'],
      ['下へ回る幅', '文の列が 16rem 未満'],
    ],
    tokens: {
      '--notice-actions-align': 'center',
      '--notice-actions-gap': 'calc(var(--spacing) * 4)',
      '--notice-actions-text-min': '16rem',
      '--notice-actions-margin-y': 'calc((var(--leading-control) - var(--spacing-control)) / 2)',
    },
  },
];

const columns: Column[] = [
  { label: '1 行・ボタン', note: 'soft・info' },
  { label: '題と本文・ボタン 2 つ', note: 'soft・warning・×' },
  { label: '文字のリンク', note: 'outline・success' },
  { label: '濃い塗り', note: 'filled・danger' },
  { label: '狭い幅', note: '320px' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={435}
      axis="お知らせの操作を右に置く"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const placement = candidate.id === '現行版' ? 'bottom' : 'end';
        switch (column.label) {
          case '1 行・ボタン':
            return (
              <Notice
                className="w-[480px]"
                status="info"
                actionsPlacement={placement}
                actions={<Button color="white">更新する</Button>}
              >
                新しい版があります。
              </Notice>
            );
          case '題と本文・ボタン 2 つ':
            return (
              <Notice
                className="w-[520px]"
                status="warning"
                title="保存していない変更があります"
                actionsPlacement={placement}
                onClosed={() => {}}
                actions={
                  <>
                    <Button color="white">保存する</Button>
                    <Button color="white" variant="outline">
                      破棄する
                    </Button>
                  </>
                }
              >
                ページを離れると、入力した内容は消えます。
              </Notice>
            );
          case '文字のリンク':
            return (
              <Notice
                className="w-[480px]"
                status="success"
                variant="outline"
                actionsPlacement={placement}
                actions={<Link href="#">記事を見る</Link>}
              >
                記事を公開しました。
              </Notice>
            );
          case '濃い塗り':
            return (
              <Notice
                className="w-[480px]"
                status="danger"
                variant="filled"
                title="送信できませんでした"
                actionsPlacement={placement}
                actions={<Button color="white">もう一度送る</Button>}
              >
                通信が切れました。
              </Notice>
            );
          default:
            return (
              <Notice
                className="w-[320px]"
                status="info"
                title="メンテナンスのお知らせ"
                actionsPlacement={placement}
                actions={<Button color="white">詳しく見る</Button>}
              >
                10 月 5 日の 2 時から 4 時まで止まります。
              </Notice>
            );
        }
      }}
    >
      <p>
        決定: actionsPlacement="end" は
        C（上下の真ん中にそろえ、狭いと本文の下に回る）。下に回ったときの余白は現行版（bottom）と同じにする。下に回らない
        B の形も props で選べる。ユーザーの返事「C
        で、折りたたまないようにする選択肢も合っていいかなと思いました。ただ、現状のCの下に回したときは余白が少なく、見た目は現行版と同じにしたいです。」
      </p>
      <p>
        Notice
        に操作の置き場所（actionsPlacement）を足しました。bottom（いまの形・既定）は本文の下、end
        は文の右です。end は、1 行で済むお知らせで操作を横に並べたいときに使います。
      </p>
      <p>
        選ぶのは、end
        での縦のそろえ方・狭いときに下へ回すか・ボタンを上下の余白へはみ出させるかです。既定は
        bottom のままにする想定です。end の既定の形を教えてください。
      </p>
    </Comparison>
  ),
};
