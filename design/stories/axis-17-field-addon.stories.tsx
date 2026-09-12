import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { FieldAddonButton } from '../../src/components/FieldAddon';
import type { AddonShape } from '../../src/components/field-addon-context';
import { EyeIcon, EyeSlashIcon } from '../../src/components/icons';
import { Select } from '../../src/components/Select';
import { TextField } from '../../src/components/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 17: 入力欄の prefix・suffix（原則8）
// 色はグレー（--color-field-addon — ADR-0024）で決まっている
// 1〜2回目は形（design/tokens.css の --field-addon-*）、3回目はエラーのときの色（--color-field-addon-invalid ほか）を比べる

const inset = '4px';

// ── 1〜2回目: 形 ─────────────────────────────────────
// 既定は A（どちらも端に接する）。現行版・B・C はトークンで再現する

const shapes: Candidate[] = [
  {
    id: '現行版',
    name: '参照画像の形',
    intent:
      '部品はまだなかったので、参照画像を再現した。文字（App・東京都）は欄の端に接した四角い塊で、入力側の角は直角。ボタン（パスワードの目）は欄の内側に浮かせた小さな塊。',
    spec: [
      ['文字', '端に接する・入力側は直角'],
      ['ボタン', '内側に 4px 浮かせる・角丸 6px'],
      ['区切り', 'なし'],
    ],
    tokens: { '--field-addon-button-inset': inset, '--field-addon-button-round-inner': '1' },
  },
  {
    id: 'A',
    name: 'どちらも端に接する',
    intent:
      '文字もボタンも、欄の端に接した塊にする。欄の一部であることがいちばんはっきりする。フォーカスとエラーの枠線は、塊の外側にもそのまま続く。',
    spec: [
      ['文字', '端に接する・入力側は直角'],
      ['ボタン', '端に接する・入力側は直角'],
      ['区切り', 'なし'],
    ],
  },
  {
    id: 'B',
    name: 'どちらも内側に浮かせる',
    intent:
      '文字もボタンも、欄の内側に 4px 浮かせた塊にする。角丸は欄と同心（6px）。欄の外形は入力欄だけのときと同じで、グレーの面積が小さく軽い。',
    spec: [
      ['文字', '内側に 4px 浮かせる・角丸 6px'],
      ['ボタン', '内側に 4px 浮かせる・角丸 6px'],
      ['区切り', 'なし'],
    ],
    tokens: {
      '--field-addon-inset': inset,
      '--field-addon-round-inner': '1',
      '--field-addon-button-inset': inset,
      '--field-addon-button-round-inner': '1',
    },
  },
  {
    id: 'C',
    name: '端に接して区切る',
    intent:
      'A に、入力側との間の 2px の白い区切りを足す。塊と入力部分が、つながった2つの部品に見える。',
    spec: [
      ['文字', '端に接する・入力側は直角'],
      ['ボタン', '端に接する・入力側は直角'],
      ['区切り', '2px（地の色）'],
    ],
    tokens: { '--field-addon-divider': '2px' },
  },
];

const shapeColumns: Column[] = [
  {
    label: '通常',
    note: 'パスワードは、上が目のアイコン＋文字、下が目のアイコンだけ。押すと表示が切り替わります',
  },
  { label: 'フォーカス中', note: 'フォーカスした見た目を固定して表示しています', preview: 'focus' },
  { label: 'エラー・Disabled', note: '上がエラー、下の3つが Disabled' },
];

// ── 3回目: エラーのときの色 ───────────────────────────

