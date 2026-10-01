import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Navbar, NavbarLink } from '../../src/components/navbar/Navbar';
import { Text } from '../../src/components/text/Text';

// 軸 503: Navbar をスクロールで隠す（stickyBehavior="hide-on-scroll"）ときの、隠れ方と戻り方
const meta = {
  title: 'Design Review/503 スクロールで隠す帯',
  id: 'design-review-503-navbar-hide-on-scroll',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
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

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'いつも出す',
    intent: 'stickyBehavior="always"。スクロールしても帯は上に貼り付いたまま',
    spec: [['隠す', 'しない']],
  },
  {
    id: 'A',
    name: '上へ滑らせる',
    intent:
      '下へスクロールしたら、帯を上へ滑らせて隠す。上へ戻したら、同じ動きで下ろす。押下と同じ緩急で 200ms',
    spec: [
      ['隠す', '200ms・押下の緩急（速く出て、ゆっくり止まる）'],
      ['出す', '200ms・同じ'],
      ['濃さ', '変えない'],
    ],
    tokens: {
      '--navbar-hide-duration': 'var(--duration-normal)',
      '--navbar-hide-ease': 'var(--ease-press)',
      '--navbar-show-duration': 'var(--duration-normal)',
      '--navbar-show-ease': 'var(--ease-press)',
      '--navbar-hide-opacity': '1',
      '--navbar-hide-follow': '0',
    },
  },
  {
    id: 'B',
    name: '隠すのは速く・出すのはゆっくり',
    intent:
      '隠すときは 100ms で加速しながら抜け、出すときはシートと同じ 250ms でふわっと下ろす。読み始めたら邪魔をせず、戻したいときは目で追える',
    spec: [
      ['隠す', '100ms・加速（ease-in）'],
      ['出す', '250ms・シートの緩急'],
      ['濃さ', '変えない'],
    ],
    tokens: {
      '--navbar-hide-duration': 'var(--duration-fast)',
      '--navbar-hide-ease': 'cubic-bezier(0.4, 0, 1, 1)',
      '--navbar-show-duration': 'var(--duration-slow)',
      '--navbar-show-ease': 'var(--ease-sheet)',
      '--navbar-hide-opacity': '1',
      '--navbar-hide-follow': '0',
    },
  },
  {
    id: 'C',
    name: '薄れながら滑らせる',
    intent: 'A の動きに、薄れていく変化を重ねる。帯が「消える」印象が強く、動きの距離は同じ',
    spec: [
      ['隠す', '200ms・押下の緩急＋薄れる'],
      ['出す', '200ms・同じ＋濃くなる'],
      ['濃さ', '隠れたとき 0'],
    ],
    tokens: {
      '--navbar-hide-duration': 'var(--duration-normal)',
      '--navbar-hide-ease': 'var(--ease-press)',
      '--navbar-show-duration': 'var(--duration-normal)',
      '--navbar-show-ease': 'var(--ease-press)',
      '--navbar-hide-opacity': '0',
      '--navbar-hide-follow': '0',
    },
  },
  {
    id: 'D',
    name: 'スクロールに付いてくる',
    intent:
      'スクロールした量だけ帯を押し上げ、上へ戻した量だけ下ろす（スマートフォンのブラウザのアドレスバーと同じ）。止めたら、近い方へ 200ms で寄せる',
    spec: [
      ['隠す', 'スクロールの量に合わせる'],
      ['止めたとき', '半分より隠れていれば隠す・200ms で寄せる'],
      ['濃さ', '変えない'],
    ],
    tokens: {
      '--navbar-hide-duration': 'var(--duration-normal)',
      '--navbar-hide-ease': 'var(--ease-press)',
      '--navbar-show-duration': 'var(--duration-normal)',
      '--navbar-show-ease': 'var(--ease-press)',
      '--navbar-hide-opacity': '1',
      '--navbar-hide-follow': '1',
    },
  },
];

const columns: Column[] = [
  { label: '広い帯', note: '枠の中をスクロールするか、下のボタンで試せます' },
  { label: '狭い帯', note: '行き先はメニューに畳む' },
];

const pages = ['Works', 'Blog', 'About'];

function Live({ hide, width }: { hide: boolean; width: number }) {
  const scroller = useRef<HTMLDivElement>(null);
  // 下へ 400px ゆっくり送り、少し待ってから上へ 120px 戻す（指で読み進めて、少し戻す動き）
  const play = () => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ top: 0 });
    setTimeout(() => el.scrollTo({ top: 400, behavior: 'smooth' }), 100);
    setTimeout(() => el.scrollTo({ top: 280, behavior: 'smooth' }), 1600);
  };
  return (
    <div className="flex flex-col gap-2" style={{ width }}>
      <div
        ref={scroller}
        data-slot="axis-scroller"
        className="h-[300px] overflow-auto border border-line"
      >
        <Navbar
          sticky
          stickyEdge="shadow"
          stickyBehavior={hide ? 'hide-on-scroll' : 'always'}
          brand={<span>k6n</span>}
          actions={<Button variant="outline">Contact</Button>}
        >
          {pages.map((page) => (
            <NavbarLink
              key={page}
              href={`#${page}`}
              current={page === 'Blog'}
              onClick={(event) => event.preventDefault()}
            >
              {page}
            </NavbarLink>
          ))}
        </Navbar>
        <div className="flex flex-col gap-4 p-6">
          {Array.from({ length: 14 }, (_, i) => (
            <Text key={i} variant={i % 3 === 0 ? undefined : 'muted'}>
              {i % 3 === 0
                ? `第${i / 3 + 1}節　帯を隠すと、読む場所が広がります`
                : 'スクロールで読み進める本文です。下へ送ると帯が隠れ、少し上へ戻すと帯が出てきます。'}
            </Text>
          ))}
        </div>
      </div>
      <Button variant="outline" onClick={play} data-slot="axis-play">
        下へ送って、少し戻す
      </Button>
    </div>
  );
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={503}
      axis="スクロールで隠す帯"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <Live hide={candidate.id !== '現行版'} width={column.label === '広い帯' ? 800 : 360} />
      )}
    >
      <p>
        Navbar に stickyBehavior を足しました。hide-on-scroll
        は、下へスクロールすると帯を隠し、上へ戻すと出します。いちばん上の近く（帯の高さまで）では隠しません。帯の中にフォーカスがあるときと、メニューを開いているときも隠しません。影まで見えなくなるよう、帯の高さより少し余分に上げます。
      </p>
      <p>
        選ぶのは、隠れ方と戻り方の動きです。動きを減らす設定のときは、どの案も動きを付けずに切り替えます。
      </p>
    </Comparison>
  ),
};
