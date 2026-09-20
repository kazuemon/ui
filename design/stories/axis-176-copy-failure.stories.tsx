import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { CodeBlock } from '../../src/components/code-block/CodeBlock';
import { shellHtml } from '../../src/components/code-block/fixtures';
import { CopyButton } from '../../src/components/copy-button/CopyButton';
import { Tooltip } from '../../src/components/tooltip/Tooltip';
import { CopyGlyph } from '../../src/internal/copy/copy-parts';
import { CopiedPreviewContext } from '../../src/internal/copy/use-copy';
import { WarningCircleIcon } from '../../src/internal/icons';

// 後半の軸 176: CopyButton で写せなかったときの知らせ方
//   いまの部品は写せなかった状態を持たないので、失敗の列は Button と印を組み合わせてストーリーの中で組んでいる
//   （成功の列と「押す前」の列は、本物の CopyButton。成功は CopiedPreviewContext で止めている）
//   決まったら、部品に失敗の状態を足してから ADR の比較画像を撮り、このストーリーは消す

const TEXT = 'pnpm add @kazuemon/ui';
const COPY_LABEL = 'コピー';
/** 吹き出しと読み上げに出す文 */
const FAILED_MESSAGE = 'コピーできませんでした';
/** ボタンの中に出す文（幅を取らないよう、吹き出しより短くする） */
const FAILED_TEXT = 'コピーできません';

interface Look {
  /** 印を丸の「!」に変える */
  mark: boolean;
  /** 吹き出しで「コピーできませんでした」を出す */
  tooltip: boolean;
  /** 文字で知らせる形（feedback="label"）で、ボタンの中の文字も変える */
  text: boolean;
  /**
   * 吹き出しの面を淡い赤にする（大きさはふだんの吹き出しと同じ）。
   * 吹き出しだけが知らせるので、吹き出しを使わない形（feedback="label"）と CodeBlock の帯でも出す
   */
  dangerBubble?: boolean;
}

