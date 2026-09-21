import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { TagsInput } from '../../src/components/tags-input/TagsInput';

// 後半の軸 263: TagsInput で、まだタグになっていない文字（打っている途中）をどう見せるか
//   すでにタグになったものはチップで、これからなるものは素の文字。この差がどれだけ見えるべきか
//   候補は --tags-input-pending-* の上書きだけで作る

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '素の文字のまま',
    intent:
      '打っている文字は、ふつうの入力欄と同じ素の文字。チップとの差は形そのものだけで、余計な線を足さない。',
    spec: [
      ['縁', 'なし'],
      ['面', 'なし'],
      ['左右の余白', 'なし'],
    ],
    tokens: {
      '--tags-input-pending-border-width': '0px',
      '--tags-input-pending-bg': 'transparent',
      '--tags-input-pending-padding-x': '0px',
    },
  },
  {
    id: 'A',
    name: '点線のピルで囲む',
    intent:
      'これからチップになる場所を、点線のピルで先に見せる。Enter で実線のチップに変わる、という予告になる。',
    spec: [
      ['縁', '点線 1px（チップの縁と同じ色）'],
      ['面', 'なし'],
      ['左右の余白', 'チップと同じ'],
      ['打つ欄の幅', '文字の幅まで'],
    ],
    tokens: {
      '--tags-input-pending-sizing': 'content',
      '--tags-input-pending-grow': '0',
      '--tags-input-pending-border-width': 'var(--border-width-thin)',
      '--tags-input-pending-border-style': 'dashed',
      '--tags-input-pending-bg': 'transparent',
      '--tags-input-pending-padding-x': 'var(--combobox-chip-padding-x)',
    },
  },
  {
    id: 'B',
    name: '薄い面を敷く',
    intent:
      '線は足さず、打っている文字の後ろにだけ薄い面を敷く。チップの白い面と見分けられ、線より静か。',
    spec: [
      ['縁', 'なし'],
      ['面', '入力欄の付属部分と同じグレー'],
      ['左右の余白', 'チップと同じ'],
      ['打つ欄の幅', '文字の幅まで'],
    ],
    tokens: {
      '--tags-input-pending-sizing': 'content',
      '--tags-input-pending-grow': '0',
      '--tags-input-pending-border-width': '0px',
      '--tags-input-pending-bg': 'var(--color-field-addon)',
      '--tags-input-pending-padding-x': 'var(--combobox-chip-padding-x)',
    },
  },
  {
    id: 'C',
    name: '点線のピルと、薄い面',
    intent: 'A と B の両方。いちばんチップに近い見た目で、Enter を押す前から形が決まって見える。',
    spec: [
      ['縁', '点線 1px'],
      ['面', '入力欄の付属部分と同じグレー'],
      ['左右の余白', 'チップと同じ'],
      ['打つ欄の幅', '文字の幅まで'],
    ],
    tokens: {
      '--tags-input-pending-sizing': 'content',
      '--tags-input-pending-grow': '0',
      '--tags-input-pending-border-width': 'var(--border-width-thin)',
      '--tags-input-pending-border-style': 'dashed',
      '--tags-input-pending-bg': 'var(--color-field-addon)',
      '--tags-input-pending-padding-x': 'var(--combobox-chip-padding-x)',
    },
  },
];

const columns: Column[] = [
  { label: '打っている途中', note: 'タグの後ろに文字がある' },
  { label: '打っている途中（フォーカス中）', note: '欄に枠線があるとき', preview: 'focus' },
  { label: '空のとき', note: 'プレースホルダだけ' },
  { label: 'タグがないとき', note: '1 つ目を打っている' },
];

function renderCell(column: Column) {
  const empty = column.label === '空のとき';
  const first = column.label === 'タグがないとき';
  return (
    <div className="w-[280px]">
      <TagsInput
        label="記事のタグ"
        placeholder="打って Enter で足す"
        defaultValue={first ? [] : ['デザイン', '実装']}
        defaultInputValue={empty ? '' : '検証'}
      />
    </div>
  );
}

const meta = {
  title: 'Design Review/263 TagsInput の確定前の文字',
  id: 'design-review-263-tags-input-pending',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      focusWithin: ['[data-preview="focus"] [data-slot="control"]'],
    },
  },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={263}
      axis="TagsInput で、まだタグになっていない文字をどう見せるか"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => renderCell(column)}
    >
      <p>
        <strong>決定: 現行版（確定前の文字は素のまま）</strong>
        にしました。理由は「囲った場合、横に伸びる長さを考慮する必要があるため」です（ADR
        の番号はあとで入れます）。
      </p>
      <p>
        TagsInput
        の欄には、すでにタグになったもの（チップ）と、これからタグになる文字（打っている途中）が並びます。
        打っている途中の文字に予告を付けると、Enter
        を押すとチップになることが分かりますが、線や面が増えて欄がにぎやかになります。
      </p>
      <p>
        どの案でも、空のとき（プレースホルダだけ）は何も足しません。実際に打って、文字が増える・消えるときの
        出入りも見てください。
      </p>
      <p>ほかの案（A・B・C）は、決めたときの比べものとして残してあります。</p>
    </Comparison>
  ),
};
