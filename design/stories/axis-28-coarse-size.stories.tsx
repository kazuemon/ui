import type { Meta, StoryObj } from '@storybook/react-vite';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { Button } from '../../src/components/Button';
import { focusRing } from '../../src/components/focus-styles';
import { Link } from '../../src/components/Link';
import { Select } from '../../src/components/Select';
import { Switch } from '../../src/components/Switch';
import { Tag } from '../../src/components/Tag';
import { TextField } from '../../src/components/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';
import { keepSwitchAsCompared, keepToggleColorAsCompared } from './pins';

// 後半の軸 28: 指用の高さ（原則11 — 寸法は入力方式で切り替える、ADR-0004）。1回目で決定（ADR-0045）
// 比べたとき、指用の高さ --size-control-coarse は仮の 44px。マウス用は 40px に決まっている（ADR-0020）
// 決定: 指用は 44px（現行版）。C の 52px は、.coarse-large を付けた要素の中の大きい指用として残す
//   C の行は、.coarse-large で描く（高さは比べたときと同じ 52px）。ほかの行は、比べたときの形のまま
//   決定のあと、大きい指用ではトグルのトラックとノブも高さに比例して大きくした（56×32px・ノブ 26px）。
//   C の行はクラスで描くので、トグルも大きくなる（比べたときは 48×28px のまま）
// 案は高さだけを変える。文字 16px・行の高さ 24px・左右の余白 16px・並べる間 8px は、全案で同じ値を明示する
//   行の高さの規則（整数 px で、部品の高さとの差が偶数 — principles.md「和文の縦位置」）は、
//   40・44・48・52px のどれでも満たす（上下の余白 8・10・12・14px）
// 高さを読む部品: Button・TextField・Select（本体と選択肢）・Switch の行・枠線のリンク（ADR-0039）
//   読まない部品: トグルのトラック（--switch-*）、タグ（文字の大きさに従う）、文字のリンク（ADR-0039 で大きさを持たない）
// 各案は data-density="coarse" と --size-control-coarse の上書きで作る（globals.css が --size-control に解決する）
// 「実機で押す」はスマートフォンで開くためのストーリー。案は1つずつ入れ替えるか、縦に並べる
//   Select の選択肢（シート）は、案の中に描く（container）。body に描くと、案の高さが効かない
//   入れ替えたときは、画面の 60% の高さ（親指のあたり）にある部品が同じ位置に来るよう、スクロールを直す
// 「一覧（パソコン）」は、同じ画面を Comparison で横に並べたもの（ADR の比較画像用）

interface SizeCandidate extends Candidate {
  /** 指用の高さ（px） */
  height: number;
  /** 高さを付けるクラス（C: 大きい指用 — ADR-0045）。ないときは --size-control-coarse を上書きする */
  className?: string;
}

// iPhone 15（460ppi・3倍）で、1px の実寸（mm）
const MM_PER_PX = 25.4 / (460 / 3);

const sizeCandidate = (
  id: string,
  name: string,
  height: number,
  intent: string,
  className?: string
): SizeCandidate => ({
  id,
  name,
  intent,
  height,
  className,
  density: 'coarse',
  tokens: {
    ...(className ? {} : { '--size-control-coarse': `${height}px` }),
    '--text-control-coarse': '16px',
    '--leading-control-coarse': '24px',
    '--space-control-x-coarse': '16px',
    '--space-field-gap-coarse': '8px',
  },
  spec: [
    ['高さ', `${height}px`],
    ['文字', '16px（行の高さ 24px）'],
    ['余白', `上下 ${(height - 24) / 2}px・左右 16px`],
    ['並べる間', '8px'],
    ['実寸', `約 ${(height * MM_PER_PX).toFixed(1)}mm（iPhone 15）`],
    ...(className
      ? ([
          ['クラス', className],
          ['トグル', '56×32px・ノブ 26px（高さに比例。決定のあとに足した）'],
        ] satisfies [string, string][])
      : []),
  ],
});

