import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Checkbox, CheckboxGroup } from '../../src/components/Checkbox';
import { Radio, RadioGroup } from '../../src/components/Radio';
import { Switch } from '../../src/components/Switch';
import { type Candidate, type Column, Comparison } from './Comparison';
import { keepSwitchCaptionAsCompared, keepToggleColorAsCompared } from './pins';

// 後半の軸 40: チェックボックスとラジオ
// 部品を新しく作った。決まり（原則8・原則5・原則1、ADR-0047）の範囲で、値を比べる
// 変えるのは次のトークンだけ（src/components/Checkbox.tsx・Radio.tsx が読む）
//   --choice-size-fine・--choice-size-coarse: 箱の大きさ（マウス用・指用）
//   --checkbox-radius: チェックボックスの角（ラジオはどの案も完全な丸）
//   --checkbox-mark-width: チェックと中間の横線の太さ
//   --radio-dot-ratio: ラジオの白い丸の直径（箱に対する比）
//   --choice-gap: 箱と横の文字の間（押せる範囲に含む）
//   --color-choice・-hover・-invalid・-disabled: 選んでいない箱の塗り（ふだん・hover・エラー・押せない）

type Fill = 'field' | 'addon';

const fills: Record<Fill, Record<`--${string}`, string>> = {
  // 入力欄と同じ。エラーは入力欄のエラー、押せないは押せない入力欄
  field: {
    '--color-choice': 'var(--color-field)',
    '--color-choice-hover': 'var(--color-field-hover)',
    '--color-choice-invalid': 'var(--color-field-invalid)',
    '--color-choice-disabled': 'var(--color-field-disabled)',
  },
  // 入力欄の prefix・suffix と同じ濃いグレー。エラーは prefix・suffix のエラーの赤み（adr/0035）
  // hover は、入力欄の hover と同じくらい（半段）濃くする。押せない箱は、ふだんより薄い入力欄のグレー
  addon: {
    '--color-choice': 'var(--color-field-addon)',
    '--color-choice-hover': 'color-mix(in oklab, var(--color-field-addon), var(--color-fg) 3%)',
    '--color-choice-invalid': 'var(--color-field-addon-invalid)',
    '--color-choice-disabled': 'var(--color-field)',
  },
};

const fillSpec: Record<Fill, string> = {
  field: '入力欄のグレー #F2F4F4。エラー #FEF2F1・押せない #E1E3E4',
  addon: 'prefix・suffix のグレー #E1E3E4。エラー #F1E0DE・押せない #F2F4F4',
};

interface Values {
  size: [fine: number, coarse: number];
  radius: number;
  mark: number;
  dot: number;
  gap: number;
  fill: Fill;
}

const candidate = (id: string, name: string, intent: string, v: Values): Candidate => ({
  id,
  name,
  intent,
  spec: [
    ['箱', `マウス用 ${v.size[0]}px・指用 ${v.size[1]}px`],
    ['角（チェックボックス）', `${v.radius}px`],
    ['印', `線 ${v.mark}px・ラジオの丸は箱の ${Math.round(v.dot * 1000) / 10}%`],
    ['横の文字との間', `${v.gap}px`],
    ['選んでいない箱', fillSpec[v.fill]],
  ],
  tokens: {
    '--choice-size-fine': `${v.size[0]}px`,
    '--choice-size-coarse': `${v.size[1]}px`,
    '--checkbox-radius': `${v.radius}px`,
    '--checkbox-mark-width': `${v.mark}px`,
    '--radio-dot-ratio': String(v.dot),
    '--choice-gap': `${v.gap}px`,
    ...fills[v.fill],
  },
});

const candidates: Candidate[] = [
  candidate(
    '現行版',
    '入力欄のグレー・18px',
    '部品を作ったときの値。箱は文字の行（マウス用 20px・指用 24px）より少し小さく、塗りは入力欄と同じグレー。',
    { size: [18, 22], radius: 5, mark: 2, dot: 0.4, gap: 8, fill: 'field' }
  ),
  candidate(
    'A',
    'トグルの高さにそろえる',
    '箱をトグルのトラックの高さ（マウス用 22px・指用 28px）にし、文字との間もトグルと同じ 12px にする。トグルと並べたときに同じ大きさの仲間に見える。印も少し太くする。',
    { size: [22, 28], radius: 6, mark: 2.5, dot: 0.4, gap: 12, fill: 'field' }
  ),
  candidate(
    'B',
    '小さく細い',
    '箱をアイコンと同じ大きさ（マウス用 16px・指用 20px）にし、線を 1.5px に細くする。軽く見えるが、グレーの箱は白地でさらに見えにくくなる。',
    { size: [16, 20], radius: 4, mark: 1.5, dot: 0.375, gap: 8, fill: 'field' }
  ),
  candidate(
    'C',
    '濃いグレーの箱',
    '現行版の大きさのまま、選んでいない箱を入力欄の prefix・suffix と同じ濃いグレーにする。小さい箱でも白地で見える。エラーは prefix・suffix のエラーと同じ赤み、押せない箱はふだんより薄いグレー。',
    { size: [18, 22], radius: 5, mark: 2, dot: 0.4, gap: 8, fill: 'addon' }
  ),
];

const columns: Column[] = [
  {
    label: '未選択・選択・中間',
    note: '色は指定なし（濃いグレー）。上から未選択・選択・中間、ラジオ',
  },
  {
    label: '色を指定したとき',
    note: 'color="primary"（青）・"secondary"（ピンク）。Switch と同じ並び',
  },
  {
    label: 'hover・キーボードのフォーカス',
    note: '上の段は箱に hover、下の段はキーボードのフォーカス（focus-visible）で固定',
  },
  { label: '押せない', note: '横の文字は箱と一緒にグレー、キャプションは読めるまま' },
  { label: 'エラー', note: 'グループの見出し・キャプション・選択肢・エラーの行' },
  {
    label: 'トグルと並べる',
    note: '同じ行の高さ。箱とトラック、文字の始まりを見比べる。この列だけ上がマウス用・下が指用',
  },
];

