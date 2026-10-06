import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Avatar } from '../../src/components/avatar/Avatar';
import { Chip } from '../../src/components/chip/Chip';
import { Tag } from '../../src/components/tag/Tag';

// 軸 526: Tag・Chip の先頭に四角いアバターを置いたときの余白
const meta = {
  title: 'Design Review/526 タグとチップの四角いアバター',
  id: 'design-review-526-small-parts-square-avatar',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'I' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'F', 'G', 'H', 'I'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const gap = (value: string, concentric = '0') => ({
  '--small-parts-avatar-edge-gap': value,
  '--small-parts-avatar-concentric': concentric,
  '--small-parts-avatar-shift': '0',
  '--small-parts-avatar-shift-inset': 'var(--spacing)',
});
// 右へずらす形。上下の余白を inset にし、アバターを札の丸い端の曲がりより右に置く
const shift = (inset: string) => ({
  ...gap('-100px'),
  '--small-parts-avatar-shift': '1',
  '--small-parts-avatar-shift-inset': inset,
});

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '丸と同じ 4px の余白',
    intent: '四角も丸と同じ余白。角の小さい四角は、札の丸い縁に接したりはみ出したりする',
    spec: [['外周からの離れ', '決めない（余白はいつも 4px）']],
    tokens: gap('-100px'),
  },
  {
    id: 'F',
    name: '外周から 8px',
    intent: '角と縁のあいだをはっきり空ける。四角は札の中で小さな印になる',
    spec: [
      ['外周からの離れ', '8px 以上'],
      ['余白', '4px 以上。角の丸さと札の高さで決まる'],
    ],
    tokens: gap('calc(var(--spacing) * 2)'),
  },
  {
    id: 'G',
    name: '札の左の角をアバターに合わせる',
    intent:
      '四角いアバターのときだけ、札の左の角を「アバターの角 + 4px」に丸める。丸いアバターと同じく、札と同心になり、どこも 4px 離れる。札の左端は pill ではなくなる',
    spec: [
      ['外周からの離れ', 'どこも 4px（同心）'],
      ['余白', '4px（丸と同じ）'],
      ['札の左の角', 'アバターの角 + 4px'],
    ],
    tokens: gap('-100px', '1'),
  },
  {
    id: 'H',
    name: '右へずらす（上下 4px）',
    intent:
      'アバターを札の丸い端の曲がりより右に置く。角が曲がりに寄らないので、上下は丸と同じ 4px のまま大きく置ける。左の余白が広くなる',
    spec: [
      ['上下の余白', '4px（丸と同じ）'],
      ['左の余白', '札の高さの半分 − アバターの角'],
      ['md の札（32px）', 'アバター 24px・左 12px'],
    ],
    tokens: shift('var(--spacing)'),
  },
  {
    id: 'I',
    name: '右へずらす（上下 6px）',
    intent: 'H の上下を少し空け、アバターを一回り小さくする',
    spec: [
      ['上下の余白', '6px'],
      ['左の余白', '札の高さの半分 − アバターの角'],
      ['md の札（32px）', 'アバター 20px・左 12px'],
    ],
    tokens: shift('calc(var(--spacing) * 1.5)'),
  },
];

const columns: Column[] = [
  { label: 'square', note: 'Tag sm・md・lg（ドット絵）' },
  { label: 'rounded', note: 'Tag sm・md・lg（写真）' },
  { label: '角なし', note: '四角の角を 0 に上書きしたとき' },
  {
    label: '縁のある形・Chip',
    note: 'outline の Tag（hane の参加者の札の形）と、消すボタンのある Chip（md・lg）',
  },
  { label: '丸と並べたとき', note: '丸いアバターは札と同心なので 4px のまま' },
];

// 見本の画像（外に取りに行かない）
const svg = (body: string, size = 160) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="160" height="160" shape-rendering="crispEdges">${body}</svg>`)}`;
const photo = svg(
  '<rect width="160" height="160" fill="#7cc4f8"/><circle cx="80" cy="64" r="30" fill="#fff4cc"/><path d="M16 160c0-35 29-56 64-56s64 21 64 56Z" fill="#2f6b58"/>'
);
const palette: Record<string, string> = {
  h: '#3b2a1a',
  s: '#c69c7b',
  d: '#a87d5e',
  w: '#ffffff',
  e: '#4a3b9c',
  m: '#7a4a35',
};
const pixels = (rows: string[]) =>
  svg(
    rows
      .flatMap((row, y) =>
        row
          .split('')
          .map((c, x) => `<rect x="${x}" y="${y}" width="1" height="1" fill="${palette[c]}"/>`)
      )
      .join(''),
    8
  );
