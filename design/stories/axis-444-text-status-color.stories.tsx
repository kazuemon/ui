import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Text } from '../../src/components/text/Text';

// 軸 444: Text の意味の色（color: info・success・warning・danger）。文字に色を付けるか、形（アイコン）を添えるか
const meta = {
  title: 'Design Review/444 文字の意味の色',
  id: 'design-review-444-text-status-color',
  parameters: { layout: 'fullscreen' },
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
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '色なし',
    intent: 'いまは意味の色を持たない。期日を過ぎたことは Tag で出していた。比べるための基準',
    spec: [
      ['文字の色', '本文の色'],
      ['形', 'なし'],
    ],
  },
  {
    id: 'A',
    name: '文字に色だけ',
    intent:
      '文字を白地の状態の色にする（警告はオリーブ）。形は添えない。いちばん軽いが、色だけで意味を伝えることになる（原則6 の「形でも見分ける」に届かない）',
    spec: [
      ['文字の色', '状態の色'],
      ['形', 'なし'],
    ],
    tokens: { '--text-status-text-follow': '1', '--text-status-icon-display': 'none' },
  },
  {
    id: 'B',
    name: '文字に色・前に形',
    intent:
      '文字を状態の色にし、前に状態の形（丸の「!」・三角・丸のチェック・丸の「i」）を同じ色で置く。お知らせ・欄の下の行と同じ組み合わせ',
    spec: [
      ['文字の色', '状態の色'],
      ['形', '前に置く（文字に比例）'],
    ],
    tokens: { '--text-status-text-follow': '1', '--text-status-icon-display': 'inline-block' },
  },
  {
    id: 'C',
    name: '形だけに色・文字は本文の色',
    intent:
      '色は前に置く形だけに持たせ、文字は本文の濃紺のまま読ませる。長い文でも読みやすいが、色の面積が小さく、遠目には目立たない',
    spec: [
      ['文字の色', '本文の色'],
      ['形', '前に置く（状態の色）'],
    ],
    tokens: { '--text-status-text-follow': '0', '--text-status-icon-display': 'inline-block' },
  },
];

const columns: Column[] = [
  { label: '4 つの色', note: 'md' },
  { label: '文の中の一部', note: 'as="span"' },
  { label: '小さい文字', note: 'sm・2 行' },
];

const colors = ['danger', 'warning', 'success', 'info'] as const;
const samples = {
  danger: '期日を 2 日過ぎています',
  warning: '残りの容量が少なくなっています',
  success: '保存しました',
  info: '次の更新は 10 月 5 日です',
};

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={444}
      axis="文字の意味の色"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const on = candidate.id !== '現行版';
        switch (column.label) {
          case '4 つの色':
            return (
              <div className="flex flex-col gap-1">
                {colors.map((color) => (
                  <Text key={color} color={on ? color : undefined}>
                    {samples[color]}
                  </Text>
                ))}
              </div>
            );
          case '文の中の一部':
            return (
              <Text className="w-[300px]">
                記事の下書き 3 件のうち、
                <Text as="span" color={on ? 'danger' : undefined}>
                  1 件は期日を過ぎています
                </Text>
                。残りは来週までに公開します。
              </Text>
            );
          default:
            return (
              <Text size="sm" className="w-[260px]" color={on ? 'warning' : undefined}>
                この機能は次の版で消えます。設定の画面から、新しい方法に移してください。
              </Text>
            );
        }
      }}
    >
      <p>
        決定: A（文字に色だけ。形は添えない）。Text の color
        は色の軸のままにし、読み上げに状態を足したりアイコンを組にしたりするなら、別の部品（文字だけのお知らせ）にする。
        ユーザーの返事:「A でいいかなと思っています。ここにおいては意味を若干持ちつつも、あくまでも
        color であるからです。読み上げに status を反映したり、アイコンをセットにするならば、単なる
        Text の役割を超えていると思うので、別途適切なコンポーネント（文字だけの Notice
        のようなイメージ）を構成すべきだと思います。」
        候補の見た目は、トークンを畳む前のこのコミットで比べられます。
      </p>
      <p>
        Text に意味の色を足しました。props の名前は <code>color</code>（値は
        info・success・warning・danger）にしました。 variant
        は濃さ（body・muted・subtle）と欄と同じ見た目の組を持つ軸で、色の軸は props の決まりで{' '}
        <code>color</code> に寄せているためです。 色を付けた文字は、variant
        の濃さより色が勝ちます。primary・secondary
        は、文字のリンクと見分けがつかなくなるので取りません。
      </p>
      <p>
        選ぶのは、色を文字に付けるか、形（アイコン）を添えるかです。既定の推しは B（原則6
        の「色だけでなく形でも見分ける」に沿う）です。形を出さない A を、props（たとえば
        hideStatusIcon）で選べるようにするかも教えてください。
      </p>
    </Comparison>
  ),
};