const Note = ({ children }: { children: ReactNode }) => (
  <p className="text-xs font-bold text-fg-subtle">{children}</p>
);

const TimeGroup = (props: {
  disabled?: boolean;
  error?: string;
  color?: 'primary' | 'secondary';
}) => (
  <RadioGroup label="配送の時間" defaultValue={props.error ? undefined : 'am'} {...props}>
    <Radio value="am" label="午前" />
    <Radio value="pm" label="午後" />
  </RadioGroup>
);

const states: Record<string, () => ReactNode> = {
  '未選択・選択・中間': () => (
    <>
      <Checkbox label="メール" />
      <Checkbox label="電話" defaultChecked />
      <Checkbox label="すべて" indeterminate />
      <TimeGroup />
    </>
  ),
  色を指定したとき: () => (
    <>
      <Checkbox label="青" color="primary" defaultChecked />
      <Checkbox label="ピンク" color="secondary" defaultChecked />
      <Checkbox label="すべて" color="primary" indeterminate />
      <TimeGroup color="secondary" />
    </>
  ),
  'hover・キーボードのフォーカス': () => (
    <>
      <div data-preview="hover" className="flex flex-col">
        <Checkbox label="メール" />
        <Checkbox label="電話" defaultChecked />
        <TimeGroup />
      </div>
      <div data-preview="focus" className="flex flex-col">
        <Checkbox label="メール" />
        <Checkbox label="青" color="primary" defaultChecked />
      </div>
    </>
  ),
  押せない: () => (
    <>
      <Checkbox label="メール" disabled />
      <Checkbox label="電話" disabled defaultChecked />
      <Checkbox label="青" color="primary" disabled defaultChecked />
      <Checkbox label="SMS" caption="いまは選べません" disabled />
      <TimeGroup disabled />
    </>
  ),
  エラー: () => (
    <>
      <CheckboxGroup
        label="連絡の方法"
        caption="受け取る方法を選びます"
        error="2つ以上選んでください"
        defaultValue={['mail']}
      >
        <Checkbox value="mail" label="メール" />
        <Checkbox value="tel" label="電話" />
        <Checkbox value="post" label="郵送" />
      </CheckboxGroup>
      <TimeGroup error="時間を選んでください" />
    </>
  ),
  トグルと並べる: () => (
    <>
      <Switch label="お知らせ" defaultChecked />
      <Checkbox label="メール" defaultChecked />
      <Switch label="プッシュ" caption="毎日届きます" />
      <Checkbox label="SMS" caption="毎日届きます" />
    </>
  ),
};

// 各セルの左がマウス用、右が指用。密度はセルの中で固定する
// 「トグルと並べる」だけは上下に積む（半分の幅ではトグルの文字が折り返し、文字の始まりを見比べられないため）
const stacked = (column: Column) => column.label === 'トグルと並べる';

const Cell = ({ column }: { column: Column }) => (
  <div className={stacked(column) ? 'flex flex-col gap-6' : 'grid grid-cols-2 gap-4'}>
    {(['fine', 'coarse'] as const).map((density) => (
      <div key={density} data-density={density} className="flex min-w-0 flex-col gap-3">
        <Note>{density === 'fine' ? 'マウス用' : '指用'}</Note>
        {states[column.label]()}
      </div>
    ))}
  </div>
);

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/40 チェックボックスとラジオ',
  id: 'design-review-40-checkbox-radio',
  decorators: [keepSwitchCaptionAsCompared, keepToggleColorAsCompared],
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      hover: ['[data-preview="hover"] [role="checkbox"]', '[data-preview="hover"] [role="radio"]'],
      focusVisible: ['[data-preview="focus"] [role="checkbox"]'],
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
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={40}
      axis="チェックボックスとラジオ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <Cell column={column} />}
    >
      <p>
        <strong className="text-fg">決まったこと</strong>
        （ADR-0062）。チェックボックスとラジオは入力欄の仲間です。ふだんはグレーの塗りで枠線も影もなく、hover
        で塗りが半段濃くなります。選ぶと部品の色の塗りに白い印になり、色を指定しないときはトグルの
        ON
        と同じ濃いグレーです。チェックボックスは小さな角丸の四角、ラジオは完全な丸です。横の文字は本体の一部で、押しても切り替わり、押せないときは箱と一緒にグレーになります。エラーでは選んでいない箱の塗りを淡い赤にし、文はグループに入力欄と同じ行で出します。押せる範囲は箱と横の文字（あいだを含む）で、見えない広がりは付けません。
      </p>
      <p>
        ここで選ぶのは、箱の大きさ・角・印（チェックの線とラジオの丸）の太さ・横の文字との間と、選んでいない箱のグレーの濃さです。行の高さは、どの案もトグルと同じ部品の高さです。選んでいない箱の色は、あとで
        ADR-0067 で濃くしました。
      </p>
      <p>
        各セルの左がマウス用、右が指用です（右端の列だけ、上がマウス用・下が指用です）。「hover・キーボードのフォーカス」の列は、上の段を
        hover、下の段をキーボードのフォーカスで固定しています。選んだ箱は、トグルの ON と同じく
        hover
        で色を変えていません。右端の列で、トグルとチェックボックスが仲間としてそろって見えるかを見てください。
      </p>
      <p>どれを既定にするかを一言添えてください。</p>
    </Comparison>
  ),
};
