import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Button } from '../../src/components/Button';
import { Link } from '../../src/components/Link';
import { Notice } from '../../src/components/Notice';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 36: 黄色の塗りのお知らせと、操作の場所に置く部品
// 黄色の塗り（filled の警告 #EFF16B）は白地との比が 1.20:1 で、影も縁もない（原則1: お知らせには影を付けない）
// ほかの塗り（情報・成功・危険）は白地で 4.53〜6.71:1、淡い面（soft）は 1.11〜1.13:1
// 変えるのは次のトークンだけ（src/components/Notice.tsx が読む）
//   --notice-filled-line-width: 塗りのお知らせの縁の線の太さ。0 は線なし
//   --color-notice-warning-filled-line: 黄色の塗りの縁の線の色（ほかの塗りの線は透明）
//   --color-notice-warning-filled: 黄色の塗りの面
// 線の太さを 1px にすると、ほかの塗りも透明な線の分だけ大きくなる（outline と同じ大きさになる。見た目は変わらない）

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '面の色だけ',
    intent: '黄色の塗りに線も影も付けない。淡い面（soft）と同じく、面の色だけで白地から浮かせる。',
    spec: [
      ['面', '#EFF16B（白地 1.20:1）'],
      ['縁の線', 'なし'],
    ],
    tokens: {
      '--notice-filled-line-width': '0px',
      '--color-notice-warning-filled-line': 'transparent',
      '--color-notice-warning-filled': 'var(--color-warning)',
    },
  },
  {
    id: 'A',
    name: '白いボタンと同じ細い線',
    intent:
      '白いボタンの輪郭と同じ 1px のグレーの線で囲む。白地の上で縁が見えないものに線を足す、という白いボタンと同じ考え方。',
    spec: [
      ['面', '#EFF16B（白地 1.20:1）'],
      ['縁の線', '1px #DEE0E1（白いボタンの線。白地 1.32:1）'],
    ],
    tokens: {
      '--notice-filled-line-width': '1px',
      '--color-notice-warning-filled-line': 'var(--color-surface-line)',
      '--color-notice-warning-filled': 'var(--color-warning)',
    },
  },
  {
    id: 'B',
    name: '同じ色相の濃い線',
    intent:
      '線の色を、黄色にオリーブ色（白地の警告の文字の色）を 40% 混ぜた色にする。A より線がはっきり見え、面と同じ色相でまとまる。',
    spec: [
      ['面', '#EFF16B（白地 1.20:1）'],
      ['縁の線', '1px 黄色にオリーブ色 40%（#BBBC45 相当。白地 2.02:1・黄色と 1.68:1）'],
    ],
    tokens: {
      '--notice-filled-line-width': '1px',
      '--color-notice-warning-filled-line':
        'color-mix(in oklab, var(--color-fg-warning) 40%, var(--color-warning))',
      '--color-notice-warning-filled': 'var(--color-warning)',
    },
  },
  {
    id: 'C',
    name: '黄色を少し濃くする',
    intent:
      '線は足さず、黄色の面の明るさだけを下げる（色相と鮮やかさは同じ）。濃紺の文字は 10.19:1 で読める。タグと入力欄の下の警告の値は変えない。',
    spec: [
      ['面', '#E2E45D（白地 1.36:1）'],
      ['縁の線', 'なし'],
    ],
    tokens: {
      '--notice-filled-line-width': '0px',
      '--color-notice-warning-filled-line': 'transparent',
      '--color-notice-warning-filled': '#e2e45d',
    },
  },
];

const columns: Column[] = [
  { label: '塗り（filled）の4色', note: '上から情報・成功・警告・危険' },
  { label: '警告の3つの見た目', note: '上から soft・filled・outline' },
  { label: '操作の場所に枠線のリンク', note: '白いボタン・文字のリンクと並べる' },
  { label: '枠線のリンクの hover', note: 'hover で固定', preview: 'hover' },
];

const Label = ({ children }: { children: ReactNode }) => (
  <p className="text-xs font-bold text-fg-subtle">{children}</p>
);

const close = () => {};

const FilledColors = () => (
  <>
    <Notice color="info" appearance="filled" title="メンテナンスのお知らせ">
      9月20日 2:00〜4:00 は、サービスを使えません。
    </Notice>
    <Notice color="success" appearance="filled" onClose={close}>
      保存しました。
    </Notice>
    <Notice color="warning" appearance="filled" title="メールアドレスが確認されていません">
      確認するまで、お知らせのメールは届きません。
    </Notice>
    <Notice color="danger" appearance="filled" title="保存できませんでした">
      通信が切れました。もう一度お試しください。
    </Notice>
  </>
);

