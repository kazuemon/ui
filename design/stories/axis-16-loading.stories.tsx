import type { Meta, StoryObj } from '@storybook/react-vite';
import { type CSSProperties, type ReactNode, useState } from 'react';

import { Button, type ButtonProps, type LoadingIndicator } from '../../src/components/Button';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 16: loading 状態（ボタンの送信中）。5回目
// ここまでの回答で決まったこと
//   送信中の印は E（既定）・B・C を選べるようにする
//   送信中は一律で Disabled と同じ見た目にする
//   回る円や線（印）には Disabled の見た目を当てない。回る円（E・B）は元の色のまま、流れる線（C）はボタンの濃い色
//   E のラベルの薄さは 55%（4回目）
// 5回目は、Disabled の見た目への切り替わりの動きを比べる。変えるのは次のトークンだけ
//   --busy-duration・--busy-ease（薄さ・背景・文字・枠線の色、ラベルの薄さ）、--busy-in-duration（回る円が出る長さ）
// 部品にはまだ送信中の状態がないので、比較のためにこの中で組み立てる。決まったら Button に loading を足す

type Indicator = 'overlay' | 'spinner-label' | 'bar';
type Appearance = NonNullable<ButtonProps['appearance']>;
type Color = NonNullable<ButtonProps['color']>;

// 印の色。回る円は元の色（ボタンの文字の色）、流れる線はボタンの濃い色（色のボタンでは塗りの色）
const fill: Partial<Record<Color, string>> = {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-fg-secondary)',
  danger: 'var(--color-danger)',
};
const onFill: Partial<Record<Color, string>> = {
  primary: 'var(--color-on-primary)',
  secondary: 'var(--color-on-secondary)',
  danger: 'var(--color-on-danger)',
};
const inkColor = (appearance: Appearance, color: Color, indicator: Indicator) => {
  if (appearance === 'outline') return fill[color] ?? 'var(--color-fg)';
  if (color === 'neutral' || color === 'surface') return 'var(--color-fg)';
  return indicator === 'bar' ? fill[color] : onFill[color];
};

