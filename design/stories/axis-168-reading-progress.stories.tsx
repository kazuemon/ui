import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { ReadingScene } from '../../src/components/progress/reading-scene';

// 後半の軸 168: 記事の読了のバーの太さ・地・角
//   読了のバーは、ラベルを持たない細い Progress（size="sm"）を Affix で上端に留めた使い方
//   候補は --bar-height-sm・--bar-track・--bar-radius の上書きだけで作る（行の中の Progress だけに効く）
//   読んだ割合は 40% に固定して描く（枠はスクロールでき、スクロールしても割合は変わらない）

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'Progress の sm のまま',
    intent:
      '4px の pill に、トグルの OFF と同じグレーの地。部品の Progress をそのまま置いた形で、残りの長さも見える。画面の端に丸い角が付く。',
    spec: [
      ['太さ', '4px（sm）'],
      ['地', 'トグルの OFF と同じグレー'],
      ['角', 'pill'],
    ],
    tokens: {
      '--bar-height-sm': 'var(--spacing)',
      '--bar-track': 'var(--color-field-addon)',
      '--bar-radius': 'var(--radius-pill)',
    },
  },
  {
    id: 'A',
    name: '4px、地なし、角なし',
    intent:
      '地を消して、読んだ分だけの線にする。端は四角く、画面の端に接する。本文の上に帯を作らないので軽い。',
    spec: [
      ['太さ', '4px'],
      ['地', 'なし'],
      ['角', 'なし'],
    ],
    tokens: {
      '--bar-height-sm': 'var(--spacing)',
      '--bar-track': 'transparent',
      '--bar-radius': '0px',
    },
  },
  {
    id: 'B',
    name: '2px、地なし、角なし',
    intent:
      'さらに細く、ボタンの送信中の流れる線と同じ太さにする。最も控えめ。Navbar の下では、帯の線に近い細さになる。',
    spec: [
      ['太さ', '2px'],
      ['地', 'なし'],
      ['角', 'なし'],
    ],
    tokens: {
      '--bar-height-sm': 'calc(var(--spacing) * 0.5)',
      '--bar-track': 'transparent',
      '--bar-radius': '0px',
    },
  },
  {
    id: 'C',
    name: '2px、地あり、角なし',
    intent:
      'B に地を足し、残りの長さも見せる。地が上端に 1 本の線として通るので、留まった帯の境目にも見える。',
    spec: [
      ['太さ', '2px'],
      ['地', 'トグルの OFF と同じグレー'],
      ['角', 'なし'],
    ],
    tokens: {
      '--bar-height-sm': 'calc(var(--spacing) * 0.5)',
      '--bar-track': 'var(--color-field-addon)',
      '--bar-radius': '0px',
    },
  },
];

const columns: Column[] = [
  { label: 'primary', note: '上端に留めたとき' },
  { label: 'neutral', note: '色を指定しないとき' },
  { label: '貼り付けた Navbar の下', note: 'primary。帯の線のすぐ下に留める' },
];

function renderCell(column: Column) {
  switch (column.label) {
    case 'neutral':
      return <ReadingScene value={40} color="neutral" width="w-[300px]" height="h-[200px]" />;
    case '貼り付けた Navbar の下':
      return <ReadingScene value={40} navbar width="w-[300px]" height="h-[200px]" />;
    default:
      return <ReadingScene value={40} width="w-[300px]" height="h-[200px]" />;
  }
}

const meta = {
  title: 'Design Review/168 記事の読了のバー',
  id: 'design-review-168-reading-progress',
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
      index={168}
      axis="記事の読了のバーの太さ・地・角"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => renderCell(column)}
    >
      <p>
        記事の読了のバーは、ラベルを持たない細い Progress を、記事の上端（貼り付けた Navbar
        があればその下）に留める使い方です。部品は分けず、Progress の使い方の 1 つとして示します。
      </p>
      <p>
        比べるのは、バーの太さ、まだ読んでいない分（地）を見せるか、端の角です。読んだ割合は 40%
        に固定しています。
      </p>
      <p>
        どれを既定にするか教えてください。現行版以外を選んだ場合は、読了のバー向けの形を Progress
        で選べるようにします。
      </p>
    </Comparison>
  ),
};
