import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Avatar, type AvatarProps } from '../../src/components/avatar/Avatar';

// 後半の軸 141: 画像がないとき・読み込めないときに何を出すか
// 候補ごとに中身（頭文字・アイコン・面だけ）と色が変わるので、renderCell で props を変える

// 見本の画像（外に取りに行かない）
const svg = (body: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">${body}</svg>`)}`;
const photo = svg(
  '<rect width="160" height="160" fill="#7cc4f8"/><circle cx="80" cy="64" r="30" fill="#fff4cc"/><path d="M16 160c0-35 29-56 64-56s64 21 64 56Z" fill="#2f6b58"/>'
);
// 読み込めない画像（壊れたデータ）
const broken = 'data:image/png;base64,AAAA';

type Fill = 'initials' | 'icon' | 'blank';

// 候補ごとの、画像がないときの中身と色
const fills: Record<string, { fill: Fill; color: AvatarProps['color'] }> = {
  現行版: { fill: 'initials', color: 'neutral' },
  A: { fill: 'initials', color: 'primary' },
  B: { fill: 'icon', color: 'neutral' },
  C: { fill: 'icon', color: 'primary' },
  D: { fill: 'blank', color: 'neutral' },
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '頭文字・グレーの面',
    intent:
      '名前の頭文字を出す。和文は 1 文字、欧文は語頭 2 文字まで。色を指定しないときはグレー（原則6）。',
    spec: [
      ['中身', '頭文字'],
      ['面', 'グレー'],
    ],
  },
  {
    id: 'A',
    name: '頭文字・部品の色の淡い面',
    intent: '頭文字は同じで、面と文字をタグと同じ「淡い面に濃い文字」にする（色は利用者が選ぶ）。',
    spec: [
      ['中身', '頭文字'],
      ['面', '部品の色の淡い面'],
    ],
  },
  {
    id: 'B',
    name: '人のアイコン・グレーの面',
    intent: '名前を使わず、人のアイコンを置く。誰かは分からないが、名前の切り方に迷わない。',
    spec: [
      ['中身', '人のアイコン'],
      ['面', 'グレー'],
    ],
  },
  {
    id: 'C',
    name: '人のアイコン・部品の色の淡い面',
    intent: 'アイコンを、部品の色の淡い面に置く。',
    spec: [
      ['中身', '人のアイコン'],
      ['面', '部品の色の淡い面'],
    ],
  },
  {
    id: 'D',
    name: 'グレーの面だけ',
    intent: '何も出さず、面だけを置く。いちばん静かだが、読み込み中との区別が付かない。',
    spec: [
      ['中身', 'なし'],
      ['面', 'グレー'],
    ],
  },
];

const columns: Column[] = [
  { label: '和文の名前', note: '「かずえもん」' },
  { label: '欧文の名前', note: '「Kazuya Miyamoto」' },
  { label: '名前がないとき', note: 'name を渡さない' },
  { label: '一覧に並べたとき', note: '画像のある人とない人が混ざる' },
  { label: '画像が読み込めないとき', note: '壊れた URL' },
];

const listNames = ['かずえもん', 'Kazuya Miyamoto', '宮本一也', 'Sora Tanaka'];

/** 候補の中身を、渡した名前で描く */
function Sample({
  candidateId,
  name,
  src,
  size = 'lg',
}: {
  candidateId: string;
  name?: string;
  src?: string;
  size?: AvatarProps['size'];
}) {
  const { fill, color } = fills[candidateId] ?? fills.現行版;
  return (
    <Avatar
      size={size}
      color={color}
      src={src}
      alt={name ?? ''}
      name={fill === 'initials' ? name : undefined}
      fallback={fill === 'icon' ? 'icon' : 'initials'}
    />
  );
}

const meta = {
  title: 'Design Review/141 Avatar の画像がないとき',
  id: 'design-review-141-avatar-fallback',
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
      index={141}
      axis="Avatar の画像がないとき・読み込めないときの中身"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        switch (column.label) {
          case '和文の名前':
            return <Sample candidateId={candidate.id} name="かずえもん" />;
          case '欧文の名前':
            return <Sample candidateId={candidate.id} name="Kazuya Miyamoto" />;
          case '名前がないとき':
            return <Sample candidateId={candidate.id} />;
          case '一覧に並べたとき':
            return (
              <div className="flex items-center gap-2">
                {listNames.map((name, i) => (
                  <Sample
                    key={name}
                    candidateId={candidate.id}
                    name={name}
                    src={i === 0 ? photo : undefined}
                    size="md"
                  />
                ))}
              </div>
            );
          default:
            return <Sample candidateId={candidate.id} name="かずえもん" src={broken} />;
        }
      }}
    >
      <p>
        <strong>
          決定: 現行版（グレー＋頭文字）を既定にし、頭文字と人のアイコンを props（fallback）で選べる
          ようにしました。面の色は、これまでどおり color で変えられます。
        </strong>
      </p>
      <p>
        画像がないときと、画像を読み込めなかったときに何を出すかを選びます。頭文字は誰かが分かりますが、
        名前の切り方（和文 1 文字・欧文 2
        文字）に癖が出ます。人のアイコンは誰かが分かりませんが、名前がなくても同じ見た目になります。
      </p>
      <p>
        面の色も一緒に選びます。色を指定しないときはグレー（原則6）で、`color`
        を渡すとタグと同じ「淡い面に同じ色相の濃い文字」になります。
        名前から色を自動で決めることはしません。
      </p>
    </Comparison>
  ),
};
