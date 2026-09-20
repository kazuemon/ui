import { CopyIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Card, CardBody } from '../../src/components/card/Card';
import { Heading } from '../../src/components/heading/Heading';
import { Icon } from '../../src/components/icon/Icon';
import { Link } from '../../src/components/link/Link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../src/components/table/Table';
import { Text } from '../../src/components/text/Text';
import { statePseudo } from '../../src/stories/story-states';

// 後半の軸 174: 塗りも枠線もない、いちばん軽い押すもの（ghost）を足すか
//   部品には ghost の指定（appearance）がないので、枠線のボタン（appearance="outline"）の枠線だけを
//   透明にして近い見た目を作る。枠線の太さ（--border-width-medium）は残すので、寸法は枠線のボタンと同じまま。
//   決まったら、部品の appearance に足すか、Link のように別の形にするかを実装で決める
//   hover・押下（文字の色を 8%・16% 敷いて 1px 沈む）は、平らな押すものの決まりのまま（ADR-0027）
const ghost = 'border-transparent disabled:border-transparent data-disabled:border-transparent';

// D: 枠線を外したボタン（A と同じ ghost の箱）の文字に、下線だけを足す。
//   文字は枠線のボタンのまま（同じ色・太さ・大きさ）で、変えるのは下線が増えることだけ。
//   下線は文字を包む span に引くので、アイコンには付かない（アイコン＋文字のときも下線は文字だけ）
const ghostLink = `${ghost} group/ghost-link`;

// D の文字に引く下線。文字の色に対して淡く引き（ADR-0030 の下線と同じ濃さ）、押せないときは外す。
//   hover は箱の塗りで分かるので、下線は変えない
const ghostLinkLabel = [
  'underline decoration-1 underline-offset-4 [text-decoration-color:var(--color-link-underline)]',
  'group-disabled/ghost-link:no-underline',
].join(' ');

/**
 * 行ごとの押すものの見た目。outline は枠線のボタン、ghost は枠線を外した形、link は文字のリンク、
 * ghost-link は ghost の文字に下線だけを足した形
 */
type Look = 'outline' | 'ghost' | 'link' | 'ghost-link';

const looks: Record<string, { text: Look; icon: Look }> = {
  現行版: { text: 'outline', icon: 'outline' },
  A: { text: 'ghost', icon: 'ghost' },
  B: { text: 'outline', icon: 'ghost' },
  C: { text: 'link', icon: 'link' },
  D: { text: 'ghost-link', icon: 'ghost' },
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'いちばん軽い操作は枠線のボタン',
    intent:
      '押すものの強さは 3 段のまま（ADR-0165）。密度の高い並びでも枠線のボタンを使う。押していなくても押せる場所が分かるが、小さな操作を並べると箱が並んで見える。',
    spec: [
      ['枠線', '1.5px（--border-width-medium）・--color-line'],
      ['塗り', 'なし'],
      ['文字', '--color-fg'],
      ['hover', '文字の色を 8%（--flat-hover-mix）'],
      ['押下', '文字の色を 16%（--flat-press-mix）＋ 1px 沈む'],
    ],
  },
  {
    id: 'A',
    name: 'ghost（文字のボタンもアイコンも）',
    intent:
      '4 段目として、塗りも枠線もない押すものを足す。ふだんは文字とアイコンだけで、hover で文字の色を淡く敷く。押すものの数が減って画面は軽くなるが、押していない状態では押せる場所が見えない。',
    spec: [
      ['枠線', 'なし（透明。寸法は枠線のボタンと同じ）'],
      ['塗り', 'なし'],
      ['文字', '--color-fg'],
      ['hover', '文字の色を 8%（--flat-hover-mix）'],
      ['押下', '文字の色を 16%（--flat-press-mix）＋ 1px 沈む'],
      ['押せない', '--color-outline-neutral-disabled-text（枠線なし）'],
    ],
  },
  {
    id: 'B',
    name: 'ghost はアイコンだけのボタンに限る',
    intent:
      '文字のあるボタンは枠線のまま、アイコンだけのボタンにだけ ghost を許す。アイコンだけのボタンは正方形の箱が目立ちやすく、並べると格子に見えるため。文字のボタンは、押せる場所が枠線で分かる。',
    spec: [
      ['文字のボタン', '現行版と同じ（枠線 1.5px・--color-line）'],
      ['アイコンだけ', 'A と同じ（枠線なし）'],
      ['hover・押下', 'どちらも A・現行版と同じ'],
    ],
  },
  {
    id: 'C',
    name: 'ghost を足さず、文字のリンクで代用',
    intent:
      '4 段目を足さない答え。軽くしたい操作は、ボタンの形をやめて文字のリンクにする。下線があるので押していなくても押せる場所が分かる。アイコンだけの形はなく、必ず文字が要る。移るものではないので、働きと見た目が合わない場合がある（原則 18）。',
    spec: [
      ['文字', '--color-fg-muted（色を指定しないリンク）'],
      ['下線', '1px・--color-link-underline'],
      ['hover', '下線だけ --color-link-underline-hover（背景は敷かない）'],
      ['押下', '1px 沈む'],
      ['押せない', '下線と色を外したただの文字'],
    ],
  },
  {
    id: 'D',
    name: 'ghost の文字に、下線だけ足す',
    intent:
      'A（ghost）の箱に、文字の下線だけを足す。文字は枠線のボタンと同じ色・太さ・大きさのままで、変わるのは下線が増えることだけ。アイコンには下線を付けない。押していなくても下線で押せる場所が分かり、押せる範囲は部品の大きさなので、hover では A と同じ淡い塗りがその範囲に出て、押せる広さも目に見える（原則 17）。C との違いは、文字がリンクの見た目ではなくボタンの文字であることと、押せる範囲が文字の行ではなく部品の大きさであることの 2 点。',
    spec: [
      ['文字', 'B（枠線のボタン）と同じ（--color-fg・太字・--text-control）'],
      ['増えるもの', '文字だけに 1px の下線（--color-link-underline）。アイコンには付かない'],
      ['押せる範囲', '枠線のボタンと同じ（--spacing-control・--spacing-control-x。枠線は透明）'],
      ['hover', 'A と同じ淡い塗り（--flat-hover-mix）。下線は変えない'],
      ['押下', 'A と同じ濃さの塗り（--flat-press-mix）＋ 1px 沈む'],
      ['押せない', 'A と同じ薄い文字（--color-outline-neutral-disabled-text）・下線なし'],
    ],
  },
];

