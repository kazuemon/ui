import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { LinkCardSample, linkCardPseudo } from './link-card-samples';

// 後半の軸 115: LinkCard の画像の位置
// 決定（ADR 未定）で、並びは LinkCard の layout props（end・start・top）に畳んだ。ここでは props で行ごとに切り替える
// C（正方形の画像）だけは、幅と比が今も部品のトークン（--link-card-media-width・--link-card-media-aspect）なので、そちらを上書きする

type Layout = 'end' | 'start' | 'top';

const layoutOf: Record<string, Layout> = {
  現行版: 'end',
  A: 'start',
  B: 'top',
  C: 'end',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '文が左・画像が右',
    intent:
      'Zenn や Notion のブックマークと同じ並び。文を先に読ませ、画像は右で添える。画像は OG 画像の比（1.91:1）を最小の高さにし、文が長いと縦に伸びて左右を切る。',
    spec: [
      ['並び', '文 → 画像（横）'],
      ['画像の幅', 'カードの幅の 36%（最大 192px）'],
      ['画像の比', '1.91:1 を最小の高さに'],
    ],
  },
  {
    id: 'A',
    name: '画像が左・文が右',
    intent:
      '画像を先に見せ、どのページへのリンクかを絵で先に伝える。文の頭は画像の幅だけ右へ下がり、記事の本文の左端とそろわない。',
    spec: [
      ['並び', '画像 → 文（横）'],
      ['画像の幅', 'カードの幅の 36%（最大 192px）'],
      ['画像の比', '1.91:1 を最小の高さに'],
    ],
  },
  {
    id: 'B',
    name: '画像が上',
    intent:
      'Card と同じ縦の並び。OG 画像を切らずに大きく見せる。記事の中では高さを取り、本文の流れを大きく切る。',
    spec: [
      ['並び', '画像 → 文（縦）'],
      ['画像の幅', 'カードの幅いっぱい'],
      ['画像の比', '1.91:1'],
    ],
  },
  {
    id: 'C',
    name: '文が左・小さい正方形の画像',
    intent:
      '画像を小さな正方形のサムネイルにする。文の幅を広く取れる。OG 画像は左右を大きく切るので、題の文字が入った画像は読めなくなる。',
    spec: [
      ['並び', '文 → 画像（横）'],
      ['画像の幅', '112px'],
      ['画像の比', '1:1 を最小の高さに'],
    ],
    tokens: {
      '--link-card-media-width': 'calc(var(--spacing) * 28)',
      '--link-card-media-aspect': '1 / 1',
    },
  },
];

const columns: Column[] = [
  { label: '記事の幅', note: '幅 480px・マウス' },
  { label: 'hover', note: '面・輪郭・画像が変わる', preview: 'hover' },
  { label: '長い題と説明', note: '2 行で切る' },
  { label: 'スマートフォン', note: '幅 343px・指' },
];

const meta = {
  title: 'Design Review/115 LinkCard の画像の位置',
  id: 'design-review-115-link-card-layout',
  parameters: { layout: 'fullscreen', pseudo: linkCardPseudo },
  args: { pick: 'current,A,B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'current,A,B'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={115}
      axis="LinkCard の画像の位置"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const layout = layoutOf[candidate.id];
        switch (column.label) {
          case '長い題と説明':
            return <LinkCardSample sample="long" layout={layout} />;
          case 'スマートフォン':
            return <LinkCardSample width="phone" layout={layout} />;
          default:
            return <LinkCardSample layout={layout} />;
        }
      }}
    >
      <p>
        <strong>
          決定（ADR 未定）: 現行版（文が左・画像が右）を既定にし、A（画像が左）・B（画像が上）も
          layout props で選べるようにしました。C（小さい正方形の画像）は採りません。
        </strong>
      </p>
      <p>
        記事の中から別のページへ移るカードです。題・説明・サイト（favicon とドメイン）・画像（OG
        画像）を並べ、カード全体が 1 つのリンクになります。面・角・輪郭・hover
        はカードと同じです（原則 1・3・5）。
      </p>
      <p>
        画像をどこに置くかを決めます。横に並べると記事の流れを切らずに済み、上に置くと OG
        画像を切らずに大きく見せられます。画像がないときは、どの案でも文だけのカードになります。
      </p>
    </Comparison>
  ),
};
