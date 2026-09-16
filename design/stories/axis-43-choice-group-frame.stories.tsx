import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Checkbox, CheckboxGroup, type ChoiceFrame } from '../../src/components/Checkbox';
import { type CaptionPlacement } from '../../src/components/Field';
import { type Candidate, type Column, Comparison } from './Comparison';
import { keepToggleColorAsCompared } from './pins';

// 後半の軸 43: 「すべて選ぶ」のグループの枠
// いまは枠を付けず、子の選択肢を「すべて選ぶ」の横の文字の始まりまで字下げする
// ユーザーの答え: 「カードのような薄いフチの枠でくくるオプションも欲しい」「単純に選択肢を囲むパターンと、全て選ぶ の文字に半分かかるような見た目」
// 枠の形は CheckboxGroup の selectAllFrame（行ごとに変える）。見た目は次のトークン（src/components/Checkbox.tsx が読む）。どの行も同じ値を明示する
//   --choice-frame-line-width・--color-choice-frame-line: 線の太さと色
//   --choice-frame-radius: 角
//   --choice-frame-pad-x-fine・-coarse・--choice-frame-pad-y: 枠と中の選択肢のあいだ（左右・上下）
//   --choice-frame-notch-gap: B（notched）で、「すべて選ぶ」の文字のうしろの線の切れ目
//   --color-choice-frame-notch-bg: B で、線を切るために「すべて選ぶ」の文字の下に塗る色（置く面の色）
// B は、はじめ fieldset と legend の形（左の角を角丸が収まる幅だけあけ、「すべて選ぶ」を線に載せる）で作ったが、
//   ユーザーの「全て選ぶのチェックボックスに角が隠れつつ、字下げされているように見える位置」に合わせて作り直した

const look = {
  '--color-choice-frame-notch-bg': 'var(--color-surface)',
  '--choice-frame-line-width': '1px',
  '--color-choice-frame-line': 'var(--color-line)',
  '--choice-frame-radius': 'var(--radius-card)',
  '--choice-frame-pad-x-fine': 'var(--space-control-x-fine)',
  '--choice-frame-pad-x-coarse': 'var(--space-control-x-coarse)',
  '--choice-frame-pad-y': '4px',
  '--choice-frame-notch-gap': '6px',
};

const lookSpec: [string, string][] = [
  ['線', '1px・細い境界線の色（--color-line）'],
  ['角', 'カードの角 16px'],
  ['中の余白', '左右はマウス用 12px・指用 16px（部品の左右の余白）、上下 4px（行の中の間に足す）'],
  ['影', 'なし（ページと同じレイヤー）'],
];

const frames: Record<string, ChoiceFrame> = {
  現行版: 'none',
  A: 'options',
  B: 'notched',
  C: 'all',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '枠なし・字下げ',
    intent:
      '枠を付けず、子の選択肢を「すべて選ぶ」の横の文字の始まりまで字下げする。親と子の関係は字下げだけで見せる。',
    spec: [
      ['selectAllFrame', 'none'],
      ['子の箱の位置', '「すべて選ぶ」の横の文字の始まり'],
    ],
    tokens: look,
  },
  {
    id: 'A',
    name: '選択肢だけを囲む',
    intent:
      '子の選択肢だけをカードのような薄いフチで囲み、「すべて選ぶ」は枠の外の上に置く。枠が「すべて選ぶ」の中身の範囲を示す。',
    spec: [['selectAllFrame', 'options'], ['子の箱の位置', '枠の内側（左右の余白）'], ...lookSpec],
    tokens: look,
  },
  {
    id: 'B',
    name: '「すべて選ぶ」の箱が枠の角を隠す',
    intent:
      '枠の上の線を「すべて選ぶ」の箱の縦の中央に、左の線を箱の横の中央に通し、左上の角を箱の下に隠す。線は「すべて選ぶ」の文字のうしろで切れる。子の選択肢は枠の中にあり、枠との余白は上下左右で同じ（かずえもんの案）。',
    spec: [
      ['selectAllFrame', 'notched'],
      [
        '子の箱の位置',
        '枠の左右と下の線から子の箱の端まで、「すべて選ぶ」の箱から1番目の子の箱までが同じ（マウス用 12px・指用 16px）',
      ],
      ['線の切れ目', '「すべて選ぶ」の文字のうしろ 6px まで。左上の角は箱の下（角丸なし）'],
      ...lookSpec,
    ],
    tokens: look,
  },
  {
    id: 'C',
    name: '全体を囲む',
    intent:
      '「すべて選ぶ」も含めてグループ全体を囲む。中は現行版と同じく、子の選択肢を字下げする。',
    spec: [
      ['selectAllFrame', 'all'],
      ['子の箱の位置', '枠の中で「すべて選ぶ」の横の文字の始まり'],
      ...lookSpec,
    ],
    tokens: look,
  },
];

