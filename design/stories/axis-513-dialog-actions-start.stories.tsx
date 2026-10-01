import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { OverlayFrame } from './overlay-frame';
import { Button } from '../../src/components/button/Button';
import { Checkbox } from '../../src/components/checkbox/Checkbox';
import { Dialog, DialogActions } from '../../src/components/dialog/Dialog';
import { Form } from '../../src/components/form/Form';
import { Text } from '../../src/components/text/Text';
import { TextField } from '../../src/components/text-field/TextField';
import { OverlayClose } from '../../src/internal/overlay/overlay-close';

// 軸 513: Dialog の下の操作の左に置く文（actionsStart・DialogActions の start）の文字
const meta = {
  title: 'Design Review/513 Dialog の操作の左に置く文',
  id: 'design-review-513-dialog-actions-start',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '小さい淡い文字',
    intent:
      '足したときの形。キャプションと同じ大きさ（小さい）で、淡い文字。ボタンより一段控えめに置き、補足として読ませる',
    spec: [
      ['大きさ', 'キャプション'],
      ['色', '淡い文字（fg-muted）'],
    ],
    tokens: {
      '--overlay-actions-start-size': 'var(--text-caption)',
      '--overlay-actions-start-leading': 'var(--leading-caption)',
      '--overlay-actions-start-color': 'var(--color-fg-muted)',
    },
  },
  {
    id: 'A',
    name: '部品の文字・淡い色',
    intent:
      '大きさはボタンや中身の文字と同じにし、色だけ淡くする。チェックボックスを置いたときと文字の大きさがそろう',
    spec: [
      ['大きさ', '部品の文字（control）'],
      ['色', '淡い文字（fg-muted）'],
    ],
    tokens: {
      '--overlay-actions-start-size': 'var(--text-control)',
      '--overlay-actions-start-leading': 'var(--leading-control)',
      '--overlay-actions-start-color': 'var(--color-fg-muted)',
    },
  },
  {
    id: 'B',
    name: '部品の文字・本文の色',
    intent: '中身の文字と同じ大きさ・同じ色。補足ではなく、読ませたい知らせとして置く',
    spec: [
      ['大きさ', '部品の文字（control）'],
      ['色', '本文の色（fg）'],
    ],
    tokens: {
      '--overlay-actions-start-size': 'var(--text-control)',
      '--overlay-actions-start-leading': 'var(--leading-control)',
      '--overlay-actions-start-color': 'var(--color-fg)',
    },
  },
];

const columns: Column[] = [
  { label: '文（actionsStart）', note: '中央に浮かべる。保存の状態' },
  { label: 'チェックボックス', note: '「次から表示しない」' },
  { label: 'DialogActions の start', note: '中身の Form の中に置いた帯' },
  { label: 'シート（指・狭い画面）', note: '縦に積むときは操作の上に置く' },
];

const actions = (
  <>
    <OverlayClose render={<Button variant="outline">キャンセル</Button>} />
    <OverlayClose render={<Button color="primary">保存する</Button>} />
  </>
);

function Cell({ column }: { column: Column }) {
  if (column.label.startsWith('シート')) {
    return (
      <OverlayFrame width={340} height={420} density="coarse">
        {(frame) => (
          <Dialog
            title="プロフィールを編集"
            presentation="sheet"
            modal={false}
            dismissible={false}
            autoFocus={false}
            defaultOpen
            portalContainer={frame}
            actions={actions}
            actionsStart="最後に保存: 3 分前"
          >
            <TextField label="表示名" defaultValue="かずえもん" />
          </Dialog>
        )}
      </OverlayFrame>
    );
  }
  const inForm = column.label.startsWith('DialogActions');
  const checkbox = column.label === 'チェックボックス';
  return (
    <OverlayFrame width={520} height={300}>
      {(frame) => (
        <Dialog
          title={checkbox ? '新しい機能のお知らせ' : 'プロフィールを編集'}
          presentation="popover"
          modal={false}
          dismissible={false}
          autoFocus={false}
          defaultOpen
          portalContainer={frame}
          actions={
            inForm ? undefined : checkbox ? (
              <OverlayClose render={<Button color="primary">わかりました</Button>} />
            ) : (
              actions
            )
          }
          actionsStart={
            inForm ? undefined : checkbox ? (
              <Checkbox label="次から表示しない" />
            ) : (
              '最後に保存: 3 分前'
            )
          }
        >
          {inForm ? (
            <Form onSubmit={(event) => event.preventDefault()}>
              <TextField label="表示名" defaultValue="かずえもん" />
              <DialogActions start="* は必須の項目です">{actions}</DialogActions>
            </Form>
          ) : checkbox ? (
            <Text>一覧の並べ替えを、見出しを押すだけでできるようにしました。</Text>
          ) : (
            <TextField label="表示名" defaultValue="かずえもん" />
          )}
        </Dialog>
      )}
    </OverlayFrame>
  );
}

export const Compare: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={513}
      axis="Dialog の下の操作の左に置く文"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <Cell column={column} />}
    >
      <p>
        決定: actionsStart（と DialogActions・DrawerActions の start）は JSX
        を置く場所にし、部品は文字の大きさや色を付けない（使う人が Text などで決める。List の
        trailing
        と同じ考え）。文字列だけを渡されたときは、現行版（キャプションの大きさ・淡い色）で描く。ユーザーの返事「どこかの軸で回答した、ユーザーに
        Text
        コンポーネントを自分で入れてもらう、という形がよさそうです。文字だけ渡されたときは現行版ですかね。」候補の見た目は、トークンを畳む前のこのコミットで比べられます。
      </p>
      <p>
        Dialog
        の下の操作（actions）の左に、保存の状態や注記、「次から表示しない」のチェックボックスを置けるようにします。props
        は actionsStart（中身に置く DialogActions・DrawerActions では
        start）です。決めるのは文字の大きさと色です。
      </p>
      <p>
        置き方は全案で同じです。中央に浮かべるときは左の端に寄せて、操作と縦の中央をそろえます。幅が足りないときは折り返して操作の上に回ります。シートで操作を縦に積むとき（stack・stack-reverse）と幅を等分するとき（fill）は、操作の上に
        1 行で置きます。中に置いた部品（チェックボックス）は、その部品の大きさのままです。
      </p>
    </Comparison>
  ),
};
