import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';

import { Button } from '../../src/components/Button';
import { FieldAddonButton } from '../../src/components/FieldAddon';
import { Form } from '../../src/components/Form';
import { EyeIcon, EyeSlashIcon } from '../../src/components/icons';
import { TextField } from '../../src/components/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 38: フォーム全体を送っているあいだ
// これまでは loading を渡すと欄にも必ず印が出て、フォーム全体の「待っている」を欄に配る仕組みもなかった（design/adr/0042 の残り）
// Form に submitting（送っている）と submittingBehavior（欄の扱い）を足し、context で中の欄に配る（src/components/form-context.ts）
// 案は欄の扱い。見た目だけでなく、振る舞い（書き換え・フォーカス・送る値）も違うので、トークンではなく props で行ごとに変える
// 印は、どの案でも送信のボタン（Button の loading）だけ。欄に回る円は出さない
// 部品の submittingBehavior は、採った blocking（A）と none（現行版）だけを持つ
// 採らなかった B（readonly）と C（disabled）は、Form を none にして、送っているあいだ欄に readOnly・disabled を直接渡して再現する

type Behavior = 'none' | 'blocking' | 'readonly' | 'disabled';

interface SubmitCandidate extends Candidate {
  behavior: Behavior;
}

// 欄に直接渡す止め方（B・C の再現）
interface FieldLock {
  readOnly?: boolean;
  disabled?: boolean;
}

const fieldLock = (behavior: Behavior, submitting: boolean): FieldLock =>
  submitting ? { readOnly: behavior === 'readonly', disabled: behavior === 'disabled' } : {};

const candidates: SubmitCandidate[] = [
  {
    id: '現行版',
    behavior: 'none',
    name: '欄は何も変えない（ボタンだけ）',
    intent:
      '送っているあいだも、欄はそのまま書き換えられる。印はボタンだけ。送ったあとに書き換えた値は、送った値と食い違う。欄を止めない形を選ぶなら、この形のまま。',
    spec: [
      ['submittingBehavior', 'none'],
      ['欄の見た目', '変えない'],
      ['書き換え', 'できる'],
      ['フォーカス', '外れない'],
      ['送る値（FormData）', '入る'],
      ['読み上げ', '欄は変わらない。ボタンは「ビジー」'],
    ],
  },
  {
    id: 'A',
    behavior: 'blocking',
    name: '止める・押せない見た目',
    intent:
      '値を確かめるときの止める形（ADR-0042 の E）と同じ見た目で、印はボタンだけ。書き換えられない。フォーカスは外さず、フォーカスの青い枠線とエラーの赤い枠線も残す。値は送られる。',
    spec: [
      ['submittingBehavior', 'blocking'],
      ['欄の見た目', '押せない欄と同じ塗り（#E1E3E4）と文字（#A3A5A6）。カーソルは待っている形'],
      ['書き換え', 'できない（readOnly）'],
      ['フォーカス', '外れない。Tab でも止まる'],
      ['送る値（FormData）', '入る'],
      ['読み上げ', '欄に入ると「利用不可」（aria-disabled）'],
      ['suffix のボタン', '押せる（値を変えないため — 原則8）'],
    ],
  },
  {
    id: 'B',
    behavior: 'readonly',
    name: '見た目はそのまま・書き換えだけ止める',
    intent:
      '欄の見た目は変えず、書き換えだけを止める（readOnly）。見た目は現行版と同じで、打っても文字が入らないことで止まっていると分かる。',
    spec: [
      ['submittingBehavior', 'readonly'],
      ['欄の見た目', '変えない'],
      ['書き換え', 'できない（readOnly）'],
      ['フォーカス', '外れない。Tab でも止まる'],
      ['送る値（FormData）', '入る'],
      ['読み上げ', '欄に入ると「読み取り専用」'],
      ['注意', '止まっていることが目に見えない。打った文字が消えたように感じる'],
    ],
  },
  {
    id: 'C',
    behavior: 'disabled',
    name: '押せなくする（disabled）',
    intent:
      '<fieldset disabled> と同じ。押せない欄の見た目。打っていた欄からフォーカスが外れ、ページ（body）に戻る。disabled の欄は FormData に入らないので、送っているあいだに値を読み直すと抜ける。',
    spec: [
      ['submittingBehavior', 'disabled'],
      ['欄の見た目', '押せない欄（ADR-0026）。カーソルは禁止の形'],
      ['書き換え', 'できない'],
      ['フォーカス', '外れる（body に戻る）。Tab で止まらない'],
      ['送る値（FormData）', '入らない'],
      ['読み上げ', 'フォーカスが外れるので、読み上げソフトではどこにいるか分からなくなる'],
      ['suffix のボタン', '押せない'],
    ],
  },
];

