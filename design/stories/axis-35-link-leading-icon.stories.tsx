import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { expect } from 'storybook/test';

import { ArrowUpRightIcon } from '../../src/components/icons';
import { Link, type LinkContentAlign } from '../../src/components/Link';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 35: 幅いっぱいの枠線のリンクの前のアイコン。寄せ方（contentAlign）は ADR-0046 で決まっている
// 1. 前のアイコン（Candidates）: between・center-end で、文字の前にサービスのアイコンを置いたときの置き場所
//   以前の部品は、前のアイコンを文字と一緒に包み（data-slot="link-label"）の中に入れていた
//   いまの部品は、前のアイコンを包みの外の自分の場所（data-slot="link-lead"）に置き、center-end での動きをトークンで選ぶ
//     --link-lead-icon-follow: 1 は文字と一緒に中央へ動く、0 は左端に残る（between では、どちらも左端）
//   現行版の行は、前のアイコンと文字を1つの要素（span）で包んで渡し、以前の部品と同じ形（包みの中）を再現する
//   A・B の行は、children を1つの Fragment にまとめて渡す（Fragment を開いて見分けることの確かめも兼ねる）
// 2. アイコンだけのときの ↗（IconOnly）: 子が1つだけ（アイコンだけ）の枠線のリンクを新しいタブで開くとき、比べたときの部品は ↗ を足していた
//   いまの部品は足さない（A を採用）。比べたときの形のまま残すため、どの行もアイコンと ↗ を自分で並べて渡し、
//   この中だけのトークン（--axis35-icon-only-arrow）で ↗ を出すか隠すかを決める

// サービスのアイコンの代わり。形の違う、部品の中の文字と並ぶ大きさ（--size-icon）のアイコン。線は Regular（ADR-0018）
const ServiceIcon = ({ children }: { children: ReactNode }) => (
  <svg
    viewBox="0 0 256 256"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="size-(--size-icon) shrink-0"
    style={{ strokeWidth: 'var(--icon-stroke)' }}
  >
    {children}
  </svg>
);

const services = {
  Discord: (
    <ServiceIcon>
      <path d="M128 32a96 96 0 1 1-46 180l-42 12 12-42A96 96 0 0 1 128 32Z" />
    </ServiceIcon>
  ),
  X: (
    <ServiceIcon>
      <path d="M48 40h48l112 176h-48Z" />
      <line x1="208" y1="40" x2="142" y2="112" />
      <line x1="48" y1="216" x2="114" y2="144" />
    </ServiceIcon>
  ),
  YouTube: (
    <ServiceIcon>
      <rect x="24" y="56" width="208" height="144" rx="40" />
      <polygon points="112 96 160 128 112 160" />
    </ServiceIcon>
  ),
  GitHub: (
    <ServiceIcon>
      <circle cx="128" cy="128" r="96" />
      <path d="M104 222v-30a24 24 0 0 1 48 0v30" />
    </ServiceIcon>
  ),
} as const;

type Service = keyof typeof services;

const accounts: [Service, string][] = [
  ['Discord', 'Discord サーバー'],
  ['X', 'X'],
  ['YouTube', 'YouTube チャンネル'],
  ['GitHub', 'GitHub'],
];

// ── 1. 前のアイコン ─────────────────────────────────────

interface LeadCandidate extends Candidate {
  /** 以前の部品と同じ形（前のアイコンを文字と一緒に包みの中に入れる）で描く */
  wrapped?: boolean;
}

const leads: LeadCandidate[] = [
  {
    id: '現行版',
    name: '包みの中で文字と一緒',
    wrapped: true,
    intent:
      '以前の部品のまま。前のアイコンは、文字を包む要素の中に文字と一緒に入る。アイコンが1行目に、文字がその下の行に分かれて出て、文字が枠の下に寄る（アイコンがブロックとして描かれるため）。',
    spec: [
      ['前のアイコン', '文字と一緒に包みの中'],
      ['アイコンと文字', '上下の2行に分かれる'],
    ],
    tokens: { '--link-lead-icon-follow': '1' },
  },
  {
    id: 'A',
    name: '文字と一緒に動く',
    intent:
      '前のアイコンを包みの外に出し、文字の前 8px に置く。center-end では、アイコンと文字をまとめて中央に置くので、文字の長さでアイコンの位置が変わる。',
    spec: [
      ['前のアイコン', '文字の前（8px）'],
      ['center-end', 'アイコンと文字をまとめて中央'],
      ['between', 'アイコンは左端、文字はすぐ後ろ'],
      ['--link-lead-icon-follow', '1'],
    ],
    tokens: { '--link-lead-icon-follow': '1' },
  },
  {
    id: 'B',
    name: '左端に固定',
    intent:
      '前のアイコンを左端に固定し、文字だけが寄る。center-end では、文字は箱全体の中央に来て、前と右端のアイコンが左右でつり合う。縦に並べると、前のアイコンが縦にそろう。',
    spec: [
      ['前のアイコン', '左端（余白 12px／16px）'],
      ['center-end', '文字だけが箱全体の中央'],
      ['between', 'A と同じ'],
      ['--link-lead-icon-follow', '0'],
    ],
    tokens: { '--link-lead-icon-follow': '0' },
  },
];

