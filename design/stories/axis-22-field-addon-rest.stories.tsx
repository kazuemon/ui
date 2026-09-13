import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useId, useState } from 'react';

import { FieldAddon, FieldAddonButton } from '../../src/components/FieldAddon';
import type { AddonShape } from '../../src/components/field-addon-context';
import { EyeIcon, EyeSlashIcon } from '../../src/components/icons';
import { TextField } from '../../src/components/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 22: prefix・suffix の残り（原則8）。形と色は ADR-0035 で決まっている
// 2つの問いを、別のストーリーで比べる
//   フォーカスの線: suffix のボタンにキーボードでフォーカスしたとき、欄の青い枠線とボタンの線が両方出る
//   prefix の読み上げ: 文字の prefix（「https://」）が、入力欄の名前に含まれない
// どちらも A に決まり、部品に足した（ADR-0040）。A の行は部品のまま描き、ほかの案は、この中の CSS と props で比べたときの形に戻す

// ── 1. suffix のボタンのフォーカス ────────────────────────
// 案は、ボタンにキーボードでフォーカスしている（:focus-visible）ときだけ見た目を変える
// 入力欄にフォーカスしたときと、マウスで押したときは、どの案も今と同じ

const focusCandidates: Candidate[] = [
  {
    id: '現行版',
    name: '両方出す',
    intent:
      '欄の青い枠線（原則2）と、ボタンの外側の線（ADR-0031）が両方出る。端に接する形では、線が欄の外にはみ出し、枠線と2重になる。浮かせる形では、線が枠線にくっついて太く見える。',
    spec: [
      ['欄の枠線', '出る（青）'],
      ['ボタン', '2px の青い線を外に 2px 離す'],
      ['線の比', '白地 4.53:1、欄の塗り 4.10:1'],
    ],
  },
  {
    id: 'A',
    name: '欄の枠線を消す',
    intent:
      'ボタンにいるあいだは欄の枠線を消し、ボタンの線だけにする。フォーカスの印が1つになる。エラーの赤い枠線は消さない。',
    spec: [
      ['欄の枠線', 'ボタンにいるあいだは消す'],
      ['ボタン', '2px の青い線を外に 2px 離す'],
      ['線の比', '白地 4.53:1、欄の塗り 4.10:1'],
    ],
  },
  {
    id: 'B',
    name: '線を塊の内側に',
    intent:
      '欄の枠線は出したまま、ボタンの線をグレーの塊の内側（縁から 2px）に描く。線が欄の外にはみ出さない。',
    spec: [
      ['欄の枠線', '出る（青）'],
      ['ボタン', '2px の青い線を塊の縁から 2px 内側に'],
      ['線の比', 'グレーの塊 3.52:1、エラーの塊 3.55:1'],
    ],
  },
  {
    id: 'C',
    name: '枠線で塊を囲む',
    intent:
      '線は足さず、欄の枠線をボタンの周りにも回して、塊を4辺とも青い線で囲む。端に接する形では、変わるのは入力側の1本だけなので、いちばん控えめ。浮かせる形では、塊の縁に線が付く。',
    spec: [
      ['欄の枠線', '出る（青）'],
      ['ボタン', '塊の4辺を 2px の青い線で囲む'],
      ['線の比', '欄の塗り 4.10:1、グレーの塊 3.52:1'],
      ['ボタンの幅', '線の場所をふだんも空けるので、端に接する形で 2px、浮かせる形で 4px 広い'],
    ],
  },
  {
    id: 'D',
    name: 'ボタンを青く塗る',
    intent:
      '線は足さず、ボタンを青く塗って文字を白にする。いちばん目立つが、塗りで状態を表すので原則2（状態は枠線で表す）の例外になる。',
    spec: [
      ['欄の枠線', '出る（青）'],
      ['ボタン', '塗り #2474DF、文字は白'],
      ['比', '白い文字 4.53:1、グレーの塊との差 3.52:1'],
    ],
  },
];

const focusColumns: Column[] = [
  {
    label: '入力欄にフォーカス',
    note: 'どの案も同じです。入力欄を押して Tab キーを押すと、実際にボタンへ動かせます',
    preview: 'input',
  },
  {
    label: 'ボタンにフォーカス（端に接する）',
    note: '上の2つが通常、いちばん下がエラー。キーボードで動かした見た目を固定しています',
    preview: 'button',
  },
  {
    label: 'ボタンにフォーカス（内側に浮かせる）',
    note: 'addonShape="floating"。並びは左の列と同じ',
    preview: 'button',
  },
];

