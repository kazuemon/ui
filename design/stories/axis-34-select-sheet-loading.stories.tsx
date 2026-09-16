import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';

import { Select, type SelectItem } from '../../src/components/Select';
import { TextField } from '../../src/components/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 34: ボトムシートの「読み込んでいます」の行
// 浮かぶ選択肢の読み込み中の行（ADR-0042）は、シートでも同じ行を一覧の下に置いている。シートでの見た目は比べていなかった
// 変えるのは次のトークンだけ（src/components/Select.tsx のシートの読み込み中の行が読む）
//   --select-sheet-loading-justify: 並び（flex-start は左寄せ、center は中央）
//   --select-sheet-loading-extra: 項目の高さ（指用 44px）に足す高さ
//   --select-sheet-loading-line-width: 上の区切り線の太さ（シートの幅いっぱい）
// 各セルは幅 375px のスマートフォンの枠で、指で操作する密度に固定する

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '浮かぶ選択肢と同じ行',
    intent:
      '項目と同じ高さ（44px）と左の余白で、回る円と文を左に置く。選べない項目が1つ増えたように見える。',
    spec: [
      ['並び', '左寄せ（項目の文字とそろう）'],
      ['高さ', '44px（項目と同じ）'],
      ['区切り線', 'なし'],
    ],
    tokens: {
      '--select-sheet-loading-justify': 'flex-start',
      '--select-sheet-loading-extra': '0px',
      '--select-sheet-loading-line-width': '0px',
    },
  },
  {
    id: 'A',
    name: '中央に置く',
    intent:
      '高さはそのままで、回る円と文をシートの中央に置く。項目ではなく、シート全体の状態として見える。',
    spec: [
      ['並び', '中央'],
      ['高さ', '44px（項目と同じ）'],
      ['区切り線', 'なし'],
    ],
    tokens: {
      '--select-sheet-loading-justify': 'center',
      '--select-sheet-loading-extra': '0px',
      '--select-sheet-loading-line-width': '0px',
    },
  },
  {
    id: 'B',
    name: '区切り線の下に中央',
    intent:
      '一覧との間に、シートの幅いっぱいの区切り線（見出しの下の線と同じ色）を引き、下の帯として 56px の高さで中央に置く。',
    spec: [
      ['並び', '中央'],
      ['高さ', '56px（項目より 12px 高い）'],
      ['区切り線', '上に 1px（#DEE0E1、幅いっぱい）'],
    ],
    tokens: {
      '--select-sheet-loading-justify': 'center',
      '--select-sheet-loading-extra': '12px',
      '--select-sheet-loading-line-width': '1px',
    },
  },
];

const columns: Column[] = [
  { label: '選択肢が 0 件', note: '都道府県を選んだ直後など、はじめて読み込むとき' },
  { label: '選択肢が 3 件', note: '続きを読み込んでいるとき。中身の高さで開きます' },
  { label: '選択肢が 23 件', note: '半分の高さで開き、つまみが出ます。一覧の下に行があります' },
];

const wardNames = [
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
];

const itemsOf = (column: Column): SelectItem[] => {
  const count = Number(column.label.match(/\d+/)?.[0] ?? 0);
  return wardNames.slice(0, count).map((label, i) => ({ label, value: `ward-${i}` }));
};

// スマートフォンの画面（375 × 640）。枠に transform を付けて、シートの fixed を枠の中に閉じ込める
const Phone = ({ items }: { items: SelectItem[] }) => {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setFrame}
      data-density="coarse"
      data-sheet-loading-preview
      className="relative h-[640px] w-[375px] [transform:translateZ(0)] overflow-clip rounded-[28px] border border-line bg-bg"
    >
      <div className="flex flex-col gap-5 px-5 pt-8">
        <h2 className="text-xl font-heading">お届け先</h2>
        <TextField label="お名前" defaultValue="山田 花子" />
        {frame && (
          <Select
            label="市区町村"
            prefix="東京都"
            caption="番地と建物名は、下の欄に入力してください"
            items={items}
            placeholder="選んでください"
            loading
            presentation="sheet"
            open
            modal={false}
            container={frame}
          />
        )}
      </div>
    </div>
  );
};

// 開いた直後に付く hover を外す（読み込み中の行の見た目だけを比べる）
const highlightPreview =
  '[data-sheet-loading-preview] [role="option"][data-highlighted] { background-color: transparent; }';

// 開いたままの選択肢がフォーカスを取り、ページが最後の行までスクロールするのを戻す
const ResetFocus = () => {
  useEffect(() => {
    const id = setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      window.scrollTo(0, 0);
      for (const el of document.querySelectorAll('.overflow-x-auto')) el.scrollLeft = 0;
    }, 300);
    return () => clearTimeout(id);
  }, []);
  return null;
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/34 ボトムシートの読み込み中の行',
  id: 'design-review-34-select-sheet-loading',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <>
      <style>{highlightPreview}</style>
      <ResetFocus />
      <Comparison
        index={34}
        axis="ボトムシートの読み込み中の行"
        pick={pick}
        candidates={candidates}
        columns={columns}
        renderCell={(column) => <Phone items={itemsOf(column)} />}
      >
        <p>
          <strong className="text-fg">決まったこと</strong>
          （ADR-0055）。選択肢を読み込んでいるあいだ（止めない読み込み —
          ADR-0042）に、画面の下から出るシートで「読み込んでいます」の行をどう見せるかを選びます。いまは、浮かぶ選択肢と同じ行（項目と同じ高さ・左寄せ）を一覧の下に置いています（現行版）。
        </p>
        <p>
          列は選択肢の数です。0 件ははじめて読み込むとき、3 件と 23
          件は続きを読み込んでいるときです。23
          件では、シートが半分の高さで開き、行は一覧の下（シートの下の端）に出ます。
        </p>
        <p>枠は幅 375px のスマートフォンの画面で、指で操作する寸法（高さ 44px）にしています。</p>
        <p>どれを既定にするかを一言添えてください。</p>
      </Comparison>
    </>
  ),
};
