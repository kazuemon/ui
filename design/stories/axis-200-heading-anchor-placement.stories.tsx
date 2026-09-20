import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Heading } from '../../src/components/heading/Heading';
import { HeadingAnchor } from '../../src/components/heading-anchor/HeadingAnchor';
import { Text } from '../../src/components/text/Text';
import { statePseudo } from '../../src/stories/story-states';

// 後半の軸 200: 見出しのページ内リンク（HeadingAnchor）を、どこに置き、いつ見せるか
//   位置は placement（end は文字の後ろ、start は左の余白へ張り出す）、見せ方は reveal（hover は見出しに hover・フォーカスで現れる、always はいつも）
//   どちらも部品の props で行ごとに変える。印・色・大きさは軸 201。指の列は、密度を指用（coarse）に固定して見る
//   指では hover がないので、reveal にかかわらずいつも見せる（--heading-anchor-touch-opacity）。ここでは、その扱いの当否も見る

type Reveal = 'hover' | 'always';
type Placement = 'end' | 'start';

const looks: Record<string, { reveal: Reveal; placement: Placement }> = {
  現行版: { reveal: 'hover', placement: 'end' },
  A: { reveal: 'always', placement: 'end' },
  B: { reveal: 'hover', placement: 'start' },
  C: { reveal: 'always', placement: 'start' },
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '文字の後ろ・hover で現れる（推奨・既定）',
    intent:
      '印は見出しの文字の後ろに置き、見出しに hover したときとフォーカスしたときだけ現す。ふだんの見出しは文字だけで軽く、押せる場所は見出しに触れたときに分かる。折り返しても、最後の行の終わりに付くだけで、文字の位置は動かない。指ではいつも見せる。',
    spec: [
      ['位置（placement）', 'end。文字の後ろ、間は 0.4em'],
      ['見せ方（reveal）', 'hover。ふだんは opacity 0、見出しに hover・フォーカスで 1'],
      ['Tab', '隠しているあいだも止まる。止まると現れる'],
      ['指', 'いつも見せる（--heading-anchor-touch-opacity: 1）'],
      ['動き', 'opacity を 100ms（--duration-fast）'],
    ],
  },
  {
    id: 'A',
    name: '文字の後ろ・いつも見せる',
    intent:
      '印をふだんから、控えめな灰色で見せる。押せることが最初から分かり、指と同じ見え方になる。見出しが多い文書では、どの見出しにも印が並んで、読みの流れに少しうるさい。',
    spec: [
      ['位置（placement）', 'end'],
      ['見せ方（reveal）', 'always。ふだんから opacity 1（灰色）'],
      ['hover・フォーカス', '印が Primary になる'],
      ['指', '現行版と同じ'],
    ],
  },
  {
    id: 'B',
    name: '左の余白へ張り出す・hover で現れる',
    intent:
      '印を見出しの左の余白に出す。文字の並びには何も足さず、見出しの左端がそろったまま。ただし、左に印の幅の余白がないと切れる。狭い画面では余白がなく、指では印が画面の外にはみ出すか、文字を右へ押し込むことになる。',
    spec: [
      ['位置（placement）', 'start。幅と間（0.4em）の分だけ左へ張り出す'],
      ['見せ方（reveal）', 'hover'],
      ['DOM の順', '見出しの最初の子。読み上げも印が先'],
      ['指', 'いつも見せる。左の余白がなければ切れる'],
    ],
  },
  {
    id: 'C',
    name: '左の余白へ張り出す・いつも見せる',
    intent:
      'B の位置で、印をふだんから見せる。見出しの左端に小さな印が縦に並び、記事の目印になる。余白が要る点は B と同じ。',
    spec: [
      ['位置（placement）', 'start'],
      ['見せ方（reveal）', 'always'],
    ],
  },
];

const columns: Column[] = [
  { label: '通常（マウス）', note: 'hover していない' },
  { label: '見出しに hover', note: 'マウスを見出しに載せた', preview: 'hover' },
  { label: 'フォーカス（キーボード）', note: 'Tab で印に止まった', preview: 'focus' },
  { label: '指（hover なし）', note: '密度を指用に固定', preview: 'coarse' },
];

function Sample({ look }: { look: { reveal: Reveal; placement: Placement } }) {
  const anchor = <HeadingAnchor href="#sample" reveal={look.reveal} placement={look.placement} />;
  const start = look.placement === 'start';
  return (
    <div className="flex max-w-[20rem] min-w-0 flex-col gap-2 pl-8" data-reading="">
      <Heading level={2}>
        {start && anchor}
        使い方
        {!start && anchor}
      </Heading>
      <Text>見出しの隣に、この場所へのリンクが付きます。</Text>
      <Heading level={3}>
        {start && anchor}
        見出しが長くて、二行に折り返すときの様子
        {!start && anchor}
      </Heading>
    </div>
  );
}

const meta = {
  title: 'Design Review/200 見出しのページ内リンクの位置と見せ方',
  id: 'design-review-200-heading-anchor-placement',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({
      hover: ':is(h2, h3)',
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
      index={200}
      axis="見出しのページ内リンクの位置と見せ方"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <div data-density={column.preview === 'coarse' ? 'coarse' : undefined}>
          <Sample look={looks[candidate.id]} />
        </div>
      )}
    >
      <p>
        決定: 現行版（文字の後ろ・hover
        で現れる）を既定にし、張り出し（placement="start"）と常時表示（reveal="always"）も選べます。
      </p>
      <p>
        見出しに付く、その場所へのリンクの置き場所と、見せ方を選びます。文字の後ろに置くか左の余白へ張り出すか、ふだんから見せるか触れたときだけ現すか、の組み合わせです。
      </p>
      <p>
        既定を 1 つ決め、ほかは
        props（placement・reveal）で選べます。推奨は現行版です。ふだんの見出しを軽く保ち（原則
        1）、左の余白に依存せず（原則 20）、指ではいつも見せます。A は見出しが少ない文書向け、B・C
        は左の余白のある記事向けの選べる形として残せます。
      </p>
      <p>
        指の列は密度を指用に固定しています。指には hover
        がないので、隠したままだと見つけられません。そのため、指ではどの案でもいつも見せます。この扱いでよいかも見てください。
      </p>
      <p>どれを既定にするか、ほかに選べるようにしたい案があれば教えてください。</p>
    </Comparison>
  ),
};
