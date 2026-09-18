import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import { Button } from '../../src/components/button/Button';
import { Checkbox } from '../../src/components/checkbox/Checkbox';
import {
  Collapsible,
  type CollapsibleAppearance,
  type CollapsibleProps,
} from '../../src/components/collapsible/Collapsible';
import { Heading } from '../../src/components/heading/Heading';
import { Link } from '../../src/components/link/Link';
import { Prose } from '../../src/components/prose/Prose';
import { Switch } from '../../src/components/switch/Switch';
import { Tag } from '../../src/components/tag/Tag';
import { Text } from '../../src/components/text/Text';
import { TextField } from '../../src/components/text-field/TextField';
import { statePseudo } from '../../src/stories/story-states';
import { type Candidate, type Column, Comparison } from './Comparison';

// 軸 91: 開閉（Collapsible）の見た目
// 前のラウンドの 4 案を、すべて props のバリエーションにした（appearance）。印の左右は別の props（indicator）
//   行 = 見た目（appearance）、列 = 場面。印の左右は Controls の indicator で切り替える
// 開閉の長さはどの見た目も同じ（--collapsible-duration）。「ゆっくり見る」だけがトークンを上書きする

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'plain（既定）',
    intent: '行はふだん塗らず、マウスを載せたときだけ入力欄のグレーを敷く。',
    spec: [
      ['appearance', 'plain'],
      ['行', '塗りなし・hover で入力欄のグレー'],
      ['開いている行', '塗りなし'],
    ],
    tokens: { '--collapsible-duration': 'var(--duration-normal)' },
  },
  {
    id: 'A',
    name: 'open-filled',
    intent: '開いている行を入力欄のグレーで塗り、どれが開いているかを塗りでも見せる。',
    spec: [
      ['appearance', 'open-filled'],
      ['行', '塗りなし・hover で入力欄のグレー'],
      ['開いている行', '入力欄のグレー（hover で半段濃く）'],
    ],
    tokens: { '--collapsible-duration': 'var(--duration-normal)' },
  },
  {
    id: 'B',
    name: 'filled',
    intent:
      '行をいつも入力欄のグレーで塗り、押せる範囲を塗りで見せる。続けて並べると、面がつながらないよう少し離す。',
    spec: [
      ['appearance', 'filled'],
      ['行', '入力欄のグレー・hover で半段濃く'],
      ['続けて置いた行', '4px 離す'],
    ],
    tokens: { '--collapsible-duration': 'var(--duration-normal)' },
  },
  {
    id: 'C',
    name: 'divided',
    intent:
      '行と中身の上下に細い区切り線を引く。角はなく、hover で淡く塗る。フォーカスの線は区切り線の内側に描く。',
    spec: [
      ['appearance', 'divided'],
      ['行', '区切り線・hover で入力欄のグレー（角なし）'],
    ],
    tokens: { '--collapsible-duration': 'var(--duration-normal)' },
  },
];

// 行ごとの props
const appearanceOf: Record<string, CollapsibleAppearance> = {
  現行版: 'plain',
  A: 'open-filled',
  B: 'filled',
  C: 'divided',
};
const variantOf = (candidate: Candidate): Pick<CollapsibleProps, 'appearance'> => ({
  appearance: appearanceOf[candidate.id] ?? 'plain',
});

const SLOW = 5;

// 「ゆっくり見る」では、長さのトークンを 5 倍にする
const slowed = (candidate: Candidate): Candidate => ({
  ...candidate,
  tokens: {
    ...candidate.tokens,
    '--collapsible-duration': `calc(var(--duration-normal) * ${SLOW})`,
  },
});

const columns: Column[] = [
  {
    label: '設定の画面',
    note: '「詳しい設定」を開くと Switch・Checkbox・TextField が出る。「表示」は hover、「アカウント」はキーボードのフォーカス',
  },
  {
    label: '記事の中の FAQ',
    note: 'Prose の本文と並ぶ。2 問目は hover、3 問目はキーボードのフォーカス',
  },
  {
    label: 'カードの中の「もっと見る」',
    note: 'Tag・Link と。下のカードは hover',
  },
];

