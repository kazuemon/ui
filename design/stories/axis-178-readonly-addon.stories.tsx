import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import type { AddonShape } from '../../src/components/field-addon/field-addon-context';
import { FieldAddon, FieldAddonButton } from '../../src/components/field-addon/FieldAddon';
import { TextField } from '../../src/components/text-field/TextField';
import { CopyIcon, EyeIcon, EyeSlashIcon } from '../../src/internal/icons';
import { statePseudo } from '../../src/stories/story-states';

// 後半の軸 178: 読み取り専用の欄で、端に付くボタンをどう見せるか
//   原則 8 の 2 つの文が、読み取り専用の欄でぶつかる
//     「読み取り専用の欄は prefix・suffix も塗りを持たせない」（ADR-0170）
//     「グレー地にアイコンだけを置いたものは押せるボタン」（ADR-0190）
//   いまの部品は、読み取り専用のとき controlBox で --color-field-addon を透明にするので、
//   ボタンのグレー地も一緒に消える（backlog の未決事項）。現行版の行がその見た目
//   候補は、ボタンに当てる style（--color-field-addon の戻し）・className（破線の囲み）・
//   addonShape・ボタンを出すかどうかで作る。部品のコードは変えない

type TokenStyle = CSSProperties & Record<`--${string}`, string>;

interface AddonCandidate extends Candidate {
  /** 読み取り専用の欄で、ボタンに足す見た目 */
  buttonClass?: string;
  buttonStyle?: TokenStyle;
  /** 読み取り専用の欄の prefix・suffix の形 */
  addonShape?: AddonShape;
  /** 読み取り専用では、端に付くボタンを出さない */
  hideInReadOnly?: boolean;
}

const candidates: AddonCandidate[] = [
  {
    id: '現行版',
    name: 'グレー地が消え、アイコンだけが残る',
    intent:
      'いまの部品です。読み取り専用では prefix・suffix に塗りを持たせないので、ボタンのグレー地も一緒に消えます。押せることは、ポインタの形・hover で淡く重なる色・キーボードで入ったときの線でしか伝わりません。塗りのないアイコンは押せない意味の説明という約束（原則 8）と見た目が重なり、SearchField の虫眼鏡と見分けが付きません。',
    spec: [
      ['ボタンの地', 'なし（欄が --color-field-addon を透明にする）'],
      ['輪郭', 'なし'],
      ['アイコン', '太い線（standalone。--icon-stroke-standalone）'],
      ['押せる印', 'hover の淡い重ね・フォーカスの線・ポインタの形だけ'],
    ],
  },
  {
    id: 'A',
    name: 'グレー地を残す',
    intent:
      '読み取り専用でも、ボタンの上だけ文字の塊と同じグレーに戻します。グレー地が押せることの印、という約束をそのまま守るので、塗りのない欄の中で押せる場所が一目で分かります。そのかわり「読み取り専用の欄は塗りを持たない」から外れ、破線の欄の中にグレーの塊が 1 つだけ残ります。',
    spec: [
      ['ボタンの地', '文字の塊と同じグレー（--color-field-addon）。ボタンの上でだけ戻す'],
      ['輪郭', 'なし。欄の破線の内側に接する'],
      ['アイコン', '太い線（--icon-stroke-standalone）'],
      ['押せる印', 'グレー地'],
    ],
    buttonStyle: { '--color-field-addon': 'var(--readonly-addon-fill)' },
    tokens: { '--readonly-addon-fill': 'var(--color-field-addon)' },
  },
  {
    id: 'B',
    name: '破線の輪郭の中に収める',
    intent:
      '塗りは持たせず、欄と同じ細い破線でボタンの範囲を囲みます。欄の破線の内側に少し浮かせて置くので、線が二重に重ならず、押せる範囲だけが見えます。線の種類を欄とそろえたぶん、読み取り専用の様式は崩れません。押せることは「囲まれていること」だけで伝えるので、グレー地より弱い印です。',
    spec: [
      ['ボタンの地', 'なし'],
      ['輪郭', '細い破線（--border-width-thin・--color-line-strong）。欄の破線と同じ'],
      ['形', '内側に浮かせる（addonShape="floating"・--field-addon-floating-inset）'],
      ['アイコン', '太い線（--icon-stroke-standalone）'],
      ['押せる印', '破線の囲み'],
    ],
    addonShape: 'floating',
    buttonClass:
      "relative before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:rounded-[inherit] before:[border-width:var(--border-width-thin)] before:[border-style:dashed] before:[border-color:var(--color-line-strong)]",
  },
  {
    id: 'C',
    name: '読み取り専用ではボタンを出さない',
    intent:
      '読み取り専用の欄には、端に付くボタンを置きません。伏せ字は解いた文字で出し、コピーは欄の外（行の右や値の下）に置きます。押せるものが欄の中に無くなるので、グレー地と塗りのないアイコンの見分けの問題そのものが消えます。そのかわり、値を伏せたまま見せることはできず、欄の中でコピーもできません。',
    spec: [
      ['ボタンの地', '—（ボタンを出さない）'],
      ['伏せ字', '読み取り専用では解いて出す'],
      ['コピー', '欄の外に置く'],
      ['押せる印', '—（欄の中に押せるものが無い）'],
    ],
    hideInReadOnly: true,
  },
];

