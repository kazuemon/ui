import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Accordion,
  type AccordionAppearance,
  AccordionItem,
  type AccordionProps,
} from '../../src/components/accordion/Accordion';
import { Heading } from '../../src/components/heading/Heading';
import { Prose } from '../../src/components/prose/Prose';
import { Text } from '../../src/components/text/Text';
import { statePseudo } from '../../src/stories/story-states';
import { type Candidate, type Column, Comparison } from './Comparison';

// 軸 96: Accordion の既定の見た目と、項目のあいだ・一覧の上下の区切り
//   決定: A（divided・あいだの線だけ）を既定にした。上下の線のトークンは部品に畳んで消したので、現行版の行は className で上下の線を描き戻している
//   行 = 案（appearance と一覧の上下の線）、列 = 場面
//   行と中身の見た目は Collapsible（ADR-0117）のまま。ここで決めるのは既定の appearance と、divided の上下の線
//   各場面の 1 項目目は開いている、2 項目目は hover、3 項目目はキーボードのフォーカスで止める

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'divided・上下の線あり（推奨）',
    intent:
      '項目のあいだと一覧の上下に細い線を引く。FAQ の形。線で押せる範囲と項目の切れ目が見え、周りの本文と一覧の境もはっきりする。',
    spec: [
      ['appearance', 'divided'],
      ['項目のあいだ', '線 1 本'],
      ['一覧の上下', '線あり'],
    ],
  },
  {
    id: 'A',
    name: 'divided・あいだの線だけ',
    intent:
      '線は項目のあいだだけに引き、一覧の上下には引かない。見出しや本文とのあいだに線が増えず、軽く見える。',
    spec: [
      ['appearance', 'divided'],
      ['項目のあいだ', '線 1 本'],
      ['一覧の上下', '線なし'],
    ],
  },
  {
    id: 'B',
    name: 'plain',
    intent: '線も塗りもなし。hover だけ淡いグレー。Collapsible の既定と同じ。',
    spec: [
      ['appearance', 'plain'],
      ['項目のあいだ', '区切りなし'],
    ],
  },
  {
    id: 'C',
    name: 'open-filled',
    intent: '開いている項目だけグレーで塗る。どれが開いているかが塗りで分かる。',
    spec: [
      ['appearance', 'open-filled'],
      ['項目のあいだ', '区切りなし（開いた項目の塗りだけ）'],
    ],
  },
  {
    id: 'D',
    name: 'filled',
    intent: 'どの項目もいつもグレーで塗り、項目のあいだを少し離す。',
    spec: [
      ['appearance', 'filled'],
      ['項目のあいだ', '4px 離す'],
    ],
  },
];

const appearanceOf: Record<string, AccordionAppearance> = {
  現行版: 'divided',
  A: 'divided',
  B: 'plain',
  C: 'open-filled',
  D: 'filled',
};

const columns: Column[] = [
  {
    label: 'ページの「よくある質問」',
    note: '見出しの下に並べる。ポートフォリオの問い合わせの節など',
  },
  {
    label: '記事の中の折りたたみ',
    note: 'Prose の段落のあいだに置く。補足を題だけ見せる',
  },
];

type SceneProps = Pick<AccordionProps, 'appearance' | 'indicator' | 'className'> & {
  focusRing: boolean;
};

function Items({ v }: { v: SceneProps }) {
  const { focusRing, ...props } = v;
  return (
    // 切り替えたら作り直す。pseudo-states が付けたクラスは要素に残り、属性を外しても線が消えないため
    <Accordion key={String(focusRing)} {...props} defaultValue={['a']}>
      <AccordionItem value="a" title="お仕事の依頼は受けていますか？">
        副業として、UI の設計と実装を受けています。問い合わせのページから内容を送ってください。
      </AccordionItem>
      <AccordionItem value="b" title="使っている道具は？" data-preview="hover">
        React と Tailwind CSS で、部品は自分で作っています。
      </AccordionItem>
      <AccordionItem
        value="c"
        title="作品を転載してもよいですか？"
        data-preview={focusRing ? 'focus' : undefined}
        // Controls で切り替えたあとは pseudo-states が付け直さないので、祖先のクラスでも当てる
        className={focusRing ? 'pseudo-focus-visible-all' : undefined}
      >
        出どころを書いてもらえれば大丈夫です。
      </AccordionItem>
    </Accordion>
  );
}

function FaqSection({ v }: { v: SceneProps }) {
  return (
    <div className="flex w-[340px] flex-col gap-4">
      <Heading level={2} size={3}>
        よくある質問
      </Heading>
      <Items v={v} />
      <Text size="sm" tone="muted">
        ここにない質問は、問い合わせのページから送ってください。
      </Text>
    </div>
  );
}

function ArticleScene({ v }: { v: SceneProps }) {
  return (
    <div className="w-[360px]" data-reading>
      <Prose>
        <p>
          部品を 1
          から作り直して、読みやすさを見直しました。細かい決めごとは、下にまとめておきます。
        </p>
        <Items v={v} />
        <p>次の記事では、和文フォントの縦の寸法の補正について書きます。</p>
      </Prose>
    </div>
  );
}

function Axis96({ pick, indicator, focusRing = true }: ComparisonArgs) {
  return (
    <Comparison
      index={96}
      axis="Accordion の既定の見た目と区切り"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const v = {
          appearance: appearanceOf[candidate.id],
          indicator,
          focusRing,
          // 現行版だけ、一覧の上下にも線を引く（決めたときの比較を残すため）
          className:
            candidate.id === '現行版'
              ? '*:first:border-t-(length:--border-width-thin) *:last:border-b-(length:--border-width-thin)'
              : undefined,
        };
        return columns.indexOf(column) === 0 ? <FaqSection v={v} /> : <ArticleScene v={v} />;
      }}
    >
      <p>
        <strong>決定: A（divided・項目のあいだの線だけ）を既定にする。ADR はあとで書く。</strong>
      </p>
      <p>
        行と中身の見た目は Collapsible（ADR-0117）と同じで、4 つの <code>appearance</code>{' '}
        はどれも選べます。ここで決めるのは、Accordion の既定にする見た目と、区切り線（
        <code>divided</code>）のとき一覧の上下にも線を引くかです。
      </p>
      <p>
        推奨は現行版（<code>divided</code>
        ・上下の線あり）。最初の使い道の FAQ
        で、項目の切れ目と押せる範囲が線で見え（原則7）、本文との境もはっきりします。A
        は上下の線をなくした形で、既定にしないなら <code>divided</code>{' '}
        の中で選べるようにもできます。
      </p>
      <p>
        各場面の 1 項目目は開いている、2 項目目は hover、3
        項目目はキーボードのフォーカスで止めています。印の左右は Controls の indicator、3
        項目目のフォーカスの線の有無は focusRing で切り替えます。
      </p>
    </Comparison>
  );
}

interface ComparisonArgs {
  pick?: string;
  indicator?: 'end' | 'start';
  focusRing?: boolean;
}

const meta = {
  title: 'Design Review/96 Accordion の既定の見た目と区切り',
  id: 'design-review-96-accordion',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({
      hover: '[data-slot="accordion-trigger"]',
      focusVisible: '[data-slot="accordion-trigger"]',
    }),
  },
  args: { pick: 'A', indicator: 'end', focusRing: true },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
    indicator: {
      description: '開閉の印の位置（見た目とは別の props）',
      control: 'inline-radio',
      options: ['end', 'start'],
    },
    focusRing: {
      description: '3 項目目をキーボードのフォーカスで止めるか',
      control: 'boolean',
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: (args) => <Axis96 {...args} />,
};
