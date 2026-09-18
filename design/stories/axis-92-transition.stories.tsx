import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';

import { Button } from '../../src/components/button/Button';
import { Notice } from '../../src/components/notice/Notice';
import { Portal } from '../../src/components/portal/Portal';
import { Tag } from '../../src/components/tag/Tag';
import { Text } from '../../src/components/text/Text';
import { TextField } from '../../src/components/text-field/TextField';
import { Transition } from '../../src/components/transition/Transition';
import { type Candidate, type Column, Comparison } from './Comparison';

// 軸 92: 出入りの動き（Transition）
// 変えるのは design/tokens.css の --transition-* だけ（src/components/transition/Transition.tsx が読む）
//   --transition-shift・--transition-scale: preset を書かないときの出方（下へのずれ・はじめの大きさ）
//   --transition-duration-enter・-exit: 出る・消える長さ。--transition-ease-enter・-exit: 緩急
// どの案も濃さは 0 から。弾ませない（原則3）。動きを減らす設定では、どの案も動かさずにすぐ出す・消す

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '浮かぶ面と同じ',
    intent:
      '8px 下から、濃さと一緒に定位置へ滑る。消えるときは同じ道を戻る。Select の選択肢・Popover・Tooltip の出方（長さと緩急も）と同じなので、画面の中の動きがそろう。',
    spec: [
      ['出方', '濃さ 0→1、8px 下から'],
      ['出る', '200ms・シートの緩急（出だしが速く、ゆっくり止まる）'],
      ['消える', '150ms・同じ緩急'],
    ],
    tokens: {
      '--transition-shift': '8px',
      '--transition-scale': '1',
      '--transition-duration-enter': '200ms',
      '--transition-duration-exit': '150ms',
      '--transition-ease-enter': 'var(--ease-sheet)',
      '--transition-ease-exit': 'var(--ease-sheet)',
    },
  },
  {
    id: 'A',
    name: '濃さだけ',
    intent:
      '位置も大きさも変えず、その場で濃くなる。いちばん静かで、並んだ要素を揺らさない。長さと緩急は現行版と同じ。',
    spec: [
      ['出方', '濃さ 0→1'],
      ['出る', '200ms・シートの緩急'],
      ['消える', '150ms・同じ緩急'],
    ],
    tokens: {
      '--transition-shift': '0px',
      '--transition-scale': '1',
      '--transition-duration-enter': '200ms',
      '--transition-duration-exit': '150ms',
      '--transition-ease-enter': 'var(--ease-sheet)',
      '--transition-ease-exit': 'var(--ease-sheet)',
    },
  },
  {
    id: 'B',
    name: '少し小さい姿から',
    intent:
      '96% の大きさから、濃さと一緒に広がる。中央から膨らむので、タグのような小さなものが「足された」ことが分かりやすい。長さと緩急は現行版と同じ。',
    spec: [
      ['出方', '濃さ 0→1、大きさ 96%→100%（中央から）'],
      ['出る', '200ms・シートの緩急'],
      ['消える', '150ms・同じ緩急'],
    ],
    tokens: {
      '--transition-shift': '0px',
      '--transition-scale': '0.96',
      '--transition-duration-enter': '200ms',
      '--transition-duration-exit': '150ms',
      '--transition-ease-enter': 'var(--ease-sheet)',
      '--transition-ease-exit': 'var(--ease-sheet)',
    },
  },
  {
    id: 'C',
    name: 'ゆったり出て、さっと消える',
    intent:
      '出方は現行版と同じ 8px 下から。出るときはシートより長い 300ms でゆったり現れ、消えるときは 100ms で加速しながら去る（緩急 ease-in）。出たことに気づかせ、消すときは待たせない。',
    spec: [
      ['出方', '濃さ 0→1、8px 下から'],
      ['出る', '300ms・シートの緩急'],
      ['消える', '100ms・ease-in（だんだん速く）'],
    ],
    tokens: {
      '--transition-shift': '8px',
      '--transition-scale': '1',
      '--transition-duration-enter': '300ms',
      '--transition-duration-exit': '100ms',
      '--transition-ease-enter': 'var(--ease-sheet)',
      '--transition-ease-exit': 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },
];

const SLOW = 5;

// 「ゆっくり見る」では、長さのトークンを 5 倍にする
const slowed = (candidate: Candidate): Candidate => ({
  ...candidate,
  tokens: Object.fromEntries(
    Object.entries(candidate.tokens ?? {}).map(([key, value]) => [
      key,
      key.includes('duration') ? `${parseFloat(String(value)) * SLOW}ms` : value,
    ])
  ),
});

const columns: Column[] = [
  {
    label: '送ったあとに Notice が出る',
    note: 'Form の下にお知らせが出る。「送る」を押しても動きます',
  },
  { label: 'Tag を足す・外す', note: '最後のタグが消えてから、新しいタグが足される' },
  {
    label: '画面の下に出る操作の帯',
    note: '自前の浮かぶ帯（Portal で枠の中に描く）。帯が消えてから、もう一度出る',
  },
];

