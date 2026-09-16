import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';

import { TextField } from '../../src/components/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 37: 入力欄の下の成功・情報の行
// キャプション・エラー・警告と同じ並びの形（アイコン＋文 — design/adr/0041）で、成功（丸のチェック）と情報（丸の「i」）の行を足す
// 部品（Field・TextField）に success・info を足した。行の形・読み上げ（polite）・開閉の動きは、エラー・警告の行と同じ
// 並びはエラー → 警告 → 成功 → 情報（重いものが上）
// 案の違いは、成功のときの欄の見た目だけ。次のトークンで変える（src/components/TextField.tsx・Field.tsx が読む）
//   --color-field-success-line: 成功のときのふだんの枠線（transparent は変えない）。フォーカス中は青、エラーのときは赤のまま
//   --field-success-mark: 成功のとき欄の右端（回る円の場所）に置くチェック（none・flex）
// 現行版は、いまの部品に行がないので、success・info を渡さずに描く

interface MessageCandidate extends Candidate {
  /** 成功・情報の行を出すか（現行版は出せない） */
  rows: boolean;
}

const candidates: MessageCandidate[] = [
  {
    id: '現行版',
    rows: false,
    name: '行がない',
    intent:
      'いまの部品には、成功・情報の行がない。「使えるユーザー名です」のような結果は、キャプションを書き換えるか、何も出さないしかない。',
    spec: [
      ['成功・情報の行', '出せない（success・info を渡していない）'],
      ['成功のときの枠線', '変えない（transparent）'],
      ['欄の中の印', 'なし（none）'],
    ],
    tokens: { '--color-field-success-line': 'transparent', '--field-success-mark': 'none' },
  },
  {
    id: 'A',
    rows: true,
    name: '行だけ足す',
    intent:
      '本体の下に、エラー・警告と同じ形の行を足す。欄の見た目は変えない（警告と同じ扱い）。成功は直すものではないので、状態（枠線）ではなく、入力した結果の知らせとして扱う。',
    spec: [
      ['成功の行', '丸のチェック＋文。#008132（白地 5.02:1）'],
      ['情報の行', '丸の「i」＋文。--color-fg-info（白地 5.10:1）'],
      ['成功のときの枠線', '変えない（transparent）'],
      ['欄の中の印', 'なし（none）'],
      ['並び', 'エラー → 警告 → 成功 → 情報'],
    ],
    tokens: { '--color-field-success-line': 'transparent', '--field-success-mark': 'none' },
  },
  {
    id: 'B',
    rows: true,
    name: '成功のときは枠線も緑',
    intent:
      'A の行に加えて、成功のときは欄のふだんの枠線を緑にする（原則2: 状態は枠線）。フォーカスすると青い枠線に替わる。エラーと違い、塗りは変えない。情報は欄の見た目を変えない。',
    spec: [
      ['成功の行・情報の行', 'A と同じ'],
      ['成功のときの枠線', '2px の緑（--color-fg-success、#008132）。フォーカス中は青'],
      ['塗り', '変えない（エラーだけが淡い赤）'],
      ['欄の中の印', 'なし（none）'],
    ],
    tokens: {
      '--color-field-success-line': 'var(--color-fg-success)',
      '--field-success-mark': 'none',
    },
  },
  {
    id: 'C',
    rows: true,
    name: '成功のときは欄の右端にチェック',
    intent:
      'A の行に加えて、成功のときは欄の右端（確かめているあいだ回る円がある場所）に緑のチェックを置く。回る円が、結果が出るとチェックに替わる。枠線は変えない。',
    spec: [
      ['成功の行・情報の行', 'A と同じ'],
      ['成功のときの枠線', '変えない（transparent）'],
      ['欄の中の印', 'チェック（flex）。#008132、回る円と同じ場所（suffix の前）'],
    ],
    tokens: { '--color-field-success-line': 'transparent', '--field-success-mark': 'flex' },
  },
];

const columns: Column[] = [
  { label: 'ふだん', note: '上が成功（ユーザー名が使える）、下が情報（全角の数字を半角に直した）' },
  {
    label: 'フォーカス中',
    note: '同じ欄にフォーカスしているところ（固定）。B は枠線が青に替わる',
    preview: 'focus',
  },
  {
    label: 'ほかの行と一緒に',
    note: '上が成功と警告、下が情報とエラー。並びはエラー → 警告 → 成功 → 情報',
  },
  {
    label: '触って確かめる',
    note: 'ユーザー名を入れて手を止めると 1.2 秒確かめます（admin と kazuemon は使えません）。郵便番号に全角の数字を入れると、半角に直して情報の行を出します',
  },
];

const USERNAME_CAPTION = '半角英数字と _ で入れてください';
const POSTAL_CAPTION = 'ハイフンなしの7桁です';
const SUCCESS = '使えるユーザー名です';
const INFO = '全角の数字を半角に直しました';

