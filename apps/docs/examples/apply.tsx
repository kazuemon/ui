'use client';

import {
  Button,
  type CaptionPlacement,
  Checkbox,
  CheckboxGroup,
  Combobox,
  DescriptionItem,
  DescriptionList,
  Form,
  Heading,
  Link,
  Notice,
  NumberField,
  type OptionalMark,
  Radio,
  RadioGroup,
  type RequiredMark,
  TagsInput,
  Text,
  Textarea,
  TextField,
} from '@kazuemon/ui';
import { type FormEvent, useEffect, useRef, useState } from 'react';

import { SamplePage } from './sample-page';
import { meetup } from './sites';
import type { Example } from './types';

// 申込フォーム: 勉強会の参加の申し込み。入力 → 確認 → 完了の 3 つの画面を、1 つのページで切り替える
// 欄は、打つ欄・選ぶ欄・数の欄・複数選ぶ欄・札で足す欄・同意の欄をひととおり置き、必須と任意の印を確かめられるようにする

type Scenario = 'empty' | 'invalid' | 'confirm' | 'submitting' | 'done';
type Step = 'input' | 'confirm' | 'done';

interface Values {
  name: string;
  email: string;
  attend: string;
  prefecture: string | null;
  people: number | null;
  interests: string[];
  tech: string[];
  question: string;
  terms: boolean;
}
type Errors = Partial<Record<keyof Values, string>>;

const empty: Values = {
  name: '',
  email: '',
  attend: '',
  prefecture: null,
  people: 1,
  interests: [],
  tech: [],
  question: '',
  terms: false,
};
const sample: Values = {
  name: 'かずえもん',
  email: 'kazuemon@example.com',
  attend: 'venue',
  prefecture: 'tokyo',
  people: 2,
  interests: ['design', 'a11y'],
  tech: ['React', 'TypeScript'],
  question: '当日は、ノートパソコンを持っていったほうがよいですか？',
  terms: true,
};
/** 検証のエラーを再現するときの値。名前は空、メールは形が違う、会場なのに都道府県がない、同意していない */
const wrong: Values = { ...empty, email: 'kazuemon', attend: 'venue' };

const attendLabel: Record<string, string> = { venue: '会場で参加', online: 'オンラインで参加' };
const interestLabel: Record<string, string> = {
  design: 'デザインの決め方',
  a11y: 'アクセシビリティ',
  tokens: 'デザイントークン',
  rsc: 'Server Components',
};
/** 使っている技術の候補。候補にないものも打って足せる */
const techs = ['React', 'Vue', 'Svelte', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Figma'].map(
  (t) => ({ label: t, value: t })
);

