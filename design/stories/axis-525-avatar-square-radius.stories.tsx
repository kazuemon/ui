import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Avatar } from '../../src/components/avatar/Avatar';
import { AvatarGroup } from '../../src/components/avatar-group/AvatarGroup';

// 軸 525: Avatar の shape="square" の角（段ごと）
const meta = {
  title: 'Design Review/525 四角いアバターの角',
  id: 'design-review-525-avatar-square-radius',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'B,C' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

// 段ごとの四角の角（xs・sm・md・lg・xl）
const radii = (xs: string, sm: string, md: string, lg: string, xl: string) => ({
  '--avatar-radius-square-xs': xs,
  '--avatar-radius-square-sm': sm,
  '--avatar-radius-square-md': md,
  '--avatar-radius-square-lg': lg,
  '--avatar-radius-square-xl': xl,
});

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '段ごとに部品・カードの角',
    intent:
      '小さい段は部品の角、大きい段はカードの角。sm（24px）は角丸が大きさの半分になり、丸と見分けがつかない',
    spec: [
      ['xs 20px', '4px'],
      ['sm 24px', '12px（部品の角）'],
      ['md 32px', '12px（部品の角）'],
      ['lg 40px', '16px（カードの角）'],
      ['xl 56px', '16px（カードの角）'],
    ],
    tokens: radii(
      'var(--radius-sm)',
      'var(--radius-control)',
      'var(--radius-control)',
      'var(--radius-card)',
      'var(--radius-card)'
    ),
  },
  {
    id: 'A',
    name: '角の尺度を段に合わせて上げる',
    intent: '小さい段ほど小さい角。どの段も、大きさのおよそ 1/5〜1/10 の角で、四角に見える',
    spec: [
      ['xs 20px', '2px'],
      ['sm 24px', '4px'],
      ['md 32px', '6px'],
      ['lg 40px', '8px'],
      ['xl 56px', '12px'],
    ],
    tokens: radii(
      'var(--radius-xs)',
      'var(--radius-sm)',
      'var(--radius-md)',
      'var(--radius-lg)',
      'var(--radius-xl)'
    ),
  },
  {
    id: 'B',
    name: 'どの段も小さい角',
    intent: '角をどの段も 4px（xs だけ 2px）にそろえる。大きい段ほど角が立って見える',
    spec: [
      ['xs 20px', '2px'],
      ['sm〜xl', '4px'],
    ],
    tokens: radii(
      'var(--radius-xs)',
      'var(--radius-sm)',
      'var(--radius-sm)',
      'var(--radius-sm)',
      'var(--radius-sm)'
    ),
  },
  {
    id: 'C',
    name: '大きさのおよそ 1/4',
    intent:
      '現行版より小さく、A より丸い。四角と分かるが、角の柔らかさは残す（段ごとに決め打った値）',
    spec: [
      ['xs 20px', '4px'],
      ['sm 24px', '6px'],
      ['md 32px', '8px'],
      ['lg 40px', '12px'],
      ['xl 56px', '16px'],
    ],
    tokens: radii(
      'var(--radius-sm)',
      'var(--radius-md)',
      'var(--radius-lg)',
      'var(--radius-xl)',
      'var(--radius-2xl)'
    ),
  },
  {
    id: 'D',
    name: '角なし',
    intent: '角を丸めない。ドット絵（ゲームのスキンなど）をそのまま見せる',
    spec: [['xs〜xl', '0']],
    tokens: radii('0px', '0px', '0px', '0px', '0px'),
  },
];

const columns: Column[] = [
  { label: '写真', note: 'xs・sm・md・lg・xl' },
  { label: 'ドット絵', note: 'ゲームのスキンの頭（8×8）' },
  { label: '頭文字', note: '画像がないとき' },
  { label: '並べたとき', note: '一覧の行（md）と、重ねた並び（sm）' },
];

// 見本の画像（外に取りに行かない）
const svg = (body: string, size = 160) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="160" height="160" shape-rendering="crispEdges">${body}</svg>`)}`;
const photo = svg(
  '<rect width="160" height="160" fill="#7cc4f8"/><circle cx="80" cy="64" r="30" fill="#fff4cc"/><path d="M16 160c0-35 29-56 64-56s64 21 64 56Z" fill="#2f6b58"/>'
);
const photo2 = svg(
  '<rect width="160" height="160" fill="#f8b4c8"/><circle cx="80" cy="64" r="30" fill="#ffe7d1"/><path d="M16 160c0-35 29-56 64-56s64 21 64 56Z" fill="#5b4a8a"/>'
);

// 8×8 のドット絵。1 文字が 1 マス
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
const skin2 = pixels([
  'mmmmmmmm',
  'mmmmmmmm',
  'mssssssm',
  'ssssssss',
  'sewsswes',
  'sssddsss',
  'ssshhsss',
  'ssssssss',
]);

function Cell({ column }: { column: Column }) {
  switch (column.label) {
    case '写真':
      return (
        <div className="flex items-end gap-3">
          {sizes.map((size) => (
            <Avatar key={size} size={size} shape="square" src={photo} alt="" />
          ))}
        </div>
      );
    case 'ドット絵':
      return (
        <div className="flex items-end gap-3 [&_img]:[image-rendering:pixelated]">
          {sizes.map((size) => (
            <Avatar key={size} size={size} shape="square" src={skin} alt="" />
          ))}
        </div>
      );
    case '頭文字':
      return (
        <div className="flex items-end gap-3">
          {sizes.map((size) => (
            <Avatar key={size} size={size} shape="square" name="かずえもん" color="primary" />
          ))}
        </div>
      );
    default:
      return (
        <div className="flex w-[240px] flex-col gap-3 [&_img]:[image-rendering:pixelated]">
          {[
            { src: skin, name: 'kazuemon' },
            { src: skin2, name: 'Notch' },
            { src: photo2, name: '山田 花子' },
          ].map(({ src, name }) => (
            <div key={name} className="flex items-center gap-2 text-sm">
              <Avatar size="md" shape="square" src={src} alt="" />
              <span>{name}</span>
            </div>
          ))}
          <AvatarGroup>
            <Avatar size="sm" shape="square" src={skin} alt="kazuemon" />
            <Avatar size="sm" shape="square" src={skin2} alt="Notch" />
            <Avatar size="sm" shape="square" src={photo} alt="かずえもん" />
            <Avatar size="sm" shape="square" name="佐藤 次郎" />
          </AvatarGroup>
        </div>
      );
  }
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={525}
      axis="四角いアバターの角"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <Cell column={column} />}
    >
      <p>
        決定: square は B（どの段も小さい角）、角を丸めた四角は C（大きさのおよそ
        1/4）を別の形（rounded）として持つ。「rounded の場合は C にして、square なら B
        とかがいいかなと思いました。」
      </p>
      <p>
        Avatar の shape="square"
        の角を段ごとに決め直します。いまは小さい段が部品の角、大きい段がカードの角で、sm（24px）では角丸が大きさの半分になり、丸と見分けがつきません。四角いドット絵（ゲームのスキンの頭）を入れると、丸いアイコンに見えます。
      </p>
      <p>
        選ぶのは、四角の既定の角です。いまの角（現行版）や角なし（D）を、別の形（たとえば
        shape="rounded"・shape="sharp"）として残すかもあわせて決めます。残すときは、どれを square
        にするかを教えてください。
      </p>
      <p>
        ドット絵の列は、画像を拡大してもぼかさない指定（image-rendering:
        pixelated）を見本の側で付けています。部品には付けません。
      </p>
    </Comparison>
  ),
};