// 1 つ目の行（開閉をくり返す行）。どの場面・どの案も同じ state で開閉する
interface SceneProps {
  v: Pick<CollapsibleProps, 'appearance' | 'indicator'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SettingsScene({ v, open, onOpenChange }: SceneProps) {
  return (
    <div className="flex w-[320px] flex-col gap-3">
      <Heading level={3} size={4}>
        通知
      </Heading>
      <Switch label="メールで知らせる" defaultChecked />
      <div>
        <Collapsible {...v} title="詳しい設定" open={open} onOpenChange={onOpenChange}>
          <div className="flex flex-col gap-4">
            <Switch label="毎日まとめて送る" />
            <Checkbox label="お知らせも受け取る" defaultChecked />
            <TextField label="送り先" defaultValue="hello@example.com" />
          </div>
        </Collapsible>
        <Collapsible {...v} title="表示" data-preview="hover">
          <Switch label="暗い色にする" />
        </Collapsible>
        <Collapsible {...v} title="アカウント" data-preview="focus">
          <Text>ログインしているメールアドレスを変えられます。</Text>
        </Collapsible>
      </div>
    </div>
  );
}

function FaqScene({ v, open, onOpenChange }: SceneProps) {
  return (
    <div className="flex w-[340px] flex-col gap-4" data-reading>
      <Prose>
        <h3>よくある質問</h3>
        <p>
          困ったときは、まず下の質問を見てください。解決しないときは、問い合わせのページから送れます。
        </p>
      </Prose>
      <div>
        <Collapsible
          {...v}
          title="パスワードを忘れたときは？"
          open={open}
          onOpenChange={onOpenChange}
        >
          届いたメールのリンクを開くと、新しいパスワードを決める画面に移ります。リンクは 24
          時間で切れます。
        </Collapsible>
        <Collapsible {...v} title="メールが届かないときは？" data-preview="hover">
          迷惑メールのフォルダを確かめてください。
        </Collapsible>
        <Collapsible {...v} title="退会するには？" data-preview="focus">
          設定の「アカウント」から手続きできます。
        </Collapsible>
      </div>
      <Prose>
        <p>ここにない質問は、問い合わせのページから送ってください。</p>
      </Prose>
    </div>
  );
}

function CardScene({ v, open, onOpenChange }: SceneProps) {
  const card = (children: ReactNode) => (
    <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
      {children}
    </div>
  );
  return (
    <div className="flex w-[320px] flex-col gap-4">
      {card(
        <>
          <Heading level={3} size={4}>
            ポートフォリオを作り直した
          </Heading>
          <div className="flex flex-wrap gap-2">
            <Tag color="primary">React</Tag>
            <Tag>デザイン</Tag>
          </div>
          <Text size="sm" tone="muted">
            部品を 1 から作り直して、読みやすさを見直しました。
          </Text>
          <Collapsible {...v} title="もっと見る" open={open} onOpenChange={onOpenChange}>
            <div className="flex flex-col items-start gap-2">
              <Text size="sm">
                色と角丸をトークンにまとめ、密度を入力方式で切り替えられるようにしました。
              </Text>
              <Link href="#">記事を読む</Link>
            </div>
          </Collapsible>
        </>
      )}
      {card(
        <>
          <Heading level={3} size={4}>
            和文フォントの補正
          </Heading>
          <Collapsible {...v} title="もっと見る" data-preview="hover">
            <Text size="sm">漢字の枠に合わせて縦の寸法を補正しました。</Text>
          </Collapsible>
        </>
      )}
    </div>
  );
}

const scenes = [SettingsScene, FaqScene, CardScene];

function Axis91({ pick, indicator }: ComparisonArgs) {
  const [open, setOpen] = useState(true);
  const [slow, setSlow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  // 閉じて、閉じ終わってから開く
  const replay = () => {
    clearTimeout(timer.current);
    setOpen(false);
    timer.current = setTimeout(() => setOpen(true), slow ? 2000 : 700);
  };
  return (
    <Comparison
      index={91}
      axis="開閉（Collapsible）の見た目"
      pick={pick}
      candidates={slow ? candidates.map(slowed) : candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const Scene = scenes[columns.indexOf(column)];
        return (
          <Scene v={{ ...variantOf(candidate), indicator }} open={open} onOpenChange={setOpen} />
        );
      }}
    >
      <p>
        全案をバリエーションにしました。印の左右は別の props（<code>indicator</code>
        ）で、どの見た目とも組み合わせられます。左右は Controls の indicator で切り替えます（右: ▼ →
        ▲ の 180°、左: ▶ → ▼ の 90°。左のときは中身を題の頭にそろえて字下げ）。
      </p>
      <p>
        行 = 見た目（<code>appearance</code>
        ）。題はどの見た目も太字、開閉の長さもそろえています（200ms）。
      </p>
      <p>
        見どころ:
        行と中身のあいだの余白。塗った行の面の中の上下の余白と、面の下端から中身までの余白を同じにしました（A・B
        の開いた行で見比べられます）。どれを既定にするかも選べます（いまの既定は現行版の plain）。
      </p>
      <p>
        各場面の 1 行目は開いている行（「開閉をくり返す」で動く）、2 行目は hover、3
        行目はキーボードのフォーカスで止めています。
      </p>
      <div className="flex flex-wrap gap-2 pt-1">
        <Button color="primary" onClick={replay}>
          開閉をくり返す
        </Button>
        <Button appearance="outline" onClick={() => setSlow((value) => !value)}>
          {slow ? 'ふつうの速さに戻す' : `ゆっくり見る（${SLOW} 倍）`}
        </Button>
      </div>
    </Comparison>
  );
}

interface ComparisonArgs {
  pick?: string;
  indicator?: 'end' | 'start';
}

const meta = {
  title: 'Design Review/91 開閉（Collapsible）の見た目',
  id: 'design-review-91-collapsible',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({
      hover: '[data-slot="collapsible-trigger"]',
      focusVisible: '[data-slot="collapsible-trigger"]',
    }),
  },
  args: { pick: '', indicator: 'end' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
    indicator: {
      description: '開閉の印の位置（見た目とは別の props）',
      control: 'inline-radio',
      options: ['end', 'start'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: (args) => <Axis91 {...args} />,
};

export const CandidatesStart: Story = {
  name: '候補（印は左）',
  args: { indicator: 'start' },
  render: (args) => <Axis91 {...args} />,
};
