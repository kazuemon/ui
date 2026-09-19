import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { PinField, type PinFieldProps } from '../../src/components/pin-field/PinField';
import { statePseudo } from '../../src/stories/story-states';

// 決定: 現行版を既定、D を選べる（emptyDots）。ADR の比較画像を撮ったら、このストーリーは消す
// 後半の軸 170: PinField の桁の箱
//   比べたときの候補は --pin-field-* の上書きで作っていた。決まったあと、B・C のための切り替えのトークンは畳んだので、
//   B・C の行はいまの部品では元の見た目にならない（決めたときの見た目は ADR の比較画像とコミットで残す）
//   D は prop（emptyDots）で描く

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '箱を離して並べる',
    intent:
      'いまの入力欄と同じグレーの箱を、少し離して 6 つ並べる。1 桁ずつ押せる場所が見え、フォーカスした箱にだけ枠線が付く。',
    spec: [
      ['箱', '44px 角・角丸 12px・グレーの塗り'],
      ['箱のあいだ', '8px（地が見える）'],
      ['空の箱', '印なし'],
    ],
  },
  {
    id: 'B',
    name: '1 本の欄に区切り線',
    intent:
      '箱をくっつけて 1 本の欄にし、桁のあいだに細い線を引く。外形はほかの入力欄と同じ 1 本の角丸になる。フォーカスした桁だけ枠線が付く。エラーでは桁ごとの赤い枠線が隣り合い、線が詰まって見える。',
    spec: [
      ['箱', '44px 角・両端だけ角丸 12px・グレーの塗り'],
      ['箱のあいだ', '1px の線（--color-line）'],
      ['空の箱', '印なし'],
    ],
    tokens: {
      '--pin-field-gap': 'var(--border-width-thin)',
      '--pin-field-seam': 'var(--color-line)',
      '--pin-field-radius': 'var(--radius-control)',
      '--pin-field-radius-inner': '0px',
      '--pin-field-fill-amount': '100%',
      '--pin-field-edge-width': 'var(--field-border-width)',
      '--pin-field-underline': 'transparent',
      '--pin-field-dot-color': 'transparent',
    },
  },
  {
    id: 'C',
    name: '塗りのない下線だけ',
    intent:
      '塗りを持たず、桁ごとに下線だけを引く。フォーカスした桁は下線が濃紺に、エラーでは赤になる。軽いが、ほかの入力欄（グレーの塗り）とは様式が変わる。',
    spec: [
      ['箱', '44px 角・塗りなし・角丸なし'],
      ['線', '下だけ 2px（--color-line-strong）'],
      ['箱のあいだ', '8px'],
      ['空の箱', '印なし'],
    ],
    tokens: {
      '--pin-field-gap': 'calc(var(--spacing) * 2)',
      '--pin-field-seam': 'transparent',
      '--pin-field-radius': '0px',
      '--pin-field-radius-inner': '0px',
      '--pin-field-fill-amount': '0%',
      '--pin-field-edge-width': '0px',
      '--pin-field-underline': 'var(--color-line-strong)',
      '--pin-field-dot-color': 'transparent',
    },
  },
  {
    id: 'D',
    name: '離した箱＋空の箱に淡い点',
    intent:
      '現行版の箱に、まだ打っていない箱の真ん中に淡い点を置く。あと何桁あるかが、箱の数を数えなくても分かる。フォーカスした箱では点を消し、キャレットだけにする。伏せ字では、打った ● と空の点が似て見える。',
    spec: [
      ['箱', '現行版と同じ'],
      ['空の箱', '直径 6px の点（プレースホルダーの色）。emptyDots で選ぶ'],
    ],
  },
];

const columns: Column[] = [
  { label: '空' },
  { label: 'フォーカス（1 桁目）', note: '空の欄の 1 桁目に入ったところ', preview: 'focus' },
  { label: '途中まで打った', note: '3 桁' },
  { label: '全部打った' },
  { label: 'エラー' },
  { label: '押せない' },
  { label: '伏せ字', note: 'PIN 4 桁のうち 2 桁' },
];

const cellProps: Record<string, Partial<PinFieldProps>> = {
  空: {},
  'フォーカス（1 桁目）': {},
  途中まで打った: { defaultValue: '382' },
  全部打った: { defaultValue: '382915' },
  エラー: { defaultValue: '382915', error: 'コードが違います' },
  押せない: { defaultValue: '382915', disabled: true },
  伏せ字: { label: 'PIN', length: 4, mask: true, defaultValue: '38' },
};

function renderCell(column: Column, candidate: Candidate) {
  return (
    <PinField label="確認コード" emptyDots={candidate.id === 'D'} {...cellProps[column.label]} />
  );
}

const meta = {
  title: 'Design Review/170 PinField の桁の箱',
  id: 'design-review-170-pin-field',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({
      focusWithin:
        '[data-slot="pin-field-group"]:first-of-type > [data-slot="control"]:first-child',
    }),
  },
  args: { pick: 'current,D' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'B', 'C', 'D', 'current,D'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={170}
      axis="PinField の桁の箱"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={renderCell}
    >
      <p>決定: 現行版を既定、D を選べる</p>
      <p>
        PinField は、確認コードや PIN を 1
        桁ずつの箱に打つ欄です。比べるのは、箱の並べ方と、まだ打っていない箱の見せ方です。
      </p>
      <p>
        箱 1
        つずつの状態（フォーカスの枠線、エラーの赤、押せない塗り）は、どの案もほかの入力欄と同じ規則です。
        箱の高さは入力欄と同じで、マウスでも指でも 44px 角です（密度で変わりません）。
      </p>
      <p>どれを既定にするか、ほかに選べるようにしたい案があれば教えてください。</p>
    </Comparison>
  ),
};
