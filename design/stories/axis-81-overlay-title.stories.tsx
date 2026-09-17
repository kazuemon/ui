import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';

import { Button } from '../../src/components/button/Button';
import { Dialog } from '../../src/components/dialog/Dialog';
import { Drawer } from '../../src/components/drawer/Drawer';
import { Popover } from '../../src/components/popover/Popover';
import { Switch } from '../../src/components/switch/Switch';
import { TextField } from '../../src/components/text-field/TextField';
import { OverlayClose } from '../../src/internal/overlay/overlay-close';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 81: Dialog・Drawer・Popover の題と説明の大きさ — B に決定
// 変えるのは --overlay-title-size・--overlay-title-leading・--overlay-description-size・--overlay-description-leading だけ
// この値は src/styles/theme.css の密度の規則が data-density を付けた要素で入れる。浮かぶ面は本体の祖先の密度を自分に写し直すので、
// 候補の値は枠ではなく、面（Popup）そのものに className で書く（Tailwind が拾えるよう、クラスは組み立てずに書く）
// 決まった後に theme.css を更新しても同じ比較を再現できるよう、全案（現行版を含む）で軸の値を明示する

const typeClass: Record<string, string> = {
  現行版: '[--overlay-title-size:var(--text-label)] [--overlay-title-leading:var(--leading-label)] [--overlay-description-size:var(--text-caption)] [--overlay-description-leading:var(--leading-caption)]',
  A: '[--overlay-title-size:var(--text-heading-4)] [--overlay-title-leading:var(--leading-heading-4)] [--overlay-description-size:var(--text-body-sm)] [--overlay-description-leading:var(--leading-body-sm)]',
  B: '[--overlay-title-size:var(--text-heading-3)] [--overlay-title-leading:var(--leading-heading-3)] [--overlay-description-size:var(--text-body-sm)] [--overlay-description-leading:var(--leading-body-sm)]',
  C: '[--overlay-title-size:var(--text-heading-3)] [--overlay-title-leading:var(--leading-heading-3)] [--overlay-description-size:var(--text-control)] [--overlay-description-leading:var(--leading-control)]',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '欄のラベルと同じ',
    intent: '題は欄のラベル、説明はキャプションと同じ大きさ。Select のシートの見出しと同じ。',
    spec: [
      ['題', 'ラベル（マウス 14/20・指 14/20）'],
      ['説明', 'キャプション（12/16）'],
    ],
  },
  {
    id: 'A',
    name: '見出しの 4 段目',
    intent: '題を見出しの 4 段目（本文と同じ大きさの太字）、説明を本文より小さい注記にする。',
    spec: [
      ['題', '見出し 4（マウス 16/28・指 14/24）'],
      ['説明', '小さい本文（マウス 14/24・指 12/20）'],
    ],
  },
  {
    id: 'B',
    name: '見出しの 3 段目',
    intent: '題を中身の文字より一段大きい見出しの 3 段目にし、説明は A と同じ。',
    spec: [
      ['題', '見出し 3（マウス 18/28・指 16/26）'],
      ['説明', '小さい本文（マウス 14/24・指 12/20）'],
    ],
  },
  {
    id: 'C',
    name: '見出しの 3 段目＋中身と同じ説明',
    intent: '題は B と同じ。説明を中身の文字と同じ大きさにし、灰色で区別する。',
    spec: [
      ['題', '見出し 3（マウス 18/28・指 16/26）'],
      ['説明', '部品の文字（マウス 16/24・指 14/20）'],
    ],
  },
];

const columns: Column[] = [
  { label: 'Dialog・確かめる', note: 'マウス。題と説明だけ' },
  { label: 'Dialog・入力', note: 'マウス。中身に入力欄' },
  { label: 'Popover', note: 'マウス' },
  { label: 'シート', note: '指。Drawer・狭い画面の Dialog' },
];

