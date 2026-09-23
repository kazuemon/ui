import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { ArticleZoomFrame } from './image-zoom-frame';

// 軸 283: ImageZoom の後ろの面（variant="light"）の、地の色の濃さを実際の記事のページで比べる
//   値は tokens.css の --image-zoom-backdrop（地の色を混ぜる割合）。ぼかし（--image-zoom-backdrop-blur）は全案 8px のまま
//   候補はこの上書きだけで作る。全案（現行版を含む）で値を明示する
const meta = {
  title: 'Design Review/283 ImageZoom の後ろの面の濃さ',
  id: 'design-review-283-image-zoom-backdrop-strength',
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

const strength = (percent: number) => ({
  '--image-zoom-backdrop': `color-mix(in oklab, var(--color-bg) ${percent}%, transparent)`,
  '--image-zoom-backdrop-blur': 'calc(var(--spacing) * 2)',
});

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '地の色 92%',
    intent:
      '軸 279 で比べた濃さ。後ろのページは、見出しや帯の形がかすかに分かる程度で、文字は読めない',
    spec: [
      ['地の色', '92%'],
      ['ぼかし', '8px'],
    ],
    tokens: strength(92),
  },
  {
    id: 'A',
    name: '地の色 80%',
    intent:
      'いちばん薄い。後ろの記事の見出しや段落の並びが透けて、記事の上に画像を重ねていることがよく分かる。画像のまわりが少しにぎやかになる',
    spec: [
      ['地の色', '80%'],
      ['ぼかし', '8px'],
    ],
    tokens: strength(80),
  },
  {
    id: 'B',
    name: '地の色 88%',
    intent: 'A と current のあいだ。見出しの位置は分かり、文の行はほぼ消える',
    spec: [
      ['地の色', '88%'],
      ['ぼかし', '8px'],
    ],
    tokens: strength(88),
  },
  {
    id: 'C',
    name: '地の色 96%',
    intent: 'ほぼ白で覆う。画像だけが残り、いちばん静かだが、記事の上にいることは分かりにくい',
    spec: [
      ['地の色', '96%'],
      ['ぼかし', '8px'],
    ],
    tokens: strength(96),
  },
];

const columns: Column[] = [
  { label: 'パソコン', note: '見本のページの記事（幅 960px）' },
  { label: 'スマートフォン', note: '同じ記事（幅 375px）' },
];

export const Strength: Story = {
  name: '後ろの面の濃さ',
  render: ({ pick }) => (
    <Comparison
      pick={pick}
      index={283}
      axis="ImageZoom の後ろの面の濃さ（実際の記事のページで）"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <ArticleZoomFrame
          key={candidate.id}
          device={column.label === 'パソコン' ? 'desktop' : 'phone'}
        />
      )}
    >
      <p>
        <strong>
          決定: B（地の色 88%）を既定にする。見出しの位置は分かり、文の行はほぼ消える濃さ。
        </strong>
      </p>
      <p>
        軸 279
        で既定にした「地の色で覆ってぼかす」後ろの面の、地の色の濃さを選びます。見本のページの記事（ヘッダー・見出し・文・リスト）の冒頭に拡大できる画像を置き、拡大した状態で並べています。×
        や Esc で閉じ、画像を押すとまた開きます。ぼかしはどの案も 8px です。
      </p>
      <p>
        推奨は
        current（92%）です。見出しや帯の形だけがかすかに残り、記事の上に画像を重ねていることは分かりつつ、後ろの文字が画像と競いません。A（80%）・B（88%）は記事の並びが透け、画像のまわりが少しにぎやかになります。C（96%）はほぼ白の画面になり、記事から離れたように見えます。
      </p>
      <p>既定にする濃さを 1 つ選んでください。</p>
    </Comparison>
  ),
};