const columns: Column[] = [
  {
    label: 'マウス用',
    note: 'いくつか選んだ状態（「すべて選ぶ」は中間）。見出しとキャプションつき',
  },
  { label: '指用', note: '同じものを指用の密度で' },
  { label: 'エラー', note: 'グループのエラーの行つき。上がマウス用・下が指用' },
  { label: '押せない', note: 'グループごと押せない。上がマウス用・下が指用' },
  {
    label: 'キャプションを下に',
    note: 'captionPlacement="bottom"。枠のすぐ下にキャプションとエラー。マウス用',
  },
];

const Note = ({ children }: { children: ReactNode }) => (
  <p className="text-xs font-bold text-fg-subtle">{children}</p>
);

const allValues = ['mail', 'tel', 'post'];

const Group = (props: {
  frame: ChoiceFrame;
  error?: string;
  disabled?: boolean;
  captionPlacement?: CaptionPlacement;
}) => (
  <CheckboxGroup
    label="連絡の方法"
    caption="受け取る方法を選びます"
    captionPlacement={props.captionPlacement}
    selectAll="すべて選ぶ"
    allValues={allValues}
    selectAllFrame={props.frame}
    defaultValue={['mail']}
    error={props.error}
    disabled={props.disabled}
  >
    <Checkbox value="mail" label="メール" />
    <Checkbox value="tel" label="電話" caption="平日の 10 時から 18 時" />
    <Checkbox value="post" label="郵送" />
  </CheckboxGroup>
);

const Cell = ({ column, frame }: { column: Column; frame: ChoiceFrame }) => {
  const box = 'flex max-w-[320px] flex-col gap-3';
  switch (column.label) {
    case 'マウス用':
    case '指用':
      return (
        <div data-density={column.label === '指用' ? 'coarse' : 'fine'} className={box}>
          <Group frame={frame} />
        </div>
      );
    case 'キャプションを下に':
      return (
        <div data-density="fine" className={box}>
          <Group frame={frame} captionPlacement="bottom" error="2つ以上選んでください" />
        </div>
      );
    default:
      return (
        <div className="flex max-w-[320px] flex-col gap-6">
          {(['fine', 'coarse'] as const).map((density) => (
            <div key={density} data-density={density} className="flex flex-col gap-3">
              <Note>{density === 'fine' ? 'マウス用' : '指用'}</Note>
              {column.label === 'エラー' ? (
                <Group frame={frame} error="2つ以上選んでください" />
              ) : (
                <Group frame={frame} disabled />
              )}
            </div>
          ))}
        </div>
      );
  }
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/43 すべて選ぶのグループの枠',
  id: 'design-review-43-choice-group-frame',
  decorators: [keepToggleColorAsCompared],
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
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
    <Comparison
      index={43}
      axis="すべて選ぶのグループの枠"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => <Cell column={column} frame={frames[candidate.id]} />}
    >
      <p>
        <strong className="text-fg">決まったこと</strong>
        （ADR-0064）。いまの「すべて選ぶ」のグループは、枠を付けず、子の選択肢を「すべて選ぶ」の横の文字の始まりまで字下げしています。これは既定のまま残し、カードのような薄いフチの枠で囲む形を、CheckboxGroup
        のオプション（selectAllFrame）で選べるようにします。
      </p>
      <p>
        ここで選ぶのは枠の形です。A は子の選択肢だけを囲み、「すべて選ぶ」は枠の外の上に置きます。B
        は fieldset と legend
        のように、枠の上の線を「すべて選ぶ」の箱と文字の縦の中央に通し、そこだけ線を切ります。C
        は「すべて選ぶ」も含めて全体を囲みます。枠はどの案も同じで、線は細い境界線、角はカードの角（部品より一段大きい角）、影はなし（ページと同じレイヤー）です。
      </p>
      <p>
        列は、マウス用・指用（どちらもいくつか選んだ状態で、「すべて選ぶ」は中間）、エラー、押せない、キャプションを下に置いたときです。見出しとキャプションとの並びも見てください。どのセルも本物なので、押して確かめられます。
      </p>
      <p>どれを既定にするか、ほかを選べるようにするかを一言添えてください。</p>
    </Comparison>
  ),
};
