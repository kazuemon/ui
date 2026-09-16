import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';

import { Switch } from '../../src/components/Switch';
import { type Candidate, type Column, Comparison } from './Comparison';
import { keepSwitchCaptionAsCompared, keepToggleColorAsCompared } from './pins';

// 後半の軸 44: 指用のトグルの縦の位置
// 軸 29 で、トラックはラベルの行の中央（--switch-track-rows: 1 / 2）、トラックと文字の間は 12px に決めた
// 指用ではトラック（28px）がラベルの行（24px）より高く、上下に 2px ずつはみ出す。下端がキャプションの上端に接する
// 各案で変えるもの
//   現行版・A: --switch-track-rows だけ（トークンの差）
//   B: 指用（[data-density="coarse"]）のときだけ --switch-track-rows を 1 / -1 にする。
//      実際に入れるなら、トークンを -fine・-coarse に分け、globals.css の密度の解決に足す
//   C〜F: 部品の変更が要る。このストーリーの中の CSS（[data-axis44] の中だけ）で見た目を再現する
//   E・F はユーザーの提案「キャプションがあればラベルの上部に揃える」。E は全部の密度、F は指用（data-density="coarse"）だけ
//   G は、E で結果としてほぼそろっていたノブの上端と文字の上端を、ルールとしてそろえる案（ユーザーの「その案を作ってみてもらえますか」）
//     文字の上端は、和文の縦位置の補正（ADR-0032）で、行の上端から (行の高さ − 文字の大きさ) / 2 の位置。そこからノブの内側の余白を引いた位置にトラックを置く
//   全案で --switch-gap は 12px（軸 29 の決定）に固定する

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'ラベルの行の中央',
    intent:
      'トラックの縦の中心を、ラベルの行の中心にそろえる（軸 29）。指用ではトラックがラベルの行より高く、上下にはみ出す。下にはみ出した分で、トラックの下端がキャプションの上端に接する。',
    spec: [
      ['トラックの縦の位置', 'ラベルの行の中央（1 / 2）'],
      ['ラベルとキャプションの間', '足さない'],
      ['トラックと文字の間', '12px'],
      ['部品の変更', 'なし'],
    ],
    tokens: { '--switch-track-rows': '1 / 2', '--switch-gap': '12px' },
  },
  {
    id: 'A',
    name: 'まとまりの中央',
    intent:
      'トラックを、ラベルとキャプションのまとまりの縦の中央に置く（軸 29 の比較にあった案）。短いキャプションでは収まりがよい。キャプションが長いほど、トラックはラベルから下にずれる。マウス用も同じ。',
    spec: [
      ['トラックの縦の位置', 'ラベルとキャプションのまとまりの中央（1 / -1）'],
      ['ラベルとキャプションの間', '足さない'],
      ['トラックと文字の間', '12px'],
      ['部品の変更', 'なし（トークンだけ）'],
    ],
    tokens: { '--switch-track-rows': '1 / -1', '--switch-gap': '12px' },
  },
  {
    id: 'B',
    name: '密度で分ける',
    intent:
      'マウス用はラベルの行の中央（現行版）のまま、指用だけまとまりの中央（A）にする。トラックがラベルの行に収まるマウス用は変えず、はみ出す指用だけを直す。',
    spec: [
      ['トラックの縦の位置', 'マウス用: ラベルの行の中央（1 / 2）、指用: まとまりの中央（1 / -1）'],
      ['ラベルとキャプションの間', '足さない'],
      ['トラックと文字の間', '12px'],
      ['部品の変更', 'トークンを密度で分け、globals.css の密度の解決に足す'],
    ],
    tokens: { '--switch-track-rows': '1 / 2', '--switch-gap': '12px' },
  },
  {
    id: 'C',
    name: 'ラベルの行の中央・キャプションとの間をあける',
    intent:
      '現行版の位置のまま、ラベルとキャプションのあいだに、トラックのはみ出し分（トラックの高さとラベルの行の高さの差の半分）だけ間を足す。トラックの下端とキャプションの間が、上にはみ出した分と同じだけあく。',
    spec: [
      ['トラックの縦の位置', 'ラベルの行の中央（1 / 2）'],
      ['ラベルとキャプションの間', 'はみ出し分（マウス用 1px・指用 2px・大きい指用 4px）を足す'],
      ['トラックと文字の間', '12px'],
      ['部品の変更', '要る（キャプションがあるときの行の間）。ここではストーリーの CSS で再現'],
    ],
    tokens: { '--switch-track-rows': '1 / 2', '--switch-gap': '12px' },
  },
  {
    id: 'D',
    name: 'ラベルとキャプションの1行目の中央',
    intent:
      'トラックを、ラベルの行とキャプションの1行目を合わせた高さの中央に置く。キャプションが1行なら A と同じ位置。長くても1行目より下には動かず、ラベルのそばに残る。',
    spec: [
      ['トラックの縦の位置', 'ラベルの行とキャプションの1行目の中央（上から寄せる）'],
      ['ラベルとキャプションの間', '足さない'],
      ['トラックと文字の間', '12px'],
      ['部品の変更', '要る（トラックの上の余白を計算する）。ここではストーリーの CSS で再現'],
    ],
    tokens: { '--switch-track-rows': '1 / -1', '--switch-gap': '12px' },
  },
  {
    id: 'E',
    name: 'キャプションがあればラベルの上端にそろえる',
    intent:
      'キャプションがあるときは、トラックの上端とラベルの行の上端をそろえる（上から寄せる）。トラックがラベルの行より高い分は下へはみ出し、キャプションはその分だけ下がる。キャプションがないときは行の中央のまま。全部の密度で同じ。',
    spec: [
      ['トラックの縦の位置', 'キャプションあり: ラベルの行の上端にそろえる。なし: 行の中央'],
      ['ラベルとキャプションの間', '足さない（トラックの高さの分だけ、1行目が高くなる）'],
      ['トラックと文字の間', '12px'],
      ['密度', '全部'],
      ['部品の変更', '要る（キャプションがあるときの上寄せ）。ここではストーリーの CSS で再現'],
    ],
    tokens: { '--switch-track-rows': '1 / 2', '--switch-gap': '12px' },
  },
  {
    id: 'F',
    name: '指用だけ、キャプションがあればラベルの上端にそろえる',
    intent:
      'E を指用（data-density="coarse"。大きい指用も含む）だけに当てる。トラックがラベルの行に収まるマウス用は、現行版（ラベルの行の中央）のまま。',
    spec: [
      [
        'トラックの縦の位置',
        'マウス用: ラベルの行の中央。指用: キャプションあり ラベルの行の上端、なし 行の中央',
      ],
      ['ラベルとキャプションの間', '足さない'],
      ['トラックと文字の間', '12px'],
      ['密度', '指用だけ'],
      ['部品の変更', '要る（指用のときの上寄せ）。ここではストーリーの CSS で再現'],
    ],
    tokens: { '--switch-track-rows': '1 / 2', '--switch-gap': '12px' },
  },
  {
    id: 'G',
    name: 'キャプションがあればノブの上端を文字の上端にそろえる',
    intent:
      'キャプションがあるときは、ノブ（●）の上端とラベルの文字の上端をそろえる。E はトラックの外側の上端をラベルの行の上端にそろえる形で、結果としてノブと文字の上端は 1px 以内だった。G はこれをルールにして、どの密度でもずれを 0 にする。キャプションがないときは行の中央のまま。',
    spec: [
      [
        'トラックの縦の位置',
        'キャプションあり: ノブの上端 = 文字の上端（トラックの上端 = 行の上端 + (行の高さ − 文字の大きさ) / 2 − ノブの内側の余白）。なし: 行の中央',
      ],
      ['ラベルとキャプションの間', '足さない'],
      ['トラックと文字の間', '12px'],
      ['密度', '全部'],
      [
        '部品の変更',
        '要る（キャプションがあるときの上寄せと、トラックの上の余白）。ここではストーリーの CSS で再現',
      ],
    ],
    tokens: { '--switch-track-rows': '1 / 2', '--switch-gap': '12px' },
  },
];

