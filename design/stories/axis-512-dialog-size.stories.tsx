import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { OverlayFrame } from './overlay-frame';
import { Button } from '../../src/components/button/Button';
import { Dialog, type DialogSize } from '../../src/components/dialog/Dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../src/components/table/Table';
import { Text } from '../../src/components/text/Text';
import { TextField } from '../../src/components/text-field/TextField';
import { OverlayClose } from '../../src/internal/overlay/overlay-close';

// 軸 512: Dialog の幅の段（size: sm・md・lg）
const meta = {
  title: 'Design Review/512 Dialog の幅の段',
  id: 'design-review-512-dialog-size',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const sp = (n: number) => `calc(var(--spacing) * ${n})`;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '段なし（いつも 480px）',
    intent: 'いまは幅の段がなく、どの面も 480px。変えるときは className に w-* を渡す。比べるための基準',
    spec: [
      ['sm', '480px'],
      ['md（既定）', '480px'],
      ['lg', '480px'],
    ],
    tokens: { '--dialog-width-sm': sp(120), '--dialog-width': sp(120), '--dialog-width-lg': sp(120) },
  },
  {
    id: 'A',
    name: '384・480・640',
    intent:
      'md はいまの 480px のまま。sm は 1 段狭く（確かめ・短い問い）、lg は表や長い文が読める幅。段の差は 96px と 160px',
    spec: [
      ['sm', '384px'],
      ['md（既定）', '480px'],
      ['lg', '640px'],
    ],
    tokens: { '--dialog-width-sm': sp(96), '--dialog-width': sp(120), '--dialog-width-lg': sp(160) },
  },
  {
    id: 'B',
    name: '400・520・720',
    intent:
      'md を少し広げて、入力欄 2 つを横に並べやすくする。lg は本文の読みやすい幅（Prose の幅）に近い 720px',
    spec: [
      ['sm', '400px'],
      ['md（既定）', '520px'],
      ['lg', '720px'],
    ],
    tokens: { '--dialog-width-sm': sp(100), '--dialog-width': sp(130), '--dialog-width-lg': sp(180) },
  },
  {
    id: 'C',
    name: '360・480・800',
    intent: '段の差を大きくして、選んだ段の違いがはっきり分かるようにする。lg は表を置く面',
    spec: [
      ['sm', '360px'],
      ['md（既定）', '480px'],
      ['lg', '800px'],
    ],
    tokens: { '--dialog-width-sm': sp(90), '--dialog-width': sp(120), '--dialog-width-lg': sp(200) },
  },
];

const columns: Column[] = [
  { label: 'size="sm"', note: '確かめ。文 1 行とボタン 2 つ' },
  { label: 'size="md"（既定）', note: '入力欄が 2 つの面' },
  { label: 'size="lg"', note: '表を見せる面' },
];

const sizeOf = (column: Column): DialogSize =>
  column.label.includes('sm') ? 'sm' : column.label.includes('lg') ? 'lg' : 'md';

const frameWidth: Record<DialogSize, number> = { sm: 520, md: 620, lg: 860 };

const rows = [
  ['4 月分', '12,800 円', '支払い済み'],
  ['5 月分', '12,800 円', '支払い済み'],
  ['6 月分', '13,200 円', '未払い'],
];

function Content({ size }: { size: DialogSize }) {
  if (size === 'sm') return <Text>この下書きを削除しますか？</Text>;
  if (size === 'md') {
    return (
      <div className="flex flex-col gap-3">
        <TextField label="表示名" defaultValue="かずえもん" />
        <TextField label="ひとこと" defaultValue="UI のライブラリを作っています" />
      </div>
    );
  }
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>月</TableHeader>
          <TableHeader align="end">金額</TableHeader>
          <TableHeader>状態</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map(([month, amount, state]) => (
          <TableRow key={month}>
            <TableCell>{month}</TableCell>
            <TableCell align="end">{amount}</TableCell>
            <TableCell>{state}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

const titles: Record<DialogSize, string> = {
  sm: '下書きを削除',
  md: 'プロフィールを編集',
  lg: '支払いの履歴',
};

function Cell({ column }: { column: Column }) {
  const size = sizeOf(column);
  return (
    <OverlayFrame width={frameWidth[size]} height={size === 'sm' ? 260 : 380}>
      {(frame) => (
        <Dialog
          title={titles[size]}
          presentation="popover"
          size={size}
          modal={false}
          dismissible={false}
          autoFocus={false}
          defaultOpen
          portalContainer={frame}
          actions={
            <>
              <OverlayClose render={<Button variant="outline">キャンセル</Button>} />
              <OverlayClose
                render={
                  <Button color={size === 'sm' ? 'danger' : 'primary'}>
                    {size === 'sm' ? '削除する' : size === 'md' ? '保存する' : '閉じる'}
                  </Button>
                }
              />
            </>
          }
        >
          <Content size={size} />
        </Dialog>
      )}
    </OverlayFrame>
  );
}

export const Compare: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={512}
      axis="Dialog の幅の段（size）"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <Cell column={column} />}
    >
      <p>
        中央に浮かべる Dialog の幅を、size（sm・md・lg）の 3 段で選べるようにします。既定は md。決めるのは各段の幅です。画面が狭いときは、どの段も左右に余白を残して縮みます。シートで出すときは幅いっぱいです。
      </p>
      <p>
        全画面（size="full"）は、あとで同じ size に足せる形にしてあります（今回は作っていません）。枠は段ごとに幅を変えた画面の代わりです。
      </p>
    </Comparison>
  ),
};