const columns: Column[] = [
  { label: '通常' },
  { label: 'hover', preview: 'hover' },
  { label: '押したところ', preview: 'active' },
  { label: 'キーボードのフォーカス', preview: 'focus' },
  { label: '押せない' },
  { label: 'カードの右上の操作 3 つ', note: '密度の高い並び' },
  { label: '表の行末の操作', note: '密度の高い並び' },
];

/** 文字のある押すもの。icon を渡すと、ふだんのボタンと同じ配置（文字の前・間は 8px）でアイコンを添える */
function TextAction({
  look,
  icon,
  label,
  disabled,
}: {
  look: Look;
  icon?: typeof PencilSimpleIcon;
  label: string;
  disabled?: boolean;
}) {
  if (look === 'link')
    return (
      <Link href="#" disabled={disabled}>
        {icon ? (
          <>
            <Icon icon={icon} /> {label}
          </>
        ) : (
          label
        )}
      </Link>
    );
  return (
    <Button
      appearance="outline"
      disabled={disabled}
      className={look === 'ghost' ? ghost : look === 'ghost-link' ? ghostLink : ''}
    >
      {icon && <Icon icon={icon} />}
      {look === 'ghost-link' ? <span className={ghostLinkLabel}>{label}</span> : label}
    </Button>
  );
}

/** アイコンだけの押すもの。C（文字のリンク）にはアイコンだけの形がないので、文字を添えたリンクで置く */
function IconAction({
  look,
  icon,
  label,
  disabled,
}: {
  look: Look;
  icon: typeof PencilSimpleIcon;
  label: string;
  disabled?: boolean;
}) {
  if (look === 'link')
    return (
      <Link href="#" disabled={disabled}>
        <Icon icon={icon} /> {label}
      </Link>
    );
  return (
    <Button
      iconOnly
      appearance="outline"
      aria-label={label}
      disabled={disabled}
      className={look === 'ghost' ? ghost : ''}
    >
      <Icon icon={icon} standalone />
    </Button>
  );
}

const members = ['田中 さくら', '佐藤 みなと', '鈴木 ゆい'];