interface LeadColumn extends Column {
  align: LinkContentAlign;
  /** 新しいタブで開く（部品が右端に ↗ を足す） */
  newTab: boolean;
}

const leadColumns: LeadColumn[] = [
  {
    label: 'center-end・縦に4本',
    note: 'SNS のアカウント一覧。新しいタブで開くので、右端に ↗ が付く。上がマウス用、下が指用',
    align: 'center-end',
    newTab: true,
  },
  {
    label: 'between・縦に4本',
    note: '同じ一覧を between で。A と B は同じ見た目になる',
    align: 'between',
    newTab: true,
  },
  {
    label: 'center-end・右端のアイコンなし',
    note: '同じタブで開くリンク。右端に何もないとき、文字が中央に来るか',
    align: 'center-end',
    newTab: false,
  },
];

const densities = [
  ['fine', 'マウス用'],
  ['coarse', '指用'],
] as const;

const BothDensities = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-5">
    {densities.map(([density, label]) => (
      <div key={density} data-density={density} className="flex flex-col gap-2">
        <span className="text-xs text-fg-subtle">{label}</span>
        {children}
      </div>
    ))}
  </div>
);

const LeadList = ({ column, candidate }: { column: LeadColumn; candidate: LeadCandidate }) => (
  <BothDensities>
    <div data-axis35-row={candidate.id} className="flex max-w-[320px] flex-col gap-3">
      {accounts.map(([service, name]) => (
        <Link
          key={service}
          appearance="outline"
          contentAlign={column.align}
          href={`#${service}`}
          target={column.newTab ? '_blank' : undefined}
          className="w-full"
        >
          {candidate.wrapped ? (
            <span>
              {services[service]}
              {name}
            </span>
          ) : (
            <>
              {services[service]}
              {name}
            </>
          )}
        </Link>
      ))}
    </div>
  </BothDensities>
);

// ── 2. アイコンだけのときの ↗ ──────────────────────────────

const iconOnlyCss = `
/* 部品が足した ↗（アイコンの後ろの2つめの svg）を、行ごとのトークンで出すか隠すか */
.axis35-icon-only > svg + svg { display: var(--axis35-icon-only-arrow); }`;

const iconOnly: Candidate[] = [
  {
    id: '現行版',
    name: '↗ を足す',
    intent:
      '子が1つだけのときはアイコンとみなさず、新しいタブなら ↗ を足す。アイコンの後ろに ↗ が並ぶ横長の pill になる。',
    spec: [
      ['アイコンだけのとき', '↗ を足す'],
      ['形', '横長の pill（マウス用 66×40px・指用 82×44px）'],
    ],
    tokens: { '--axis35-icon-only-arrow': 'block' },
  },
  {
    id: 'A',
    name: '↗ を足さない',
    intent:
      'アイコンだけのときは、そのアイコンを最後のアイコンとみなし、↗ を足さない（枠線のリンクの「利用者がアイコンを置いたら、それを使う」と同じ）。左右の余白はいまのままなので、マウス用はほぼ丸、指用は少し横長になる。',
    spec: [
      ['アイコンだけのとき', '↗ を足さない'],
      ['形', 'マウス用 42×40px（ほぼ丸）・指用 54×44px'],
    ],
    tokens: { '--axis35-icon-only-arrow': 'none' },
  },
];

const iconOnlyColumns: Column[] = [
  { label: 'マウス用', note: 'アイコンだけのリンクを横に4つ並べる' },
  { label: '指用', note: '同じ並びを指用で' },
  {
    label: '文字のあるリンクと並べたとき',
    note: 'マウス用。左の2つは文字のある枠線のリンク（新しいタブなので ↗ が付く）',
  },
];

