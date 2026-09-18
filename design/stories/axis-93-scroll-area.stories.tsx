import type { Meta, StoryObj } from '@storybook/react-vite';
import { type CSSProperties, type ReactNode, useEffect, useState } from 'react';

import { Button } from '../../src/components/button/Button';
import { Dialog } from '../../src/components/dialog/Dialog';
import { Popover } from '../../src/components/popover/Popover';
import {
  RecentList,
  type SceneOptions,
  TagRow,
  TermsActions,
  TermsText,
  TopicCard,
} from '../../src/components/scroll-area/story-scenes';
import { statePseudo } from '../../src/stories/story-states';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 93: スクロールする枠（ScrollArea）— つまみの見せ方と、端の影
// 決定: 影あり・つまみは動かしたとき（既定）。つまみそのものに載せると、枠の内側へ膨らむ（4px → 8px）。いつも出す（scrollbar="always"）と、影なし（edgeShadow={false}。つまみはいつも出す）も選べる
// 影とつまみの出し方は props（options）、つまみの太さと色は --scroll-area-* で変える。全案で軸の値を明示する
// 前のラウンドの A（ブラウザのスクロールバー）と、見えない帯に載せると太くなるつまみは、部品に畳んだので再現できない

const thumb = (size: string, color = 'var(--color-line-strong)') => ({
  '--scroll-area-thumb-size': size,
  '--scroll-area-thumb-size-hover': 'calc(var(--spacing) * 3)',
  '--scroll-area-thumb-inset': 'calc(var(--spacing) / 2)',
  '--scroll-area-thumb-color': color,
});

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '影あり・つまみは動かしたとき（既定）',
    intent:
      '4px のつまみを中身の上に重ね、枠に載せたとき・スクロール中・キーボードで止まったときだけ出す。見えている太さがそのまま押せる範囲。端の影あり。',
    spec: [
      ['つまみ', '重ねる・ふだんは隠す'],
      ['太さ', '4px（押せる範囲も同じ）'],
      ['色', '3:1 の輪郭のグレー'],
      ['端の影', 'あり'],
    ],
    tokens: thumb('calc(var(--spacing) * 1.5)'),
  },
  {
    id: 'B',
    name: '影あり・つまみをいつも出す（選べる）',
    intent:
      '現行版のつまみを、スクロールできるあいだいつも出す（scrollbar="always"）。どこまで読んだかが、触らなくても分かる。',
    spec: [
      ['つまみ', '重ねる・いつも出す'],
      ['太さ', '4px（押せる範囲も同じ）'],
      ['色', '3:1 の輪郭のグレー'],
      ['端の影', 'あり'],
    ],
    tokens: thumb('calc(var(--spacing) * 1.5)'),
  },
  {
    id: 'C',
    name: '淡いつまみをいつも出す（採らなかった色）',
    intent:
      'つまみを濃紺を透かしたグレー（ラフの色に近い）にして、いつも出す。色は 3:1 のグレーに決めた。',
    spec: [
      ['つまみ', '重ねる・いつも出す'],
      ['太さ', '4px（押せる範囲も同じ）'],
      ['色', '濃紺 35%'],
      ['端の影', 'あり'],
    ],
    tokens: thumb('calc(var(--spacing) * 1.5)', 'rgb(from var(--color-shadow) r g b / 0.35)'),
  },
  {
    id: 'D',
    name: '影なし・つまみをいつも出す（選べる）',
    intent:
      '端の影を外す（edgeShadow={false}）。続きがあることは、いつも出るつまみと、途中で切れた行で伝える。',
    spec: [
      ['つまみ', '重ねる・いつも出す'],
      ['太さ', '4px（押せる範囲も同じ）'],
      ['色', '3:1 の輪郭のグレー'],
      ['端の影', 'なし'],
    ],
    tokens: thumb('calc(var(--spacing) * 1.5)'),
  },
];

// 案ごとの影とつまみの出し方（props）
const optionsOf: Record<string, SceneOptions> = {
  現行版: {},
  B: { scrollbar: 'always' },
  C: { scrollbar: 'always' },
  D: { edgeShadow: false },
};

// 開いた Dialog はフォーカスを取り、比較の表をそこまで横にスクロールさせる。Popover は、表の横スクロールで隠れると
// 置き場所を探し続ける。Dialog をいちばん左の列に、Popover をその隣に置き、どちらも表を横にスクロールしなくても見える位置にする
// （表を横に動かすきっかけを作らない。ResetScroll は念のための戻し）
const columns: Column[] = [
  { label: 'Dialog の中の長い文', note: '途中。下に Button' },
  { label: 'Popover の中の一覧', note: '途中' },
  { label: 'カードの中の一覧', note: '上の端・途中・下の端' },
  { label: 'マウスを載せたとき', note: 'カードの一覧・途中', preview: 'hover' },
  {
    label: 'つまみに載せたとき',
    note: 'カードの一覧・途中。つまみが内側へ膨らむ',
    preview: 'thumb',
  },
  { label: '横に並ぶ Tag', note: '左の端・途中・右の端' },
];