const prefectures = [
  { value: 'hokkaido', label: '北海道' },
  { value: 'miyagi', label: '宮城県' },
  { value: 'tokyo', label: '東京都' },
  { value: 'kanagawa', label: '神奈川県' },
  { value: 'aichi', label: '愛知県' },
  { value: 'kyoto', label: '京都府' },
  { value: 'osaka', label: '大阪府' },
  { value: 'hiroshima', label: '広島県' },
  { value: 'fukuoka', label: '福岡県' },
  { value: 'okinawa', label: '沖縄県' },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (!values.name) errors.name = '名前を入力してください';
  if (!values.email) errors.email = 'メールアドレスを入力してください';
  else if (!emailPattern.test(values.email)) errors.email = 'メールアドレスの形が正しくありません';
  if (!values.attend) errors.attend = '参加のしかたを選んでください';
  if (values.attend === 'venue' && !values.prefecture)
    errors.prefecture = '会場で参加するときは、住んでいる都道府県を選んでください';
  if (!values.terms) errors.terms = '参加の決まりへの同意が必要です';
  return errors;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface FormArgs {
  requiredMark: RequiredMark;
  optionalMark: OptionalMark;
  errorSummary: boolean;
  captionPlacement: CaptionPlacement;
}

function InputStep({
  values,
  setValues,
  initialErrors,
  resubmit,
  args,
  onNext,
}: {
  values: Values;
  setValues: (next: Values) => void;
  initialErrors: boolean;
  resubmit: boolean;
  args: FormArgs;
  onNext: () => void;
}) {
  const [errors, setErrors] = useState<Errors>({});
  const set = <K extends keyof Values>(key: K, value: Values[K]) =>
    setValues({ ...values, [key]: value });

  // 検証のエラーは、値を入れたうえで実際に送って出す（エラーの一覧は、送ったときに作られる）
  // 一覧の入り切りを変えたときも、送り直して出し直す
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (initialErrors) formRef.current?.requestSubmit();
  }, [initialErrors, resubmit]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validate(values);
    setErrors(next);
    if (Object.keys(next).length === 0) onNext();
  };

  return (
    <Form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      showErrorSummary={args.errorSummary}
      requiredMark={args.requiredMark}
      optionalMark={args.optionalMark}
      className="flex flex-col gap-6"
    >
      <TextField
        label="名前"
        required
        autoComplete="name"
        caption="名札に書く名前です。ニックネームでも構いません"
        captionPlacement={args.captionPlacement}
        value={values.name}
        onChange={(e) => set('name', e.target.value)}
        errorText={errors.name}
      />
      <TextField
        label="メールアドレス"
        type="email"
        required
        autoComplete="email"
        caption="参加の案内を送ります"
        captionPlacement={args.captionPlacement}
        value={values.email}
        onChange={(e) => set('email', e.target.value)}
        errorText={errors.email}
      />
      <RadioGroup
        label="参加のしかた"
        required
        value={values.attend}
        onValueChange={(value) => set('attend', value as string)}
        errorText={errors.attend}
      >
        <Radio value="venue" label="会場で参加" caption="東京・渋谷の会場です。定員は 40 人" />
        <Radio value="online" label="オンラインで参加" caption="配信の URL を前の日に送ります" />
      </RadioGroup>
      <Combobox
        label="住んでいる都道府県"
        caption="会場で参加するときだけ使います。近くでの開催を決める参考にします"
        captionPlacement={args.captionPlacement}
        items={prefectures}
        placeholder="打って探す"
        emptyText="当てはまる都道府県がありません"
        value={values.prefecture}
        onValueChange={(value) => set('prefecture', value)}
        errorText={errors.prefecture}
      />
      <NumberField
        label="参加する人数"
        suffix="人"
        caption="ご自身を含めて、5 人まで"
        captionPlacement={args.captionPlacement}
        min={1}
        max={5}
        value={values.people}
        onValueChange={(value) => set('people', value)}
      />
      <CheckboxGroup
        label="聞きたい話"
        caption="当日の話の配分を決める参考にします"
        captionPlacement={args.captionPlacement}
        value={values.interests}
        onValueChange={(value) => set('interests', value)}
      >
        {Object.entries(interestLabel).map(([value, label]) => (
          <Checkbox key={value} value={value} label={label} />
        ))}
      </CheckboxGroup>
      <TagsInput
        label="使っている技術"
        caption="5 つまで。候補にないものは、打って Enter で足せます"
        captionPlacement={args.captionPlacement}
        items={techs}
        placeholder="打って探す"
        emptyText="候補にありません。Enter でそのまま足せます"
        max={5}
        value={values.tech}
        onValueChange={(value) => set('tech', value)}
      />
      <Textarea
        label="質問・伝えたいこと"
        caption="400 文字まで"
        captionPlacement={args.captionPlacement}
        minRows={3}
        value={values.question}
        onChange={(e) => set('question', e.target.value)}
      />
      <Checkbox
        required
        checked={values.terms}
        onCheckedChange={(checked) => set('terms', checked)}
        label={
          <>
            <Link href="#rules">参加の決まり</Link>に同意する
          </>
        }
        errorText={errors.terms}
      />
      <div>
        <Button type="submit" color="primary">
          確認へ進む
        </Button>
      </div>
    </Form>
  );
}

function Summary({ values }: { values: Values }) {
  const prefecture = prefectures.find((p) => p.value === values.prefecture)?.label;
  return (
    <DescriptionList divider="line">
      <DescriptionItem term="名前">{values.name}</DescriptionItem>
      <DescriptionItem term="メールアドレス">{values.email}</DescriptionItem>
      <DescriptionItem term="参加のしかた">{attendLabel[values.attend]}</DescriptionItem>
      {values.attend === 'venue' && (
        <DescriptionItem term="都道府県">{prefecture ?? '—'}</DescriptionItem>
      )}
      <DescriptionItem term="人数">{values.people ?? 1} 人</DescriptionItem>
      <DescriptionItem term="聞きたい話">
        {values.interests.length > 0
          ? values.interests.map((i) => interestLabel[i]).join('、')
          : '—'}
      </DescriptionItem>
      <DescriptionItem term="使っている技術">
        {values.tech.length > 0 ? values.tech.join('、') : '—'}
      </DescriptionItem>
      <DescriptionItem term="質問">{values.question || '—'}</DescriptionItem>
    </DescriptionList>
  );
}

