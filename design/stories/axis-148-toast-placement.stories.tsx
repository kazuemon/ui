import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  type ToastOptions,
  type ToastPosition,
  ToastProvider,
  type ToastStack,
  useToast,
} from '../../src/components/toast/Toast';

// 後半の軸 148: トーストの出る場所と積み方
//   場所は position（下・上 × 左・中央・右）、積み方は stack（stacked: 重ねる / list: 並べる）
//   どちらも部品の props なので、候補は renderCell で props を変えている
//   スマホの幅では、どの案でも左右の余白を残して幅いっぱいになる（原則11）

function ShowOnMount({ toasts }: { toasts: ToastOptions[] }) {
  const toast = useToast();
  const shown = useRef(false);
  useEffect(() => {
    if (shown.current) return;
    shown.current = true;
    for (const options of toasts) toast.show(options);
  }, [toast, toasts]);
  return null;
}

/** 画面の代わりの枠。中にトーストを出したままにする（timeout 0） */
function Screen({
  position,
  stack,
  toasts,
  width = 'w-[360px]',
  density,
}: {
  position: ToastPosition;
  stack: ToastStack;
  toasts: ToastOptions[];
  width?: string;
  density?: 'coarse' | 'fine';
}) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setFrame}
      data-density={density}
      className={`relative h-[240px] ${width} [transform:translateZ(0)] overflow-clip rounded-card border border-line bg-bg`}
    >
      <div className="p-4 text-xs text-fg-subtle">ページの中身</div>
      {frame && (
        <ToastProvider container={frame} timeout={0} limit={3} position={position} stack={stack}>
          <ShowOnMount toasts={toasts} />
        </ToastProvider>
      )}
    </div>
  );
}

const one: ToastOptions[] = [{ color: 'success', title: '記事を公開しました' }];
const three: ToastOptions[] = [
  { color: 'info', title: '下書きを保存しました', description: '3 分前の内容に戻せます。' },
  { color: 'success', title: '記事を公開しました' },
  { color: 'danger', title: '画像を 1 枚だけ載せられませんでした' },
];
const four: ToastOptions[] = [...three, { color: 'neutral', title: '同期しています' }];

interface Setting {
  position: ToastPosition;
  stack: ToastStack;
}

const settings: Record<string, Setting> = {
  決定: { position: 'auto', stack: 'auto' },
  現行版: { position: 'bottom-end', stack: 'stacked' },
  A: { position: 'bottom-end', stack: 'list' },
  B: { position: 'bottom-center', stack: 'stacked' },
  C: { position: 'top-end', stack: 'stacked' },
  D: { position: 'top-center', stack: 'list' },
};

const candidates: Candidate[] = [
  {
    id: '決定',
    name: '右下（スマホは中央下）・3 枚までは並べ、4 枚めから重ねる',
    intent:
      'A（並べる）と現行版（重ねる）を枚数で使い分ける。少ないうちは全部読め、たまってきたら高さが増えずに重なる。スマホでは親指の近い下の中央に出す。いちど重ねたら全部消えるまで重ねたままにして、読んでいる途中で形が変わらないようにする。',
    spec: [
      ['場所', 'パソコン 右下 / スマホ 下の中央'],
      ['積み方', '3 枚まで並べる → 4 枚めから重ねる'],
      ['戻すとき', '全部消えるまで重ねたまま'],
      ['props', "position='auto'・stack='auto'"],
    ],
  },
  {
    id: '現行版',
    name: '右下・重ねる',
    intent:
      '出た場所が本文の邪魔になりにくく、続けて出しても高さが増えない。手前の 1 枚だけを読ませ、載せると開いて全部見える。後ろの枚数は、のぞいた縁で分かる。',
    spec: [
      ['場所', '右下'],
      ['積み方', '重ねる（載せると開く）'],
    ],
  },
  {
    id: 'A',
    name: '右下・並べる',
    intent:
      '重ねずに縦に並べる。出たものが全部いつも読める代わりに、続けて出すと画面の右下が埋まる。動きは少ない。',
    spec: [
      ['場所', '右下'],
      ['積み方', '並べる'],
    ],
  },
  {
    id: 'B',
    name: '中央下・重ねる',
    intent:
      '画面の下の中央。目の動きが少なく、スマホの親指の近くにも出る。幅の広い画面では、本文の真下に重なって見える。',
    spec: [
      ['場所', '下の中央'],
      ['積み方', '重ねる'],
    ],
  },
  {
    id: 'C',
    name: '右上・重ねる',
    intent:
      'ページの上の帯の近く。操作したボタンが上にあるとき、視線の移動が短い。帯（Navbar）を貼り付けていると、その上に重なる。',
    spec: [
      ['場所', '右上'],
      ['積み方', '重ねる'],
    ],
  },
  {
    id: 'D',
    name: '上の中央・並べる',
    intent:
      'スマホの通知に近い置き方。画面の上から降りてくる。指で操作するときは、下から出すより読みやすいが、押して消すには遠い。',
    spec: [
      ['場所', '上の中央'],
      ['積み方', '並べる'],
    ],
  },
];

const columns: Column[] = [
  { label: '1 枚出したとき', note: 'パソコンの画面' },
  { label: '3 枚出したとき', note: 'パソコンの画面' },
  { label: '4 枚出したとき', note: 'パソコンの画面' },
  { label: 'スマホの幅', note: '375px・指用の密度。4 枚' },
];

const meta = {
  title: 'Design Review/148 トーストの出る場所と積み方',
  id: 'design-review-148-toast-placement',
  parameters: { layout: 'fullscreen' },
  args: { pick: '決定' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', '決定', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={148}
      axis="トーストの出る場所と積み方"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const setting = settings[candidate.id] ?? settings['現行版'];
        if (column.label === 'スマホの幅') {
          return <Screen {...setting} toasts={four} width="w-[375px]" density="coarse" />;
        }
        const toasts =
          column.label === '1 枚出したとき'
            ? one
            : column.label === '3 枚出したとき'
              ? three
              : four;
        return <Screen {...setting} toasts={toasts} />;
      }}
    >
      <p>
        <strong>
          決定: パソコンは右下、スマホ（指で操作していて画面が狭いとき）は下の中央。どちらも 3
          枚までは並べ、4 枚めからは重ねる。いちど重ねたら、全部消えるまで重ねたまま。
        </strong>
        場所は <code>position</code>、積み方は <code>stack</code> で、どちらも <code>auto</code>{' '}
        が既定です。決めた形をいちばん上の行に置いてあります。
      </p>
      <p>
        トーストを画面のどこに出すか、続けて出したときにどう積むかを選びます。枠はページの代わりです（消えないようにしています）。
        重ねる案は、枠の中のトーストにマウスを載せると開いて全部見えます。
      </p>
      <p>
        スマホの幅では、どの案でも左右の余白を残して幅いっぱいになります（原則11）。上下の向きだけが変わります。
      </p>
      <p>
        場所と積み方は、使う側が <code>position</code>・<code>stack</code> で固定もできます。
      </p>
    </Comparison>
  ),
};