const errorColors: Candidate[] = [
  {
    id: '現行版',
    name: 'グレーのまま',
    intent: '欄だけが赤くなり、prefix・suffix はふだんのグレーのまま。',
    spec: [
      ['塗り', '#E1E3E4（変えない）'],
      ['文字', '変えない'],
    ],
  },
  {
    id: 'A',
    name: '塗りを赤みに',
    intent:
      'グレーの塊とふだんの欄の関係（明度 −0.05）を、エラーの塗り（#FEF2F1）にそのまま写す。塊ごとエラーの色にそろう。',
    spec: [
      ['塗り', '#F1E0DE（エラーの塗りとの比 1.17、ふだんと同じ）'],
      ['文字', '変えない（5.38:1）'],
    ],
    tokens: { '--color-field-addon-invalid': '#f1e0de' },
  },
  {
    id: 'B',
    name: '文字を赤に',
    intent: '塗りはグレーのまま、文字とアイコンをエラーの赤にする。',
    spec: [
      ['塗り', '#E1E3E4（変えない）'],
      ['文字', '#BA012D（5.21:1）'],
    ],
    tokens: { '--color-on-field-addon-invalid': 'var(--color-danger)' },
  },
  {
    id: 'C',
    name: '塗りと文字を赤に',
    intent: 'A と B を合わせる。塊がはっきりエラーの側に入る。',
    spec: [
      ['塗り', '#F1E0DE'],
      ['文字', '#BA012D（5.26:1）'],
    ],
    tokens: {
      '--color-field-addon-invalid': '#f1e0de',
      '--color-on-field-addon-invalid': 'var(--color-danger)',
    },
  },
  {
    id: 'D',
    name: '赤い塗りに白文字',
    intent: '塊を Danger の赤で塗り、白文字を載せる。いちばん強い。',
    spec: [
      ['塗り', '#BA012D'],
      ['文字', '白（6.71:1）'],
    ],
    tokens: {
      '--color-field-addon-invalid': 'var(--color-danger)',
      '--color-on-field-addon-invalid': 'var(--color-on-danger)',
    },
  },
];

const errorColumns: Column[] = [
  { label: '通常（参考）', note: 'エラーでないとき。端に接する形（既定）' },
  {
    label: 'エラー（端に接する・既定）',
    note: '目のボタンにマウスを載せる・押すと、動きを確かめられます',
  },
  { label: 'エラー（内側に浮かせる）', note: 'addonShape="floating"' },
];

// ── 見本の欄 ──────────────────────────────────────────

const wards = [
  { label: '足立区', value: 'adachi' },
  { label: '荒川区', value: 'arakawa' },
  { label: '板橋区', value: 'itabashi' },
];

interface SampleProps {
  error?: boolean;
  disabled?: boolean;
  shape?: AddonShape;
}

const Url = ({ error, shape }: SampleProps) => (
  <TextField
    label="サイトの URL"
    prefix="https://"
    addonShape={shape}
    defaultValue={error ? 'k6n jp' : 'k6n.jp'}
    error={error ? 'URL の形が正しくありません' : undefined}
    caption="プロフィールに表示します"
  />
);

// パスワードの表示・非表示。iconOnly は目のアイコンだけのボタン（アイコン単体なので線は Bold — ADR-0018）
const Password = ({ iconOnly, error, disabled, shape }: SampleProps & { iconOnly?: boolean }) => {
  const [visible, setVisible] = useState(false);
  const Eye = visible ? EyeSlashIcon : EyeIcon;
  const message = iconOnly ? 'パスワードが一致しません' : '8文字以上にしてください';
  return (
    <TextField
      label={iconOnly ? 'パスワード（確認用）' : 'パスワード'}
      type={visible ? 'text' : 'password'}
      defaultValue={error ? 'kazu' : 'kazuemon2026'}
      autoComplete="off"
      error={error ? message : undefined}
      disabled={disabled}
      addonShape={shape}
      suffix={
        <FieldAddonButton
          aria-label={iconOnly ? (visible ? 'パスワードを隠す' : 'パスワードを表示') : undefined}
          onClick={() => setVisible(!visible)}
        >
          <Eye standalone={iconOnly} />
          {!iconOnly && (visible ? '隠す' : '表示')}
        </FieldAddonButton>
      }
    />
  );
};

const Ward = ({ error, disabled, shape }: SampleProps) => (
  <Select
    label="住所"
    prefix="東京都"
    addonShape={shape}
    items={wards}
    defaultValue="adachi"
    error={error ? 'この地域にはお届けできません' : undefined}
    disabled={disabled}
  />
);

const ShapeCell = ({ column }: { column: Column }) =>
  column.label === 'エラー・Disabled' ? (
    <div className="flex flex-col gap-5">
      <Url error />
      <Password disabled />
      <Password iconOnly disabled />
      <Ward disabled />
    </div>
  ) : (
    <div className="flex flex-col gap-5">
      <Url />
      <Password />
      <Password iconOnly />
      <Ward />
    </div>
  );

