import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Card, CardBody } from '../../src/components/card/Card';
import { Meter } from '../../src/components/meter/Meter';
import { MeterGroup, type MeterGroupItem } from '../../src/components/meter/MeterGroup';

// 軸 433: 1 本のバーを内訳ごとに分けて塗る形（MeterGroup）。区切りの間・区切りの角・凡例の印
const meta = {
  title: 'Design Review/433 分けて塗るバー',
  id: 'design-review-433-meter-group',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'Meter を内訳の数だけ積む',
    intent:
      'いまは分けて塗るバーがないので、内訳ごとに Meter を 1 本ずつ積んでいる。合計がどれだけかは、1 本のバーでは見えない。比べるための基準',
    spec: [
      ['区切りの間', '—'],
      ['区切りの角', '—'],
      ['凡例の印', '—'],
    ],
  },
  {
    id: 'A',
    name: '1 本のバー・2px の切れ目・丸い印',
    intent:
      '1 本の pill の地に、内訳を左から順に塗る。区切りの間を 2px 空けて地のグレーを見せ、隣り合う色の境目をはっきりさせる。区切りの端は角を付けず、両端だけ地の pill で丸く切る。凡例の印は丸',
    spec: [
      ['区切りの間', '2px'],
      ['区切りの角', 'なし（両端は地の pill）'],
      ['凡例の印', '10px の丸'],
    ],
    tokens: {
      '--bar-group-gap': 'calc(var(--spacing) / 2)',
      '--bar-group-segment-radius': '0px',
      '--bar-group-marker-size': 'calc(var(--spacing) * 2.5)',
      '--bar-group-marker-radius': 'var(--radius-pill)',
    },
  },
  {
    id: 'B',
    name: '切れ目なし',
    intent: 'A の切れ目をなくし、色どうしを接して塗る。1 本の帯に見える。色の差だけで区切る',
    spec: [
      ['区切りの間', 'なし'],
      ['区切りの角', 'なし（両端は地の pill）'],
      ['凡例の印', '10px の丸'],
    ],
    tokens: {
      '--bar-group-gap': '0px',
      '--bar-group-segment-radius': '0px',
      '--bar-group-marker-size': 'calc(var(--spacing) * 2.5)',
      '--bar-group-marker-radius': 'var(--radius-pill)',
    },
  },
  {
    id: 'C',
    name: '区切りごとに丸いカプセル',
    intent:
      '区切りの 1 つずつを pill にし、4px 空けて並べる。小物（タグ）と同じ丸い端が続き、やわらかく人懐っこく見える。細い区切り（数 %）は点に近くなる',
    spec: [
      ['区切りの間', '4px'],
      ['区切りの角', 'pill'],
      ['凡例の印', '10px の丸'],
    ],
    tokens: {
      '--bar-group-gap': 'var(--spacing)',
      '--bar-group-segment-radius': 'var(--radius-pill)',
      '--bar-group-marker-size': 'calc(var(--spacing) * 2.5)',
      '--bar-group-marker-radius': 'var(--radius-pill)',
    },
  },
  {
    id: 'D',
    name: 'A・凡例の印は角の小さな四角',
    intent:
      'バーは A と同じ。凡例の印を、角の小さな四角にする。グラフの凡例に近く、丸よりかっちり見える',
    spec: [
      ['区切りの間', '2px'],
      ['区切りの角', 'なし（両端は地の pill）'],
      ['凡例の印', '10px の四角（radius-xs）'],
    ],
    tokens: {
      '--bar-group-gap': 'calc(var(--spacing) / 2)',
      '--bar-group-segment-radius': '0px',
      '--bar-group-marker-size': 'calc(var(--spacing) * 2.5)',
      '--bar-group-marker-radius': 'var(--radius-xs)',
    },
  },
];

const columns: Column[] = [
  { label: 'ストレージの内訳', note: '3 つ・md' },
  { label: '細い区切りがある', note: '4 つ目は 2%' },
  { label: '太い・細い', note: 'lg・sm' },
  { label: 'カードの上', note: 'グレーの面の上' },
];

const storage: MeterGroupItem[] = [
  { label: '写真', value: 38, valueText: '24.3 GB' },
  { label: '動画', value: 22, valueText: '14.1 GB' },
  { label: 'その他', value: 12, valueText: '7.7 GB' },
];
const withSliver: MeterGroupItem[] = [
  { label: 'デザイン', value: 45, color: 'primary' },
  { label: '開発', value: 30, color: 'secondary' },
  { label: '運用', value: 15, color: 'neutral' },
  { label: '予備', value: 2, color: 'success' },
];
const gb = (_: string, v: number) => `${((v / 100) * 64).toFixed(1)} / 64 GB`;

function Group({
  candidate,
  items,
  label,
  size,
  getValueText,
}: {
  candidate: Candidate;
  items: MeterGroupItem[];
  label: string;
  size?: 'sm' | 'md' | 'lg';
  getValueText?: (formatted: string, value: number) => string;
}) {
  if (candidate.id === '現行版') {
    return (
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <Meter
            key={i}
            label={item.label}
            value={item.value}
            size={size ?? 'sm'}
            color={item.color ?? (['primary', 'secondary', 'neutral'] as const)[i % 3]}
            getValueText={item.valueText ? () => item.valueText ?? '' : undefined}
          />
        ))}
      </div>
    );
  }
  return <MeterGroup label={label} items={items} size={size} getValueText={getValueText} />;
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={433}
      axis="分けて塗るバー"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        switch (column.label) {
          case 'ストレージの内訳':
            return (
              <div className="w-[300px]">
                <Group candidate={candidate} label="ストレージ" items={storage} getValueText={gb} />
              </div>
            );
          case '細い区切りがある':
            return (
              <div className="w-[300px]">
                <Group candidate={candidate} label="予算の使い道" items={withSliver} />
              </div>
            );
          case '太い・細い':
            return (
              <div className="flex w-[300px] flex-col gap-6">
                <Group candidate={candidate} label="lg" items={storage} size="lg" />
                <Group candidate={candidate} label="sm" items={storage} size="sm" />
              </div>
            );
          default:
            return (
              <Card className="w-[320px] bg-field">
                <CardBody>
                  <Group
                    candidate={candidate}
                    label="ストレージ"
                    items={storage}
                    getValueText={gb}
                  />
                </CardBody>
              </Card>
            );
        }
      }}
    >
      <p>
        1 本のバーを内訳ごとに分けて塗る MeterGroup
        を足しました（ストレージの内訳、予算の使い道など）。 バーの形・太さ・3 層の並びは Meter
        と同じで、ラベルの行の右端に合計を出します。色だけで伝えないよう、バーの下にいつも凡例（色の印・名前・値）を出し、読み上げは凡例を読みます。
      </p>
      <p>
        選ぶのは、区切りの間・区切りの角・凡例の印の形です。色は書かないとき
        primary・secondary・neutral の順です（4 つ目からは color
        で選びます）。どれを既定にするかも教えてください。
      </p>
    </Comparison>
  ),
};
