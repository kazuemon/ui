import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { OverlayFrame } from './overlay-frame';
import { Button } from '../../src/components/button/Button';
import {
  Dialog,
  DialogActions,
  type DialogScrollBehavior,
} from '../../src/components/dialog/Dialog';
import { Form } from '../../src/components/form/Form';
import { Text } from '../../src/components/text/Text';
import { TextField } from '../../src/components/text-field/TextField';
import { OverlayClose } from '../../src/internal/overlay/overlay-close';

// 軸 511: Dialog の中身が画面より高いときのスクロール（scrollBehavior の既定）
const meta = {
  title: 'Design Review/511 Dialog のスクロールのしかた',
  id: 'design-review-511-dialog-scroll',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '面ごとスクロール（viewport）',
    intent:
      'いまの形。面の高さは中身のまま伸び、画面（枠）の中で面ごとスクロールする。スクロールすると題と下の操作も一緒に流れて見えなくなる',
    spec: [
      ['scrollBehavior', 'viewport'],
      ['題・下の操作', '中身と一緒に流れる'],
      ['続きの印', 'なし（面の端が画面の端で切れる）'],
    ],
  },
  {
    id: 'A',
    name: '中身だけスクロール（content）',
    intent:
      '面の高さを画面に収め、題と下の操作を残して中身だけをスクロールする。続きの印はシートと同じ（上は区切り線、下は内側の影と、下に操作があれば区切り線）。DialogActions は中身の下の端に貼り付く',
    spec: [
      ['scrollBehavior', 'content'],
      ['題・下の操作', '残る'],
      ['続きの印', 'シートと同じ（区切り線と内側の影）'],
    ],
  },
];

const columns: Column[] = [
  { label: '開いた直後', note: '中身が長い。actions に操作を渡す' },
  { label: '中ほどまでスクロール', note: '同じ面を半分スクロールしたところ' },
  { label: 'DialogActions（Form の中）', note: '中ほどまでスクロール' },
  { label: '中身が短いとき', note: '面が画面に収まる。どちらも同じ見た目のはず' },
];

const behaviorOf = (candidate: Candidate): DialogScrollBehavior =>
  candidate.id === 'A' ? 'content' : 'viewport';

const longText = [
  'イベントの参加申し込みを受け付けました。当日の受付は 9 時から、会場の 1 階のロビーで行います。',
  '受付では、申し込みのときに届いたメールの画面か、印刷したものを見せてください。名札をお渡しします。',
  '会場には駐車場がありません。最寄りの駅から歩いて 5 分ほどです。雨の日は、駅の東口から屋根のある通路を通れます。',
  'お昼ご飯は用意していません。会場の 2 階に、飲み物と軽食を持ち込める休憩室があります。',
  '発表の資料は、終わったあとにメールでお送りします。写真の撮影は、発表者が許可した場合だけにしてください。',
  '欠席するときは、前日までにこの画面から取り消してください。キャンセル待ちの人に席をお譲りします。',
];

const actions = (
  <>
    <OverlayClose render={<Button variant="outline">閉じる</Button>} />
    <OverlayClose render={<Button color="primary">参加を確定する</Button>} />
  </>
);

function Body({ short = false }: { short?: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      {(short ? longText.slice(0, 1) : longText).map((line) => (
        <Text key={line}>{line}</Text>
      ))}
    </div>
  );
}

function scrollSelector(behavior: DialogScrollBehavior) {
  // viewport: 面を置く枠（面の親）がスクロールする。content: 中身がスクロールする
  return behavior === 'content' ? '[data-slot="dialog-content"]' : '[data-slot="dialog-viewport"]';
}

function Cell({ column, candidate }: { column: Column; candidate: Candidate }) {
  const behavior = behaviorOf(candidate);
  const scrolled = column.label !== '開いた直後' && column.label !== '中身が短いとき';
  const inForm = column.label.startsWith('DialogActions');
  const short = column.label === '中身が短いとき';
  return (
    <OverlayFrame
      scroll={scrolled ? { selector: scrollSelector(behavior), ratio: 0.5 } : undefined}
    >
      {(frame) => (
        <Dialog
          title="参加の申し込み"
          description="内容を確かめてから確定してください"
          presentation="popover"
          scrollBehavior={behavior}
          modal={false}
          dismissible={false}
          autoFocus={false}
          defaultOpen
          portalContainer={frame}
          size="sm"
          actions={inForm ? undefined : actions}
        >
          {inForm ? (
            <Form onSubmit={(event) => event.preventDefault()}>
              <div className="flex flex-col gap-3">
                <TextField label="お名前" defaultValue="かずえもん" />
                <Body />
                <DialogActions>{actions}</DialogActions>
              </div>
            </Form>
          ) : (
            <Body short={short} />
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
      index={511}
      axis="Dialog の中身が画面より高いときのスクロール"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => <Cell column={column} candidate={candidate} />}
    >
      <p>
        中央に浮かべる Dialog
        の中身が画面より高いとき、面ごとスクロールするか（現行版）、題と下の操作を残して中身だけをスクロールするか（A）。どちらも
        props（scrollBehavior）で選べるようにしてあり、ここで決めるのは既定です。
      </p>
      <p>
        画面の下から出すシートで出すとき（指で操作していて画面が狭いとき）は、どちらでもいつも中身だけがスクロールします。A
        はシートとそろう形です。枠は 440×360 の画面の代わりで、幅は size="sm"。
      </p>
      <p>
        DialogActions（中身の Form の中に置く帯）は、現行版では中身の最後に流れ、A
        では中身の下の端に貼り付きます（シートの DrawerActions と同じ）。
      </p>
    </Comparison>
  ),
};
