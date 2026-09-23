import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Gallery, Specimen } from '../../stories/story-parts';
import { Video } from './Video';
// 手元で作った、ごく小さい webm（数十 KB 以下。design/tools ではなく、canvas.captureStream で作った見本）
// 外部には取りに行かない
import sample from './__fixtures__/sample.webm?url';

// 見本の poster（外に取りに行かない。文字は描かない。data: URL の中で文字を描くと OS のフォントで描かれ、
//   手元と CI で字形がずれて見た目の比較が落ちるため）
const poster = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc4f8"/><stop offset="1" stop-color="#cfeafc"/></linearGradient></defs><rect width="640" height="360" fill="url(#s)"/><circle cx="500" cy="90" r="36" fill="#fff4cc"/><path d="M0 260 L140 160 L260 240 L400 130 L520 230 L640 170 L640 360 L0 360Z" fill="#2f6b58"/></svg>'
)}`;
// 読み込めない動画（壊れたデータ）
const broken = 'data:video/mp4;base64,AAAA';

// 動きを減らす設定を、テストの中だけ偽る。vitest.config.ts の --force-prefers-reduced-motion は
// CSS の @media には効くが、window.matchMedia には効かない（実測ずみ）ので、render の中で差し替える。
// render は play より前（マウントより前）に呼ばれるので、部品の useEffect には偽の答えが届く
let originalMatchMedia: typeof window.matchMedia | null = null;
function fakeReducedMotion() {
  originalMatchMedia = window.matchMedia.bind(window);
  const original = originalMatchMedia;
  window.matchMedia = (query: string) =>
    query.includes('prefers-reduced-motion')
      ? ({
          matches: true,
          media: query,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => true,
        } as MediaQueryList)
      : original(query);
}
function restoreMatchMedia() {
  if (originalMatchMedia) window.matchMedia = originalMatchMedia;
  originalMatchMedia = null;
}

const meta = {
  title: 'Components/Video',
  component: Video,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '手元の動画ファイル（mp4・webm など）を記事や作品ページに置いて再生します。外部サービスの埋め込みは Embed を使います。',
          '',
          '- コントロールはブラウザ標準です（`controls`、既定 `true`）。シーク・音量・全画面はブラウザに任せます。',
          '- `fit`（`cover`・`contain`）は既定値を持たないので、必ず渡します。切り取ると困る操作の録画・デモは `contain`、それ以外は `cover` です。',
          '- `controls={false}` にすると、大きな再生ボタンを面に重ねます。`autoPlay`・`loop`・`muted` と組み合わせると、操作の録画のような音なしのループ再生（GIF の代わり）に使えます。見た目は `playButtonVariant`（既定 `raised`＝円形・primary の塗り・浮いた影、`flat`＝白の半透明・影なし）で選べます。',
          '- 動きを減らす設定（prefers-reduced-motion）のときは自動再生せず、標準のコントロールを強制して出します。動かないままでも、押して再生する手段だけは残します。',
          '- `poster` を渡さないときは、読み込むまで Image と同じ Skeleton の面を出します。読み込みに失敗した・形式に対応していないときは、面の上にアイコンと文を出します（`errorText`）。',
          '- `ratio` は Embed と同じ考え方で、書かないときは 16:9 です（`width`・`height` があればその比）。',
          '- `caption` を渡すと、Figure と同じように下に中央寄せで出ます。複数の形式・字幕を渡すときは `children` に `<source>`・`<track>` を並べます。',
        ].join('\n'),
      },
    },
  },
  args: { src: sample, poster, ratio: 16 / 9, fit: 'cover' },
  argTypes: {
    src: { control: false },
    poster: { control: false },
    ratio: { control: 'inline-radio', options: [undefined, '16 / 9', '4 / 3', '1'] },
    fit: { control: 'inline-radio', options: ['cover', 'contain'] },
    controls: { control: 'boolean' },
    autoPlay: { control: 'boolean' },
    loop: { control: 'boolean' },
    muted: { control: 'boolean' },
    radius: { control: 'inline-radio', options: ['card', 'nested', 'none'] },
    playButtonVariant: { control: 'inline-radio', options: ['raised', 'flat'] },
    caption: { control: 'text' },
  },
} satisfies Meta<typeof Video>;

export default meta;
type Story = StoryObj<typeof meta>;

const narrow = (Story: () => ReactNode) => <div className="max-w-md">{Story()}</div>;

export const Playground: Story = {
  name: '基本',
  decorators: [narrow],
};

// 動きの途中は撮らない。poster・止まったコマ・面のままの状態だけを並べる
// 見た目のテストで撮るとき、ブラウザ標準のコントロールの時刻（0:00）を見えなくする。
// 時刻はブラウザが OS のフォントで描くので、手元と CI で字形がずれて見た目の比較が落ちるため
const hideNativeTime =
  '[&::-webkit-media-controls-current-time-display]:invisible [&::-webkit-media-controls-time-remaining-display]:invisible';

export const States: Story = {
  tags: ['visual'],
  name: '読み込み中・controls・失敗',
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="14rem">
      <Specimen label="読み込み中（poster なし・src なし）">
        <Video ratio={16 / 9} fit="cover" />
      </Specimen>
      <Specimen label="controls（既定・未再生）">
        <Video ratio={16 / 9} src={sample} poster={poster} fit="cover" className={hideNativeTime} />
      </Specimen>
      <Specimen label="controls={false}・再生ボタン raised（既定）">
        <Video
          ratio={16 / 9}
          src={sample}
          poster={poster}
          fit="cover"
          controls={false}
          loop
          muted
        />
      </Specimen>
      <Specimen label="controls={false}・再生ボタン flat">
        <Video
          ratio={16 / 9}
          src={sample}
          poster={poster}
          fit="cover"
          controls={false}
          loop
          muted
          playButtonVariant="flat"
        />
      </Specimen>
      <Specimen label="失敗">
        <Video ratio={16 / 9} src={broken} fit="cover" />
      </Specimen>
      <Specimen label="失敗（errorText を変える）">
        <Video ratio={16 / 9} src={broken} fit="cover" errorText="動画を表示できません" />
      </Specimen>
    </Gallery>
  ),
  play: async ({ canvasElement }) => {
    const frames = [...canvasElement.querySelectorAll('[data-slot="video"]')];
    await waitFor(() =>
      expect(frames.map((frame) => frame.getAttribute('data-status'))).toEqual([
        'loading',
        'loaded',
        'loaded',
        'loaded',
        'error',
        'error',
      ])
    );
  },
};

export const WithCaption: Story = {
  tags: ['visual'],
  name: 'キャプション',
  parameters: { controls: { disable: true } },
  decorators: [narrow],
  render: () => (
    <Video
      ratio={16 / 9}
      src={sample}
      poster={poster}
      fit="cover"
      className={hideNativeTime}
      caption="図 1. ボタンのホバーの見た目（操作の録画）"
    />
  ),
};

// controls={false} の見本を押して再生する。始まると大きな再生ボタンが消える
export const ClickToPlay: Story = {
  name: 'controls={false} で再生する',
  decorators: [narrow],
  render: () => (
    <Video ratio={16 / 9} src={sample} poster={poster} fit="cover" controls={false} loop muted />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const frame = canvasElement.querySelector('[data-slot="video"]')!;
    await waitFor(() => expect(frame).toHaveAttribute('data-status', 'loaded'));
    const button = canvas.getByRole('button', { name: '再生' });
    const video = canvasElement.querySelector('video')!;
    await expect(video.paused).toBe(true);
    await userEvent.click(button);
    await waitFor(() => expect(video.paused).toBe(false));
    // 再生が始まったら、大きな再生ボタンは消える
    await expect(canvas.queryByRole('button', { name: '再生' })).toBeNull();
  },
};

// 自動再生・ループ・音なし（GIF の代わり）。動きを減らす設定のときは自動再生せず、標準の controls を強制する
export const AutoPlayReducedMotion: Story = {
  name: '自動再生（動きを減らす設定）',
  parameters: {
    docs: {
      description: {
        story:
          '動きを減らす設定のときは自動再生せず、標準の controls を強制します。押して再生する手段だけは残ります。',
      },
    },
  },
  decorators: [narrow],
  render: () => {
    fakeReducedMotion();
    return (
      <Video
        ratio={16 / 9}
        src={sample}
        poster={poster}
        fit="cover"
        controls={false}
        autoPlay
        loop
        muted
      />
    );
  },
  play: async ({ canvasElement }) => {
    try {
      const video = canvasElement.querySelector('video')!;
      // 動きを減らす設定に押されて、標準の controls が出る（渡した controls={false} より優先）
      await waitFor(() => expect(video).toHaveAttribute('controls'));
      await expect(video.paused).toBe(true);
    } finally {
      restoreMatchMedia();
    }
  },
};

export const Accessibility: Story = {
  name: '読み上げ',
  decorators: [narrow],
  render: () => (
    <Video
      ratio={16 / 9}
      src={broken}
      fit="cover"
      controls={false}
      accessibleName="操作の録画"
      errorText="動画を表示できません"
    />
  ),
  play: async ({ canvasElement, canvas }) => {
    const frame = canvasElement.querySelector('[data-slot="video"]')!;
    await waitFor(() => expect(frame).toHaveAttribute('data-status', 'error'));
    const video = canvasElement.querySelector('video')!;
    await expect(video).toHaveAttribute('aria-label', '操作の録画');
    await expect(canvas.getByText('動画を表示できません')).toBeInTheDocument();
    // 失敗したときは、二重に操作を求めないよう再生ボタンを出さない
    await expect(canvas.queryByRole('button', { name: '再生' })).toBeNull();
  },
};
