import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../src/components/Button';
import { CaretRightIcon } from '../../src/components/icons';
import { Link } from '../../src/components/Link';
import { Switch } from '../../src/components/Switch';
import { Tag } from '../../src/components/Tag';
import { type Candidate, type Column, Comparison } from './Comparison';
import { keepSwitchAsCompared, keepToggleColorAsCompared } from './pins';

// 後半の軸 10: 各部品の既定の色（principles.md 原則6、design/adr/0013）。2回目
// 利用者が色を指定しないとき、色を持つ部品が primary（青）・secondary（ピンク）・neutral（グレー）のどれになるか
// この軸はトークンではなく部品の指定で比べる。行ごとの指定は defaults にある
// フォーカスの枠（青、原則2）は変えない

type Choice = 'primary' | 'secondary' | 'neutral';

interface Defaults {
  /** 塗りのボタン */
  filled: Choice;
  /** 枠線のボタン・枠線のリンク */
  outline: Choice;
  /** 文字のリンク */
  link: Choice;
  switch: Choice;
  tag: Choice;
}

const defaults: Record<string, Defaults> = {
  現行版: {
    filled: 'primary',
    outline: 'primary',
    link: 'primary',
    switch: 'secondary',
    tag: 'primary',
  },
  A: { filled: 'primary', outline: 'primary', link: 'primary', switch: 'primary', tag: 'primary' },
  B: {
    filled: 'secondary',
    outline: 'secondary',
    link: 'secondary',
    switch: 'secondary',
    tag: 'secondary',
  },
  C: {
    filled: 'primary',
    outline: 'secondary',
    link: 'secondary',
    switch: 'secondary',
    tag: 'secondary',
  },
  E: { filled: 'neutral', outline: 'neutral', link: 'neutral', switch: 'neutral', tag: 'neutral' },
};

const label = (choice: Choice) =>
  choice === 'primary' ? '青' : choice === 'secondary' ? 'ピンク' : 'グレー';
const spec = (d: Defaults): Candidate['spec'] => [
  ['塗りのボタン', label(d.filled)],
  ['枠線のボタン・リンク', label(d.outline)],
  ['文字のリンク', label(d.link)],
  ['トグル', label(d.switch)],
  ['タグ', label(d.tag)],
];

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '押すものは青、トグルはピンク',
    intent:
      '部品を作ったときの仮の既定。ボタンとリンクは青、トグルだけピンク。タグは今回作った部品で、仮に青にしている。',
    spec: spec(defaults.現行版),
  },
  {
    id: 'A',
    name: 'すべて青',
    intent: 'どの部品も青にする。ピンクは、利用者が選んだときだけ出る。',
    spec: spec(defaults.A),
  },
  {
    id: 'B',
    name: 'すべてピンク',
    intent: 'どの部品もピンクにする。青は、利用者が選んだときだけ出る。フォーカスの枠は青のまま。',
    spec: spec(defaults.B),
  },
  {
    id: 'C',
    name: '塗りのボタンだけ青',
    intent:
      '参照画像に近い形。塗りのボタンは青、枠線のボタン・リンク・トグル・タグはピンク（More の枠線、Mode の切り替えがピンク）。',
    spec: spec(defaults.C),
  },
  {
    id: 'E',
    name: 'すべてグレー',
    intent:
      'どの部品も色を持たない。塗りのボタンはグレーのボタン、トグルの ON は濃いグレー、タグは淡いグレーに濃いグレーの文字。青とピンクは、利用者が選んだときだけ出る。',
    spec: spec(defaults.E),
  },
];

const columns: Column[] = [
  { label: '設定の画面', note: 'トグルを並べ、最後に保存する' },
  { label: 'プロフィールの画面', note: '文章中のリンク、タグ、More、お問い合わせ' },
  { label: 'Disabled', note: 'ボタンは各段の左が押せる、右が押せない。トグルはどちらも押せない' },
];

const Settings = ({ d }: { d: Defaults }) => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col">
      <Switch togglePlacement="end" color={d.switch} label="お知らせを受け取る" defaultChecked />
      <Switch
        togglePlacement="end"
        color={d.switch}
        label="返信をメールで受け取る"
        defaultChecked
      />
      <Switch togglePlacement="end" color={d.switch} label="自動で保存する" />
    </div>
    <div className="flex flex-wrap gap-3">
      <Button color={d.filled}>保存する</Button>
      <Button appearance="outline" color={d.outline}>
        下書きに保存
      </Button>
    </div>
  </div>
);

