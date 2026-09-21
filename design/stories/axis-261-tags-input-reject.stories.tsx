import type { Meta, StoryObj } from '@storybook/react-vite';
import { type CSSProperties, useState } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { TagsInput } from '../../src/components/tags-input/TagsInput';

// 後半の軸 261: TagsInput で、タグにならなかったとき（重複・validate を通らない）の見せ方
//   弾いたことを、その場で・短く伝えたい。文を出すと、部品が文を作ることになる（原則20）ので、
//   まずは文のいらない合図（すでにあるチップの強調・欄の揺れ）から比べる
//   候補は --tags-input-flash-*・--tags-input-shake-* の上書きだけで作る（D だけは、呼び出し側が文を出す例）

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'すでにあるチップを、赤く一瞬強調する',
    intent:
      '弾かれた文字と同じタグを、エラーの色で一瞬光らせて元に戻す。「すでにここにある」が、名指しで分かる。',
    spec: [
      ['チップの強調', 'エラーの色（赤）'],
      ['欄の揺れ', 'なし'],
      ['下の行', 'validate の文だけ'],
    ],
    tokens: {
      '--tags-input-flash-bg': 'var(--color-danger-subtle)',
      '--tags-input-flash-fg': 'var(--color-fg-danger)',
      '--tags-input-flash-border-color': 'var(--color-fg-danger)',
      '--tags-input-shake-distance': '0px',
    },
  },
  {
    id: 'E',
    name: 'A の強調 ＋ info の文',
    intent:
      'A と同じ落ち着いた強調でチップを一瞬光らせ、同時に欄の下へ短い文を丸の「i」と青い文字で出す。文も強調と同じ長さで消えるので、行は出たまま残らない。どのタグに当たったかは文の中の名前で伝わり、読み上げにも同じ文が届く。',
    spec: [
      ['チップの強調', '濃いグレーの面（A と同じ）'],
      ['欄の揺れ', 'なし'],
      ['下の行', 'info の見た目で一瞬（rejectMessage）'],
    ],
    tokens: {
      '--tags-input-flash-bg': 'var(--color-neutral)',
      '--tags-input-flash-fg': 'var(--color-fg)',
      '--tags-input-flash-border-color': 'var(--color-fg-muted)',
      '--tags-input-shake-distance': '0px',
    },
  },
  {
    id: 'F',
    name: 'A の強調 ＋ チップの上に小さな面',
    intent:
      'E と同じ強調に、弾かれたチップの真上へ「追加済みです」を Tooltip と同じ面で一瞬だけ出す。どのタグに当たったかが、文の位置でも分かる。欄の下の行は動かないので、下の内容が動かない。',
    spec: [
      ['チップの強調', '濃いグレーの面（A と同じ）'],
      ['文の場所', 'チップの上（Tooltip の面）'],
      ['読み上げ', '見えない status の箱で知らせる'],
    ],
    tokens: {
      '--tags-input-flash-bg': 'var(--color-neutral)',
      '--tags-input-flash-fg': 'var(--color-fg)',
      '--tags-input-flash-border-color': 'var(--color-fg-muted)',
      '--tags-input-shake-distance': '0px',
    },
  },
  {
    id: 'G',
    name: 'A の強調 ＋ チップの下に小さな面',
    intent:
      'F と同じで、面をチップの下に出す。指で打っているときは、上に出すと指とキーボードの側から見やすい一方、下は次の行のチップに重なる。どちらが読みやすいかを比べる。',
    spec: [
      ['チップの強調', '濃いグレーの面（A と同じ）'],
      ['文の場所', 'チップの下（Tooltip の面）'],
      ['読み上げ', '見えない status の箱で知らせる'],
    ],
    tokens: {
      '--tags-input-flash-bg': 'var(--color-neutral)',
      '--tags-input-flash-fg': 'var(--color-fg)',
      '--tags-input-flash-border-color': 'var(--color-fg-muted)',
      '--tags-input-shake-distance': '0px',
    },
  },
  {
    id: 'A',
    name: 'チップを、グレーで一瞬強調する',
    intent:
      '同じ動きで、色だけを落ち着かせる。重複は間違いというより「もうある」ことなので、赤くしない。',
    spec: [
      ['チップの強調', '濃いグレーの面'],
      ['欄の揺れ', 'なし'],
      ['下の行', 'validate の文だけ'],
    ],
    tokens: {
      '--tags-input-flash-bg': 'var(--color-neutral)',
      '--tags-input-flash-fg': 'var(--color-fg)',
      '--tags-input-flash-border-color': 'var(--color-fg-muted)',
      '--tags-input-shake-distance': '0px',
    },
  },
  {
    id: 'B',
    name: '欄を左右に揺らす',
    intent:
      'チップの色は変えず、欄そのものを短く揺らす。どのタグが当たったかは示さないが、弾かれたことは見のがしにくい。',
    spec: [
      ['チップの強調', 'なし'],
      ['欄の揺れ', '4px・2 往復'],
      ['下の行', 'validate の文だけ'],
    ],
    tokens: {
      '--tags-input-flash-bg': 'transparent',
      '--tags-input-flash-fg': 'currentColor',
      '--tags-input-flash-border-color': 'var(--chip-border-color)',
      '--tags-input-shake-distance': '4px',
    },
  },
  {
    id: 'C',
    name: 'チップの強調と、欄の揺れの両方',
    intent: '弾かれたこと（揺れ）と、どれに当たったか（強調）を同時に見せる。いちばん強い合図。',
    spec: [
      ['チップの強調', 'エラーの色（赤）'],
      ['欄の揺れ', '4px・2 往復'],
      ['下の行', 'validate の文だけ'],
    ],
    tokens: {
      '--tags-input-flash-bg': 'var(--color-danger-subtle)',
      '--tags-input-flash-fg': 'var(--color-fg-danger)',
      '--tags-input-flash-border-color': 'var(--color-fg-danger)',
      '--tags-input-shake-distance': '4px',
    },
  },
  {
    id: 'D',
    name: 'チップの強調に、下の行の文を足す',
    intent:
      '現行版に、呼び出し側が書いた文（onReject で受け取って error に渡す）を足す。読み上げにも届く代わりに、行が出入りして下の内容が動く。',
    spec: [
      ['チップの強調', 'エラーの色（赤）'],
      ['欄の揺れ', 'なし'],
      ['下の行', '呼び出し側の文（onReject → error）'],
    ],
    tokens: {
      '--tags-input-flash-bg': 'var(--color-danger-subtle)',
      '--tags-input-flash-fg': 'var(--color-fg-danger)',
      '--tags-input-flash-border-color': 'var(--color-fg-danger)',
      '--tags-input-shake-distance': '0px',
    },
  },
];