const looks: Record<string, Look> = {
  現行版: { mark: false, tooltip: false, text: false },
  A: { mark: true, tooltip: true, text: false },
  B: { mark: false, tooltip: true, text: false },
  C: { mark: true, tooltip: true, text: true },
  D: { mark: false, tooltip: true, text: false, dangerBubble: true },
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '何も出さない',
    intent:
      '写せなかったときは、印も文字も吹き出しも変えません。知らせるかどうかは、onCopyError を受け取る使う側に任せます。渡していないと、押しても何も起きないように見え、写せたのかどうかが分かりません。',
    spec: [
      ['印', '変えない（重なった 2 枚の紙）'],
      ['印の色', '変えない（ボタンの文字の色）'],
      ['吹き出し', '出さない'],
      ['ボタンの文字', '変えない（「コピー」のまま）'],
      ['読み上げ', '知らせない'],
      ['出ている時間', '—'],
    ],
  },
  {
    id: 'A',
    name: '「!」の印と吹き出し',
    intent:
      '印を丸の「!」に変え、成功と同じ吹き出しで「コピーできませんでした」を出します。色と形の両方が変わるので、吹き出しを読まなくても失敗だと分かります。吹き出しを使わない形（feedback="label"）では、印だけが変わります。',
    spec: [
      ['印', '丸の「!」（WarningCircleIcon。入力欄のエラーの行と同じ形）'],
      ['印の色', '--color-fg-danger（暗い面では --color-codeblock-dark-deleted）'],
      ['吹き出し', '「コピーできませんでした」。成功と同じ Tooltip'],
      ['ボタンの文字', '変えない（「コピー」のまま）'],
      ['読み上げ', 'role="status" で「コピーできませんでした」'],
      ['出ている時間', '2 秒（成功と同じ）'],
    ],
  },
  {
    id: 'B',
    name: '吹き出しの文だけ',
    intent:
      '印は重なった 2 枚の紙のまま、吹き出しの文だけを「コピーできませんでした」に変えます。ボタンの見た目が動かないので静かですが、吹き出しを使わない形（feedback="label"）と、吹き出しを持たない CodeBlock の帯の上では、何も伝わりません。',
    spec: [
      ['印', '変えない（重なった 2 枚の紙）'],
      ['印の色', '変えない（ボタンの文字の色）'],
      ['吹き出し', '「コピーできませんでした」。成功と同じ Tooltip'],
      ['ボタンの文字', '変えない（「コピー」のまま）'],
      ['読み上げ', 'role="status" で「コピーできませんでした」'],
      ['出ている時間', '2 秒（成功と同じ）'],
    ],
  },
  {
    id: 'C',
    name: '「!」の印と、文字も変える',
    intent:
      'A に加えて、文字で知らせる形（feedback="label"）ではボタンの中の文字も「コピーできません」に変えます。吹き出しを持たない CodeBlock の帯の上でも文字で伝わりますが、成功のときと同じく、文字の分だけボタンが横に伸びます。',
    spec: [
      ['印', '丸の「!」（A と同じ）'],
      ['印の色', '--color-fg-danger（暗い面では --color-codeblock-dark-deleted）'],
      ['吹き出し', 'feedback="tooltip" では「コピーできませんでした」'],
      ['ボタンの文字', 'feedback="label" では「コピーできません」'],
      ['読み上げ', 'role="status" で「コピーできませんでした」'],
      ['出ている時間', '2 秒（成功と同じ）'],
    ],
  },
  {
    id: 'D',
    name: '淡い赤の吹き出し',
    intent:
      'B と同じく印は変えず、吹き出しの面だけを変えます。大きさは「コピーしました」の吹き出しと同じまま、面を淡い赤にし、文字と丸の「!」を同じ色相の濃い赤にします。並べると色だけが違って見えます。色と形の両方で失敗だと分かるので、吹き出しを使わない形（feedback="label"）と、吹き出しを持たない CodeBlock の帯の上でも、この吹き出しで知らせます。ボタンの見た目は動きません。',
    spec: [
      ['印', '変えない（重なった 2 枚の紙）'],
      ['印の色', '変えない（ボタンの文字の色）'],
      [
        '吹き出しの色',
        '淡い赤の面（--color-danger-subtle）に、同じ色相の濃い文字（--color-fg-danger。5.93:1）。タグとお知らせの soft と同じ形',
      ],
      [
        '吹き出しの大きさ',
        '「コピーしました」と同じ（余白 --tooltip-padding-x/y・部品の角・キャプションの文字・影 --shadow-tooltip・細い輪郭）',
      ],
      [
        '吹き出しの中の印',
        '丸の「!」を文の前に置く（文字と同じ濃い赤）。色だけに頼らず形でも分かる',
      ],
      ['ボタンの文字', '変えない（「コピー」のまま）'],
      ['出る場所', 'feedback="label" と CodeBlock の帯の上でも出す（B との違い）'],
      ['読み上げ', 'role="status" で「コピーできませんでした」'],
      ['出ている時間', '2 秒（成功と同じ）'],
    ],
  },
];

const columns: Column[] = [
  { label: '押す前', note: '既定の形（枠線・「コピー」・吹き出し）' },
  { label: '成功の直後', note: '印はチェック、吹き出しは「コピーしました」' },
  { label: '失敗の直後', note: '権限がない・安全でない接続' },
  { label: '少し経ったあと', note: '知らせが消え、印が元に戻ったところ' },
  { label: 'アイコンだけのボタン', note: 'iconOnly。失敗の直後' },
  { label: '文字つきのボタン', note: 'feedback="label"（吹き出しを使わない形）。失敗の直後' },
  { label: '暗い面', note: 'CodeBlock（dark）の帯の上。失敗の直後' },
];

/** 吹き出しは下に出るので、その分を空けておく */
function Cell({ children }: { children: ReactNode }) {
  return <div className="pb-12">{children}</div>;
}

/**
 * D の淡い赤の吹き出し。大きさ（余白・角・文字・影・輪郭・出る位置）はふだんの Tooltip と同じで、
 * 面だけを淡い赤（--color-danger-subtle）に、文字と印を同じ色相の濃い赤（--color-fg-danger。5.93:1）に変えたもの。
 * 原則6 の「淡い面に、同じ色相の濃い文字」（タグ・お知らせの soft と同じ形）。
 * 印と文の間と印の大きさは、入力欄のエラーの行（field-styles）と同じ。
 * align="end" は、幅の狭い CodeBlock の帯からはみ出さないよう右端にそろえる
 */
