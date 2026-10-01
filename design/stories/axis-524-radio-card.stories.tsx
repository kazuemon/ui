import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Card, CardBody } from '../../src/components/card/Card';
import { Radio, RadioGroup } from '../../src/components/radio/Radio';
import { Text } from '../../src/components/text/Text';
import { statePseudo } from '../../src/stories/story-states';

// 軸 524: カードの形で選ぶラジオ（RadioGroup の frame="card"）の、選んでいる見た目（F13）
const meta = {
  title: 'Design Review/524 カードの形で選ぶラジオ',
  id: 'design-review-524-radio-card',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({
      hover: '[data-radio-card]:has([data-value="free"])',
      focusVisible: '[data-radio-card] [role="radio"][data-checked]',
    }),
  },
  args: { pick: 'B,A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const selected = (fillMix: '0' | '1', lineWidth: string) => ({
  '--radio-card-padding': 'var(--card-padding)',
  '--radio-card-gap': 'calc(var(--spacing) * 2)',
  '--radio-card-selected-fill-mix': fillMix,
  '--radio-card-selected-line-width': lineWidth,
});

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'カードの形なし',
    intent:
      'いまのラジオは丸と文字の行だけ。値段は caption に書くしかない。比べるための基準（labelAside は文字の右に置いている）',
    spec: [
      ['面', '—'],
      ['線', '—'],
    ],
    tokens: selected('1', 'var(--card-selected-line-width)'),
  },
  {
    id: 'A',
    name: 'Card の選んでいる見た目と同じ（淡い面＋線）',
    intent:
      'Card の selected の既定と同じ。選んだカードを色の淡い面で塗り、輪郭の上に 2px の線を重ねる。丸も選んだ色になるので、面・線・丸の 3 つで見分ける',
    spec: [
      ['面', '色の淡い面'],
      ['線', '2px（色）'],
    ],
    tokens: selected('1', 'var(--card-selected-line-width)'),
  },
  {
    id: 'B',
    name: 'Card の線だけ（selectedIndicator="line"）',
    intent:
      '面は白のまま、輪郭の上に 2px の線だけを重ねる。Card の line と同じ。塗りがないぶん静か',
    spec: [
      ['面', '白のまま'],
      ['線', '2px（色）'],
    ],
    tokens: selected('0', 'var(--card-selected-line-width)'),
  },
  {
    id: 'C',
    name: '淡い面だけ',
    intent:
      '選んだカードを色の淡い面で塗り、線は輪郭（細いグレー）のまま。線を足さないので枠が太らない',
    spec: [
      ['面', '色の淡い面'],
      ['線', 'なし（輪郭のまま）'],
    ],
    tokens: selected('1', '0px'),
  },
];

const columns: Column[] = [
  { label: '縦に並べる', note: 'neutral。「スタンダード」を選んでいる' },
  { label: 'hover', note: '選んでいない「フリー」に載せる', preview: 'hover' },
  { label: 'フォーカス', note: 'キーボード。線はカードの外に出す', preview: 'focus' },
  { label: '色・押せない', note: 'primary。「チーム」は押せない' },
  { label: '横・同じ幅', note: 'direction="horizontal" itemWidth="equal"' },
  { label: '参考', note: 'Card の selected（いまの部品）' },
];

const plans = (on: boolean, disabledTeam = false) => [
  <Radio
    key="free"
    value="free"
    data-value="free"
    label="フリー"
    caption="個人の試用に"
    labelAside={on ? '0 円' : undefined}
  />,
  <Radio
    key="standard"
    value="standard"
    label="スタンダード"
    caption="記事 100 本まで"
    labelAside={on ? '月 500 円' : undefined}
    data-value="standard"
  />,
  <Radio
    key="team"
    value="team"
    label="チーム"
    caption="5 人まで"
    labelAside={on ? '月 1,500 円' : undefined}
    disabled={disabledTeam}
  />,
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={524}
      axis="カードの形で選ぶラジオ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const on = candidate.id !== '現行版';
        const frame = on ? ('card' as const) : ('none' as const);
        switch (column.label) {
          case '色・押せない':
            return (
              <div className="w-[300px]">
                <RadioGroup label="プラン" frame={frame} color="primary" defaultValue="standard">
                  {plans(on, true)}
                </RadioGroup>
              </div>
            );
          case '横・同じ幅':
            return (
              <div className="w-[720px]">
                <RadioGroup
                  label="プラン"
                  frame={frame}
                  direction="horizontal"
                  itemWidth="equal"
                  defaultValue="standard"
                >
                  {plans(on)}
                </RadioGroup>
              </div>
            );
          case '参考':
            return (
              <div className="flex w-[240px] flex-col gap-2">
                <Card selected onClick={() => {}}>
                  <CardBody>
                    <Text>淡い面＋線（既定）</Text>
                  </CardBody>
                </Card>
                <Card selected selectedIndicator="line" onClick={() => {}}>
                  <CardBody>
                    <Text>線だけ</Text>
                  </CardBody>
                </Card>
              </div>
            );
          default:
            return (
              <div className="w-[300px]">
                <RadioGroup label="プラン" frame={frame} defaultValue="standard">
                  {plans(on)}
                </RadioGroup>
              </div>
            );
        }
      }}
    >
      <p>
        決定: frame="card" の選んでいるカードは、面を白のまま 2px
        の線だけを重ねる（B）を既定にし、淡い面＋線（A）も選べるようにする。名前と値は Card の
        selectedIndicator にそろえる（既定は Card と逆で線だけ）。ユーザーの返事「B
        デフォルトで、選んでいるときに淡い塗りのAも選べるようにしたいです。」（はじめ 523 と 524
        を逆に書いており、「523 と 524
        が逆でしたmm」と直したあとの対応）。候補の見た目は、トークンを畳む前のこのコミットで比べられます。
      </p>
      <p>
        RadioGroup に frame="card" を足し、選択肢 1
        つずつをカードの形にします。題（label）・説明（caption）に加え、Radio の labelAside
        で値段などを右端に置けます。面・輪郭・角・hover の塗りは Card
        と同じで、カード全体が押せる範囲です。キーボードのフォーカスの線は、丸ではなくカードの外に出します。
      </p>
      <p>
        選ぶのは、選んでいるカードの見た目です。Card の
        selected（既定は淡い面＋線、線だけも選べる）とそろえる案を A・B
        に置きました。どの案でも丸は残し、選んだ色で塗ります（色だけでなく形でも見分けるため）。direction・itemWidth
        と組み合わせられます。
      </p>
    </Comparison>
  ),
};
