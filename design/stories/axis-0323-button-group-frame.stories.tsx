import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button, type ButtonProps } from '../../src/components/button/Button';
import {
  ButtonGroup,
  type ButtonGroupFrame,
  type ButtonGroupOrientation,
} from '../../src/components/button-group/ButtonGroup';

// 軸 0323: ButtonGroup の詰め方（frame）の既定
//   ButtonGroup を作ったとき（design/backlog.md の ButtonGroup の節）、いちばん近い既存の決定である
//   ToggleGroup の詰め方（軸269・ADR-0269）をそのまま流用し、connected を既定にした。これは「原則にない判断」で、
//   Button 自身で比べてはいなかったので、ここで改めて比べる
//   部品のコードは candidate ごとに分けず、ButtonGroup の frame props（connected・gap）をそのまま並べる
type Look = { variant: ButtonProps['variant']; color?: ButtonProps['color'] };

const looks: Record<string, Look> = {
  '塗り（filled）': { variant: 'filled', color: 'neutral' },
  '枠線（outline）': { variant: 'outline', color: 'neutral' },
  '下線（underline）': { variant: 'underline', color: 'neutral' },
  '白（white）': { variant: 'filled', color: 'white' },
  '縦並び（vertical）': { variant: 'outline', color: 'neutral' },
};

const columns: Column[] = [
  { label: '塗り（filled）' },
  { label: '枠線（outline）', note: '自分の枠線と仕切りの線が重なって見える（未解決）' },
  { label: '下線（underline）' },
  { label: '白（white）', note: '自分の枠線と仕切りの線が重なって見える（未解決）' },
  { label: '縦並び（vertical）', note: '枠線（outline）で代表' },
];

const candidates: (Candidate & { frame: ButtonGroupFrame })[] = [
  {
    id: '現行版',
    name: 'connected（隣り合わせ）',
    intent:
      'ButtonGroup を作ったときの既定。隣り合わせに並べ、仕切りの細い線（--color-line）で区切り、両端だけ角丸を残す。ToggleGroup の connected（軸269）と同じ見た目。ひとつながりの操作の並び（ツールバー）に見える一方、枠線や白いボタンのように自分の輪郭を持つ variant では、仕切りの線と輪郭が重なって境界が太く見える。',
    spec: [
      ['frame', 'connected'],
      ['仕切り', '--color-line の細い線（1px）'],
      ['角丸', '両端だけ --radius-control'],
    ],
    frame: 'connected',
  },
  {
    id: 'A',
    name: 'gap（離して並べる）',
    intent:
      'それぞれ離して並べ、角丸と自分の輪郭をそのまま残す。ボタンごとの境界がはっきりし、枠線や白いボタンでも二重の線が出ない。代わりに、ひとつながりの操作に見えづらく、密度の高い並び（原則7）では箱が続いて見える。',
    spec: [
      ['frame', 'gap'],
      ['間', '--button-group-gap（8px）'],
      ['角丸', 'それぞれ --radius-control のまま'],
    ],
    frame: 'gap',
  },
];

function renderCell(column: Column, candidate: Candidate) {
  const look = looks[column.label];
  const frame = candidates.find((c) => c.id === candidate.id)?.frame ?? 'connected';
  const orientation: ButtonGroupOrientation =
    column.label === '縦並び（vertical）' ? 'vertical' : 'horizontal';
  return (
    <ButtonGroup frame={frame} orientation={orientation} aria-label="編集">
      <Button variant={look.variant} color={look.color}>
        切り取り
      </Button>
      <Button variant={look.variant} color={look.color}>
        コピー
      </Button>
      <Button variant={look.variant} color={look.color}>
        貼り付け
      </Button>
    </ButtonGroup>
  );
}

const meta = {
  title: 'Design Review/0323 ButtonGroupの詰め方',
  id: 'design-review-0323-button-group-frame',
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

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={323}
      axis="ButtonGroupの詰め方"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={renderCell}
    >
      <p>
        ButtonGroup（複数の Button を視覚的に連結して並べる部品）の詰め方（frame）の既定を決めます。
        Button 自身では比べておらず、作ったときは ToggleGroup
        の詰め方（軸269・ADR-0269）をいちばん近い 決定として流用し、connected を既定にしました。
      </p>
      <p>
        connected は隣り合わせて仕切りの細い線（--color-line）で区切り、両端だけ角丸を残します。gap
        はそれぞれ離して並べ、角丸とボタン自身の輪郭をそのまま残します。
      </p>
      <p>
        列には見た目（variant・color）の違いを並べました。塗り（filled）と下線（underline）は自分の輪郭を持たないので、connected
        の仕切り線がそのまま境界になります。枠線（outline）と白（white）は自分の輪郭（枠線）を持つので、connected
        では仕切りの線と重なり、ほかの列より境界が太く見えます。この重なりは design/backlog.md の
        ButtonGroup の節に書いた未解決の点で、ここではそれ自体を直さず、見え方として並べています。
      </p>
      <p>
        縦並び（vertical）の列は、枠線（outline）を代表にして、向きを変えても仕切りと角丸が同じ考えで動くかを見ます。
      </p>
      <p>どちらを既定にするか、両方選べるようにしたい場合はあわせて教えてください。</p>
    </Comparison>
  ),
};
