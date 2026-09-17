import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';

import { Button } from '../../src/components/button/Button';
import { Dialog } from '../../src/components/dialog/Dialog';
import { TextField } from '../../src/components/text-field/TextField';
import { OverlayClose } from '../../src/internal/overlay/overlay-close';
import { type Candidate, type Column, Comparison } from './Comparison';
import { OverlayFrame } from './overlay-frame';

// 後半の軸 82: Dialog の角と大きさ — 現行版（カードの角・24px・480px）
// 変えるのは --dialog-radius・--dialog-padding・--dialog-width だけ。全案（現行版を含む）で軸の値を明示する

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'カードの角・24px・480px',
    intent: '部品（ボタン）を包むので、カードと同じ一段大きい角。余白はゆったり。',
    spec: [
      ['角', 'カード（16px）'],
      ['余白', '24px'],
      ['幅', '480px'],
    ],
    tokens: {
      '--dialog-radius': 'var(--radius-card)',
      '--dialog-padding': 'calc(var(--spacing) * 6)',
      '--dialog-width': 'calc(var(--spacing) * 120)',
    },
  },
  {
    id: 'A',
    name: '部品の角',
    intent: 'Popover や浮かぶ選択肢と同じ、部品の角にする。大きさは現行版のまま。',
    spec: [
      ['角', '部品（12px）'],
      ['余白', '24px'],
      ['幅', '480px'],
    ],
    tokens: {
      '--dialog-radius': 'var(--radius-control)',
      '--dialog-padding': 'calc(var(--spacing) * 6)',
      '--dialog-width': 'calc(var(--spacing) * 120)',
    },
  },
  {
    id: 'B',
    name: '小さく詰める',
    intent: '角はカードのまま、余白と幅を詰める。確かめるだけの小さな Dialog に向く。',
    spec: [
      ['角', 'カード（16px）'],
      ['余白', '20px'],
      ['幅', '400px'],
    ],
    tokens: {
      '--dialog-radius': 'var(--radius-card)',
      '--dialog-padding': 'calc(var(--spacing) * 5)',
      '--dialog-width': 'calc(var(--spacing) * 100)',
    },
  },
  {
    id: 'C',
    name: '広くとる',
    intent: '角はカードのまま、余白と幅を広げる。入力欄を並べる Dialog に向く。',
    spec: [
      ['角', 'カード（16px）'],
      ['余白', '32px'],
      ['幅', '560px'],
    ],
    tokens: {
      '--dialog-radius': 'var(--radius-card)',
      '--dialog-padding': 'calc(var(--spacing) * 8)',
      '--dialog-width': 'calc(var(--spacing) * 140)',
    },
  },
];

const columns: Column[] = [
  { label: '確かめる', note: '題と説明だけ' },
  { label: '入力', note: '中身に入力欄' },
];

const cells: Record<string, (tokens: CSSProperties | undefined) => ReactNode> = {
  確かめる: (tokens) => (
    <OverlayFrame density="fine" style={tokens} className="h-[320px] w-[640px]">
      {(frame) => (
        <Dialog
          title="下書きを削除しますか？"
          description="削除した下書きは元に戻せません。"
          presentation="popover"
          modal={false}
          initialFocus="popup"
          // 比べるあいだ開いたままにする（外や中のボタンを押しても閉じない）
          open
          container={frame}
          actions={
            <>
              <OverlayClose render={<Button appearance="outline">キャンセル</Button>} />
              <OverlayClose render={<Button color="danger">削除する</Button>} />
            </>
          }
        />
      )}
    </OverlayFrame>
  ),
  入力: (tokens) => (
    <OverlayFrame density="fine" style={tokens} className="h-[480px] w-[640px]">
      {(frame) => (
        <Dialog
          title="プロフィールを編集"
          description="公開するプロフィールに表示されます。"
          presentation="popover"
          modal={false}
          initialFocus="popup"
          // 比べるあいだ開いたままにする（外や中のボタンを押しても閉じない）
          open
          container={frame}
          actions={
            <>
              <OverlayClose render={<Button appearance="outline">キャンセル</Button>} />
              <OverlayClose render={<Button color="primary">保存する</Button>} />
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <TextField label="表示名" defaultValue="かずえもん" />
            <TextField label="ひとこと" defaultValue="UI を作っています" />
          </div>
        </Dialog>
      )}
    </OverlayFrame>
  ),
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/82 Dialog の角と大きさ',
  id: 'design-review-82-dialog-shape',
  parameters: { layout: 'fullscreen' },
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
  render: ({ pick }) => (
    <Comparison
      index={82}
      axis="Dialog の角と大きさ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => cells[column.label]?.(candidate.tokens)}
    >
      <p>
        <strong className="text-fg">決定: 現行版（カードの角・24px・480px）</strong>。「82
        は現行版」
      </p>
      <p>
        中央に浮かべる Dialog
        の、角・内側の余白・幅を選びます。原則5では、部品を包むものは一段大きい角、浮かぶ面（選択肢、メニュー）は部品の角です。Dialog
        はボタンや入力欄を包む浮かぶ面なので、どちらにも読めます。
      </p>
      <p>
        幅は既定の値で、画面が狭いときは縮みます。使う側は className
        で幅を変えられます。題と説明の大きさは軸 81 の B です。
      </p>
    </Comparison>
  ),
};
