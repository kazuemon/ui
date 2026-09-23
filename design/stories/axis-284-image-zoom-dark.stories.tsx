import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { ArticleZoomFrame } from './image-zoom-frame';

// 軸 284: ImageZoom の variant="dark" の、後ろの面の濃さとキャプション・× の色を実際の記事のページで比べる
//   値は tokens.css の --image-zoom-dark-backdrop・--image-zoom-dark-backdrop-blur・--image-zoom-dark-caption-color・--image-zoom-dark-close-fg
//   候補はこの上書きだけで作る。全案（現行版を含む）で値を明示する
const meta = {
  title: 'Design Review/284 ImageZoom の dark の濃さ・ぼかし・文字の色',
  id: 'design-review-284-image-zoom-dark',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'I' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const dark = (percent: number, text: 'fg' | 'white', blur = false) => ({
  '--image-zoom-dark-backdrop': `rgb(from var(--color-shadow) r g b / ${percent / 100})`,
  '--image-zoom-dark-backdrop-blur': blur ? 'calc(var(--spacing) * 2)' : '0px',
  '--image-zoom-dark-caption-color': text === 'fg' ? 'var(--color-fg)' : 'var(--palette-white)',
  '--image-zoom-dark-close-fg': text === 'fg' ? 'var(--color-fg)' : 'var(--palette-white)',
});

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '30%・黒い文字',
    intent:
      'Dialog と同じ後ろの暗さ。ページがはっきり透け、地はグレーに見える。文字は黒（コントラスト 7.6）',
    spec: [
      ['地', '濃紺 30%'],
      ['ぼかし', 'なし'],
      ['キャプション・×', '黒'],
    ],
    tokens: dark(30, 'fg'),
  },
  {
    id: 'A',
    name: '60%・白い文字',
    intent: 'ページの形は分かる濃さ。白い文字はぎりぎり読める（コントラスト 3.9）',
    spec: [
      ['地', '濃紺 60%'],
      ['ぼかし', 'なし'],
      ['キャプション・×', '白'],
    ],
    tokens: dark(60, 'white'),
  },
  {
    id: 'B',
    name: '80%・白い文字',
    intent: 'ページはうっすら残る程度。黒い地に白い文字として読める（コントラスト 7.3）',
    spec: [
      ['地', '濃紺 80%'],
      ['ぼかし', 'なし'],
      ['キャプション・×', '白'],
    ],
    tokens: dark(80, 'white'),
  },
  {
    id: 'C',
    name: '90%・白い文字',
    intent: 'ほぼ黒で覆う。画像だけが残る。写真を見せる作品のページ向け（コントラスト 10.1）',
    spec: [
      ['地', '濃紺 90%'],
      ['ぼかし', 'なし'],
      ['キャプション・×', '白'],
    ],
    tokens: dark(90, 'white'),
  },
  {
    id: 'D',
    name: '30%・ぼかし・黒い文字',
    intent: 'current にぼかしを足す。地はグレーのまま、後ろの文は読めなくなる',
    spec: [
      ['地', '濃紺 30%'],
      ['ぼかし', '8px'],
      ['キャプション・×', '黒'],
    ],
    tokens: dark(30, 'fg', true),
  },
  {
    id: 'E',
    name: '60%・ぼかし・白い文字',
    intent: 'A にぼかしを足す',
    spec: [
      ['地', '濃紺 60%'],
      ['ぼかし', '8px'],
      ['キャプション・×', '白'],
    ],
    tokens: dark(60, 'white', true),
  },
  {
    id: 'F',
    name: '80%・ぼかし・白い文字',
    intent: 'B にぼかしを足す',
    spec: [
      ['地', '濃紺 80%'],
      ['ぼかし', '8px'],
      ['キャプション・×', '白'],
    ],
    tokens: dark(80, 'white', true),
  },
  {
    id: 'G',
    name: '90%・ぼかし・白い文字',
    intent: 'C にぼかしを足す',
    spec: [
      ['地', '濃紺 90%'],
      ['ぼかし', '8px'],
      ['キャプション・×', '白'],
    ],
    tokens: dark(90, 'white', true),
  },
  {
    id: 'H',
    name: '65%・ぼかし・白い文字',
    intent: 'E を少し濃くし、白い文字のコントラストを 4.5 に届かせる',
    spec: [
      ['地', '濃紺 65%'],
      ['ぼかし', '8px'],
      ['キャプション・×', '白'],
    ],
    tokens: dark(65, 'white', true),
  },
  {
    id: 'I',
    name: '70%・ぼかし・白い文字',
    intent: 'E をさらに濃くする（コントラスト 5.3）',
    spec: [
      ['地', '濃紺 70%'],
      ['ぼかし', '8px'],
      ['キャプション・×', '白'],
    ],
    tokens: dark(70, 'white', true),
  },
];

const columns: Column[] = [
  { label: 'パソコン', note: '見本のページの記事（幅 960px）' },
  { label: 'スマートフォン', note: '同じ記事（幅 375px）' },
];

export const Dark: Story = {
  name: 'dark の濃さと文字の色',
  render: ({ pick }) => (
    <Comparison
      pick={pick}
      index={284}
      axis="ImageZoom の dark の濃さと文字の色（実際の記事のページで）"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <ArticleZoomFrame
          key={candidate.id}
          device={column.label === 'パソコン' ? 'desktop' : 'phone'}
          variant="dark"
        />
      )}
    >
      <p>
        <strong>
          決定: I（濃紺 70%・ぼかし 8px・白い文字）。白い文字のコントラストが 4.5
          を超える濃さにした。
        </strong>
      </p>
      <p>
        variant="dark" の後ろの面の濃さと、キャプション・閉じる ×
        の色を選びます。白い地には黒い文字、暗い地には白い文字にします。拡大した状態で並べています。×
        や Esc で閉じ、画像を押すとまた開きます。light
        のキャプションは、今回から黒（本文の濃さ）にしています。
      </p>
      <p>既定にする案を 1 つ選んでください。</p>
    </Comparison>
  ),
};
