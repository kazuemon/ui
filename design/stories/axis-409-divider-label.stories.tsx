import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Divider } from '../../src/components/divider/Divider';
import { Link } from '../../src/components/link/Link';
import { Text } from '../../src/components/text/Text';

// 軸 409: Divider のラベル付きの線（label。「または」）の文字の大きさ・色・線とのあいだ
const meta = {
  title: 'Design Review/409 ラベル付きの区切り線',
  id: 'design-review-409-divider-label',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A,B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['A,B', '', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '線だけ（文字を置けない）',
    intent:
      'いまの Divider。文字を置く口がないので、「または」は線 2 本と文字を手で組むしかない。比べるための基準',
    spec: [['文字', '置けない']],
  },
  {
    id: 'A',
    name: 'キャプションの大きさ・淡い色',
    intent:
      '文字はキャプションと同じ小さくグレーの文字にし、線とは 12px 空ける。区切りの補足として、前後の内容より目立たせない',
    spec: [
      ['大きさ', 'キャプション（12px）'],
      ['色', 'いちばん淡い文字（subtle）'],
      ['太さ', 'ふつう'],
      ['線とのあいだ', '12px'],
    ],
    tokens: {
      '--divider-label-size': 'var(--text-caption)',
      '--divider-label-leading': 'var(--leading-caption)',
      '--divider-label-color': 'var(--color-fg-subtle)',
      '--divider-label-weight': 'normal',
      '--divider-label-gap': 'calc(var(--spacing) * 3)',
    },
  },
  {
    id: 'B',
    name: 'ラベルの大きさ・一段淡い色',
    intent:
      '文字を部品のラベルと同じ 14px にし、色は一段淡い muted。「または」が選択肢の区切りとして読める強さ。線とは 16px 空ける',
    spec: [
      ['大きさ', 'ラベル（14px）'],
      ['色', '一段淡い文字（muted）'],
      ['太さ', 'ふつう'],
      ['線とのあいだ', '16px'],
    ],
    tokens: {
      '--divider-label-size': 'var(--text-label)',
      '--divider-label-leading': 'var(--leading-label)',
      '--divider-label-color': 'var(--color-fg-muted)',
      '--divider-label-weight': 'normal',
      '--divider-label-gap': 'calc(var(--spacing) * 4)',
    },
  },
  {
    id: 'C',
    name: 'キャプションの大きさ・太字',
    intent:
      '小さい文字のまま太字にし、色は muted。小さくても見出しのように拾える。線とのあいだは 8px と詰める',
    spec: [
      ['大きさ', 'キャプション（12px）'],
      ['色', '一段淡い文字（muted）'],
      ['太さ', '太字'],
      ['線とのあいだ', '8px'],
    ],
    tokens: {
      '--divider-label-size': 'var(--text-caption)',
      '--divider-label-leading': 'var(--leading-caption)',
      '--divider-label-color': 'var(--color-fg-muted)',
      '--divider-label-weight': 'var(--font-weight-heading)',
      '--divider-label-gap': 'calc(var(--spacing) * 2)',
    },
  },
  {
    id: 'D',
    name: '本文の大きさ・本文の色',
    intent:
      '文字を入力欄の文字と同じ大きさ・本文の色にする。線より文字が主役になり、区切りというより小見出しに近い',
    spec: [
      ['大きさ', '部品の文字（16px。指では変わる）'],
      ['色', '本文の色'],
      ['太さ', 'ふつう'],
      ['線とのあいだ', '16px'],
    ],
    tokens: {
      '--divider-label-size': 'var(--text-control)',
      '--divider-label-leading': 'var(--leading-control)',
      '--divider-label-color': 'var(--color-fg)',
      '--divider-label-weight': 'normal',
      '--divider-label-gap': 'calc(var(--spacing) * 4)',
    },
  },
];

const columns: Column[] = [
  { label: 'サインイン', note: 'ボタンのあいだの「または」' },
  { label: '長い文字', note: '文と一緒に置く' },
  { label: '要素を渡す', note: 'label にリンクを含む' },
  { label: '狭い幅', note: '幅 200px・折り返す' },
];

const DividerFor = ({ candidate, label }: { candidate: Candidate; label: ReactNode }) =>
  candidate.id === '現行版' ? <Divider /> : <Divider label={label} />;

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={409}
      axis="ラベル付きの区切り線"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        switch (column.label) {
          case 'サインイン':
            return (
              <div className="flex w-[320px] flex-col gap-4">
                <Button variant="outline">Google でサインイン</Button>
                <DividerFor candidate={candidate} label="または" />
                <Button color="primary">メールアドレスでサインイン</Button>
              </div>
            );
          case '長い文字':
            return (
              <div className="flex w-[360px] flex-col gap-4">
                <Text>ここまでが今月の記事です。</Text>
                <DividerFor candidate={candidate} label="ここから先は 2025 年の記事" />
                <Text>去年の振り返りの記事です。</Text>
              </div>
            );
          case '要素を渡す':
            return (
              <div className="w-[360px]">
                <DividerFor
                  candidate={candidate}
                  label={
                    <>
                      さらに 12 件 <Link href="#more">すべて見る</Link>
                    </>
                  }
                />
              </div>
            );
          default:
            return (
              <div className="w-[200px] rounded-card border border-dashed border-line p-2">
                <DividerFor candidate={candidate} label="ほかの方法でサインインする" />
              </div>
            );
        }
      }}
    >
      <p>
        決定（ADR-0391 予定）:
        A（キャプションの大きさ・淡い色・12px）を既定にし、B（ラベルの大きさ・一段淡い色・16px）も
        labelSize="sm" で選べる。 候補の見た目は、トークンを畳む前のこのコミットで比べられます。
      </p>
      <p>
        Divider に label を足し、細い線のあいだに文字（「または」など）を置きます。文字は ReactNode
        なので要素も渡せます。文字は読み上げでもそのまま読まれ、線は読み上げから外れます。
      </p>
      <p>
        選ぶのは、文字の大きさ・色・太さと、文字と左右の線のあいだです。文字は真ん中に置きます（左に寄せる形は、要るなら別の軸にします）。
      </p>
    </Comparison>
  ),
};
