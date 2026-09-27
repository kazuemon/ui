import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Stepper, type StepperVariant, StepperStep } from '../../src/components/stepper/Stepper';

// 軸 340: Stepper の完了した段のマーカー（数字のまま色だけ変える／チェックの印に差し替える）
//   Stepper を作ったとき、完了した段のマーカーをどう見せるかは「原則にない判断」として variant props（number・check）に仮置きした
//   候補は Stepper の variant をそのまま並べる。部品のコードは候補ごとに分けない（ButtonGroup の frame 軸 0323 と同じやり方）
const steps = [
  { value: 'account', label: 'アカウント' },
  { value: 'address', label: 'お届け先' },
  { value: 'payment', label: 'お支払い' },
  { value: 'confirm', label: '確認' },
];

const candidates: (Candidate & { variant: StepperVariant })[] = [
  {
    id: 'current',
    name: 'number（数字のまま色だけ変える）',
    intent:
      '完了した段も、これからの段と同じ数字のまま、色だけ部品の色に変える。並びのどの位置か（何段目か）が最後まで読み取れる',
    spec: [
      ['variant', 'number'],
      ['完了した段の中身', '数字（色は部品の色）'],
    ],
    variant: 'number',
  },
  {
    id: 'A',
    name: 'check（チェックの印に差し替える）',
    intent:
      '完了した段はチェックの印に差し替え、「済んだ」ことを形でも伝える。段の数が多いとき、どこまで済んだかが一目で分かる。段の番号は完了すると見えなくなる',
    spec: [
      ['variant', 'check'],
      ['完了した段の中身', 'チェックの印'],
    ],
    variant: 'check',
  },
];

const columns: Column[] = [
  { label: '通常（3段目がいまの段）' },
  {
    label: 'エラー（2段目）',
    note: '位置に関わらず danger の印（invalid）。variant の影響を受けない',
  },
];

function renderCell(column: Column, candidate: Candidate) {
  const variant = candidates.find((c) => c.id === candidate.id)?.variant ?? 'number';
  return (
    <Stepper variant={variant} defaultValue="payment" accessibleName="購入手続き">
      {steps.map((step) => (
        <StepperStep
          key={step.value}
          {...step}
          invalid={column.label.includes('エラー') && step.value === 'address'}
        />
      ))}
    </Stepper>
  );
}

const meta = {
  title: 'Design Review/340 Stepperのマーカー',
  id: 'design-review-340-stepper-marker-variant',
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
      index={340}
      axis="Stepperのマーカー"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={renderCell}
    >
      <p>
        完了した段のマーカーをどう見せるかを決めます。number は数字のまま色だけ変え、check
        はチェックの印に差し替えます。いまの段・これからの段の見た目は、どちらの案でも変わりません（いまの段は塗り、これからの段は輪郭）。
      </p>
      <p>
        エラーの段（invalid）は、位置に関わらず danger
        の色と丸の「!」にします（原則6）。この見た目は variant の影響を受けません。
      </p>
      <p>どちらを既定にするか、両方選べるようにしたい場合はあわせて教えてください。</p>
    </Comparison>
  ),
};
