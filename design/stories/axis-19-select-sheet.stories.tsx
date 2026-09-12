import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';

import { Select, type SheetMoreCue } from '../../src/components/Select';
import { TextField } from '../../src/components/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 19: Select のボトムシート（原則11 — 構造の切り替え、ADR-0004）
// 各セルは幅 375px のスマートフォンの枠。枠に transform を付けて、シートの fixed を枠の中に閉じ込める
//   枠は overflow: clip にする（hidden だとスクロールできる箱になり、開いた直後にフォーカスが
//   枠の外の選択肢へ移って、枠の中身が上にずれた — 2回目の比較の前に直した）
// 1回目: 現行版（浮かぶまま）・A シート・B シート＋つまみ・C シート（暗くしない）
// 2回目: 全案に × と後ろを暗くする背景。つまみは選択肢が長いときだけ。長いときの見せ方を D〜F で比べた
// 3回目: 見出しを「ラベル＋ヘルプテキスト」のまとまりと右上に固定した × に分けた。2回目の E を土台に、続きの印（G・H・I）を比べた
// 4回目: I の下端の余白を直し、影を上下に付けた。上下の影＋上下の山形（J）を足した
// 5回目: 影をスクロールした量に合わせて濃くし、スクロールバーの手前で止めた。上の端の区切り線（K・L・N）を比べた
// 6回目: 「N + 区切り線はいつも」（O）に決まった。影をシートの端から描くよう直した（左に 4px の隙間があった）
// 浮かぶ選択肢にも続きの影を付けるかは、下の「浮かぶ選択肢の続きの印」で比べる

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '上下の影（4回目の I を直したもの）',
    intent:
      '続きがある側の端に内側の影（12px・濃紺 10%）。影はスクロールした量に合わせて 24px で最も濃くなり、急には出ない。スクロールバーの上には出さない。',
    spec: [
      ['上の端', '内側の影（スクロールで濃く）'],
      ['下の端', '内側の影'],
    ],
  },
  {
    id: 'K',
    name: '上は区切り線',
    intent:
      '上の端は影ではなく、1px の区切り線（シートの輪郭と同じ #DEE0E1）。スクロールした量に合わせて濃くなる。',
    spec: [
      ['上の端', '区切り線（スクロールで出る）'],
      ['下の端', '内側の影'],
    ],
  },
  {
    id: 'L',
    name: '上は区切り線（いつも）',
    intent:
      'K の区切り線を、スクロールしていなくてもいつも出す。見出しと選択肢の境目がいつもはっきりする。',
    spec: [
      ['上の端', '区切り線（いつも）'],
      ['下の端', '内側の影'],
    ],
  },
  {
    id: 'N',
    name: '上は区切り線＋影',
    intent: 'K の区切り線に、現行版の上の影を重ねる。スクロールした量に合わせて両方が濃くなる。',
    spec: [
      ['上の端', '区切り線＋内側の影（スクロールで出る）'],
      ['下の端', '内側の影'],
    ],
  },
  {
    id: 'O',
    name: '上は区切り線（いつも）＋影',
    intent:
      'N の区切り線を、いつも出す。影はスクロールした量に合わせて濃くなる（6回目・ユーザーの案「N + 区切り線はいつも」）。',
    spec: [
      ['上の端', '区切り線（いつも）＋内側の影（スクロールで出る）'],
      ['下の端', '内側の影'],
    ],
  },
];

const cueOf: Record<string, SheetMoreCue> = {
  現行版: 'shadow',
  K: 'divider',
  L: 'divider-always',
  N: 'divider-shadow',
  O: 'divider-always-shadow',
};

const columns: Column[] = [
  {
    label: '開いた状態（23件）',
    note: '開いたまま固定し、少しスクロールした位置にしています。スクロールすると印の濃さが変わります',
  },
  {
    label: '閉じた状態（押して開く）',
    note: '「住所」は23件（ヘルプテキストが長い）、「お届けの時間帯」は5件',
  },
];

