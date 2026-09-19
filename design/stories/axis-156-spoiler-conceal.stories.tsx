import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Blockquote } from '../../src/components/blockquote/Blockquote';
import { Callout } from '../../src/components/callout/Callout';
import { Code } from '../../src/components/code/Code';
import { Heading } from '../../src/components/heading/Heading';
import { Spoiler } from '../../src/components/spoiler/Spoiler';
import { Text } from '../../src/components/text/Text';

// 後半の軸 156: Spoiler（文中で隠しておき、押すと見える言葉）の隠し方
//   面と文字の色は周りの文字の色（currentColor）から作る。候補は --spoiler-fill・--spoiler-fill-hover・--spoiler-text・--spoiler-blur の上書きだけで作る

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '淡い面で覆う',
    intent:
      '周りの文字の色を淡く敷いた面で覆い、文字は見えなくする。文中のコードより一段濃い面で、語の長さだけが分かる。hover で面がもう一段濃くなる。',
    spec: [
      ['面', '周りの文字の色 16%（hover 24%）'],
      ['文字', '見えない'],
      ['ぼかし', 'なし'],
    ],
    tokens: {
      '--spoiler-fill': 'color-mix(in oklab, currentColor 16%, transparent)',
      '--spoiler-fill-hover': 'color-mix(in oklab, currentColor 24%, transparent)',
      '--spoiler-text': 'transparent',
      '--spoiler-blur': '0px',
    },
  },
  {
    id: 'A',
    name: '文字の色で塗りつぶす',
    intent:
      '周りの文字の色そのもので塗りつぶす（黒塗り）。隠していることがいちばんはっきり分かる。代わりに、文の中でいちばん重く、軽さからは遠い。hover では少し淡くする。',
    spec: [
      ['面', '周りの文字の色 100%（hover 80%）'],
      ['文字', '見えない'],
      ['ぼかし', 'なし'],
    ],
    tokens: {
      '--spoiler-fill': 'currentColor',
      '--spoiler-fill-hover': 'color-mix(in oklab, currentColor 80%, transparent)',
      '--spoiler-text': 'transparent',
      '--spoiler-blur': '0px',
    },
  },
  {
    id: 'B',
    name: 'ぼかす',
    intent:
      '文字をぼかして読めなくし、文中のコードと同じ淡い面を敷く。文字があることと、おおよその長さが見え、「押すと読める」ことが伝わりやすい。短い数字や英字は形から推し量れることがある。',
    spec: [
      ['面', '周りの文字の色 8%（hover 16%）'],
      ['文字', '周りの色のまま'],
      ['ぼかし', '0.3em'],
    ],
    tokens: {
      '--spoiler-fill': 'color-mix(in oklab, currentColor 8%, transparent)',
      '--spoiler-fill-hover': 'color-mix(in oklab, currentColor 16%, transparent)',
      '--spoiler-text': 'currentColor',
      '--spoiler-blur': '0.3em',
    },
  },
  {
    id: 'C',
    name: '斜線の模様で覆う',
    intent:
      '周りの文字の色の細い斜線で覆い、文字は見えなくする。面の濃さは現行版に近いまま、「伏せてある」ことを模様で見せる。文中のコードの面と見分けやすい。',
    spec: [
      ['面', '周りの文字の色 28% の斜線（hover 40%）'],
      ['文字', '見えない'],
      ['ぼかし', 'なし'],
    ],
    tokens: {
      '--spoiler-fill':
        'repeating-linear-gradient(135deg, color-mix(in oklab, currentColor 28%, transparent) 0 2px, color-mix(in oklab, currentColor 8%, transparent) 2px 5px)',
      '--spoiler-fill-hover':
        'repeating-linear-gradient(135deg, color-mix(in oklab, currentColor 40%, transparent) 0 2px, color-mix(in oklab, currentColor 14%, transparent) 2px 5px)',
      '--spoiler-text': 'transparent',
      '--spoiler-blur': '0px',
    },
  },
];

const columns: Column[] = [
  { label: '本文' },
  { label: 'hover', preview: 'hover' },
  { label: 'フォーカス（キーボード）', preview: 'focus' },
  { label: '見出し' },
  { label: 'グレーの面', note: '引用の surface' },
  { label: '色の面', note: '情報の囲み' },
  { label: '濃い塗り', note: '情報の囲みの filled' },
  { label: '折り返し' },
];

function renderCell(column: Column) {
  const cell = (() => {
    switch (column.label) {
      case '見出し':
        return (
          <Heading level={3}>
            犯人は<Spoiler>語り手</Spoiler>
          </Heading>
        );
      case 'グレーの面':
        return (
          <Blockquote appearance="surface">
            答えは<Spoiler>42</Spoiler>です。
          </Blockquote>
        );
      case '色の面':
        return (
          <Callout color="info">
            答えは<Spoiler>42</Spoiler>です。
          </Callout>
        );
      case '濃い塗り':
        return (
          <Callout color="info" appearance="filled">
            答えは<Spoiler>42</Spoiler>です。
          </Callout>
        );
      case '折り返し':
        return (
          <Text>
            読み終えてから開いてください。
            <Spoiler>最後の一行で、語り手がはじめから嘘をついていたことが分かります</Spoiler>。
          </Text>
        );
      default:
        return (
          <Text>
            最後の章で、<Spoiler>語り手が犯人</Spoiler>だと分かります。文中の
            <Code>code</Code>
            とも比べてください。
          </Text>
        );
    }
  })();
  return <div className="w-[240px]">{cell}</div>;
}

const meta = {
  title: 'Design Review/156 Spoiler の隠し方',
  id: 'design-review-156-spoiler-conceal',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      hover: ['[data-preview="hover"] [data-slot="spoiler"]'],
      focusVisible: ['[data-preview="focus"] [data-slot="spoiler"]'],
    },
  },
  args: { pick: '' },
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
      index={156}
      axis="Spoiler の隠し方"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => renderCell(column)}
    >
      <p>
        Spoiler
        は、ブログの本文でネタバレや答えを隠しておき、押すと見える言葉です。文の中にそのまま置き、行をまたいでも折り返します。隠しているあいだの見た目を選びます。
      </p>
      <p>
        どの案も、面と文字の色は周りの文字の色から作るので、グレーの面・色の面・濃い塗りの上でも地より一段濃くなります。文の中にあるので影は付けず、hover
        で面が変わり、押すと 1px 沈みます。本文の列には、比べるために文中のコードも並べています。
      </p>
      <p>どれを既定にするか、ほかに選べるようにしたい案があれば、それも教えてください。</p>
    </Comparison>
  ),
};
