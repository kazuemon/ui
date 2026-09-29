import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  type ReactNode,
  type RefObject,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Heading, type HeadingSize } from '../../src/components/heading/Heading';
import { Text } from '../../src/components/text/Text';

// 軸 387: 見出し 1 より大きい段（Hero・節の大見出し・大きな数字）
//   いまの見出しは 28・22・18・16px（マウス）で、差を小さくしてある（ADR-0078）。機能の画面にはちょうどよいが、
//   ポートフォリオのトップのような Hero では 1 でも小さい。上に段を足す形を、固定の値と画面の幅で伸び縮みする値で比べる
const meta = {
  title: 'Design Review/387 見出しの大きい段',
  id: 'design-review-387-display-heading',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'C' },
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

// 値の書き方: [文字, 行の高さ, 字間] をマウス（fine）と指（coarse）で持つ。案はトークンの -fine・-coarse を上書きする
type Tier = [size: string, leading: string, tracking: string];
const tiers = (fine: Tier[], coarse: Tier[]) =>
  Object.fromEntries(
    (
      [
        ['fine', fine],
        ['coarse', coarse],
      ] as const
    ).flatMap(([density, values]) =>
      values.flatMap(([size, leading, tracking], i) => [
        [`--text-display-${i + 1}-${density}`, size],
        [`--leading-display-${i + 1}-${density}`, leading],
        [`--display-${i + 1}-tracking-${density}`, tracking],
      ])
    )
  );

// 伸び縮みする値: 入れ物の幅（cqi。入れ物がなければ画面の幅）で決め、文字は 1px、行の高さは 2px 刻みに丸める（原則10: 行の高さは整数 px）
const fluid = (min: number, max: number): Tier => {
  // 幅 328px（スマホの本文の幅）で min、880px で max になる直線
  const slope = (max - min) / (880 - 328);
  const base = min - slope * 328;
  const size = `round(clamp(${min}px, ${base.toFixed(2)}px + ${(slope * 100).toFixed(3)}cqi, ${max}px), 1px)`;
  return [size, `round(calc(${size} * 1.22), 2px)`, '-0.01em'];
};

const px = (size: number, leading: number, tracking = '-0.01em'): Tier => [
  `${size}px`,
  `${leading}px`,
  tracking,
];

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '見出し 1 まで',
    intent: 'いちばん大きいのは見出し 1（マウス 28px・指 24px）。Hero も節の見出しも、この段で組む',
    spec: [['最大', '28/40・24/34']],
  },
  {
    id: 'A',
    name: '和文の組版から',
    intent:
      '和文の太字の 1 行の文字数と、行の詰め方から決めた案。スマホのでかいは 38px（2 行で 16 字ほど入るいちばん大きい値）。大きい段ほど字間と行の高さを詰める',
    spec: [
      ['でかい', '56/68・38/46（−0.02em）'],
      ['おおきい', '44/56・32/42（−0.015em）'],
      ['おおきめ', '36/48・28/38（−0.01em）'],
    ],
    tokens: tiers(
      [px(56, 68, '-0.02em'), px(44, 56, '-0.015em'), px(36, 48)],
      [px(38, 46, '-0.02em'), px(32, 42, '-0.015em'), px(28, 38)]
    ),
  },
  {
    id: 'B',
    name: '比から',
    intent:
      '今の段の比（約 1.25 倍）をそのまま上に延ばした案。デスクトップは 28 から 3 段で 2 倍。スマホは比を 1.19 倍に下げる。行の高さは 1.3 倍を下限にして広め',
    spec: [
      ['でかい', '56/72・40/52'],
      ['おおきい', '44/56・34/44'],
      ['おおきめ', '36/48・28/36'],
    ],
    tokens: tiers([px(56, 72), px(44, 56), px(36, 48)], [px(40, 52), px(34, 44), px(28, 36)]),
  },
  {
    id: 'C',
    name: '実例から',
    intent:
      'デジタル庁・Vercel・Material・Apple などの値の傾向から決めた案。スマホはデスクトップの約 0.7 倍。A と B の間',
    spec: [
      ['でかい', '56/68・40/50'],
      ['おおきい', '44/56・32/42'],
      ['おおきめ', '36/48・28/38'],
    ],
    tokens: tiers([px(56, 68), px(44, 56), px(36, 48)], [px(40, 50), px(32, 42), px(28, 38)]),
  },
  {
    id: 'D',
    name: '幅で伸び縮み',
    intent:
      'C の端の値を、入れ物の幅で伸び縮みさせる案。マウスか指かでは変えない。iPad のように広くて指で触る画面でも、広さに合った大きさになる',
    spec: [
      ['でかい', '40〜56'],
      ['おおきい', '32〜44'],
      ['おおきめ', '28〜36'],
      ['行の高さ', '×1.22 を 2px に丸める'],
    ],
    tokens: (() => {
      const t = [fluid(40, 56), fluid(32, 44), fluid(28, 36)];
      return tiers(t, t);
    })(),
  },
];