// 回る円。薄い輪の上を、濃い弧が1秒で1周する
const Spinner = () => (
  <svg viewBox="0 0 16 16" className="size-(--size-icon) shrink-0 animate-spin" aria-hidden>
    <circle
      cx="8"
      cy="8"
      r="6"
      fill="none"
      stroke="currentColor"
      strokeOpacity="0.3"
      strokeWidth="2"
    />
    <path
      d="M8 2a6 6 0 0 1 6 6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// ボタンの下端に、細い線を左から右へ流す
const Bar = () => (
  <span
    className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 overflow-hidden"
    aria-hidden
  >
    <span className="axis16-bar absolute inset-y-0 left-0 w-2/5 bg-current opacity-60" />
  </span>
);

const keyframes = `
@keyframes axis16-bar {
  from { transform: translateX(-100%); }
  to { transform: translateX(250%); }
}
@keyframes axis16-in-fade { from { opacity: 0; } }
.axis16-bar { animation: axis16-bar 1.2s ease-in-out infinite; }
/* 重ねる回る円は、--busy-in-duration でふわっと濃くなって出る（E） */
.axis16-in-fade { animation: axis16-in-fade var(--busy-in-duration) var(--busy-ease) both; }
/* 送信中で固定したボタンは、動きの途中で止めて見せる（線は真ん中あたり） */
[data-preview='busy'] .axis16-bar { animation-play-state: paused; animation-delay: -0.6s; }
[data-preview='busy'] .animate-spin { animation-play-state: paused; }`;

// 送信中は Disabled と同じ見た目。薄さ・背景・文字・枠線の色を --busy-duration で移り変わらせる（出るときも戻るときも）
// 押下の沈み込みと影は 100ms のまま（ADR-0009）
const busyTransition =
  '[transition:box-shadow_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),background-color_var(--busy-duration)_var(--busy-ease),color_var(--busy-duration)_var(--busy-ease),border-color_var(--busy-duration)_var(--busy-ease),opacity_var(--busy-duration)_var(--busy-ease),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)] motion-reduce:[transition:none]';

// E のラベルの薄さ（4回目で 55% に決まった）
const LABEL_OPACITY = 0.55;

interface LoadingButtonProps extends ButtonProps {
  indicator: Indicator;
  /** 送信中に固定する。指定しないときは、押すと少しのあいだ送信中になる */
  busy?: boolean;
  /** 横幅いっぱいに広げる */
  full?: boolean;
  children: ReactNode;
}

function LoadingButton({
  indicator,
  busy: fixed,
  full,
  appearance = 'filled',
  color = 'neutral',
  children,
  ...props
}: LoadingButtonProps) {
  const [clicked, setClicked] = useState(false);
  const busy = fixed ?? clicked;
  const start = () => {
    if (busy || fixed !== undefined) return;
    setClicked(true);
    setTimeout(() => setClicked(false), 2400);
  };
  // 印はボタンの外側の層に描き、Disabled の薄さを受けないようにする
  const layerStyle: CSSProperties = { color: inkColor(appearance, color, indicator) };
  const labelStyle: CSSProperties = {
    opacity: busy && indicator === 'overlay' ? LABEL_OPACITY : undefined,
  };
  return (
    <span className={full ? 'relative flex w-full' : 'relative inline-flex'}>
      <Button
        {...props}
        appearance={appearance}
        color={color}
        disabled={busy || undefined}
        aria-busy={busy || undefined}
        onClick={start}
        className={[
          'relative overflow-hidden disabled:cursor-progress',
          busyTransition,
          full && 'w-full',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* B: 回る円の場所。回る円は外側の層に描くので、同じ大きさの空きだけを置く */}
        {busy && indicator === 'spinner-label' && <span className="size-(--size-icon) shrink-0" />}
        <span
          className="[transition:opacity_var(--busy-duration)_var(--busy-ease)]"
          style={labelStyle}
        >
          {children}
        </span>
      </Button>
      {/* 印を描く外側の層。ボタンと同じ大きさで、角丸で切り抜く */}
      {busy && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-control"
          style={layerStyle}
        >
          {indicator === 'overlay' && (
            <span className="axis16-in-fade absolute inset-0 flex items-center justify-center">
              <Spinner />
            </span>
          )}
          {/* B: ボタンの中身と同じ並びを作り、回る円をボタンの中の空きの真上に置く */}
          {indicator === 'spinner-label' && (
            <span className="absolute inset-0 flex items-center justify-center gap-2 px-(--space-control-x) text-(length:--text-control) leading-(--leading-control) font-bold">
              <Spinner />
              <span className="invisible">{children}</span>
            </span>
          )}
          {indicator === 'bar' && <Bar />}
        </span>
      )}
    </span>
  );
}

const press = 'var(--ease-press)';

const motion = (duration: string, ease: string, inDuration: string): Candidate['tokens'] => ({
  '--busy-duration': duration,
  '--busy-ease': ease,
  '--busy-in-duration': inDuration,
});

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '4回目の動き',
    intent: '色や薄さが 0.3 秒かけてゆっくり移る。回る円も 0.32 秒でふわっと出る。',
    spec: [
      ['Disabled への切り替わり', '0.3 秒・ease-out'],
      ['回る円の出方', '0.32 秒'],
    ],
    tokens: motion('300ms', 'ease-out', '320ms'),
  },
  {
    id: 'F1',
    name: '0.2 秒でシュっと',
    intent: '押下と同じ緩急（出だしが速く、すぐ止まる）で、0.2 秒で切り替わる。',
    spec: [
      ['Disabled への切り替わり', '0.2 秒・押下と同じ緩急'],
      ['回る円の出方', '0.2 秒'],
    ],
    tokens: motion('200ms', press, '200ms'),
  },
  {
    id: 'F2',
    name: '0.15 秒でシュっと',
    intent: 'F1 より速く、0.15 秒で切り替わる。',
    spec: [
      ['Disabled への切り替わり', '0.15 秒・押下と同じ緩急'],
      ['回る円の出方', '0.16 秒'],
    ],
    tokens: motion('150ms', press, '160ms'),
  },
  {
    id: 'F3',
    name: '押下と同じ 0.1 秒',
    intent: '押下（1px 沈む）と同じ長さと緩急。押した直後に、ほぼ一瞬で切り替わる。',
    spec: [
      ['Disabled への切り替わり', '0.1 秒・押下と同じ緩急'],
      ['回る円の出方', '0.12 秒'],
    ],
    tokens: motion('100ms', press, '120ms'),
  },
];

const columns: Column[] = [
  {
    label: '押して確かめる（E）',
    note: '押すと 2.4 秒だけ送信中になります。終わって戻るときも同じ動きです',
  },
  { label: '押して確かめる（B・C）', note: '同じ動きを、B（上）と C（下）に当てたもの' },
];

const EGroup = () => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-wrap gap-3">
      <LoadingButton indicator="overlay" color="primary">
        保存する
      </LoadingButton>
      <LoadingButton indicator="overlay" color="secondary">
        応援する
      </LoadingButton>
      <LoadingButton indicator="overlay">再読み込み</LoadingButton>
    </div>
    <div className="flex flex-wrap gap-3">
      <LoadingButton indicator="overlay" color="surface">
        共有
      </LoadingButton>
      <LoadingButton indicator="overlay" appearance="outline" color="primary">
        下書きに保存
      </LoadingButton>
    </div>
    <LoadingButton indicator="overlay" color="primary" full>
      ログイン
    </LoadingButton>
  </div>
);