const skin = pixels([
  'hhhhhhhh',
  'hhhhhhhh',
  'hssssssh',
  'ssssssss',
  'swessews',
  'ssdssdss',
  'ssmmmmss',
  'ssssssss',
]);
const noop = () => {};

const face = (shape: 'square' | 'rounded' | 'circle', src?: string, name = 'kazuemon') => (
  <Avatar shape={shape} src={src} name={name} alt="" />
);
const sizes = ['sm', 'md', 'lg'] as const;

function Cell({ column }: { column: Column }) {
  switch (column.label) {
    case 'square':
      return (
        <div className="flex flex-col items-start gap-2">
          {sizes.map((size) => (
            <Tag key={size} size={size} avatar={face('square', skin)}>
              kazuemon
            </Tag>
          ))}
        </div>
      );
    case 'rounded':
      return (
        <div className="flex flex-col items-start gap-2">
          {sizes.map((size) => (
            <Tag key={size} size={size} avatar={face('rounded', photo)}>
              かずえもん
            </Tag>
          ))}
        </div>
      );
    case '角なし':
      return (
        <div
          className="flex flex-col items-start gap-2"
          style={{
            ['--avatar-radius-square-xs' as string]: '0px',
            ['--avatar-radius-square-sm' as string]: '0px',
            ['--avatar-radius-square-md' as string]: '0px',
          }}
        >
          {sizes.map((size) => (
            <Tag key={size} size={size} avatar={face('square', skin)}>
              kazuemon
            </Tag>
          ))}
        </div>
      );
    case '縁のある形・Chip':
      return (
        <div className="flex flex-col items-start gap-2">
          <Tag size="md" variant="outline" color="primary" avatar={face('square', skin)}>
            kazuemon
          </Tag>
          <Tag size="lg" variant="outline" color="primary" avatar={face('rounded', photo)}>
            かずえもん
          </Tag>
          <Chip
            size="md"
            avatar={face('square', skin)}
            onRemove={noop}
            removeName="kazuemon を外す"
          >
            kazuemon
          </Chip>
          <Chip
            size="lg"
            avatar={face('rounded', photo)}
            onRemove={noop}
            removeName="かずえもんを外す"
          >
            かずえもん
          </Chip>
        </div>
      );
    default:
      return (
        <div className="flex flex-col items-start gap-2">
          <Tag size="md" avatar={face('square', skin)}>
            kazuemon
          </Tag>
          <Tag size="md" avatar={face('rounded', photo)}>
            かずえもん
          </Tag>
          <Tag size="md" avatar={face('circle', photo, 'かずえもん')}>
            かずえもん
          </Tag>
        </div>
      );
  }
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={526}
      axis="タグとチップの四角いアバター"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <Cell column={column} />}
    >
      <p>
        決定: I（アバターを札の丸い端の曲がりより右に置き、上下は 6px）。「I
        がゆとりがあっていいなあと思いました。」F くらい空けたいが、md
        の札でアバターを大きくしたい、という返事から H・I を足した。
      </p>
      <p>
        Tag・Chip の avatar
        に四角いアバター（square・rounded）を置いたときに、角が札の外周に接さないようにします。上下と左の余白は
        4px
        を下限に、角の丸さと札の高さから、角が外周（縁の線の外側）から決めた分だけ離れる値まで広げます（計算で決まります）。選ぶのは、外周からの最小の離れです。丸いアバターは、外周からいつも
        4px 離れています。
      </p>
      <p>
        札の中の四角の角は、札の大きさに近い Avatar の段の角にしました（sm の札は xs、md は sm、lg
        は md の段）。軸 525 の決定（square は B、rounded は
        C）の値です。丸いアバターは札と同心なので、余白は 4px のままです。hane
        の参加者の札は、md・outline の札に角 4px のスキンを 18px で置いていて、D とほぼ同じです。
      </p>
    </Comparison>
  ),
};
