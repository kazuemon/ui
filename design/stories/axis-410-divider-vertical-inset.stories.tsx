import type { Meta, StoryObj } from '@storybook/react-vite';
import { Fragment, type ReactNode } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Divider } from '../../src/components/divider/Divider';
import { Link } from '../../src/components/link/Link';
import { Text } from '../../src/components/text/Text';

// 軸 410: Divider の縦の線（orientation="vertical"）の長さと、左右を空けた線（variant="inset"）の空け幅
const meta = {
  title: 'Design Review/410 縦の区切り線と、左右を空けた線',
  id: 'design-review-410-divider-vertical-inset',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'B' },
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
    name: '縦の線も、左右を空けた線もない',
    intent:
      'いまの Divider。横に並べたものは間だけで区切り、パネルの中の線は幅いっぱいになる。比べるための基準',
    spec: [
      ['縦の線', 'なし（間だけ）'],
      ['左右を空けた線', 'なし（幅いっぱい）'],
    ],
  },
  {
    id: 'A',
    name: '行の高さいっぱい・部品の余白だけ空ける',
    intent:
      '縦の線は、並んだ行の高さいっぱいに引く（Stack の showDivider と同じ）。左右を空けた線は、部品の左右の余白（16px）だけ空け、中の文字の始まりにそろえる',
    spec: [
      ['縦の線の長さ', '行の高さいっぱい'],
      ['空け幅', '16px（部品の左右の余白）'],
    ],
    tokens: {
      '--divider-vertical-length': 'auto',
      '--divider-vertical-align': 'stretch',
      '--divider-inset': 'var(--spacing-control-x)',
    },
  },
  {
    id: 'B',
    name: '文字の高さ・部品の余白だけ空ける',
    intent:
      '縦の線を周りの文字の高さにして、真ん中に置く。ボタンが並んでも線が短く、軽く見える。空け幅は A と同じ',
    spec: [
      ['縦の線の長さ', '周りの文字の高さ（1em）'],
      ['空け幅', '16px（部品の左右の余白）'],
    ],
    tokens: {
      '--divider-vertical-length': '1em',
      '--divider-vertical-align': 'center',
      '--divider-inset': 'var(--spacing-control-x)',
    },
  },
  {
    id: 'C',
    name: '文字の高さ・少しだけ空ける',
    intent:
      '縦の線は B と同じ。左右を空けた線は 8px（入れ子のカードの内側と同じ）にとどめ、端から少し離れていると分かる程度にする',
    spec: [
      ['縦の線の長さ', '周りの文字の高さ（1em）'],
      ['空け幅', '8px（入れ子のカードの内側）'],
    ],
    tokens: {
      '--divider-vertical-length': '1em',
      '--divider-vertical-align': 'center',
      '--divider-inset': 'var(--card-nested-inset)',
    },
  },
];

const columns: Column[] = [
  { label: 'ツールバー', note: 'ボタンのあいだ' },
  { label: 'リンクの並び', note: 'フッター' },
  { label: 'メタ情報の行', note: '文の中' },
  { label: 'パネルの中の区切り', note: 'variant="inset"' },
];

// 並べたもののあいだに縦の線を置く。現行版は間だけ
const Row = ({
  candidate,
  gap,
  children,
}: {
  candidate: Candidate;
  gap: string;
  children: ReactNode[];
}) => (
  <div className={`flex w-max items-center ${gap}`}>
    {children.map((child, i) => (
      <Fragment key={i}>
        {i > 0 && candidate.id !== '現行版' && <Divider orientation="vertical" />}
        {child}
      </Fragment>
    ))}
  </div>
);

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={410}
      axis="縦の区切り線と、左右を空けた線"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        switch (column.label) {
          case 'ツールバー':
            return (
              <Row candidate={candidate} gap="gap-2">
                {[
                  <div key="edit" className="flex gap-1">
                    <Button variant="underline">元に戻す</Button>
                    <Button variant="underline">やり直す</Button>
                  </div>,
                  <div key="share" className="flex gap-1">
                    <Button variant="outline">共有</Button>
                    <Button color="primary">公開</Button>
                  </div>,
                ]}
              </Row>
            );
          case 'リンクの並び':
            return (
              <Row candidate={candidate} gap="gap-3">
                {[
                  <Link key="1" href="#terms">
                    利用規約
                  </Link>,
                  <Link key="2" href="#privacy">
                    プライバシー
                  </Link>,
                  <Link key="3" href="#contact">
                    お問い合わせ
                  </Link>,
                ]}
              </Row>
            );
          case 'メタ情報の行':
            return (
              <p className="w-[320px] text-sm text-fg-muted">
                2026 年 10 月 1 日{' '}
                {candidate.id === '現行版' ? (
                  '・'
                ) : (
                  <Divider orientation="vertical" className="mx-2" />
                )}{' '}
                5 分で読めます{' '}
                {candidate.id === '現行版' ? (
                  '・'
                ) : (
                  <Divider orientation="vertical" className="mx-2" />
                )}{' '}
                デザイン
              </p>
            );
          default:
            return (
              <div className="w-[280px] rounded-card border border-line py-2">
                {['下書き', '公開済み', 'ゴミ箱'].map((item, i) => (
                  <Fragment key={item}>
                    {i > 0 && <Divider variant={candidate.id === '現行版' ? 'full' : 'inset'} />}
                    <div className="px-(--spacing-control-x) py-2">
                      <Text>{item}</Text>
                    </div>
                  </Fragment>
                ))}
              </div>
            );
        }
      }}
    >
      <p>
        決定（ADR-0392 予定）:
        縦の線は周りの文字の高さ（B）。左右を空けた線（variant="inset"）は作らず、線は今の横線と同じく親の余白の中で幅いっぱいに伸ばす。左右を空けたいときは、置く側の余白か
        className で空ける。 候補の見た目は、トークンを畳む前のこのコミットで比べられます。
      </p>
      <p>
        Divider に orientation="vertical"
        を足し、横に並べたもの（ツールバー、リンクの並び、メタ情報の行）のあいだに縦の線を置けるようにします。また、左右の端を空けた線（variant="inset"）を足し、パネルの中の区切りに使えるようにします。
      </p>
      <p>
        選ぶのは、縦の線の長さ（並んだ行の高さいっぱいか、周りの文字の高さか）と、左右を空ける幅です。縦の線の左右の間は、置く側（並べる枠の
        gap）が決めます。
      </p>
    </Comparison>
  ),
};
