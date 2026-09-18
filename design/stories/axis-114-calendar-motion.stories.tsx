import type { Meta, StoryObj } from '@storybook/react-vite';

import { CalendarSample } from './calendar-samples';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 114: Calendar で月を送るときの動き
// --calendar-motion-duration・--calendar-motion-distance・--calendar-motion-from-opacity
// 新しい月は送る向きから入り、前の月は反対へ出る（見出しの月の名前と日の表。曜日の行と月送りのボタンは動かない）

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '動かさない',
    intent: 'すぐに切り替わる。続けて送っても待たない。',
    spec: [['動き', 'なし']],
    tokens: {
      '--calendar-motion-duration': '1ms',
      '--calendar-motion-distance': '0px',
      '--calendar-motion-from-opacity': '1',
    },
  },
  {
    id: 'A',
    name: '幅いっぱいに滑る',
    intent:
      '前の月が押した向きの反対へ滑り出て、新しい月が入ってくる。めくる向きがはっきり分かる。動きは大きい。',
    spec: [
      ['動き', '表の幅いっぱいに横へ滑る'],
      ['長さ', 'シートと同じ（250ms）'],
    ],
    tokens: {
      '--calendar-motion-duration': 'var(--duration-slow)',
      '--calendar-motion-distance': '100%',
      '--calendar-motion-from-opacity': '1',
    },
  },
  {
    id: 'B',
    name: '少し滑ってふわっと',
    intent:
      '送る向きへ少しだけずれながら、前の月が消えて新しい月が現れる。向きは分かり、動きは小さい。浮かぶ面の開き方（少しずれた位置から濃さと一緒に滑る）と同じ作り。',
    spec: [
      ['動き', '16px ずれながら、濃さ 0 から'],
      ['長さ', '浮かぶ面が開くのと同じ（200ms）'],
    ],
    tokens: {
      '--calendar-motion-duration': 'var(--duration-normal)',
      '--calendar-motion-distance': 'calc(var(--spacing) * 4)',
      '--calendar-motion-from-opacity': '0',
    },
  },
  {
    id: 'C',
    name: 'その場でふわっと',
    intent: 'その場で前の月が消え、新しい月が現れる。向きは見せない。',
    spec: [
      ['動き', '濃さだけ'],
      ['長さ', '150ms'],
    ],
    tokens: {
      '--calendar-motion-duration': '150ms',
      '--calendar-motion-distance': '0px',
      '--calendar-motion-from-opacity': '0',
    },
  },
];

const columns: Column[] = [
  { label: 'グレー', note: '‹ › で月を送ってください' },
  { label: 'Primary の期間', note: '8〜16 日' },
];

const meta = {
  title: 'Design Review/114 Calendar の月を送る動き',
  id: 'design-review-114-calendar-motion',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current,C' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'current,C'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={114}
      axis="Calendar で月を送るときの動き"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) =>
        column.label === 'グレー' ? (
          <CalendarSample sample="single" />
        ) : (
          <CalendarSample sample="range" color="primary" />
        )
      }
    >
      <p>
        <strong>
          決定（ADR-0142）:
          現行版（動かさない）を既定にし、C（その場でふわっと）も選べるようにしました。
        </strong>
      </p>
      <p>
        月を送るボタン（‹
        ›）を押したときの動きです。静止画では違いが見えないので、実際に押して比べてください。キーボードで日を動かして月をまたいだときは、どの案でも動かしません（フォーカスを見失わないため）。
      </p>
      <p>動きを減らす設定のときは、どの案でも動かしません。</p>
    </Comparison>
  ),
};
