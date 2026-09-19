import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  MaskField,
  type MaskFieldHintStyle,
  type MaskFieldProps,
} from '../../src/components/mask-field/MaskField';
import { statePseudo } from '../../src/stories/story-states';

// 後半の軸 173: MaskField の残りの桁の見本を、1 桁ずつ数えられるようにする
//   決定: C（淡い 0）を既定にし、A と B も選べる（maskHintStyle）。MaskField では placeholder を非推奨にし、caption で伝える
//   候補の行は maskHintStyle で描く。採らなかった現行版（つながった線）は部品から消したので、行もない（決めたときの見た目は ADR の画像とコミット）

const styleOf: Record<string, MaskFieldHintStyle> = { C: 'sample', A: 'underscore', B: 'dot' };

const candidates: Candidate[] = [
  {
    id: 'C',
    name: '見本の印を淡い 0 にする（既定）',
    intent:
      '字間は空けず、見本の桁を淡い 0 で出す（150-0000）。打ち終えたときの長さと形がそのまま見え、1 桁ずつ数えられる。打った数字と同じ字形なので、淡さだけで見分けることになる。',
    spec: [
      ['maskHintStyle', 'sample'],
      ['字間', 'なし'],
      ['数字の幅', 'そろえる（tabular-nums）'],
      ['見本の印', '0（英字の桁は A。プレースホルダーの色）'],
    ],
  },
  {
    id: 'A',
    name: '字間を空け、_ を 1 桁ずつ離す',
    intent:
      '数字の幅をそろえ、打った文字と見本の両方に字間を空ける。_ が 1 桁ずつ離れて数えられる。打っても桁の位置はずれない。値もいつも少し広がって見える。',
    spec: [
      ['maskHintStyle', 'underscore'],
      ['字間', '0.15em（打った文字にも）'],
      ['数字の幅', 'そろえる（tabular-nums）'],
      ['見本の印', '_'],
    ],
  },
  {
    id: 'B',
    name: '見本の印を • にする',
    intent:
      '字間は空けず、見本の桁を • で出す。点は数字 1 つの幅の真ん中に置くので、つながらずに 1 桁ずつ数えられる。値の見え方は C と同じ。',
    spec: [
      ['maskHintStyle', 'dot'],
      ['字間', 'なし'],
      ['数字の幅', 'そろえる（tabular-nums）'],
      ['見本の印', '•'],
    ],
  },
];

const columns: Column[] = [
  { label: '空' },
  { label: 'フォーカス（空）', preview: 'focus' },
  { label: '途中まで（フォーカス）', preview: 'focus' },
  { label: '全部' },
  { label: 'エラー（フォーカス）', preview: 'focus', note: '途中まで打った' },
  { label: '押せない' },
];

// 携帯電話・IP 電話（070・080・090・050）は 3-4-4、ほかは 2-4-4
const phoneMask = (value: string) =>
  /^0[5789]0/.test(value.replace(/\D/g, '')) ? '###-####-####' : '##-####-####';

const formats: { props: MaskFieldProps; partial: string; full: string; error: string }[] = [
  {
    props: { label: '郵便番号', mask: '###-####' },
    partial: '1500',
    full: '1500042',
    error: '郵便番号は7桁で入力してください',
  },
  {
    props: { label: '電話番号', mask: phoneMask },
    partial: '090123',
    full: '09012345678',
    error: '電話番号は11桁で入力してください',
  },
  {
    props: { label: 'カード番号', mask: '#### #### #### ####' },
    partial: '424242',
    full: '4242424242424242',
    error: 'カード番号は16桁で入力してください',
  },
];

function renderCell(column: Column, candidate: Candidate) {
  return (
    <div className="flex w-[300px] flex-col gap-4">
      {formats.map(({ props, partial, full, error }, i) => {
        const cell: Partial<MaskFieldProps> = (() => {
          switch (column.label) {
            case '途中まで（フォーカス）':
              return { defaultValue: partial };
            case '全部':
              return { defaultValue: full };
            case 'エラー（フォーカス）':
              return { defaultValue: partial, error };
            case '押せない':
              return { defaultValue: full, disabled: true };
            default:
              return {};
          }
        })();
        return <MaskField key={i} {...props} {...cell} maskHintStyle={styleOf[candidate.id]} />;
      })}
    </div>
  );
}

const meta = {
  title: 'Design Review/173 MaskField の残りの桁の見本',
  id: 'design-review-173-mask-field',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({ focusWithin: '[data-slot="control"]' }),
  },
  args: { pick: 'C,A,B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'C,A,B', 'C', 'A', 'B'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={173}
      axis="MaskField の残りの桁の見本"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={renderCell}
    >
      <p>
        決定: C（淡い 0）を既定にし、A と B も選べる。MaskField では placeholder
        を非推奨にし、caption で伝える。
      </p>
      <p>
        MaskField
        は、郵便番号・電話番号・カード番号のように書式の決まった値を打つ欄です。残りの桁の見本を淡く出します（決めたあとは、空の欄でも出すのが既定）。
      </p>
      <p>
        比べたのは、残りの桁が一目で数えられるかです。決める前は _ がつながって 1
        本の線に見えていました。A
        の字間は打った文字にも当てるので、打っても桁の位置はずれません。フォーカスの列は、フォーカスした見た目に固定しています。
      </p>
    </Comparison>
  ),
};
