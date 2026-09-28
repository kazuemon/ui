import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { DropzoneFileList } from '../../src/components/dropzone/DropzoneFileList';

// この軸は、トークンではなく DropzoneFileList の variant（実装済みの props）を行ごとに変える（Comparison.tsx の使い方）
// 1x1 の透明 PNG。thumbnail のタイルで実際に画像として描けるようにする（見せかけの中身だと壊れた画像になる）
const TRANSPARENT_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

function pngBytes(): ArrayBuffer {
  const binary = atob(TRANSPARENT_PNG_BASE64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer as ArrayBuffer;
}

function sample() {
  return [
    { file: new File([pngBytes()], 'kazuemon-icon.png', { type: 'image/png' }) },
    {
      file: new File([new ArrayBuffer(1_240_000)], 'portfolio.pdf', { type: 'application/pdf' }),
    },
    {
      file: new File([pngBytes()], 'cover-photo.jpg', { type: 'image/jpeg' }),
    },
  ];
}

const candidates: Candidate[] = [
  {
    id: 'current',
    name: 'list',
    intent: '名前・大きさを1行ずつ。ファイルの種類を問わず同じ見た目になる',
    spec: [['variant', 'list']],
  },
  {
    id: 'A',
    name: 'thumbnail',
    intent: '画像は正方形のタイルに縮小して見せる。画像でないファイルはアイコンのタイルになる',
    spec: [['variant', 'thumbnail']],
  },
];

const columns: Column[] = [{ label: '選んだ3つ（画像2つ・PDF1つ）' }];

const meta = {
  title: 'Design Review/381 選んだファイルの一覧の見せ方',
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Compare: Story = {
  render: () => (
    <Comparison
      index={381}
      axis="選んだファイルの一覧（DropzoneFileList）の見せ方"
      pick="current"
      candidates={candidates}
      columns={columns}
      renderCell={(_column, candidate) => (
        <div className="w-72">
          <DropzoneFileList
            files={sample()}
            variant={candidate.id === 'current' ? 'list' : 'thumbnail'}
            onRemove={() => {}}
          />
        </div>
      )}
    >
      <p>
        決定: list を既定にします。thumbnail も `variant` props で使う側が選べる形のまま残します
        （どちらも部品に実装済みです）。どちらも名前・大きさ（list は文字、thumbnail
        はタイルの下の文字）と外すボタンを持ちます。画像でないファイル（PDF）は、thumbnail
        でもアイコンで表します。
      </p>
      <p>
        list は、画像でないファイルが多い場面（書類の提出など）に向きます。thumbnail
        は、画像が多い場面（ギャラリー・アイコンの変更など）で、見てすぐ選び直せます。
      </p>
    </Comparison>
  ),
};