const candidates: SizeCandidate[] = [
  sizeCandidate(
    '現行版',
    '44px',
    44,
    '比べたときの仮の値。このまま指用の高さに決めた（ADR-0045）。Apple の目安（44pt）と、WCAG 2.5.5（AAA）の 44px にそろう。マウス用（40px）より 4px 高い。'
  ),
  sizeCandidate(
    'A',
    '40px（マウス用と同じ）',
    40,
    'マウス用と同じ高さ。指用とマウス用で、高さの差はなくなる（文字 16px と 14px、左右の余白 16px と 12px などの差は残る）。画面に入る量はいちばん多い。WCAG 2.5.5（AAA）の 44px には届かない。'
  ),
  sizeCandidate('B', '48px', 48, 'Google の目安（48dp）にそろう。マウス用より 8px 高い。'),
  sizeCandidate(
    'C',
    '52px',
    52,
    'いちばん大きい。マウス用より 12px 高い。押しやすさを優先し、画面に入る量は減る。coarse-large のクラスを付けた要素の中の、大きい指用として残した（ADR-0045）。決定のあと、トグルも高さに比例して大きくした。',
    'coarse-large'
  ),
];

// 切り替えと縦に並べる順は、高さの順
const byHeight = [...candidates].sort((a, b) => a.height - b.height);
const candidateOf = (id: string) => candidates.find((c) => c.id === id) ?? candidates[0];
const summary = (c: SizeCandidate) =>
  `高さ ${c.height}px・上下の余白 ${(c.height - 24) / 2}px・左右 16px・間 8px`;

// ── 画面の中身 ────────────────────────────────────────

const prefectures = [
  '北海道',
  '宮城県',
  '東京都',
  '神奈川県',
  '埼玉県',
  '千葉県',
  '愛知県',
  '京都府',
  '大阪府',
  '兵庫県',
  '広島県',
  '福岡県',
  '沖縄県',
].map((label, i) => ({ label, value: `pref-${i}` }));

const accounts = ['X', 'GitHub', 'Zenn', 'note', 'Instagram'];

// リンクを押しても、ページを移らない（href="#" でページの先頭に戻らないようにする）
const stay = (event: { preventDefault: () => void }) => event.preventDefault();

// 部品のラベルと同じ文字（原則4）
const labelClass = 'text-(length:--text-label) leading-(--leading-label) font-bold';

// 外へ出るリンクの印（Phosphor の ArrowUpRight。テキストと並ぶので Regular の線幅 — ADR-0018）
const ArrowUpRightIcon = () => (
  <svg
    viewBox="0 0 256 256"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="size-(--size-icon) shrink-0"
    style={{ strokeWidth: 'var(--icon-stroke)' }}
  >
    <line x1="64" y1="192" x2="192" y2="64" />
    <polyline points="88 64 192 64 192 168" />
  </svg>
);

