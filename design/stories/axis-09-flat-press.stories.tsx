import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../src/components/Button';
import { CaretRightIcon } from '../../src/components/icons';
import { Link } from '../../src/components/Link';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 09: 平らなボタン・リンクの hover と押下（principles.md 原則3）
// 変えるのは次のトークンだけ
//   枠線のボタン・枠線のリンク: hover の塗り（--color-flat-hover）、押下の塗り（--color-flat-press）
//   文字のリンク: hover の塗り（--color-link-hover）、押下の塗り（--color-link-press）
//   押下で沈む深さ（--flat-press-depth）
// A〜D は「塗りの色（灰色か、文字と同じ色か）」×「押下で沈むか」の組み合わせ。D2 は回答で決まった形
// 灰色は濃紺グレー（--color-fg）を透かした色。「白地では」の値は白地に重ねた結果

const ink = (percent: number) => `color-mix(in oklab, var(--color-fg) ${percent}%, transparent)`;
const own = (percent: number) => `color-mix(in oklab, currentColor ${percent}%, transparent)`;

// A〜D では、文字のリンクもほかと同じ塗りにする
const linkSameAsFlat = {
  '--color-link-hover': 'var(--color-flat-hover)',
  '--color-link-press': 'var(--color-flat-press)',
  // 軸 12 で文字のリンクの角丸と下線をトークンにした。比べたときの形（pill の塗り、文字の色の下線）を再現する
  '--link-text-radius': 'var(--radius-pill)',
  '--color-link-underline': 'currentColor',
  '--color-link-underline-hover': 'currentColor',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '仮の値',
    intent:
      'ボタンを作ったときに置いた仮の値。hover は入力欄の塗り、押下は入力欄の hover の塗り。押下と hover がほとんど同じ濃さ。',
    spec: [
      ['hover', '#F2F4F4（白地との比 1.10）'],
      ['押下', '#EEF0F0（1.14）'],
      ['文字のリンク', '同じ'],
      ['押下で沈む', 'なし'],
    ],
    tokens: {
      '--color-flat-hover': '#f2f4f4',
      '--color-flat-press': '#eef0f0',
      ...linkSameAsFlat,
      '--flat-press-depth': '0px',
    },
  },
  {
    id: 'A',
    name: '灰色',
    intent:
      'hover は入力欄の塗りと同じくらいの灰色、押下はさらに一段濃い灰色。どの色の要素でも同じ灰色になる。',
    spec: [
      ['hover', '濃紺グレー 5%（白地では #F4F5F5・1.10）'],
      ['押下', '13%（#E2E4E5・1.28）'],
      ['文字のリンク', '同じ'],
      ['押下で沈む', 'なし'],
    ],
    tokens: {
      '--color-flat-hover': ink(5),
      '--color-flat-press': ink(13),
      ...linkSameAsFlat,
      '--flat-press-depth': '0px',
    },
  },
  {
    id: 'B',
    name: '灰色＋沈む',
    intent: 'A に加えて、押下で 1px 沈む。塗りのボタンの押下（1px 沈む）と揃う。',
    spec: [
      ['hover', '濃紺グレー 5%（白地では #F4F5F5・1.10）'],
      ['押下', '13%（#E2E4E5・1.28）'],
      ['文字のリンク', '同じ'],
      ['押下で沈む', '1px'],
    ],
    tokens: {
      '--color-flat-hover': ink(5),
      '--color-flat-press': ink(13),
      ...linkSameAsFlat,
      '--flat-press-depth': '1px',
    },
  },
  {
    id: 'C',
    name: '文字と同じ色',
    intent:
      '要素の文字の色を淡く敷く。青いボタンは淡い青、ピンクのリンクは淡いピンクになる。色のない要素は灰色になる。',
    spec: [
      ['hover', '文字の色 8%（青なら #EDF4FC・1.11）'],
      ['押下', '16%（青なら #DCE9FA・1.23）'],
      ['文字のリンク', '同じ'],
      ['押下で沈む', 'なし'],
    ],
    tokens: {
      '--color-flat-hover': own(8),
      '--color-flat-press': own(16),
      ...linkSameAsFlat,
      '--flat-press-depth': '0px',
    },
  },
  {
    id: 'D',
    name: '文字と同じ色＋沈む',
    intent: 'C に加えて、押下で 1px 沈む。',
    spec: [
      ['hover', '文字の色 8%（青なら #EDF4FC・1.11）'],
      ['押下', '16%（青なら #DCE9FA・1.23）'],
      ['文字のリンク', '同じ'],
      ['押下で沈む', '1px'],
    ],
    tokens: {
      '--color-flat-hover': own(8),
      '--color-flat-press': own(16),
      ...linkSameAsFlat,
      '--flat-press-depth': '1px',
    },
  },
  {
    id: 'D2',
    name: 'D＋文字のリンクは背景なし（決定）',
    intent:
      'D のうち、文字のリンクだけ背景を敷かないもの。押下で 1px 沈むだけ。回答で決まった形。枠線のボタンと枠線のリンクは D のまま。',
    spec: [
      ['hover', '文字の色 8%（青なら #EDF4FC・1.11）'],
      ['押下', '16%（青なら #DCE9FA・1.23）'],
      ['文字のリンク', '背景なし'],
      ['押下で沈む', '1px'],
    ],
    tokens: {
      '--color-flat-hover': own(8),
      '--color-flat-press': own(16),
      '--color-link-hover': 'transparent',
      '--color-link-press': 'transparent',
      '--link-text-radius': 'var(--radius-pill)',
      '--color-link-underline': 'currentColor',
      '--color-link-underline-hover': 'currentColor',
      '--flat-press-depth': '1px',
    },
  },
];