const columns: Column[] = [
  {
    label: '送っているあいだ',
    note: '保存するを押して、返事を待っているところ。上から、名前・URL（prefix）・パスワード（suffix のボタン）',
  },
  {
    label: 'フォーカス中',
    note: '名前の欄で Enter を押して送り、フォーカスが名前の欄に残っているところ（固定）。C はフォーカスが外れるので、固定していません',
    preview: 'focus',
  },
  {
    label: '触って確かめる',
    note: '名前の欄で Enter を押すか、保存するを押すと 2.4 秒送ります。送っているあいだに打ったり Tab を押したりしてみてください。下に、いまのフォーカスと、送っているあいだに読み直した値を出します',
  },
];

function PasswordField({ defaultValue, lock }: { defaultValue?: string; lock: FieldLock }) {
  const [visible, setVisible] = useState(false);
  const Eye = visible ? EyeSlashIcon : EyeIcon;
  return (
    <TextField
      label="パスワード"
      name="password"
      type={visible ? 'text' : 'password'}
      defaultValue={defaultValue}
      autoComplete="off"
      {...lock}
      suffix={
        <FieldAddonButton
          aria-label={visible ? 'パスワードを隠す' : 'パスワードを表示'}
          onClick={() => setVisible(!visible)}
        >
          <Eye standalone />
        </FieldAddonButton>
      }
    />
  );
}

function Fields({ focusPreview, lock }: { focusPreview?: boolean; lock: FieldLock }) {
  return (
    <>
      <div data-focus-preview={focusPreview || undefined}>
        <TextField
          label="お名前"
          name="name"
          defaultValue="山田 花子"
          autoComplete="off"
          {...lock}
        />
      </div>
      <TextField
        label="サイトの URL"
        name="url"
        prefix="https://"
        defaultValue="k6n.jp"
        autoComplete="off"
        caption="プロフィールに表示します"
        {...lock}
      />
      <PasswordField defaultValue="kazuemon2026" lock={lock} />
    </>
  );
}

// 部品の Form に渡す値。B・C は none にして、欄に直接渡す
const formBehavior = (behavior: Behavior) => (behavior === 'blocking' ? 'blocking' : 'none');

// 送っているあいだで固定したフォーム
const FixedCell = ({ candidate, focus }: { candidate: SubmitCandidate; focus?: boolean }) => (
  <Form
    submitting
    submittingBehavior={formBehavior(candidate.behavior)}
    onSubmit={(event) => event.preventDefault()}
    className="flex flex-col gap-5"
  >
    <Fields
      focusPreview={focus && candidate.behavior !== 'disabled'}
      lock={fieldLock(candidate.behavior, true)}
    />
    <Button type="submit" color="primary" loading className="self-start">
      保存する
    </Button>
  </Form>
);

// いまフォーカスのある場所を、欄の名前で書く。送っているあいだに body に戻ったときは「外れた」と書く
function describeFocus(form: HTMLFormElement | null, submitting: boolean) {
  const active = document.activeElement;
  if (!active || active === document.body)
    return submitting ? 'ページ（body）— フォームから外れた' : 'ページ（body）';
  if (!form?.contains(active)) return 'フォームの外';
  if (active instanceof HTMLInputElement) {
    const label = active.labels?.[0]?.textContent?.trim();
    return `${label ?? '欄'}の欄`;
  }
  return active.getAttribute('aria-label') ?? active.textContent?.trim() ?? '（名前なし）';
}

