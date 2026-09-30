import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Card, CardBody, CardImage, type CardVariant } from '../../src/components/card/Card';
import { Heading } from '../../src/components/heading/Heading';
import { Text } from '../../src/components/text/Text';
import { landscape } from '../../src/samples/images';

// 軸 412: Card の詰めた余白（size="sm"）。md（既定）は今の余白のまま
const meta = {
  title: 'Design Review/412 カードの詰めた余白',
  id: 'design-review-412-card-size',
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
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '詰めた段なし（md と同じ）',
    intent:
      'いまのカード。余白の段は 1 つだけで、sm を選んでも md と同じ余白になる。比べるための基準',
    spec: [
      ['中身の余白', '16px'],
      ['縦の間', '4px'],
      ['入れ子の余白', '8px'],
    ],
    tokens: {
      '--card-padding-sm': 'calc(var(--spacing) * 4)',
      '--card-gap-sm': 'calc(var(--spacing) * 1)',
      '--card-nested-inset-sm': 'calc(var(--spacing) * 2)',
    },
  },
  {
    id: 'A',
    name: '余白 12px・間 2px',
    intent:
      '中身の余白を 12px に、日付と題のあいだを 2px に詰める。入れ子の余白も 6px に縮め、画像の周りと文字の周りの比を md とそろえる',
    spec: [
      ['中身の余白', '12px'],
      ['縦の間', '2px'],
      ['入れ子の余白', '6px'],
    ],
    tokens: {
      '--card-padding-sm': 'calc(var(--spacing) * 3)',
      '--card-gap-sm': 'calc(var(--spacing) * 0.5)',
      '--card-nested-inset-sm': 'calc(var(--spacing) * 1.5)',
    },
  },
  {
    id: 'B',
    name: '余白 12px・間はそのまま',
    intent:
      '中身の余白だけを 12px に詰め、縦の間は md と同じ 4px に残す。入れ子の余白は 4px にし、画像を大きく見せる',
    spec: [
      ['中身の余白', '12px'],
      ['縦の間', '4px'],
      ['入れ子の余白', '4px'],
    ],
    tokens: {
      '--card-padding-sm': 'calc(var(--spacing) * 3)',
      '--card-gap-sm': 'calc(var(--spacing) * 1)',
      '--card-nested-inset-sm': 'calc(var(--spacing) * 1)',
    },
  },
  {
    id: 'C',
    name: '余白 8px・間 2px',
    intent:
      'いちばん詰めた形。中身の余白を入れ子の余白と同じ 8px にする。サムネイルの一覧のように、1 枚が小さいときの形',
    spec: [
      ['中身の余白', '8px'],
      ['縦の間', '2px'],
      ['入れ子の余白', '4px'],
    ],
    tokens: {
      '--card-padding-sm': 'calc(var(--spacing) * 2)',
      '--card-gap-sm': 'calc(var(--spacing) * 0.5)',
      '--card-nested-inset-sm': 'calc(var(--spacing) * 1)',
    },
  },
];

const columns: Column[] = [
  { label: 'md（比べる基準）', note: '既定の余白。どの行も同じ' },
  { label: 'sm・画像を端まで', note: 'variant="default"・幅 220px' },
  { label: 'sm・入れ子', note: 'variant="nested"・幅 220px' },
  { label: 'sm・文だけの一覧', note: '幅 200px を 3 枚縦に' },
];

const Sample = ({ variant, size }: { variant: CardVariant; size: 'sm' | 'md' }) => (
  <Card variant={variant} size={size} href="#">
    <CardImage src={landscape} alt="" />
    <CardBody>
      <Text size="sm" variant="subtle">
        2026.09.19
      </Text>
      <Heading level={3} size="md">
        やった仕事のタイトルがここに入ります
      </Heading>
    </CardBody>
  </Card>
);

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={412}
      axis="カードの詰めた余白"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => {
        switch (column.label) {
          case 'md（比べる基準）':
            return (
              <div className="w-[220px]">
                <Sample variant="default" size="md" />
              </div>
            );
          case 'sm・画像を端まで':
            return (
              <div className="w-[220px]">
                <Sample variant="default" size="sm" />
              </div>
            );
          case 'sm・入れ子':
            return (
              <div className="w-[220px]">
                <Sample variant="nested" size="sm" />
              </div>
            );
          default:
            return (
              <div className="flex w-[200px] flex-col gap-2">
                {['下書きを保存しました', '公開の予約', 'コメントが 3 件'].map((title) => (
                  <Card key={title} size="sm">
                    <CardBody>
                      <Text size="sm" variant="subtle">
                        10 分前
                      </Text>
                      <Text weight="bold">{title}</Text>
                    </CardBody>
                  </Card>
                ))}
              </div>
            );
        }
      }}
    >
      <p>
        Card に余白の段 size（sm・md）を足します。md は今の余白のままで既定です。sm
        は狭い列や、たくさん並べる一覧のために、中身の余白・日付と題のあいだ・入れ子の画像の周りを詰めます。
      </p>
      <p>
        選ぶのは sm の 3
        つの値です。角（カードの角）と画像の比率は、どちらの段でも変えません。入れ子の画像の角は、外の角から入れ子の余白を引いた同心の角になります。
      </p>
    </Comparison>
  ),
};
