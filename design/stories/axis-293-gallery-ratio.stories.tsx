import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { GalleryPage } from './gallery-frame';

// 軸 293: Gallery を並べたときの画像の比（ratio を書かないときの既定）
//   値は tokens.css の --gallery-ratio。候補はこの上書きだけで作る。全案（現行版を含む）で値を明示する
//   並べた画像はこの比で切り取ってそろえる（拡大すると全体が見える）。間隔は軸 292 で決める既定、角はカードの角
const meta = {
  title: 'Design Review/293 Gallery の画像の比',
  id: 'design-review-293-gallery-ratio',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
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

// 間隔は tokens.css の既定（軸 292 で sm か md を決める）、角はカードの角
const shared = {
  '--gallery-radius': 'var(--radius-card)',
};

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '4 / 3',
    intent:
      '横長の写真（16:9・3:2）も縦長の画像（3:4）も、切り取る量がどちらも中くらい。画面のスクリーンショットでも、題や大事な部分が残りやすい',
    spec: [['比', '4 / 3']],
    tokens: { ...shared, '--gallery-ratio': '4 / 3' },
  },
  {
    id: 'A',
    name: '1 / 1（正方形）',
    intent:
      '写真の一覧らしい、正方形にそろえる形。縦長と横長が混じってもそろって見えるが、横長の画像は左右が大きく切れる',
    spec: [['比', '1 / 1']],
    tokens: { ...shared, '--gallery-ratio': '1 / 1' },
  },
  {
    id: 'B',
    name: '3 / 2',
    intent: 'カメラの写真の比。横長の写真はほぼ切れずに並ぶが、縦長の画像は上下が大きく切れる',
    spec: [['比', '3 / 2']],
    tokens: { ...shared, '--gallery-ratio': '3 / 2' },
  },
  {
    id: 'C',
    name: '16 / 9',
    intent:
      '画面のスクリーンショットや動画の比。作品のスクリーンショットはそのまま並ぶが、縦長の画像は細い帯になる',
    spec: [['比', '16 / 9']],
    tokens: { ...shared, '--gallery-ratio': '16 / 9' },
  },
];

const columns: Column[] = [
  { label: 'パソコン（3 列）', note: '横長 4 枚・縦長 2 枚。押すと全体が見える' },
  { label: 'スマートフォン（2 列）' },
];

export const Ratio: Story = {
  name: '画像の比',
  render: ({ pick }) => (
    <Comparison
      pick={pick}
      index={293}
      axis="Gallery の画像の比"
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <GalleryPage device={column.label.startsWith('パソコン') ? 'desktop' : 'phone'} />
      )}
    >
      <p>
        <strong>決定: current（4 / 3）を既定にし、ratio で任意の比を渡せる。</strong>
      </p>
      <p>
        並べた画像を、どの比に切り取ってそろえるか（<code>ratio</code>{' '}
        を書かないときの既定）を選びます。どの案でも、押して拡大すると画像の全体が見えます。使う側は{' '}
        <code>ratio</code> でいつでも変えられます。
      </p>
      <p>
        推奨は current（4 /
        3）です。ポートフォリオの作品のスクリーンショット（横長）と、記事の図や写真（縦長も混じる）の両方で、切り取る量がいちばん偏りません。A
        は写真の一覧らしく締まりますが、横長のスクリーンショットの左右が大きく切れます。C
        はスクリーンショットだけを並べるときに向きますが、縦長の画像が細い帯になります。
      </p>
      <p>既定をどれにしますか。</p>
    </Comparison>
  ),
};
