import type { Meta, StoryObj } from '@storybook/react-vite';

import { Thumbnails } from '../../src/components/thumbnails/Thumbnails';
import { thumbs } from './carousel-parts';
import { type Candidate, type Column, Comparison } from './Comparison';

// 軸 288: Thumbnails の選んでいる印
//   値は tokens.css の --thumbnails-bar-height・--thumbnails-rest-opacity・--thumbnails-hover-opacity。
//   決めたときの案 A（ほかを薄く）・C（内側の線）・D（淡い輪で強調）は採らなかったので、案とそのためのトークンを外した。
//   候補はこの上書きだけで作る。全案（現行版を含む）で値を明示する。hover の淡い塗りと押したときの沈みは全案で同じ
const meta = {
  title: 'Design Review/288 Thumbnails の選んでいる印',
  id: 'design-review-288-thumbnails-selected',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      hover: ['[data-preview="hover"] [data-slot="thumbnails-item"]:nth-child(2)'],
      focusVisible: ['[data-preview="focus"] [data-slot="thumbnails-item"]:nth-child(1)'],
    },
  },
  args: { pick: 'current,B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'B', 'current,B'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '下に棒',
    intent:
      '選んでいる画像の下に、離して棒を引く（Tabs の line の印と同じ太さ・色）。ほかの画像は薄くしないので、どの画像も同じ濃さで見比べられる',
    spec: [
      ['--thumbnails-bar-height', '2px'],
      ['--thumbnails-rest-opacity', '1'],
      ['--thumbnails-hover-opacity', '1'],
    ],
    tokens: {
      '--thumbnails-bar-height': 'var(--border-width-thick)',
      '--thumbnails-rest-opacity': '1',
      '--thumbnails-hover-opacity': '1',
    },
  },
  {
    id: 'B',
    name: '棒＋ほかを少し薄く',
    intent:
      'current の棒に、選んでいない画像を 60% に薄くするのを足す。いちばんはっきりするが、変わるものが 2 つになる',
    spec: [
      ['--thumbnails-bar-height', '2px'],
      ['--thumbnails-rest-opacity', '0.6'],
      ['--thumbnails-hover-opacity', '0.85'],
    ],
    tokens: {
      '--thumbnails-bar-height': 'var(--border-width-thick)',
      '--thumbnails-rest-opacity': '0.6',
      '--thumbnails-hover-opacity': '0.85',
    },
  },
];

const columns: Column[] = [
  { label: '通常', note: '1 つ目を選んでいる' },
  { label: 'hover', note: '2 つ目に載せている', preview: 'hover' },
  { label: 'フォーカス（キーボード）', note: '選んでいる 1 つ目', preview: 'focus' },
  { label: 'primary', note: 'color="primary"' },
];

export const Selected: Story = {
  name: '選んでいる印',
  render: ({ pick }) => (
    <Comparison
      pick={pick}
      index={288}
      axis="Thumbnails の選んでいる印"
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <div className="w-80">
          <Thumbnails color={column.label === 'primary' ? 'primary' : 'neutral'}>
            {thumbs.slice(0, 3)}
          </Thumbnails>
        </div>
      )}
    >
      <p>
        <strong>
          決定: current（下に棒）を既定にし、B（棒＋ほかを少し薄く）も indicator="underline-dim"
          で選べる。A（ほかを薄く）・C（内側の線）・D（淡い輪で強調）は採らない。
        </strong>
      </p>
      <p>
        小さな画像の帯で、いま選んでいる 1
        つをどう示すかを選びます。どちらの案でも、選んでいない画像に載せると本文の色を淡く敷き（平らな押すもの）、押すと沈みます。
      </p>
      <p>
        current は Tabs
        の選んだタブの印と同じ棒で、ほかの画像を薄くしないので押せないものと紛れません（原則13）。B
        は棒に加えてほかを少し薄くし、選んでいる 1 つをよりはっきり見せます。D（Timeline
        の強調に倣った淡い輪）も比べましたが、見づらくなったので採りませんでした。
      </p>
    </Comparison>
  ),
};
