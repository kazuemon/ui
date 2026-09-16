import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';

import { Button } from '../../src/components/Button';
import { Select } from '../../src/components/Select';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 33: 浮かぶ選択肢の開閉の動き
// いまは 98% の大きさと濃さ 0 から 0.1 秒の仮の動き（ADR-0036）で、ほとんど動いて見えない
// 変えるのは次のトークンだけ（src/components/Select.tsx の浮かぶ部分が読む）
//   --select-popup-duration-in・-out: 開く・閉じる長さ
//   --select-popup-ease: 緩急
//   --select-popup-scale-x・-y: 現れはじめの大きさ。起点は本体の側（開く向きで変わる — Base UI の --transform-origin）
//   --select-popup-shift: 現れはじめのずれ。本体の側に寄った位置から、離れる向きに動く
// どの案も濃さは 0 から。動きを減らす設定では、どの案も動かさずにすぐ出す・消す（原則3）
// シートの動き（--duration-sheet 250ms・--ease-sheet）は変えない

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'いまの小さな広がり',
    intent:
      '98% の大きさと濃さ 0 から、押下と同じ緩急で 0.1 秒で現れる。広がりはほとんど見えず、ぱっと出る印象。',
    spec: [
      ['長さ', '開く 100ms・閉じる 100ms'],
      ['緩急', '押下と同じ（出だしが速い）'],
      ['動き', '濃さ 0→1、大きさ 98%→100%（本体の側から）'],
      ['シートとの揃え', '揃えない（シートは 250ms で滑り出る）'],
      ['動きを減らす設定', '動かさず、すぐ出す'],
    ],
    tokens: {
      '--select-popup-duration-in': '100ms',
      '--select-popup-duration-out': '100ms',
      '--select-popup-ease': 'var(--ease-press)',
      '--select-popup-scale-x': '0.98',
      '--select-popup-scale-y': '0.98',
      '--select-popup-shift': '0px',
    },
  },
  {
    id: 'A',
    name: '動きなし',
    intent: '開くとすぐ出て、閉じるとすぐ消える。本体の青い枠線と同時に切り替わる。',
    spec: [
      ['長さ', '0ms'],
      ['緩急', '—'],
      ['動き', 'なし'],
      ['シートとの揃え', '揃えない'],
      ['動きを減らす設定', '同じ（すぐ出す）'],
    ],
    tokens: {
      '--select-popup-duration-in': '0ms',
      '--select-popup-duration-out': '0ms',
      '--select-popup-ease': 'var(--ease-press)',
      '--select-popup-scale-x': '1',
      '--select-popup-scale-y': '1',
      '--select-popup-shift': '0px',
    },
  },
  {
    id: 'B',
    name: '本体の側から伸びる',
    intent:
      '縦だけ 80% から伸びる。起点は本体の側で、下に開くときは上端から、上に開くときは下端から伸びる。緩急はシートと同じ（出だしが速く、ゆっくり止まる）。',
    spec: [
      ['長さ', '開く 200ms・閉じる 150ms'],
      ['緩急', 'シートと同じ'],
      ['動き', '濃さ 0→1、縦の大きさ 80%→100%（本体の側から）'],
      ['シートとの揃え', '緩急だけ揃える。長さはシートより短い'],
      ['動きを減らす設定', '動かさず、すぐ出す'],
    ],
    tokens: {
      '--select-popup-duration-in': '200ms',
      '--select-popup-duration-out': '150ms',
      '--select-popup-ease': 'var(--ease-sheet)',
      '--select-popup-scale-x': '1',
      '--select-popup-scale-y': '0.8',
      '--select-popup-shift': '0px',
    },
  },
  {
    id: 'C',
    name: '濃さだけ',
    intent:
      '大きさも位置も変えず、濃さだけで現れる。現行版より長く、ゆっくり止まる緩急なので、ふわっと出るのが分かる。',
    spec: [
      ['長さ', '開く 200ms・閉じる 150ms'],
      ['緩急', 'シートと同じ'],
      ['動き', '濃さ 0→1'],
      ['シートとの揃え', '緩急だけ揃える'],
      ['動きを減らす設定', '動かさず、すぐ出す'],
    ],
    tokens: {
      '--select-popup-duration-in': '200ms',
      '--select-popup-duration-out': '150ms',
      '--select-popup-ease': 'var(--ease-sheet)',
      '--select-popup-scale-x': '1',
      '--select-popup-scale-y': '1',
      '--select-popup-shift': '0px',
    },
  },
  {
    id: 'D',
    name: '少しずれながら現れる',
    intent:
      '本体の側に 8px 寄った位置から、濃さと一緒に定位置へ滑る。下に開くときは下へ、上に開くときは上へ動く。シートが下から滑り出るのと同じ「滑る」動き。',
    spec: [
      ['長さ', '開く 200ms・閉じる 150ms'],
      ['緩急', 'シートと同じ'],
      ['動き', '濃さ 0→1、位置 8px→0（本体の側から離れる向き）'],
      ['シートとの揃え', '緩急と「滑る」動きを揃える'],
      ['動きを減らす設定', '動かさず、すぐ出す'],
    ],
    tokens: {
      '--select-popup-duration-in': '200ms',
      '--select-popup-duration-out': '150ms',
      '--select-popup-ease': 'var(--ease-sheet)',
      '--select-popup-scale-x': '1',
      '--select-popup-scale-y': '1',
      '--select-popup-shift': '8px',
    },
  },
];

