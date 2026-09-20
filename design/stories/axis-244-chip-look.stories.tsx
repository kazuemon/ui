import type { Meta, StoryObj } from '@storybook/react-vite';

import { Chip } from '../../src/components/chip/Chip';
import { statePseudo } from '../../src/stories/story-states';
import { type Candidate, type Column, Comparison } from './Comparison';

const columns: Column[] = [
  { label: 'グレーの欄の上', note: 'Combobox（multiple）の中' },
  { label: 'ページの地の上', note: 'TagsInput・単独' },
  { label: '✕ hover', preview: 'hover' },
  { label: '✕ フォーカス', preview: 'focus' },
  { label: 'disabled' },
  { label: 'readOnly', note: '今は「同じ見た目」' },
];

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '現行版',
    intent: 'Tag と同じ淡い色の面。グレーの欄の上では、面の濃さがほぼ同じで区別しにくい。',
    spec: [
      ['面', '色ごとの淡い面'],
      ['縁', 'なし'],
    ],
    // 決めた見た目（B）が既定になったので、旧い見た目は既定を initial で外して出す
    tokens: {
      '--chip-bg': 'initial',
      '--chip-border-width': '0px',
      '--chip-border-color': 'transparent',
      '--chip-disabled-border-color': 'initial',
      '--chip-readonly-bg': 'initial',
      '--chip-readonly-border-color': 'initial',
    },
  },
  {
    id: 'A',
    name: '白地＋グレー縁',
    intent: '白い面に、3:1 の細い縁。文字は色ごとの色のまま。',
    spec: [
      ['面', '白（surface）'],
      ['縁', '細い・line-strong'],
      ['文字', '色ごと'],
    ],
    tokens: {
      '--chip-bg': 'var(--color-surface)',
      '--chip-border-width': 'var(--border-width-thin)',
      '--chip-border-color': 'var(--color-line-strong)',
      '--chip-disabled-border-color': 'var(--color-line)',
    },
  },
  {
    id: 'B',
    name: '白地＋色付き縁＋色文字',
    intent: '白い面に、文字の色を薄めた縁。色ごとの違いが縁に出る。',
    spec: [
      ['面', '白（surface）'],
      ['縁', '細い・文字色の 45%'],
      ['文字', '色ごと'],
    ],
    tokens: {
      '--chip-bg': 'var(--color-surface)',
      '--chip-border-width': 'var(--border-width-thin)',
      '--chip-border-color': 'color-mix(in oklab, currentColor 45%, transparent)',
      '--chip-disabled-border-color': 'var(--color-line)',
    },
  },
  {
    id: 'C',
    name: '淡い面＋縁',
    intent: '今の淡い面を残し、文字色の縁で欄との境を作る。',
    spec: [
      ['面', '色ごとの淡い面'],
      ['縁', '細い・文字色の 35%'],
      ['文字', '色ごと'],
    ],
    tokens: {
      '--chip-border-width': 'var(--border-width-thin)',
      '--chip-border-color': 'color-mix(in oklab, currentColor 35%, transparent)',
      '--chip-disabled-border-color': 'transparent',
    },
  },
  {
    id: 'D',
    name: '濃いグレー面＋白文字',
    intent: '塗りを濃くして、欄でもページでもはっきり見せる。色ごとの違いは出ない。',
    spec: [
      ['面', 'neutral-strong'],
      ['縁', 'なし'],
      ['文字', '白'],
    ],
    tokens: {
      '--chip-bg': 'var(--color-neutral-strong)',
      '--chip-fg': 'var(--color-on-neutral-strong)',
      '--chip-disabled-bg': 'var(--color-neutral-disabled)',
      '--chip-disabled-fg': 'var(--color-on-neutral-disabled)',
    },
  },
];

interface Props {
  disabled?: boolean;
  readOnly?: boolean;
  removable?: boolean;
}

function Chips({ disabled, readOnly, removable = true }: Props) {
  const p = {
    disabled,
    readOnly,
    onRemove: removable ? () => {} : undefined,
    removeLabel: '外す',
  };
  return (
    <>
      <Chip {...p}>デザイン</Chip>
      <Chip {...p} color="primary">
        フロント
      </Chip>
      <Chip {...p} color="danger">
        急ぎ
      </Chip>
    </>
  );
}

