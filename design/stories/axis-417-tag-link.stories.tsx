import { HashIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { MouseEvent } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Heading } from '../../src/components/heading/Heading';
import { Icon } from '../../src/components/icon/Icon';
import { Tag, type TagProps } from '../../src/components/tag/Tag';
import { Text } from '../../src/components/text/Text';
import { statePseudo } from '../../src/stories/story-states';

// 軸 417: Tag をリンクにしたときの、押せる見た目（hover・押下・フォーカス）
const meta = {
  title: 'Design Review/417 リンクのタグ',
  id: 'design-review-417-tag-link',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({
      hover: '[data-slot="tag"]',
      active: '[data-slot="tag"]',
      focusVisible: '[data-slot="tag"]',
    }),
  },
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
    name: '手応えなし',
    intent:
      'href を付けても見た目は押せないタグのまま。形が変わらないのでリンクだと気づきにくい。比べるための基準（フォーカスの線だけは付ける）',
    spec: [
      ['hover', '変わらない'],
      ['押下', '変わらない'],
      ['影', 'なし'],
    ],
    tokens: {
      '--tag-link-hover-mix': '0%',
      '--tag-link-press-mix': '0%',
      '--tag-link-hover-decoration': 'none',
      '--tag-link-shadow': 'none',
      '--tag-link-shadow-hover': 'none',
      '--tag-link-shadow-press': 'none',
      '--tag-link-press-depth': '0px',
    },
  },
  {
    id: 'A',
    name: '平らな押すもの（文字の色を淡く敷く）',
    intent:
      '枠線のボタンやタブと同じ仲間。hover で文字の色を淡く敷き、押すと敷く色が濃くなって 1px 沈む。タグはページに着いているので影は付けない',
    spec: [
      ['hover', '文字の色を 8% 敷く'],
      ['押下', '16% 敷く・1px 沈む'],
      ['影', 'なし'],
    ],
    tokens: {
      '--tag-link-hover-mix': 'var(--flat-hover-mix)',
      '--tag-link-press-mix': 'var(--flat-press-mix)',
      '--tag-link-hover-decoration': 'none',
      '--tag-link-shadow': 'none',
      '--tag-link-shadow-hover': 'none',
      '--tag-link-shadow-press': 'none',
      '--tag-link-press-depth': 'var(--flat-press-depth)',
    },
  },
  {
    id: 'B',
    name: '文字のリンク（hover で下線）',
    intent:
      '文字のリンクに寄せる。面は変えず、hover で下線を出し、押すと 1px 沈む。文章の中のタグでも目立ちすぎない',
    spec: [
      ['hover', '下線を出す'],
      ['押下', '下線のまま 1px 沈む'],
      ['影', 'なし'],
    ],
    tokens: {
      '--tag-link-hover-mix': '0%',
      '--tag-link-press-mix': '0%',
      '--tag-link-hover-decoration': 'underline',
      '--tag-link-shadow': 'none',
      '--tag-link-shadow-hover': 'none',
      '--tag-link-shadow-press': 'none',
      '--tag-link-press-depth': 'var(--flat-press-depth)',
    },
  },
  {
    id: 'C',
    name: '浮いた押すもの（薄い影）',
    intent:
      '全体が押せるカードと同じ仲間にする。ふだんから薄い影で少し浮かせ、hover で影を減らして淡く敷き、押すと沈む。押せないタグと形で見分けられる',
    spec: [
      ['ふだん', 'ボタンと同じ薄い影'],
      ['hover', '影を減らし 8% 敷く'],
      ['押下', '16% 敷く・1px 沈む'],
    ],
    tokens: {
      '--tag-link-hover-mix': 'var(--flat-hover-mix)',
      '--tag-link-press-mix': 'var(--flat-press-mix)',
      '--tag-link-hover-decoration': 'none',
      '--tag-link-shadow': 'var(--shadow-raised)',
      '--tag-link-shadow-hover': 'var(--shadow-raised-hover)',
      '--tag-link-shadow-press': 'var(--shadow-raised-press)',
      '--tag-link-press-depth': 'var(--press-depth)',
    },
  },
  {
    id: 'D',
    name: '淡く敷く＋下線',
    intent: 'A に B の下線を足す。面の手応えと、リンクらしさの両方で返す。変わるものが 2 つになる',
    spec: [
      ['hover', '8% 敷く・下線を出す'],
      ['押下', '16% 敷く・1px 沈む'],
      ['影', 'なし'],
    ],
    tokens: {
      '--tag-link-hover-mix': 'var(--flat-hover-mix)',
      '--tag-link-press-mix': 'var(--flat-press-mix)',
      '--tag-link-hover-decoration': 'underline',
      '--tag-link-shadow': 'none',
      '--tag-link-shadow-hover': 'none',
      '--tag-link-shadow-press': 'none',
      '--tag-link-press-depth': 'var(--flat-press-depth)',
    },
  },
];