const columns: Column[] = [
  { label: '通常', note: 'マウスを載せたり押したりして、実際の動きを確かめられます' },
  { label: 'hover 中', note: 'マウスを載せた見た目を固定しています', preview: 'hover' },
  { label: '押下中', note: '押している見た目を固定しています', preview: 'press' },
];

const Cell = () => (
  <div className="flex flex-col gap-5">
    <div className="flex flex-wrap gap-2">
      <Button appearance="outline" color="primary">
        下書きに保存
      </Button>
      <Button appearance="outline" color="neutral">
        キャンセル
      </Button>
      <Button appearance="outline" color="danger">
        削除
      </Button>
    </div>
    <div className="flex flex-wrap gap-2">
      <Link appearance="outline" color="secondary" href="#more">
        More
        <CaretRightIcon />
      </Link>
      <Link appearance="outline" color="neutral" href="#github">
        GitHub
      </Link>
    </div>
    <p className="text-sm leading-6">
      くわしくは
      <Link color="primary" href="#guide">
        使い方のページ
      </Link>
      をご覧ください。
    </p>
    <div className="text-xs">
      <Link color="neutral" href="#about">
        もっと知りたい
      </Link>
    </div>
  </div>
);

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/09 平らなボタン・リンクの hover と押下',
  id: 'design-review-09-flat-press',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      hover: ['[data-preview="hover"] button', '[data-preview="hover"] a'],
      active: ['[data-preview="press"] button', '[data-preview="press"] a'],
    },
  },
  args: { pick: 'D2' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D', 'D2'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={9}
      axis="平らなボタン・リンクの hover と押下"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={() => <Cell />}
    >
      <p>
        <strong className="text-fg">決定: D＋文字のリンクは背景なし（D2）</strong>
        （ADR-0027）。「D
        ですね。（リンクは今のように色はつかなくても良さそうです。）」「ん、リンクのホバー背景色はそもそも無しでお願いしたいです。」
      </p>
      <p>
        文字のリンク（使い方のページ、もっと知りたい）は、hover
        でも押下でも背景を敷かず、押下で沈むだけにします。枠線のボタンと枠線のリンク（More、GitHub）は
        D
        のとおり文字の色を淡く敷きます。最初は文字のリンクを灰色の背景にしていましたが、2つ目のメモで直しました。
      </p>
      <p>
        影のない押すもの（枠線のボタン、枠線の pill のリンク、文字のリンク）の hover
        と押下を選びます。原則3は「平らな要素は hover
        で背景が半段濃く、押下でさらに濃く」としています。hover を明度で表すことは ADR-0022
        で決まっています。
      </p>
      <p>
        現行版は、ボタンを作ったときに置いた仮の値です。押下（#EEF0F0）が
        hover（#F2F4F4）とほとんど同じ濃さです。指で操作するときは hover がないので、押下の変化は
        hover よりはっきり付けます（原則3）。
      </p>
      <p>
        A〜D
        は、2つの問いの組み合わせです。1つは塗りの色で、灰色（A・B）にするか、要素の文字と同じ色を淡く敷く（C・D）かです。もう1つは押下で沈むかで、塗りのボタンと同じく
        1px
        沈む（B・D）か、沈まない（A・C）かです。灰色は濃紺グレーを透かした色なので、グレーの面の上でも見えます。
      </p>
      <p>
        リンクの見た目（色・下線・大きさ）は仮で、この軸では決めません。沈む動きは、「通常」の列で押して確かめてください。ツールバーの「密度」を指にすると、指で操作するときの寸法で見られます。
      </p>
    </Comparison>
  ),
};
