import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FormEvent, ReactNode } from 'react';

import { Button, type ButtonProps } from '../components/button/Button';
import { Checkbox, type ChoiceColor } from '../components/checkbox/Checkbox';
import { CheckboxGroup } from '../components/checkbox/CheckboxGroup';
import { FieldAddonButton } from '../components/field-addon/FieldAddon';
import { Form } from '../components/form/Form';
import { EyeIcon } from '../internal/icons';
import { Link, type LinkProps } from '../components/link/Link';
import { Radio, RadioGroup } from '../components/radio/Radio';
import type { ListboxItem } from '../internal/listbox/use-listbox-option';
import { Select, type SelectProps } from '../components/select/Select';
import { Switch, type SwitchFrame } from '../components/switch/Switch';
import { TextField, type TextFieldProps } from '../components/text-field/TextField';

// 押せない状態（disabled・送信中・止める形）の一覧。軸の比較（Comparison）ではなく、部品ごとに見比べるための一覧
// 部品は今の見た目のまま描く（比較のときの上書き pins.tsx は使わない）

// ---- 並べる枠 ----

interface Row {
  label: string;
  note?: string;
  /** 列の番号から、セルの中身を作る */
  cell: (column: number) => ReactNode;
}

function Table({ columns, rows, width = 232 }: { columns: string[]; rows: Row[]; width?: number }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div
        className="grid gap-x-6"
        style={{ gridTemplateColumns: `168px repeat(${columns.length}, ${width}px)` }}
      >
        <div />
        {columns.map((column) => (
          <div key={column} className="pb-3 text-xs font-bold text-fg-subtle">
            {column}
          </div>
        ))}
        {rows.map((row) => (
          <div
            key={row.label}
            className="col-span-full grid grid-cols-subgrid items-start border-t border-line py-4"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold">{row.label}</span>
              {row.note && <span className="text-xs text-fg-subtle">{row.note}</span>}
            </div>
            {columns.map((column, i) => (
              <div key={column} className="min-w-0">
                {row.cell(i)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex max-w-[72ch] flex-col gap-1">
        <h2 className="text-xl font-heading">{title}</h2>
        {note && <div className="text-sm leading-6 text-fg-muted">{note}</div>}
      </div>
      {children}
    </section>
  );
}

const SubTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="text-sm font-bold">{children}</h3>
);

const none = (text: string) => <span className="text-xs text-fg-subtle">{text}</span>;

const preventSubmit = (event: FormEvent<HTMLFormElement>) => event.preventDefault();

// ---- Button ----

type ButtonColor = NonNullable<ButtonProps['color']>;
type ButtonVariant = NonNullable<ButtonProps['variant']>;

const buttonColors: ButtonColor[] = ['primary', 'secondary', 'danger', 'neutral', 'white'];
const buttonVariants: ButtonVariant[] = ['filled', 'outline', 'underline'];
const buttonColorNote: Record<ButtonColor, string> = {
  primary: '色を持つ',
  secondary: '色を持つ',
  danger: '色を持つ',
  neutral: '色を持たない（既定）',
  white: '白いボタン',
};

const buttonKinds = buttonVariants.flatMap((variant) =>
  buttonColors.map((color) => ({ variant, color }))
);

// 列（状態）。キャプションありの表は、最初の3列だけ使う
const buttonStates: {
  label: string;
  props: Pick<ButtonProps, 'disabled' | 'loading' | 'inlineSpinner' | 'loadingIndicator'>;
}[] = [
  { label: '通常', props: {} },
  { label: '押せない', props: { disabled: true } },
  { label: '送信中（回る円）', props: { loading: true } },
  { label: '送信中（回る円を左に）', props: { loading: true, inlineSpinner: true } },
  { label: '送信中（線）', props: { loading: true, loadingIndicator: 'bar' } },
];
const captionStates = buttonStates.slice(0, 3);

const buttonRows: Row[] = buttonKinds.map(({ variant, color }) => ({
  label: `${color} · ${variant}`,
  note: buttonColorNote[color],
  cell: (i) => (
    <Button color={color} variant={variant} {...buttonStates[i].props}>
      保存する
    </Button>
  ),
}));

const captionText = '公開したあとは変更できません';

const captionRows: Row[] = [
  ...(
    [
      ['primary', 'filled'],
      ['neutral', 'filled'],
      ['secondary', 'outline'],
      ['neutral', 'outline'],
    ] as const
  ).map(([color, variant]): Row => ({
    label: `${color} · ${variant}`,
    cell: (i) => (
      <Button color={color} variant={variant} caption={captionText} {...captionStates[i].props}>
        公開する
      </Button>
    ),
  })),
  {
    label: 'ボタンの見た目のリンク',
    note: 'primary（Link の variant="button"）',
    cell: (i) =>
      i === 2 ? (
        none('リンクは送信中を持たない')
      ) : (
        <Link variant="button" color="primary" href="#top" caption={captionText} disabled={i === 1}>
          記事を読む
        </Link>
      ),
  },
];

// ボタンの見た目のリンク（Link の variant="button"）。色は primary・secondary・neutral
// 押せないときは、色を指定していても押せないグレーのボタンと同じ見た目（原則7）
const buttonLinkRows: Row[] = (['primary', 'secondary', 'neutral'] as const).map((color) => ({
  label: color,
  note: buttonColorNote[color],
  cell: (i) => (
    <Link variant="button" color={color} href="#top" disabled={i === 1}>
      記事を読む
    </Link>
  ),
}));

// ---- Link ----

type LinkColor = NonNullable<LinkProps['color']>;
type LinkVariant = NonNullable<LinkProps['variant']>;

const linkColors: LinkColor[] = ['primary', 'secondary', 'neutral'];
const linkVariants: LinkVariant[] = ['text', 'outline', 'underline'];

function LinkSample({
  variant,
  color,
  disabled,
  newTab,
}: {
  variant: LinkVariant;
  color: LinkColor;
  disabled?: boolean;
  newTab?: boolean;
}) {
  const target = newTab ? { href: 'https://k6n.jp/', target: '_blank' } : { href: '#top' };
  if (variant === 'outline' || variant === 'underline') {
    return (
      <Link variant={variant} color={color} disabled={disabled} {...target}>
        もっと見る
      </Link>
    );
  }
  return (
    <p data-around className="text-sm leading-6 text-fg">
      記事は{' '}
      <Link color={color} disabled={disabled} {...target}>
        こちら
      </Link>{' '}
      から読めます
    </p>
  );
}

const linkStates: { label: string; props: { disabled?: boolean; newTab?: boolean } }[] = [
  { label: '通常', props: {} },
  { label: '押せない', props: { disabled: true } },
  { label: '新しいタブ（↗）', props: { newTab: true } },
  { label: '新しいタブ（↗）· 押せない', props: { newTab: true, disabled: true } },
];

const linkRows: Row[] = linkVariants.flatMap((variant) =>
  linkColors.map((color) => ({
    label: `${variant} · ${color}`,
    note: color === 'neutral' ? '色を持たない（既定）' : '色を持つ',
    cell: (i) => <LinkSample variant={variant} color={color} {...linkStates[i].props} />,
  }))
);

// ---- TextField・Select ----

// TextField と Select で共通の、状態の props（readOnly は TextField だけ）
interface FieldStateProps {
  disabled?: boolean;
  readOnly?: boolean;
  errorText?: string;
  loading?: boolean;
  loadingBehavior?: 'blocking' | 'non-blocking';
  loadingIndicator?: 'spinner' | 'bar';
}

interface FieldState {
  label: string;
  props: FieldStateProps;
  /** Form の submitting の中に置く */
  form?: boolean;
}

const errorMessage = '使えない文字が入っています';

function stateSet(withReadOnly: boolean): [FieldState[], FieldState[]] {
  const first: FieldState[] = [
    { label: '通常', props: {} },
    { label: '押せない', props: { disabled: true } },
    ...(withReadOnly ? [{ label: '読み取り専用', props: { readOnly: true } }] : []),
    { label: 'エラー', props: { errorText: errorMessage } },
    { label: 'エラー＋押せない', props: { errorText: errorMessage, disabled: true } },
  ];
  const waiting: FieldState[] = [
    { label: '待っている（止めない）', props: { loading: true } },
    { label: '待っている（止める）', props: { loading: true, loadingBehavior: 'blocking' } },
    {
      label: '待っている（止める・線）',
      props: { loading: true, loadingBehavior: 'blocking', loadingIndicator: 'bar' },
    },
    { label: 'フォームの送信中', props: {}, form: true },
  ];
  return [first, waiting];
}

const [textStates, textWaiting] = stateSet(true);
const [selectStates, selectWaiting] = stateSet(false);

const passwordButton = (disabled?: boolean) => (
  <FieldAddonButton aria-label="パスワードを表示" disabled={disabled}>
    <EyeIcon standalone />
  </FieldAddonButton>
);

const textSamples: { label: string; note?: string; props: TextFieldProps }[] = [
  {
    label: '値あり',
    props: { label: 'ユーザー名', caption: '半角英数字で入力します', defaultValue: 'kazuemon' },
  },
  {
    label: '空（プレースホルダ）',
    props: { label: 'ユーザー名', caption: '半角英数字で入力します', placeholder: '例: kazuemon' },
  },
  {
    label: 'prefix（文字）',
    props: {
      label: 'サイト',
      caption: 'ドメインから入力します',
      prefix: 'https://',
      defaultValue: 'k6n.jp',
    },
  },
  {
    label: 'suffix（文字）',
    props: { label: '価格', caption: '税込みで入力します', suffix: '円', defaultValue: '1200' },
  },
  {
    label: 'suffix（ボタン）',
    note: 'FieldAddonButton',
    props: {
      label: 'パスワード',
      caption: '8文字以上',
      type: 'password',
      defaultValue: 'secret123',
      suffix: passwordButton(),
    },
  },
  {
    label: 'suffix のボタンだけ押せない',
    note: 'FieldAddonButton の disabled',
    props: {
      label: 'パスワード',
      caption: '8文字以上',
      type: 'password',
      defaultValue: 'secret123',
      suffix: passwordButton(true),
    },
  },
];

const textRows = (states: FieldState[]): Row[] =>
  textSamples.map((sample) => ({
    label: sample.label,
    note: sample.note,
    cell: (i) =>
      states[i].form ? (
        <Form submitting onSubmit={preventSubmit}>
          <TextField {...sample.props} />
        </Form>
      ) : (
        <TextField {...sample.props} {...states[i].props} />
      ),
  }));

const slots: ListboxItem[] = [
  { value: 'morning', label: '午前' },
  { value: 'afternoon', label: '14〜16時' },
  { value: 'evening', label: '18〜20時' },
  {
    value: 'night',
    label: '20〜21時',
    disabled: true,
    note: { kind: 'reason', text: 'この地域では選べません' },
  },
];

const cities: ListboxItem[] = [
  { value: 'shibuya', label: '渋谷区' },
  { value: 'meguro', label: '目黒区' },
  { value: 'setagaya', label: '世田谷区' },
];

const selectSamples: { label: string; note?: string; props: SelectProps }[] = [
  {
    label: '選んだ値あり',
    note: '開くと、最後の選択肢が選べない（2行目に理由）',
    props: {
      label: '配送の時間帯',
      caption: '前日までに選びます',
      items: slots,
      defaultValue: 'morning',
    },
  },
  {
    label: '空（プレースホルダ）',
    props: {
      label: '配送の時間帯',
      caption: '前日までに選びます',
      items: slots,
      placeholder: '選んでください',
    },
  },
  {
    label: 'prefix（文字）',
    props: {
      label: '市区町村',
      caption: '都道府県を選んだあとに選びます',
      items: cities,
      prefix: '東京都',
      defaultValue: 'shibuya',
    },
  },
  {
    label: '▼を隠す',
    note: 'hideCaretOnDisabled（押せないときだけ効く）',
    props: {
      label: '配送の時間帯',
      caption: '前日までに選びます',
      items: slots,
      defaultValue: 'morning',
      hideCaretOnDisabled: true,
    },
  },
];

const selectRows = (states: FieldState[]): Row[] =>
  selectSamples.map((sample) => ({
    label: sample.label,
    note: sample.note,
    cell: (i) =>
      states[i].form ? (
        <Form submitting onSubmit={preventSubmit}>
          <Select {...sample.props} />
        </Form>
      ) : (
        <Select {...sample.props} {...states[i].props} />
      ),
  }));

// ---- Switch ----

const choiceColors: ChoiceColor[] = ['primary', 'secondary', 'neutral'];
const colorNote = (color: ChoiceColor) =>
  color === 'neutral' ? '色を持たない（既定）' : '色を持つ';

const switchRows: Row[] = choiceColors.flatMap((color) =>
  [false, true].map((on) => ({
    label: `${color} · ${on ? 'ON' : 'OFF'}`,
    note: colorNote(color),
    cell: (i) => (
      <Switch
        color={color}
        defaultChecked={on}
        disabled={i === 1}
        label="新着をメールで受け取る"
        caption="週に1回まとめて届きます"
      />
    ),
  }))
);

const frames: SwitchFrame[] = ['none', 'card', 'divided'];

const switchFrameRows: Row[] = frames.flatMap((frame) =>
  (['neutral', 'primary'] as const).flatMap((color) =>
    [false, true].map((on) => ({
      label: `${frame} · ${color} · ${on ? 'ON' : 'OFF'}`,
      note: frame === 'none' ? undefined : 'togglePlacement="end"',
      cell: (i) => (
        <Switch
          frame={frame}
          togglePlacement={frame === 'none' ? 'start' : 'end'}
          color={color}
          defaultChecked={on}
          disabled={i === 1}
          label="新着をメールで受け取る"
          caption="週に1回まとめて届きます"
        />
      ),
    }))
  )
);

// ---- Checkbox・Radio ----

const checkStates = [
  { label: '選んでいない', props: {} },
  { label: '選んだ', props: { defaultChecked: true } },
  { label: '中間', props: { indeterminate: true } },
] as const;

const checkboxStates: { label: string; props: { disabled?: boolean; errorText?: string } }[] = [
  { label: '通常', props: {} },
  { label: '押せない', props: { disabled: true } },
  { label: 'エラー', props: { errorText: '同意が必要です' } },
  { label: 'エラー＋押せない', props: { errorText: '同意が必要です', disabled: true } },
];

const checkboxRows: Row[] = choiceColors.flatMap((color) =>
  checkStates.map((state) => ({
    label: `${color} · ${state.label}`,
    note: colorNote(color),
    cell: (i) => (
      <Checkbox
        color={color}
        label="利用規約に同意する"
        caption="内容は設定からいつでも読めます"
        {...state.props}
        {...checkboxStates[i].props}
      />
    ),
  }))
);

interface GroupMode {
  label: string;
  group?: boolean;
  item?: 'checked' | 'unchecked';
  error?: boolean;
}

const groupModes: GroupMode[] = [
  { label: '通常' },
  { label: 'グループごと押せない', group: true },
  { label: '選んだ1つが押せない', item: 'checked' },
  { label: '選んでいない1つが押せない', item: 'unchecked' },
  { label: 'エラー', error: true },
  { label: 'エラー＋押せない', error: true, group: true },
];

const checkboxGroupRows: Row[] = choiceColors.map((color) => ({
  label: color,
  note: `${colorNote(color)}。「すべて」は中間`,
  cell: (i) => {
    const mode = groupModes[i];
    return (
      <CheckboxGroup
        label="載せるもの"
        caption="1つ以上選びます"
        color={color}
        defaultValue={['text', 'image']}
        selectAll="すべて"
        allValues={['text', 'image', 'video']}
        disabled={mode.group}
        errorText={mode.error ? '選び直してください' : undefined}
      >
        <Checkbox value="text" label="本文" />
        <Checkbox value="image" label="画像" disabled={mode.item === 'checked'} />
        <Checkbox value="video" label="動画" disabled={mode.item === 'unchecked'} />
      </CheckboxGroup>
    );
  },
}));

const radioGroupRows: Row[] = choiceColors.map((color) => ({
  label: color,
  note: colorNote(color),
  cell: (i) => {
    const mode = groupModes[i];
    return (
      <RadioGroup
        label="公開の範囲"
        caption="あとから変えられます"
        color={color}
        defaultValue="public"
        disabled={mode.group}
        errorText={mode.error ? '選び直してください' : undefined}
      >
        <Radio value="public" label="全体に公開" disabled={mode.item === 'checked'} />
        <Radio value="limited" label="リンクを知っている人" disabled={mode.item === 'unchecked'} />
        <Radio value="private" label="自分だけ" />
      </RadioGroup>
    );
  },
}));

// ---- Form の送信中 ----

const formSample = (submitting: boolean) => (
  <Form submitting={submitting} onSubmit={preventSubmit} className="flex flex-col gap-4">
    <TextField label="名前" defaultValue="かずえもん" />
    <Select label="配送の時間帯" items={slots} defaultValue="morning" />
    <Checkbox label="お知らせを受け取る" defaultChecked />
    <Switch label="下書きとして残す" color="primary" defaultChecked />
    <RadioGroup label="公開の範囲" defaultValue="public" color="primary">
      <Radio value="public" label="全体に公開" />
      <Radio value="private" label="自分だけ" />
    </RadioGroup>
    <div className="flex flex-wrap gap-3">
      <Button type="submit" color="primary">
        送信する
      </Button>
      <Button type="submit" variant="outline">
        下書きに保存
      </Button>
    </div>
  </Form>
);

// ---- ストーリー ----

const meta = {
  title: 'Overview/押せない状態の一覧',
  id: 'overview-disabled',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  tags: ['visual'],
  name: '一覧',
  render: () => (
    <div id="top" className="flex min-h-screen flex-col gap-12 bg-bg px-6 py-8 text-fg">
      <Section
        title="Button"
        note='color × variant。送信中は loading（回る円はラベルに重ねる既定と、inlineSpinner でラベルの左）と loadingIndicator="bar"。'
      >
        <Table columns={buttonStates.map((state) => state.label)} rows={buttonRows} width={200} />
        <SubTitle>キャプションあり（押せなくても、送信中でも、キャプションは薄くしない）</SubTitle>
        <Table columns={captionStates.map((state) => state.label)} rows={captionRows} width={200} />
        <SubTitle>
          ボタンの見た目のリンク（Link の variant="button"。見た目は上のボタンと同じもの）
        </SubTitle>
        <Table columns={['通常', '押せない']} rows={buttonLinkRows} width={200} />
      </Section>

      <Section
        title="Link"
        note="variant × color。押せない文字のリンクはただの文字（下線と ↗ なし、周りの文字の色）。押せない枠線のリンクは、押せないグレーの枠線のボタンと同じ。下線のリンク（variant の underline）は、押せないときに下線が外れ、押せないグレーのボタンと同じ文字の色になる。ボタンの見た目（variant の button）のリンクも、押せないときは色を指定していても押せないグレーのボタンと同じ（原則7）。上の Button の節に並べています。"
      >
        <Table columns={linkStates.map((state) => state.label)} rows={linkRows} width={220} />
      </Section>

      <Section
        title="TextField"
        note="prefix・suffix（文字とボタン）を含む。suffix のボタンは FieldAddonButton で、欄が押せないときは一緒に押せなくなり、止めるときは押せるまま。"
      >
        <Table columns={textStates.map((s) => s.label)} rows={textRows(textStates)} />
        <SubTitle>待っている・フォームの送信中</SubTitle>
        <Table columns={textWaiting.map((s) => s.label)} rows={textRows(textWaiting)} />
      </Section>

      <Section
        title="Select"
        note="Select には読み取り専用（readOnly）の props はありません。color は開いた選択肢の印だけに効くので、本体は色によらず同じです。選べない選択肢は、開くと見えます。"
      >
        <Table columns={selectStates.map((s) => s.label)} rows={selectRows(selectStates)} />
        <SubTitle>待っている・フォームの送信中</SubTitle>
        <Table columns={selectWaiting.map((s) => s.label)} rows={selectRows(selectWaiting)} />
      </Section>

      <Section
        title="Switch"
        note="color × OFF・ON。ラベルは本体の一部なので押せないとグレー、キャプションは変えない。"
      >
        <Table columns={['通常', '押せない']} rows={switchRows} width={280} />
        <SubTitle>行の形（frame）</SubTitle>
        <Table columns={['通常', '押せない']} rows={switchFrameRows} width={320} />
      </Section>

      <Section
        title="Checkbox"
        note="1つだけ置くチェックボックスと、グループ（「すべて」の箱つき）。横の文字は本体の一部なので押せないとグレー、キャプションと見出しは変えない。"
      >
        <Table
          columns={checkboxStates.map((state) => state.label)}
          rows={checkboxRows}
          width={250}
        />
        <SubTitle>グループ（CheckboxGroup）</SubTitle>
        <Table
          columns={groupModes.map((mode) => mode.label)}
          rows={checkboxGroupRows}
          width={220}
        />
      </Section>

      <Section title="Radio" note="RadioGroup の color × 押せない形。「全体に公開」を選んだ状態。">
        <Table columns={groupModes.map((mode) => mode.label)} rows={radioGroupRows} width={220} />
      </Section>

      <Section
        title="Form の送信中"
        note="Form の submitting。入力欄は止める形（押せない欄の見た目）、送信のボタンは押したもの（ここでは最初のもの）に印、ほかは押せない見た目だけ。チェックボックス・ラジオ・トグルも止め、押せない見た目にします（フォーカスは外れず、値も送られます）。"
      >
        <Table
          columns={['送っていない', '送っている（submitting）']}
          rows={[{ label: 'Form の中の部品', cell: (i) => formSample(i === 1) }]}
          width={320}
        />
      </Section>
    </div>
  ),
};
