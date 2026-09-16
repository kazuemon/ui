import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';

import { Switch } from '../../src/components/Switch';
import { type Candidate, type Column, Comparison } from './Comparison';
import { keepSwitchCaptionAsCompared, keepToggleColorAsCompared } from './pins';

// 後半の軸 29: トグルの並び
// トラックを文字の左に置く形（togglePlacement="start"）を既定にした。左に置いたときの並びを比べる
// 変えるのは次のトークンだけ（src/components/Switch.tsx が読む）。右に置く形（end）にも同じ値が効く
//   トラックの縦の位置（--switch-track-rows）: 1 / -1 はラベルとキャプションのまとまりの中央、1 / 2 はラベルの行の中央
//   トラックと文字の間（--switch-gap）

const trackRows = { block: '1 / -1', label: '1 / 2' } as const;

const candidate = (
  id: string,
  name: string,
  intent: string,
  rows: keyof typeof trackRows,
  gap: string
): Candidate => ({
  id,
  name,
  intent,
  spec: [
    [
      'トラックの縦の位置',
      rows === 'block' ? 'ラベルとキャプションのまとまりの中央' : 'ラベルの行の中央',
    ],
    ['トラックと文字の間', gap],
  ],
  tokens: { '--switch-track-rows': trackRows[rows], '--switch-gap': gap },
});

const candidates: Candidate[] = [
  candidate(
    '現行版',
    'まとまりの中央・間 12px',
    'いまのトグル（トラックが右）の並びを、そのまま左に移したもの。キャプションがあるときは、トラックをラベルとキャプションのまとまりの縦の中央に置く。キャプションが長いほど、トラックはラベルから下にずれる。',
    'block',
    '12px'
  ),
  candidate(
    'A',
    'ラベルの行の中央・間 12px',
    'トラックをラベルの行の中央にそろえる。キャプションが何行あっても、トラックはラベルの横から動かない。チェックボックスでよく見る並び。',
    'label',
    '12px'
  ),
  candidate(
    'B',
    'ラベルの行の中央・間 8px',
    'A の間を 8px に詰める。トラックとラベルが1つのまとまりに見えやすい。8px は、ボタンの中のアイコンとラベルの間と同じ。',
    'label',
    '8px'
  ),
  candidate('C', 'まとまりの中央・間 8px', '現行版の間だけを 8px に詰める。', 'block', '8px'),
];

const columns: Column[] = [
  { label: 'トラック左（既定）', note: 'togglePlacement="start"' },
  {
    label: '余白を見る（トラック左）',
    note: '桃色: 行（部品の高さ）とトラックと文字の間、青: ラベルとキャプションの箱、点線: トラックの箱、青い横線: ラベルの行の中央。各行の下に測った値',
  },
  { label: 'トラック右', note: 'togglePlacement="end"。設定の一覧のように行の右端にそろえる形' },
  {
    label: '押せない（トラック左）',
    note: 'ラベルはほかの押せない文字と同じグレー、キャプションは読めるまま（決定済み）',
  },
];

const longCaption =
  'オンにすると、新しい記事が公開されたときにメールでお知らせします。配信は週に1回まとめて届きます。';

// 余白を見る列: 行（部品の高さ）を桃色、ラベルとキャプションの箱を青で塗り、トラックの箱を点線で囲む
// ラベルの行の中央（A・B でトラックをそろえる高さ）に、ラベルの左端からトラックの側へ横線を引く
// 文字の上には引かない（取り消し線に見えるため）。トラックより手前に描く
const spacingCss = `
[data-axis29-spacing] [data-measured] > div { background-color: rgb(236 72 153 / 0.14); }
[data-axis29-spacing] label, [data-axis29-spacing] label + p { background-color: rgb(36 116 223 / 0.14); }
[data-axis29-spacing] label { position: relative; }
[data-axis29-spacing] label::before {
  content: '';
  position: absolute;
  z-index: 1;
  top: calc(50% - 0.5px);
  right: 100%;
  width: calc(var(--switch-gap) + var(--switch-w));
  height: 1px;
  background-color: rgb(36 116 223 / 0.9);
}
[data-axis29-spacing] [role='switch'] { outline: 1px dashed rgb(236 72 153 / 0.9); outline-offset: 0; }
`;

