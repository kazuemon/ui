import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Stepper, StepperStep } from '../../src/components/stepper/Stepper';

// 軸 464: Stepper の小さい段（size="sm"）のマーカー・ラベル・段のあいだ
const meta = {
  title: 'Design Review/464 Stepper の小さい段',
  id: 'design-review-464-stepper-size',
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
    name: '段は 1 つだけ',
    intent:
      'いまの Stepper。小さい段がなく、狭い場所でも 32px のマーカーと部品の文字のまま。この行は size を渡さずに描く',
    spec: [
      ['マーカー', '32px・数字 14px・印 16px'],
      ['ラベル', '部品の文字（マウス 16px・指 14px）'],
      ['マーカーとラベル', '12px'],
      ['段のあいだ', '32px'],
    ],
  },
  {
    id: 'A',
    name: 'マーカー 24px・ラベル 14px',
    intent:
      'マーカーを 24px（チェックボックスの箱に近い大きさ）にし、ラベルは密度によらず 14px。間も一段ずつ詰める',
    spec: [
      ['マーカー', '24px・数字 12px・印 12px'],
      ['ラベル', '14px（行 20px）'],
      ['マーカーとラベル', '8px'],
      ['段のあいだ', '24px'],
    ],
    tokens: {
      '--stepper-marker-size-sm': '24px',
      '--stepper-marker-text-sm': '12px',
      '--stepper-marker-icon-size-sm': '12px',
      '--stepper-label-text-sm': '14px',
      '--stepper-label-leading-sm': '20px',
      '--stepper-label-gap-sm': '8px',
      '--stepper-gap-sm': '24px',
    },
  },
  {
    id: 'B',
    name: 'マーカー 24px・ラベル 12px',
    intent:
      'A のラベルをキャプションの大きさ（12px）にする。横に 5〜6 段並べても収まる。説明はラベルと同じ大きさになる',
    spec: [
      ['マーカー', '24px・数字 12px・印 12px'],
      ['ラベル', '12px（行 16px）'],
      ['マーカーとラベル', '8px'],
      ['段のあいだ', '16px'],
    ],
    tokens: {
      '--stepper-marker-size-sm': '24px',
      '--stepper-marker-text-sm': '12px',
      '--stepper-marker-icon-size-sm': '12px',
      '--stepper-label-text-sm': '12px',
      '--stepper-label-leading-sm': '16px',
      '--stepper-label-gap-sm': '8px',
      '--stepper-gap-sm': '16px',
    },
  },
  {
    id: 'C',
    name: 'マーカー 20px・ラベル 14px',
    intent:
      'マーカーを 20px（部品の中のアイコンと同じ）まで小さくする。数字は 11px で、2 桁は窮屈。ラベルとの差が大きく、文が主になる',
    spec: [
      ['マーカー', '20px・数字 11px・印 12px'],
      ['ラベル', '14px（行 20px）'],
      ['マーカーとラベル', '8px'],
      ['段のあいだ', '24px'],
    ],
    tokens: {
      '--stepper-marker-size-sm': '20px',
      '--stepper-marker-text-sm': '11px',
      '--stepper-marker-icon-size-sm': '12px',
      '--stepper-label-text-sm': '14px',
      '--stepper-label-leading-sm': '20px',
      '--stepper-label-gap-sm': '8px',
      '--stepper-gap-sm': '24px',
    },
  },
  {
    id: 'D',
    name: '点だけ（10px）',
    intent:
      'マーカーを数字も印も持たない 10px の点にする。いちばん小さく収まるが、完了といまの段は点の色では分からず、ラベルの太さと線の色で見分ける',
    spec: [
      ['マーカー', '10px・数字と印なし'],
      ['ラベル', '14px（行 20px）'],
      ['マーカーとラベル', '8px'],
      ['段のあいだ', '24px'],
    ],
    tokens: {
      '--stepper-marker-size-sm': '10px',
      '--stepper-marker-text-sm': '0px',
      '--stepper-marker-icon-size-sm': '0px',
      '--stepper-label-text-sm': '14px',
      '--stepper-label-leading-sm': '20px',
      '--stepper-label-gap-sm': '8px',
      '--stepper-gap-sm': '24px',
    },
  },
];

const columns: Column[] = [
  { label: '横並び（マウス）', note: '3 段目がいまの段。ダイアログの幅（360px）' },
  { label: '横並び（指）', note: 'data-density="coarse"' },
  { label: '縦並び', note: '説明つき・エラーの段' },
];

function Steps({ candidate, orientation }: { candidate: Candidate; orientation?: 'vertical' }) {
  const size = candidate.id === '現行版' ? undefined : 'sm';
  const vertical = orientation === 'vertical';
  return (
    <Stepper value={2} size={size} color="primary" orientation={orientation}>
      <StepperStep label="アカウント" description={vertical ? 'メールとパスワード' : undefined} />
      <StepperStep label="プロフィール" description={vertical ? '名前と画像' : undefined} />
      <StepperStep label="支払い" description={vertical ? 'カードを登録' : undefined} />
      <StepperStep label="確認" invalid={vertical} />
      {!vertical && <StepperStep label="完了" />}
    </Stepper>
  );
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={464}
      axis="Stepper の小さい段"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        switch (column.label) {
          case '横並び（マウス）':
            return (
              <div data-density="fine" className="w-[360px]">
                <Steps candidate={candidate} />
              </div>
            );
          case '横並び（指）':
            return (
              <div data-density="coarse" className="w-[360px]">
                <Steps candidate={candidate} />
              </div>
            );
          default:
            return <Steps candidate={candidate} orientation="vertical" />;
        }
      }}
    >
      <p>
        Stepper に大きさ（size）を足しました。sm
        はマーカー・ラベル・段のあいだを一段小さくします。ダイアログやサイドバーのような狭い場所に置くときに使います。
        段は押すものではないので（押せる段もボタンの高さを持たない）、密度では変えません。
      </p>
      <p>選ぶのは、マーカーの大きさとラベルの大きさ、段のあいだです。</p>
    </Comparison>
  ),
};
