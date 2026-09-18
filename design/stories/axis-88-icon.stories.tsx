import {
  ArrowSquareOutIcon,
  BellIcon,
  CaretRightIcon,
  GearSixIcon,
  GithubLogoIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  RocketLaunchIcon,
  SparkleIcon,
  TagIcon,
  TrashIcon,
  UserIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Badge } from '../../src/components/badge/Badge';
import { Button } from '../../src/components/button/Button';
import { Heading } from '../../src/components/heading/Heading';
import { Icon } from '../../src/components/icon/Icon';
import { Link } from '../../src/components/link/Link';
import { Notice } from '../../src/components/notice/Notice';
import { Select } from '../../src/components/select/Select';
import { Tag } from '../../src/components/tag/Tag';
import { Text } from '../../src/components/text/Text';
import { TextField } from '../../src/components/text-field/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 88: 公開の Icon の大きさと線の太さ
// 変えるのは --icon-follow-text・--icon-size-text・--icon-size-sm/md/lg・--icon-weight-inline・--icon-weight-standalone だけ
// 全案（現行版を含む）で軸の値を明示する
// 決定: B。--icon-follow-text は部品に畳んで消した（既定の size が text になった）ので、今は効かない。ほかの案は、
//   畳む前の部品・トークン・ストーリー（scratchpad の round2-snapshot/icon-round2.tgz、のちに ADR のコミット）で再現する

const steps = {
  '--icon-size-sm': 'calc(var(--spacing) * 4)',
  '--icon-size-md': 'calc(var(--spacing) * 5)',
  '--icon-size-lg': 'calc(var(--spacing) * 6)',
};
const weights = {
  '--icon-weight-inline': '16',
  '--icon-weight-standalone': '24',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '部品の大きさ・段は 16/20/24',
    intent:
      '既定は、周りの部品と同じ「部品の中の文字と並ぶ大きさ」（マウス 20・指 16）。見出しや文の中は size="text" で文字に比例させる。線は、文字と並ぶと Regular、単体は Bold。',
    spec: [
      ['変わるところ', '基準（ほかの案は、この行と比べて書いています）'],
      ['既定', '部品の大きさ（密度）'],
      ['text', '1.25em'],
      ['段', '16 / 20 / 24'],
      ['線', '文字と並ぶ 16・単体 24'],
    ],
    tokens: {
      '--icon-follow-text': '0',
      '--icon-size-text': '1.25em',
      ...steps,
      ...weights,
    },
  },
  {
    id: 'A',
    name: '段の lg を 28 に',
    intent:
      '現行版の段の lg だけを大きくする。アイコンを見出しや空の画面の飾りに大きく置くとき、md との差がはっきりする。',
    spec: [
      ['変わるところ', 'lg の段だけ大きくなる（24 → 28）。ほかの場面は変わらない'],
      ['既定', '部品の大きさ（密度）'],
      ['text', '1.25em'],
      ['段', '16 / 20 / 28'],
      ['線', '文字と並ぶ 16・単体 24'],
    ],
    tokens: {
      '--icon-follow-text': '0',
      '--icon-size-text': '1.25em',
      ...steps,
      '--icon-size-lg': 'calc(var(--spacing) * 7)',
      ...weights,
    },
  },
  {
    id: 'B',
    name: '既定を文字に比例（1.25em）',
    intent:
      '既定の大きさを周りの文字に比例させる。部品の中ではほぼ現行版と同じ（マウス 20・指 17.5）で、タグや見出しの中でも文字に合う。代わりに、入力欄の中など文字の大きさが違う場所でずれる。',
    spec: [
      [
        '変わるところ',
        'マウス: タグの中だけ小さくなる（20 → 15）。指: ボタン・リンク・一覧の行が少し大きくなり（16 → 17.5）、タグの中は小さくなる（16 → 15）。入力欄・お知らせ・見出し・文は変わらない',
      ],
      ['既定', '文字 × 1.25'],
      ['text', '1.25em'],
      ['段', '16 / 20 / 24'],
      ['線', '文字と並ぶ 16・単体 24'],
    ],
    tokens: {
      '--icon-follow-text': '1',
      '--icon-size-text': '1.25em',
      ...steps,
      ...weights,
    },
  },
  {
    id: 'C',
    name: '既定を文字と同じ大きさ（1em）',
    intent:
      'Phosphor の既定と同じく、アイコンを文字と同じ大きさにする。いちばん控えめで、文字の中に溶け込む。部品の中では小さく見える。',
    spec: [
      [
        '変わるところ',
        'ほぼ全部小さくなる。ボタン・リンク・一覧の行（マウス 20 → 16、指 16 → 14）、入力欄（20 → 16）、タグ（→ 12）、見出し・文の中（0.8 倍）。お知らせと段は変わらない',
      ],
      ['既定', '文字 × 1'],
      ['text', '1em'],
      ['段', '16 / 20 / 24'],
      ['線', '文字と並ぶ 16・単体 24'],
    ],
    tokens: {
      '--icon-follow-text': '1',
      '--icon-size-text': '1em',
      ...steps,
      ...weights,
    },
  },
  {
    id: 'D',
    name: '文字と並ぶときも Bold',
    intent:
      '大きさは現行版のまま、文字と並ぶアイコンも太い線にする。太字のボタンの文字と並ぶと太さがそろうが、本文の横では重い。部品の中のアイコン（▼ など）とは太さが違ってくる。',
    spec: [
      [
        '変わるところ',
        '大きさは変わらない。文字と並ぶアイコンの線が全部太くなる（アイコンだけのボタンと「lg・単体」は変わらない）',
      ],
      ['既定', '部品の大きさ（密度）'],
      ['text', '1.25em'],
      ['段', '16 / 20 / 24'],
      ['線', '文字と並ぶ 24・単体 24'],
    ],
    tokens: {
      '--icon-follow-text': '0',
      '--icon-size-text': '1.25em',
      ...steps,
      ...weights,
      '--icon-weight-inline': '24',
    },
  },
];

