import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  Stepper,
  type StepperOrientation,
  StepperStep,
} from '../../src/components/stepper/Stepper';

// 軸 341: Stepper を並べる向きの既定（横並び・縦並び）
//   Stepper を作ったとき、既定の向きは「原則にない判断」として horizontal に仮置きした（orientation props で選べる）
//   候補は Stepper の orientation をそのまま並べる。部品のコードは候補ごとに分けない
//   横並びは、狭い画面や説明（description）が長い段では文字が詰まりやすい。縦並びは、画面の縦を多く使う代わりに説明を置く余白がある
const steps = [
  { value: 'account', label: 'アカウント', description: 'メールアドレスとパスワード' },
  { value: 'address', label: 'お届け先' },
  { value: 'payment', label: 'お支払い' },
  { value: 'confirm', label: '確認' },
];

const candidates: (Candidate & { orientation: StepperOrientation })[] = [
  {
    id: 'current',
    name: 'horizontal（横並び）',
    intent:
      'マーカーを上、ラベルを下に置き、横一列に並べる。ウィザードの上部に置く、いちばん見慣れた形。段が多い・説明が長いと、列ごとの幅が窮屈になる',
    spec: [
      ['orientation', 'horizontal'],
      ['ラベルの位置', 'マーカーの下・中央そろえ'],
    ],
    orientation: 'horizontal',
  },
  {
    id: 'A',
    name: 'vertical（縦並び）',
    intent:
      'マーカーを左、ラベルと説明を右に置き、縦に積む。サイドバーに置く、説明が長い段に向く。画面の縦を多く使う',
    spec: [
      ['orientation', 'vertical'],
      ['ラベルの位置', 'マーカーの右'],
    ],
    orientation: 'vertical',
  },
];

const columns: Column[] = [
  { label: '広い幅（480px）' },
  { label: '狭い幅（280px）', note: '横並びは列が窮屈になりやすい' },
];

function renderCell(column: Column, candidate: Candidate) {
  const orientation = candidates.find((c) => c.id === candidate.id)?.orientation ?? 'horizontal';
  const width = column.label.includes('狭い') ? 280 : 480;
  return (
    <div style={{ width }}>
      <Stepper orientation={orientation} defaultValue="payment" accessibleName="購入手続き">
        {steps.map((step) => (
          <StepperStep key={step.value} {...step} />
        ))}
      </Stepper>
    </div>
  );
}

const meta = {
  title: 'Design Review/341 Stepperの向き',
  id: 'design-review-341-stepper-orientation',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;
type Story = StoryObj<{ pick: string }>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={341}
      axis="Stepperの向き"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={renderCell}
    >
      <p>
        Stepper を並べる向きの既定を決めます。horizontal
        はマーカーを上・ラベルを下に横一列で、vertical
        はマーカーを左・ラベルと説明を右に縦に積みます。どちらも `orientation`
        で選べるので、ここで決めるのは既定だけです。
      </p>
      <p>
        狭い幅の列は、横並びで段の名前が詰まったり折り返したりする様子を見るためのものです。説明（description）は縦並びの
        1 段目だけに付けて、置き場所の違いも比べられるようにしました。
      </p>
      <p>どちらを既定にするか、両方選べるようにしたい場合はあわせて教えてください。</p>
    </Comparison>
  ),
};
