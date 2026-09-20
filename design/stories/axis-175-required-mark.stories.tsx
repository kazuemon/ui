import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Checkbox } from '../../src/components/checkbox/Checkbox';
import { CheckboxGroup } from '../../src/components/checkbox/CheckboxGroup';
import { Switch } from '../../src/components/switch/Switch';
import { TextField } from '../../src/components/text-field/TextField';

// 後半の軸 175: 必須の印を部品で持つか、持つならどう見せるか
//   印を出す props はまだありません。候補は、このストーリーの中でラベルの後ろに要素を足して、近い見た目を作っています
//   （部品のコードは変えていません）。決まったら、props（必須の印の出し方）として部品に入れます

/** ラベルの後ろに足す印 */
type MarkKind = 'none' | 'asterisk' | 'pill' | 'optional';

interface Marks {
  /** 必須の欄に出す印 */
  required: MarkKind;
  /** 必須でない欄に出す印 */
  optional: MarkKind;
}

const marks: Record<string, Marks> = {
  現行版: { required: 'none', optional: 'none' },
  A: { required: 'asterisk', optional: 'none' },
  B: { required: 'pill', optional: 'none' },
  C: { required: 'none', optional: 'optional' },
  D: { required: 'asterisk', optional: 'optional' },
};

/**
 * 印そのもの。どれも aria-hidden で、読み上げには渡しません（必須は欄の required が伝えます）
 * 色は原則6（危険は赤）と原則12（文字には前景用の値）に合わせ、赤は --color-fg-danger、グレーはキャプションと同じ --color-fg-subtle です
 */
function Mark({ kind }: { kind: MarkKind }) {
  switch (kind) {
    case 'asterisk':
      // ラベルと同じ大きさ・太さ（ラベルから継ぐ）。間は 4px
      return (
        <span aria-hidden className="ml-1 text-fg-danger">
          *
        </span>
      );
    case 'pill':
      // Tag の見た目に寄せた pill（淡い赤の面に濃い赤の文字）。文字はキャプションと同じ 12px
      return (
        <span
          aria-hidden
          className="ml-2 inline-flex items-center rounded-pill bg-danger-subtle px-2 py-0.5 text-(length:--text-caption) leading-(--leading-caption) font-bold whitespace-nowrap text-fg-danger"
        >
          必須
        </span>
      );
    case 'optional':
      // 面を持たない文字だけの印。太字にせず、キャプションと同じグレーにする
      return (
        <span
          aria-hidden
          className="ml-2 text-(length:--text-caption) leading-(--leading-caption) font-normal whitespace-nowrap text-fg-subtle"
        >
          任意
        </span>
      );
    default:
      return null;
  }
}

/** ラベルの文字の後ろに印を足す。折り返すときは、印は最後の行の文字の後ろに続く */
function withMark(label: ReactNode, kind: MarkKind) {
  return (
    <>
      {label}
      <Mark kind={kind} />
    </>
  );
}

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '印なし（文で伝える）',
    intent:
      'ラベルには何も足しません。必須かどうかは、フォームの見出し、欄の横の文、キャプションの文で伝えます。読み上げには、欄そのものの required が伝えます。印がないぶんラベルの行は静かですが、一覧の中でどれが必須かを目で拾えません。',
    spec: [
      ['印', 'なし'],
      ['伝え方', '見出し・横の文字・キャプションの文'],
      ['読み上げ', '欄の required（Checkbox は aria-required）'],
    ],
  },
  {
    id: 'A',
    name: 'ラベルの後ろに赤い「*」',
    intent:
      'ラベルの文字のすぐ後ろに、赤いアスタリスクを置きます。場所を取らず、行の高さも変わりません。記号の意味は画面のどこかで説明する前提になります。押せない欄でもラベルは薄くしないので、赤い印はそのまま残ります。',
    spec: [
      ['記号', '「*」（アスタリスク）'],
      ['色', '--color-fg-danger（白地 6.71）'],
      ['大きさ', 'ラベルと同じ（--text-label = 14px・太字）'],
      ['ラベルとの間', '4px（--spacing）'],
      ['読み上げ', '印は aria-hidden。欄の required で伝える'],
    ],
  },
  {
    id: 'B',
    name: 'ラベルの後ろに「必須」の pill',
    intent:
      '文字で「必須」と書いた小さな pill を、ラベルの後ろに置きます。Tag と同じ、淡い赤の面に濃い赤の文字です。記号の説明がいらず、離れていても読めますが、ラベルの行の背が少し高くなり、ラベルが長い欄では折り返しが増えます。',
    spec: [
      ['形', 'pill（--radius-pill）。余白は Tag と同じ 左右 8px・上下 2px'],
      ['面', '--color-danger-subtle'],
      ['文字', '--color-fg-danger（淡い面の上 5.93）。12px（--text-caption）・太字'],
      ['ラベルとの間', '8px（--spacing の 2 つ分）'],
      ['読み上げ', '印は aria-hidden。欄の required で伝える'],
    ],
  },
  {
    id: 'C',
    name: '任意の欄に淡いグレーの「任意」',
    intent:
      '必須の欄には何も出さず、必須でない欄のラベルの後ろに、淡いグレーで「任意」と出します。ほとんどの欄が必須のフォームでは、印の数が減り、赤も増えません。必須の欄は現行版と同じ見た目なので、任意の欄が 1 つもないフォームでは何も変わりません。',
    spec: [
      ['印', '文字だけ（pill にしない）'],
      ['文字', '「任意」。12px（--text-caption）・太字にしない'],
      ['色', '--color-fg-subtle（キャプションと同じグレー）'],
      ['ラベルとの間', '8px（--spacing の 2 つ分）'],
      ['出す先', '必須でない欄だけ。必須の欄には何も出さない'],
    ],
  },
  {
    id: 'D',
    name: 'A と C を両方持ち、使う側が選ぶ',
    intent:
      '必須の欄には A の赤い「*」、必須でない欄には C のグレーの「任意」を出します。どちらを使うかは、フォームごとに使う側が決めます（原則20）。1 つのフォームで両方を混ぜると印が増えるので、混ぜない使い方を勧める前提です。',
    spec: [
      ['必須の印', 'A と同じ 赤い「*」'],
      ['任意の印', 'C と同じ グレーの「任意」'],
      ['選び方', '欄ごとに使う側が決める'],
      ['読み上げ', 'どちらの印も aria-hidden'],
    ],
  },
];

