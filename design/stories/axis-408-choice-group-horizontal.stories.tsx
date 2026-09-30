import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Checkbox } from '../../src/components/checkbox/Checkbox';
import { CheckboxGroup } from '../../src/components/checkbox/CheckboxGroup';
import { Radio, RadioGroup } from '../../src/components/radio/Radio';

// 軸 408: RadioGroup・CheckboxGroup の選択肢を横に並べる（direction="horizontal"）
const meta = {
  title: 'Design Review/408 選択肢を横に並べる',
  id: 'design-review-408-choice-group-horizontal',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
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
    name: '縦に積む（横にはできない）',
    intent: 'いまの見た目。direction がないので、2 択でも縦に積む。比べるための基準',
    spec: [
      ['向き', '縦だけ'],
      ['間', '行の上下の余白だけ'],
    ],
    tokens: {
      '--choice-group-display': 'flex',
      '--choice-group-wrap': 'wrap',
      '--choice-group-gap-x': 'calc(var(--spacing) * 6)',
      '--choice-group-item-max': 'none',
      '--choice-group-narrow-direction': 'column',
      '--choice-group-narrow-columns': '1fr',
    },
  },
  {
    id: 'A',
    name: '自然な幅・広めの間・狭いと縦に戻す',
    intent:
      '選択肢はそれぞれ文字の幅のまま並べ、あいだを 24px 空ける。入りきらないと折り返す。入れ物が 24rem 未満のときは縦に戻す',
    spec: [
      ['並べ方', '自然な幅（flex）'],
      ['間', '24px'],
      ['折り返し', 'する'],
      ['説明文の項目', '幅の上限なし'],
      ['狭いとき', '縦に戻す'],
    ],
    tokens: {
      '--choice-group-display': 'flex',
      '--choice-group-wrap': 'wrap',
      '--choice-group-gap-x': 'calc(var(--spacing) * 6)',
      '--choice-group-item-max': 'none',
      '--choice-group-narrow-direction': 'column',
      '--choice-group-narrow-columns': '1fr',
    },
  },
  {
    id: 'B',
    name: '自然な幅・詰めた間・狭くても横のまま',
    intent:
      '間を 16px に詰め、狭い入れ物でも縦に戻さず折り返すだけにする。「はい／いいえ」が狭い画面でも 1 行に収まる',
    spec: [
      ['並べ方', '自然な幅（flex）'],
      ['間', '16px'],
      ['折り返し', 'する'],
      ['説明文の項目', '幅の上限なし'],
      ['狭いとき', '横のまま（折り返す）'],
    ],
    tokens: {
      '--choice-group-display': 'flex',
      '--choice-group-wrap': 'wrap',
      '--choice-group-gap-x': 'calc(var(--spacing) * 4)',
      '--choice-group-item-max': 'none',
      '--choice-group-narrow-direction': 'row',
      '--choice-group-narrow-columns': 'var(--choice-group-columns)',
    },
  },
  {
    id: 'C',
    name: '同じ幅の列',
    intent:
      '選択肢を同じ幅（いちばん狭くて 160px）の列にそろえる。折り返した行でも縦の位置がそろい、表のように読める。狭いときは 1 列',
    spec: [
      ['並べ方', '同じ幅の列（grid・最小 160px）'],
      ['間', '24px'],
      ['折り返し', '列ごと'],
      ['説明文の項目', '列の幅で折り返す'],
      ['狭いとき', '縦に戻す'],
    ],
    tokens: {
      '--choice-group-display': 'grid',
      '--choice-group-wrap': 'wrap',
      '--choice-group-gap-x': 'calc(var(--spacing) * 6)',
      '--choice-group-column-min': 'calc(var(--spacing) * 40)',
      '--choice-group-item-max': 'none',
      '--choice-group-narrow-direction': 'column',
      '--choice-group-narrow-columns': '1fr',
    },
  },
  {
    id: 'D',
    name: '自然な幅・さらに広い間・説明文の項目は幅を抑える',
    intent:
      'A より間を広げ（32px）、説明文を持つ選択肢は 16rem で折り返す。説明の長い選択肢が 1 つだけ横に伸びない',
    spec: [
      ['並べ方', '自然な幅（flex）'],
      ['間', '32px'],
      ['折り返し', 'する'],
      ['説明文の項目', '16rem まで'],
      ['狭いとき', '縦に戻す'],
    ],
    tokens: {
      '--choice-group-display': 'flex',
      '--choice-group-wrap': 'wrap',
      '--choice-group-gap-x': 'calc(var(--spacing) * 8)',
      '--choice-group-item-max': '16rem',
      '--choice-group-narrow-direction': 'column',
      '--choice-group-narrow-columns': '1fr',
    },
  },
];

