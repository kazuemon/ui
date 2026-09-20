import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Heading } from '../../src/components/heading/Heading';
import { HeadingAnchor } from '../../src/components/heading-anchor/HeadingAnchor';
import { statePseudo } from '../../src/stories/story-states';

// 後半の軸 201: 見出しのページ内リンク（HeadingAnchor）の印の形・色・大きさ
//   形は mark で行ごとに変える（鎖は link、井げたは hash）。色と大きさは tokens の上書きだけ
//   印を見比べるので、どの行も reveal="always" で、ふだんから見せる（現れ方は軸 200）
//   印は文字の仲間（原則 21）。大きさは見出しの文字に比例し、線は細い

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '鎖・灰色・0.9em（推奨・既定）',
    intent:
      '「リンク」と分かる鎖の印を、見出しの文字より少し小さく置く。ふだんは控えめな灰色で、hover とフォーカスで Primary になる。見出しの文字を邪魔せず、押せるものと分かる。',
    spec: [
      ['形', '鎖（LinkSimpleHorizontal。線は Regular）'],
      ['大きさ', '0.9em（--heading-anchor-icon-size）'],
      ['色', '--color-fg-subtle（白地 4.52）'],
      ['hover・フォーカス', '--color-primary'],
    ],
  },
  {
    id: 'A',
    name: '井げた（#）',
    intent:
      '文書の見出しの印としてなじみのある井げた。「この見出しへ」の印として、Markdown やドキュメントで見慣れている。鎖より軽く見えるが、リンクとは限らず、ただの記号にも見える。',
    spec: [
      ['形', '井げた（Hash。線は Regular）'],
      ['大きさ・色', '現行版と同じ'],
    ],
  },
  {
    id: 'B',
    name: '鎖・Primary をふだんから',
    intent:
      '印の色をふだんから Primary にする。記事の中のリンクと同じ色で、押せることがはっきり分かる。見出しごとに青い印が並ぶので、いつも見せる形（軸 200 の A・C）ではやや主張が強い。',
    spec: [
      ['形・大きさ', '現行版と同じ'],
      ['色', 'ふだんも hover も --color-primary'],
      ['上書き', '--heading-anchor-color: var(--color-primary)'],
    ],
  },
  {
    id: 'C',
    name: '鎖・1.1em',
    intent:
      '印を見出しの文字より少し大きくする。見つけやすく、押せる範囲も少し広がる。見出しが大きい 1 段目・2 段目では、印だけが目立つ。',
    spec: [
      ['形・色', '現行版と同じ'],
      ['大きさ', '1.1em'],
      ['上書き', '--heading-anchor-icon-size: 1.1em'],
    ],
  },
];

const tokens: Record<string, Candidate['tokens']> = {
  B: {
    '--heading-anchor-color': 'var(--color-primary)',
  },
  C: { '--heading-anchor-icon-size': '1.1em' },
};
for (const candidate of candidates) candidate.tokens = tokens[candidate.id];

const columns: Column[] = [
  { label: '通常' },
  { label: '印に hover', note: '印にマウスを載せた', preview: 'hover' },
  { label: 'フォーカス（キーボード）', preview: 'focus' },
];

function Sample({ id }: { id: string }) {
  const mark = id === 'A' ? 'hash' : 'link';
  return (
    <div className="flex max-w-[20rem] min-w-0 flex-col gap-2" data-reading="">
      <Heading level={1}>
        使い方
        <HeadingAnchor href="#sample" reveal="always" mark={mark} />
      </Heading>
      <Heading level={2}>
        インストール
        <HeadingAnchor href="#sample" reveal="always" mark={mark} />
      </Heading>
      <Heading level={3}>
        設定
        <HeadingAnchor href="#sample" reveal="always" mark={mark} />
      </Heading>
    </div>
  );
}

const meta = {
  title: 'Design Review/201 見出しのページ内リンクの印',
  id: 'design-review-201-heading-anchor-mark',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({
      hover: 'a[data-slot="heading-anchor"]',
      focusVisible: 'a[data-slot="heading-anchor"]',
    }),
  },
  args: { pick: 'current' },
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
      index={201}
      axis="見出しのページ内リンクの印"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(_column, candidate) => <Sample id={candidate.id} />}
    >
      <p>決定: 現行版（鎖・灰色・0.9em）を既定にし、井げた（A）も mark で選べます。</p>
      <p>
        印の形（鎖か井げたか）、色、大きさを選びます。どの行も印をふだんから見せているので、現れ方は軸
        200 で選びます。
      </p>
      <p>
        既定を 1
        つ決め、ほかは選べる形にできます。推奨は現行版です。印は文字の仲間なので、文字より少し小さく、線は細く（原則
        21）、色は控えめにして見出しの文字を先に読ませます（原則 19）。井げた（A）は mark="hash"
        で選べます。
      </p>
      <p>どれを既定にするか、ほかに選べるようにしたい案があれば教えてください。</p>
    </Comparison>
  ),
};
