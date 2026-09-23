import type { Meta, StoryObj } from '@storybook/react-vite';

import { Embed } from '../../src/components/embed/Embed';
import { type Candidate, type Column, Comparison } from './Comparison';

// 軸 274: Embed の、クリックしたあと・iframe の読み込みが終わるまでの見た目。
//   値は tokens.css の --embed-loading-spinner-display（回る円を出すか）・
//   --embed-loading-motion-play-state（読み込む前の光の帯を、クリックしたあとも動かし続けるか）。
//   候補はこの 2 つの上書きだけで作る
//
// このストーリーは自動では撮らない（play で操作しない）。外部と通信しない data: URL の中で、
//   わざと同期の待ち（sleep 相当）を入れて読み込みを遅らせているので、実際に押して確かめる
const sleep = (ms: number) => `<script>const s=Date.now();while(Date.now()-s<${ms}){}</script>`;
const demo = (ms: number, label: string) =>
  `data:text/html;charset=utf-8,${encodeURIComponent(
    `${sleep(ms)}<body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#d7ead9;font:16px system-ui">${label}</body>`
  )}`;

const meta = {
  title: 'Design Review/274 Embed の読み込み中',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '回る円を出し、光の帯は止める',
    intent:
      '読み込み中は、読み込む前の面から印を回る円（Spinner）に差し替える。地の光の帯は止め、「進んでいる」ことを 1 つの動きだけに絞る',
    spec: [
      ['回る円', '出す'],
      ['光の帯', '止まる'],
    ],
    tokens: {
      '--embed-loading-spinner-display': 'flex',
      '--embed-loading-motion-play-state': 'paused',
    },
  },
  {
    id: 'A',
    name: '回る円は出さず、光の帯のまま',
    intent:
      '面はクリック前と変えず、光の帯だけ動かし続ける。ボタンからスピナーへの切り替えがない分、静か',
    spec: [
      ['回る円', '出さない'],
      ['光の帯', '動く'],
    ],
    tokens: { '--embed-loading-spinner-display': 'none' },
  },
  {
    id: 'B',
    name: '回る円を出し、光の帯も動いたまま',
    intent: '回る円と光の帯の両方を動かす。進んでいることは強く伝わるが、動きが 2 つ重なる',
    spec: [
      ['回る円', '出す'],
      ['光の帯', '動く'],
    ],
    tokens: { '--embed-loading-spinner-display': 'flex' },
  },
];

const columns: Column[] = [{ label: 'クリックして確かめる（約1.2秒で読み込む）' }];

export const Loading: Story = {
  name: '読み込み中の見た目',
  render: () => (
    <Comparison
      index={274}
      axis="Embed の、クリックしたあと・読み込みが終わるまでの見た目"
      pick="A"
      candidates={candidates}
      columns={columns}
      renderCell={(_column, candidate) => (
        <div className="w-64">
          <Embed
            key={candidate.id}
            provider="youtube"
            clickToLoad
            src={demo(1200, '読み込みました')}
            title="空と山の紹介動画"
          />
        </div>
      )}
    >
      <p>
        決定:
        A（回る円は出さず、光の帯は動いたまま）。加えて、読み込み中は既定で「読み込み中」の文言を出すことになりました（
        <code>loadingText</code>
        。children
        を渡していなければ、部品がここで文言を足します。この文言はどの案でも同じなので、比較の対象にはしていません）。既定（
        <code>clickToLoad</code>{' '}
        を渡さない）でも、読み込み中はこの見た目です。ここは自動では撮りません。各案の枠をクリックして、実際の動きを見比べてください（外部とは通信しません。読み込みをわざと
        1.2 秒遅らせているだけです）。
      </p>
      <p>
        current
        は、クリックという能動的な操作のあとなので、印を回る円に切り替えて「進んでいる」ことをはっきり伝える案でした。地の光の帯は止め、動きを
        1 つに絞ります（原則14: 動きは手応えと待ちを伝える。情報を運ぶ動きは 1
        つに絞ったほうが読み取りやすいという考えです）。A
        は変化が少なく静かですが、クリックが効いたのかが分かりにくいかもしれません（そこで文言を足すことにしました）。B
        は動きが賑やかになりすぎるおそれがあります。
      </p>
    </Comparison>
  ),
};
