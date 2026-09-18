import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { LinkCardSample, linkCardPseudo } from './link-card-samples';

// 後半の軸 116: LinkCard のサイトの行（favicon・ドメイン）と、新しいタブの ↗
// 決定（ADR 未定）で、位置は sitePlacement props（top・bottom）、favicon は渡したときだけ出す（既存の favicon
// props のまま）に畳んだ。新しいタブの ↗ はこの軸では選ばず、部品はいつも出す（props にしていない）。
// そのため、この軸で比べていた「↗ を出さない」案（B）は、今の部品では現行版と同じ見た目になる

type SiteRow = { sitePlacement: 'top' | 'bottom'; showFavicon: boolean };

const rowOf: Record<string, SiteRow> = {
  現行版: { sitePlacement: 'bottom', showFavicon: true },
  A: { sitePlacement: 'top', showFavicon: true },
  B: { sitePlacement: 'bottom', showFavicon: true },
  C: { sitePlacement: 'bottom', showFavicon: false },
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '下・favicon・↗',
    intent:
      'サイトの行を説明の下に置く。題を先に読ませ、どこのページかは最後に添える。新しいタブで開くときは、文字のリンクと同じくドメインの後ろに ↗ を付ける。',
    spec: [
      ['位置', '説明の下'],
      ['favicon', '出す'],
      ['新しいタブの ↗', 'ドメインの後ろに出す'],
    ],
  },
  {
    id: 'A',
    name: '上・favicon・↗',
    intent:
      'サイトの行を題の上に置く。どこのページへ移るかを先に伝える。題の上に小さな文字が来るので、題が少し下がる。',
    spec: [
      ['位置', '題の上'],
      ['favicon', '出す'],
      ['新しいタブの ↗', 'ドメインの後ろに出す'],
    ],
  },
  {
    id: 'B',
    name: '下・favicon・↗ なし',
    intent:
      '新しいタブで開くことは読み上げだけで伝え、↗ は付けない。外のサイトへのカードはドメインで外と分かるので、印を重ねない。決定後は ↗ を props で消せないため、この行は現行版と同じ見た目になる。',
    spec: [
      ['位置', '説明の下'],
      ['favicon', '出す'],
      ['新しいタブの ↗', '（今は消せない。ドメインの後ろに出る）'],
    ],
  },
  {
    id: 'C',
    name: '下・ドメインだけ・↗',
    intent:
      'favicon を出さず、ドメインの文字だけにする。色の違うアイコンが記事の中に混ざらず静かだが、どこのサイトかは読まないと分からない。',
    spec: [
      ['位置', '説明の下'],
      ['favicon', '出さない'],
      ['新しいタブの ↗', 'ドメインの後ろに出す'],
    ],
  },
];

const columns: Column[] = [
  { label: '同じタブ', note: '幅 480px・マウス' },
  { label: '新しいタブ', note: 'target="_blank"' },
  { label: '新しいタブの hover', preview: 'hover' },
  { label: '画像なし', note: '新しいタブ' },
];

const meta = {
  title: 'Design Review/116 LinkCard のサイトの行',
  id: 'design-review-116-link-card-site',
  parameters: { layout: 'fullscreen', pseudo: linkCardPseudo },
  args: { pick: 'A' },
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
      index={116}
      axis="LinkCard のサイトの行（favicon・ドメイン）と ↗"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const { sitePlacement, showFavicon } = rowOf[candidate.id];
        switch (column.label) {
          case '同じタブ':
            return <LinkCardSample sitePlacement={sitePlacement} showFavicon={showFavicon} />;
          case '画像なし':
            return (
              <LinkCardSample
                sample="no-image-new-tab"
                sitePlacement={sitePlacement}
                showFavicon={showFavicon}
              />
            );
          default:
            return (
              <LinkCardSample
                sample="new-tab"
                sitePlacement={sitePlacement}
                showFavicon={showFavicon}
              />
            );
        }
      }}
    >
      <p>
        <strong>
          決定（ADR 未定）: A（サイトの行を題の上に置く）を既定にしました。favicon
          は渡したときだけ出します（既定では渡さないので出ません）。新しいタブの ↗
          は、文字のリンクと同じくいつも出すことにし、この軸では選べるようにしません。
        </strong>
      </p>
      <p>
        サイトの行には、favicon と href のドメイン（先頭の www.
        は外す）を小さな文字で出します。サイト内のリンクでは出しません。
      </p>
      <p>
        行の位置、favicon を出すか、新しいタブで開くときに ↗
        を付けるかを決めます。文字のリンクは新しいタブのときだけ ↗
        を付けます（原則7）。カードでも同じにするか、ドメインで外と分かるので付けないかです。読み上げの「新しいタブで開きます」は、どの案でも付けます。
      </p>
    </Comparison>
  ),
};
