import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Card, CardBody, CardImage } from '../../src/components/card/Card';
import { Heading } from '../../src/components/heading/Heading';
import { Text } from '../../src/components/text/Text';
import { landscape } from '../../src/samples/images';
import { statePseudo } from '../../src/stories/story-states';

// 軸 415: Card の強調の形（variant="emphasis"）の面と輪郭
const meta = {
  title: 'Design Review/415 カードの強調の形',
  id: 'design-review-415-card-emphasis',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({
      hover: '[data-slot="card"]',
      focusVisible: '[data-slot="card"]',
    }),
  },
  args: { pick: 'G' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'G2'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const mixHover = (fill: string) => `color-mix(in oklab, ${fill}, var(--color-fg) 4%)`;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '強調なし（default と同じ）',
    intent:
      'いまは強調の形がない。emphasis を選んでも default と同じ白い面と細い輪郭。比べるための基準',
    spec: [
      ['面', '白'],
      ['輪郭', '細い線（輪郭の色）1px'],
    ],
    tokens: {
      '--card-emphasis-fill': 'var(--color-surface)',
      '--card-emphasis-fill-hover': 'var(--card-fill-hover)',
      '--card-emphasis-line': 'var(--color-surface-line)',
      '--card-emphasis-line-width': 'var(--border-width-thin)',
      '--card-emphasis-halo': '0px',
      '--card-emphasis-halo-mix': 'var(--timeline-emphasis-halo-mix)',
      '--card-emphasis-halo-base': 'var(--card-emphasis-line)',
    },
  },
  {
    id: 'A',
    name: '青い輪郭 2px',
    intent:
      '面は白のまま、輪郭を青（primary）の 2px にする。並んだカードの中で囲みの強さで目立たせる。選んでいるカードの線と似る',
    spec: [
      ['面', '白'],
      ['輪郭', '青（primary）2px'],
    ],
    tokens: {
      '--card-emphasis-fill': 'var(--color-surface)',
      '--card-emphasis-fill-hover': 'var(--card-fill-hover)',
      '--card-emphasis-line': 'var(--color-primary)',
      '--card-emphasis-line-width': 'var(--border-width-thick)',
      '--card-emphasis-halo': '0px',
      '--card-emphasis-halo-mix': 'var(--timeline-emphasis-halo-mix)',
      '--card-emphasis-halo-base': 'var(--card-emphasis-line)',
    },
  },
  {
    id: 'B',
    name: '淡い青の面',
    intent:
      '面を淡い青（primary の淡い面）で塗り、輪郭はそのまま。塗りの差で目立たせ、線は増やさない',
    spec: [
      ['面', '淡い青（primary-subtle）'],
      ['輪郭', '細い線（輪郭の色）1px'],
    ],
    tokens: {
      '--card-emphasis-fill': 'var(--color-primary-subtle)',
      '--card-emphasis-fill-hover': mixHover('var(--color-primary-subtle)'),
      '--card-emphasis-line': 'var(--color-surface-line)',
      '--card-emphasis-line-width': 'var(--border-width-thin)',
      '--card-emphasis-halo': '0px',
      '--card-emphasis-halo-mix': 'var(--timeline-emphasis-halo-mix)',
      '--card-emphasis-halo-base': 'var(--card-emphasis-line)',
    },
  },
  {
    id: 'C',
    name: '淡い水色の面・輪郭なし',
    intent:
      '面をタグと同じ淡い水色（ブランドの色）で塗り、輪郭は面と同じ色にして消す。選んでいる見た目（青）と紛れにくく、人懐っこい',
    spec: [
      ['面', '淡い水色（タグの塗り）'],
      ['輪郭', '面と同じ色（見えない）1px'],
    ],
    tokens: {
      '--card-emphasis-fill': 'var(--color-tag)',
      '--card-emphasis-fill-hover': mixHover('var(--color-tag)'),
      '--card-emphasis-line': 'var(--color-tag)',
      '--card-emphasis-line-width': 'var(--border-width-thin)',
      '--card-emphasis-halo': '0px',
      '--card-emphasis-halo-mix': 'var(--timeline-emphasis-halo-mix)',
      '--card-emphasis-halo-base': 'var(--card-emphasis-line)',
    },
  },
  {
    id: 'D',
    name: '濃紺の輪郭 2px',
    intent: '面は白のまま、輪郭を本文の濃紺で 2px にする。色を足さずに、線の強さだけで目立たせる',
    spec: [
      ['面', '白'],
      ['輪郭', '濃紺（本文の色）2px'],
    ],
    tokens: {
      '--card-emphasis-fill': 'var(--color-surface)',
      '--card-emphasis-fill-hover': 'var(--card-fill-hover)',
      '--card-emphasis-line': 'var(--color-fg)',
      '--card-emphasis-line-width': 'var(--border-width-thick)',
      '--card-emphasis-halo': '0px',
      '--card-emphasis-halo-mix': 'var(--timeline-emphasis-halo-mix)',
      '--card-emphasis-halo-base': 'var(--card-emphasis-line)',
    },
  },
  {
    id: 'E',
    name: '輪郭の外に淡い輪（Timeline と同じ）',
    intent:
      'Timeline の強調する項目と同じ考え方。面・輪郭の色と太さは default のまま変えず、輪郭の外に、輪郭の色を薄めた淡い輪を足す。輪の幅と濃さは Timeline の強調の輪と同じ',
    spec: [
      ['面', '白（変えない）'],
      ['輪郭', '細い線（輪郭の色）1px（変えない）'],
      ['輪', '外側 4px・輪郭の色を 45% に薄めた色'],
    ],
    tokens: {
      '--card-emphasis-fill': 'var(--color-surface)',
      '--card-emphasis-fill-hover': 'var(--card-fill-hover)',
      '--card-emphasis-line': 'var(--color-surface-line)',
      '--card-emphasis-line-width': 'var(--border-width-thin)',
      '--card-emphasis-halo': 'var(--timeline-emphasis-halo)',
      '--card-emphasis-halo-mix': 'var(--timeline-emphasis-halo-mix)',
      '--card-emphasis-halo-base': 'var(--card-emphasis-line)',
    },
  },
  {
    id: 'F',
    name: '濃いグレーの淡い輪',
    intent:
      'E の派生。面と輪郭は default のまま、輪の色だけを 3:1 の濃いグレー（Timeline の点の色と同じ）から作る。幅と濃さは E と同じで、輪が E よりはっきり見える',
    spec: [
      ['面', '白（変えない）'],
      ['輪郭', '細い線（輪郭の色）1px（変えない）'],
      ['輪', '外側 4px・濃いグレー（line-strong）を 45% に薄めた色'],
    ],
    tokens: {
      '--card-emphasis-fill': 'var(--color-surface)',
      '--card-emphasis-fill-hover': 'var(--card-fill-hover)',
      '--card-emphasis-line': 'var(--color-surface-line)',
      '--card-emphasis-line-width': 'var(--border-width-thin)',
      '--card-emphasis-halo': 'var(--timeline-emphasis-halo)',
      '--card-emphasis-halo-mix': 'var(--timeline-emphasis-halo-mix)',
      '--card-emphasis-halo-base': 'var(--color-line-strong)',
    },
  },
  {
    id: 'G',
    name: '青い淡い輪（E の輪を primary から）',
    intent:
      'E の派生。面と輪郭は default のまま、輪の色を青（primary）から作る。幅と濃さは E・Timeline の強調の輪と同じ。選んでいる見た目（輪郭の上に重ねる線）とは、線ではなく外側のにじみで分ける',
    spec: [
      ['面', '白（変えない）'],
      ['輪郭', '細い線（輪郭の色）1px（変えない）'],
      ['輪', '外側 4px・青（primary）を 45% に薄めた色'],
    ],
    tokens: {
      '--card-emphasis-fill': 'var(--color-surface)',
      '--card-emphasis-fill-hover': 'var(--card-fill-hover)',
      '--card-emphasis-line': 'var(--color-surface-line)',
      '--card-emphasis-line-width': 'var(--border-width-thin)',
      '--card-emphasis-halo': 'var(--timeline-emphasis-halo)',
      '--card-emphasis-halo-mix': 'var(--timeline-emphasis-halo-mix)',
      '--card-emphasis-halo-base': 'var(--color-primary)',
    },
  },
  {
    id: 'G2',
    name: '青い輪（G を濃く）',
    intent:
      'G の輪を濃くした案。幅は同じ 4px で、青（primary）を 70% の濃さで混ぜた色にする（G は 45%）。輪だけで遠目にも分かる強さ',
    spec: [
      ['面', '白（変えない）'],
      ['輪郭', '細い線（輪郭の色）1px（変えない）'],
      ['輪', '外側 4px・青（primary）を 70% の濃さ'],
    ],
    tokens: {
      '--card-emphasis-fill': 'var(--color-surface)',
      '--card-emphasis-fill-hover': 'var(--card-fill-hover)',
      '--card-emphasis-line': 'var(--color-surface-line)',
      '--card-emphasis-line-width': 'var(--border-width-thin)',
      '--card-emphasis-halo': 'var(--timeline-emphasis-halo)',
      '--card-emphasis-halo-mix': '70%',
      '--card-emphasis-halo-base': 'var(--color-primary)',
    },
  },
];