function Cell({ column }: { column: Column }) {
  const grey = 'flex flex-wrap gap-1.5 rounded-lg bg-field p-2';
  const page = 'flex flex-wrap gap-1.5 p-2';
  switch (column.label) {
    case 'ページの地の上':
      return (
        <div className={page}>
          <Chips />
        </div>
      );
    case 'disabled':
      return (
        <div className={grey}>
          <Chips disabled />
        </div>
      );
    case 'readOnly':
      return (
        <div className="flex flex-col gap-2">
          <div className={grey}>
            <Chips readOnly />
          </div>
          <div className={page}>
            <Chips readOnly />
          </div>
        </div>
      );
    default:
      return (
        <div className={grey}>
          <Chips />
        </div>
      );
  }
}

const pseudo = statePseudo({
  hover: '[data-slot="chip-remove"]',
  focusVisible: '[data-slot="chip-remove"]',
});

const meta = {
  title: 'Design Review/244 Chip の見た目',
  parameters: { layout: 'fullscreen', controls: { disable: true }, pseudo },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Candidates: Story = {
  name: 'candidates',
  render: () => (
    <Comparison
      index={244}
      axis="Chip の見た目（面と縁）"
      pick="current"
      columns={columns}
      candidates={candidates}
      renderCell={(column) => <Cell column={column} />}
    >
      <p>
        今のチップは、グレーの欄の中で面の濃さが欄とほぼ同じで、輪郭が見えません。面・縁・文字の組み合わせを比べます。ページの地の上（TagsInput・単独）でも読めるかを見ます。
      </p>
      <p>
        各行のチップは、neutral・primary・danger の 3 色です。どれを既定にするかを選んでください。
      </p>
    </Comparison>
  ),
};

// ── readOnly ─────────────────────────────────────────────

const roColumns: Column[] = [
  { label: 'グレーの欄の上', note: '消す ✕ は出ない' },
  { label: 'ページの地の上' },
];

const base = {
  '--chip-bg': 'var(--color-surface)',
  '--chip-border-width': 'var(--border-width-thin)',
  '--chip-border-color': 'var(--color-line-strong)',
} as const;

const roCandidates: Candidate[] = [
  {
    id: 'current',
    name: '同じ見た目',
    intent:
      '通常のチップと同じ。消す ✕ だけが出ない。（下の行は、通常の見た目を A 白地＋グレー縁としたときの比較）',
    spec: [['面・縁', '通常と同じ']],
    tokens: base,
  },
  {
    id: 'A',
    name: 'グレー地',
    intent: '縁をなくし、入力欄の付属部分と同じグレーの面にする。',
    spec: [
      ['面', 'field-addon'],
      ['縁', 'なし'],
    ],
    tokens: {
      ...base,
      '--chip-readonly-bg': 'var(--color-field-addon)',
      '--chip-readonly-border-color': 'transparent',
    },
  },
  {
    id: 'B',
    name: '破線縁・地なし',
    intent: '読み取り専用の入力欄と同じ。塗りなし、3:1 の細い破線、文字は少し淡く。',
    spec: [
      ['面', 'なし'],
      ['縁', '細い破線・line-strong'],
    ],
    tokens: {
      ...base,
      '--chip-readonly-bg': 'transparent',
      '--chip-readonly-border-style': 'dashed',
    },
  },
];

export const ReadOnly: Story = {
  name: 'readOnly',
  render: () => (
    <Comparison
      index={244}
      axis="Chip の readOnly"
      pick="current"
      columns={roColumns}
      candidates={roCandidates}
      renderCell={(column) => (
        <div
          className={
            column.label === 'グレーの欄の上'
              ? 'flex flex-wrap gap-1.5 rounded-lg bg-field p-2'
              : 'flex flex-wrap gap-1.5 p-2'
          }
        >
          <Chips readOnly />
        </div>
      )}
    >
      <p>
        通常の見た目を「白地＋グレー縁」としたときの、読み取り専用の候補です。通常の見た目が決まれば、そちらに合わせます。
      </p>
    </Comparison>
  ),
};