// Biography 風のモバイルのフォーム。data-anchor は、案を入れ替えたときにスクロールを合わせる目印
const Profile = ({ container }: { container?: HTMLElement }) => (
  <div className="flex flex-col gap-5">
    <h2 data-anchor="title" className="text-xl font-heading">
      プロフィール
    </h2>
    <div data-anchor="name">
      <TextField label="表示名" defaultValue="かずえもん" />
    </div>
    <div data-anchor="url">
      <TextField
        label="サイトの URL"
        prefix="https://"
        defaultValue="k6n.jp"
        caption="プロフィールに表示します"
      />
    </div>
    <div data-anchor="area">
      <Select
        label="住んでいる地域"
        items={prefectures}
        defaultValue="pref-2"
        container={container}
      />
    </div>
    <div data-anchor="switches" className="flex flex-col gap-(--space-field-gap)">
      <Switch
        togglePlacement="end"
        color="primary"
        label="プロフィールを公開する"
        caption="オフにすると、リンクを知っている人だけが見られます"
        defaultChecked
      />
      <Switch togglePlacement="end" color="primary" label="新しい記事をメールで知らせる" />
    </div>
    <div data-anchor="tags" className="flex flex-col gap-(--space-field-gap)">
      <p className={labelClass}>よく使う技術</p>
      <div className="flex flex-wrap gap-1.5">
        <Tag color="primary">React</Tag>
        <Tag color="primary">TypeScript</Tag>
        <Tag>Tailwind CSS</Tag>
        <Tag>Figma</Tag>
        <Tag color="secondary">写真</Tag>
      </div>
    </div>
    <div data-anchor="actions" className="grid grid-cols-2 gap-(--space-field-gap)">
      <Button color="primary">保存する</Button>
      <Button>キャンセル</Button>
    </div>
    <div data-anchor="links" className="flex flex-col gap-(--space-field-gap)">
      <p className={labelClass}>ほかのアカウント</p>
      <div className="flex flex-wrap gap-(--space-field-gap)">
        {accounts.map((name) => (
          <Link key={name} appearance="outline" href="#" onClick={stay}>
            {name}
            <ArrowUpRightIcon />
          </Link>
        ))}
      </div>
    </div>
    <p data-anchor="text" className="text-sm leading-6 text-fg-muted">
      公開する前に、
      <Link color="primary" href="#" onClick={stay}>
        プロフィールの書き方
      </Link>
      と
      <Link color="primary" href="#" onClick={stay}>
        利用規約
      </Link>
      を読んでください。
    </p>
  </div>
);

// ── 押し間違いを試す ──────────────────────────────────

const TAPS = 24;

interface Score {
  hit: number;
  miss: number;
  /** いま押してほしいボタンの番号 */
  target: number;
}

const firstScore: Score = { hit: 0, miss: 0, target: 10 };

// 今のボタン以外から1つ選ぶ。r は 0 以上 1 未満の乱数（状態の更新を純粋に保つため、外で作って渡す）
const nextTarget = (current: number, r: number) => {
  const n = 1 + Math.floor(r * (TAPS - 1));
  return n >= current ? n + 1 : n;
};

// 案ごとの当たり・外れ。入れ替えても案ごとに残す
const useScores = () => {
  const [scores, setScores] = useState<Record<string, Score>>({});
  const press = useCallback((id: string, n: number) => {
    const r = Math.random();
    setScores((all) => {
      const s = all[id] ?? firstScore;
      const next =
        n === s.target
          ? { hit: s.hit + 1, miss: s.miss, target: nextTarget(s.target, r) }
          : { ...s, miss: s.miss + 1 };
      return { ...all, [id]: next };
    });
  }, []);
  const reset = useCallback((id: string) => setScores((all) => ({ ...all, [id]: firstScore })), []);
  return { scores, press, reset };
};

interface TapTestProps {
  score?: Score;
  /** 押したボタンの番号。ボタンの間（隙間）を押したときは 0（いつも外れ） */
  onPress: (n: number) => void;
  onReset: () => void;
}

