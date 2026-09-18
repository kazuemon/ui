import type { Meta, StoryObj } from '@storybook/react-vite';

import { CalendarSample, calendarPseudo, dayButton } from './calendar-samples';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 107: Calendar の今日の印
// --calendar-today-weight（数字の太さ）・--calendar-today-dot（数字の下の点）・--calendar-today-fill（後ろの塗り）
// 2 回目: --calendar-today-ring（内側の細い枠線）と --color-calendar-today-ring（その色）を足した
// 3 回目: --calendar-today-mark-width・-height（点を下線にする）と --calendar-today-circle（後ろの小さな丸）を足した（返事: 日付の下に線、薄く小さいグレーの丸も見たい）
// 1 回目の A（太字だけ）・B（点だけ）・C（淡い塗り）は選ばれなかったので外した（返事: 点は予定がある日にも見える、グレーの薄い枠線も見たい）

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '太字と点',
    intent:
      '数字を太字にし、下に小さな点を置く。点は文字の色なので、選んだ日の上では白くなる。予定がある日の印（点）と読まれることがある。',
    spec: [
      ['数字', '太字'],
      ['印', '数字の下の点（文字の色）'],
    ],
    tokens: {
      '--calendar-today-weight': '700',
      '--calendar-today-dot': '1',
      '--calendar-today-mark-width': '4px',
      '--calendar-today-mark-height': '4px',
      '--calendar-today-fill': '0',
      '--calendar-today-ring': '0',
      '--color-calendar-today-ring': 'var(--color-line)',
      '--calendar-today-circle': '0',
    },
  },
  {
    id: 'D',
    name: '薄い枠線',
    intent:
      '日の内側に、細い境界線と同じ薄いグレーの線を引く。数字の太さは変えない。フォーカスの線（外に離して太く引く、濃紺）とは太さ・位置・色が違う。選んだ日の上では、白い文字の色を半分の濃さで引く。',
    spec: [
      ['数字', 'ふつう'],
      ['印', '内側の細い線（細い境界線の色）'],
    ],
    tokens: {
      '--calendar-today-weight': '400',
      '--calendar-today-dot': '0',
      '--calendar-today-mark-width': '4px',
      '--calendar-today-mark-height': '4px',
      '--calendar-today-fill': '0',
      '--calendar-today-ring': '1',
      '--color-calendar-today-ring': 'var(--color-line)',
      '--calendar-today-circle': '0',
    },
  },
  {
    id: 'E',
    name: '太字と薄い枠線',
    intent: 'D に太字を足す。線が薄くても、数字で今日が目に入る。',
    spec: [
      ['数字', '太字'],
      ['印', '内側の細い線（細い境界線の色）'],
    ],
    tokens: {
      '--calendar-today-weight': '700',
      '--calendar-today-dot': '0',
      '--calendar-today-mark-width': '4px',
      '--calendar-today-mark-height': '4px',
      '--calendar-today-fill': '0',
      '--calendar-today-ring': '1',
      '--color-calendar-today-ring': 'var(--color-line)',
      '--calendar-today-circle': '0',
    },
  },
  {
    id: 'F',
    name: 'はっきりした枠線',
    intent:
      '線の色を、白いボタンの輪郭に差し替えられる 3:1 のグレーにする。D より見つけやすいが、フォーカスの線に近づく。',
    spec: [
      ['数字', 'ふつう'],
      ['印', '内側の細い線（3:1 のグレー）'],
    ],
    tokens: {
      '--calendar-today-weight': '400',
      '--calendar-today-dot': '0',
      '--calendar-today-mark-width': '4px',
      '--calendar-today-mark-height': '4px',
      '--calendar-today-fill': '0',
      '--calendar-today-ring': '1',
      '--color-calendar-today-ring': 'var(--color-line-strong)',
      '--calendar-today-circle': '0',
    },
  },
  {
    id: 'G',
    name: '下線',
    intent:
      '数字の下に短い線を引く。点より「今日」の印として読みやすく、予定の印と紛れにくい。線は文字の色なので、選んだ日の上では白くなる。',
    spec: [
      ['数字', '太字'],
      ['印', '数字の下の短い線（幅 14px・太さ 2px、文字の色）'],
    ],
    tokens: {
      '--calendar-today-weight': '700',
      '--calendar-today-dot': '1',
      '--calendar-today-mark-width': '14px',
      '--calendar-today-mark-height': '2px',
      '--calendar-today-fill': '0',
      '--calendar-today-ring': '0',
      '--color-calendar-today-ring': 'var(--color-line)',
      '--calendar-today-circle': '0',
    },
  },
  {
    id: 'H',
    name: '薄く小さいグレーの丸',
    intent:
      '数字の後ろに、日より小さい薄いグレーの丸を敷く。hover（日いっぱいの淡い塗り）より小さく丸いので、形で見分ける。選んだ日の上では出さない（塗りで選んだことが分かるため）。',
    spec: [
      ['数字', 'ふつう'],
      ['印', '直径 32px の丸（押せない欄と同じグレー）'],
      ['選んだとき', '丸は出さない'],
    ],
    tokens: {
      '--calendar-today-weight': '400',
      '--calendar-today-dot': '0',
      '--calendar-today-mark-width': '4px',
      '--calendar-today-mark-height': '4px',
      '--calendar-today-fill': '0',
      '--calendar-today-ring': '0',
      '--color-calendar-today-ring': 'var(--color-line)',
      '--calendar-today-circle': '1',
    },
  },
];

const columns: Column[] = [
  { label: '通常', note: '19 日が今日。24 日を選んだところ' },
  { label: '隣の日に hover', note: '18 日に hover', preview: 'hover' },
  { label: '今日にフォーカス', note: 'キーボードで 19 日へ', preview: 'focus' },
  { label: '今日を選んだとき', note: '19 日を選んだところ（グレー）' },
  { label: 'Primary で今日を選んだとき', note: '19 日' },
];

const meta = {
  title: 'Design Review/107 Calendar の今日の印',
  id: 'design-review-107-calendar-today',
  parameters: {
    layout: 'fullscreen',
    pseudo: calendarPseudo({
      hover: [dayButton('2026-09-18')],
      focus: [dayButton('2026-09-19')],
    }),
  },
  args: { pick: 'G' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'D', 'E', 'F', 'G', 'H'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={107}
      axis="Calendar の今日の印"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => {
        switch (column.label) {
          case '通常':
          case '隣の日に hover':
          case '今日にフォーカス':
            return <CalendarSample sample="single" />;
          case '今日を選んだとき':
            return <CalendarSample sample="today-selected" />;
          default:
            return <CalendarSample sample="today-selected" color="primary" />;
        }
      }}
    >
      <p>
        <strong>決定（ADR-0135）: G（太字と下線）にしました。</strong>
      </p>
      <p>
        3
        回目です。数字の下に短い線を引く案（G）と、数字の後ろに薄く小さいグレーの丸を敷く案（H）を足しました。2
        回目では、点が「予定がある日」の印にも見えるので、日の内側に薄いグレーの枠線を引く案（D・E・F）を足しています。
      </p>
      <p>
        枠線はふだんフォーカスとエラーを表しますが、ここでは細さ・位置（内側）・色（薄いグレー）でフォーカスの線と見分けます。3
        列目は、今日にキーボードでフォーカスしたところです。
      </p>
      <p>選んだ日と重なったとき（4・5 列目）にも、今日だと分かるかを見てください。</p>
    </Comparison>
  ),
};