const columns: Column[] = [
  { label: '通常', note: '必須の欄' },
  { label: '任意の欄', note: '必須でない欄。C・D はここに印が出ます' },
  { label: 'エラー' },
  { label: '押せない', note: 'ラベルは薄くしないので、印は残ります' },
  { label: '読み取り専用' },
  { label: 'キャプションつき' },
  {
    label: 'チェックボックスのグループ',
    note: '見出しに印。グループには読み上げの必須を付けられません',
  },
  { label: 'トグルの行', note: 'ラベルとトラックが 1 行' },
  { label: 'ラベルが折り返す', note: '幅を 220px に狭めて 2 行にしたところ' },
];

function renderCell(column: Column, candidate: Candidate) {
  const { required, optional } = marks[candidate.id];
  switch (column.label) {
    case '通常':
      return (
        <TextField
          label={withMark('メールアドレス', required)}
          placeholder="例: kazuemon@example.com"
          required
        />
      );
    case '任意の欄':
      return <TextField label={withMark('電話番号', optional)} placeholder="例: 09012345678" />;
    case 'エラー':
      return (
        <TextField
          label={withMark('メールアドレス', required)}
          placeholder="例: kazuemon@example.com"
          error="メールアドレスを入力してください"
          required
        />
      );
    case '押せない':
      return (
        <TextField
          label={withMark('メールアドレス', required)}
          defaultValue="kazuemon@example.com"
          disabled
          required
        />
      );
    case '読み取り専用':
      return (
        <TextField
          label={withMark('メールアドレス', required)}
          defaultValue="kazuemon@example.com"
          readOnly
          required
        />
      );
    case 'キャプションつき':
      return (
        <TextField
          label={withMark('表示名', required)}
          caption="あとから変えられます"
          placeholder="例: かずえもん"
          required
        />
      );
    case 'チェックボックスのグループ':
      return (
        <CheckboxGroup label={withMark('連絡の方法', required)} caption="1 つ以上選んでください">
          <Checkbox value="mail" label="メール" />
          <Checkbox value="tel" label="電話" />
        </CheckboxGroup>
      );
    case 'トグルの行':
      return <Switch label={withMark('二要素認証を使う', required)} required />;
    case 'ラベルが折り返す':
      return (
        <div className="max-w-[220px]">
          <TextField
            label={withMark('お住まいの都道府県と市区町村', required)}
            placeholder="例: 東京都千代田区"
            required
          />
        </div>
      );
    default:
      return null;
  }
}

const meta = {
  title: 'Design Review/175 必須の印',
  id: 'design-review-175-required-mark',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'B,A,C' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={175}
      axis="必須の印"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={renderCell}
    >
      <p>
        決定: 必須の印は、赤い pill
        の「必須」（B）を既定にします。アスタリスク（A）と、任意の欄にだけ「任意」と入れる形（C）も選べるようにします（ADR-0194）。
      </p>
      <p>
        これまで部品は必須の印を持たず、必須かどうかは見出し・欄の横の文字・キャプションの文で伝える前提でした。
        表示もできるようにしたいので、印の形を決めます。
      </p>
      <p>
        印を出す props
        はまだありません。この比較では、ストーリーの中でラベルの後ろに要素を足して、近い見た目を作っています
        （部品のコードは変えていません）。決まった形を、あとから部品の props として入れます。
      </p>
      <p>
        どの案でも、印は読み上げに渡しません（aria-hidden）。必須は欄そのもの（入力欄とトグルは
        required、1 つだけ置くチェックボックスは
        aria-required）が伝えるので、印まで読ませると二度伝わります。
        チェックボックスのグループには読み上げの必須を付けられないので、印を出しても、必須はキャプションの文で書く必要が残ります。
      </p>
      <p>
        ラベルが折り返す列では、印は最後の行の文字の後ろに続きます。押せない欄ではラベルを薄くしない決まりなので、赤い印も薄くなりません。
        印をラベルの中の文字として置くと、送信したときのエラーの一覧に出る欄の名前にも印の文字が入るため、採る案が決まったら、一覧では印を除きます。
      </p>
      <p>どれを既定にするか、ほかに選べるようにしたい案があれば教えてください。</p>
    </Comparison>
  ),
};