// 東京都の23区
const wards = [
  '足立区',
  '荒川区',
  '板橋区',
  '江戸川区',
  '大田区',
  '葛飾区',
  '北区',
  '江東区',
  '品川区',
  '渋谷区',
  '新宿区',
  '杉並区',
  '墨田区',
  '世田谷区',
  '台東区',
  '中央区',
  '千代田区',
  '豊島区',
  '中野区',
  '練馬区',
  '文京区',
  '港区',
  '目黒区',
].map((label, i) => ({ label, value: `ward-${i}` }));

const times = ['午前中', '14〜16時', '16〜18時', '18〜20時', '19〜21時'].map((label, i) => ({
  label,
  value: `time-${i}`,
}));

const caption = '番地と建物名は、下の欄に入力してください';
const longCaption =
  '番地と建物名は、下の欄に入力してください。23区以外の地域は、いまはお届けできません。お届けできる地域は、順に広げていきます。';

// 開いたまま固定した選択肢を、上の続きの印も見えるよう、少しスクロールした位置にする
const useScrolledList = (open: boolean, root: HTMLElement | null) => {
  useEffect(() => {
    if (!open || !root) return undefined;
    const id = setTimeout(() => {
      const list = root.querySelector('[role="listbox"]');
      if (list) list.scrollTop = 88;
    }, 500);
    return () => clearTimeout(id);
  }, [open, root]);
};

// スマートフォンの画面（375 × 700）。指で操作する密度に固定する
const Phone = ({ candidate, open }: { candidate: Candidate; open: boolean }) => {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const options = {
    presentation: 'sheet',
    sheetDetent: 'half',
    sheetMoreCue: cueOf[candidate.id] ?? 'shadow',
  } as const;
  useScrolledList(open, frame);
  return (
    <div
      ref={setFrame}
      data-density="coarse"
      data-sheet-preview={open || undefined}
      className="relative h-[700px] w-[375px] [transform:translateZ(0)] overflow-clip rounded-[28px] border border-line bg-bg"
    >
      <div className="flex flex-col gap-5 px-5 pt-8">
        <h2 className="text-xl font-heading">お届け先</h2>
        <TextField label="お名前" defaultValue="山田 花子" />
        {frame && (
          <>
            <Select
              label="住所"
              prefix="東京都"
              caption={open ? caption : longCaption}
              items={wards}
              defaultValue="ward-1"
              container={frame}
              {...options}
              {...(open ? { open: true, modal: false } : {})}
            />
            {!open && (
              <Select
                label="お届けの時間帯"
                items={times}
                defaultValue="time-0"
                container={frame}
                {...options}
              />
            )}
          </>
        )}
        <TextField label="番地・建物名" defaultValue="西日暮里 1-2-3" />
      </div>
    </div>
  );
};

// 開いた直後は選んだ項目が hover の状態になるので、固定した列ではそれを外す
const highlightPreview = [
  '[data-sheet-preview] [role="option"][data-highlighted] { background-color: transparent; }',
  '[data-sheet-preview] [role="option"][data-highlighted][data-selected] { background-color: var(--color-select-item-selected); }',
].join('\n');

// 開いたままの選択肢がフォーカスを取り、ページが最後の行までスクロールするのを戻す
const ResetFocus = () => {
  useEffect(() => {
    const id = setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      window.scrollTo(0, 0);
    }, 300);
    return () => clearTimeout(id);
  }, []);
  return null;
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/19 Select のボトムシート',
  id: 'design-review-19-select-sheet',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  args: { pick: 'O' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'K', 'L', 'N', 'O'],
    },
  },
  render: ({ pick }) => (
    <>
      <style>{highlightPreview}</style>
      <ResetFocus />
      <Comparison
        index={19}
        axis="Select のボトムシート"
        pick={pick}
        candidates={candidates}
        columns={columns}
        renderCell={(column, candidate) => (
          <Phone candidate={candidate} open={column.label === '開いた状態（23件）'} />
        )}
      >
        <p>
          <strong className="text-fg">決定: O 上は区切り線（いつも）＋影</strong>
          。「N + 区切り線はいつも でよいですが、左に微妙に隙間がありますね」（隙間は直しました）
        </p>
        <p>
          スマートフォンで Select
          の選択肢を画面の下から出すシートの、「まだ続きがある」の見せ方を選びます。部品では、出し方を自動・浮かぶ強制・シート強制から選べます（
          <code>presentation="auto" | "popover" | "sheet"</code>
          ）。自動は、指で操作していて、縦長なら 768px（<code>md</code>）、横長なら 1024px（
          <code>lg</code>）より狭いときにシートにします。
        </p>
        <p>
          5回目: 「I
          で良さそうですが、上の影が急に出てくるのが不自然ですね。あとは、スクロールバー領域にも出てくるのが変かも。divider
          を付けてみるとどうでしょうか？」を受けて、影をスクロールした量に合わせて少しずつ濃くし、スクロールバーの上には出さないようにしました（現行版）。上の端に区切り線を付けた案を比べました。
        </p>
        <p>
          選択肢が短いとき（「お届けの時間帯」の5件）は、中身の高さで開き、つまみも印も出しません。
        </p>
        <p>枠は幅 375px のスマートフォンの画面で、指で操作する寸法（高さ 44px）にしています。</p>
      </Comparison>
    </>
  ),
};

