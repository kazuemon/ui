import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Meter } from '../../src/components/meter/Meter';

// 後半の軸 163: Meter の low・high・optimum による塗りの色
//   値のある範囲を、最適（optimum）・隣の範囲（suboptimum）・反対の端（even-less-good）の 3 つに分け（HTML の meter と同じ）、それぞれの塗りを決める
//   候補は --color-meter-optimum・--color-meter-suboptimum・--color-meter-even-less-good の上書きだけで作る
//   initial は「部品の色のまま」（部品が var(--…, 部品の色) で読む）

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '最適は部品の色、外れると警告・危険',
    intent:
      '最適の範囲では、選んだ色（青・ピンク・グレー）のまま。隣の範囲は警告のオリーブ、反対の端は危険の赤。問題のないときは、ほかの Meter と同じ色に見える。',
    spec: [
      ['最適', '部品の色'],
      ['隣の範囲', '警告（オリーブ。fg-warning）'],
      ['反対の端', '危険（赤）'],
    ],
    tokens: {
      '--color-meter-optimum': 'initial',
      '--color-meter-suboptimum': 'var(--color-fg-warning)',
      '--color-meter-even-less-good': 'var(--color-danger)',
    },
  },
  {
    id: 'A',
    name: '信号の 3 色',
    intent:
      '最適を成功の緑にして、緑・オリーブ・赤の 3 色で見せる。よい状態であることも色で伝わる。代わりに、選んだ部品の色は範囲を渡すと出なくなる。',
    spec: [
      ['最適', '成功（緑）'],
      ['隣の範囲', '警告（オリーブ）'],
      ['反対の端', '危険（赤）'],
    ],
    tokens: {
      '--color-meter-optimum': 'var(--color-success)',
      '--color-meter-suboptimum': 'var(--color-fg-warning)',
      '--color-meter-even-less-good': 'var(--color-danger)',
    },
  },
  {
    id: 'B',
    name: '反対の端だけ危険の色',
    intent:
      '隣の範囲までは部品の色のままにし、反対の端（容量がほぼいっぱい、バッテリーがほぼ空）だけを赤にする。色が変わる場面が少なく、変わったときに目立つ。',
    spec: [
      ['最適', '部品の色'],
      ['隣の範囲', '部品の色'],
      ['反対の端', '危険（赤）'],
    ],
    tokens: {
      '--color-meter-optimum': 'initial',
      '--color-meter-suboptimum': 'initial',
      '--color-meter-even-less-good': 'var(--color-danger)',
    },
  },
  {
    id: 'C',
    name: '警告は黄色の塗り',
    intent:
      '現行版の隣の範囲を、お知らせや Badge の数と同じ黄色の塗りにする。オリーブより警告らしく見える。白地との差は小さく（1.2:1）、地のグレーの上では端が見えにくい。',
    spec: [
      ['最適', '部品の色'],
      ['隣の範囲', '警告（黄色。warning）'],
      ['反対の端', '危険（赤）'],
    ],
    tokens: {
      '--color-meter-optimum': 'initial',
      '--color-meter-suboptimum': 'var(--color-warning)',
      '--color-meter-even-less-good': 'var(--color-danger)',
    },
  },
];

// ストレージ（少ないほどよい）: low 60・high 85・optimum 0
const storage = { low: 60, high: 85, optimum: 0, max: 100 } as const;

const columns: Column[] = [
  { label: '最適（40%）', note: 'ストレージ。60% 未満' },
  { label: '隣の範囲（72%）', note: '60〜85%' },
  { label: '反対の端（93%）', note: '85% を超える' },
  { label: '最適・グレー', note: '色を指定しないとき' },
  { label: '反対の端・グレー' },
  { label: 'バッテリー（最適は多いほう）', note: 'low 20・high 50・optimum 100' },
];

function renderCell(column: Column) {
  const body = (() => {
    switch (column.label) {
      case '隣の範囲（72%）':
        return <Meter label="ストレージ" value={72} color="primary" {...storage} />;
      case '反対の端（93%）':
        return (
          <Meter
            label="ストレージ"
            value={93}
            color="primary"
            caption="85% を超えると保存できなくなります"
            {...storage}
          />
        );
      case '最適・グレー':
        return <Meter label="ストレージ" value={40} {...storage} />;
      case '反対の端・グレー':
        return <Meter label="ストレージ" value={93} {...storage} />;
      case 'バッテリー（最適は多いほう）':
        return (
          <div className="flex flex-col gap-4">
            {[80, 35, 10].map((value) => (
              <Meter
                key={value}
                label="バッテリー"
                value={value}
                low={20}
                high={50}
                optimum={100}
                color="primary"
              />
            ))}
          </div>
        );
      default:
        return <Meter label="ストレージ" value={40} color="primary" {...storage} />;
    }
  })();
  return <div className="w-[240px]">{body}</div>;
}

const meta = {
  title: 'Design Review/163 Meter の範囲による色',
  id: 'design-review-163-meter-region',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={163}
      axis="Meter の範囲（low・high・optimum）による塗りの色"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => renderCell(column)}
    >
      <p>
        Meter に low・high・optimum を渡すと、値がどの範囲にあるかで塗りの色を変えます（HTML の
        meter と同じ規則）。optimum
        のある範囲が「最適」、その隣が「隣の範囲」、反対の端が「反対の端」です。範囲を渡さない Meter
        は、いつも部品の色です。
      </p>
      <p>
        色だけでなく、値の文字（数）でも読めます。範囲の意味は、使う側がキャプションで書きます。左の
        3 列は青（primary）、その右の 2 列はグレー（色を指定しないとき）です。
      </p>
      <p>どれを既定にするか、ほかに選べるようにしたい案があれば教えてください。</p>
    </Comparison>
  ),
};