const columns: Column[] = [
  { label: '2 択', note: 'はい／いいえ' },
  { label: '3 択', note: '短い選択肢' },
  { label: '説明文つき', note: '選択肢に 2 行目がある' },
  { label: '多い', note: 'CheckboxGroup・入りきらずに折り返す' },
  { label: '狭い入れ物', note: '幅 18rem（24rem 未満）' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={408}
      axis="選択肢を横に並べる"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const direction = candidate.id === '現行版' ? 'vertical' : 'horizontal';
        switch (column.label) {
          case '2 択':
            return (
              <div className="w-[400px]">
                <RadioGroup label="メールで知らせる" defaultValue="yes" direction={direction}>
                  <Radio value="yes" label="はい" />
                  <Radio value="no" label="いいえ" />
                </RadioGroup>
              </div>
            );
          case '3 択':
            return (
              <div className="w-[400px]">
                <RadioGroup label="性別" direction={direction}>
                  <Radio value="female" label="女性" />
                  <Radio value="male" label="男性" />
                  <Radio value="none" label="回答しない" />
                </RadioGroup>
              </div>
            );
          case '説明文つき':
            return (
              <div className="w-[480px]">
                <RadioGroup label="プラン" defaultValue="free" direction={direction}>
                  <Radio value="free" label="無料" caption="月 3 件まで" />
                  <Radio
                    value="pro"
                    label="プロ"
                    caption="件数の上限なし。チームで使うときは、あとから席を足せます"
                  />
                  <Radio value="team" label="チーム" caption="10 人から" />
                </RadioGroup>
              </div>
            );
          case '多い':
            return (
              <div className="w-[400px]">
                <CheckboxGroup
                  label="来られる曜日"
                  defaultValue={['mon', 'wed']}
                  direction={direction}
                >
                  {['月', '火', '水', '木', '金', '土', '日'].map((day, i) => (
                    <Checkbox
                      key={day}
                      value={['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][i]}
                      label={`${day}曜日`}
                    />
                  ))}
                </CheckboxGroup>
              </div>
            );
          default:
            return (
              <div className="w-[18rem] rounded-card border border-dashed border-line p-2">
                <RadioGroup label="性別" direction={direction}>
                  <Radio value="female" label="女性" />
                  <Radio value="male" label="男性" />
                  <Radio value="none" label="回答しない" />
                </RadioGroup>
              </div>
            );
        }
      }}
    >
      <p>
        RadioGroup・CheckboxGroup に direction="horizontal"（Stack
        と同じ語）を足し、選択肢を横に並べます。選ぶのは、横に並べたときの並べ方（自然な幅か同じ幅の列か）・選択肢どうしの間・説明文を持つ選択肢の幅・狭い入れ物で縦に戻すか、です。
      </p>
      <p>
        既定の向きは縦のままです（横は短い選択肢のときに使う形）。候補のうち、どれを横に並べたときの既定にし、どれを選べるようにするかも教えてください。「狭い入れ物」の列は、入れ物が
        24rem 未満のときの見え方です。ツールバーの「密度」で指の寸法にしても見てください。
      </p>
    </Comparison>
  ),
};