const stateColumns: Column[] = [
  { label: '通常', note: 'sm・md・lg。押して確かめられます' },
  { label: 'hover', preview: 'hover' },
  { label: '押下', preview: 'active' },
  { label: 'フォーカス', note: 'キーボード', preview: 'focus' },
];
const columns: Column[] = [
  ...stateColumns,
  { label: '色（hover）', note: '7 色', preview: 'hover' },
  { label: '形（hover）', note: 'outline・solid（軸 418 の A）', preview: 'hover' },
  { label: 'ブログの記事の見出し', note: 'ふだんの見た目' },
];

const colors = ['primary', 'secondary', 'neutral', 'info', 'success', 'warning', 'danger'] as const;
const go = (event: MouseEvent) => event.preventDefault();
const LinkTag = (props: TagProps) => <Tag href="#tags/design" onClick={go} {...props} />;

function Cell({ column }: { column: Column }) {
  if (column.label.startsWith('色')) {
    return (
      <div className="flex w-[220px] flex-wrap gap-2">
        {colors.map((color) => (
          <LinkTag key={color} color={color}>
            {color}
          </LinkTag>
        ))}
      </div>
    );
  }
  if (column.label.startsWith('形')) {
    return (
      <div className="flex flex-col items-start gap-2">
        <div className="flex gap-2">
          <LinkTag variant="outline">デザイン</LinkTag>
          <LinkTag variant="outline" color="primary">
            React
          </LinkTag>
        </div>
        <div className="flex gap-2">
          <LinkTag variant="solid">デザイン</LinkTag>
          <LinkTag variant="solid" color="primary">
            React
          </LinkTag>
        </div>
      </div>
    );
  }
  if (column.label.startsWith('ブログ')) {
    return (
      <div className="flex w-[260px] flex-col gap-2">
        <Heading level={3} size="md">
          デザインシステムを 1 軸ずつ決める
        </Heading>
        <Text size="sm" variant="muted">
          2026-10-01
        </Text>
        <div className="flex flex-wrap gap-1.5">
          <LinkTag icon={<Icon icon={HashIcon} />}>デザイン</LinkTag>
          <LinkTag icon={<Icon icon={HashIcon} />}>React</LinkTag>
          <LinkTag icon={<Icon icon={HashIcon} />}>Storybook</LinkTag>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-start gap-2">
      <LinkTag size="sm">デザイン</LinkTag>
      <LinkTag size="md" color="primary">
        デザイン
      </LinkTag>
      <LinkTag size="lg">デザイン</LinkTag>
    </div>
  );
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={417}
      axis="リンクのタグ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <Cell column={column} />}
    >
      <p>
        Tag に href を渡すと a で描き、render にルーターのリンク（Next.js の Link
        など）を渡すとその要素に重ねます。記事のタグから、そのタグの一覧のページへ移る使い方です。render
        だけでは部品からリンクか分からないので、リンクとして描くかを link で明示します（href
        があれば既定で true）。
      </p>
      <p>
        選ぶのは、押せるタグの手応えです。どの案もキーボードのフォーカスの線は付けます。押せないタグ（href
        なし）は今と変わりません。
      </p>
    </Comparison>
  ),
};