const SLOW = 5;

// 「ゆっくり見る」では、長さのトークンを 5 倍にする
const slowed = (candidate: Candidate): Candidate => ({
  ...candidate,
  tokens: Object.fromEntries(
    Object.entries(candidate.tokens ?? {}).map(([key, value]) => [
      key,
      key.includes('duration') ? `${parseFloat(String(value)) * SLOW}ms` : value,
    ])
  ),
});

const columns: Column[] = [
  {
    label: '下に開く',
    note: '「開いて閉じる」を押すと、開いて 1 秒後に閉じます。本体を押しても開閉できます',
  },
  { label: '上に開く', note: '枠の下の端に置き、上に開きます' },
];

const wards = [
  { label: '足立区', value: 'adachi' },
  { label: '荒川区', value: 'arakawa' },
  { label: '板橋区', value: 'itabashi' },
  { label: '江戸川区', value: 'edogawa' },
  { label: '大田区', value: 'ota' },
];

// 画面の代わりの枠。浮かぶ部分をこの中に描き、行ごとのトークンが効くようにする
// 枠は overflow: clip で、浮かぶ部分がはみ出す側を避ける（上に開く列は、本体を枠の下の端に置く）
const MotionCell = ({ up, slow }: { up: boolean; slow: boolean }) => {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const replay = () => {
    window.clearTimeout(timer.current);
    setOpen(true);
    timer.current = window.setTimeout(() => setOpen(false), slow ? 3000 : 1000);
  };
  return (
    <div className="flex max-w-[300px] flex-col gap-3">
      <div data-density="fine">
        <Button data-replay onClick={replay}>
          開いて閉じる
        </Button>
      </div>
      <div
        ref={setFrame}
        data-density="fine"
        className={[
          'relative flex h-[440px] flex-col overflow-clip rounded-[20px] border border-line bg-bg px-5',
          up ? 'justify-end pb-5' : 'pt-5',
        ].join(' ')}
      >
        {frame && (
          <Select
            label="住所"
            prefix="東京都"
            items={wards}
            defaultValue="arakawa"
            presentation="popover"
            modal={false}
            open={open}
            onOpenChange={(next) => {
              window.clearTimeout(timer.current);
              setOpen(next);
            }}
            container={frame}
          />
        )}
      </div>
    </div>
  );
};

interface ComparisonArgs {
  pick: string;
  slow: boolean;
}

const meta = {
  title: 'Design Review/33 浮かぶ選択肢の開閉の動き',
  id: 'design-review-33-select-motion',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'D', slow: false },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
    slow: { description: `長さを ${SLOW} 倍にして、ゆっくり見る`, control: 'boolean' },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick, slow }) => (
    <Comparison
      index={33}
      axis="浮かぶ選択肢の開閉の動き"
      pick={pick}
      candidates={slow ? candidates.map(slowed) : candidates}
      columns={columns}
      renderCell={(column) => <MotionCell up={column.label === '上に開く'} slow={slow} />}
    >
      <p>
        <strong className="text-fg">決まったこと</strong>
        （ADR-0054）。マウスで操作するときに浮かぶ選択肢の、開くときと閉じるときの動きを選びます。いまは
        98% の大きさと濃さ 0 から 0.1 秒で現れる仮の動きで、ほとんど動いて見えません（現行版）。
      </p>
      <p>
        行ごとに本物の Select を置いています。「開いて閉じる」を押すと、開いて 1
        秒後に閉じます。本体を押して開き、項目や外を押して閉じることもできます。コントロールの「slow」をオンにすると、長さが
        {SLOW} 倍になり、途中の形が見やすくなります。
      </p>
      <p>
        列は開く向きです。B（伸びる）と
        D（ずれる）は、開く向きで起点と動く向きが変わります。画面の下から出るシートの動き（0.25
        秒で滑り出る）は変えません。各案の「シートとの揃え」に、どこを揃えるかを書いています。動きを減らす設定では、どの案も動かさずにすぐ出します（原則3）。
      </p>
      <p>
        Menu・Popover など、ほかの浮かぶ UI
        も同じ動きのトークンを使うかは、それぞれを作るときに決めます。
      </p>
      <p>どれを既定にするかを一言添えてください。</p>
    </Comparison>
  ),
};
