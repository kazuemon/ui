import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Meter } from '../../src/components/meter/Meter';
import { Progress } from '../../src/components/progress/Progress';

// 軸 432: Progress・Meter の状態の色（color="success"・"danger"）。塗り・地・値の文字の色
const meta = {
  title: 'Design Review/432 バーの成功・失敗の色',
  id: 'design-review-432-bar-status-color',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'B,A,C' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['B,A,C', '', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const grey = {
  '--bar-success-track': 'var(--color-field-addon)',
  '--bar-danger-track': 'var(--color-field-addon)',
};
const mutedValue = {
  '--bar-success-value': 'var(--color-fg-muted)',
  '--bar-danger-value': 'var(--color-fg-muted)',
};
const statusFill = {
  '--bar-success-fill': 'var(--color-success)',
  '--bar-danger-fill': 'var(--color-danger)',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '状態の色なし',
    intent:
      'いまの Progress・Meter。success・danger を選べないので、失敗しても濃いグレー（色を指定しないときの色）のまま。比べるための基準',
    spec: [
      ['塗り', '濃いグレー'],
      ['地', 'グレー'],
      ['値の文字', '一段淡い色'],
    ],
    tokens: {
      '--bar-success-fill': 'var(--color-neutral-strong)',
      '--bar-danger-fill': 'var(--color-neutral-strong)',
      ...grey,
      ...mutedValue,
    },
  },
  {
    id: 'A',
    name: '塗りだけ状態の色',
    intent:
      '塗りを成功の緑・危険の赤にする。Meter の範囲の色（最適の緑・反対の端の赤）と同じ値。地と値の文字はほかの色と同じ',
    spec: [
      ['塗り', '成功の緑・危険の赤'],
      ['地', 'グレー'],
      ['値の文字', '一段淡い色'],
    ],
    tokens: { ...statusFill, ...grey, ...mutedValue },
  },
  {
    id: 'B',
    name: '塗り＋淡い色の地',
    intent:
      'A に加えて、地をタグ・お知らせと同じ淡い面（成功・危険の subtle）にする。残りの分まで色がつき、バー全体が状態を持つ',
    spec: [
      ['塗り', '成功の緑・危険の赤'],
      ['地', '同じ色相の淡い面'],
      ['値の文字', '一段淡い色'],
    ],
    tokens: {
      ...statusFill,
      '--bar-success-track': 'var(--color-success-subtle)',
      '--bar-danger-track': 'var(--color-danger-subtle)',
      ...mutedValue,
    },
  },
  {
    id: 'C',
    name: '塗り＋値の文字も状態の色',
    intent:
      'A に加えて、ラベルの行の右端の値の文字を、白地の文字用の状態の色にする。地はグレーのまま。数字を見ただけで失敗が分かる',
    spec: [
      ['塗り', '成功の緑・危険の赤'],
      ['地', 'グレー'],
      ['値の文字', '白地の文字用の状態の色'],
    ],
    tokens: {
      ...statusFill,
      ...grey,
      '--bar-success-value': 'var(--color-fg-success)',
      '--bar-danger-value': 'var(--color-fg-danger)',
    },
  },
];

const columns: Column[] = [
  { label: 'アップロードに失敗', note: 'Progress・danger・60%' },
  { label: 'アップロードが終わった', note: 'Progress・success・100%' },
  { label: '上限を超えた', note: 'Meter・danger・96%' },
  { label: '細い・太い', note: 'sm・lg、danger と success' },
  { label: 'ピンクと並べる', note: 'secondary と danger' },
  { label: '終わりが分からない', note: 'danger（再送中など）' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={432}
      axis="バーの成功・失敗の色"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => {
        switch (column.label) {
          case 'アップロードに失敗':
            return (
              <div className="w-[260px]">
                <Progress
                  label="photo.png"
                  value={60}
                  color="danger"
                  caption="通信が切れたため、アップロードできませんでした"
                />
              </div>
            );
          case 'アップロードが終わった':
            return (
              <div className="w-[260px]">
                <Progress
                  label="photo.png"
                  value={100}
                  color="success"
                  caption="アップロードしました"
                />
              </div>
            );
          case '上限を超えた':
            return (
              <div className="w-[260px]">
                <Meter
                  label="ストレージ"
                  value={96}
                  color="danger"
                  getValueText={(_, v) => `${(v * 0.64).toFixed(1)} / 64 GB`}
                  caption="残りが少なくなっています"
                />
              </div>
            );
          case '細い・太い':
            return (
              <div className="flex w-[260px] flex-col gap-4">
                <Progress aria-label="細い・失敗" value={40} color="danger" size="sm" hideValue />
                <Progress aria-label="細い・成功" value={100} color="success" size="sm" hideValue />
                <Meter aria-label="太い・失敗" value={80} color="danger" size="lg" hideValue />
                <Meter aria-label="太い・成功" value={70} color="success" size="lg" hideValue />
              </div>
            );
          case 'ピンクと並べる':
            return (
              <div className="flex w-[260px] flex-col gap-4">
                <Meter label="secondary" value={70} color="secondary" />
                <Meter label="danger" value={70} color="danger" />
              </div>
            );
          default:
            return (
              <div className="w-[260px]">
                <Progress label="もう一度送っています" value={null} color="danger" />
              </div>
            );
        }
      }}
    >
      <p>
        決定: 既定は B（塗りを状態の色にし、地も同じ色相の淡い面にする）。地を淡くしない A
        も選べ、値の文字を状態の色にする C の形も選べるようにする。ユーザーの返事「B で、A
        にもできて、値の文字も状態の色に変更できると良さそうですね。」
      </p>
      <p>
        Progress・Meter の color に success（うまくいった）と
        danger（失敗した・上限を超えた）を足しました。 警告と情報は足していません（Meter
        の範囲の色で警告は出せます）。
      </p>
      <p>
        選ぶのは、状態の色をどこまで持たせるか（塗りだけ・地も淡い色・値の文字も色）です。色だけで伝わらないよう、失敗の理由はキャプションに書く前提です。どれを既定にするかも教えてください。
      </p>
    </Comparison>
  ),
};
