import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Combobox } from '../../src/components/combobox/Combobox';
import { NumberField } from '../../src/components/number-field/NumberField';
import { Select } from '../../src/components/select/Select';
import { TextField } from '../../src/components/text-field/TextField';
import { enabledControl, statePseudo } from '../../src/stories/story-states';

// 軸 521: 入力欄の小さい段（size="sm"）の文字・余白・アイコン（F109）
const meta = {
  title: 'Design Review/521 入力欄の小さい段',
  id: 'design-review-521-field-size-sm',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({ hover: enabledControl, focusWithin: enabledControl }),
  },
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

const sm = (text: string, leading: string, x: string, icon: string) => ({
  '--field-sm-text': text,
  '--field-sm-leading': leading,
  '--field-sm-x': x,
  '--field-sm-icon': icon,
});

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '段なし（md の 44px）',
    intent:
      'いまは入力欄に段がない。sm の Button（36px）の横に置くと、欄だけ 8px 高い。比べるための基準',
    spec: [
      ['高さ', '44px'],
      ['文字', '16px（行 24px）'],
      ['左右の余白', '16px'],
      ['アイコン', '20px'],
    ],
    tokens: sm(
      'var(--text-input-fine)',
      'var(--leading-input-fine)',
      'var(--spacing-control-x-fine)',
      'var(--spacing-icon-input-fine)'
    ),
  },
  {
    id: 'A',
    name: 'Button の sm と同じ',
    intent:
      '文字・余白・アイコンを Button の sm にそろえる。横に並べたとき、文字の大きさも余白も同じに見える。入力欄の文字が 14px になるので、iPhone の Safari ではフォーカスで画面が拡大される',
    spec: [
      ['高さ', '36px'],
      ['文字', '14px（行 20px）'],
      ['左右の余白', '12px'],
      ['アイコン', '16px'],
    ],
    tokens: sm(
      'var(--text-control-sm)',
      'var(--leading-control-sm)',
      'var(--spacing-control-x-sm)',
      'var(--spacing-icon-sm)'
    ),
  },
  {
    id: 'B',
    name: '文字は 16px のまま',
    intent:
      '高さ・余白・アイコンは A と同じで、文字だけ入力欄の 16px を保つ。iPhone の拡大を避けられる。36px の中で文字が大きく、上下の余白は 6px',
    spec: [
      ['高さ', '36px'],
      ['文字', '16px（行 24px）'],
      ['左右の余白', '12px'],
      ['アイコン', '16px'],
    ],
    tokens: sm(
      'var(--text-input-fine)',
      'var(--leading-input-fine)',
      'var(--spacing-control-x-sm)',
      'var(--spacing-icon-sm)'
    ),
  },
  {
    id: 'C',
    name: 'アイコンは入力欄のまま',
    intent:
      '文字と余白は A と同じで、▼・×・回る印は入力欄の 20px のまま。小さい欄でも、押す印（× と ▼）の大きさを保つ',
    spec: [
      ['高さ', '36px'],
      ['文字', '14px（行 20px）'],
      ['左右の余白', '12px'],
      ['アイコン', '20px'],
    ],
    tokens: sm(
      'var(--text-control-sm)',
      'var(--leading-control-sm)',
      'var(--spacing-control-x-sm)',
      'var(--spacing-icon-input-fine)'
    ),
  },
  {
    id: 'D',
    name: '余白は入力欄のまま',
    intent:
      '文字とアイコンは A と同じで、左右の余白は入力欄の 16px のまま。高さだけ詰め、横は詰めない。prefix・suffix の塊も 16px の余白',
    spec: [
      ['高さ', '36px'],
      ['文字', '14px（行 20px）'],
      ['左右の余白', '16px'],
      ['アイコン', '16px'],
    ],
    tokens: sm(
      'var(--text-control-sm)',
      'var(--leading-control-sm)',
      'var(--spacing-control-x-fine)',
      'var(--spacing-icon-sm)'
    ),
  },
];

const columns: Column[] = [
  { label: 'Button の sm と並べる', note: '欄・Select・ボタンを 1 行に' },
  { label: 'prefix・suffix', note: 'TextField（文字の塊）と NumberField（▲▼）' },
  { label: '消すボタンと ▼', note: 'Combobox（値あり）' },
  { label: 'hover', preview: 'hover' },
  { label: 'フォーカス', note: 'クリックでもキーボードでも', preview: 'focus' },
  { label: '指', note: 'data-density="coarse"' },
];

const wards = ['千代田区', '中央区', '港区', '新宿区'];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={521}
      axis="入力欄の小さい段"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const size = candidate.id === '現行版' ? undefined : ('sm' as const);
        const row = (
          <div className="flex w-[420px] items-end gap-2">
            <div className="min-w-0 flex-1">
              <TextField size={size} accessibleName="キーワード" defaultValue="かずえもん" />
            </div>
            <div className="w-[120px]">
              <Select size={size} accessibleName="区" items={wards} defaultValue="港区" />
            </div>
            <Button size="sm">検索</Button>
          </div>
        );
        switch (column.label) {
          case 'Button の sm と並べる':
            return row;
          case 'prefix・suffix':
            return (
              <div className="flex w-[260px] flex-col gap-3">
                <TextField size={size} label="値段" prefix="¥" suffix="円" defaultValue="1,200" />
                <NumberField size={size} label="数量" min={0} max={99} defaultValue={3} />
              </div>
            );
          case '指':
            return <div data-density="coarse">{row}</div>;
          default:
            return (
              <div className="w-[260px]">
                <Combobox size={size} label="区" items={wards} defaultValue="港区" />
              </div>
            );
        }
      }}
    >
      <p>
        決定: 入力欄の size="sm" の文字・余白・アイコンは、Button の sm にそろえる（A。高さ
        36px・文字 14px・左右の余白 12px・アイコン 16px）。iPhone の Safari で 16px
        未満の欄にフォーカスすると画面が拡大されるのは、小さい欄では許容する。ユーザーの返事「A
        でお願いします。スマホの場合に拡大されるのは、実際この入力欄は小さくて操作しづらいので、妥当かなと思いました。」候補の見た目は、トークンを畳む前のこのコミットで比べられます。
      </p>
      <p>
        入力欄（TextField・Select・Combobox・NumberField・DateField など）に、Button
        と同じ大きさの段 size="sm" を足します。高さは Button の sm と同じ 36px
        で、マウスでも指でも変えません（Button
        で決めたことをそのまま読みます）。横に並べたとき、欄とボタンの高さがそろいます。
      </p>
      <p>
        選ぶのは、36px の中の文字の大きさ、左右の余白（prefix・suffix
        の塊も同じ余白）、▼・×・回る印の大きさです。Button の sm
        は「高さだけ保つと釣り合いが崩れる」ので文字と余白も一緒に詰めました。入力欄は、文字を 14px
        にすると iPhone の Safari でフォーカスしたときに画面が拡大されます（いまの入力欄が指でも
        16px なのはこのため）。ラベルとキャプションの大きさは変えません。浮かぶ選択肢の一覧も md
        のままです。
      </p>
    </Comparison>
  ),
};