// 重なる面を描く枠
function Frame({
  density,
  className,
  children,
}: {
  density: 'fine' | 'coarse';
  className: string;
  children: (frame: HTMLElement) => ReactNode;
}) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setFrame}
      data-density={density}
      className={`relative ${className} [transform:translateZ(0)] overflow-clip rounded-card border border-line bg-bg`}
    >
      {frame && children(frame)}
    </div>
  );
}

const cancel = <OverlayClose render={<Button appearance="outline">キャンセル</Button>} />;

const cells: Record<string, (type: string) => ReactNode> = {
  'Dialog・確かめる': (type) => (
    <Frame density="fine" className="h-[300px] w-[520px]">
      {(frame) => (
        <Dialog
          title="下書きを削除しますか？"
          description="削除した下書きは元に戻せません。"
          presentation="popover"
          modal={false}
          // 比べるあいだ開いたままにする（外や中のボタンを押しても閉じない）
          open
          container={frame}
          className={type}
          actions={
            <>
              {cancel}
              <OverlayClose render={<Button color="danger">削除する</Button>} />
            </>
          }
        />
      )}
    </Frame>
  ),
  'Dialog・入力': (type) => (
    <Frame density="fine" className="h-[380px] w-[520px]">
      {(frame) => (
        <Dialog
          title="プロフィールを編集"
          description="公開するプロフィールに表示されます。"
          presentation="popover"
          modal={false}
          // 比べるあいだ開いたままにする（外や中のボタンを押しても閉じない）
          open
          container={frame}
          className={type}
          actions={
            <>
              {cancel}
              <OverlayClose render={<Button color="primary">保存する</Button>} />
            </>
          }
        >
          <TextField label="表示名" defaultValue="かずえもん" />
        </Dialog>
      )}
    </Frame>
  ),
  Popover: (type) => (
    <Frame density="fine" className="h-[300px] w-[360px]">
      {(frame) => (
        <div className="flex justify-center pt-6">
          <Popover
            title="表示の設定"
            description="この端末だけに保存されます。"
            presentation="popover"
            trigger={<Button appearance="outline">表示</Button>}
            // 比べるあいだ開いたままにする（外や中のボタンを押しても閉じない）
            open
            container={frame}
            className={type}
          >
            <div className="flex flex-col gap-3">
              <Switch label="画像を表示" defaultChecked />
              <Switch label="動きを減らす" />
            </div>
          </Popover>
        </div>
      )}
    </Frame>
  ),
  シート: (type) => (
    <Frame density="coarse" className="h-[480px] w-[340px]">
      {(frame) => (
        <Drawer
          title="プロフィールを編集"
          description="公開するプロフィールに表示されます。"
          modal={false}
          // 比べるあいだ開いたままにする（外や中のボタンを押しても閉じない）
          open
          container={frame}
          className={type}
          actions={
            <>
              {cancel}
              <OverlayClose render={<Button color="primary">保存する</Button>} />
            </>
          }
        >
          <TextField label="表示名" defaultValue="かずえもん" />
        </Drawer>
      )}
    </Frame>
  ),
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/81 重なる面の題と説明の大きさ',
  id: 'design-review-81-overlay-title',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'B' },
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
  render: ({ pick }) => (
    <Comparison
      index={81}
      axis="重なる面の題と説明の大きさ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => cells[column.label]?.(typeClass[candidate.id])}
    >
      <p>
        <strong className="text-fg">決定: B 見出しの 3 段目</strong>。「B でお願いします」
      </p>
      <p>
        Dialog・Drawer・Popover の題（title）と説明（description）の大きさを選びます。現行版は
        Select
        のシートの見出しと同じ、欄のラベルとキャプションの大きさで、マウスでは中身の文字（16px）より題のほうが小さくなります。
      </p>
      <p>
        題と説明は、読み上げで開いた面の名前と説明になります。部品が大きさを持つので、使う側は文字を渡すだけです。Select
        のシートの見出しは、この軸では変えません（欄のラベルと同じまま）。
      </p>
      <p>右の列は指の密度で、画面の下から出すシートです。</p>
    </Comparison>
  ),
};