// 高さと同じ幅の正方形のボタン（アイコンのボタンと同じ大きさ）を、間 8px で詰めて並べる
const TapTest = ({ score = firstScore, onPress, onReset }: TapTestProps) => {
  const total = score.hit + score.miss;
  return (
    <div className="flex flex-col gap-3">
      <div data-anchor="tap-intro" className="flex flex-col gap-1">
        <h3 className="text-base font-bold">押し間違いを試す</h3>
        <p className="text-sm leading-6 text-fg-muted">
          青いボタンを、次々に押してください。ほかのボタンや、ボタンの間を押すと「外れ」に数えます。ボタンは高さと同じ幅の正方形で、8px
          ずつ空けて並べています。
        </p>
      </div>
      {/* ボタンの間（隙間）を押したときも外れに数える。数えないと、隙間の割合が大きい低い案ほど外れが少なく出る */}
      <div
        data-anchor="tap-grid"
        className="flex [touch-action:manipulation] flex-wrap gap-(--space-field-gap)"
        onClick={(event) => {
          if (event.target === event.currentTarget) onPress(0);
        }}
      >
        {Array.from({ length: TAPS }, (_, i) => i + 1).map((n) => (
          <Button
            key={n}
            color={n === score.target ? 'primary' : 'neutral'}
            style={{ width: 'var(--size-control)', paddingInline: 0 }}
            onClick={() => onPress(n)}
          >
            {n}
          </Button>
        ))}
      </div>
      <div data-anchor="tap-score" className="flex items-center justify-between gap-3">
        <p className="text-sm tabular-nums" aria-live="polite">
          当たり <strong>{score.hit}</strong>・外れ <strong>{score.miss}</strong>
          {total > 0 && `（外れ ${Math.round((score.miss / total) * 100)}%）`}
        </p>
        <Button appearance="outline" onClick={onReset}>
          やり直す
        </Button>
      </div>
    </div>
  );
};

// ── 実機で押す ────────────────────────────────────────

// 画面の高さのうち、親指のあたり。入れ替えたとき、この高さにある部品を同じ位置に保つ
const THUMB = 0.6;

interface Anchor {
  key: string;
  /** 目印の中の位置（0: 上端、1: 下端） */
  frac: number;
  /** 目印の外（隙間）にいたときの、目印の端からの距離 */
  extra: number;
  /** 画面の中の高さ */
  y: number;
}

const findAnchor = (scope: ParentNode): Anchor | null => {
  const y = window.innerHeight * THUMB;
  let best: { el: HTMLElement; rect: DOMRect; dist: number } | null = null;
  for (const el of scope.querySelectorAll<HTMLElement>('[data-anchor]')) {
    const rect = el.getBoundingClientRect();
    let dist = 0;
    if (y < rect.top) dist = rect.top - y;
    else if (y > rect.bottom) dist = y - rect.bottom;
    if (!best || dist < best.dist) best = { el, rect, dist };
  }
  if (!best) return null;
  const { rect } = best;
  const frac = rect.height ? Math.min(1, Math.max(0, (y - rect.top) / rect.height)) : 0;
  return {
    key: best.el.dataset.anchor ?? '',
    frac,
    extra: y - (rect.top + frac * rect.height),
    y,
  };
};

const restoreAnchor = (scope: ParentNode, anchor: Anchor) => {
  const el = scope.querySelector<HTMLElement>(`[data-anchor="${anchor.key}"]`);
  if (!el) return;
  const rect = el.getBoundingClientRect();
  window.scrollBy(0, rect.top + anchor.frac * rect.height + anchor.extra - anchor.y);
};

// 要素の高さを測る（フォームの長さ）
const useHeight = (el: HTMLElement | null) => {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (!el) return undefined;
    const observer = new ResizeObserver(() => setHeight(Math.round(el.offsetHeight)));
    observer.observe(el);
    return () => observer.disconnect();
  }, [el]);
  return height;
};

// 切り替えの見た目。白いボタンと同じく、選んだものは白い面に影と輪郭（原則1）
const segmentClass = (on: boolean) =>
  [
    'flex min-w-0 cursor-pointer flex-col items-center justify-center rounded-[8px] font-bold [touch-action:manipulation]',
    ...focusRing,
    on ? 'bg-surface text-fg shadow-raised' : 'text-fg-muted',
  ].join(' ');

