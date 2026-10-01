import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';

import { landscape, landscapeTiny } from './axis-image-samples';
import { type Candidate, type Column, Comparison } from './Comparison';
import { Image } from '../../src/components/image/Image';

// 軸 492: Image の仮画像（placeholder）から、読み込めた本物への切り替わり方
const meta = {
  title: 'Design Review/492 仮画像から本物への切り替わり',
  id: 'design-review-492-image-reveal',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A' },
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

/** 読み込み中（1.5 秒）と読み込めた（2.5 秒）を繰り返す。どの行も同じ時刻に切り替わる */
function useCycle() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setLoaded((v) => !v), loaded ? 2500 : 1500);
    return () => clearTimeout(id);
  }, [loaded]);
  return loaded;
}

function Cycling({ placeholder }: { placeholder?: string }) {
  const loaded = useCycle();
  return (
    <Image
      src={loaded ? landscape : undefined}
      alt="空と山の絵"
      ratio="16 / 9"
      placeholder={placeholder}
    />
  );
}

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '仮画像なし',
    intent:
      'いまの Image。読み込み中は光の横切る面を置き、読み込めたら本物をすぐ出す。比べるための基準',
    spec: [
      ['読み込み中', '読み込み中の面'],
      ['切り替わり', 'すぐ'],
    ],
  },
  {
    id: 'A',
    name: 'すぐ替える',
    intent: '仮画像をぼかして敷き、読み込めたら本物をすぐ重ねる。動きはない',
    spec: [
      ['読み込み中', 'ぼかした仮画像'],
      ['切り替わり', 'すぐ（0s）'],
    ],
    tokens: { '--image-reveal-duration': '0s', '--image-reveal-from-blur': '0px' },
  },
  {
    id: 'B',
    name: 'ふわっと（短く）',
    intent: '本物を仮画像の上に、短く透明から重ねる。状態の移り変わりと同じ速さで、待たせない',
    spec: [
      ['読み込み中', 'ぼかした仮画像'],
      ['切り替わり', '透明から重ねる（250ms・ease-out）'],
    ],
    tokens: {
      '--image-reveal-duration': 'var(--duration-slow)',
      '--image-reveal-from-blur': '0px',
    },
  },
  {
    id: 'C',
    name: 'ふわっと（ゆっくり）',
    intent:
      'B と同じ重ね方を、倍の長さにする。替わったことがはっきり分かるが、出るまでが少し遅く見える',
    spec: [
      ['読み込み中', 'ぼかした仮画像'],
      ['切り替わり', '透明から重ねる（500ms・ease-out）'],
    ],
    tokens: {
      '--image-reveal-duration': 'calc(var(--duration-slow) * 2)',
      '--image-reveal-from-blur': '0px',
    },
  },
  {
    id: 'D',
    name: 'ぼかしが晴れる',
    intent:
      '本物を、仮画像と同じぼかしのまま透明から重ね、重ねながらぼかしを解く。仮画像からピントが合っていくように見える',
    spec: [
      ['読み込み中', 'ぼかした仮画像'],
      ['切り替わり', '透明＋ぼかしから、くっきりへ（500ms・ease-out）'],
    ],
    tokens: {
      '--image-reveal-duration': 'calc(var(--duration-slow) * 2)',
      '--image-reveal-from-blur': 'var(--image-placeholder-blur)',
    },
  },
];

const columns: Column[] = [
  { label: '読み込み中', note: 'src がまだない' },
  { label: '切り替わり', note: '読み込み中 1.5 秒・読み込めた 2.5 秒を繰り返す' },
  { label: '読み込めた', note: '' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={492}
      axis="仮画像から本物への切り替わり"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const placeholder = candidate.id === '現行版' ? undefined : landscapeTiny;
        return (
          <div className="w-72">
            {column.label === '切り替わり' ? (
              <Cycling placeholder={placeholder} />
            ) : (
              <Image
                src={column.label === '読み込めた' ? landscape : undefined}
                alt="空と山の絵"
                ratio="16 / 9"
                placeholder={placeholder}
              />
            )}
          </div>
        );
      }}
    >
      <p>
        決定:
        仮画像があるときは、読み込めたら本物にすぐ替える（A）。仮画像がないときは今のまま。ユーザーの返事「仮画像があるときは
        A でいいなと思いました。」候補の見た目は、トークンを畳む前のこのコミットで比べられます。
      </p>
      <p>
        Image に、読み込むまで敷く仮画像（placeholder。数十 px に縮めた画像の URL か、BlurHash
        を描いた要素）を足しました。仮画像はぼかして枠いっぱいに広げ、読み込めたら本物に替えます。ぼかしの強さは軸
        493 で比べます。
      </p>
      <p>
        選ぶのは、本物に替わるときの動きです。「切り替わり」の列が、読み込み中と読み込めたを繰り返します。動きを減らす設定では、どの案もすぐ替えます。仮画像を渡さないとき（現行版）は、今まで通り面からすぐ替えます。
      </p>
    </Comparison>
  ),
};
