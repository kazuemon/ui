import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Button } from '../../src/components/button/Button';
import { Code } from '../../src/components/code/Code';
import { CopyButton, type CopyButtonFeedback } from '../../src/components/copy-button/CopyButton';
import { CopiedStatus, CopyGlyph } from '../../src/internal/copy/copy-parts';
import { CopiedPreviewContext, useCopy } from '../../src/internal/copy/use-copy';
import { type Candidate, type Column, Comparison } from './Comparison';

const TEXT = 'pnpm add @kazuemon/ui';

// 後半の軸 102: CopyButton で、写せたことをどう見せるか
// 候補は feedback の props の違い（トークンではない）。「X を既定にして Y も選べる」形にできるよう、全案を props として作った
// どの案も、印はチェックに変わり、読み上げでは「コピーしました」を知らせる（CodeBlock と同じ）
// 決定: B（tooltip）を既定にし、現行版（label）も選べる。A（icon）は採らず、部品の props から外した
//   A の行は、比べていたときの見た目（印だけ変える）を、このストーリーの中の IconFeedback で再現している

type Feedback = CopyButtonFeedback | 'icon';

/** A（印だけ変える）の再現。部品からは外したので、Button と共有の印で描く */
function IconFeedback({
  iconOnly = false,
  label = 'コピー',
}: {
  iconOnly?: boolean;
  label?: string;
}) {
  const { copied, copy } = useCopy(2000);
  const glyph = <CopyGlyph copied={copied} standalone={iconOnly} />;
  const onClick = () => void copy(TEXT);
  return (
    <>
      {iconOnly ? (
        <Button iconOnly appearance="outline" aria-label={label} onClick={onClick}>
          {glyph}
        </Button>
      ) : (
        <Button appearance="outline" onClick={onClick}>
          {glyph}
          {label}
        </Button>
      )}
      <CopiedStatus copied={copied} label="コピーしました" />
    </>
  );
}

function Copy({
  feedback,
  iconOnly,
  label,
}: {
  feedback: Feedback;
  iconOnly?: boolean;
  label?: string;
}) {
  if (feedback === 'icon') return <IconFeedback iconOnly={iconOnly} label={label} />;
  return <CopyButton text={TEXT} feedback={feedback} iconOnly={iconOnly} label={label} />;
}

const candidates: (Candidate & { feedback: Feedback })[] = [
  {
    id: '現行版',
    name: '文字も出す（CodeBlock と同じ）',
    feedback: 'label',
    intent:
      '印がチェックに変わり、「コピー」の文字が「コピーしました」に変わる。どちらの形も、文字の分だけボタンが横に伸びる（CodeBlock のボタンと同じ）。いちばん確かに伝わるが、右に並ぶものが押し出される。',
    spec: [
      ['feedback', "'label'"],
      ['文字のボタン', 'コピー → コピーしました（横に伸びる）'],
      ['アイコンだけ', '横に伸びて「コピーしました」'],
    ],
  },
  {
    id: 'A',
    name: '印だけ変える',
    feedback: 'icon',
    intent:
      '印がチェックに変わるだけ。いちばん静かで、幅も変わらない。文字のボタンの幅はふだんの文字の分だけ。見落としやすい。',
    spec: [
      ['feedback', "'icon'"],
      ['文字のボタン', '印だけチェック（文字は「コピー」のまま）'],
      ['アイコンだけ', '印だけチェック'],
    ],
  },
  {
    id: 'B',
    name: 'Tooltip で出す',
    feedback: 'tooltip',
    intent:
      '印がチェックに変わり、ボタンのそばに Tooltip で「コピーしました」を出す。ボタンの幅は変わらない。アイコンだけのボタンでは、マウスを載せたときにも「コピー」を出す。',
    spec: [
      ['feedback', "'tooltip'"],
      ['文字のボタン', '印がチェック＋吹き出し'],
      ['アイコンだけ', '印がチェック＋吹き出し。hover で名前'],
    ],
  },
];

const columns: Column[] = [
  { label: '文字のボタン', note: '通常・コピーしたあと' },
  { label: 'アイコンだけ', note: '通常・コピーしたあと' },
  { label: 'コマンドの横', note: 'コピーしたあと（アイコンだけ）' },
  { label: '押してみる', note: '文字・アイコンだけ（2 秒で戻る）' },
];

const Row = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-wrap items-center gap-3 pb-10">{children}</div>
);

function Cell({ column, feedback }: { column: Column; feedback: Feedback }) {
  switch (column.label) {
    case '文字のボタン':
      return (
        <Row>
          <Copy feedback={feedback} />
          <CopiedPreviewContext value>
            <Copy feedback={feedback} />
          </CopiedPreviewContext>
        </Row>
      );
    case 'アイコンだけ':
      return (
        <Row>
          <Copy feedback={feedback} iconOnly />
          <CopiedPreviewContext value>
            <Copy feedback={feedback} iconOnly />
          </CopiedPreviewContext>
        </Row>
      );
    case 'コマンドの横':
      return (
        <Row>
          <div className="flex w-[300px] items-center justify-between gap-2 rounded-control bg-field py-1 pr-1 pl-4">
            <Code>{TEXT}</Code>
            <CopiedPreviewContext value>
              <Copy feedback={feedback} iconOnly label="コマンドをコピー" />
            </CopiedPreviewContext>
          </div>
        </Row>
      );
    default:
      return (
        <Row>
          <Copy feedback={feedback} />
          <Copy feedback={feedback} iconOnly />
        </Row>
      );
  }
}

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/102 コピーできたときの見せ方',
  id: 'design-review-102-copy-feedback',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用。「,」区切りで複数可）',
      control: 'text',
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={102}
      axis="コピーできたときの見せ方"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <Cell
          column={column}
          feedback={candidates.find((c) => c.id === candidate.id)?.feedback ?? 'label'}
        />
      )}
    >
      <p>
        <strong>
          決定: B（Tooltip で出す）を既定にし、現行版（「コピーしました」の文字を出す）も
        </strong>
        <code>feedback=&quot;label&quot;</code>
        <strong>で選べるようにしました。A（印だけ変える）は採りませんでした。</strong>
      </p>
      <p>
        CopyButton
        を押して写せたときの見せ方です。どの案も印はチェックに変わり、読み上げでは「コピーしました」と知らせます。違うのは、目に見える文をどこに出すかです。
      </p>
      <p>
        行 = 見せ方（<code>feedback</code>
        ）。「押してみる」の列は実際に写します（http の LAN の IP
        で開いたときなど、クリップボードが使えない環境では変わりません）。ほかの列はコピーしたあとの見た目に止めています。
      </p>
      <p>
        どれを既定にし、どれを選べる形に残すかを選んでください（文字のボタンとアイコンだけのボタンで既定を分けることもできます）。
      </p>
    </Comparison>
  ),
};