const columns: Column[] = [
  { label: '読み取り専用（伏せ字）', note: 'パスワード。値は伏せたまま' },
  { label: '読み取り専用（表示）', note: '伏せ字を解いたところ' },
  {
    label: 'ボタンにフォーカス',
    note: '読み取り専用の欄。キーボードで切り替えのボタンへ',
    preview: 'focus',
  },
  {
    label: 'ボタンに hover',
    note: '読み取り専用の欄。ポインタがボタンの上',
    preview: 'hover',
  },
  { label: '「円」とコピーのボタン', note: '読み取り専用。同じ端に文字とボタンが並ぶ' },
  { label: 'ふつうの欄', note: '比較のため。編集できる欄' },
  { label: '押せない欄', note: '比較のため。読み取り専用ではない' },
  { label: '読み取り専用＋エラー', note: '値は変えられないが、エラーが出ている' },
];

interface CellConfig {
  /** password: パスワードの伏せ字の切り替え、amount: 「円」とコピーのボタン */
  kind: 'password' | 'amount';
  /** 伏せ字を解いて出す */
  visible?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  error?: string;
}

const cellConfig: Record<string, CellConfig> = {
  '読み取り専用（伏せ字）': { kind: 'password', readOnly: true },
  '読み取り専用（表示）': { kind: 'password', readOnly: true, visible: true },
  ボタンにフォーカス: { kind: 'password', readOnly: true },
  'ボタンに hover': { kind: 'password', readOnly: true },
  '「円」とコピーのボタン': { kind: 'amount', readOnly: true },
  ふつうの欄: { kind: 'password' },
  押せない欄: { kind: 'password', disabled: true },
  '読み取り専用＋エラー': {
    kind: 'password',
    readOnly: true,
    error: '発行から 90 日が過ぎています',
  },
};

/** 候補ごとの見た目を、読み取り専用の欄のボタンにだけ当てる */
function addonProps(candidate: AddonCandidate, readOnly: boolean | undefined) {
  if (!readOnly) return {};
  return { className: candidate.buttonClass, style: candidate.buttonStyle };
}

function Cell({ children }: { children: ReactNode }) {
  return <div className="w-[240px]">{children}</div>;
}

function renderCell(column: Column, candidate: AddonCandidate) {
  const config = cellConfig[column.label];
  const hide = !!config.readOnly && !!candidate.hideInReadOnly;
  const shape = (config.readOnly && candidate.addonShape) || 'attached';
  const button = addonProps(candidate, config.readOnly);

  if (config.kind === 'amount') {
    return (
      <Cell>
        <TextField
          label="金額"
          readOnly
          addonShape={shape}
          defaultValue="12,800"
          suffix={
            hide ? (
              <FieldAddon>円</FieldAddon>
            ) : (
              <>
                <FieldAddon>円</FieldAddon>
                <FieldAddonButton aria-label="金額をコピー" {...button}>
                  <CopyIcon standalone />
                </FieldAddonButton>
              </>
            )
          }
        />
      </Cell>
    );
  }

  // C は読み取り専用で切り替えのボタンを出さないので、値を解いた文字で見せる
  const visible = !!config.visible || hide;
  return (
    <Cell>
      <TextField
        label="パスワード"
        type={visible ? 'text' : 'password'}
        autoComplete="current-password"
        defaultValue="kazu-2026!"
        addonShape={shape}
        readOnly={config.readOnly}
        disabled={config.disabled}
        error={config.error}
        suffix={
          hide ? undefined : (
            <FieldAddonButton aria-label="パスワードを表示" aria-pressed={visible} {...button}>
              {visible ? <EyeSlashIcon standalone /> : <EyeIcon standalone />}
            </FieldAddonButton>
          )
        }
      />
    </Cell>
  );
}

const meta = {
  title: 'Design Review/178 読み取り専用の欄のボタン',
  id: 'design-review-178-readonly-addon',
  parameters: {
    layout: 'fullscreen',
    // ボタンにフォーカスすると、欄も :focus-within になり、読み取り専用の破線が本体の線に戻る。両方を固定する
    pseudo: statePseudo({
      hover: '[data-slot="field-addon-button"]',
      focusVisible: '[data-slot="field-addon-button"]',
      focusWithin: '[data-slot="control"]',
    }),
  },
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={178}
      axis="読み取り専用の欄のボタン"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={renderCell}
    >
      <p>
        決定:
        読み取り専用の欄でも、端に付くボタンの上だけグレー地を残します（A）。「読み取り専用の欄は塗りを持たない」からは外れますが、押せる場所をグレー地で示す約束を優先します（ADR-0197）。
      </p>
      <p>
        原則 8 には 2 つの文があり、読み取り専用の欄ではぶつかります。1 つは「読み取り専用の欄は
        prefix・suffix も塗りを持たせない」、もう 1
        つは「グレー地にアイコンだけを置いたものは押せるボタン」です。
      </p>
      <p>
        消去のボタンは値を変えるので、読み取り専用では出しません。残るのは、値を変えないボタン（パスワードの伏せ字の切り替え、値のコピー）です。この
        2 つを、塗りのない欄の中でどう「押せる」と見せるかを比べます。
      </p>
      <p>
        いまの部品は、読み取り専用のとき欄の prefix・suffix
        の色を透明にするので、ボタンのグレー地も一緒に消えます。現行版の行がその見た目で、塗りのないアイコン（押せない意味の説明）と区別が付きません。
      </p>
      <p>
        いちばん右の列は、値を変えられない欄にエラーが出ている場合です。どの案でも、いまの部品はボタンにだけ赤みが戻ります（エラーの塊の色は読み取り専用で消していないため）。ここも決めるときに見てください。
      </p>
      <p>
        伏せ字を解いた状態は PasswordField の props では作れないので、この比較では TextField と
        FieldAddonButton を PasswordField
        と同じ形に並べて描いています。見た目は部品と同じで、切り替えは動きません。
      </p>
      <p>どれを既定にするか、ほかに選べるようにしたい案があれば教えてください。</p>
    </Comparison>
  ),
};