const columns: Column[] = [
  { label: '並べたとき', note: '3 枚のうち真ん中が emphasis（押せない）' },
  { label: '押せる・通常', note: 'href あり・画像つき' },
  { label: '押せる・hover', preview: 'hover' },
  { label: '押せる・フォーカス', note: 'キーボード', preview: 'focus' },
  {
    label: '選んでいる（line）と並べる',
    note: '押せる 3 枚。左が emphasis、真ん中が selected（selectedIndicator="line"）',
  },
  {
    label: '選んでいる（fill）と並べる',
    note: '押せる 3 枚。左が emphasis、真ん中が selected（selectedIndicator="fill"）',
  },
  {
    label: '強調と選んでいるを同時に',
    note: '押せる 3 枚。左が default、真ん中が emphasis＋selected（line）、右が emphasis＋selected（fill）',
  },
];

const noop = () => {};

const Plan = ({
  name,
  price,
  emphasis,
  selected,
  indicator,
  pressable,
}: {
  name: string;
  price: string;
  emphasis?: boolean;
  selected?: boolean;
  indicator?: 'line' | 'fill';
  pressable?: boolean;
}) => (
  <Card
    variant={emphasis ? 'emphasis' : 'default'}
    selected={selected}
    selectedIndicator={indicator}
    onClick={pressable ? noop : undefined}
  >
    <CardBody>
      <Text size="sm" variant="subtle">
        {emphasis ? 'おすすめ' : 'プラン'}
      </Text>
      <Heading level={3} size="md">
        {name}
      </Heading>
      <Text size="sm" variant="muted">
        {price}
      </Text>
    </CardBody>
  </Card>
);

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={415}
      axis="カードの強調の形"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) =>
        column.label === '選んでいる（line）と並べる' ||
        column.label === '選んでいる（fill）と並べる' ? (
          <div className="grid w-[480px] grid-cols-3 gap-3">
            <Plan name="スタンダード" price="月 500 円" emphasis pressable />
            <Plan
              name="チーム"
              price="月 1,500 円"
              selected
              indicator={column.label.includes('line') ? 'line' : 'fill'}
              pressable
            />
            <Plan name="フリー" price="0 円" pressable />
          </div>
        ) : column.label === '強調と選んでいるを同時に' ? (
          <div className="grid w-[480px] grid-cols-3 gap-3">
            <Plan name="フリー" price="0 円" pressable />
            <Plan
              name="スタンダード"
              price="月 500 円"
              emphasis
              selected
              indicator="line"
              pressable
            />
            <Plan
              name="スタンダード"
              price="月 500 円"
              emphasis
              selected
              indicator="fill"
              pressable
            />
          </div>
        ) : column.label === '並べたとき' ? (
          <div className="grid w-[480px] grid-cols-3 gap-3">
            <Plan name="フリー" price="0 円" />
            <Plan name="スタンダード" price="月 500 円" emphasis />
            <Plan name="チーム" price="月 1,500 円" />
          </div>
        ) : (
          <div className="w-[220px]">
            <Card variant="emphasis" href="#">
              <CardImage src={landscape} alt="" />
              <CardBody>
                <Text size="sm" variant="subtle">
                  2026.09.19
                </Text>
                <Heading level={3} size="md">
                  いちばん読まれた記事
                </Heading>
              </CardBody>
            </Card>
          </div>
        )
      }
    >
      <p>
        決定: variant="emphasis" は G（面と輪郭は default のまま、輪郭の外に、青（primary）を 45%
        に薄めた幅 4px の淡い輪。幅と濃さは Timeline の強調の輪と同じ）。ユーザーの返事「Step?
        と同じ emphasis の案を足せますか?」（E・F
        を足した）、「悩んでいます。一旦後回しにします。」、「415 は悩みましたが A
        でお願いします」（A は選んでいる見た目の線だけの形と重なると伝えた）、「その場合、E で影が
        primary とかだといいのかもですね。」（G・G2 を足した）、「G
        でお願いします」。候補の見た目は、トークンを畳む前のこのコミットで比べられます。
      </p>
      <p>
        Card の variant に、強調の形 emphasis を足します。画像の置き方は default
        と同じ（端まで届かせる）で、面と輪郭だけを変えます。並べたカードのうち、おすすめの 1
        枚などに使います。影は足しません（影は押せることを表すため）。
      </p>
      <p>
        選ぶのは面の塗りと輪郭の色・太さです。押せるときの hover の塗りも、面に合わせて決めます。軸
        413（選んでいる見た目）と並んだときに紛れないかは、右の 3
        列（選んでいるカードと並べる・同時に付ける）で見てください。
      </p>
    </Comparison>
  ),
};