const tiersOf: Record<string, HeadingSize[]> = {
  現行版: [],
  A: ['display-1', 'display-2', 'display-3'],
  B: ['display-1', 'display-2', 'display-3'],
  C: ['display-1', 'display-2', 'display-3'],
  D: ['display-1', 'display-2', 'display-3'],
};

const columns: Column[] = [
  { label: 'Hero', note: 'デスクトップ（マウス）・幅 880px' },
  { label: 'Hero（スマホ）', note: 'スマホ（指）・幅 360px' },
  { label: '節の見出しと数字', note: 'デスクトップ・幅 560px。おおきい・おおきめ' },
  {
    label: '段の一覧',
    note: 'デスクトップ・幅 640px。名前の右は描いた大きさ（文字/行の高さ px）。下線はすべての案で同じでない値',
  },
  { label: '段の一覧（スマホ）', note: 'スマホ・幅 360px。名前の右は描いた大きさ' },
];

// 入れ物（container-type: inline-size）にして、伸び縮みする案が枠の幅で変わるようにする
// 密度は枠ごとに固定する（デスクトップ = fine、スマホ = coarse）
function Frame({
  width,
  density,
  children,
}: {
  width: number;
  density: 'fine' | 'coarse';
  children: ReactNode;
}) {
  return (
    <div
      data-density={density}
      className="@container rounded-card border border-line bg-bg p-6"
      style={{ width }}
    >
      {children}
    </div>
  );
}

function Hero({ size }: { size: HeadingSize }) {
  return (
    <div className="flex flex-col gap-5">
      <Text size="sm" variant="muted">
        かずえもん / Kazuemon
      </Text>
      {/* 折り返しは部品で決めないので、見本では文節で折り返す指定を付ける */}
      <Heading level={1} size={size} className="text-balance [word-break:auto-phrase]">
        やわらかい UI を、ちゃんと作る。
      </Heading>
      <Text>
        デザインシステムと、それを使ったアプリを作っています。ここには作品と、作りながら考えたことを置いています。
      </Text>
      <div className="flex flex-wrap gap-3">
        <Button color="primary">作品を見る</Button>
        <Button variant="outline">ブログ</Button>
      </div>
    </div>
  );
}

function Section({ size, priceSize }: { size: HeadingSize; priceSize: HeadingSize }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Heading level={2} size={size}>
          料金
        </Heading>
        <Text variant="muted">個人の利用は無料です。</Text>
      </div>
      <div className="flex items-baseline gap-2">
        <Heading level={3} size={priceSize}>
          ¥980
        </Heading>
        <Text as="span" variant="muted">
          / 月
        </Text>
      </div>
    </div>
  );
}

// 段の名前: [統一した名前の案, いまの呼び名]
const sizeLabel: Record<string, [string, string]> = {
  'display-1': ['5xl', 'でかい'],
  'display-2': ['4xl', 'おおきい'],
  'display-3': ['3xl', 'おおきめ'],
  1: ['2xl', '見出し 1'],
  2: ['xl', '見出し 2'],
  3: ['lg', '見出し 3'],
  4: ['md', '見出し 4'],
};

// 見出し以外の文字。名前は Text と共有する案での段（ラベル・部品の文字は役割の大きさで、段の外）
const otherText: [name: string, role: string, className: string][] = [
  ['md', '本文', 'text-body'],
  ['sm', '注記', 'text-body-sm'],
  ['—', '部品の文字', 'text-control'],
  ['—', '入力欄の値', 'text-input'],
  ['—', 'ラベル', 'text-label font-bold'],
  ['xs', 'キャプション', 'text-caption'],
];

// 描いたあとの文字の大きさと行の高さ（px）を読む。伸び縮みする案は幅で変わるので、大きさが変わるたびに読み直す
function useMeasuredType(ref: RefObject<HTMLElement | null>) {
  const [value, setValue] = useState('');
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const read = () => {
      const style = getComputedStyle(element);
      setValue(
        `${Math.round(parseFloat(style.fontSize))}/${Math.round(parseFloat(style.lineHeight))}`
      );
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return value;
}

// 測った値を段と列ごとに集め、案のあいだで同じかを比べる（すべての案で同じでない値に下線を引く）
// key は「列|段の名前」、値は案の id → 測った値
const measured = new Map<string, Map<string, string>>();
const listeners = new Set<() => void>();
let version = 0;
function report(key: string, candidate: string, px: string) {
  const byCandidate = measured.get(key) ?? new Map<string, string>();
  if (byCandidate.get(candidate) === px) return;
  byCandidate.set(candidate, px);
  measured.set(key, byCandidate);
  version += 1;
  for (const listener of listeners) listener();
}
function useMeasuredVersion() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => version
  );
}
function differs(key: string) {
  const values = new Set(measured.get(key)?.values() ?? []);
  return values.size > 1;
}

interface TierPlace {
  /** 列（デスクトップ・スマホ） */
  column: string;
  candidate: string;
}