const WarningAppearances = () => (
  <>
    <Label>soft（既定）</Label>
    <Notice color="warning" title="メールアドレスが確認されていません">
      確認するまで、お知らせのメールは届きません。
    </Notice>
    <Label>filled</Label>
    <Notice color="warning" appearance="filled" title="メールアドレスが確認されていません">
      確認するまで、お知らせのメールは届きません。
    </Notice>
    <Label>outline</Label>
    <Notice color="warning" appearance="outline" title="メールアドレスが確認されていません">
      確認するまで、お知らせのメールは届きません。
    </Notice>
  </>
);

// 操作の場所: 枠線のリンクを、白いボタン・文字のリンクと並べる
const WithOutlineLink = () => (
  <>
    <Label>filled の警告</Label>
    <Notice
      color="warning"
      appearance="filled"
      title="メールアドレスが確認されていません"
      actions={
        <>
          <Button color="white">確認メールを送る</Button>
          <Link appearance="outline" href="#">
            詳しく見る
          </Link>
        </>
      }
    >
      確認するまで、お知らせのメールは届きません。
    </Notice>
    <Label>filled の危険</Label>
    <Notice
      color="danger"
      appearance="filled"
      title="保存できませんでした"
      actions={
        <>
          <Link appearance="outline" href="#">
            もう一度保存する
          </Link>
          <Link href="#">詳しく見る</Link>
        </>
      }
    >
      通信が切れました。
    </Notice>
    <Label>soft の警告</Label>
    <Notice
      color="warning"
      title="メールアドレスが確認されていません"
      actions={
        <>
          <Link appearance="outline" href="#">
            確認メールを送る
          </Link>
          <Link href="#">あとで</Link>
        </>
      }
    >
      確認するまで、お知らせのメールは届きません。
    </Notice>
  </>
);

const OutlineLinkHover = () => (
  <>
    <Label>filled の警告</Label>
    <Notice
      color="warning"
      appearance="filled"
      title="メールアドレスが確認されていません"
      actions={
        <Link appearance="outline" href="#">
          詳しく見る
        </Link>
      }
    />
    <Label>filled の危険</Label>
    <Notice
      color="danger"
      appearance="filled"
      title="保存できませんでした"
      actions={
        <Link appearance="outline" href="#">
          もう一度保存する
        </Link>
      }
    />
    <Label>soft の警告</Label>
    <Notice
      color="warning"
      title="メールアドレスが確認されていません"
      actions={
        <Link appearance="outline" href="#">
          確認メールを送る
        </Link>
      }
    />
  </>
);

const Cell = ({ column }: { column: Column }) => (
  <div className="flex max-w-[360px] flex-col gap-3">
    {column === columns[0] && <FilledColors />}
    {column === columns[1] && <WarningAppearances />}
    {column === columns[2] && <WithOutlineLink />}
    {column === columns[3] && <OutlineLinkHover />}
  </div>
);

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/36 黄色の塗りのお知らせと操作の場所',
  id: 'design-review-36-notice-warning-filled',
  parameters: {
    layout: 'fullscreen',
    pseudo: { hover: ['[data-preview="hover"] a'] },
  },
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
  render: ({ pick }) => (
    <Comparison
      index={36}
      axis="黄色の塗りのお知らせと操作の場所"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <Cell column={column} />}
    >
      <p>
        <strong className="text-fg">決まったこと</strong>
        （ADR-0057）。ここで選ぶのは、黄色の塗りのお知らせ（filled
        の警告）の縁です。黄色と白地の比は 1.20:1
        で、ほかの塗り（4.53〜6.71:1）よりずっと低く、影も縁もありません。淡い面（soft）も
        1.11〜1.13:1 で、面の色だけで置いています。
      </p>
      <p>
        1列目は塗りの4色、2列目は警告の3つの見た目です。黄色だけが浮いて見えないか、ぼやけて見えないかを見てください。変えるのは黄色の塗りだけで、淡い面・白い面・ほかの色は変えません。A
        と B では、ほかの塗りも透明な 1px
        の線のぶん少し大きくなり、文の折り返しが変わることがあります（色は変わりません）。
      </p>
      <p>
        3列目と4列目は、操作の場所に枠線のリンクを置いたときです（いままでは白いボタンと文字のリンクだけを確かめていました）。枠線と文字は、お知らせの文字の色（塗りの上では白か濃紺）になります。4列目は
        hover で固定しています。この2列は案によらず同じで、黄色の行だけが案ごとに変わります。
      </p>
      <p>どれを既定にするかを一言添えてください。</p>
    </Comparison>
  ),
};