// 案の切り替え。部品の寸法にはよらず、どの案でも同じ大きさ（高さ 48px）
const CandidateSwitch = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) => (
  <div
    aria-label="案"
    role="group"
    className="grid grid-cols-4 gap-1 rounded-control bg-neutral p-1"
  >
    {byHeight.map((c) => (
      <button
        key={c.id}
        type="button"
        aria-pressed={c.id === value}
        onClick={() => onChange(c.id)}
        className={`h-12 leading-4 ${segmentClass(c.id === value)}`}
      >
        <span className="text-xs">{c.id}</span>
        <span className="text-base tabular-nums">{c.height}px</span>
      </button>
    ))}
  </div>
);

type Mode = 'swap' | 'stack';

const modes: [Mode, string][] = [
  ['swap', '1つずつ入れ替える'],
  ['stack', '縦に並べる'],
];

const ModeSwitch = ({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) => (
  <div
    aria-label="並べ方"
    role="group"
    className="grid grid-cols-2 gap-1 rounded-control bg-neutral p-1"
  >
    {modes.map(([value, label]) => (
      <button
        key={value}
        type="button"
        aria-pressed={mode === value}
        onClick={() => onChange(value)}
        className={`h-10 text-sm ${segmentClass(mode === value)}`}
      >
        {label}
      </button>
    ))}
  </div>
);

interface SectionProps {
  candidate: SizeCandidate;
  picked: boolean;
  score?: Score;
  onPress: (id: string, n: number) => void;
  onReset: (id: string) => void;
}

// 1つの案の画面。Select の選択肢はこの中に描き、案の高さを効かせる
const CandidateSection = ({ candidate, picked, score, onPress, onReset }: SectionProps) => {
  const [section, setSection] = useState<HTMLElement | null>(null);
  const [form, setForm] = useState<HTMLDivElement | null>(null);
  const length = useHeight(form);
  return (
    <section
      ref={setSection}
      data-axis28-section={candidate.id}
      data-density="coarse"
      style={candidate.tokens}
      className={`mx-auto flex max-w-[480px] flex-col gap-8 px-4 pt-6 pb-16 ${candidate.className ?? ''}`}
    >
      <header className="flex flex-col gap-2 rounded-card bg-neutral px-4 py-3">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-2xl font-heading">{candidate.id}</span>
          <span className="font-bold">{candidate.name}</span>
          {picked && (
            <span className="rounded-pill bg-tag px-2 py-0.5 text-xs font-bold text-on-tag">
              採用
            </span>
          )}
        </div>
        <p className="text-sm leading-6 text-fg-muted">{candidate.intent}</p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs leading-5">
          {candidate.spec.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-fg-muted">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
          <dt className="text-fg-muted">フォームの長さ</dt>
          <dd className="tabular-nums">{length ? `${length}px` : '—'}</dd>
        </dl>
      </header>
      <div ref={setForm}>
        <Profile container={section ?? undefined} />
      </div>
      <TapTest
        score={score}
        onPress={(n) => onPress(candidate.id, n)}
        onReset={() => onReset(candidate.id)}
      />
    </section>
  );
};

const DeviceView = ({ pick }: { pick: string }) => {
  const [mode, setMode] = useState<Mode>('swap');
  const [active, setActive] = useState('現行版');
  const { scores, press, reset } = useScores();
  const root = useRef<HTMLDivElement>(null);
  // 入れ替えたあと（描き直したあと）に合わせる目印
  const pending = useRef<{ anchor: Anchor; target: string } | null>(null);

  const sectionOf = (id: string) =>
    root.current?.querySelector(`[data-axis28-section="${id}"]`) ?? null;

  const select = (id: string) => {
    const from = sectionOf(active);
    const anchor = from && findAnchor(from);
    if (mode === 'stack') {
      // 並べているときは描き直さないので、すぐに合わせる
      const to = sectionOf(id);
      if (anchor && to) restoreAnchor(to, anchor);
    } else {
      pending.current = anchor ? { anchor, target: id } : null;
    }
    setActive(id);
  };

  const changeMode = (next: Mode) => {
    if (next === mode) return;
    const from = sectionOf(active);
    const anchor = from && findAnchor(from);
    pending.current = anchor ? { anchor, target: active } : null;
    setMode(next);
  };

  // 描き直すたびに、入れ替えで残した目印があれば合わせる
  useLayoutEffect(() => {
    const job = pending.current;
    if (!job) return;
    pending.current = null;
    const to = root.current?.querySelector(`[data-axis28-section="${job.target}"]`);
    if (to) restoreAnchor(to, job.anchor);
  });

  // 並べているときは、親指のあたりにある案を、上の切り替えで選んだ状態にする
  useEffect(() => {
    if (mode !== 'stack') return undefined;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.innerHeight * THUMB;
        const sections = root.current?.querySelectorAll<HTMLElement>('[data-axis28-section]') ?? [];
        for (const el of sections) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= y && rect.bottom > y) {
            const id = el.dataset.axis28Section;
            if (id) setActive(id);
            break;
          }
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [mode]);

  // Comparison と同じく、カンマで区切って2つ以上付けられる（例: current,C）
  const picks = pick ? pick.split(',').map((id) => id.trim()) : [];
  const isPicked = (c: SizeCandidate) =>
    picks.some((id) => id === c.id || (id === 'current' && c.id === '現行版'));
  const sectionProps = (c: SizeCandidate) => ({
    candidate: c,
    picked: isPicked(c),
    score: scores[c.id],
    onPress: press,
    onReset: reset,
  });

  return (
    // ブラウザのスクロールの補正（overflow-anchor）は切り、上の目印で合わせる。iOS の Safari には補正がないため
    // 下に画面の 40% の余白を置く。いちばん下の押し間違いのボタンでも、短い案に入れ替えたときにスクロールが止まらず、同じ位置に来る
    <div ref={root} className="min-h-screen bg-bg pb-[40vh] text-fg [overflow-anchor:none]">
      <header className="mx-auto flex max-w-[480px] flex-col gap-3 px-4 pt-6 pb-4">
        <p className="text-sm font-bold text-fg-subtle">後半の軸 28</p>
        <h1 className="text-2xl font-heading text-balance">指用の高さ（実機）</h1>
        <div className="flex flex-col gap-2 text-sm leading-6 text-fg-muted">
          <p>
            決定: 指用の高さは 44px（現行版）です。C の 52px は、要素に coarse-large
            のクラスを付けたときの、大きい指用として残します。マウス用は変わりません（ADR-0045）。大きい指用では、トグルも高さに比例して大きくなります（56×32px）。タグは文字の大きさに従い、変わりません。
          </p>
          <p>
            指で操作するときの、部品の高さを比べました。比べたときの 44px
            は仮の値でした（原則11）。マウス用は 40px に決まっています（ADR-0020）。
          </p>
          <p>
            スマートフォンで開き、指で押して比べてください。上の切り替えで案を入れ替えると、親指のあたりにある部品が、同じ位置に来ます。
          </p>
          <p>
            変えるのは高さだけです。文字 16px・行の高さ 24px・左右の余白 16px・並べる間 8px
            は、どの案も同じです。枠線のリンク（ADR-0039）と Select
            の選択肢も、ボタンと一緒に変わりました。比べたときは、トグルのトラック、タグ、文字のリンクは変えませんでした（C
            の行のトグルは、決定に合わせて大きく描いています）。
          </p>
          <p>
            どの高さがいちばん押しやすく、画面に入る量ともつり合うかを1つ選び、一言添えてください。
          </p>
        </div>
        <ModeSwitch mode={mode} onChange={changeMode} />
      </header>
      <div className="sticky top-0 z-5 border-b border-line bg-bg">
        <div className="mx-auto flex max-w-[480px] flex-col gap-1.5 px-4 py-2">
          <CandidateSwitch value={active} onChange={select} />
          <p className="truncate text-xs leading-4 text-fg-muted">{summary(candidateOf(active))}</p>
        </div>
      </div>
      {mode === 'swap' ? (
        <CandidateSection {...sectionProps(candidateOf(active))} />
      ) : (
        byHeight.map((c) => (
          <div key={c.id} className="border-b border-line">
            <CandidateSection {...sectionProps(c)} />
          </div>
        ))
      )}
    </div>
  );
};

// ── 一覧（パソコン） ──────────────────────────────────

const columns: Column[] = [
  {
    label: 'フォーム',
    note: '指用の密度に固定し、幅 375px で描いています。Select の選択肢も、行の高さで開きます',
  },
  { label: '押し間違いを試す', note: '青いボタンを押すと、当たりと外れを数えます' },
];

// Select の選択肢を、行（案のトークン）の中に描く
const ProfileCell = () => {
  const [cell, setCell] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setCell} className="relative max-w-[375px]">
      <Profile container={cell ?? undefined} />
    </div>
  );
};