const columns: Column[] = [
  { label: 'ボタンの中', note: '文字と並ぶ・アイコンだけ（standalone）' },
  { label: '入力欄', note: 'TextField と Select の prefix' },
  { label: 'リンク・一覧の行', note: '枠線のリンク、新しいタブ、設定の行' },
  { label: 'お知らせ・タグ・Badge', note: 'size を指定せずに置いたとき' },
  { label: '見出し・文・段', note: 'size="text" と sm・md・lg' },
];

const Stack = ({ children }: { children: ReactNode }) => (
  <div className="flex w-[300px] flex-col items-start gap-4 text-fg">{children}</div>
);

const settingRows = [
  { icon: GearSixIcon, label: '全般' },
  { icon: BellIcon, label: '通知' },
  { icon: TagIcon, label: 'タグの管理' },
];

const cells: Record<string, () => ReactNode> = {
  ボタンの中: () => (
    <Stack>
      <div className="flex flex-wrap items-center gap-2">
        <Button color="primary">
          <Icon icon={PencilSimpleIcon} />
          編集する
        </Button>
        <Button appearance="outline">
          <Icon icon={GearSixIcon} />
          設定
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button appearance="outline" aria-label="検索" className="w-(--spacing-control) px-0">
          <Icon icon={MagnifyingGlassIcon} standalone />
        </Button>
        <Button appearance="outline" aria-label="削除" className="w-(--spacing-control) px-0">
          <Icon icon={TrashIcon} standalone className="text-fg-danger" />
        </Button>
        <Badge count={3} color="danger" aria-hidden="true">
          <Button
            appearance="outline"
            aria-label="通知（未読 3 件）"
            className="w-(--spacing-control) px-0"
          >
            <Icon icon={BellIcon} standalone />
          </Button>
        </Badge>
      </div>
    </Stack>
  ),
  入力欄: () => (
    <Stack>
      <TextField
        label="記事を探す"
        placeholder="キーワード"
        prefix={<Icon icon={MagnifyingGlassIcon} />}
        className="w-full"
      />
      <Select
        label="担当"
        prefix={<Icon icon={UserIcon} />}
        items={[
          { value: 'kazu', label: 'かずえもん' },
          { value: 'guest', label: 'ゲスト' },
        ]}
        defaultValue="kazu"
      />
    </Stack>
  ),
  'リンク・一覧の行': () => (
    <Stack>
      <Link appearance="outline" href="#">
        <Icon icon={GithubLogoIcon} />
        GitHub
      </Link>
      <Text>
        詳しくは{' '}
        <Link href="#" target="_blank">
          リリースノート
        </Link>{' '}
        を見てください。
      </Text>
      <ul className="flex w-full flex-col divide-y divide-line border-y border-line">
        {settingRows.map(({ icon, label }) => (
          <li key={label} className="flex items-center gap-3 py-3 text-body">
            <Icon icon={icon} className="text-fg-muted" />
            <span className="grow">{label}</span>
            <Icon icon={CaretRightIcon} className="text-fg-subtle" />
          </li>
        ))}
      </ul>
    </Stack>
  ),
  'お知らせ・タグ・Badge': () => (
    <Stack>
      <Notice color="info" icon={<Icon icon={RocketLaunchIcon} />} title="新しい版を公開しました">
        読み込み直すと反映されます。
      </Notice>
      <div className="flex flex-wrap items-center gap-2">
        <Tag color="primary" className="gap-1">
          <Icon icon={SparkleIcon} />
          新着
        </Tag>
        <Tag className="gap-1">
          <Icon icon={TagIcon} />
          デザイン
        </Tag>
        <Badge count={12} color="primary" />
      </div>
    </Stack>
  ),
  '見出し・文・段': () => (
    <Stack>
      <Heading level={3} size={2}>
        <Icon icon={RocketLaunchIcon} size="text" /> はじめに
      </Heading>
      <Text>
        右上の <Icon icon={GearSixIcon} size="text" /> から設定を開き、
        <Icon icon={ArrowSquareOutIcon} size="text" /> で外に共有できます。
      </Text>
      <div className="flex items-end gap-4">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} className="flex flex-col items-center gap-1">
            <Icon icon={SparkleIcon} size={size} />
            <span className="text-xs text-fg-subtle">{size}</span>
          </div>
        ))}
        <div className="flex flex-col items-center gap-1">
          <Icon icon={SparkleIcon} size="lg" standalone />
          <span className="text-xs text-fg-subtle">lg・単体</span>
        </div>
      </div>
    </Stack>
  ),
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/88 アイコンの大きさと線の太さ',
  id: 'design-review-88-icon',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={88}
      axis="アイコンの大きさと線の太さ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => cells[column.label]?.()}
    >
      <p>
        <strong>決定: B（ADR はあとで書く）。</strong>
        既定の大きさを周りの文字に比例（1.25em）にし、部品の大きさ（control）は size
        の指定で選べるようにしました。部品に畳んだので、今はどの行も B
        と同じ大きさで描かれます（線の太さの D は、そのまま比べられます）。
      </p>
      <p>
        利用者が持ち込むアイコン（Phosphor を基本に、ほかのライブラリや SVG も）を、
        <code>&lt;Icon icon=&#123;…&#125; /&gt;</code> で置いたときの大きさと線の太さを選びます。
        どの場面でも、アイコンは size を指定せずに置いています（見出し・文の列だけ size="text"）。
      </p>
      <p>
        見どころ:
        既定の大きさを「部品の大きさ（密度で変わる）」にするか「周りの文字に比例」にするか。
        タグ（小さい文字）と入力欄（部品より大きい文字）で差が出ます。各案の「変わるところ」に、現行版と比べてどの場面がどう変わるかを書いています。ツールバーの「密度」を指にすると、部品の大きさは
        16px に変わります。
      </p>
      <p>
        どれを既定にし、どれを size の指定で選べるようにするかも選べます（例:
        既定は現行版、文字に比例は size="text"）。線の太さ（D）は大きさと別に選べます。
      </p>
    </Comparison>
  ),
};