const ErrorCell = ({ column }: { column: Column }) => {
  const error = column.label !== '通常（参考）';
  const shape = column.label === 'エラー（内側に浮かせる）' ? 'floating' : 'attached';
  return (
    <div className="flex flex-col gap-5">
      <Url error={error} shape={shape} />
      <Password error={error} shape={shape} />
      <Password iconOnly error={error} shape={shape} />
      <Ward error={error} shape={shape} />
    </div>
  );
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/17 入力欄の prefix・suffix',
  id: 'design-review-17-field-addon',
  parameters: {
    layout: 'fullscreen',
    pseudo: { focusWithin: ['[data-preview="focus"] [data-slot="control"]'] },
  },
  args: { pick: '' },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '形',
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
  render: ({ pick }) => (
    <Comparison
      index={17}
      axis="入力欄の prefix・suffix の形"
      pick={pick}
      candidates={shapes}
      columns={shapeColumns}
      renderCell={(column) => <ShapeCell column={column} />}
    >
      <p>
        <strong className="text-fg">決定: A を既定にし、B も選べる</strong>
        （ADR-0035）（
        <code>addonShape="floating"</code>
        ）。「これも選べるシリーズかなと思いました。デフォルトでは A のパターンで、B
        のパターンも選べる、にしたいです。」
      </p>
      <p>
        入力欄に付く prefix・suffix（入力欄と一体のラベルやボタン）の形を選びます。色はグレー（
        <code>--color-field-addon</code>、#E1E3E4）に決まっています（ADR-0024）。
      </p>
      <p>
        2回目: suffix のボタンを「検索」から、パスワードの表示・非表示に替えました。「suffix
        に入れるアクションボタンと言うとパスワードの表示非表示くらいしか浮かばないので、そもそも検索だったら外に出すかなと思いました。」目のアイコン＋文字（表示・隠す）と、目のアイコンだけの2つを並べています。
      </p>
      <p>
        参照画像では、文字（App・東京都）は欄の端に接した塊、パスワードの目のボタンは欄の内側に浮かせた丸で、形が混ざっています。現行版はこれを再現したものです。候補は、形をそろえるかどうかと、入力部分との間を区切るかを変えています。
      </p>
      <p>
        どの案でも、ボタンは平らな要素として、hover と押下で文字の色を淡く敷き、押下で中身が 1px
        沈みます（ADR-0027）。文字の prefix を押すと、入力欄にフォーカスが移ります。Disabled
        の欄は塗りが prefix と同じグレー（#E1E3E4）になるので、塊は欄に溶けます。
      </p>
    </Comparison>
  ),
};

export const ErrorColor: Story = {
  name: 'エラーのときの色',
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
  render: ({ pick }) => (
    <Comparison
      index={17}
      axis="入力欄の prefix・suffix: エラーのときの色"
      pick={pick}
      candidates={errorColors}
      columns={errorColumns}
      renderCell={(column) => <ErrorCell column={column} />}
    >
      <p>
        <strong className="text-fg">決定: A 塗りを赤みに</strong>
        （ADR-0035）。「A かなと思います。現行版よりは違和感が改善されました。」
      </p>
      <p>
        3回目: エラーの欄で、prefix・suffix
        の色を変えるかを選びます。いまは欄だけが赤くなり（エラーの塗り #FEF2F1 と赤い枠線 —
        ADR-0021）、prefix・suffix はグレーのままです。
      </p>
      <p>
        候補は塗り（<code>--color-field-addon-invalid</code>）と文字（
        <code>--color-on-field-addon-invalid</code>
        ）だけを変えています。文字の比は、どれも本文の基準 4.5:1 を満たします。
      </p>
      <p>
        エラーは枠線・塗り・赤い文字（キャプションの位置）ですでに伝わっているので、prefix・suffix
        まで赤くすると赤の面積が増えます。一方で、グレーのまま残すと、塊だけがエラーから浮いて見えることがあります。
      </p>
      <p>
        判断の基準（軽い・やわらかい・整然・人懐っこい）に最も近い案を1つ選び、一言添えてください。
      </p>
    </Comparison>
  ),
};
