import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Gallery, type GalleryItem } from '../../src/components/gallery/Gallery';
import { Image } from '../../src/components/image/Image';
import { galleryImages } from '../../src/samples/images';

// 軸 411: Gallery の並べた画像（と Image）の、読み込むまでの見た目
const meta = {
  title: 'Design Review/411 画像を読み込むまでの見た目',
  id: 'design-review-411-gallery-loading',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A,B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['A,B', '', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

// Skeleton の面と光の値（tokens.css の --skeleton-*）
const sweep = {
  '--image-placeholder-sweep': 'var(--skeleton-sweep)',
  '--image-placeholder-sweep-attachment': 'scroll',
  '--image-placeholder-sweep-size': '300% 100%',
  '--image-placeholder-sweep-band': '15%',
  '--image-placeholder-pulse': 'none',
};
const noLine = {
  '--image-placeholder-line-width': '0px',
  '--image-placeholder-line-style': 'dashed',
  '--image-placeholder-line-color': 'var(--color-line)',
};
const dashed = {
  '--image-placeholder-line-width': 'var(--border-width-medium)',
  '--image-placeholder-line-style': 'dashed',
  '--image-placeholder-line-color': 'var(--color-line-strong)',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'Skeleton の面・面ごとの光',
    intent:
      'いまの Image と同じ。Skeleton と同じグレーの面に、面ごとにやわらかい光の帯が左から右へ通る',
    spec: [
      ['面', 'Skeleton の塗り'],
      ['ふち', 'なし'],
      ['動き', '面ごとの光（sweep）'],
    ],
    tokens: { '--image-placeholder-fill': 'var(--skeleton-fill)', ...noLine, ...sweep },
  },
  {
    id: 'A',
    name: 'Skeleton の面・並びをまたぐ光',
    intent:
      '面は同じで、光を画面を基準にして敷く（Skeleton の sweep-viewport）。並んだ面の光がつながり、1 本の光が並び全体を横切る。枚数が多い並びで、ばらばらに光らない',
    spec: [
      ['面', 'Skeleton の塗り'],
      ['ふち', 'なし'],
      ['動き', '画面を基準にした光（sweep-viewport）'],
    ],
    tokens: {
      '--image-placeholder-fill': 'var(--skeleton-fill)',
      ...noLine,
      '--image-placeholder-sweep': 'var(--skeleton-sweep-viewport)',
      '--image-placeholder-sweep-attachment': 'fixed',
      '--image-placeholder-sweep-size': '250% 100%',
      '--image-placeholder-sweep-band': '8%',
      '--image-placeholder-pulse': 'none',
    },
  },
  {
    id: 'B',
    name: 'Skeleton の面・明滅',
    intent:
      '光の帯を通さず、面そのものの濃さをゆっくり明滅させる（Skeleton の pulse）。動きが小さく、たくさん並んでも落ち着く',
    spec: [
      ['面', 'Skeleton の塗り'],
      ['ふち', 'なし'],
      ['動き', '明滅（pulse）'],
    ],
    tokens: {
      '--image-placeholder-fill': 'var(--skeleton-fill)',
      ...noLine,
      '--image-placeholder-sweep': 'none',
      '--image-placeholder-sweep-attachment': 'scroll',
      '--image-placeholder-sweep-size': '300% 100%',
      '--image-placeholder-sweep-band': '15%',
      '--image-placeholder-pulse': 'var(--skeleton-pulse)',
    },
  },
  {
    id: 'C',
    name: '点線の枠・塗りなし・明滅',
    intent:
      '面を塗らず、画像の入る場所を点線の枠だけで示す。枠がゆっくり明滅して、読み込んでいることを伝える。ページが軽く見える',
    spec: [
      ['面', '塗りなし'],
      ['ふち', '点線（1.5px・3:1 の輪郭の色）'],
      ['動き', '明滅（pulse）'],
    ],
    tokens: {
      '--image-placeholder-fill': 'transparent',
      ...dashed,
      '--image-placeholder-sweep': 'none',
      '--image-placeholder-sweep-attachment': 'scroll',
      '--image-placeholder-sweep-size': '300% 100%',
      '--image-placeholder-sweep-band': '15%',
      '--image-placeholder-pulse': 'var(--skeleton-pulse)',
    },
  },
  {
    id: 'D',
    name: '点線の枠・Skeleton の面・面ごとの光',
    intent: '現行版の面と光に、点線の枠を足す。まだ画像がない場所だと、枠でもはっきり分かる',
    spec: [
      ['面', 'Skeleton の塗り'],
      ['ふち', '点線（1.5px・3:1 の輪郭の色）'],
      ['動き', '面ごとの光（sweep）'],
    ],
    tokens: { '--image-placeholder-fill': 'var(--skeleton-fill)', ...dashed, ...sweep },
  },
];

const columns: Column[] = [
  { label: '読み込み中', note: 'Gallery・6 枚' },
  { label: '一部が読み込めた', note: '読み込めた・読み込み中・失敗が混ざる' },
  { label: '単体の Image', note: '読み込み中' },
];

// src を書かないと、読み込み中の面のまま止まる
const loading: GalleryItem[] = galleryImages
  .slice(0, 6)
  .map(({ alt, width, height }) => ({ alt, width, height }));
const mixed: GalleryItem[] = galleryImages
  .slice(0, 6)
  .map((image, i) =>
    i % 3 === 0
      ? { ...image, loading: 'lazy' as const }
      : i % 3 === 1
        ? { alt: image.alt }
        : { alt: image.alt, src: 'data:image/png;base64,AAAA' }
  );

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={411}
      axis="画像を読み込むまでの見た目"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => {
        switch (column.label) {
          case '読み込み中':
            return (
              <div className="w-[480px]">
                <Gallery items={loading} />
              </div>
            );
          case '一部が読み込めた':
            return (
              <div className="w-[480px]">
                <Gallery items={mixed} />
              </div>
            );
          default:
            return (
              <div className="w-[280px]">
                <Image alt="空と山の絵" ratio={16 / 9} />
              </div>
            );
        }
      }}
    >
      <p>
        決定（ADR-0393 予定）: Gallery の読み込み中は A（並びをまたぐ光）を既定にし、B（明滅）も
        loadingAnimation="pulse" で選べる。単体の Image
        は現行版（面ごとの光）のまま。点線の枠（C・D）は採らない。
        候補の見た目は、トークンを畳む前のこのコミットで比べられます。
      </p>
      <p>
        Gallery の画像に loading・decoding・fetchPriority を渡せるようにしました（枚数が多いときは
        loading: &apos;lazy&apos;
        で、見えるところまで来てから読み込みます）。あわせて、読み込むまでの見た目を選びます。
      </p>
      <p>
        選ぶのは、面の塗り（Skeleton
        の面か、塗らないか）・点線の枠のあるなし・動き（面ごとの光・並びをまたぐ光・明滅）です。失敗した画像の面は変えません。Gallery
        だけに効かせるか、単体の Image
        もそろえるかも教えてください（いまはどちらにも効く形で並べています）。
      </p>
    </Comparison>
  ),
};
