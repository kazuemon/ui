import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { LinkCardSample } from './link-card-samples';

// 後半の軸 117: LinkCard の題の大きさと、題・説明の行数
// 決定（ADR 未定）で、行数は titleLines・descriptionLines props に畳んだ。題の大きさは選べるようにせず、
// 本文の大きさの太字に固定した。そのため、この軸で比べていた「見出しの大きさ」の案（B）は、
// 今の部品では現行版と同じ見た目になる

type TextRow = { titleLines: number; descriptionLines: number };

const rowOf: Record<string, TextRow> = {
  現行版: { titleLines: 2, descriptionLines: 2 },
  A: { titleLines: 2, descriptionLines: 1 },
  B: { titleLines: 2, descriptionLines: 2 },
  C: { titleLines: 1, descriptionLines: 1 },
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '本文の大きさ・2 行と 2 行',
    intent:
      '題は本文と同じ大きさの太字。記事の中で本文より目立ちすぎない。題と説明はそれぞれ 2 行まで出し、超えた分は … で切る。',
    spec: [
      ['題の大きさ', '本文（マウス 16px・指 14px）の太字'],
      ['題の行数', '2 行まで'],
      ['説明の行数', '2 行まで'],
    ],
  },
  {
    id: 'A',
    name: '本文の大きさ・2 行と 1 行',
    intent:
      '説明を 1 行にして、カードを低く保つ。説明は概要の頭だけが見える。Zenn のリンクカードに近い。',
    spec: [
      ['題の大きさ', '本文の太字'],
      ['題の行数', '2 行まで'],
      ['説明の行数', '1 行まで'],
    ],
  },
  {
    id: 'B',
    name: '見出しの大きさ・2 行と 2 行',
    intent:
      '題を 4 段目の見出しと同じ大きさにする。Card の題と同じ大きさになり、カードとしてのまとまりが強い。記事の中では見出しと紛れやすい。決定後は題の大きさを選べないため、この行は現行版と同じ見た目になる。',
    spec: [
      ['題の大きさ', '（今は選べない。本文の太字になる）'],
      ['題の行数', '2 行まで'],
      ['説明の行数', '2 行まで'],
    ],
  },
  {
    id: 'C',
    name: '本文の大きさ・1 行と 1 行',
    intent:
      '題も説明も 1 行にする。高さがいつも同じになり、並べたときにそろう。長い題は途中で切れる。',
    spec: [
      ['題の大きさ', '本文の太字'],
      ['題の行数', '1 行まで'],
      ['説明の行数', '1 行まで'],
    ],
  },
];

const columns: Column[] = [
  { label: '記事の幅', note: '幅 480px・マウス' },
  { label: '長い題と説明', note: '幅 480px・マウス' },
  { label: 'スマートフォン', note: '幅 343px・指' },
  { label: '画像なし' },
];

const meta = {
  title: 'Design Review/117 LinkCard の題と説明',
  id: 'design-review-117-link-card-text',
  parameters: { layout: 'fullscreen' },
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
      index={117}
      axis="LinkCard の題の大きさと、題・説明の行数"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const { titleLines, descriptionLines } = rowOf[candidate.id];
        switch (column.label) {
          case '長い題と説明':
            return (
              <LinkCardSample
                sample="long"
                titleLines={titleLines}
                descriptionLines={descriptionLines}
              />
            );
          case 'スマートフォン':
            return (
              <LinkCardSample
                sample="long"
                width="phone"
                titleLines={titleLines}
                descriptionLines={descriptionLines}
              />
            );
          case '画像なし':
            return (
              <LinkCardSample
                sample="no-image"
                titleLines={titleLines}
                descriptionLines={descriptionLines}
              />
            );
          default:
            return <LinkCardSample titleLines={titleLines} descriptionLines={descriptionLines} />;
        }
      }}
    >
      <p>
        <strong>
          決定（ADR 未定）: 現行版（本文の大きさの太字・題と説明とも 2 行）を既定にしました。行数は
          titleLines・descriptionLines props
          で好きな数に変えられます。題の大きさは選べるようにしません。
        </strong>
      </p>
      <p>
        題の大きさと、題・説明を何行まで出すかを決めます。説明は小さい文字（マウス 14px・指
        12px）のグレー、サイトの行はさらに小さい文字です（ここでは変えていません）。
      </p>
      <p>
        記事の中のカードは本文の流れの中にあるので、題を大きくすると見出しと紛れます。行数を減らすとカードが低くそろい、増やすと中身が伝わります。OG
        の題と説明は長いことが多いので、長い見本の列も見てください。
      </p>
    </Comparison>
  ),
};