// ── 浮かぶ選択肢の続きの印 ─────────────────────────────
// 1回目: 現行版（上限なし）・P（8.5 項目＋上下の影）・Q（8.5 項目だけ）。P に決まった
// 2回目: 影を面の端まで描くよう直した（左と上下に余白があった）。高さの上限を画面の高さに合わせる R を足した
// 3回目: R に決まり、項目の数の上限（10.5 項目）を足した S を加えた。S を部品の既定にした
// 各セルは、高さの違う画面（640px・900px・1200px）。枠が画面の代わりになる（空きと高さの上限を、枠の高さで決める）

const popoverRows = 'calc(var(--size-control) * 8.5 + var(--select-popup-padding) * 2)';

const popoverCandidates: Candidate[] = [
  {
    id: '現行版',
    name: '上限なし',
    intent:
      '高さの上限を付けず、画面の端まで伸ばす（ADR-0036 のまま）。長いときは画面の端で切れて、中でスクロールする。',
    spec: [
      ['高さ', '画面の端まで'],
      ['続きの印', 'なし'],
    ],
  },
  {
    id: 'P',
    name: '8.5 項目＋上下の影',
    intent:
      '高さを 8.5 項目分に抑え、最後の項目を半分見せる。続きがある側の端に内側の影（シートと同じ）。1回目で選ばれた。',
    spec: [
      ['高さ', '8.5 項目分（どの画面でも同じ）'],
      ['続きの印', '上下の内側の影'],
    ],
    tokens: { '--select-popup-max-height': popoverRows },
  },
  {
    id: 'R',
    name: '画面の高さの半分＋上下の影',
    intent:
      '高さの上限を、画面の高さの半分（本体の下の空きが足りなければその空き）にし、最後の項目が半分見える高さで切る。2回目で選ばれた。',
    spec: [
      ['高さ', '画面の高さの半分（最後の項目を半分見せる）'],
      ['続きの印', '上下の内側の影'],
    ],
    tokens: { '--select-popup-max-rows': '999' },
  },
  {
    id: 'S',
    name: 'R＋項目の数の上限',
    intent:
      'R に、項目の数の上限（10.5 項目。10 項目と、半分だけ見える 1 項目）を足す。大きな画面で長くなりすぎない。部品の既定。',
    spec: [
      ['高さ', '画面の高さの半分。ただし 10.5 項目まで'],
      ['続きの印', '上下の内側の影'],
    ],
  },
];

const popoverColumns: Column[] = [
  { label: '高さ 640px の画面', note: '開いたまま固定し、少しスクロールした位置にしています' },
  { label: '高さ 900px の画面', note: '同じ' },
  { label: '高さ 1200px の画面', note: '同じ' },
];

const screenHeightOf = (column: Column) => Number(column.label.match(/\d+/)?.[0] ?? 640);

