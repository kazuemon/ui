import type { Meta, StoryObj } from '@storybook/react-vite';

import { SkipLinkPage } from '../../src/components/skip-link/story-page';
import { type Candidate, type Column, Comparison } from './Comparison';

// 軸 99: 本文へ移るリンク（SkipLink）の出る位置と面
// 行 = 位置（左上に浮かぶ・上端の帯）× 面（白い面と影・Primary の塗り）。列 = 画面の幅と密度
// どの行も、フォーカスした状態に固定する（出るのは :focus、線は :focus-visible）

const floating = {
  '--skip-link-top': 'calc(var(--spacing) * 3)',
  '--skip-link-left': 'calc(var(--spacing) * 3)',
  '--skip-link-right': 'auto',
  '--skip-link-radius': 'var(--radius-pill)',
  '--skip-link-focus-ring-offset': 'var(--focus-ring-offset)',
};
const band = {
  '--skip-link-top': '0px',
  '--skip-link-left': '0px',
  '--skip-link-right': '0px',
  '--skip-link-radius': '0px',
  // 帯は画面の端に付くので、外側の線は画面の外に出て見えない。線を内側に引く
  '--skip-link-focus-ring-offset': 'calc(var(--focus-ring-width) * -2)',
};
const white = {
  '--skip-link-bg': 'var(--color-surface)',
  '--skip-link-fg': 'var(--color-primary)',
  '--skip-link-line': 'var(--color-surface-line)',
  '--skip-link-shadow': 'var(--shadow-overlay)',
  '--skip-link-focus-ring-color': 'var(--color-primary)',
};
const primary = {
  '--skip-link-bg': 'var(--color-primary)',
  '--skip-link-fg': 'var(--color-on-primary)',
  '--skip-link-line': 'var(--color-primary)',
  '--skip-link-shadow': 'var(--shadow-overlay)',
  // 外に引く線は Primary。帯の内側に引く線は、塗りの上なので白（C で上書き）
  '--skip-link-focus-ring-color': 'var(--color-primary)',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '左上に浮かぶ・白い面',
    intent:
      'ページの上に重なる面として、浮かぶ面と同じ白・細い輪郭・やわらかい影にする。文字はリンクの青と下線。角は pill。',
    spec: [
      ['位置', '左上から 12px'],
      ['面', '白・輪郭・浮かぶ面の影'],
      ['文字', 'Primary・下線'],
    ],
    tokens: { ...floating, ...white },
  },
  {
    id: 'A',
    name: '左上に浮かぶ・Primary の塗り',
    intent: '面を Primary の青で塗り、文字を白にする。白い地の上で、出たことにすぐ気づく。',
    spec: [
      ['位置', '左上から 12px'],
      ['面', 'Primary・浮かぶ面の影'],
      ['文字', '白・下線'],
    ],
    tokens: { ...floating, ...primary },
  },
  {
    id: 'B',
    name: '上端の帯・白い面',
    intent: '画面の上端に幅いっぱいの帯を出し、ヘッダーに重ねる。フォーカスの線は帯の内側に引く。',
    spec: [
      ['位置', '上端・幅いっぱい'],
      ['面', '白・輪郭・浮かぶ面の影'],
      ['文字', 'Primary・下線'],
    ],
    tokens: { ...band, ...white },
  },
  {
    id: 'C',
    name: '上端の帯・Primary の塗り',
    intent: '上端の帯を Primary で塗る。お知らせの帯のように見える。',
    spec: [
      ['位置', '上端・幅いっぱい'],
      ['面', 'Primary'],
      ['文字', '白・下線'],
      ['フォーカスの線', '白・内側'],
    ],
    tokens: { ...band, ...primary, '--skip-link-focus-ring-color': 'var(--color-on-primary)' },
  },
];

const columns: Column[] = [
  { label: 'デスクトップ（マウス）', note: '幅 560px。フォーカスした状態', preview: 'focus' },
  { label: 'スマートフォン（指）', note: '幅 360px。フォーカスした状態', preview: 'focus' },
];

interface ComparisonArgs {
  pick: string;
}

function Axis99({ pick }: ComparisonArgs) {
  return (
    <Comparison
      index={99}
      axis="本文へ移るリンク（SkipLink）の出る位置と面"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) =>
        column.label.startsWith('デスクトップ') ? (
          <SkipLinkPage width={560} density="fine" idPrefix={`axis99-${candidate.id}-fine`} />
        ) : (
          <SkipLinkPage width={360} density="coarse" idPrefix={`axis99-${candidate.id}-coarse`} />
        )
      }
    >
      <p>
        <strong>決定: 現行版（左上に浮かぶ白い面）。ADR はあとで書く。</strong>
      </p>
      <p>
        Tab
        を押したときだけ出る「本文へ移動」のリンクです。出る位置（左上に浮かぶ・上端の帯）と面（白い面と影・Primary
        の塗り）を選びます。どの行もフォーカスした状態に固定しています。
      </p>
      <p>
        左上に浮かぶ形は、ページの上に重なる別のレイヤー（原則1）として、Popover
        などと同じ面にしています。帯は画面の端に付くので、フォーカスの線を内側に引きます。
      </p>
    </Comparison>
  );
}

const meta = {
  title: 'Design Review/99 本文へ移るリンク（SkipLink）',
  id: 'design-review-99-skip-link',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      focus: ['[data-preview="focus"] [data-slot="skip-link"]'],
      focusVisible: ['[data-preview="focus"] [data-slot="skip-link"]'],
    },
  },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: (args) => <Axis99 {...args} />,
};
