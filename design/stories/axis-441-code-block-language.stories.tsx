import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { CodeBlock } from '../../src/components/code-block/CodeBlock';
import { shellHtml, typescriptHtml } from '../../src/components/code-block/fixtures';

// 軸 441: CodeBlock の言語のラベル（language）。帯の中の位置と、文字だけか面を敷くか
const meta = {
  title: 'Design Review/441 コードの言語のラベル',
  id: 'design-review-441-code-block-language',
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
type Story = StoryObj<{ pick: string }>;

const plain = {
  '--codeblock-language-bg': 'transparent',
  '--codeblock-language-pad-x': '0px',
  '--codeblock-language-pad-y': '0px',
};
const pill = {
  // 色は文字の色（題と同じ淡い色）から作る。濃い地でも同じ割合で明るく見える
  '--codeblock-language-bg': 'color-mix(in oklab, currentColor 12%, transparent)',
  '--codeblock-language-pad-x': 'calc(var(--spacing) * 2)',
  '--codeblock-language-pad-y': 'calc(var(--spacing) * 0.5)',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'ラベルなし',
    intent: 'いまは言語を出す口がない。題がないときは帯も出ない。比べるための基準',
    spec: [
      ['位置', '—'],
      ['見た目', '—'],
    ],
  },
  {
    id: 'A',
    name: '帯の右・文字だけ',
    intent:
      '題と同じ淡い色・同じ等幅の文字で、帯の右（コピーのボタンの左）に置く。題がないときは帯の左に出る。いちばん静か',
    spec: [
      ['位置', '題の後ろ（右へ寄せる）'],
      ['見た目', '文字だけ（題と同じ色）'],
    ],
    tokens: { '--codeblock-language-order': '1', ...plain },
  },
  {
    id: 'B',
    name: '帯の左・題の前・文字だけ',
    intent:
      '言語を題の前に置き、「ts src/lib/posts.ts」のように読ませる。題がないときも左に出るので、位置が変わらない',
    spec: [
      ['位置', '題の前（左）'],
      ['見た目', '文字だけ（題と同じ色）'],
    ],
    tokens: { '--codeblock-language-order': '-1', ...plain },
  },
  {
    id: 'C',
    name: '帯の右・淡い面の pill',
    intent:
      'A の位置で、文字の色を 12% 混ぜた淡い面を pill で敷く。題と見分けやすく、言語だと一目で分かる。タグに近い見た目',
    spec: [
      ['位置', '題の後ろ（右へ寄せる）'],
      ['見た目', '淡い面の pill（左右 8px）'],
    ],
    tokens: { '--codeblock-language-order': '1', ...pill },
  },
  {
    id: 'D',
    name: '帯の左・淡い面の pill',
    intent: 'B の位置で、C と同じ淡い面を敷く。題の頭に印のように付く',
    spec: [
      ['位置', '題の前（左）'],
      ['見た目', '淡い面の pill（左右 8px）'],
    ],
    tokens: { '--codeblock-language-order': '-1', ...pill },
  },
];

const columns: Column[] = [
  { label: '題と言語', note: 'surface' },
  { label: '言語だけ', note: '題なし（帯が出る）' },
  { label: '濃い地', note: 'dark・題と言語' },
  { label: '狭い幅・長い題', note: '320px' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={441}
      axis="コードの言語のラベル"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const language = candidate.id === '現行版' ? undefined : 'ts';
        switch (column.label) {
          case '題と言語':
            return (
              <div data-reading className="w-[420px]">
                <CodeBlock title="src/lib/posts.ts" language={language} html={typescriptHtml} />
              </div>
            );
          case '言語だけ':
            return (
              <div data-reading className="w-[360px]">
                <CodeBlock
                  language={candidate.id === '現行版' ? undefined : 'sh'}
                  html={shellHtml}
                />
              </div>
            );
          case '濃い地':
            return (
              <div data-reading className="w-[420px]">
                <CodeBlock
                  variant="dark"
                  title="src/lib/posts.ts"
                  language={language}
                  html={typescriptHtml}
                />
              </div>
            );
          default:
            return (
              <div data-reading className="w-[320px]">
                <CodeBlock
                  title="src/components/code-block/CodeBlock.stories.tsx"
                  language={candidate.id === '現行版' ? undefined : 'tsx'}
                  html={shellHtml}
                />
              </div>
            );
        }
      }}
    >
      <p>
        決定: 言語のラベルの既定は
        D（題の前・淡い丸い面）。置き場（題の前・後ろ）と、面を敷くか（面あり・文字だけ）は props
        で選べる。ユーザーの返事:「デフォルト
        D（言語を指定した場合）で、前後・面を敷くかを選べるようにしたいです。」
        候補の見た目は、トークンを畳む前のこのコミットで比べられます。
      </p>
      <p>
        CodeBlock に言語の名前（language）を足しました。渡した文字（ts・sh
        など）をそのまま上の帯に出します。 題がなくても、言語を渡すと帯を出します。
      </p>
      <p>
        選ぶのは、帯の中の位置（題の後ろで右へ寄せるか、題の前か）と、文字だけにするか淡い面の pill
        にするかです。既定の推しは A（いちばん静かで、題を邪魔しない）です。
      </p>
    </Comparison>
  ),
};
