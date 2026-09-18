import type { Meta, StoryObj } from '@storybook/react-vite';

import { TextField } from '../../src/components/text-field/TextField';
import { Textarea, type TextareaProps } from '../../src/components/textarea/Textarea';
import { statePseudo } from '../../src/stories/story-states';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 98: 複数行の入力欄（Textarea）
// 決定（高さ）: 現行版（入力に合わせて 3〜8 行で伸びる）を既定にし、右下のつまみはあり・なしを選べる（既定あり）。
//   最小・最大の行数は minRows・maxRows で指定する。スクロールのつまみは ScrollArea と同じ見た目（ADR はあとで書く）
// 決定（余白）: 現行版（TextField とそろえる）。比べるための --textarea-leading・--textarea-padding-y は部品に畳んだので、
//   B・C の行は現行版と同じ見た目になる（比較は比較画像と決めた時点のコミットで残す）
// 高さの案は、決めたあとの props（minRows・maxRows・resizable）で近い形に置き換えた
// 高さ: 高さの決め方（resize と rows）は props なので、案ごとに props を変える。行の高さと余白は現行版のまま
// 行の高さと余白: --textarea-leading・--textarea-padding-y の上書きだけで作る。高さの決め方は現行版（auto・3〜8 行）のまま
// 全案で軸の値を明示する

const short = 'はじめまして。\nかずえもんです。';
const long = [
  'はじめまして、かずえもんです。',
  'ふだんは Web のフロントエンドを書いています。',
  'ポートフォリオを見て、連絡しました。',
  '記事の内容について、いくつか質問があります。',
  '1 つ目は、デザインの決め方についてです。',
  '2 つ目は、部品の作り方についてです。',
  '3 つ目は、ブログの書き方についてです。',
  'お時間のあるときに、お返事をいただけるとうれしいです。',
  'よろしくお願いします。',
  '（ここから先はスクロールして読む）',
].join('\n');

// 行の高さと余白は、全案で現行版の値を明示する
// 余白は、1 行ぶんの高さが TextField と同じになる値（--spacing-control と行の高さから、部品が欄の要素で計算する）
const baseTokens = {
  '--textarea-leading': 'var(--leading-input)',
};

const heightCandidates: Candidate[] = [
  {
    id: '現行版',
    name: '入力に合わせて伸ばす（3〜8 行）',
    intent:
      '空のときは 3 行ぶん。打つと下に伸び、8 行を超えたら欄の中でスクロールする（CSS の field-sizing: content）。field-sizing に対応していないブラウザでは 3 行のまま、右下のつまみで広げられる。',
    spec: [
      ['resize', 'auto'],
      ['rows', '3（いちばん低いとき）'],
      ['maxRows', '8'],
      ['つまみ', 'なし'],
    ],
    tokens: baseTokens,
  },
  {
    id: 'B',
    name: '1 行から伸ばす',
    intent:
      '現行版と同じ伸び方で、空のときは 1 行（TextField と同じ高さ）。チャットやコメントの欄のように、短く書くことが多い場所向け。',
    spec: [
      ['resize', 'auto'],
      ['rows', '1'],
      ['maxRows', '8'],
      ['つまみ', 'なし'],
    ],
    tokens: baseTokens,
  },
  {
    id: 'C',
    name: '右下のつまみで利用者が変える',
    intent: '3 行の高さから、利用者が右下のつまみで縦に広げる・縮める。自動では伸びない。',
    spec: [
      ['resize', 'vertical'],
      ['rows', '3'],
      ['maxRows', '—'],
      ['つまみ', 'あり（縦だけ）'],
    ],
    tokens: baseTokens,
  },
  {
    id: 'D',
    name: '行数で固定',
    intent: '3 行の高さのまま。はみ出した分は欄の中でスクロールする。',
    spec: [
      ['resize', 'none'],
      ['rows', '3'],
      ['maxRows', '—'],
      ['つまみ', 'なし'],
    ],
    tokens: baseTokens,
  },
];

const heightProps: Record<string, Partial<TextareaProps>> = {
  現行版: { minRows: 3, maxRows: 8, resizable: true },
  B: { minRows: 1, maxRows: 8, resizable: true },
  C: { minRows: 3, maxRows: 3, resizable: true },
  D: { minRows: 3, maxRows: 3, resizable: false },
};

const heightColumns: Column[] = [
  { label: '空' },
  { label: '短い文', note: '2 行' },
  { label: '長い文', note: '10 行。伸びる案は 8 行で止まる' },
  { label: 'フォーカス', note: '短い文', preview: 'focus' },
];

const heightValue: Record<string, string | undefined> = {
  空: undefined,
  短い文: short,
  長い文: long,
  フォーカス: short,
};

