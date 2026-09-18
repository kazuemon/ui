import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Avatar } from '../../src/components/avatar/Avatar';

// 後半の軸 140: Avatar の形と輪郭
// 候補はトークンの上書きで作る（--avatar-radius-circle・--avatar-outline-width）。見本の props はどの行も同じ

// 見本の画像（外に取りに行かない）
const svg = (body: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">${body}</svg>`)}`;
const photo = svg(
  '<rect width="160" height="160" fill="#7cc4f8"/><circle cx="80" cy="64" r="30" fill="#fff4cc"/><path d="M16 160c0-35 29-56 64-56s64 21 64 56Z" fill="#2f6b58"/>'
);
// 白っぽい絵（白地に溶ける）
const palePhoto = svg(
  '<rect width="160" height="160" fill="#fdfdfd"/><circle cx="80" cy="66" r="28" fill="#f4f6f7"/><path d="M20 160c0-33 27-53 60-53s60 20 60 53Z" fill="#f7f9fa"/>'
);

const outlineOn = 'var(--border-width-thin)';
const outlineOff = '0px';

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '丸＋輪郭あり',
    intent:
      '小物なので丸（pill）にし、白っぽい画像が白地に溶けないよう細い輪郭を足す。輪郭の濃さは画像（Image）と同じ。',
    spec: [
      ['形', '丸（pill）'],
      ['輪郭', '細い線（内側に引く）'],
    ],
    tokens: {
      '--avatar-radius-circle': 'var(--radius-pill)',
      '--avatar-outline-width': outlineOn,
    },
  },
  {
    id: 'A',
    name: '丸＋輪郭なし',
    intent: '輪郭を外し、画像だけを丸く切り取る。白っぽい画像は白地では縁が分からなくなる。',
    spec: [
      ['形', '丸（pill）'],
      ['輪郭', 'なし'],
    ],
    tokens: {
      '--avatar-radius-circle': 'var(--radius-pill)',
      '--avatar-outline-width': outlineOff,
    },
  },
  {
    id: 'B',
    name: '部品の角＋輪郭あり',
    intent:
      'ボタンや入力欄と同じ角の四角にする。四角い画像（ロゴ・作品のサムネイル）が切られずに見える。',
    spec: [
      ['形', '部品の角'],
      ['輪郭', '細い線'],
    ],
    tokens: {
      '--avatar-radius-circle': 'var(--radius-control)',
      '--avatar-outline-width': outlineOn,
    },
  },
  {
    id: 'C',
    name: '部品の角＋輪郭なし',
    intent: '部品の角の四角で、輪郭を外す。',
    spec: [
      ['形', '部品の角'],
      ['輪郭', 'なし'],
    ],
    tokens: {
      '--avatar-radius-circle': 'var(--radius-control)',
      '--avatar-outline-width': outlineOff,
    },
  },
  {
    id: 'D',
    name: 'カードの角＋輪郭あり',
    intent: '画像と同じ、カードの角にする。記事のカードに並ぶ画像と角がそろう。',
    spec: [
      ['形', 'カードの角'],
      ['輪郭', '細い線'],
    ],
    tokens: {
      '--avatar-radius-circle': 'var(--radius-card)',
      '--avatar-outline-width': outlineOn,
    },
  },
];

const columns: Column[] = [
  { label: '画像あり', note: '色のある絵' },
  { label: '白い面の上', note: '白っぽい絵。輪郭がないと縁が消える' },
  { label: '頭文字', note: 'グレーの面' },
  { label: '並べたとき', note: '少し重ねて 4 つ' },
];

const groupNames = ['かずえもん', 'Kazuya Miyamoto', '宮本一也', 'Sora Tanaka'];

const meta = {
  title: 'Design Review/140 Avatar の形と輪郭',
  id: 'design-review-140-avatar-shape',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={140}
      axis="Avatar の形と輪郭"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => {
        switch (column.label) {
          case '画像あり':
            return (
              <div className="flex items-center gap-4">
                <Avatar size="md" src={photo} alt="かずえもん" />
                <Avatar size="xl" src={photo} alt="かずえもん" />
              </div>
            );
          case '白い面の上':
            return (
              <div className="flex items-center gap-4 bg-surface">
                <Avatar size="md" src={palePhoto} alt="かずえもん" />
                <Avatar size="xl" src={palePhoto} alt="かずえもん" />
              </div>
            );
          case '頭文字':
            return (
              <div className="flex items-center gap-4">
                <Avatar size="md" name="かずえもん" />
                <Avatar size="xl" name="Kazuya Miyamoto" color="primary" />
              </div>
            );
          default:
            return (
              <div className="flex items-center">
                {groupNames.map((name, i) => (
                  <Avatar
                    key={name}
                    size="md"
                    name={name}
                    src={i % 2 === 0 ? photo : undefined}
                    alt={name}
                    className={i > 0 ? '-ml-2' : undefined}
                  />
                ))}
              </div>
            );
        }
      }}
    >
      <p>
        <strong>
          決定: 現行版（丸・輪郭あり）を既定にし、輪郭のあり・なしは利用者が選べるようにしました。
          四角（shape=&quot;rounded&quot;）の角は大きさの段に従い、小さい段（sm・md）は部品の角（C
          の角）、大きい段（lg・xl）はカードの角（D の角）にします。
        </strong>
      </p>
      <p>
        Avatar
        の形（丸か四角か）と、細い輪郭を付けるかを選びます。丸は小物（タグ・トグル）と同じ扱い、
        四角はボタンや入力欄と同じ角、カードの角は記事の画像と同じ角です。
      </p>
      <p>
        輪郭は、白っぽい画像が白い地に溶けないためのものです（Image にも同じ輪郭が付いています）。
        顔写真だけなら要りませんが、ロゴやイラストでは縁が消えます。
      </p>
    </Comparison>
  ),
};