const BCGroup = () => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-wrap gap-3">
      <LoadingButton indicator="spinner-label" color="primary">
        保存する
      </LoadingButton>
      <LoadingButton indicator="spinner-label">再読み込み</LoadingButton>
    </div>
    <div className="flex flex-wrap gap-3">
      <LoadingButton indicator="bar" color="primary">
        保存する
      </LoadingButton>
      <LoadingButton indicator="bar">再読み込み</LoadingButton>
    </div>
    <LoadingButton indicator="bar" color="primary" full>
      ログイン
    </LoadingButton>
  </div>
);

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/16 loading 状態',
  id: 'design-review-16-loading',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'F1' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'F1', 'F2', 'F3'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <>
      <style>{keyframes}</style>
      <Comparison
        index={16}
        axis="loading 状態"
        pick={pick}
        candidates={candidates}
        columns={columns}
        renderCell={(column) => (column.label.includes('E') ? <EGroup /> : <BCGroup />)}
      >
        <p>
          <strong className="text-fg">決定: F1（0.2 秒でシュっと）</strong>
          （ADR-0034）。「0.2 の F1 かなと思いました！」送信中の印は E を既定にし、B・C
          も選べるようにして、Button に loading として実装しました。実装した Button
          は、このストーリーの「実装した Button」で確かめられます。
        </p>
        <p>
          <strong className="text-fg">5回目</strong>
          。4回目のメモ「55 かなあ。あと、アニメーションも調整したいです。もうちょっと disabled
          な見た目にシュっと変わる感じにするとどうでしょうか？」を受けて、E のラベルを 55%
          にし、Disabled の見た目への切り替わりの動きを比べます。
        </p>
        <p>
          ここまでで決まったこと: 送信中の印は E を既定にし、B・C
          も選べるようにします。送信中は一律で押せないボタンと同じ見た目になります。回る円や線は薄くせず、回る円（E・B）は元の色のまま、流れる線（C）はボタンの濃い色にします。E
          のラベルは 55% に薄くします。
        </p>
        <p>
          4回目までは、色や薄さが 0.3 秒の ease-out でゆっくり移っていました。F1〜F3
          は、押下と同じ緩急（出だしが速く、すぐ止まる）にして、長さを 0.2・0.15・0.1
          秒に縮めます。回る円の出方も、切り替わりに合わせて縮めます。押下の沈み込みと影は、どの案も
          0.1 秒のままです。
        </p>
        <p>各行のボタンを押して、どの動きがよいか一言添えてください。</p>
      </Comparison>
    </>
  ),
};

// 決まった形を Button に実装したもの（design/adr/0034）。左は送信中で固定、右は押すと 2.4 秒だけ送信中になる
const implementedPause = `
[data-preview='busy'] .animate-loading-bar { animation-play-state: paused; animation-delay: -0.6s; }
[data-preview='busy'] .animate-spin { animation-play-state: paused; }`;
const implemented: [LoadingIndicator, string][] = [
  ['overlay', 'overlay（既定・E）: 薄くしたラベルに回る円を重ねる'],
  ['inline', 'inline（B）: ラベルの左に回る円'],
  ['bar', 'bar（C）: 下端に流れる線'],
];

const RealButtons = ({
  indicator,
  loading,
  onClick,
}: {
  indicator: LoadingIndicator;
  loading: boolean;
  onClick?: () => void;
}) => {
  const shared = { loading, loadingIndicator: indicator, onClick };
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <Button {...shared} color="primary">
          保存する
        </Button>
        <Button {...shared} color="secondary">
          応援する
        </Button>
        <Button {...shared}>再読み込み</Button>
        <Button {...shared} color="surface">
          共有
        </Button>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button {...shared} appearance="outline" color="primary">
          下書きに保存
        </Button>
        <Button {...shared} appearance="outline" color="neutral">
          キャンセル
        </Button>
      </div>
      <Button {...shared} color="primary" className="w-full">
        ログイン
      </Button>
    </div>
  );
};

const TryButtons = ({ indicator }: { indicator: LoadingIndicator }) => {
  const [loading, setLoading] = useState(false);
  const start = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2400);
  };
  return <RealButtons indicator={indicator} loading={loading} onClick={start} />;
};

export const Implemented: Story = {
  name: '実装した Button',
  render: () => (
    <div className="flex min-h-screen flex-col gap-8 bg-bg px-6 py-8 text-fg">
      {/* 送信中で固定したボタンは、動きの途中で止めて見せる（線は真ん中あたり） */}
      <style>{implementedPause}</style>
      <header className="flex max-w-[68ch] flex-col gap-2">
        <h1 className="text-2xl font-heading">実装した Button の loading</h1>
        <p className="text-sm leading-6 text-fg-muted">
          loading と loadingIndicator を指定した Button です。左は送信中で固定したもの、右は押すと
          2.4
          秒だけ送信中になります（押したボタンの行がすべて送信中になります）。送信中もフォーカスは外れません。
        </p>
      </header>
      {implemented.map(([indicator, label]) => (
        <section key={indicator} className="flex flex-col gap-3 border-t border-line pt-6">
          <h2 className="text-sm font-bold">{label}</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div data-preview="busy">
              <RealButtons indicator={indicator} loading />
            </div>
            <TryButtons indicator={indicator} />
          </div>
        </section>
      ))}
    </div>
  ),
};