// ボタンにキーボードでフォーカスしているとき。状態を固定した列では、pseudo-states が付ける class でも効かせる
const buttonFocus = '[data-slot="field-addon-button"]:is(:focus-visible, .pseudo-focus-visible)';
const row = (id: string) => `[data-axis22="focus-${id}"]`;
const fade = 'var(--focus-ring-duration) var(--ease-press)';
const focusCss = `
/* A は部品のまま（ボタンにいるあいだは、欄の枠線を消す — ADR-0040）。ほかの案は、比べたときのとおり欄の枠線を出す */
[data-axis22^="focus-"]:not(${row('A')}) [data-slot="control"]:not([data-invalid] *):has(${buttonFocus}) { border-color: var(--color-focus); }
/* B: ボタンの線を、グレーの塊の縁から 2px 内側に描く。端に接する形では、塊が欄の枠線の幅（--addon-edge）を含むので、その分も内側へ。
   出る前も同じ位置に置き、線は動かさない（ADR-0031） */
${row('B')} [data-slot="field-addon-button"] { outline-offset: calc(-4px - var(--addon-edge)); }
/* C: 線は描かず、塊を4辺とも青い線で囲む。入力側（と、浮かせる形の4辺）の線の場所は、ふだんも透明で確保しておく */
${row('C')} [data-slot="field-addon-button"] {
  border-inline-start: var(--field-border-width) solid transparent;
  transition: background-color var(--duration-press) var(--ease-press), border-color ${fade};
}
${row('C')} [data-addon-shape="floating"] [data-slot="field-addon-button"] { border: var(--field-border-width) solid transparent; }
${row('C')} ${buttonFocus} { border-color: var(--color-focus-ring); outline-style: none; }
/* D: 線は描かず、ボタンを青く塗って文字を白にする */
${row('D')} [data-slot="field-addon-button"] {
  transition: background-color ${fade}, color ${fade};
}
${row('D')} ${buttonFocus} { background-color: var(--color-primary); color: var(--color-on-primary); outline-style: none; }
@media (prefers-reduced-motion: reduce) {
  [data-axis22] [data-slot="field-addon-button"] { transition: none; }
}`;

interface PasswordProps {
  iconOnly?: boolean;
  error?: boolean;
  shape?: AddonShape;
}

