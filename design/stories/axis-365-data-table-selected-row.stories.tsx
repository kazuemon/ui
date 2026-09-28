import type { Meta, StoryObj } from '@storybook/react-vite';

import type { ChoiceColor } from '../../src/components/checkbox/Checkbox';
import { statePseudo } from '../../src/stories/story-states';
import { type Candidate, type Column, Comparison } from './Comparison';
import { SampleTable } from './data-table-frame';

// 後半の軸 365: DataTable の選んだ行の面
//   選んだ行の面は、選ぶ箱と同じ色（DataTable の color）の淡い面（原則6: 選んでいることの印は部品の色に従う）
// 決定: 既定は現行版（neutral・Select の選んだ項目と同じグレー）。color="primary" で B、color="secondary" で C の面になる。A は採らない
//   決めたあとは、A だけ部品の --data-table-row-selected をクラスで上書きして再現する
//   ここで比べるのは、既定の color と、neutral のときの面の濃さ。行に載せたときの面（入力欄の塗り）より濃くして、載せただけの行と見分ける

const colorOf: Record<string, ChoiceColor> = {
  現行版: 'neutral',
  A: 'neutral',
  B: 'primary',
  C: 'secondary',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'グレー（Select の選んだ項目と同じ）',
    intent:
      '色を持たない既定（neutral）。面は Select の選んだ項目・木のいまいる行と同じグレー。箱は濃いグレー。',
    spec: [
      ['color の既定', 'neutral'],
      ['面', '--color-select-neutral-selected（gray-200）'],
    ],
  },
  {
    id: 'A',
    name: '淡いグレー',
    intent:
      '現行版より一段淡いグレー。行が並んでも重くならない。載せたときの面（入力欄の塗り）との差は小さくなる。',
    spec: [
      ['color の既定', 'neutral'],
      ['面', '--color-neutral（gray-100）'],
    ],
  },
  {
    id: 'B',
    name: '淡い青（primary を既定に）',
    intent:
      '既定の color を primary にする。箱は青、面は淡い青。選んだ行が、載せた行とも本文とも色相で分かれる。',
    spec: [
      ['color の既定', 'primary'],
      ['面', '--color-primary-subtle'],
    ],
  },
  {
    id: 'C',
    name: '淡いピンク（secondary）',
    intent: '参考。color="secondary" を渡したときの見え方。既定の候補ではない。',
    spec: [
      ['color', 'secondary'],
      ['面', '--color-secondary-subtle'],
    ],
  },
];

const columns: Column[] = [
  { label: '2 行を選んでいる' },
  {
    label: '選んだ行（2 行目）に載せたとき',
    preview: 'hover',
    note: '4 行目は選んでいない行に載せた面',
  },
];

const meta = {
  title: 'Design Review/365 DataTable（選んだ行の面）',
  id: 'design-review-365-data-table-selected-row',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({
      hover: '[data-slot="data-table-row"]:is(:nth-child(2), :nth-child(4))',
    }),
  },
  args: { pick: 'current,B,C' },
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

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={365}
      axis="DataTable（選んだ行の面）"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(_, candidate) => (
        <SampleTable
          color={colorOf[candidate.id]}
          selected={['A-1025', 'A-1026']}
          className={
            candidate.id === 'A' ? '[--data-table-row-selected:var(--color-neutral)]' : undefined
          }
        />
      )}
    >
      <p>
        <strong className="text-fg">
          決定: 既定は現行版（グレー）。color="primary" なら B、color="secondary" なら C の面になる
        </strong>
        。選ぶ列の箱で選んだ行には、面を敷きます。面は箱と同じ色（DataTable の
        color）の淡い面です。ここで決めるのは、既定の色と、色を持たないとき（neutral）の面の濃さです。
      </p>
      <p>
        行に載せると、入力欄の塗りと同じ淡いグレーを敷きます。選んだ行は、それより濃いか、色相の違う面にして見分けます。選んだ行に載せたときは、面に本文の色を少し混ぜて濃くします。
      </p>
      <p>
        どれを既定にするかを一言添えてください。primary・secondary は color でいつでも選べます。
      </p>
    </Comparison>
  ),
};