const IconOnlyLink = ({ service }: { service: Service }) => (
  <Link
    appearance="outline"
    href={`#${service}`}
    target="_blank"
    aria-label={service}
    className="axis35-icon-only"
  >
    {services[service]}
    <ArrowUpRightIcon />
  </Link>
);

const IconOnlyRow = ({ column }: { column: Column }) => {
  const mixed = column.label.startsWith('文字');
  return (
    <div
      data-density={column.label === '指用' ? 'coarse' : 'fine'}
      className="flex flex-wrap gap-3"
    >
      {mixed && (
        <>
          <Link appearance="outline" href="#blog" target="_blank">
            ブログ
          </Link>
          <Link appearance="outline" href="#works" target="_blank">
            作品
          </Link>
        </>
      )}
      {(mixed ? (['X', 'GitHub'] as const) : accounts.map(([service]) => service)).map(
        (service) => (
          <IconOnlyLink key={service} service={service} />
        )
      )}
    </div>
  );
};

// ── ストーリー ────────────────────────────────────────

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/35 幅いっぱいの枠線のリンクの前のアイコン',
  id: 'design-review-35-link-leading-icon',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A,B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={35}
      axis="幅いっぱいの枠線のリンクの前のアイコン"
      pick={pick}
      candidates={leads}
      columns={leadColumns}
      renderCell={(column, candidate) => {
        const lead = leadColumns.find((c) => c.label === column.label);
        return lead && <LeadList column={lead} candidate={candidate} />;
      }}
    >
      <p>
        <strong className="text-fg">決まったこと</strong>
        （ADR-0056）。幅いっぱいに広げた枠線のリンクの寄せ方（contentAlign）は ADR-0046
        で決まっています。ここで選ぶのは、between・center-end
        で文字の前にアイコン（サービスのアイコンなど）を置いたときの、アイコンの置き場所です。
      </p>
      <p>
        現行版は、以前の部品と同じく、前のアイコンを文字と一緒に包みの中に入れた形です。A
        は、前のアイコンを文字の前 8px に置き、文字と一緒に動かします。B
        は、前のアイコンを左端に固定し、文字だけを寄せます。
      </p>
      <p>
        列は寄せ方です。SNS
        のアカウント一覧のように縦に4本並べたとき、前のアイコンと文字が揃って見えるかを見てください。center-end
        の列で A と B の違いが出ます。between の列では、A と B は同じ見た目です。
      </p>
      <p>どれを既定にするかを一言添えてください。</p>
    </Comparison>
  ),
  play: async ({ canvasElement }) => {
    // A・B の行（children を1つの Fragment にまとめて渡す）でも、前のアイコンと右端の ↗ を見分ける
    for (const id of ['A', 'B']) {
      const links = canvasElement.querySelectorAll<HTMLElement>(`[data-axis35-row="${id}"] a`);
      await expect(links.length).toBeGreaterThan(0);
      for (const link of links) {
        await expect(link.querySelector(':scope > [data-slot="link-lead"] > svg')).not.toBeNull();
        await expect(link.querySelector('[data-slot="link-label"] svg')).toBeNull();
      }
    }
  },
};

export const IconOnly: Story = {
  name: 'アイコンだけのときの ↗',
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A'],
    },
  },
  render: ({ pick }) => (
    <>
      <style>{iconOnlyCss}</style>
      <Comparison
        index={35}
        axis="幅いっぱいの枠線のリンクの前のアイコン: アイコンだけのときの ↗"
        pick={pick}
        candidates={iconOnly}
        columns={iconOnlyColumns}
        renderCell={(column) => <IconOnlyRow column={column} />}
      >
        <p>
          枠線のリンクは、最後にアイコンを置いたときはそれを使い、アイコンがなければ新しいタブで ↗
          を付けます（ADR-0046）。子が1つだけ（アイコンだけ）のときは、いまはアイコンとみなさず、↗
          を足しています。ここで選ぶのは、アイコンだけのリンクを新しいタブで開くときに ↗
          を足すかどうかです。
        </p>
        <p>
          どの行も、新しいタブで開くリンクで、読み上げには名前（aria-label）が付いています。列は密度と、文字のある枠線のリンクと並べたときです。アイコンだけのリンクが並んだときの形と、文字のリンクの
          ↗ と並べたときに、新しいタブで開くと分かるかを見てください。
        </p>
        <p>どちらを既定にするかを一言添えてください。</p>
      </Comparison>
    </>
  ),
};