// 送っているあいだに読み直した値（FormData）。パスワードは文字数だけ
function describeData(form: HTMLFormElement) {
  const entries = [...new FormData(form).entries()].map(([key, value]) => {
    const text = typeof value === 'string' ? value : value.name;
    return key === 'password' ? `${key}（${text.length}文字）` : `${key}=${text}`;
  });
  return entries.length ? entries.join('・') : '（何も入らない）';
}

function TryCell({ candidate }: { candidate: SubmitCandidate }) {
  const [submitting, setSubmitting] = useState(false);
  const [focus, setFocus] = useState('なし');
  const [data, setData] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const submittingRef = useRef(submitting);
  useEffect(() => {
    submittingRef.current = submitting;
  });
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  // disabled になった欄からフォーカスが外れても focusout が来ないことがあるので、少しずつ見る
  useEffect(() => {
    const id = setInterval(
      () => setFocus(describeFocus(formRef.current, submittingRef.current)),
      150
    );
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex flex-col gap-4">
      <Form
        ref={formRef}
        submitting={submitting}
        submittingBehavior={formBehavior(candidate.behavior)}
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitting(true);
          setData(null);
          // 送っている描画のあとで読み直す（送信の処理が、描画のあとで値を読む場合）
          timers.current.push(
            setTimeout(() => formRef.current && setData(describeData(formRef.current)), 100)
          );
          timers.current.push(setTimeout(() => setSubmitting(false), 2400));
        }}
        className="flex flex-col gap-5"
      >
        <Fields lock={fieldLock(candidate.behavior, submitting)} />
        <Button type="submit" color="primary" loading={submitting} className="self-start">
          保存する
        </Button>
      </Form>
      <dl
        className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs text-fg-muted"
        data-axis38-readout
      >
        <dt className="text-fg-subtle">フォーカス</dt>
        <dd data-axis38-focus>{focus}</dd>
        <dt className="text-fg-subtle">送っているあいだの値</dt>
        <dd data-axis38-data>{data ?? '（送ると出ます）'}</dd>
      </dl>
    </div>
  );
}

const Cell = ({ column, candidate }: { column: Column; candidate: SubmitCandidate }) => {
  if (column.label === '触って確かめる') return <TryCell candidate={candidate} />;
  return <FixedCell candidate={candidate} focus={column.label === 'フォーカス中'} />;
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/38 フォーム全体を送っているあいだ',
  id: 'design-review-38-form-submitting',
  parameters: {
    layout: 'fullscreen',
    pseudo: { focusWithin: ['[data-preview="focus"] [data-focus-preview] [data-slot="control"]'] },
  },
  args: { pick: 'A' },
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
      index={38}
      axis="フォーム全体を送っているあいだ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const found = candidates.find((c) => c.id === candidate.id);
        return found && <Cell column={column} candidate={found} />;
      }}
    >
      <p>
        <strong className="text-fg">決まったこと</strong>
        （ADR-0059）。保存するを押してから返事が来るまでの、フォームの欄の扱いを選びます。これまでは、欄に
        loading
        を渡すと欄にも回る円が出てしまい、フォーム全体の「送っている」を欄に配る仕組みもありませんでした。Form
        に「送っている」を持たせ、中の欄に配るようにしました。印は、どの案でも保存するのボタンだけです。
      </p>
      <p>
        案の違いは、見た目（押せない見た目にするか）と、振る舞いです。振る舞いは、書き換えられるか、打っていた欄からフォーカスが外れるか、送る値に入るかの3つです。各案の表と、いちばん右の列で確かめられます。
      </p>
      <p>
        列は左から、送っているあいだ・フォーカス中（固定）・触って確かめる、です。フォーカス中の列では、Enter
        で送ったあとに名前の欄にフォーカスが残る様子を見ます。
      </p>
      <p>どれを既定にするかを一言添えてください。ほかの案も選べるようにするかも教えてください。</p>
    </Comparison>
  ),
};