// 見本の欄。現行版（rows が false）は、成功・情報を渡さない
function Samples({ candidate, withOthers }: { candidate: MessageCandidate; withOthers?: boolean }) {
  const { rows } = candidate;
  return (
    <div className="flex flex-col gap-5">
      <TextField
        label="ユーザー名"
        defaultValue={withOthers ? 'kazuemon_' : 'kazuemon_k'}
        autoComplete="off"
        caption={USERNAME_CAPTION}
        success={rows ? SUCCESS : undefined}
        warning={withOthers ? '末尾の _ は、ほかの人から見分けにくいことがあります' : undefined}
      />
      <TextField
        label="郵便番号"
        prefix="〒"
        defaultValue={withOthers ? '150001' : '1500001'}
        autoComplete="off"
        caption={POSTAL_CAPTION}
        info={rows ? INFO : undefined}
        error={withOthers ? '7桁で入れてください' : undefined}
      />
    </div>
  );
}

const TAKEN = ['admin', 'kazuemon'];

// 全角の数字を半角に直す
const toHalfWidth = (value: string) =>
  value.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));

// 流れを触って確かめる。ユーザー名は入力が 0.4 秒止まると 1.2 秒確かめ（回る円）、結果を成功かエラーの行で出す
function TryCell({ candidate }: { candidate: MessageCandidate }) {
  const { rows } = candidate;
  const [name, setName] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<'ok' | 'taken' | null>(null);
  const [postal, setPostal] = useState('');
  const [converted, setConverted] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const changeName = (value: string) => {
    setName(value);
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setChecking(false);
    setResult(null);
    if (!value) return;
    timers.current.push(
      setTimeout(() => {
        setChecking(true);
        timers.current.push(
          setTimeout(() => {
            setChecking(false);
            setResult(TAKEN.includes(value) ? 'taken' : 'ok');
          }, 1200)
        );
      }, 400)
    );
  };
  const changePostal = (value: string) => {
    const half = toHalfWidth(value);
    setPostal(half);
    setConverted(half !== value);
  };

  return (
    <div className="flex flex-col gap-5">
      <TextField
        label="ユーザー名"
        value={name}
        onChange={(event) => changeName(event.target.value)}
        autoComplete="off"
        caption={USERNAME_CAPTION}
        loading={checking}
        success={rows && result === 'ok' ? SUCCESS : undefined}
        error={result === 'taken' ? 'このユーザー名は使えません' : undefined}
      />
      <TextField
        label="郵便番号"
        prefix="〒"
        value={postal}
        onChange={(event) => changePostal(event.target.value)}
        autoComplete="off"
        caption={POSTAL_CAPTION}
        info={rows && converted ? INFO : undefined}
      />
    </div>
  );
}

const Cell = ({ column, candidate }: { column: Column; candidate: MessageCandidate }) => {
  if (column.label === 'ほかの行と一緒に') return <Samples candidate={candidate} withOthers />;
  if (column.label === '触って確かめる') return <TryCell candidate={candidate} />;
  return <Samples candidate={candidate} />;
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/37 入力欄の下の成功・情報の行',
  id: 'design-review-37-field-success',
  parameters: {
    layout: 'fullscreen',
    pseudo: { focusWithin: ['[data-preview="focus"] [data-slot="control"]'] },
  },
  args: { pick: 'C,A' },
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
      index={37}
      axis="入力欄の下の成功・情報の行"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const found = candidates.find((c) => c.id === candidate.id);
        return found && <Cell column={column} candidate={found} />;
      }}
    >
      <p>
        <strong className="text-fg">決まったこと</strong>
        （ADR-0058）。入力欄の下に、エラー・警告と同じ形（アイコン＋文）の、成功と情報の行を足します。成功は「使えるユーザー名です」のような、確かめた結果です。情報は「全角の数字を半角に直しました」のような、直すものではない知らせです。成功は丸のチェックと緑、情報は丸の「i」と青です（お知らせと同じアイコン）。
      </p>
      <p>
        ここで選ぶのは、成功のときに欄の見た目も変えるかです。原則2では、状態（フォーカス・エラー）を枠線で表します。成功を状態として扱うなら枠線（B）、結果の知らせとして扱うなら行だけ（A）です。C
        は枠線を使わず、確かめているあいだの回る円の場所にチェックを置きます。情報はどの案でも欄の見た目を変えません。
      </p>
      <p>
        列は左から、ふだん・フォーカス中（固定）・ほかの行と一緒に出たとき・触って確かめる、です。いちばん右の列では、回る円から結果の行に替わる流れを見られます。
      </p>
      <p>どれを既定にするかを一言添えてください。ほかの案も選べるようにするかも教えてください。</p>
    </Comparison>
  ),
};
