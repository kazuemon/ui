import type { Meta, StoryObj } from '@storybook/react-vite';
import { fireEvent } from 'storybook/test';

import { CalendarSample, calendarPseudo, dayButton } from './calendar-samples';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 113: Calendar で期間を選んでいる途中の帯
// --calendar-preview-opacity（0 で出さない）。始まりの日（8 日）を選び、16 日にマウスを載せたところを play で作る

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '出さない',
    intent:
      '終わりの日を押すまで、始まりの日だけが塗られる。どこまで選ぶかは、押してはじめて分かる。',
    spec: [['途中', '始まりの日だけ']],
    tokens: { '--calendar-preview-opacity': '0' },
  },
  {
    id: 'A',
    name: '決まった帯と同じ',
    intent:
      'マウスを載せた日（キーボードで移った日）まで、選んだあとと同じ帯を出す。押す前に、選ぶ期間がそのまま見える。',
    spec: [['途中', '決まった帯と同じ淡い面（文字の色は変えない）']],
    tokens: { '--calendar-preview-opacity': '1' },
  },
  {
    id: 'B',
    name: '薄い帯',
    intent: 'A の帯を半分の濃さにする。まだ決まっていないことを、帯の薄さで見せる。',
    spec: [['途中', '決まった帯の半分の濃さ']],
    tokens: { '--calendar-preview-opacity': '0.5' },
  },
];

const columns: Column[] = [
  { label: 'グレー', note: '8 日を選び、16 日にマウス', preview: 'hover' },
  { label: 'Primary', note: '8 日を選び、16 日にマウス', preview: 'hover' },
  { label: '選び終えたあと（参考）', note: '8〜16 日' },
];

const meta = {
  title: 'Design Review/113 Calendar の期間を選んでいる途中',
  id: 'design-review-113-calendar-range-preview',
  parameters: {
    layout: 'fullscreen',
    pseudo: calendarPseudo({ hover: [dayButton('2026-09-16')] }),
  },
  args: { pick: 'B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  // 途中の列の 16 日にマウスを載せる（React は mouseover から載せたことを知る。載せたままにするため、離れる合図は送らない）
  play: async ({ canvasElement }) => {
    for (const button of canvasElement.querySelectorAll(
      `[data-preview="hover"] ${dayButton('2026-09-16')}`
    )) {
      await fireEvent.mouseOver(button);
    }
  },
  render: ({ pick }) => (
    <Comparison
      index={113}
      axis="Calendar で期間を選んでいる途中の帯"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => {
        switch (column.label) {
          case 'グレー':
            return <CalendarSample sample="range-start" />;
          case 'Primary':
            return <CalendarSample sample="range-start" color="primary" />;
          default:
            return <CalendarSample sample="range" color="primary" />;
        }
      }}
    >
      <p>
        <strong>
          決定（ADR-0141）:
          B（薄い帯）にしました。マウスを載せた日は、帯を日いっぱいに引いて端を丸めます（はじめは半分だけ色が付いていたのを直しました）。
        </strong>
      </p>
      <p>
        期間は、1 回目に押した日が始まり、2
        回目が終わりです。始まりを押したあと、マウスを載せた日まで仮の帯を出すかを決めます。キーボードで日を動かしたときも同じ帯を出します。
      </p>
      <p>
        左の 2 列は、8 日を選んで 16
        日にマウスを載せたところです。ほかの日にマウスを載せると、実際に帯が動きます（ページを開き直すと
        16 日に戻ります）。
      </p>
    </Comparison>
  ),
};