const px = (value: number) => `${Math.round(value * 10) / 10}px`;

// トグル1つの寸法を測って、下に数値で出す。密度を切り替えたとき（大きさが変わったとき）も測り直す
//   行: 行の高さ。間: トラックの右端からラベルの左端まで
//   中心の差: トラックの縦の中心と、ラベルの行の縦の中心の差（＋はトラックが下）
function Measured({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [text, setText] = useState('');
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const measure = () => {
      const row = el.firstElementChild;
      const track = el.querySelector('[role="switch"]');
      const label = el.querySelector('label');
      if (!row || !track || !label) return;
      const r = row.getBoundingClientRect();
      const t = track.getBoundingClientRect();
      const l = label.getBoundingClientRect();
      const diff = t.top + t.height / 2 - (l.top + l.height / 2);
      setText(
        `行 ${px(r.height)}・間 ${px(l.left - t.right)}・中心の差 ${diff > 0.05 ? '+' : ''}${px(diff)}`
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={box} data-measured className="flex flex-col gap-1">
      {children}
      <p className="text-xs text-fg-muted tabular-nums">{text}</p>
    </div>
  );
}

const Cell = ({ column }: { column: Column }) => {
  const placement = column.label === 'トラック右' ? 'end' : 'start';
  const disabled = column.label.startsWith('押せない');
  const spacing = column.label.startsWith('余白');
  const switches = [
    <Switch
      key="notice"
      togglePlacement={placement}
      disabled={disabled}
      label="お知らせを受け取る"
      defaultChecked
    />,
    <Switch
      key="push"
      togglePlacement={placement}
      disabled={disabled}
      label="プッシュ通知"
      caption="コメントがついたときに届きます"
    />,
    <Switch
      key="mail"
      togglePlacement={placement}
      disabled={disabled}
      label="メールで受け取る"
      caption={longCaption}
      defaultChecked
    />,
  ];
  return (
    <div data-axis29-spacing={spacing || undefined} className="flex max-w-[320px] flex-col gap-2">
      {spacing ? switches.map((sw) => <Measured key={sw.key}>{sw}</Measured>) : switches}
    </div>
  );
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/29 トグルの並び',
  id: 'design-review-29-toggle-layout',
  decorators: [keepSwitchCaptionAsCompared, keepToggleColorAsCompared],
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <>
      <style>{spacingCss}</style>
      <Comparison
        index={29}
        axis="トグルの並び"
        pick={pick}
        candidates={candidates}
        columns={columns}
        renderCell={(column) => <Cell column={column} />}
      >
        <p>
          <strong className="text-fg">決まったこと</strong>（ADR-0049）。トラックの左右は{' '}
          <code>togglePlacement</code>{' '}
          で選べるようにし、既定はトラック左（start）にしました。押せないときは、ラベルをほかの押せない文字と同じグレーにし、キャプションは読めるままにします（右の列）。
        </p>
        <p>
          ここで選ぶのは、トラックを左に置いたときの並びです。キャプションがあるときに、トラックをラベルの行にそろえるか、ラベルとキャプションのまとまりの中央に置くか。それと、トラックと文字の間です。同じ値が、トラック右の形にも効きます。
        </p>
        <p>
          現行版は、いまのトラック右の並びをそのまま左に移したものです。ツールバーの「密度」「指用の高さ」でも確かめられます。
        </p>
        <p>
          「余白を見る」の列は、トラック左の並びに色を付けたものです。桃色が行（部品の高さ）で、トラックと文字の間もこの色で見えます。青がラベルとキャプションの箱、点線がトラックの箱、青い横線がラベルの行の中央です。横線は文字にかからないよう、トラックの側にだけ引いています。
        </p>
        <p>
          各行の下の数値は、その場で測った値です。「行」は行の高さ、「間」はトラックの右端からラベルの左端まで、「中心の差」はトラックの縦の中心とラベルの行の縦の中心の差です（＋はトラックが下）。
        </p>
        <p>どれを既定にするか、左右で変えたいかを一言添えてください。</p>
      </Comparison>
    </>
  ),
};
