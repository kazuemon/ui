import {
  BellIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  ShareNetworkIcon,
  TrashIcon,
  XIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Button, type ButtonShape } from '../../src/components/button/Button';
import { CopyButton } from '../../src/components/copy-button/CopyButton';
import { Icon } from '../../src/components/icon/Icon';
import { Notice } from '../../src/components/notice/Notice';
import { CopiedPreviewContext } from '../../src/internal/copy/use-copy';
import { statePseudo } from '../../src/stories/story-states';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 101: アイコンだけのボタン（Button の iconOnly）の形
// 決定: 現行版（部品の角の正方形）を既定にし、A（丸）も shape="round" で選べる
// 比べていたときは --button-icon-only-radius の上書きで作っていた。決めたあと、トークンは shape の props に畳んだので、
//   いまは行ごとに shape を渡して描く（見た目は比べていたときと同じ）
// 大きさ（部品の高さの正方形）は決まっている（原則7・11: 押せる範囲は見た目と同じで、部品の高さ）

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '角丸の四角（部品の角）',
    intent:
      '文字のボタンと同じ部品の角（12px）。お知らせの × と同じ形。文字のボタンと並べたときに、角がそろう。',
    spec: [
      ['形', '部品の高さの正方形・角は部品の角'],
      ['文字が加わったとき', '同じ角のまま横に伸びる'],
    ],
  },
  {
    id: 'A',
    name: '丸',
    intent:
      'アイコンだけのボタンを丸にする。小物（pill）の仲間として、文字のボタンと形で見分けられる。文字のボタンと並ぶと、角がそろわない。',
    spec: [
      ['形', '部品の高さの丸'],
      ['文字が加わったとき', 'pill（両端が丸い）に伸びる'],
    ],
  },
];

const columns: Column[] = [
  { label: '枠線', note: '通常・hover・フォーカス' },
  { label: '塗り', note: 'グレー・Primary・押せない' },
  { label: '文字のボタンと並べる', note: '操作の並び' },
  { label: 'CopyButton', note: '通常・コピーしたあと（文字が加わる）' },
  { label: 'お知らせの × と並べる', note: '× は部品の角のまま（参考）' },
];

const Row = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-wrap items-center gap-3">{children}</div>
);

const shapeOf: Record<string, ButtonShape> = { 現行版: 'square', A: 'round' };

const cells: Record<string, (shape: ButtonShape) => ReactNode> = {
  枠線: (shape) => (
    <Row>
      <Button iconOnly shape={shape} appearance="outline" aria-label="検索">
        <Icon icon={MagnifyingGlassIcon} standalone />
      </Button>
      <span data-preview="hover">
        <Button iconOnly shape={shape} appearance="outline" aria-label="検索（hover）">
          <Icon icon={MagnifyingGlassIcon} standalone />
        </Button>
      </span>
      <span data-preview="focus">
        <Button iconOnly shape={shape} appearance="outline" aria-label="検索（フォーカス）">
          <Icon icon={MagnifyingGlassIcon} standalone />
        </Button>
      </span>
    </Row>
  ),
  塗り: (shape) => (
    <Row>
      <Button iconOnly shape={shape} aria-label="通知">
        <Icon icon={BellIcon} standalone />
      </Button>
      <Button iconOnly shape={shape} color="primary" aria-label="編集">
        <Icon icon={PencilSimpleIcon} standalone />
      </Button>
      <Button iconOnly shape={shape} color="primary" disabled aria-label="編集（押せない）">
        <Icon icon={PencilSimpleIcon} standalone />
      </Button>
    </Row>
  ),
  文字のボタンと並べる: (shape) => (
    <Row>
      <Button color="primary">保存する</Button>
      <Button appearance="outline">キャンセル</Button>
      <Button iconOnly shape={shape} appearance="outline" aria-label="共有">
        <Icon icon={ShareNetworkIcon} standalone />
      </Button>
      <Button iconOnly shape={shape} appearance="outline" color="danger" aria-label="削除">
        <Icon icon={TrashIcon} standalone />
      </Button>
    </Row>
  ),
  CopyButton: (shape) => (
    <Row>
      <CopyButton text="pnpm add @kazuemon/ui" iconOnly shape={shape} feedback="label" />
      <CopiedPreviewContext value>
        <CopyButton text="pnpm add @kazuemon/ui" iconOnly shape={shape} feedback="label" />
      </CopiedPreviewContext>
    </Row>
  ),
  'お知らせの × と並べる': (shape) => (
    <div className="flex w-[300px] flex-col gap-3">
      <Notice color="info" title="下書きを保存しました" onClose={() => {}}>
        あとで続きを書けます。
      </Notice>
      <Row>
        <Button iconOnly shape={shape} appearance="outline" aria-label="閉じる">
          <Icon icon={XIcon} standalone />
        </Button>
      </Row>
    </div>
  ),
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/101 アイコンだけのボタンの形',
  id: 'design-review-101-icon-only-button',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({ hover: 'button', focusVisible: 'button' }),
  },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={101}
      axis="アイコンだけのボタンの形"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => cells[column.label](shapeOf[candidate.id])}
    >
      <p>
        <strong>決定: 現行版（部品の角の正方形）を既定にし、A（丸）も選べるようにしました（</strong>
        <code>shape=&quot;round&quot;</code>
        <strong>）。</strong>
      </p>
      <p>
        Button に、アイコンだけの形（<code>iconOnly</code>
        ）を足しました。大きさは部品の高さの正方形で、読み上げの名前（<code>aria-label</code>
        ）は型で必須にしています。決めるのは角だけです。
      </p>
      <p>
        行 = 角の形。列は置く場面です。CopyButton
        の列の右は、押したあと「コピーしました」の文字が加わって横に伸びたところです（丸の案では
        pill になります）。
      </p>
      <p>
        どちらを既定にするかを選んでください（もう一方を選べる形にもできます）。枠線のアイコンだけのリンク（Link）の形は、この軸では変えていません。
      </p>
    </Comparison>
  ),
};
