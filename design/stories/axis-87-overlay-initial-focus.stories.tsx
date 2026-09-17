import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Button } from '../../src/components/button/Button';
import { Dialog } from '../../src/components/dialog/Dialog';
import { TextField } from '../../src/components/text-field/TextField';
import type { OverlayInitialFocus } from '../../src/internal/overlay/initial-focus';
import { OverlayClose } from '../../src/internal/overlay/overlay-close';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 87: Dialog・Drawer を開いた直後のフォーカス — 現行版を既定にし、中身の要素の autoFocus でフォーカスの場所を決められる
// トークンではなく、部品の指定（initialFocus）を行ごとに変える。フォーカスは同時に 1 つしか置けないので、開いた状態では並べず、押して開く

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '右上の ×（Base UI の既定）',
    intent: '最初に Tab で止まるもの。× があれば × に移る。キーボードで開くと × に線が出る。',
    spec: [['開いた直後', '最初に Tab で止まるもの（×）']],
  },
  {
    id: 'A',
    name: '中身の最初',
    intent:
      '× を飛ばし、中身と下の操作のうち最初のものに移る。入力欄があればすぐ打てる。確かめるだけなら最初のボタン。',
    spec: [['開いた直後', '中身と下の操作の最初（× を飛ばす）']],
  },
  {
    id: 'B',
    name: '面そのもの',
    intent: '面に移り、線は出さない。読み上げは題から読み始め、次の Tab で × へ移る。',
    spec: [['開いた直後', '面（次の Tab で ×）']],
  },
];

const focusOf: Record<string, OverlayInitialFocus> = { 現行版: 'first', A: 'content', B: 'popup' };

const columns: Column[] = [
  { label: '入力', note: '中身に入力欄' },
  { label: '確かめる', note: '題と説明だけ' },
];

const cells: Record<string, (focus: OverlayInitialFocus) => ReactNode> = {
  入力: (focus) => (
    <Dialog
      title="プロフィールを編集"
      description="公開するプロフィールに表示されます。"
      presentation="popover"
      initialFocus={focus}
      trigger={<Button>プロフィールを編集</Button>}
      actions={
        <>
          <OverlayClose render={<Button appearance="outline">キャンセル</Button>} />
          <OverlayClose render={<Button color="primary">保存する</Button>} />
        </>
      }
    >
      <TextField label="表示名" defaultValue="かずえもん" />
    </Dialog>
  ),
  確かめる: (focus) => (
    <Dialog
      title="下書きを削除しますか？"
      description="削除した下書きは元に戻せません。"
      presentation="popover"
      initialFocus={focus}
      trigger={<Button>下書きを削除</Button>}
      actions={
        <>
          <OverlayClose render={<Button appearance="outline">キャンセル</Button>} />
          <OverlayClose render={<Button color="danger">削除する</Button>} />
        </>
      }
    />
  ),
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/87 開いた直後のフォーカス',
  id: 'design-review-87-overlay-initial-focus',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
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
      index={87}
      axis="開いた直後のフォーカス"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => cells[column.label]?.(focusOf[candidate.id])}
    >
      <p>
        <strong className="text-fg">
          決定: 現行版を既定にし、中身の要素の autoFocus でフォーカスの場所を決められる
        </strong>
        。「87 は現行がデフォルトで、autofocus 属性みたいなのでコントロールできますか？」
      </p>
      <p>
        Dialog と Drawer
        を開いた直後に、フォーカスをどこに置くかを選びます。線（原則2）が出るのはキーボードで操作したときだけなので、ボタンに
        Tab で移って Enter で開き、線の出る場所と、次の Tab
        で移る先を見てください。マウスで開いても、線が出ないだけで同じ場所に移ります。
      </p>
      <p>閉じると、フォーカスは開いたボタンに戻ります。</p>
    </Comparison>
  ),
};
