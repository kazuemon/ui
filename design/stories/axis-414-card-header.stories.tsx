import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import {
  Card,
  CardBody,
  CardHeader,
  CardImage,
  type CardVariant,
} from '../../src/components/card/Card';
import { Heading } from '../../src/components/heading/Heading';
import { Text } from '../../src/components/text/Text';
import { landscape } from '../../src/samples/images';

// 軸 414: Card の頭の帯（CardHeader）の塗り・線・上下の余白
const meta = {
  title: 'Design Review/414 カードの頭の帯',
  id: 'design-review-414-card-header',
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
    name: '帯なし',
    intent:
      'いまは CardHeader がなく、題は CardBody の中に置くしかない。題と操作を 1 行に並べるのも自分で組む。比べるための基準',
    spec: [['帯', 'なし（題は中身の先頭）']],
  },
  {
    id: 'A',
    name: '白い帯＋下の線',
    intent:
      '帯はカードと同じ白のまま、下に細い線を引いて中身と分ける。線はカードの輪郭と同じ色。塗りを足さないので軽い',
    spec: [
      ['塗り', 'カードと同じ白'],
      ['下の線', '細い線（輪郭の色）1px'],
      ['上下の余白', '12px'],
    ],
    tokens: {
      '--card-header-fill': 'var(--color-surface)',
      '--card-header-line': 'var(--color-surface-line)',
      '--card-header-line-width': 'var(--border-width-thin)',
      '--card-header-padding-y': 'calc(var(--spacing) * 3)',
    },
  },
  {
    id: 'B',
    name: 'グレーの帯',
    intent:
      '帯を入力欄と同じ淡いグレーで塗り、線は引かない。塗りの境目で中身と分ける。帯であることがいちばん分かりやすい',
    spec: [
      ['塗り', '淡いグレー（入力欄の塗り）'],
      ['下の線', 'なし'],
      ['上下の余白', '12px'],
    ],
    tokens: {
      '--card-header-fill': 'var(--color-field)',
      '--card-header-line': 'transparent',
      '--card-header-line-width': '0px',
      '--card-header-padding-y': 'calc(var(--spacing) * 3)',
    },
  },
  {
    id: 'C',
    name: 'グレーの帯＋下の線',
    intent: 'B に細い線を足す。グレーの面と白い面の境目を線で締める。表の頭の行に近い見た目',
    spec: [
      ['塗り', '淡いグレー（入力欄の塗り）'],
      ['下の線', '細い線（輪郭の色）1px'],
      ['上下の余白', '12px'],
    ],
    tokens: {
      '--card-header-fill': 'var(--color-field)',
      '--card-header-line': 'var(--color-surface-line)',
      '--card-header-line-width': 'var(--border-width-thin)',
      '--card-header-padding-y': 'calc(var(--spacing) * 3)',
    },
  },
  {
    id: 'D',
    name: '淡い水色の帯',
    intent:
      '帯をタグと同じ淡い水色で塗る。線は引かない。ブランドの色を面に薄く敷き、人懐っこく見せる。上下の余白は 8px と詰める',
    spec: [
      ['塗り', '淡い水色（タグの塗り）'],
      ['下の線', 'なし'],
      ['上下の余白', '8px'],
    ],
    tokens: {
      '--card-header-fill': 'var(--color-tag)',
      '--card-header-line': 'transparent',
      '--card-header-line-width': '0px',
      '--card-header-padding-y': 'calc(var(--spacing) * 2)',
    },
  },
];

const columns: Column[] = [
  { label: '題と操作', note: '設定のカード・幅 320px' },
  { label: '題と画像', note: '帯のあとに画像' },
  { label: '入れ子', note: 'variant="nested"' },
];

const Head = ({ candidate, children }: { candidate: Candidate; children: ReactNode }) =>
  candidate.id === '現行版' ? null : <CardHeader>{children}</CardHeader>;

const Sample = ({
  candidate,
  variant = 'default',
  image = false,
  action = false,
}: {
  candidate: Candidate;
  variant?: CardVariant;
  image?: boolean;
  action?: boolean;
}) => {
  const current = candidate.id === '現行版';
  const title = (
    <Heading level={3} size="md">
      通知の設定
    </Heading>
  );
  return (
    <Card variant={variant}>
      <Head candidate={candidate}>
        {title}
        {action && <Button variant="outline">編集</Button>}
      </Head>
      {image && <CardImage src={landscape} alt="" />}
      <CardBody>
        {current && title}
        <Text size="sm" variant="muted">
          メールで受け取る通知と、受け取る時間帯を決めます。
        </Text>
      </CardBody>
    </Card>
  );
};

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={414}
      axis="カードの頭の帯"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        switch (column.label) {
          case '題と操作':
            return (
              <div className="w-[320px]">
                <Sample candidate={candidate} action />
              </div>
            );
          case '題と画像':
            return (
              <div className="w-[260px]">
                <Sample candidate={candidate} image />
              </div>
            );
          default:
            return (
              <div className="w-[260px]">
                <Sample candidate={candidate} variant="nested" image />
              </div>
            );
        }
      }}
    >
      <p>
        Card に頭の帯 CardHeader を足します。カードのいちばん上に置き、題と右端の操作を 1
        行に並べます。左右の余白は中身とそろえます。入れ子（nested）では、帯を画像と同じく内側に収め、角を同心の角にします。
      </p>
      <p>選ぶのは、帯の塗り・下の線・上下の余白です。</p>
    </Comparison>
  ),
};