function DangerBubble({ align = 'center' }: { align?: 'center' | 'end' }) {
  return (
    <span
      className={[
        'absolute top-full z-10 mt-(--tooltip-offset)',
        align === 'end' ? 'right-0' : 'left-1/2 -translate-x-1/2',
        'inline-flex items-center gap-(--field-message-gap) whitespace-nowrap',
        'rounded-control border-(length:--border-width-thin) border-surface-line',
        '[box-shadow:var(--shadow-tooltip)] px-(--tooltip-padding-x) py-(--tooltip-padding-y)',
        'bg-danger-subtle text-(length:--text-caption) leading-(--leading-caption) text-fg-danger',
      ].join(' ')}
    >
      <WarningCircleIcon className="size-(--leading-caption) shrink-0" />
      {FAILED_MESSAGE}
    </span>
  );
}

/**
 * 写せなかった直後のボタン。部品は失敗の状態を持たないので、Button と印を組み合わせて組み直したもの。
 * 中身の並び（印 → 文字）と、文字が加わったときの余白は CopyButton.tsx と同じ
 */
function FailedButton({
  look,
  iconOnly = false,
  feedback = 'tooltip',
}: {
  look: Look;
  iconOnly?: boolean;
  feedback?: 'tooltip' | 'label';
}) {
  const glyph = look.mark ? (
    <WarningCircleIcon
      standalone={iconOnly}
      className="size-(--spacing-icon) shrink-0 text-fg-danger"
    />
  ) : (
    <CopyGlyph copied={false} standalone={iconOnly} />
  );
  const showText = feedback === 'label' && look.text;

  const button = iconOnly ? (
    <Button
      appearance="outline"
      iconOnly
      aria-label={COPY_LABEL}
      className={
        showText ? 'gap-1.5 px-[calc((var(--spacing-control)-var(--spacing-icon))/2)]' : undefined
      }
    >
      {glyph}
      {showText ? <span aria-hidden="true">{FAILED_TEXT}</span> : null}
    </Button>
  ) : (
    <Button appearance="outline" aria-label={COPY_LABEL}>
      {glyph}
      {showText ? <span aria-hidden="true">{FAILED_TEXT}</span> : COPY_LABEL}
    </Button>
  );

  // 淡い赤の吹き出しは、吹き出しを使わない形（feedback="label"）でも出す。Tooltip の面の色を差し替えるので、
  //   部品の Tooltip ではなく、位置だけそろえてストーリーの中で組む
  if (look.dangerBubble) {
    return (
      <span className="relative inline-flex">
        {button}
        <DangerBubble />
      </span>
    );
  }
  if (feedback === 'label' || !look.tooltip) return button;
  // 並べて撮るので、defaultOpen ではなく open を渡す（Base UI の Tooltip は同時に1つしか開かない）
  return (
    <Tooltip content={FAILED_MESSAGE} open>
      {button}
    </Tooltip>
  );
}

/**
 * 暗い面（CodeBlock の dark）の帯の上。CodeBlock のコピーのボタンは吹き出しを持たず、文字で知らせる形なので、
 * 候補のうち印と文字の変化だけが出る。部品のボタンと同じ寸法・位置・色で組み直したもの
 */
function DarkBarCell({ look }: { look: Look }) {
  return (
    <div className="relative [--cb-muted:var(--color-codeblock-dark-muted)]">
      <CodeBlock appearance="dark" title="install.sh" html={shellHtml} copyButton={false} />
      <span
        className={[
          'absolute top-1 right-1 z-1 inline-flex items-center justify-center gap-1.5',
          'h-(--spacing-control) min-w-(--spacing-control) whitespace-nowrap',
          'px-[calc((var(--spacing-control)-var(--spacing-icon))/2)]',
          'rounded-control text-(color:--cb-muted)',
        ].join(' ')}
      >
        {look.text ? <span className="text-body-sm font-bold">{FAILED_TEXT}</span> : null}
        {look.mark ? (
          <WarningCircleIcon
            standalone
            className="size-(--spacing-icon) shrink-0 text-(color:--color-codeblock-dark-deleted)"
          />
        ) : (
          <CopyGlyph copied={false} standalone />
        )}
        {/* 淡い赤の吹き出しは、吹き出しを持たない帯の上でも出す。暗い地の上での見え方をここで見る */}
        {look.dangerBubble ? <DangerBubble align="end" /> : null}
      </span>
    </div>
  );
}

