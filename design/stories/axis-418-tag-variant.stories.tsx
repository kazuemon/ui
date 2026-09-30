import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Tag, type TagVariant } from '../../src/components/tag/Tag';

// 軸 418: Tag の形（variant）。soft（今）・outline・solid と、「まだない」の印の破線（dashed）
const meta = {
  title: 'Design Review/418 タグの形',
  id: 'design-review-418-tag-variant',
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
    name: 'soft だけ',
    intent: '淡い面に同じ色相の濃い文字、の 1 つだけ。形を選べない。比べるための基準',
    spec: [
      ['形', 'soft'],
      ['破線', '持たない'],
    ],
    tokens: {
      '--tag-outline-bg': 'transparent',
      '--tag-outline-border-mix': '45%',
      '--tag-dashed-border-mix': '60%',
    },
  },
  {
    id: 'A',
    name: '透明の面＋薄めた縁',
    intent:
      'outline は面を塗らず、文字の色を 45% に薄めた細い縁を引く（Chip の縁と同じ作り）。solid は Badge と同じ濃い塗りに白い文字。破線は持たない',
    spec: [
      ['outline の面', '透明'],
      ['outline の縁', '文字の色 45%'],
      ['solid', 'Badge と同じ濃い塗り'],
      ['破線', '持たない'],
    ],
    tokens: {
      '--tag-outline-bg': 'transparent',
      '--tag-outline-border-mix': '45%',
      '--tag-dashed-border-mix': '60%',
    },
  },
  {
    id: 'B',
    name: '白い面＋文字の色の縁',
    intent:
      'outline は白い面に、文字と同じ色の縁を引く。グレーの地の上でも白く抜けて輪郭がはっきりする。縁が濃いぶん、soft より強く見える',
    spec: [
      ['outline の面', '白（surface）'],
      ['outline の縁', '文字の色 100%'],
      ['solid', 'Badge と同じ濃い塗り'],
      ['破線', '持たない'],
    ],
    tokens: {
      '--tag-outline-bg': 'var(--color-surface)',
      '--tag-outline-border-mix': '100%',
      '--tag-dashed-border-mix': '100%',
    },
  },
  {
    id: 'C',
    name: 'A＋破線（まだない）',
    intent:
      'A に dashed を足す。面を塗らず、文字の色 60% の破線の縁で「まだない・予定」を表す（未公開の記事、準備中の機能）。実線の outline と並べても見分けられるよう、縁を少し濃くする',
    spec: [
      ['outline', 'A と同じ'],
      ['solid', 'A と同じ'],
      ['破線', '透明の面・文字の色 60%'],
    ],
    tokens: {
      '--tag-outline-bg': 'transparent',
      '--tag-outline-border-mix': '45%',
      '--tag-dashed-border-mix': '60%',
    },
  },
  {
    id: 'D',
    name: 'B＋破線（まだない）',
    intent:
      'B に dashed を足す。白い面に文字の色の破線。縁がはっきりしているので、破線の点が読みやすい',
    spec: [
      ['outline', 'B と同じ'],
      ['solid', 'B と同じ'],
      ['破線', '白い面・文字の色 100%'],
    ],
    tokens: {
      '--tag-outline-bg': 'var(--color-surface)',
      '--tag-outline-border-mix': '100%',
      '--tag-dashed-border-mix': '100%',
    },
  },
];

const columns: Column[] = [
  { label: 'soft（今）', note: '7 色' },
  { label: 'outline', note: '7 色' },
  { label: 'solid', note: '7 色' },
  { label: '破線（まだない）', note: '7 色' },
  { label: '大きさ', note: 'sm・md・lg' },
  { label: 'グレーの地の上', note: '入力欄やグレーの帯の上に置いたとき' },
];

const colors = ['primary', 'secondary', 'neutral', 'info', 'success', 'warning', 'danger'] as const;
const variantOf: Record<string, TagVariant> = {
  'soft（今）': 'soft',
  outline: 'outline',
  solid: 'solid',
  '破線（まだない）': 'dashed',
};
const hasDashed = (candidate: Candidate) => candidate.id === 'C' || candidate.id === 'D';

const None = ({ children }: { children: string }) => (
  <p className="text-xs text-fg-subtle">{children}</p>
);

function Cell({ column, candidate }: { column: Column; candidate: Candidate }) {
  const current = candidate.id === '現行版';
  const variant = variantOf[column.label];
  if (variant) {
    if (current && variant !== 'soft') return <None>選べない</None>;
    if (variant === 'dashed' && !hasDashed(candidate)) return <None>持たない</None>;
    return (
      <div className="flex w-[220px] flex-wrap gap-2">
        {colors.map((color) => (
          <Tag key={color} variant={variant} color={color}>
            {variant === 'dashed' ? '準備中' : color}
          </Tag>
        ))}
      </div>
    );
  }
  const shown: TagVariant[] = current
    ? ['soft']
    : ['soft', 'outline', 'solid', ...(hasDashed(candidate) ? (['dashed'] as const) : [])];
  if (column.label === '大きさ') {
    return (
      <div className="flex flex-col items-start gap-2">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} className="flex gap-2">
            {shown.map((v) => (
              <Tag key={v} variant={v} size={size} color="primary">
                {v}
              </Tag>
            ))}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex w-[240px] flex-col gap-2 rounded-control bg-field p-3">
      {(['neutral', 'primary'] as const).map((color) => (
        <div key={color} className="flex flex-wrap gap-2">
          {shown.map((v) => (
            <Tag key={v} variant={v} color={color}>
              {v}
            </Tag>
          ))}
        </div>
      ))}
    </div>
  );
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={418}
      axis="タグの形"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => <Cell column={column} candidate={candidate} />}
    >
      <p>
        Tag に形（variant）を足します。soft は今の淡い面、outline は縁と文字だけ、solid
        は濃い塗りに白い文字（Badge
        の数の丸と同じ塗り）です。どの形も寸法は同じで、縁の分は内側の余白から引きます。
      </p>
      <p>
        選ぶのは、outline
        の面と縁の濃さと、「まだない・予定」の印として破線（dashed）を持つかです。solid
        はどの案も同じです。
      </p>
    </Comparison>
  ),
};
