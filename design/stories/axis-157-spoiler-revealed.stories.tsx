import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Blockquote } from '../../src/components/blockquote/Blockquote';
import { Callout } from '../../src/components/callout/Callout';
import { Link } from '../../src/components/link/Link';
import { Spoiler, type SpoilerAppearance } from '../../src/components/spoiler/Spoiler';
import { Text } from '../../src/components/text/Text';

// 後半の軸 157: Spoiler を見せたあとに、隠していた範囲を残すか
//   候補は --spoiler-revealed-fill・--spoiler-revealed-line の上書きだけで作る
//   隠し方（appearance）・隠し直すか（toggleable）・移る長さ（duration）は Controls で切り替える

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '跡を残さない',
    intent:
      '見せたら、周りと同じただの文字に戻す。文の読みやすさがいちばん高い。どこを隠していたかは分からなくなる。',
    spec: [
      ['面', 'なし'],
      ['下線', 'なし'],
    ],
    tokens: {
      '--spoiler-revealed-fill': 'transparent',
      '--spoiler-revealed-line': 'transparent',
    },
  },
  {
    id: 'A',
    name: '淡い面を残す',
    intent:
      '隠していたときより淡い面（文中のコードと同じ濃さ）を残す。どこが答えだったかが分かり、読み返すときに見つけやすい。面が文中のコードと同じ濃さになる。',
    spec: [
      ['面', '周りの文字の色 8%'],
      ['下線', 'なし'],
    ],
    tokens: {
      '--spoiler-revealed-fill': 'color-mix(in oklab, currentColor 8%, transparent)',
      '--spoiler-revealed-line': 'transparent',
    },
  },
  {
    id: 'B',
    name: '点線の下線を残す',
    intent:
      '面は消し、淡い点線の下線だけを残す。範囲は分かるが、面より静か。リンクの下線（実線）とは線の種類で見分ける。',
    spec: [
      ['面', 'なし'],
      ['下線', '周りの文字の色 40% の点線・1px'],
    ],
    tokens: {
      '--spoiler-revealed-fill': 'transparent',
      '--spoiler-revealed-line': 'color-mix(in oklab, currentColor 40%, transparent)',
    },
  },
];

const columns: Column[] = [
  { label: '見せる前', note: '比べるための参考' },
  { label: '本文' },
  { label: 'リンクと並べる' },
  { label: 'グレーの面', note: '引用の surface' },
  { label: '濃い塗り', note: '情報の囲みの filled' },
  { label: '折り返し' },
];

interface Args {
  pick: string;
  appearance: SpoilerAppearance;
  toggleable: boolean;
  duration: number;
}

function renderCell(column: Column, args: Args) {
  const { appearance, toggleable, duration } = args;
  const shared = { appearance, toggleable, duration };
  const cell = (() => {
    switch (column.label) {
      case '見せる前':
        return (
          <Text>
            最後の章で、<Spoiler {...shared}>語り手が犯人</Spoiler>だと分かります。
          </Text>
        );
      case 'リンクと並べる':
        return (
          <Text>
            最後の章で、
            <Spoiler {...shared} defaultRevealed>
              語り手が犯人
            </Spoiler>
            だと分かります。
            <Link href="#review">感想</Link>も書きました。
          </Text>
        );
      case 'グレーの面':
        return (
          <Blockquote appearance="surface">
            答えは
            <Spoiler {...shared} defaultRevealed>
              42
            </Spoiler>
            です。
          </Blockquote>
        );
      case '濃い塗り':
        return (
          <Callout color="info" appearance="filled">
            答えは
            <Spoiler {...shared} defaultRevealed>
              42
            </Spoiler>
            です。
          </Callout>
        );
      case '折り返し':
        return (
          <Text>
            読み終えてから開いてください。
            <Spoiler {...shared} defaultRevealed>
              最後の一行で、語り手がはじめから嘘をついていたことが分かります
            </Spoiler>
            。
          </Text>
        );
      default:
        return (
          <Text>
            最後の章で、
            <Spoiler {...shared} defaultRevealed>
              語り手が犯人
            </Spoiler>
            だと分かります。
          </Text>
        );
    }
  })();
  return <div className="w-[240px]">{cell}</div>;
}

const meta = {
  title: 'Design Review/157 Spoiler を見せたあと',
  id: 'design-review-157-spoiler-revealed',
  parameters: { layout: 'fullscreen' },
  args: { pick: '', appearance: 'hatched', toggleable: false, duration: 0 },
  argTypes: {
    appearance: {
      description: '隠し方',
      control: 'inline-radio',
      options: ['hatched', 'soft', 'blur'],
    },
    toggleable: { description: 'もう一度押したら隠し直すか', control: 'boolean' },
    duration: { description: '見せる・隠すときに移る長さ（ms）', control: 'number' },
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<Args>;

export default meta;

export const Candidates: StoryObj<Args> = {
  name: '候補',
  render: (args) => (
    <Comparison
      index={157}
      axis="Spoiler を見せたあとの残り方"
      pick={args.pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => renderCell(column, args)}
    >
      <p>Spoiler を押して見せたあと、隠していた範囲に跡を残すかを選びます。</p>
      <p>
        Controls の appearance で隠し方（斜線の模様・淡い面・ぼかし）を、toggleable
        で「もう一度押したら隠し直す」を、duration で見せるときに移る長さ（ms。既定の 0
        はすぐに切り替え）を変えられます。見せる前の列の Spoiler を押すと見せられ、toggleable
        を入れると、どの列ももう一度押して隠し直せます。
      </p>
      <p>
        隠し直せるときは、見せたあとも押せるものとして残るので、跡の残り方が「押せる」ことの手がかりにもなります。
      </p>
      <p>どれを既定にするか、ほかに選べるようにしたい案があれば、それも教えてください。</p>
    </Comparison>
  ),
};