const columns: Column[] = [
  { label: '重複', note: '欄の「デザイン」で Enter' },
  { label: 'validate を通らない', note: '欄の「taro」で Enter' },
];

// 弾かれたことを、本体の下の行で一瞬だけ知らせる例（E）。文は呼び出し側が書く
function WithFlashMessage({ duplicate }: { duplicate: boolean }) {
  return (
    <TagsInput
      label="記事のタグ"
      placeholder="打って Enter で足す"
      defaultValue={duplicate ? ['デザイン', '実装'] : []}
      defaultInputValue={duplicate ? 'デザイン' : 'taro'}
      validate={
        duplicate
          ? undefined
          : (tag) => (tag.includes('@') ? null : `${tag} はメールアドレスの形ではありません`)
      }
      // validate の文はエラーの行がすでに出すので、ここでは出さない
      rejectMessage={(reason, tag) => reason === 'duplicate' && `「${tag}」は追加済みです`}
    />
  );
}

// 弾かれたことを、チップに付く小さな面で知らせる例（F・G）
function WithTipMessage({ duplicate, side }: { duplicate: boolean; side: 'top' | 'bottom' }) {
  return (
    <TagsInput
      label="記事のタグ"
      placeholder="打って Enter で足す"
      defaultValue={duplicate ? ['デザイン', '実装'] : []}
      defaultInputValue={duplicate ? 'デザイン' : 'taro'}
      validate={
        duplicate
          ? undefined
          : (tag) => (tag.includes('@') ? null : `${tag} はメールアドレスの形ではありません`)
      }
      rejectMessage={(reason, tag) => reason === 'duplicate' && `「${tag}」は追加済みです`}
      rejectMessagePlacement={side === 'top' ? 'chip-top' : 'chip-bottom'}
    />
  );
}

