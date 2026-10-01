import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { DataTable } from '../../src/components/data-table/DataTable';
import { DataTableHeader } from '../../src/components/data-table/DataTableHeader';
import { Inspector } from '../../src/components/inspector/Inspector';
import { InspectorLayout } from '../../src/components/inspector/InspectorLayout';
import { TableBody, TableCell, TableHead, TableRow } from '../../src/components/table/Table';
import { Text } from '../../src/components/text/Text';
import { statePseudo } from '../../src/stories/story-states';

// 軸 515: 幅を変えるつまみの見た目（Sidebar と共有。Inspector の resizable、DataTable の列）
const handle =
  ':is([data-target="1"] > [data-slot="data-table-resize-handle"], [data-slot="inspector-resize-handle"])';

const meta = {
  title: 'Design Review/515 幅を変えるつまみ',
  id: 'design-review-515-resize-handle',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({ hover: handle, active: handle, focusVisible: handle }),
  },
  args: { pick: 'current,A' },
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

const base = {
  '--resize-handle-rest': 'transparent',
  '--resize-handle-hover': 'var(--color-line-strong)',
  '--resize-handle-active': 'var(--color-line-strong)',
  '--resize-handle-focus': 'var(--color-primary)',
  '--resize-handle-line-width': 'var(--border-width-thick)',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'Sidebar と同じ（載せると濃いグレーの線）',
    intent:
      'Sidebar で決めた形（ADR-0362 の A）をそのまま使う。ふだんは境の線だけ、載せる・押す・動かすと濃いグレーの太い線、キーボードのフォーカスで青い線',
    spec: [
      ['ふだん', 'なし（境の線だけ）'],
      ['載せた・押している', '濃いグレー 2px'],
      ['フォーカス', '青 2px'],
    ],
    tokens: base,
  },
  {
    id: 'A',
    name: 'ふだんから淡い線',
    intent:
      '表の列の境のように、もとの境の線が薄い（または無い）場所でも、幅を変えられることに気づけるよう、ふだんから淡い線を出す。載せると濃くなる',
    spec: [
      ['ふだん', '淡い線（line）2px'],
      ['載せた・押している', '濃いグレー 2px'],
      ['フォーカス', '青 2px'],
    ],
    tokens: { ...base, '--resize-handle-rest': 'var(--color-line)' },
  },
  {
    id: 'B',
    name: '押している間は青',
    intent:
      '載せたときは現行版と同じ濃いグレー。押して動かしているあいだだけ青にして、つかんだことを返す。青はフォーカスの色でもあるので、押しているときとフォーカスが同じ色になる',
    spec: [
      ['ふだん', 'なし'],
      ['載せた', '濃いグレー 2px'],
      ['押している', '青 2px'],
      ['フォーカス', '青 2px'],
    ],
    tokens: { ...base, '--resize-handle-active': 'var(--color-primary)' },
  },
  {
    id: 'C',
    name: '太い線（4px）',
    intent: '色は現行版のまま、線を 4px に太くして、つかめる場所をはっきり見せる',
    spec: [
      ['ふだん', 'なし'],
      ['載せた・押している', '濃いグレー 4px'],
      ['フォーカス', '青 4px'],
    ],
    tokens: { ...base, '--resize-handle-line-width': 'var(--spacing)' },
  },
];

const columns: Column[] = [
  { label: '通常' },
  { label: '載せた（hover）', preview: 'hover' },
  { label: '押している', preview: 'active' },
  { label: 'フォーカス（キーボード）', preview: 'focus' },
];

const rows = [
  ['#1024', 'かずえもん', '12,800 円'],
  ['#1025', 'たなか', '3,200 円'],
];

function Cell() {
  return (
    <div className="flex w-[300px] flex-col gap-4" data-density="fine">
      <div className="h-[140px] overflow-hidden rounded-card border border-line bg-bg">
        <InspectorLayout
          defaultOpen
          inspector={
            <Inspector title="詳細" resizable defaultWidth={160} minWidth={120} motion="none">
              <Text>選んだ注文</Text>
            </Inspector>
          }
        >
          <div className="p-3 text-sm text-fg-muted">本文</div>
        </InspectorLayout>
      </div>
      <DataTable accessibleName="注文">
        <TableHead>
          <TableRow>
            <DataTableHeader resizable defaultWidth={80} resizeName="番号の列の幅" data-target="1">
              番号
            </DataTableHeader>
            <DataTableHeader resizable resizeName="名前の列の幅">
              名前
            </DataTableHeader>
            <DataTableHeader align="end" resizable resizeName="金額の列の幅">
              金額
            </DataTableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(([id, name, amount]) => (
            <TableRow key={id}>
              <TableCell>{id}</TableCell>
              <TableCell>{name}</TableCell>
              <TableCell align="end">{amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>
    </div>
  );
}

export const Compare: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={515}
      axis="幅を変えるつまみ（Sidebar・Inspector・DataTable の列）"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={() => <Cell />}
    >
      <p>
        決定:
        幅を変えるつまみの既定は現行版（ふだんは見えず、載せると濃いグレーの線）。表の列（DataTableHeader
        の resizable）では
        A（ふだんから淡い線）を使う。ユーザーの返事「現行版が良さそうですが、表の場合は A
        のパターンも必要そうですね」候補の見た目は、トークンを畳む前のこのコミットで比べられます。
      </p>
      <p>
        Sidebar の幅を変えるつまみを部品の外（internal）へ移し、Inspector の resizable と DataTable
        の列（DataTableHeader の resizable）でも同じつまみを使うようにしました。どの行も 3
        つの部品に同じように効きます（Sidebar の見た目も変わります）。状態の列では、上の Inspector
        の境と、表の「番号」の列の右の境のつまみに状態を当てています。
      </p>
      <p>
        動きは全案で同じです。ドラッグで幅を変え、キーボードではつまみにフォーカスして ← → で 16px
        ずつ、Home・End で最小・最大（DataTable の列は上限を渡したときだけ
        End）。ダブルクリックではじめの幅に戻ります。読み上げは
        role="separator"（縦）で、名前（resizeName）、いまの幅（aria-valuenow）、最小・最大を読みます。
      </p>
      <p>
        つかめる幅は 8px
        で、境の線の上に半分ずつ重ねます。部品ごとに見た目を変える（たとえば表の列だけふだんから線を出す）こともトークンでできるので、「X
        を既定にして、表だけ Y」という決め方もできます。
      </p>
    </Comparison>
  ),
};