function TierLabel({
  name,
  role,
  px,
  place,
}: {
  name: string;
  role: string;
  px: string;
  place: TierPlace;
}) {
  const key = `${place.column}|${role}`;
  useLayoutEffect(() => {
    if (px) report(key, place.candidate, px);
  }, [key, place.candidate, px]);
  useMeasuredVersion();
  return (
    <span className="flex w-44 shrink-0 items-baseline gap-2 text-xs whitespace-nowrap text-fg-subtle">
      <span className="w-7 font-mono">{name}</span>
      <span
        className={[
          'w-12 font-mono text-fg-muted tabular-nums',
          differs(key) ? 'underline decoration-fg-muted underline-offset-2' : '',
        ].join(' ')}
      >
        {px}
      </span>
      <span>{role}</span>
    </span>
  );
}

function HeadingTier({ size, place }: { size: HeadingSize; place: TierPlace }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const px = useMeasuredType(ref);
  const [name, role] = sizeLabel[size] ?? ['', ''];
  return (
    <div className="flex items-baseline gap-3">
      <TierLabel name={name} role={role} px={px} place={place} />
      <Heading ref={ref} level={3} size={size} className="truncate">
        見出し Aa 123
      </Heading>
    </div>
  );
}

function TextTier({
  name,
  role,
  className,
  place,
}: {
  name: string;
  role: string;
  className: string;
  place: TierPlace;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const px = useMeasuredType(ref);
  return (
    <div className="flex items-baseline gap-3">
      <TierLabel name={name} role={role} px={px} place={place} />
      <span ref={ref} className={`truncate text-fg ${className}`}>
        文字の大きさ Aa 123
      </span>
    </div>
  );
}

// 名前の右に、描いた大きさ（文字/行の高さ px）を出す。すべての案で同じでない値には下線を引く
function Tiers({ tiers, place }: { tiers: HeadingSize[]; place: TierPlace }) {
  const all: HeadingSize[] = [...tiers, 1, 2, 3, 4];
  return (
    <div className="flex flex-col gap-3">
      {all.map((size) => (
        <HeadingTier key={size} size={size} place={place} />
      ))}
      <div className="border-t border-line" />
      {otherText.map(([name, role, className]) => (
        <TextTier key={role} name={name} role={role} className={className} place={place} />
      ))}
    </div>
  );
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={387}
      axis="見出しの大きい段"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const tiers = tiersOf[candidate.id] ?? [];
        const top: HeadingSize = tiers[0] ?? 1;
        const second: HeadingSize = tiers[1] ?? 1;
        const third: HeadingSize = tiers[2] ?? 1;
        return (
          <>
            {column.label === 'Hero' && (
              <Frame width={880} density="fine">
                <Hero size={top} />
              </Frame>
            )}
            {column.label === 'Hero（スマホ）' && (
              <Frame width={360} density="coarse">
                <Hero size={top} />
              </Frame>
            )}
            {column.label === '節の見出しと数字' && (
              <Frame width={560} density="fine">
                <Section size={second} priceSize={third} />
              </Frame>
            )}
            {column.label === '段の一覧' && (
              <Frame width={640} density="fine">
                <Tiers tiers={tiers} place={{ column: 'fine', candidate: candidate.id }} />
              </Frame>
            )}
            {column.label === '段の一覧（スマホ）' && (
              <Frame width={360} density="coarse">
                <Tiers tiers={tiers} place={{ column: 'coarse', candidate: candidate.id }} />
              </Frame>
            )}
          </>
        );
      }}
    >
      <p>
        決定（ADR-0368・0369）: C（実例から）。デスクトップ 56/68・44/56・36/48、スマホ
        40/50・32/42・28/38、字間 −0.01em。名前は Text と共有する xs〜5xl（見出しは
        md〜5xl）、トークンとクラスは heading-・body- を付ける。
      </p>
      <p>
        見出し 1 の上に 3 段（でかい・おおきい・おおきめ）を足します。見出し 1〜4
        の値は変えません。案は、観点を変えた 3
        人のエージェント（和文の組版・比の設計・実例の調査）に出してもらいました。デスクトップはどれも
        56・44・36px でそろい、スマホの値と行の高さで分かれています。
      </p>
      <p>
        A〜C は、今の見出しと同じくマウスか指かで値を切り替えます。D
        だけは入れ物の幅で決めます。字間は、A だけ段ごとに詰め、ほかは −0.01em です。
      </p>
      <p>
        名前の候補: ① 見出しだけの 7 段（xs〜3xl。xs = 今の見出し 4、3xl = でかい） ② Text
        と共有する 1 列（xs 12・sm 14・md 16 本文・lg 18・xl 22・2xl 28・3xl 36・4xl 44・5xl
        56。見出しは md〜5xl、Text は xs〜lg が既定の範囲） ③ 今の heading-1〜4
        と、display-sm・md・lg に分ける（Material・Primer の形）。Tailwind の既定の
        text-3xl（30px）などと名前が重なるので、クラスは text-heading-3xl のように接頭辞を付けます。
      </p>
    </Comparison>
  ),
};