const skills = ['JavaScript', 'TypeScript', 'Figma', '音響'];

const Profile = ({ d }: { d: Defaults }) => (
  <div className="flex flex-col gap-4">
    <p className="text-sm leading-6">
      フロントエンドを中心に、デザインから配信まで手がけています。くわしくは
      <Link color={d.link} href="#works">
        制作実績
      </Link>
      をご覧ください。
    </p>
    <div className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <Tag key={skill} color={d.tag}>
          {skill}
        </Tag>
      ))}
    </div>
    <div className="flex flex-wrap gap-2">
      <Link appearance="outline" color={d.outline} href="#more">
        More
        <CaretRightIcon />
      </Link>
      <Link appearance="outline" color="neutral" href="#github">
        GitHub
      </Link>
    </div>
    <div>
      <Button color={d.filled}>お問い合わせ</Button>
    </div>
  </div>
);

// Disabled の見た目は design/adr/0026 のとおり（色を持つものは薄く、グレーのボタンは明るいグレー）
const Disabled = ({ d }: { d: Defaults }) => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <Button color={d.filled}>保存する</Button>
        <Button color={d.filled} disabled>
          保存する
        </Button>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button appearance="outline" color={d.outline}>
          下書きに保存
        </Button>
        <Button appearance="outline" color={d.outline} disabled>
          下書きに保存
        </Button>
      </div>
    </div>
    <div className="flex flex-col">
      <Switch
        togglePlacement="end"
        color={d.switch}
        label="自動で保存する"
        caption="管理者が固定しています"
        defaultChecked
        disabled
      />
      <Switch
        togglePlacement="end"
        color={d.switch}
        label="位置情報を使う"
        caption="この端末では使えません"
        disabled
      />
    </div>
  </div>
);

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/10 各部品の既定の色',
  decorators: [keepSwitchAsCompared, keepToggleColorAsCompared],
  id: 'design-review-10-default-color',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'E' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'E'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={10}
      axis="各部品の既定の色"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const d = defaults[candidate.id];
        if (column.label === '設定の画面') return <Settings d={d} />;
        if (column.label === 'プロフィールの画面') return <Profile d={d} />;
        return <Disabled d={d} />;
      }}
    >
      <p>
        <strong className="text-fg">決定: E すべてグレー</strong>
        （ADR-0028）。「特に指定がない場合はグレーで良さそうです。disabled な switch
        については後で詰めましょあ」
      </p>
      <p>
        この軸の2回目です。1回目のメモ「全部青がいいかなーと思っていますが、全部グレーの案も追加してみてもらえますか？」を受けて、E（すべてグレー）を足しました。
      </p>
      <p>
        「各選択肢に、ボタンとスイッチそれぞれで disabled
        の場合の表示を入れてもらえますか？」を受けて、Disabled の列を足しました。見た目は ADR-0026
        のとおりで、色を持つボタン・トグルは 40%
        に薄くなり、グレーのボタンは明るいグレーの塗りに薄い文字になります。
      </p>
      <p>
        「タグは青色で決まっているわけではなく、色の乗せ方がいいなと思ったところでした。primary
        なタグ、secondary
        なタグはある認識です。」を受けて、タグも比べる部品に加えました。タグは、淡い面に同じ色相の濃い文字を載せる塗り方（ADR-0007）で、青・ピンク・グレーを作りました。
      </p>
      <p>
        色を持つ部品（ボタン、リンク、トグル、タグ）で、利用者が色を指定しないときにどの色になるかを選びます。Primary
        と Secondary
        に用途の区別はなく、利用者はその場所に合う色をいつでも選べます（ADR-0013）。ここで決めるのは、何も指定しないときの色だけです。フォーカスの枠の青（原則2）は、この軸では変えません。
      </p>
      <p>
        色の指定の仕方（API）は、部品ごとに color="primary" / "secondary" / "neutral"
        を渡す形を基本にし、セクションごとにまとめて既定を変える仕組みは、必要になったら足すことを提案します。違う考えがあれば、あわせて教えてください。
      </p>
      <p>
        判断の基準（軽い・やわらかい・整然・人懐っこい）に最も近い案を1つ選び、一言添えてください。
      </p>
    </Comparison>
  ),
};