const columns: Column[] = [
  { label: 'マウス用', note: 'data-density="fine"。トラック 22px・ラベルの行 20px' },
  { label: '指用', note: 'data-density="coarse"。トラック 28px・ラベルの行 24px' },
  {
    label: '大きい指用',
    note: 'data-density="coarse" + coarse-large。トラック 32px・ラベルの行 24px',
  },
];

const density = {
  マウス用: { density: 'fine', className: undefined },
  指用: { density: 'coarse', className: undefined },
  大きい指用: { density: 'coarse', className: 'coarse-large' },
} as const;

// 案ごとの上書き。[data-axis44="…"] の中（このストーリーのセル）だけに効かせる
//   B: 指用のときだけ、トラックをまとまりの中央にする
//   C: キャプションがあるとき、行の間にトラックのはみ出し分を足す
//   D: キャプションがあるとき、トラックをまとまりの上から寄せ、ラベルの行とキャプションの1行目の中央に置く
// 余白を見る: トラックの箱を点線、ラベルとキャプションの箱を青で塗る（軸 29 と同じ）。Controls の showAreas で消せる
const axisCss = `
[data-axis44='B'] [data-density='coarse'] { --switch-track-rows: 1 / -1; }
[data-axis44='C'] [data-measured] > div:first-child {
  row-gap: max(0px, calc((var(--switch-h) - var(--leading-control)) / 2));
}
[data-axis44='D'] [data-measured] > div:first-child:has(> p) > [role='switch'] {
  align-self: start;
  margin-top: max(0px, calc((var(--leading-control) + var(--leading-caption) - var(--switch-h)) / 2));
}
[data-axis44='E'] [data-measured] > div:first-child:has(> p) > :is([role='switch'], label),
[data-axis44='F'] [data-density='coarse'] [data-measured] > div:first-child:has(> p) > :is([role='switch'], label) {
  align-self: start;
}
[data-axis44='G'] [data-measured] > div:first-child:has(> p) > label { align-self: start; }
[data-axis44='G'] [data-measured] > div:first-child:has(> p) > [role='switch'] {
  align-self: start;
  margin-top: calc((var(--leading-control) - var(--text-control)) / 2 - var(--switch-inset));
}
[data-show-areas] [data-axis44] [data-measured] label,
[data-show-areas] [data-axis44] [data-measured] label + p { background-color: rgb(36 116 223 / 0.12); }
[data-show-areas] [data-axis44] [data-measured] [role='switch'] { outline: 1px dashed rgb(236 72 153 / 0.9); outline-offset: 0; }
`;