// 高さを決めた画面の枠。浮かぶ部分をこの中に描き、行ごとのトークンと、枠の高さに合わせた上限が効くようにする
const Screen = ({ candidate, height }: { candidate: Candidate; height: number }) => {
  const [screen, setScreen] = useState<HTMLDivElement | null>(null);
  useScrolledList(true, screen);
  return (
    <div
      ref={setScreen}
      data-sheet-preview
      style={{ height }}
      className="relative w-[300px] overflow-clip rounded-[20px] border border-line bg-bg"
    >
      <div className="flex flex-col gap-5 px-5 pt-5">
        <h2 className="text-xl font-heading">お届け先</h2>
        {screen && (
          <Select
            label="住所"
            prefix="東京都"
            items={wards}
            defaultValue="ward-1"
            open
            modal={false}
            container={screen}
            collisionAvoidance={{ side: 'none', align: 'none' }}
            popoverMoreCue={candidate.id === '現行版' ? 'none' : 'shadow'}
            popoverMaxHeight={candidate.id === 'R' || candidate.id === 'S' ? 'screen' : 'none'}
          />
        )}
        <TextField label="番地・建物名" defaultValue="西日暮里 1-2-3" />
      </div>
    </div>
  );
};

export const PopoverCue: Story = {
  name: '浮かぶ選択肢の続きの印',
  args: { pick: 'S' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'P', 'R', 'S'],
    },
  },
  render: ({ pick }) => (
    <>
      <style>{highlightPreview}</style>
      <ResetFocus />
      <Comparison
        index={19}
        axis="浮かぶ選択肢の続きの印"
        pick={pick}
        candidates={popoverCandidates}
        columns={popoverColumns}
        renderCell={(column, candidate) => (
          <Screen candidate={candidate} height={screenHeightOf(column)} />
        )}
      >
        <p>
          <strong className="text-fg">決定: S 画面の高さの半分＋項目の数の上限＋上下の影</strong>
          。「R ですが、上限を設定したい気持ちがありますね」
        </p>
        <p>
          シートの上下の影を、浮かぶ選択肢（マウスで操作するとき）にも付けます。「P
          がよさそうです。先ほどの時と同様、影に余白がありますね」を受けて、影を面の端まで描くよう直しました。
        </p>
        <p>
          2回目:
          「項目の長さは画面構成にもよると思うので、画面高さ依存にしてもいい気がしました」を受けて、高さの上限を画面の高さの半分にする
          R を足しました。3回目: R に項目の数の上限（10.5 項目、<code>--select-popup-max-rows</code>
          ）を足した S を加えました。高さの違う3つの画面で比べます。
        </p>
      </Comparison>
    </>
  ),
};

// 枠を使わず、部品の既定の動き（presentation="auto"）で開く
// 指で操作していて、縦長なら 768px、横長なら 1024px より狭いときはシート。それ以外は浮かぶ選択肢
export const Device: Story = {
  name: '実機で確かめる',
  render: () => (
    <div className="mx-auto flex max-w-[480px] flex-col gap-5 bg-bg px-5 py-8 text-fg">
      <h2 className="text-xl font-heading">お届け先</h2>
      <p className="text-sm leading-6 text-fg-muted">
        部品の既定の動きで開きます。指で操作していて、縦長なら 768px、横長なら 1024px
        より狭いと、選択肢が画面の下から出ます（シート）。マウスで操作しているときは、画面が狭くても浮かぶ選択肢で、高さは画面の高さの半分（10.5
        項目まで）です。ページを少しスクロールしてから開くと、後ろの画面がずれないかも確かめられます。
      </p>
      <TextField label="お名前" defaultValue="山田 花子" />
      <TextField label="電話番号" defaultValue="080-1234-5678" />
      <Select label="住所" prefix="東京都" caption={caption} items={wards} defaultValue="ward-1" />
      <Select label="お届けの時間帯" items={times} defaultValue="time-0" />
      <TextField label="番地・建物名" defaultValue="西日暮里 1-2-3" />
      {Array.from({ length: 6 }, (_, i) => (
        <p key={i} className="text-sm leading-6 text-fg-muted">
          お届けの日時は、ご注文のあとでも変えられます。変えたいときは、お届けの前日までにご連絡ください。ご不在のときは、不在票をお入れします。
        </p>
      ))}
    </div>
  ),
};
