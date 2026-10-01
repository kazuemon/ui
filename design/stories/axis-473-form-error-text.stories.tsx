import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useEffect, useRef } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Form, type FormErrors } from '../../src/components/form/Form';
import { Notice } from '../../src/components/notice/Notice';
import { TextField } from '../../src/components/text-field/TextField';
import { statePseudo } from '../../src/stories/story-states';

// 軸 473: Form のどの欄にも結び付かないエラー（formErrorText）の置き場と、欄のエラーの一覧との並べ方
const meta = {
  title: 'Design Review/473 どの欄にも結び付かないエラー',
  id: 'design-review-473-form-error-text',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({ focusVisible: '[data-slot="form-error-summary"]' }),
  },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const formError = 'このメールアドレスはすでに登録されています。サインインしてください。';
const fieldErrors: FormErrors = {
  name: '名前が入っていません',
  password: '8 文字以上にしてください',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'Form の外に自分で置く',
    intent:
      'いまは formErrorText がないので、アプリがお知らせを Form の上に自分で置く。送信してもフォーカスはお知らせへ移らない（エラーの一覧があれば一覧へ、なければ最初の欄へ移る）',
    spec: [
      ['置き場', 'アプリが決める'],
      ['フォーカス', '移らない'],
      ['一覧と両方', '2 つの箱（間はアプリが決める）'],
    ],
  },
  {
    id: 'A',
    name: '一覧の上に別のお知らせ',
    intent:
      'Form がフォームの上に危険のお知らせを出し、送信後にフォーカスを移す。エラーの一覧があるときは、その上に別のお知らせとして縦に並べ、2 つをまとめてフォーカスする。間は欄の行の間と同じ',
    spec: [
      ['置き場', 'フォームの上（一覧の上）'],
      ['フォーカス', 'お知らせ（一覧と両方のときは 2 つまとめて）'],
      ['一覧と両方', '2 つの箱。間は欄の行の間（8px）'],
    ],
    tokens: {
      '--form-error-separate': 'flex',
      '--form-error-in-summary': 'none',
      '--form-error-gap': 'var(--spacing-field-gap)',
    },
  },
  {
    id: 'B',
    name: '一覧の本文の先頭に入れる',
    intent:
      '一覧がないときは A と同じ。一覧と両方あるときは 1 つのお知らせにまとめ、一覧の題のすぐ下に文を置き、その下に欄へのリンクを並べる。危険の箱が 1 つで済む',
    spec: [
      ['置き場', 'フォームの上（一覧の中）'],
      ['フォーカス', 'お知らせ'],
      ['一覧と両方', '1 つの箱。題 → 文 → 欄へのリンク'],
    ],
    tokens: {
      '--form-error-separate': 'none',
      '--form-error-in-summary': 'block',
      '--form-error-gap': 'var(--spacing-field-gap)',
    },
  },
];

const columns: Column[] = [
  { label: '欄のエラーなし', note: 'formErrorText だけ' },
  { label: '一覧と両方', note: 'showErrorSummary。欄のエラー 2 つ' },
  { label: '一覧なし・欄のエラーあり', note: '欄のエラーは欄の下だけ' },
  { label: 'フォーカス（キーボード）', note: '一覧と両方', preview: 'focus' },
];

// 送信したあとの形を見せる。描いたあとに 1 回送り、移ったフォーカスは外す（フォーカスの列は線を固定して見せる）
function Submitted({
  showErrorSummary,
  errors,
  formErrorText,
  outside,
}: {
  showErrorSummary?: boolean;
  errors?: FormErrors;
  formErrorText?: ReactNode;
  /** 現行版: アプリが Form の外に置くお知らせ */
  outside?: ReactNode;
}) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    queueMicrotask(() => {
      ref.current?.requestSubmit();
      requestAnimationFrame(() => {
        const active = document.activeElement;
        if (active instanceof HTMLElement && ref.current?.parentElement?.contains(active))
          active.blur();
      });
    });
  }, []);
  return (
    <div className="flex w-[300px] flex-col gap-(--spacing-field-gap)">
      {outside}
      <Form
        ref={ref}
        className="flex flex-col gap-4"
        showErrorSummary={showErrorSummary}
        errors={errors}
        formErrorText={formErrorText}
        onSubmit={(event) => event.preventDefault()}
      >
        <TextField name="name" label="名前" />
        <TextField name="email" label="メールアドレス" defaultValue="kazuemon@example.com" />
        <TextField name="password" label="パスワード" type="password" />
        <div>
          <Button type="submit" color="primary">
            登録する
          </Button>
        </div>
      </Form>
    </div>
  );
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={473}
      axis="どの欄にも結び付かないエラー"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const current = candidate.id === '現行版';
        const outside = current ? (
          <Notice status="danger" live={false}>
            {formError}
          </Notice>
        ) : undefined;
        const props = {
          outside,
          formErrorText: current ? undefined : formError,
        };
        switch (column.label) {
          case '欄のエラーなし':
            return <Submitted {...props} />;
          case '一覧なし・欄のエラーあり':
            return <Submitted {...props} errors={fieldErrors} />;
          default:
            return <Submitted {...props} errors={fieldErrors} showErrorSummary />;
        }
      }}
    >
      <p>
        Form
        に、どの欄にも結び付かないエラー（サーバーが返した「すでに登録されています」「通信できませんでした」など）を出す
        formErrorText を足しました。フォームの上に危険のお知らせとして出し、送信したあと（submitting
        を戻したあとも）、そのお知らせへフォーカスを移します。欄のエラーがあっても、先にこのお知らせへ移します。
      </p>
      <p>
        選ぶのは、欄のエラーの一覧（showErrorSummary）と両方あるときの並べ方です。2
        つのお知らせを縦に並べるか、一覧の中にまとめるかを教えてください。一覧がないときは、どちらも同じ形です。
      </p>
    </Comparison>
  ),
};