function renderCell(column: Column, candidate: Candidate) {
  const look = looks[candidate.id];
  switch (column.label) {
    case '押す前':
      return (
        <Cell>
          <CopyButton text={TEXT} />
        </Cell>
      );
    case '成功の直後':
      return (
        <Cell>
          <CopiedPreviewContext value>
            <CopyButton text={TEXT} />
          </CopiedPreviewContext>
        </Cell>
      );
    case '失敗の直後':
      return (
        <Cell>
          <FailedButton look={look} />
        </Cell>
      );
    case '少し経ったあと':
      // 失敗の知らせが消えたあと。どの案も押す前と同じ見た目に戻る
      return (
        <Cell>
          <CopyButton text={TEXT} />
        </Cell>
      );
    case 'アイコンだけのボタン':
      return (
        <Cell>
          <FailedButton look={look} iconOnly />
        </Cell>
      );
    case '文字つきのボタン':
      return (
        <Cell>
          <FailedButton look={look} feedback="label" />
        </Cell>
      );
    default:
      return <DarkBarCell look={look} />;
  }
}

const meta = {
  title: 'Design Review/176 コピーできなかったときの知らせ方',
  id: 'design-review-176-copy-failure',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'D' },
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
      index={176}
      axis="コピーできなかったときの知らせ方"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={renderCell}
    >
      <p>
        決定:
        コピーできなかったときは、淡い赤の吹き出し（D）で知らせます。ボタンの印や文字は変えず、吹き出しの面と文字だけを赤くし、丸の「!」を文の前に置きます（ADR-0195）。
      </p>
      <p>
        CopyButton
        は、いま写せたときだけ見た目が変わります。写せなかったとき（クリップボードの権限がない、安全でない接続で開いている）は何も出さず、
        onCopyError を受け取った使う側が知らせる前提です。ここで決めるのは、onCopyError
        を渡していないときに、部品が既定でどう知らせるかです。onCopyError
        を渡したときは、どの案でも部品は何も出しません。
      </p>
      <p>
        見せ方は成功にそろえています。吹き出しが既定で、feedback="label"
        ではボタンの中の文字に出します。失敗の知らせも成功と同じ 2
        秒で消え、印が元に戻ります。もっと長く出したいときは、その旨も教えてください。
      </p>
      <p>
        読み上げは、どの案も成功と同じ箱（role="status"）で「コピーできませんでした」と知らせます。成功の「コピーしました」と同じ仕組みで、割り込まないので、いま読んでいる文が終わってから伝わります。ボタンの名前は「コピー」のままです。危険のお知らせのように割り込ませる形（role="alert"）がよければ、あわせて教えてください。
      </p>
      <p>
        CodeBlock（暗い面）のコピーのボタンは吹き出しを持たず、文字で知らせます。そのため B
        では暗い面で何も伝わらず、文字つきのボタン（feedback="label"）でも何も伝わりません。C
        は文字で、D は淡い赤の吹き出しで、吹き出しのない場所でも伝えます。
      </p>
      <p>
        D は B
        の変形で、変えるのは吹き出しの色だけです。大きさは「コピーしました」の吹き出しと同じなので、同じ行の「成功の直後」と並べて色の差を見てください。暗い面の列では、淡い赤の吹き出しが暗い地の上でどう見えるかが分かります。
      </p>
      <p>
        部品は写せなかった状態を持たないので、失敗の列は Button
        と印を組み合わせてストーリーの中で組みました。実際に押しても失敗の見た目にはなりません。「押す前」と「成功の直後」は本物の部品です。
      </p>
      <p>どれを既定にするか、ほかに選べるようにしたい案があれば教えてください。</p>
    </Comparison>
  ),
};