// パスワードの表示・非表示。iconOnly は目のアイコンだけのボタン（アイコン単体なので線は Bold — ADR-0018）
const Password = ({ iconOnly, error, shape }: PasswordProps) => {
  const [visible, setVisible] = useState(false);
  const Eye = visible ? EyeSlashIcon : EyeIcon;
  return (
    <TextField
      label={iconOnly ? 'パスワード（確認用）' : 'パスワード'}
      type={visible ? 'text' : 'password'}
      defaultValue={error ? 'kazu' : 'kazuemon2026'}
      autoComplete="off"
      error={error ? '8文字以上にしてください' : undefined}
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

const FocusCell = ({ column, candidate }: { column: Column; candidate: Candidate }) => {
  const shape: AddonShape = column.label.includes('浮かせる') ? 'floating' : 'attached';
  return (
    <div data-axis22={`focus-${candidate.id}`} className="flex flex-col gap-5">
      <Password shape={shape} />
      <Password iconOnly shape={shape} />
      {column.preview === 'button' && <Password error shape={shape} />}
    </div>
  );
};

// ── 2. 文字の prefix の読み上げ ───────────────────────────
// 見た目の差はほとんどないので、各行に、読み上げに渡る情報（アクセシビリティツリー）を測った値を並べる

type NameVariant = 'current' | 'described' | 'labelled' | 'hidden-text' | 'visible-label';

interface Heard {
  /** 入力欄の名前（accessible name） */
  name: string;
  /** 入力欄の説明（accessible description） */
  description: string;
  /** 値 */
  value: string;
}

interface NameCandidate extends Candidate {
  variant: NameVariant;
  /** 前から順に読むとき、prefix の文字を入力欄とは別に読むか（アクセシビリティツリーに文字が残るか） */
  readAlone: string;
}

const LABEL = 'サイトの URL';
const PREFIX = 'https://';
const SUFFIX_NOTE = '（https:// 以降）';
const CAPTION = 'プロフィールに表示します';
const ERROR_TEXT = 'URL の形が正しくありません';
const VALUE = 'k6n.jp';
const ERROR_VALUE = 'k6n jp';

// 読み上げに渡る名前と説明。Chrome の CDP（Accessibility.getPartialAXTree）で、このストーリーの入力欄を測った値（2026-09-13）
// C の名前の「URL」と「（」の間の空白は、画面に出ない文（sr-only）の前に Chrome が入れるもの
// 値は、どの案でも入力した文字（VALUE・ERROR_VALUE）だけで、https:// は入らない
const heard: Record<NameVariant, { name: string; normal: string; error: string }> = {
  current: { name: LABEL, normal: CAPTION, error: ERROR_TEXT },
  described: { name: LABEL, normal: `${PREFIX} ${CAPTION}`, error: `${PREFIX} ${ERROR_TEXT}` },
  labelled: { name: `${LABEL} ${PREFIX}`, normal: CAPTION, error: ERROR_TEXT },
  'hidden-text': { name: `${LABEL} ${SUFFIX_NOTE}`, normal: CAPTION, error: ERROR_TEXT },
  'visible-label': { name: `${LABEL}${SUFFIX_NOTE}`, normal: CAPTION, error: ERROR_TEXT },
};

const nameCandidates: NameCandidate[] = [
  {
    id: '現行版',
    variant: 'current',
    name: 'つながない',
    intent:
      'いまのまま。入力欄の名前は「サイトの URL」だけで、https:// が付いていることは、Tab キーで入ったときには伝わらない。',
    spec: [
      ['prefix', 'ただの文字'],
      ['入力欄とのつながり', 'なし'],
    ],
    readAlone: 'https:// を読む',
  },
  {
    id: 'A',
    variant: 'described',
    name: '説明につなぐ',
    intent:
      'prefix を入力欄の説明につなぐ（aria-describedby）。名前は変わらず、説明の先頭で https:// が読まれる。比べたあとで、prefix の文字を読み上げから外した（aria-hidden）。比べたときは、前から順に読むと https:// を2回読んでいた。',
    spec: [
      ['prefix', '読み上げから外す（比べたあとに足した）'],
      ['入力欄とのつながり', '説明（prefix → キャプション）'],
    ],
    readAlone: '読まない',
  },
  {
    id: 'B',
    variant: 'labelled',
    name: '名前につなぐ',
    intent:
      '入力欄の名前を「ラベル＋prefix」にする（aria-labelledby）。見た目の並び（ラベル → https:// → 値）のとおりに読まれる。',
    spec: [
      ['prefix', 'ただの文字'],
      ['入力欄とのつながり', '名前（ラベル → prefix）'],
    ],
    readAlone: 'https:// を読む（名前と2回）',
  },
  {
    id: 'C',
    variant: 'hidden-text',
    name: '読み上げ用の文を足す',
    intent:
      '見た目は現行版のまま。ラベルに、画面には出ない文（「（https:// 以降）」）を足し、prefix の文字は読み上げから外す（aria-hidden）。',
    spec: [
      ['prefix', '読み上げから外す'],
      ['ラベル', '画面に出ない文を足す'],
    ],
    readAlone: '読まない',
  },
  {
    id: 'D',
    variant: 'visible-label',
    name: 'ラベルに書く',
    intent:
      'C と同じことを、見える文字でラベルに書く（「サイトの URL（https:// 以降）」）。prefix の文字は読み上げから外す。見た目が変わるのはこの案だけ。',
    spec: [
      ['prefix', '読み上げから外す'],
      ['ラベル', '「（https:// 以降）」を見える文字で足す'],
    ],
    readAlone: '読まない',
  },
];

const nameColumns: Column[] = [
  {
    label: '通常',
    note: '下の名前・説明・値は、Tab キーで入力欄に入ったときに読み上げに渡る情報です',
  },
  { label: 'エラーのとき', note: 'エラーの文が、キャプションの代わりに説明になります' },
];

// 案ごとに、ラベル・prefix・入力欄の aria-* を組み立てる
// A は部品のまま。部品が prefix を説明につなぎ、文字を読み上げから外す（ADR-0040）。キャプション（エラーの文）の id は Base UI が後ろに足す
// ほかの案は、prefix の FieldAddon に aria-hidden を渡して、部品がつながないようにする（現行版・B は false で読み上げに残し、C・D は true で外す）
const UrlField = ({ variant, error }: { variant: NameVariant; error?: boolean }) => {
  const id = useId();
  const labelId = `${id}label`;
  const prefixId = `${id}prefix`;
  const message = error ? ERROR_TEXT : CAPTION;
  const field = {
    defaultValue: error ? ERROR_VALUE : VALUE,
    caption: error ? undefined : message,
    error: error ? message : undefined,
  };
  if (variant === 'described') return <TextField label={LABEL} prefix={PREFIX} {...field} />;
  const hidePrefix = variant === 'hidden-text' || variant === 'visible-label';
  let label: ReactNode = LABEL;
  if (variant === 'labelled') label = <span id={labelId}>{LABEL}</span>;
  // sr-only は絶対配置なので、relative の中に置く。置かないと比較の横スクロールの外に出て、狭い画面でページが横に伸びる
  if (variant === 'hidden-text')
    label = (
      <span className="relative">
        {LABEL}
        <span className="sr-only">{SUFFIX_NOTE}</span>
      </span>
    );
  if (variant === 'visible-label') label = `${LABEL}${SUFFIX_NOTE}`;
  return (
    <TextField
      label={label}
      prefix={
        <FieldAddon id={prefixId} aria-hidden={hidePrefix}>
          {PREFIX}
        </FieldAddon>
      }
      {...field}
      aria-labelledby={variant === 'labelled' ? `${labelId} ${prefixId}` : undefined}
    />
  );
};

const HeardList = ({ info, readAlone }: { info: Heard; readAlone: string }) => (
  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-l-2 border-line pl-3 text-xs leading-5">
    <dt className="text-fg-subtle">名前</dt>
    <dd className="font-bold">{info.name}</dd>
    <dt className="text-fg-subtle">説明</dt>
    <dd>{info.description || '（なし）'}</dd>
    <dt className="text-fg-subtle">値</dt>
    <dd>{info.value}</dd>
    <dt className="text-fg-subtle">順に読むと</dt>
    <dd>{readAlone}</dd>
  </dl>
);

const NameCell = ({ column, candidate }: { column: Column; candidate: NameCandidate }) => {
  const error = column.label === 'エラーのとき';
  return (
    <div data-axis22={`name-${candidate.id}`} className="flex flex-col gap-4">
      <UrlField variant={candidate.variant} error={error} />
      <HeardList
        info={{
          name: heard[candidate.variant].name,
          description: heard[candidate.variant][error ? 'error' : 'normal'],
          value: error ? ERROR_VALUE : VALUE,
        }}
        readAlone={candidate.readAlone}
      />
    </div>
  );
};

// 文字の suffix（「円」など）の読み上げ。比べたあとに、prefix と同じ仕組みでつないだものを測るために足した（ADR-0040 の追記）
// 比べた行（上の nameCandidates）は変えない
const SuffixExamples = () => (
  <section className="mx-6 flex flex-col gap-3 border-t border-line pt-6 pb-8">
    <h2 className="text-sm font-bold">文字の suffix（比べたあとに測った）</h2>
    <p className="max-w-[68ch] text-xs leading-5 text-fg-muted">
      文字の suffix も、prefix
      と同じく入力欄の説明につなぎ、見えている文字は読み上げから外します。説明は prefix → suffix →
      キャプション → エラーの文の順です。下の名前・説明・値は、Chrome で測った値です（2026-09-13）。
    </p>
    <div className="grid gap-8 md:grid-cols-2">
      <div data-axis22="suffix-text" className="flex flex-col gap-4">
        <TextField
          label="月の予算"
          suffix="円"
          caption="税込みで入れてください"
          defaultValue="30000"
          inputMode="numeric"
        />
        <HeardList
          info={{ name: '月の予算', description: '円 税込みで入れてください', value: '30000' }}
          readAlone="読まない"
        />
      </div>
      <div data-axis22="suffix-both" className="flex flex-col gap-4">
        <TextField
          label="サブドメイン"
          prefix="https://"
          suffix=".k6n.jp"
          caption="あとから変えられません"
          error="使えない文字が入っています"
          defaultValue="my site"
        />
        <HeardList
          info={{
            name: 'サブドメイン',
            description: 'https:// .k6n.jp あとから変えられません 使えない文字が入っています',
            value: 'my site',
          }}
          readAlone="読まない"
        />
      </div>
    </div>
  </section>
);

// ── ストーリー ────────────────────────────────────────

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/22 prefix・suffix の残り',
  id: 'design-review-22-field-addon-rest',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      focusWithin: [
        '[data-preview="input"] [data-slot="control"]',
        '[data-preview="button"] [data-slot="control"]',
      ],
      focusVisible: ['[data-preview="button"] [data-slot="field-addon-button"]'],
    },
  },
  args: { pick: '' },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const FocusRing: Story = {
  name: 'suffix のボタンのフォーカス',
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
  render: ({ pick }) => (
    <>
      <style>{focusCss}</style>
      <Comparison
        index={22}
        axis="prefix・suffix の残り: suffix のボタンのフォーカス"
        pick={pick}
        candidates={focusCandidates}
        columns={focusColumns}
        renderCell={(column, candidate) => <FocusCell column={column} candidate={candidate} />}
      >
        <p>
          ADR-0035 で残した1つめです。suffix
          のボタン（パスワードの表示・非表示）にキーボードでフォーカスすると、いまは欄の青い枠線（原則2）と、ボタンのフォーカスの線（ADR-0031）が両方出ます。
        </p>
        <p>
          候補は、ボタンにキーボードでフォーカスしたときだけ見た目を変えます。入力欄にフォーカスしたときと、マウスで目を押したときは、どの案も今と同じです。どの案でも、いまどこにいるかが見分けられるようにしています（WCAG
          2.4.7）。
        </p>
        <p>
          見るところは3つです。ボタンにいることがすぐ分かるか。欄の枠線とぶつかって見えないか。エラーの欄と、内側に浮かせる形でも崩れないか。
        </p>
        <p>
          いちばん左の列は、入力欄を押してから Tab
          キーを押すと、実際にボタンへフォーカスが動きます。判断の基準（軽い・やわらかい・整然・人懐っこい）に最も近い案を1つ選び、一言添えてください。
        </p>
      </Comparison>
    </>
  ),
};