function renderCell(column: Column, candidate: Candidate) {
  const look = looks[candidate.id];
  // 密度の高い並び 1: カードの右上に小さな操作を 3 つ
  if (column.label === 'カードの右上の操作 3 つ')
    return (
      <Card className="w-[340px]">
        <CardBody>
          <div className="flex items-start justify-between gap-3">
            <Heading level={3} size={4}>
              9 月の下書き
            </Heading>
            <div
              className={[
                'flex flex-wrap items-center justify-end',
                look.icon === 'link' ? 'gap-x-3 gap-y-1' : 'gap-1',
              ].join(' ')}
            >
              <IconAction look={look.icon} icon={PencilSimpleIcon} label="編集" />
              <IconAction look={look.icon} icon={CopyIcon} label="複製" />
              <IconAction look={look.icon} icon={TrashIcon} label="削除" />
            </div>
          </div>
          <Text size="sm" tone="muted">
            9 月 24 日 10:00・会議室 A
          </Text>
        </CardBody>
      </Card>
    );
  // 密度の高い並び 2: 表の行末の操作（文字のボタンとアイコンだけのボタンが隣り合う）
  if (column.label === '表の行末の操作')
    return (
      <Table label="メンバー" className="w-[360px]">
        <TableHead>
          <TableRow>
            <TableHeader>名前</TableHeader>
            <TableHeader align="right">操作</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map((name) => (
            <TableRow key={name}>
              <TableCell>{name}</TableCell>
              <TableCell align="right">
                <div
                  className={[
                    'flex flex-wrap items-center justify-end',
                    look.text === 'link' ? 'gap-x-3 gap-y-1' : 'gap-1',
                  ].join(' ')}
                >
                  <TextAction look={look.text} label="編集" />
                  <IconAction look={look.icon} icon={TrashIcon} label="削除" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  // 状態の列: 文字だけ・アイコン＋文字・アイコンだけを並べる
  //   アイコン＋文字は文字のあるボタンなので、B ではここだけ枠線が残る（アイコンだけが ghost になる）
  const disabled = column.label === '押せない';
  return (
    <div className="flex flex-wrap items-center gap-3">
      <TextAction look={look.text} label="編集" disabled={disabled} />
      <TextAction look={look.text} icon={CopyIcon} label="複製" disabled={disabled} />
      <IconAction look={look.icon} icon={TrashIcon} label="削除" disabled={disabled} />
    </div>
  );
}

const meta = {
  title: 'Design Review/174 ghost の押すもの',
  id: 'design-review-174-ghost',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({
      hover: ':is(button, a)',
      active: ':is(button, a)',
      focusVisible: ':is(button, a)',
    }),
  },
  args: { pick: 'D' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={174}
      axis="ghost の押すもの"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={renderCell}
    >
      <p>決定: 下線のボタンを 4 段目として足します（ADR-0193）。</p>
      <p>
        押すものの強さは、色の塗り・グレーの塗り・枠線の 3 段です（原則 7）。そこに 4
        段目として、塗りも枠線もない、いちばん軽い押すもの（ghost）を足すかを決めます。
      </p>
      <p>
        要点は、押していない状態で押せる場所が分かるかどうかです。右の 2
        列に、小さな操作が集まる並び（カードの右上、表の行末）を置きました。枠線のボタンだけで組むと箱が並び、ghost
        にすると軽くなるかわりに、押せる場所の手がかりが hover
        とカーソルの形だけになります。押せる範囲は見た目の範囲のままです（原則 17）。
      </p>
      <p>
        A・B は、hover で文字の色を淡く敷き、押すと濃くして 1px
        沈みます。平らな押すものの決まり（ADR-0027）のまま、枠線だけを外した形です。押せないときは、枠線のない薄い文字になります（原則
        13）。 B は、アイコンだけのボタンにだけ ghost
        を許す案なので、文字のボタンとアイコンの差を見てください。 C は 4
        段目を足さない答えで、軽くしたい操作を文字のリンクにします。
      </p>
      <p>
        D は A の箱に、文字の下線だけを足した形です。文字はボタンのまま（B
        と同じ色・太さ・大きさ）で、変わるのは下線が増えることだけです。アイコンには下線を付けません。押していなくても下線で押せる場所が分かり、押せる範囲は部品の大きさなので、hover
        では A と同じ淡い塗りがその範囲に出て、押せる広さも見えます（原則 17）。C との違いは、
        文字がリンクの見た目（淡いグレー・太字にしない）かボタンの文字か、
        押せる範囲が文字の行か部品の大きさか、の 2 点です。
      </p>
      <p>
        状態の列には、文字だけ・アイコン＋文字（ふだんのボタンと同じ配置）・アイコンだけの 3
        つを並べていて、アイコン＋文字は、現行版と B が枠線のまま、A は枠線なし、C
        はアイコンを添えた文字のリンク、D はアイコンを添えた枠線なしのボタンに、
        文字だけ下線が付いた形になります。
      </p>
      <p>
        いまの部品には ghost の指定がないので、A・B・D
        は枠線のボタンの枠線だけを透明にして近い見た目を置いています（寸法は枠線のボタンと同じままです）。
        カードの右上の列は、A・B・D のどれもアイコンだけなので同じ見た目になります。
        足すと決めたら、コピーのボタンの既定の見た目（いまはグレーの枠線）も選び直すことになります。
      </p>
      <p>どれを既定にするか、ほかに選べるようにしたい案があれば教えてください。</p>
    </Comparison>
  ),
};
