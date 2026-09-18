import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { CalendarSample } from './calendar-samples';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 112: Calendar の祝日
// 祝日は使う側が getHoliday で渡す。日曜と同じ色にする（軸 109 の --calendar-weekend-color に従う）
// 比べるのは、名前を見せるか: --calendar-holiday-list（none か flex）

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '日曜と同じ色だけ',
    intent:
      '祝日の日を、日曜と同じ赤にする。名前は画面には出さず、読み上げで日付のあとに読む（「2026年9月21日月曜日 敬老の日」）。',
    spec: [
      ['祝日の日', '日曜と同じ赤'],
      ['名前', '読み上げだけ'],
    ],
    tokens: { '--calendar-holiday-list': 'none' },
  },
  {
    id: 'A',
    name: '名前を表の下に並べる',
    intent:
      '赤に加えて、その月の祝日を「21 敬老の日」の形で表の下に並べる。月によって行の数が変わるので、カレンダーの高さが変わる。',
    spec: [
      ['祝日の日', '日曜と同じ赤'],
      ['名前', '表の下に、日付（赤・太字）と名前をキャプションの大きさで'],
    ],
    tokens: { '--calendar-holiday-list': 'flex' },
  },
];

const columns: Column[] = [
  { label: 'グレー', note: '21〜23 日が祝日（9 月の連休）' },
  { label: 'Primary の期間', note: '8〜16 日を選んだところ' },
  { label: '土日の色を付けないとき', note: '軸 109 の「色を付けない」を選んだ場合' },
];

const meta = {
  title: 'Design Review/112 Calendar の祝日',
  id: 'design-review-112-calendar-holiday',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={112}
      axis="Calendar の祝日"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => {
        switch (column.label) {
          case 'グレー':
            return <CalendarSample sample="single" holidays />;
          case 'Primary の期間':
            return <CalendarSample sample="range" color="primary" holidays />;
          default:
            return (
              <div style={{ '--calendar-weekend-color': '0' } as CSSProperties}>
                <CalendarSample sample="single" holidays />
              </div>
            );
        }
      }}
    >
      <p>
        <strong>
          決定（ADR-0140）: 現行版（日曜と同じ色だけ）にしました。名前は読み上げだけで読みます。
        </strong>
      </p>
      <p>
        日曜を赤にしたので、祝日も赤にします。部品は祝日のデータを持たず、使う側が
        <code>getHoliday</code>
        （日付を受け取って祝日の名前を返す関数）で渡します。祝日は国と年で変わり、データを部品に入れると大きくなるためです。日本の祝日は
        <code>@holiday-jp/holiday_jp</code> などのデータを渡す使い方を、Docs に書きます。
      </p>
      <p>
        ここで決めるのは、祝日の名前を画面に見せるかです。見本では 9 月 21〜23
        日を祝日にしています。
      </p>
    </Comparison>
  ),
};
