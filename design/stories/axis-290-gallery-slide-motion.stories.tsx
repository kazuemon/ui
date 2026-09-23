import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { GalleryFrame } from './gallery-frame';

// 軸 290: Gallery で前後の画像へ送るときの動き
//   値は tokens.css の --gallery-slide-distance（1 は画面の外まで、0 はその場）・--gallery-slide-fade（1 は濃さも変える）・
//   --gallery-slide-duration・--gallery-slide-ease。候補はこの上書きだけで作る。全案（現行版を含む）で値を明示する
//   動きを減らす設定では、どの案も動かさずにすぐ入れ替える（原則14）。確かめるときは OS の設定を切る
const meta = {
  title: 'Design Review/290 Gallery で送るときの動き',
  id: 'design-review-290-gallery-slide-motion',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current,A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'current,A'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '少し滑って入れ替わる',
    intent:
      '前の画像は送る向きの反対へ少しずれながら消え、次の画像は送る向きから少しずれた位置から現れる。どちらへ送ったか（前か次か）が分かり、動きは小さい。指ではじいたときは、指を離した位置から続けて動く',
    spec: [
      ['動く距離', '画面の外までの 12%'],
      ['濃さ', '変える'],
      ['長さ・緩急', '200ms・シートと同じ（--ease-sheet）'],
    ],
    tokens: {
      '--gallery-slide-distance': '0.12',
      '--gallery-slide-fade': '1',
      '--gallery-slide-duration': 'var(--duration-normal)',
      '--gallery-slide-ease': 'var(--ease-sheet)',
    },
  },
  {
    id: 'A',
    name: '幅いっぱいに滑る',
    intent:
      '画像が横に並んだ帯のように、前の画像が画面の外へ出て、次の画像が反対の端から入ってくる。スマートフォンの写真の一覧と同じ動きで、指ではじいた動きとつながる。動きがいちばん大きい',
    spec: [
      ['動く距離', '画面の外まで'],
      ['濃さ', '変えない'],
      ['長さ・緩急', '250ms・シートと同じ（--ease-sheet）'],
    ],
    tokens: {
      '--gallery-slide-distance': '1',
      '--gallery-slide-fade': '0',
      '--gallery-slide-duration': 'var(--duration-slow)',
      '--gallery-slide-ease': 'var(--ease-sheet)',
    },
  },
  {
    id: 'B',
    name: 'その場で入れ替わる',
    intent:
      '位置は動かさず、前の画像が消えて次の画像が現れる。いちばん静かだが、前と次のどちらへ送ったかは動きでは分からない（Calendar の monthTransition="fade" と同じ考え）',
    spec: [
      ['動く距離', '0（その場）'],
      ['濃さ', '変える'],
      ['長さ・緩急', '150ms・シートと同じ（--ease-sheet）'],
    ],
    tokens: {
      '--gallery-slide-distance': '0',
      '--gallery-slide-fade': '1',
      '--gallery-slide-duration': 'var(--popup-duration-out)',
      '--gallery-slide-ease': 'var(--ease-sheet)',
    },
  },
  {
    id: 'C',
    name: '動かさない',
    intent:
      'すぐに次の画像に切り替える。続けて何枚も送っても待たされない（Calendar で月を送るときの既定と同じ）。指ではじいたときは、ずらした画像がその場で入れ替わる',
    spec: [
      ['動く距離', '—'],
      ['濃さ', '—'],
      ['長さ・緩急', '0ms'],
    ],
    tokens: {
      '--gallery-slide-distance': '0',
      '--gallery-slide-fade': '1',
      '--gallery-slide-duration': '0ms',
      '--gallery-slide-ease': 'var(--ease-sheet)',
    },
  },
];

const columns: Column[] = [
  {
    label: 'パソコン',
    note: '‹ › を押すか、枠の中を一度押してから ←→ キーで送る。押すと閉じ、並んだ画像を押すとまた開く',
  },
  {
    label: 'スマートフォン',
    note: '開発者ツールで指の操作にして、左右にはじいて送る（上下に引くと閉じる）',
  },
];

export const SlideMotion: Story = {
  name: '送るときの動き',
  render: ({ pick }) => (
    <Comparison
      pick={pick}
      index={290}
      axis="Gallery で送るときの動き"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <GalleryFrame
          key={candidate.id}
          device={column.label === 'パソコン' ? 'desktop' : 'phone'}
          open
        />
      )}
    >
      <p>
        <strong>
          決定: current（少し滑って入れ替わる）を既定にし、A（幅いっぱいに滑る）も
          slideMotion="slide" で選べる。B・C は採らない。
        </strong>
      </p>
      <p>
        拡大した面で、前後の画像へ送るとき（‹ ›・←→
        キー・指で左右にはじく）の動きを選びます。各枠は開いたまま描いています。送ってみてください。OS
        の「視差効果を減らす」（動きを減らす設定）がオンだと、どの案も動かずにすぐ入れ替わります。
      </p>
      <p>
        推奨は current
        です。動きは「ものがどこから来てどこへ行ったか」を伝えるためのもので、少し滑らせると、前と次のどちらへ送ったかが分かります。距離が小さいので、続けて送っても待たされる感じが出にくく、指ではじいたときも、離した位置から同じ向きへ続きます。A
        は指の動きといちばんつながりますが、パソコンでボタンを押して送るには大きい動きです。B・C は
        Calendar
        で月を送るときに選んだ形（既定は動かさない、その場でふわっとも選べる）と同じ考えで、静かですが、送った向きは分かりません。
      </p>
      <p>
        既定をどれにしますか。「current
        を既定にして、C（動かさない）も選べる」のように、既定と選べる形の組み合わせにもできます（props
        は、たとえば <code>slideMotion="slide" | "fade" | "none"</code> を想定しています）。
      </p>
    </Comparison>
  ),
};