const Overview = ({ pick }: { pick: string }) => {
  const { scores, press, reset } = useScores();
  return (
    <Comparison
      index={28}
      axis="指用の高さ（実機）"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const cell =
          column.label === 'フォーム' ? (
            <ProfileCell />
          ) : (
            <TapTest
              score={scores[candidate.id]}
              onPress={(n) => press(candidate.id, n)}
              onReset={() => reset(candidate.id)}
            />
          );
        // C は、行の中の要素に .coarse-large を付けて描く（部品が使うのと同じ仕組み — ADR-0045）
        const { className } = candidateOf(candidate.id);
        return className ? <div className={className}>{cell}</div> : cell;
      }}
    >
      <p>
        決定: 指用の高さは 44px（現行版）です。C の 52px は、要素に coarse-large
        のクラスを付けたときの、大きい指用として残します。マウス用は変わりません（ADR-0045）。大きい指用では、トグルも高さに比例して大きくなります（56×32px）。タグは文字の大きさに従い、変わりません。
      </p>
      <p>
        指で操作するときの、部品の高さを比べました。比べたときの 44px
        は仮の値でした（原則11）。マウス用は 40px に決まっています（ADR-0020）。
      </p>
      <p>
        この一覧は、パソコンで全体を見るためのものです。押しやすさは、スマートフォンで「実機で押す」を開いて確かめてください。
      </p>
      <p>
        変えるのは高さだけです。文字 16px・行の高さ 24px は同じなので、上下の余白は 8・10・12・14px
        と整数になります。枠線のリンク（ADR-0039）と Select
        の選択肢も、ボタンと一緒に変わりました。比べたときは、トグルのトラック、タグ、文字のリンクは変えませんでした（C
        の行のトグルは、決定に合わせて大きく描いています）。
      </p>
      <p>どの高さがいちばん押しやすく、画面に入る量ともつり合うかを1つ選び、一言添えてください。</p>
    </Comparison>
  );
};

// ── ストーリー ────────────────────────────────────────

interface ComparisonArgs {
  pick: string;
}

const pickArg = {
  pick: {
    description: '採用した案（ADR の比較画像用）',
    control: 'inline-radio',
    options: ['', 'current', 'A', 'B', 'C', 'current,C'],
  },
} as const;

const meta = {
  title: 'Design Review/28 指用の高さ（実機）',
  decorators: [keepSwitchAsCompared, keepToggleColorAsCompared],
  id: 'design-review-28-coarse-size',
  parameters: { layout: 'fullscreen' },
  // 決定（ADR-0045）: 指用は 44px（現行版）。C は大きい指用（.coarse-large）として残す
  args: { pick: 'current,C' },
  argTypes: pickArg,
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Device: Story = {
  name: '実機で押す',
  render: ({ pick }) => <DeviceView pick={pick} />,
};

export const Candidates: Story = {
  name: '一覧（パソコン）',
  render: ({ pick }) => <Overview pick={pick} />,
};
