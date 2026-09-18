import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Link } from '../../src/components/link/Link';
import {
  type ToastAppearance,
  type ToastOptions,
  ToastProvider,
  useToast,
} from '../../src/components/toast/Toast';

// 後半の軸 147: トーストの面の見た目
//   面そのものは、お知らせ（Notice）と同じ 4 つの見た目（soft・filled・outline・muted）から選ぶ
//   重なるレイヤーなので、影（--toast-shadow）と細い輪郭（--toast-line）を足している。輪郭を残すかも一緒に選ぶ
//   見た目は部品の props（appearance）で変わるので、候補は renderCell で props を変えている

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

/** 画面の代わりの枠。中にトーストを出したままにする（timeout 0）。枠を位置の基準にする（transform） */
function Screen({
  appearance,
  outline,
  toasts,
}: {
  appearance: ToastAppearance;
  outline: boolean;
  toasts: ToastOptions[];
}) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setFrame}
      className="relative h-[168px] w-[320px] [transform:translateZ(0)] overflow-clip rounded-card border border-line bg-bg"
    >
      {frame && (
        <ToastProvider
          container={frame}
          timeout={0}
          limit={3}
          position="bottom-end"
          stack="list"
          appearance={appearance}
          outline={outline}
        >
          <ShowOnMount toasts={toasts} />
        </ToastProvider>
      )}
    </div>
  );
}

const success: ToastOptions = { color: 'success', title: '記事を公開しました' };
const danger: ToastOptions = {
  color: 'danger',
  title: '保存できませんでした',
  description: '通信を確かめて、もう一度お試しください。',
};
const info: ToastOptions = {
  color: 'info',
  title: '下書きを保存しました',
  actions: <Link href="#">元に戻す</Link>,
};

const byColumn: Record<string, ToastOptions[]> = {
  '成功（1 枚）': [success],
  '危険（説明つき）': [danger],
  '情報（操作つき）': [info],
  '2 枚並べたとき': [success, danger],
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'soft（淡い色の面）＋影＋細い輪郭',
    intent:
      'お知らせ（Notice）の既定と同じ淡い面。重なるレイヤーなので、やわらかく広い影と細い輪郭を足している。色で何が起きたかが分かり、面は軽い。',
    spec: [
      ['面', '状態の色の淡い面'],
      ['文字', '題は状態の色、本文は濃紺'],
      ['影・輪郭', 'あり'],
    ],
  },
  {
    id: 'B',
    name: 'filled（濃い塗り）',
    intent:
      '濃い塗りに白い文字（警告だけ黄色に濃紺）。いちばん目を引くが、画面の隅で強く主張する。並べると重い。',
    spec: [
      ['面', '状態の色の濃い塗り'],
      ['文字', '白（警告は濃紺）'],
      ['影・輪郭', '影あり'],
    ],
  },
  {
    id: 'D',
    name: 'soft で輪郭なし（影だけ）',
    intent:
      '現行版から細い輪郭を外した案。淡い面と影だけで浮きを見せる。白い面と違って地の色があるので、輪郭がなくても縁は見える。',
    spec: [
      ['面', '状態の色の淡い面'],
      ['影・輪郭', '影だけ'],
    ],
  },
];

const lookOf: Record<string, { appearance: ToastAppearance; outline: boolean }> = {
  現行版: { appearance: 'soft', outline: true },
  B: { appearance: 'filled', outline: true },
  D: { appearance: 'soft', outline: false },
};

const columns: Column[] = [
  { label: '成功（1 枚）' },
  { label: '危険（説明つき）' },
  { label: '情報（操作つき）' },
  { label: '2 枚並べたとき' },
];

const meta = {
  title: 'Design Review/147 トーストの面の見た目',
  id: 'design-review-147-toast-surface',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current,B,D' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'B', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={147}
      axis="トーストの面の見た目"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <Screen
          {...(lookOf[candidate.id] ?? { appearance: 'soft', outline: true })}
          toasts={byColumn[column.label] ?? []}
        />
      )}
    >
      <p>
        <strong>
          決定: 現行版（soft・淡い色の面）を既定にし、B（濃い塗り）と D（輪郭なし）も選べる。
        </strong>
        A（白い面に色の枠線）と C（グレーの面に小さな題）は採らなかったので、部品から畳みました。
      </p>
      <p>
        操作の結果を知らせるトーストの面を選びます。中身（アイコン・題・本文・操作・×）はどの案でも同じで、面と文字の色だけが変わります。
        トーストはページの上に重なるので、どの案にもやわらかく広い影が付きます（原則1）。
      </p>
      <p>比較のために、枠はスマホくらいの大きさで、消えないようにして 1〜2 枚出しています。</p>
      <p>
        <strong>どれを既定にしますか。</strong>
        お知らせ（Notice）と同じく、ほかの見た目も <code>appearance</code>{' '}
        で選べるようにする想定です。
      </p>
    </Comparison>
  ),
};
