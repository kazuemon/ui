import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Meter } from '../../src/components/meter/Meter';

// 後半の軸 164: Meter の regionColor="color-yellow" で、隣の範囲の黄色の塗りに輪郭を付けるか
//   黄色（--color-warning）は白地に 1.20:1、地のグレー（field-addon）に 1.07:1 で、塗りの端が見えにくい
//   候補は --meter-yellow-outline-x・--meter-yellow-outline-spread・--color-meter-yellow-outline の上書きだけで作る
//   線は塗りの内側の影（inset <x> 0 0 <spread>）で描く。塗りの長さは変わらない

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '輪郭なし',
    intent:
      '黄色の塗りだけ。塗りと地のグレーの差は 1.07:1 で、塗りがどこまで入っているかは値の文字で読む。',
    spec: [
      ['輪郭', 'なし'],
      ['塗りと地の差', '1.07:1（白地とは 1.20:1）'],
    ],
    tokens: {
      '--meter-yellow-outline-x': '0px',
      '--meter-yellow-outline-spread': '0px',
      '--color-meter-yellow-outline': 'var(--color-fg-warning)',
    },
  },
  {
    id: 'A',
    name: '内側に 1px のオリーブの輪郭',
    intent:
      '黄色の塗りの内側を、1px の警告のオリーブ（fg-warning）で囲む。塗りの形がまるごと見え、値が小さいときも点として残る。黄色の中に線が入るぶん、塗りは少し濃く見える。',
    spec: [
      ['輪郭', '内側 1px・全周・fg-warning'],
      ['輪郭と黄色の差', '4.24:1'],
      ['輪郭と地のグレーの差', '3.96:1（白地とは 5.09:1）'],
    ],
    tokens: {
      '--meter-yellow-outline-x': '0px',
      '--meter-yellow-outline-spread': '1px',
      '--color-meter-yellow-outline': 'var(--color-fg-warning)',
    },
  },
  {
    id: 'B',
    name: '塗りの右端だけにオリーブの線',
    intent:
      '輪郭は塗りの右端（値のところ）にだけ、三日月形の 1px の線として入れる。上下の縁は黄色のまま。どこまで入っているかは分かり、黄色の面の明るさはほぼそのまま。',
    spec: [
      ['輪郭', '右端だけ 1px・fg-warning'],
      ['輪郭と黄色の差', '4.24:1'],
      ['輪郭と地のグレーの差', '3.96:1'],
    ],
    tokens: {
      '--meter-yellow-outline-x': '-1px',
      '--meter-yellow-outline-spread': '0px',
      '--color-meter-yellow-outline': 'var(--color-fg-warning)',
    },
  },
];

// ストレージ（少ないほどよい）。隣の範囲（suboptimum）になるように low・high を置く
const storage = { optimum: 0, max: 100, color: 'primary', regionColor: 'color-yellow' } as const;

const columns: Column[] = [
  { label: '白地（72%）', note: 'low 60・high 85・optimum 0' },
  { label: 'グレーの面の上（72%）', note: '面は neutral（グレーのボタンと同じ塗り）' },
  { label: '値が小さい（5%）', note: 'low 3・high 85 で隣の範囲にする' },
  { label: '中ほど（50%）', note: 'low 30・high 85' },
  { label: '太さ sm（72%）' },
  { label: '太さ lg（72%）' },
];

function renderCell(column: Column) {
  const body = (() => {
    switch (column.label) {
      case 'グレーの面の上（72%）':
        return (
          <div className="rounded-lg bg-neutral p-4">
            <Meter label="ストレージ" value={72} low={60} high={85} {...storage} />
          </div>
        );
      case '値が小さい（5%）':
        return <Meter label="ストレージ" value={5} low={3} high={85} {...storage} />;
      case '中ほど（50%）':
        return <Meter label="ストレージ" value={50} low={30} high={85} {...storage} />;
      case '太さ sm（72%）':
        return <Meter label="ストレージ" value={72} low={60} high={85} size="sm" {...storage} />;
      case '太さ lg（72%）':
        return <Meter label="ストレージ" value={72} low={60} high={85} size="lg" {...storage} />;
      default:
        return <Meter label="ストレージ" value={72} low={60} high={85} {...storage} />;
    }
  })();
  return <div className="w-[240px]">{body}</div>;
}

const meta = {
  title: 'Design Review/164 Meter の黄色の塗りの輪郭',
  id: 'design-review-164-meter-yellow-outline',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
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
  render: ({ pick }) => (
    <Comparison
      index={164}
      axis='Meter の regionColor="color-yellow" で、黄色の塗りに輪郭を付けるか'
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => renderCell(column)}
    >
      <p>
        regionColor を color-yellow にすると、隣の範囲の塗りが面用の黄色になります。黄色は白地に
        1.20:1、地のグレーに 1.07:1 で、塗りがどこまで入っているかがほとんど見えません。輪郭は
        color-yellow の隣の範囲にだけ付け、ほかの色や範囲は変えません。
      </p>
      <p>
        輪郭は警告のオリーブ（fg-warning）です。黄色との差は 4.24:1、地のグレーとの差は
        3.96:1、白地との差は 5.09:1 です。どの列も 72% などの値の文字は右上に出ています。
      </p>
      <p>
        おすすめは A（全周の輪郭）を color-yellow の既定にすることです。値が 5%
        のように小さいときも塗りが点として残り、sm の細いバーでも形が読めます。B
        は右端しか線がないので、sm
        や値が小さいときに線がほとんど見えなくなります。どれを既定にするか教えてください。
      </p>
    </Comparison>
  ),
};