// 重なる面（Dialog・Popover）を、セルの中の枠に描く。面は画面に固定して出るので、枠を位置の基準にする（transform）
function OverlayFrame({
  style,
  className,
  children,
}: {
  style?: CSSProperties;
  className: string;
  children: (frame: HTMLElement) => ReactNode;
}) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setFrame}
      data-density="fine"
      style={style}
      className={`relative ${className} [transform:translateZ(0)] overflow-clip rounded-card border border-line bg-bg`}
    >
      {frame && children(frame)}
    </div>
  );
}

const cells: Record<
  string,
  (tokens: CSSProperties | undefined, options: SceneOptions) => ReactNode
> = {
  カードの中の一覧: (_, options) => (
    <div className="flex gap-3">
      <TopicCard position="start" width="w-[200px]" options={options} />
      <TopicCard position="middle" width="w-[200px]" options={options} />
      <TopicCard position="end" width="w-[200px]" options={options} />
    </div>
  ),
  マウスを載せたとき: (_, options) => (
    <TopicCard position="middle" width="w-[200px]" options={options} />
  ),
  つまみに載せたとき: (_, options) => (
    <TopicCard position="middle" width="w-[200px]" options={options} />
  ),
  'Dialog の中の長い文': (tokens, options) => (
    <OverlayFrame style={tokens} className="h-[420px] w-[440px]">
      {(frame) => (
        <Dialog
          title="利用規約"
          description="続けるには、利用規約への同意が必要です。"
          presentation="popover"
          modal={false}
          // 比べるあいだ開いたままにする（フォーカスが外へ出ても閉じない）
          dismissible={false}
          open
          container={frame}
          actions={<TermsActions />}
          className="w-[400px]"
        >
          <TermsText position="middle" options={options} />
        </Dialog>
      )}
    </OverlayFrame>
  ),
  '横に並ぶ Tag': (_, options) => (
    <div className="flex flex-col gap-4">
      <TagRow position="start" options={options} />
      <TagRow position="middle" options={options} />
      <TagRow position="end" options={options} />
    </div>
  ),
  'Popover の中の一覧': (tokens, options) => (
    <OverlayFrame style={tokens} className="h-[360px] w-[300px]">
      {(frame) => (
        <div className="absolute inset-x-0 bottom-0 p-4">
          <Popover
            title="最近の記事"
            presentation="popover"
            side="top"
            align="start"
            open
            container={frame}
            trigger={<Button appearance="outline">最近の記事</Button>}
            className="w-[260px]"
          >
            <RecentList position="middle" options={options} />
          </Popover>
        </div>
      )}
    </OverlayFrame>
  ),
};

// 開いた Dialog がフォーカスを取ると、ページと比較の表がそこまでスクロールする。開いたあとで元の位置に戻し、フォーカスを外す
// （Popover は、表の横スクロールで隠れると置き場所を探し続けるので、見える位置に戻す）
function ResetScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      window.scrollTo(0, 0);
      for (const el of document.querySelectorAll('.overflow-x-auto')) el.scrollLeft = 0;
    }, 100);
    return () => window.clearTimeout(timer);
  }, []);
  return children;
}

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/93 スクロールする枠（ScrollArea）',
  id: 'design-review-93-scroll-area',
  parameters: {
    layout: 'fullscreen',
    // 「つまみに載せたとき」の列は、枠とつまみの両方に hover を当てる
    pseudo: {
      ...statePseudo({ hover: '[data-slot="scroll-area"]' }),
      hover: [
        '[data-preview="hover"] [data-slot="scroll-area"]',
        '[data-preview="thumb"] [data-slot="scroll-area"]',
        '[data-preview="thumb"] [data-slot="scroll-area-thumb"]',
      ],
    },
  },
  args: { pick: 'current,B,D' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'B', 'C', 'D', 'current,B,D'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <ResetScroll>
      <Comparison
        index={93}
        axis="スクロールする枠（ScrollArea）"
        pick={pick}
        candidates={candidates}
        columns={columns}
        renderCell={(column, candidate) =>
          cells[column.label]?.(candidate.tokens, optionsOf[candidate.id] ?? {})
        }
      >
        <p>
          決定:
          端の影あり・つまみは動かしたとき（現行版）を既定にし、つまみをいつも出す（B）と、影なし（D。つまみはいつも出す）を選べるようにしました。つまみは中身に重ね、色は
          3:1
          のグレー、見えている太さ（4px）がそのまま押せる範囲です。つまみそのものに載せると、枠の内側へ
          8px
          に膨らみ、膨らんだ姿がそのままつかめる範囲になります（つかんで動かすあいだも膨らんだまま。見えない帯に載せても膨らみません）（ADR
          はあとで書く）。
        </p>
        <p>
          影は Select の浮かぶ選択肢・シートと同じもので、スクロールした量に合わせて濃くなります。C
          は採らなかった淡い色の参考です。前のラウンドのブラウザのスクロールバー（A）は、部品に畳んだので並べていません。
        </p>
        <p>
          スクロール中の出方は静止画では見えないので、セルの中をスクロールして確かめてください。つまみの帯の上（つまみのないところ）を押すと、下の中身に届きます。
        </p>
      </Comparison>
    </ResetScroll>
  ),
};