// 「もう一度動かす」で、どの場面も消してから出し直す。replay が増えるたびに動く
function useReplay(replay: number, slow: boolean) {
  const [show, setShow] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // 描いたときの回数。そこから増えたら動かす（「ゆっくり見る」を切り替えると描き直すので、その回数から数える）
  const start = useRef(replay);
  useEffect(() => {
    if (replay === start.current) return undefined;
    setShow(false);
    timer.current = setTimeout(() => setShow(true), slow ? 2000 : 600);
    return () => clearTimeout(timer.current);
  }, [replay, slow]);
  return [show, setShow] as const;
}

interface SceneProps {
  replay: number;
  slow: boolean;
}

function NoticeScene({ replay, slow }: SceneProps) {
  const [show, setShow] = useReplay(replay, slow);
  return (
    <form
      className="flex w-[300px] flex-col items-start gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setShow(false);
        setTimeout(() => setShow(true), slow ? 2000 : 600);
      }}
    >
      <TextField label="メールアドレス" defaultValue="hello@example.com" className="w-full" />
      <Button type="submit" color="primary">
        送る
      </Button>
      <Transition show={show} className="w-full">
        <Notice color="success" title="送りました">
          確かめのメールを送りました。届いたリンクを開いてください。
        </Notice>
      </Transition>
    </form>
  );
}

const baseTags = ['React', 'TypeScript', 'デザイン'];

function TagScene({ replay, slow }: SceneProps) {
  // 最後のタグを外し、外し終わったら足し直す（appear で出る動き）
  const [last, setLast] = useState<{ key: number; show: boolean } | null>({ key: 0, show: true });
  const start = useRef(replay);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (replay === start.current) return undefined;
    setLast((current) => (current ? { ...current, show: false } : { key: Date.now(), show: true }));
    return () => clearTimeout(timer.current);
  }, [replay]);
  return (
    <div className="flex w-[340px] flex-col gap-3">
      <Text size="sm" tone="muted">
        記事のタグ
      </Text>
      <ul className="flex flex-wrap gap-2">
        {baseTags.map((label) => (
          <li key={label}>
            <Tag>{label}</Tag>
          </li>
        ))}
        {last && (
          <Transition
            key={last.key}
            render={<li />}
            show={last.show}
            appear
            onExitComplete={() => {
              setLast(null);
              timer.current = setTimeout(
                () => setLast({ key: Date.now(), show: true }),
                slow ? 1000 : 300
              );
            }}
          >
            <Tag color="primary">Storybook</Tag>
          </Transition>
        )}
      </ul>
    </div>
  );
}

function BarScene({ replay, slow }: SceneProps) {
  const [show] = useReplay(replay, slow);
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setFrame}
      className="relative h-[200px] w-[320px] overflow-hidden rounded-card border border-line bg-bg"
    >
      <div className="flex flex-col gap-2 p-4">
        <Text size="sm">写真 12 枚</Text>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-sm ${i < 3 ? 'bg-primary-subtle' : 'bg-field'}`}
            />
          ))}
        </div>
      </div>
      {frame && (
        <Portal container={frame}>
          <Transition
            show={show}
            className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-control border border-surface-line bg-surface px-3 py-2 shadow-overlay"
          >
            <Text as="span" size="sm">
              3 枚を選択
            </Text>
            <span className="flex gap-2">
              <Button appearance="outline">取り消す</Button>
              <Button color="primary">消す</Button>
            </span>
          </Transition>
        </Portal>
      )}
    </div>
  );
}

const scenes = [NoticeScene, TagScene, BarScene];

function Axis92({ pick }: { pick?: string }) {
  const [replay, setReplay] = useState(0);
  const [slow, setSlow] = useState(false);
  return (
    <Comparison
      index={92}
      axis="出入りの動き（Transition）"
      pick={pick}
      candidates={slow ? candidates.map(slowed) : candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const Scene = scenes[columns.indexOf(column)];
        return <Scene key={`${candidate.id}-${slow}`} replay={replay} slow={slow} />;
      }}
    >
      <p>
        決定: 現行版（濃さと 8px 下から、出る 200ms・消える 150ms）を、大きさによらず既定にします。
        ThemeProvider の transitionPreset で既定の出方を変えられます（ADR はあとで書く）。
      </p>
      <p>
        自分で作った中身に付ける出入りの動き（Transition の preset
        を書かないときの出方）と、出る・消える長さと緩急を選びます。 preset（fade・fade-up・scale
        など）を書けば、どの案でもその形で動きます。
      </p>
      <p>
        見どころ:
        お知らせは、出たことに気づけて、フォームの流れを邪魔しないか。タグは、足されたことが分かり、隣を揺らさないか。
        画面の下の帯は、浮かぶ面（Popover・Select）と同じ仲間に見えるか。どれを既定にして、どれを
        preset で選べるようにするかも選べます。
      </p>
      <p>
        動きを減らす設定では、どの案も動かさず、すぐに出す・消します（Tag
        の外す動きも待たずに外れます）。
      </p>
      <div className="flex flex-wrap gap-2 pt-1">
        <Button color="primary" onClick={() => setReplay((value) => value + 1)}>
          もう一度動かす
        </Button>
        <Button appearance="outline" onClick={() => setSlow((value) => !value)}>
          {slow ? 'ふつうの速さに戻す' : `ゆっくり見る（${SLOW} 倍）`}
        </Button>
      </div>
    </Comparison>
  );
}

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/92 出入りの動き（Transition）',
  id: 'design-review-92-transition',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => <Axis92 pick={pick} />,
};
