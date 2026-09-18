import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { CheckItems, MenuSample, RadioItems } from './menu-samples';
import { MenuItem, MenuSeparator } from '../../src/components/menu/MenuItem';
import type { MenuGroupLabelStyle } from '../../src/components/menu/Menu';

// 後半の軸 122: Menu のグループの見出しの文字
// 決定（ADR 未定）: 現行版（ラベルと同じ）を既定に、A（キャプションと同じ）も選べる（Menu の groupLabelStyle）
// 見出しの文字は部品の値に畳んだので、各行は groupLabelStyle と、採らなかった案だけ中の要素へのクラス（LOOKS）で描く

// Tailwind がクラスを拾えるよう、クラスは文字列のまま書く
const LOOKS: Record<string, { style: MenuGroupLabelStyle; className?: string }> = {
  現行版: { style: 'label' },
  A: { style: 'caption' },
  B: { style: 'caption', className: '[&_[data-slot=menu-group-label]]:font-bold' },
  C: {
    style: 'label',
    className:
      '[&_[data-slot=menu-group-label]]:text-[length:1em] [&_[data-slot=menu-group-label]]:leading-[1.5] [&_[data-slot=menu-group-label]]:text-fg',
  },
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'ラベルと同じ',
    intent:
      '入力欄のラベルと同じ文字（部品のラベルの大きさ・太字）。色は本文より一段淡い濃紺。見出しとして目に入りやすい。',
    spec: [
      ['大きさ', 'ラベル（マウス・指とも 14px）'],
      ['太さ', '太字'],
      ['色', '一段淡い濃紺（fg-muted）'],
    ],
  },
  {
    id: 'A',
    name: 'キャプションと同じ',
    intent:
      'キャプションと同じ小さいグレーの文字（太字にしない）。項目より控えめで、押せないことが分かりやすい。',
    spec: [
      ['大きさ', 'キャプション（12px）'],
      ['太さ', '普通'],
      ['色', 'グレー（fg-subtle）'],
    ],
  },
  {
    id: 'B',
    name: 'キャプションの大きさの太字',
    intent: 'A の大きさと色に、太字だけを足す。小さくても見出しだと分かる。',
    spec: [
      ['大きさ', 'キャプション（12px）'],
      ['太さ', '太字'],
      ['色', 'グレー（fg-subtle）'],
    ],
  },
  {
    id: 'C',
    name: '項目と同じ大きさの太字',
    intent:
      '項目の文字と同じ大きさで太字・本文の濃紺。密度で項目と一緒に大きさが変わる。見出しの主張はいちばん強い。',
    spec: [
      ['大きさ', '項目と同じ（マウス 16px・指 14px）'],
      ['太さ', '太字'],
      ['色', '濃紺（fg）'],
    ],
  },
];

const columns: Column[] = [
  { label: 'マウス', note: '見出しが 2 つ。あいだに区切り線' },
  { label: '指', note: '同じ中身を指の密度で' },
  { label: 'ふつうの項目のあと', note: '区切り線のあとに見出し' },
];

const meta = {
  title: 'Design Review/122 Menu のグループの見出し',
  id: 'design-review-122-menu-group-label',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current,A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

const grouped = (
  <>
    <CheckItems />
    <MenuSeparator />
    <RadioItems />
  </>
);

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={122}
      axis="Menu のグループの見出しの文字"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const look = LOOKS[candidate.id];
        const sample = { groupLabelStyle: look.style, className: look.className };
        switch (column.label) {
          case 'マウス':
            return (
              <MenuSample height={400} density="fine" {...sample}>
                {grouped}
              </MenuSample>
            );
          case '指':
            return (
              <MenuSample height={400} density="coarse" {...sample}>
                {grouped}
              </MenuSample>
            );
          default:
            return (
              <MenuSample height={300} density="fine" {...sample}>
                <MenuItem>新しいファイル</MenuItem>
                <MenuItem>開く</MenuItem>
                <MenuSeparator />
                <RadioItems />
              </MenuSample>
            );
        }
      }}
    >
      <p>
        <strong>
          決定（ADR 未定）:
          現行版（ラベルと同じ）を既定にし、A（キャプションと同じ）も選べるようにします（Menu の
          groupLabelStyle）。
        </strong>
      </p>
      <p>
        Menu の項目をまとめる見出し（MenuGroup の
        label）の文字を決めます。見出しは押せず、読み上げではまとまりの名前になります。左は項目の文字とそろえ、上に少し間を空けています（ここでは変えていません）。
      </p>
      <p>
        見出しを強くするとまとまりが読みやすくなり、弱くすると項目が主役になります。区切り線は使う側が置くもの（MenuSeparator）で、見出しの有無とは別です。
      </p>
      <p>どれを既定にするかを選んでください。</p>
    </Comparison>
  ),
};