// 弾かれたことを、呼び出し側が文にして出す例（D）
function WithMessage({ duplicate }: { duplicate: boolean }) {
  const [message, setMessage] = useState<string | null>(null);
  return (
    <TagsInput
      label="記事のタグ"
      placeholder="打って Enter で足す"
      defaultValue={duplicate ? ['デザイン', '実装'] : []}
      defaultInputValue={duplicate ? 'デザイン' : 'taro'}
      validate={
        duplicate
          ? undefined
          : (tag) => (tag.includes('@') ? null : `${tag} はメールアドレスの形ではありません`)
      }
      error={message}
      onReject={(tag, reason) =>
        setMessage(reason === 'duplicate' ? `「${tag}」はすでに足してあります` : null)
      }
      onValueChange={() => setMessage(null)}
    />
  );
}

function renderCell(column: Column, candidate: Candidate) {
  const duplicate = column.label === '重複';
  return (
    <div className="w-[280px]">
      {candidate.id === 'F' || candidate.id === 'G' ? (
        <WithTipMessage duplicate={duplicate} side={candidate.id === 'F' ? 'top' : 'bottom'} />
      ) : candidate.id === 'E' ? (
        <WithFlashMessage duplicate={duplicate} />
      ) : candidate.id === 'D' ? (
        <WithMessage duplicate={duplicate} />
      ) : (
        <TagsInput
          label="記事のタグ"
          placeholder="打って Enter で足す"
          defaultValue={duplicate ? ['デザイン', '実装'] : []}
          defaultInputValue={duplicate ? 'デザイン' : 'taro'}
          validate={
            duplicate
              ? undefined
              : (tag) => (tag.includes('@') ? null : `${tag} はメールアドレスの形ではありません`)
          }
        />
      )}
      <p className="pt-3 text-xs text-fg-subtle">この下に続く内容</p>
    </div>
  );
}

const meta = {
  title: 'Design Review/261 TagsInput でタグにならなかったときの見せ方',
  id: 'design-review-261-tags-input-reject',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'E' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'E', 'F', 'G', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  // 合図は一瞬で消えるので、この比較だけ長めに出す
  decorators: [
    (Story) => (
      <div style={{ '--tags-input-flash-duration': '1400ms' } as CSSProperties}>
        <Story />
      </div>
    ),
  ],
  render: ({ pick }) => (
    <Comparison
      index={261}
      axis="TagsInput で、タグにならなかったときにどう見せるか"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => renderCell(column, candidate)}
    >
      <p>
        <strong>決定: E（A の強調 ＋ info の行の文）を既定</strong>
        にしました。文は呼び出し側が書き、弾かれたタグの名前を入れます（ADR
        の番号はあとで入れます）。
      </p>
      <p>
        F・G（チップに付く小さな面）は backlog 行きです。面そのものは読み上げに届かないので見えない
        live region
        とセットが要り、上に出すと欄のラベルに、下に出すと次の行のチップに重なるためです。
      </p>
      <p>
        <strong>どの欄も、打った文字が入った状態にしてあります。欄を押して Enter を押すと、</strong>
        弾かれたときの見え方が出ます。合図は一瞬で消えるので、この比較だけ長め（1.4
        秒）に出しています。
      </p>
      <p>
        左の列は、すでにある「デザイン」をもう一度足したときです。右の列は、`validate`
        を通らなかったとき（メールアドレスの形ではない文字）で、どの案でも呼び出し側が書いた文が下の行に出ます。
        違うのは、文のいらない合図（チップの強調・欄の揺れ）をどう組み合わせるかです。
      </p>
      <p>
        E は「A の強調 ＋ info
        の文」です。チップの強調と同じ長さで、欄の下に「追加済みです」を丸の「i」と
        青い文字で出し、そのまま消えます（`rejectMessage`）。D
        は文を出したまま残す形で、行が出入りするあいだ
        下の内容が動きます。どちらの文も、部品ではなく呼び出し側が書きます（原則 20）。
      </p>
      <p>A〜D は、決めたときの比べものとして残してあります。</p>
    </Comparison>
  ),
};