const spacingCandidates: Candidate[] = [
  {
    id: '現行版',
    name: 'TextField と同じ行の高さ',
    intent:
      '行の高さは 1 行の入力欄と同じ（16px の文字に 24px）。上下の余白は、1 行ぶんの高さが TextField と同じ 44px になる値で、1 行目の文字の位置が TextField とそろう。',
    spec: [
      ['行の高さ', '24px（1.5）'],
      ['上下の余白', '10px（枠線の 2px を含む）'],
      ['3 行の高さ', '92px'],
    ],
    tokens: baseTokens,
  },
  {
    id: 'B',
    name: '本文と同じ行の高さ',
    intent:
      '行の高さを、読む文（マウス用の本文）と同じ 28px にする。長く書く欄で、読み返しやすくする。1 行ぶんの高さは TextField と同じ 44px のままにするため、上下の余白は 2px 狭くなる。',
    spec: [
      ['行の高さ', '28px（1.75）'],
      ['上下の余白', '8px（枠線の 2px を含む）'],
      ['3 行の高さ', '100px'],
    ],
    tokens: { '--textarea-leading': 'calc(var(--text-input) * 1.75)' },
  },
  {
    id: 'C',
    name: '上下にも左右と同じ余白',
    intent:
      '行の高さは現行版のまま、上下の余白を左右の余白（16px）と同じにする。箱らしく、ゆったり見せる。1 行目の文字は TextField より 6px 下がる。',
    spec: [
      ['行の高さ', '24px（1.5）'],
      ['上下の余白', '16px（枠線の 2px を含む）'],
      ['3 行の高さ', '104px'],
    ],
    tokens: {
      '--textarea-leading': 'var(--leading-input)',
      '--textarea-padding-y': 'calc(var(--spacing-control-x) - var(--field-border-width))',
    },
  },
];

const spacingColumns: Column[] = [
  { label: '短い文', note: '2 行' },
  { label: '長い文', note: '8 行で止まる' },
  { label: 'TextField と並べる', note: '上が TextField、下が 1 行の Textarea' },
];

function spacingCell(column: Column) {
  if (column.label === 'TextField と並べる') {
    return (
      <div className="flex w-[300px] flex-col gap-4">
        <TextField label="件名" defaultValue="はじめまして" />
        <Textarea label="本文" minRows={1} defaultValue="よろしくお願いします" />
      </div>
    );
  }
  return (
    <div className="w-[300px]">
      <Textarea label="本文" defaultValue={column.label === '長い文' ? long : short} />
    </div>
  );
}

interface ComparisonArgs {
  pick?: string;
}

const meta = {
  title: 'Design Review/98 複数行の入力欄（Textarea）',
  id: 'design-review-98-textarea',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({ focusWithin: '[data-slot="control"]' }),
  },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Height: Story = {
  name: '高さの決め方',
  args: { pick: 'current' },
  render: ({ pick }) => (
    <Comparison
      index={98}
      axis="Textarea の高さの決め方"
      pick={pick}
      candidates={heightCandidates}
      columns={heightColumns}
      renderCell={(column, candidate) => (
        <div className="w-[300px]">
          <Textarea
            label="本文"
            placeholder="ご用件をお書きください"
            defaultValue={heightValue[column.label]}
            {...heightProps[candidate.id]}
          />
        </div>
      )}
    >
      <p>
        決定: 現行版（入力に合わせて 3〜8
        行で伸びる）を既定にしました。右下のつまみはあり・なしを選べ（既定はあり）、最小・最大の行数は
        minRows・maxRows で指定します。上限を超えたときのスクロールのつまみは ScrollArea
        と同じ見た目です（ADR はあとで書く）。
      </p>
      <p>
        複数行の入力欄の高さを、どう決めるかを選びます。どれを既定にし、どれを props
        で選べるようにするかも教えてください。いまは 4 つとも props（resize・rows）で選べます。
      </p>
      <p>
        伸びる動きとつまみは静止画では分からないので、セルの中で文を打つ・消す、右下のつまみを引くなどして確かめてください。
      </p>
    </Comparison>
  ),
};

export const Spacing: Story = {
  name: '行の高さと上下の余白',
  args: { pick: 'current' },
  render: ({ pick }) => (
    <Comparison
      index={98}
      axis="Textarea の行の高さと上下の余白"
      pick={pick}
      candidates={spacingCandidates}
      columns={spacingColumns}
      renderCell={(column) => spacingCell(column)}
    >
      <p>
        決定: 現行版（TextField とそろえる）。B・C
        は、比べるためのトークンを部品に畳んだので、いまは現行版と同じ見た目です（ADR
        はあとで書く）。
      </p>
      <p>
        行の高さと上下の余白を選びます。文字の大きさは、1 行の入力欄と同じ 16px（指でも同じ）です。
        高さの決め方は現行版（入力に合わせて 3〜8 行）のままです。
      </p>
    </Comparison>
  ),
};