function ApplyScreen({ scenario, args }: { scenario: Scenario; args: FormArgs }) {
  const initialStep: Step =
    scenario === 'done'
      ? 'done'
      : scenario === 'confirm' || scenario === 'submitting'
        ? 'confirm'
        : 'input';
  const [step, setStep] = useState<Step>(initialStep);
  const [values, setValues] = useState<Values>(() => {
    if (scenario === 'empty') return empty;
    return scenario === 'invalid' ? wrong : sample;
  });
  const [submitting, setSubmitting] = useState(scenario === 'submitting');

  const submit = async () => {
    setSubmitting(true);
    await wait(1200);
    setSubmitting(false);
    setStep('done');
  };

  const stepLabel = { input: '1. 入力', confirm: '2. 確認', done: '3. 完了' } as const;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Text size="sm" variant="subtle">
          {(['input', 'confirm', 'done'] as const).map((s, i) => (
            <span key={s}>
              {i > 0 && ' → '}
              <span className={s === step ? 'font-bold text-fg' : undefined}>{stepLabel[s]}</span>
            </span>
          ))}
        </Text>
        <Heading level={1} size={2}>
          UI 勉強会 #3 に申し込む
        </Heading>
        <Text variant="muted">
          2026 年 10 月 18 日（土）14:00〜17:00。
          <br />
          部品の見た目を、候補を並べて決める話をします。
        </Text>
      </div>

      {step === 'input' && (
        <InputStep
          values={values}
          setValues={setValues}
          initialErrors={scenario === 'invalid'}
          resubmit={args.errorSummary}
          args={args}
          onNext={() => setStep('confirm')}
        />
      )}

      {step === 'confirm' && (
        <div className="flex flex-col gap-6">
          <Notice status="info" title="まだ申し込みは終わっていません">
            内容を確かめて、「申し込む」を押してください。
          </Notice>
          <Summary values={values} />
          <div className="flex flex-wrap gap-2">
            <Button color="primary" loading={submitting} onClick={submit}>
              申し込む
            </Button>
            <Button variant="outline" disabled={submitting} onClick={() => setStep('input')}>
              入力に戻る
            </Button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="flex flex-col gap-6">
          <Notice status="success" title="申し込みました">
            {values.email} に、受付のメールを送りました。当日の案内は前の日に届きます。
          </Notice>
          <Summary values={values} />
          <Text>
            <Link href="#events">ほかの勉強会を見る</Link>
          </Text>
        </div>
      )}
    </div>
  );
}

export const example: Example = {
  slug: 'apply',
  title: '申込フォーム',
  description: '勉強会の申し込み。入力・確認・完了の 3 つの画面と、必須と任意の印を確かめます。',
  initialLabel: '入力前',
  presets: [
    { label: '検証のエラー', args: { scenario: 'invalid' } },
    { label: '確認', args: { scenario: 'confirm' } },
    { label: '送信中', args: { scenario: 'submitting' } },
    { label: '完了', args: { scenario: 'done' } },
  ],
  controls: [
    {
      name: 'requiredMark',
      label: '必須の印',
      type: 'radio',
      options: [
        { value: 'tag', label: '「必須」の札', caption: 'ラベルの横に、小さな札を付けます' },
        { value: 'asterisk', label: '＊', caption: 'ラベルの横に、＊を付けます' },
        {
          value: 'none',
          label: 'なし',
          caption: '必須には付けません。任意の印と組み合わせて、任意の側にだけ付けるときに使います',
        },
      ],
    },
    {
      name: 'optionalMark',
      label: '任意の印',
      type: 'radio',
      options: [
        { value: 'none', label: 'なし' },
        { value: 'text', label: '「任意」の文字', caption: 'ラベルの横に、薄い文字で付けます' },
      ],
    },
    { name: 'errorSummary', label: 'エラーの一覧を出す', type: 'switch' },
    {
      name: 'captionPlacement',
      label: 'キャプションの位置',
      type: 'radio',
      options: [
        { value: 'top', label: 'ラベルの下' },
        { value: 'bottom', label: '本体の下' },
      ],
    },
  ],
  defaults: {
    scenario: 'empty',
    requiredMark: 'tag',
    optionalMark: 'none',
    errorSummary: false,
    captionPlacement: 'top',
  },
  Screen: ({ args, density }) => (
    <SamplePage density={density} site={meetup} current="参加する" width="sm">
      <ApplyScreen
        scenario={args.scenario as Scenario}
        args={{
          requiredMark: args.requiredMark as RequiredMark,
          optionalMark: args.optionalMark as OptionalMark,
          errorSummary: args.errorSummary as boolean,
          captionPlacement: args.captionPlacement as CaptionPlacement,
        }}
      />
    </SamplePage>
  ),
};