export const PrefixName: Story = {
  name: '文字の prefix の読み上げ',
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
  render: ({ pick }) => (
    <div className="bg-bg text-fg">
      <Comparison
        index={22}
        axis="prefix・suffix の残り: 文字の prefix の読み上げ"
        pick={pick}
        candidates={nameCandidates}
        columns={nameColumns}
        renderCell={(column, candidate) => {
          const found = nameCandidates.find((c) => c.id === candidate.id);
          return found && <NameCell column={column} candidate={found} />;
        }}
      >
        <p>
          ADR-0035 で残した2つめです。文字の
          prefix（「https://」）は、入力欄の名前に含まれていません。Tab
          キーで入ると、読み上げでは「サイトの URL」としか聞こえず、https://
          がすでに付いていることが伝わりません。
        </p>
        <p>
          見た目はほとんど変わらないので、各行の下に、Chrome
          が読み上げソフトに渡す情報を測った値を並べています。名前は入力欄に入ったときに最初に読まれ、説明はそのあとに読まれます（読むかどうかと順番は、読み上げソフトによります）。「順に読むと」は、ページを前から順に読んだときに、prefix
          の文字を入力欄とは別に読むかです。
        </p>
        <p>
          値は、入力した文字だけです。どの案でも https://
          は値に入らないので、読まれる値も送られる値も「k6n.jp」のままです。
        </p>
        <p>
          Select の prefix（東京都）は、本体のボタンの中にあるので、いまも値として「東京都
          足立区」と読まれます（測った値。名前は「住所」）。この比較は TextField の文字の prefix
          だけを扱います。
        </p>
        <p>どの案がよいか、1つ選んで一言添えてください。</p>
      </Comparison>
      <SuffixExamples />
    </div>
  ),
};
