import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Link } from '../../src/components/link/Link';
import { Text } from '../../src/components/text/Text';
import { statePseudo } from '../../src/stories/story-states';

// 軸 445: 文字のリンクの下線を載せたときだけ出す形（underline="hover"）。載せたときの下線の濃さ
const meta = {
  title: 'Design Review/445 載せたときだけ出す下線',
  id: 'design-review-445-link-underline-hover',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({ hover: 'a', focusVisible: 'a' }),
  },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'いつも下線（always）',
    intent:
      'いまのリンク。ふだんから淡い下線があり、載せると下線だけが濃くなる。underline の既定はこのまま',
    spec: [
      ['ふだん', '淡い下線'],
      ['載せたとき', '濃い下線'],
    ],
  },
  {
    id: 'A',
    name: 'hover だけ・濃い下線',
    intent:
      'ふだんは下線を引かず、載せたときに always の hover と同じ濃い下線を引く。下線の出方がはっきりしていて、押せると分かる',
    spec: [
      ['ふだん', 'なし'],
      ['載せたとき', '濃い下線（文字の色を 30% 暗く）'],
    ],
    tokens: { '--link-underline-hover-only': 'var(--color-link-underline-hover)' },
  },
  {
    id: 'B',
    name: 'hover だけ・淡い下線',
    intent:
      '載せたときに always のふだんと同じ淡い下線を引く。変化が控えめで、並んだリンクの上を動かしてもちらつかない',
    spec: [
      ['ふだん', 'なし'],
      ['載せたとき', '淡い下線（文字の色 35%）'],
    ],
    tokens: { '--link-underline-hover-only': 'var(--color-link-underline)' },
  },
];

const columns: Column[] = [
  { label: '通常' },
  { label: 'hover', preview: 'hover' },
  { label: 'フォーカス', note: 'キーボード', preview: 'focus' },
  { label: 'フッターの並び', note: 'neutral' },
  { label: '周りの色・hover', note: 'color="inherit"・danger の文', preview: 'hover' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={445}
      axis="載せたときだけ出す下線"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const underline = candidate.id === '現行版' ? 'always' : 'hover';
        switch (column.label) {
          case 'フッターの並び':
            return (
              <Text size="sm" className="flex gap-4 whitespace-nowrap">
                <Link href="#about" underline={underline}>
                  このサイトについて
                </Link>
                <Link href="#privacy" underline={underline}>
                  プライバシー
                </Link>
                <Link href="#rss" underline={underline}>
                  RSS
                </Link>
              </Text>
            );
          case '周りの色・hover':
            return (
              <Text color="danger">
                期日を過ぎています。
                <Link href="#extend" color="inherit" underline={underline}>
                  延長を申し込む
                </Link>
              </Text>
            );
          default:
            return (
              <Link href="#posts" color="primary" underline={underline}>
                記事の一覧へ
              </Link>
            );
        }
      }}
    >
      <p>
        Link（文字のリンク）に下線の出し方（underline）を足しました。always（既定・いまのまま）はいつも淡い下線、hover
        は載せたときだけ下線を引きます。ナビゲーションやフッターのように、並びそのものでリンクだと分かる場所に使い、文章の中は
        always のままにします。 あわせて color に
        inherit（周りの文字の色のまま）を足しました。下線も周りの色から作ります。
      </p>
      <p>選ぶのは、hover で載せたときに出す下線の濃さです。既定の推しは A（濃い下線）です。</p>
    </Comparison>
  ),
};
