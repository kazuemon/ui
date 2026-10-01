import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { List, ListItem } from '../../src/components/list/List';
import { Tag } from '../../src/components/tag/Tag';

// 軸 475: List の項目の末尾の枠（trailing）の置き場・縦のそろえ方・色と大きさ
const meta = {
  title: 'Design Review/475 リストの項目の末尾',
  id: 'design-review-475-list-trailing',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '文の中に書く',
    intent: 'いまは末尾の枠がないので、数や日付は文の後ろに続けて書く',
    spec: [
      ['置き場', '文の中'],
      ['縦のそろえ方', '—'],
      ['色・大きさ', '本文と同じ'],
    ],
  },
  {
    id: 'A',
    name: '右端・1 行目・薄い文字',
    intent:
      '末尾を項目の右端に寄せ、1 行目の文字の並び（ベースライン）にそろえる。文が折り返しても末尾は 1 行目に残る。色は薄いグレー、大きさは本文と同じ',
    spec: [
      ['置き場', '右端（文との間 16px 以上）'],
      ['縦のそろえ方', '1 行目のベースライン'],
      ['色・大きさ', '薄いグレー・本文と同じ'],
    ],
    tokens: {
      '--list-trailing-columns': 'minmax(0, 1fr) auto',
      '--list-trailing-align': 'baseline',
      '--list-trailing-text': 'inherit',
      '--color-list-trailing': 'var(--color-fg-subtle)',
    },
  },
  {
    id: 'B',
    name: '右端・1 行目・小さい文字',
    intent: 'A と同じ置き場で、末尾の文字を一段小さくする。数や日付が文より控えめになる',
    spec: [
      ['置き場', '右端'],
      ['縦のそろえ方', '1 行目のベースライン'],
      ['色・大きさ', '薄いグレー・一段小さい'],
    ],
    tokens: {
      '--list-trailing-columns': 'minmax(0, 1fr) auto',
      '--list-trailing-align': 'baseline',
      '--list-trailing-text': 'var(--text-body-sm)',
      '--color-list-trailing': 'var(--color-fg-subtle)',
    },
  },
  {
    id: 'C',
    name: '右端・縦の真ん中',
    intent:
      '末尾を項目の縦の真ん中にそろえる。文が 2 行になると、末尾は 2 行の間に来る。タグのように高さのあるものは、1 行の項目でも真ん中にそろう',
    spec: [
      ['置き場', '右端'],
      ['縦のそろえ方', '項目の縦の真ん中'],
      ['色・大きさ', '薄いグレー・本文と同じ'],
    ],
    tokens: {
      '--list-trailing-columns': 'minmax(0, 1fr) auto',
      '--list-trailing-align': 'center',
      '--list-trailing-text': 'inherit',
      '--color-list-trailing': 'var(--color-fg-subtle)',
    },
  },
  {
    id: 'D',
    name: '文のすぐ後ろ',
    intent:
      '末尾を右端に寄せず、文のすぐ後ろ（16px 空けて）に置く。広い列でも文と末尾が離れない。項目ごとに末尾の位置がそろわない',
    spec: [
      ['置き場', '文のすぐ後ろ（16px）'],
      ['縦のそろえ方', '1 行目のベースライン'],
      ['色・大きさ', '薄いグレー・本文と同じ'],
    ],
    tokens: {
      '--list-trailing-columns': 'minmax(0, auto) 1fr',
      '--list-trailing-align': 'baseline',
      '--list-trailing-text': 'inherit',
      '--color-list-trailing': 'var(--color-fg-subtle)',
    },
  },
];

const columns: Column[] = [
  { label: '数', note: '幅 360px' },
  { label: '日付・折り返す', note: '幅 280px' },
  { label: 'タグと状態', note: 'status と一緒に' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={475}
      axis="リストの項目の末尾"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const current = candidate.id === '現行版';
        const item = (text: string, trailing: string) =>
          current ? (
            <ListItem>
              {text}（{trailing}）
            </ListItem>
          ) : (
            <ListItem trailing={trailing}>{text}</ListItem>
          );
        switch (column.label) {
          case '数':
            return (
              <div data-reading className="w-[360px]">
                <List>
                  {item('デザイン', '12 件')}
                  {item('アクセシビリティ', '8 件')}
                  {item('リリース', '3 件')}
                </List>
              </div>
            );
          case '日付・折り返す':
            return (
              <div data-reading className="w-[280px]">
                <List>
                  {item('カレンダーに日ごとの印を足した', '9/30')}
                  {item('フォームのどの欄にも結び付かないエラーを出せるようにした', '10/1')}
                </List>
              </div>
            );
          default:
            return (
              <div data-reading className="w-[360px]">
                <List>
                  <ListItem
                    status={current ? undefined : 'success'}
                    trailing={current ? undefined : <Tag color="success">公開</Tag>}
                  >
                    はじめての記事
                  </ListItem>
                  <ListItem
                    status={current ? undefined : 'warning'}
                    trailing={current ? undefined : <Tag color="warning">下書き</Tag>}
                  >
                    デザインの決め方
                  </ListItem>
                </List>
              </div>
            );
        }
      }}
    >
      <p>
        決定: 末尾は右端に置き、1 行目の行の高さの中で縦の中央にそろえる（A
        の置き場で、ベースラインではなく 1 行目の中央）。trailing は JSX
        を置く場所なので、文字の大きさや色は部品が決めず、使う側にゆだねる。ユーザーの返事「右端で1行目の縦中央かなと思いました。trailing
        自体は JSX 要素が配置できる（actions
        みたいなイメージ）ものだと思うので、文字サイズとか色は利用者にゆだねるかな？と思いました。」候補の見た目は、トークンを畳む前のこのコミットで比べられます。
      </p>
      <p>
        ListItem に、項目の末尾に数・日付・タグなどを置く trailing
        を足しました。文の列の後ろに、もう 1 つの列として置きます。
      </p>
      <p>
        選ぶのは、末尾の置き場（右端か、文のすぐ後ろか）、文が折り返したときの縦のそろえ方、末尾の文字の色と大きさです。
      </p>
    </Comparison>
  ),
};