const px = (value: number) => `${Math.round(value * 10) / 10}`;

// トグル1つの位置を測って、下に数値で出す。値はトグルの行の上端からの距離（px）
//   キャプションまで: キャプションの上端 − トラックの下端。0 は接している。マイナスは、トラックがキャプションの横まで下りている
//   中心の差: トラックの縦の中心 − ラベルの行の縦の中心（＋はトラックが下）
// show: 数値を出すか（Controls の showMeasurements）。測るのはいつも行う
function Measured({ children, show }: { children: ReactNode; show: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [text, setText] = useState<string[]>([]);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const measure = () => {
      const row = el.firstElementChild;
      const track = row?.querySelector('[role="switch"]');
      const label = row?.querySelector('label');
      const caption = label?.nextElementSibling?.tagName === 'P' ? label.nextElementSibling : null;
      if (!row || !track || !label) return;
      const top = row.getBoundingClientRect().top;
      const t = track.getBoundingClientRect();
      const l = label.getBoundingClientRect();
      const range = (r: DOMRect) => `${px(r.top - top)}〜${px(r.bottom - top)}`;
      const diff = t.top + t.height / 2 - (l.top + l.height / 2);
      const lines = [`トラック ${range(t)}・ラベル ${range(l)}`];
      const second = [`中心の差 ${diff > 0.05 ? '+' : ''}${px(diff)}`];
      if (caption) {
        const c = caption.getBoundingClientRect();
        lines[0] += `・キャプション ${range(c)}`;
        second.push(`キャプションまで ${px(c.top - t.bottom)}`);
      }
      setText([...lines, second.join('・')]);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={box} data-measured className="flex flex-col gap-1">
      {children}
      {show &&
        text.map((line) => (
          <p key={line} className="text-xs leading-4 text-fg-muted tabular-nums">
            {line}
          </p>
        ))}
    </div>
  );
}

const longCaption =
  'オンにすると、新しい記事が公開されたときにメールでお知らせします。配信は週に1回まとめて届きます。';

const Cell = ({
  column,
  candidate,
  showMeasurements,
}: {
  column: Column;
  candidate: Candidate;
  showMeasurements: boolean;
}) => {
  const d = density[column.label as keyof typeof density];
  return (
    <div data-axis44={candidate.id}>
      <div
        data-density={d.density}
        className={['flex max-w-[320px] flex-col gap-3', d.className].filter(Boolean).join(' ')}
      >
        <Measured show={showMeasurements}>
          <Switch label="お知らせを受け取る" defaultChecked />
        </Measured>
        <Measured show={showMeasurements}>
          <Switch label="プッシュ通知" caption="コメントがついたときに届きます" />
        </Measured>
        <Measured show={showMeasurements}>
          <Switch label="メールで受け取る" caption={longCaption} defaultChecked />
        </Measured>
        <Measured show={showMeasurements}>
          <Switch label="位置情報を使う" caption="この端末では使えません" disabled />
        </Measured>
        <Measured show={showMeasurements}>
          <Switch
            togglePlacement="end"
            label="メールで受け取る"
            caption={longCaption}
            defaultChecked
          />
        </Measured>
      </div>
    </div>
  );
};

interface ComparisonArgs {
  pick: string;
  showMeasurements: boolean;
  showAreas: boolean;
}

const meta = {
  title: 'Design Review/44 指用のトグルの縦の位置',
  id: 'design-review-44-switch-coarse-position',
  decorators: [keepSwitchCaptionAsCompared, keepToggleColorAsCompared],
  parameters: { layout: 'fullscreen' },
  args: { pick: '', showMeasurements: true, showAreas: true },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）。使い分けるときはカンマで区切る',
      control: 'text',
    },
    showMeasurements: {
      name: '測った値',
      description: '各トグルの下に、測った値（位置・中心の差・キャプションまで）を出す',
      control: 'boolean',
    },
    showAreas: {
      name: '領域',
      description: 'トラックの箱を点線、ラベルとキャプションの箱を青で塗って見せる',
      control: 'boolean',
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick, showMeasurements, showAreas }) => (
    <div data-show-areas={showAreas || undefined}>
      <style>{axisCss}</style>
      <Comparison
        index={44}
        axis="指用のトグルの縦の位置"
        pick={pick}
        candidates={candidates}
        columns={columns}
        renderCell={(column, candidate) => (
          <Cell column={column} candidate={candidate} showMeasurements={showMeasurements} />
        )}
      >
        <p>この軸は ADR-0068 で置き換わりました。</p>
        <p>
          かずえもんのメモ:「switch が coarse
          で大きくなった時、位置に違和感があるなあと思いました。」（Components/Switch
          の「トラックの位置」を指用で見て）
        </p>
        <p>
          軸 29
          で、トラックはラベルの行の中央に置くと決めました。マウス用ではトラックがラベルの行とほぼ同じ高さなので、目立ちません。指用ではトラックがラベルの行より高く、上下に
          2px
          ずつはみ出します。下にはみ出した分で、トラックの下端がキャプションの上端に接し、トラックがラベルとキャプションのまとまりの上に寄って見えます。
        </p>
        <p>
          ここで選ぶのは、キャプションがあるときのトラックの縦の位置です。キャプションがないときは、どの案も行の中央で変わりません（各セルの1つ目）。C・D・E・F
          は部品の変更が要るので、このストーリーの中の CSS で見た目を再現しています。
        </p>
        <p>
          列は密度で固定しています。ツールバーの「指用の高さ」は既定（44px）のままで見てください（大きい指用を選ぶと、指用の列も大きい指用になります）。点線がトラックの箱、青がラベルとキャプションの箱です。各トグルの下の数値は、その場で測った値で、トグルの行の上端からの距離（px）です。「キャプションまで」は、キャプションの上端からトラックの下端を引いたもので、0
          は接している、マイナスはトラックがキャプションの横まで下りていることを表します。
        </p>
        <p>
          点線・青の塗りと数値は、Controls
          の「領域」「測った値」でそれぞれ消せます。実際の見た目だけで比べたいときに使ってください。
        </p>
        <p>
          E・F は、かずえもんの提案「キャプションがあればラベルの上部に揃える」です。E
          は全部の密度に、F は指用（大きい指用も含む）だけに当てています。G
          は、ノブ（●）の上端とラベルの文字の上端をそろえる案です（「その案を作ってみてもらえますか。」）。
        </p>
        <p>どれを既定にするかを一言添えてください。密度で分けたいときも、そう書いてください。</p>
      </Comparison>
    </div>
  ),
};
