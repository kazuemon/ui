'use client';

import { MagnifyingGlassIcon, PackageIcon } from '@phosphor-icons/react';
import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Grid,
  Heading,
  Icon,
  Meter,
  Notice,
  NumberFormat,
  Progress,
  RelativeTime,
  SearchField,
  Skeleton,
  Spinner,
  Stat,
  type StatSize,
  StatusPanel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@kazuemon/ui';
import { type ReactNode, useState } from 'react';

import { SamplePage } from './sample-page';
import { shop } from './sites';
import type { Example } from './types';

// ダッシュボード: 小さなお店の管理画面。数字のまとめ（Stat）、容量（Meter）、目標までの進み（Progress）、最近の注文（Table）
// 期間（ButtonGroup: 今日・7 日・30 日）を替えると数字が替わる。注文は SearchField で探せて、0 件なら StatusPanel を出す。
// 読み込み中は見出しの横に回る円（Spinner）を出して、中身は面（Skeleton）だけを置く。
// 注文がまだないときは、数字を 0 にして表の代わりに StatusPanel を出す。容量が足りないときは上に知らせを出す

type DashboardState = 'normal' | 'loading' | 'full' | 'empty';
type Period = 'today' | '7d' | '30d';

const now = new Date('2026-09-21T10:00:00+09:00').getTime();
const ago = (minutes: number) => now - minutes * 60_000;

const figures: Record<
  Period,
  { sales: number; orders: number; visitors: number; conversion: number; deltas: string[] }
> = {
  today: {
    sales: 27_000,
    orders: 9,
    visitors: 468,
    conversion: 1.92,
    deltas: ['18%', '2', '5%', '0.4pt'],
  },
  '7d': {
    sales: 184_200,
    orders: 62,
    visitors: 3_120,
    conversion: 1.99,
    deltas: ['12%', '8', '4%', '0.1pt'],
  },
  '30d': {
    sales: 742_800,
    orders: 251,
    visitors: 12_840,
    conversion: 1.95,
    deltas: ['6%', '14', '9%', '0.2pt'],
  },
};
const trends = ['up', 'up', 'up', 'down'] as const;
const periods: { value: Period; label: string; before: string }[] = [
  { value: 'today', label: '今日', before: '昨日' },
  { value: '7d', label: '7 日', before: '前の 7 日' },
  { value: '30d', label: '30 日', before: '前の 30 日' },
];

type OrderStatus = 'paid' | 'shipped' | 'refunded';
const orders: { id: string; customer: string; total: number; status: OrderStatus; at: number }[] = [
  { id: '#1042', customer: 'Hanako Yamada', total: 4_800, status: 'paid', at: ago(12) },
  { id: '#1041', customer: 'Taro Suzuki', total: 12_600, status: 'shipped', at: ago(95) },
  { id: '#1040', customer: 'Mika Tanaka', total: 2_200, status: 'refunded', at: ago(60 * 5) },
  { id: '#1039', customer: 'Ken Ito', total: 7_400, status: 'shipped', at: ago(60 * 26) },
  { id: '#1038', customer: 'Yui Kobayashi', total: 3_300, status: 'shipped', at: ago(60 * 30) },
  { id: '#1037', customer: 'Sota Watanabe', total: 9_900, status: 'paid', at: ago(60 * 49) },
];
const statusLabel: Record<OrderStatus, string> = {
  paid: '支払い済み',
  shipped: '発送済み',
  refunded: '返金',
};
const statusColor = { paid: 'info', shipped: 'success', refunded: 'danger' } as const;

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <Heading level={2} size={4}>
            {title}
          </Heading>
          {action}
        </div>
        {children}
      </CardBody>
    </Card>
  );
}

function DashboardScreen({
  state,
  statSize,
  deltaIcon,
  deltaFill,
  initialQuery,
}: {
  state: DashboardState;
  statSize: StatSize;
  deltaIcon: boolean;
  deltaFill: boolean;
  initialQuery: string;
}) {
  const [period, setPeriod] = useState<Period>('7d');
  const [query, setQuery] = useState(initialQuery);
  const busy = state === 'loading';
  const empty = state === 'empty';
  // 注文がまだないお店は、どの期間も 0（増減は出さない）
  const f = empty
    ? { sales: 0, orders: 0, visitors: 0, conversion: 0, deltas: [] }
    : figures[period];
  const before = periods.find((p) => p.value === period)?.before;
  const storage = state === 'full' ? 4.7 : 3.2;

  const q = query.trim().toLowerCase();
  const shown = empty
    ? []
    : orders.filter(
        (o) => !q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q)
      );

  const stats = [
    { label: '売上', value: <NumberFormat value={f.sales} currency="JPY" />, unit: undefined },
    { label: '注文', value: <NumberFormat value={f.orders} />, unit: '件' },
    { label: '訪れた人', value: <NumberFormat value={f.visitors} />, unit: '人' },
    { label: '買った人の割合', value: f.conversion.toFixed(2), unit: '%' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Heading level={1} size={2}>
              ダッシュボード
            </Heading>
            {busy && (
              <Text as="span" size="sm" variant="muted" className="inline-flex items-center gap-2">
                <Spinner />
                <span role="status">読み込み中</span>
              </Text>
            )}
          </div>
          <Text variant="muted" className="mt-1">
            お店の、最近のようすです。
          </Text>
        </div>
        {/* 期間の切り替え。選んでいる期間はブルーの塗りにして、hover と見分けられるようにする。aria-pressed でも伝える */}
        <ButtonGroup aria-label="期間">
          {periods.map((p) => (
            <Button
              key={p.value}
              variant={p.value === period ? 'filled' : 'outline'}
              color={p.value === period ? 'primary' : 'neutral'}
              aria-pressed={p.value === period}
              disabled={busy}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {state === 'full' && (
        <Notice
          status="warning"
          title="画像を置く場所が残りわずかです"
          actions={<Button variant="outline">プランを見る</Button>}
        >
          5 GB のうち 4.7 GB を使っています。いっぱいになると、商品の画像を足せなくなります。
        </Notice>
      )}

      <Grid columns={{ base: 2, lg: 4 }} aria-busy={busy}>
        {stats.map((s, i) => (
          <Card key={s.label}>
            <CardBody>
              {busy ? (
                <div className="flex flex-col gap-2" aria-hidden="true">
                  <Skeleton variant="text" className="w-1/2" />
                  <Skeleton className="h-9 w-3/4" />
                  <Skeleton variant="text" className="w-1/3" />
                </div>
              ) : (
                <Stat
                  label={s.label}
                  value={s.value}
                  unit={s.unit}
                  size={statSize}
                  // 矢印を出さないときは、増減の文字に符号を書く（色だけで伝えない）
                  delta={
                    empty
                      ? undefined
                      : deltaIcon
                        ? f.deltas[i]
                        : `${trends[i] === 'down' ? '-' : '+'}${f.deltas[i]}`
                  }
                  deltaIndicator={empty ? undefined : trends[i]}
                  caption={empty ? undefined : `${before}と比べて`}
                  hideDeltaIcon={!deltaIcon}
                  deltaFill={deltaFill}
                />
              )}
            </CardBody>
          </Card>
        ))}
      </Grid>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Panel
          title="最近の注文"
          action={empty ? undefined : <Button variant="underline">すべて見る</Button>}
        >
          {/* 注文がまだないときは、探すものがないので欄を出さない */}
          {!empty && (
            <SearchField
              label="注文を探す"
              placeholder="注文の番号・お客さまの名前"
              value={query}
              onValueChange={setQuery}
              disabled={busy}
            />
          )}
          {busy ? (
            <Skeleton variant="text" lines={4} />
          ) : empty ? (
            <StatusPanel
              size="sm"
              icon={<Icon icon={PackageIcon} size="lg" standalone />}
              title="まだ注文がありません"
              actions={<Button variant="outline">お店のページを見る</Button>}
            >
              はじめての注文が入ると、ここに並びます。
            </StatusPanel>
          ) : shown.length === 0 ? (
            <StatusPanel
              size="sm"
              icon={<Icon icon={MagnifyingGlassIcon} size="lg" standalone />}
              title={`「${query.trim()}」に合う注文はありません`}
              actions={
                <Button variant="outline" onClick={() => setQuery('')}>
                  探す語を消す
                </Button>
              }
            >
              注文の番号（#1042 など）か、お客さまの名前で探せます。
            </StatusPanel>
          ) : (
            // 表そのものが横に送れる（Table の中の overflow-x-auto）ので、ここで二重に枠を作らない。
            // セルは折り返さず、送れば全部読める形にする
            <Table accessibleName="最近の注文" verticalAlign="middle">
              <TableHead>
                <TableRow>
                  <TableHeader className="whitespace-nowrap">注文</TableHeader>
                  <TableHeader className="whitespace-nowrap">お客さま</TableHeader>
                  <TableHeader className="whitespace-nowrap">状態</TableHeader>
                  <TableHeader align="end" className="whitespace-nowrap">
                    金額
                  </TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {shown.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{o.id}</span>
                        <Text as="span" size="sm" variant="subtle">
                          <RelativeTime dateTime={o.at} now={now} />
                        </Text>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{o.customer}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className="inline-flex items-center gap-2">
                        <Badge
                          color={statusColor[o.status]}
                          accessibleName={statusLabel[o.status]}
                        />
                        {statusLabel[o.status]}
                      </span>
                    </TableCell>
                    <TableCell align="end" className="whitespace-nowrap">
                      <NumberFormat value={o.total} currency="JPY" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel title="今月の目標">
            {busy ? (
              <Skeleton variant="text" lines={2} />
            ) : (
              <Progress
                label="売上 100 万円まで"
                value={empty ? 0 : 74}
                caption={
                  empty ? 'あと 100 万円。残りは 9 日です' : 'あと 25 万 7,200 円。残りは 9 日です'
                }
              />
            )}
          </Panel>
          <Panel title="画像を置く場所">
            {busy ? (
              <Skeleton variant="text" lines={2} />
            ) : (
              <Meter
                label="使っている量"
                value={storage}
                max={5}
                low={4}
                high={4.5}
                optimum={0}
                format={{ style: 'unit', unit: 'gigabyte', maximumFractionDigits: 1 }}
                caption="4 GB を超えると黄色、4.5 GB を超えると赤になります"
              />
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

export const example: Example = {
  slug: 'dashboard',
  title: 'ダッシュボード',
  description: 'お店の売上や注文をまとめた管理画面',
  initialLabel: '読み込み済み',
  presets: [
    { label: '読み込み中', args: { state: 'loading', query: '' } },
    { label: '注文がない', args: { state: 'empty', query: '' } },
    { label: '探して 0 件', args: { state: 'normal', query: 'Sato' } },
    { label: '容量が足りない', args: { state: 'full', query: '' } },
  ],
  controls: [
    {
      name: 'statSize',
      label: '数字の大きさ',
      type: 'radio',
      options: [
        { value: 'heading-1', label: '見出し 1 と同じ' },
        { value: 'heading-2', label: '見出し 2 と同じ' },
        { value: 'heading-3', label: '見出し 3 と同じ', caption: '4 つ並べて狭いときに' },
      ],
    },
    {
      name: 'deltaIcon',
      label: '増減に矢印を出す',
      caption: '外すと、増減の文字に符号（+・-）を書きます',
      type: 'switch',
    },
    { name: 'deltaFill', label: '増減を淡い面に載せる', type: 'switch' },
  ],
  defaults: {
    state: 'normal',
    query: '',
    statSize: 'heading-2',
    deltaIcon: true,
    deltaFill: false,
  },
  Screen: ({ args, density }) => (
    <SamplePage density={density} site={shop} current="ダッシュボード" width="lg">
      <DashboardScreen
        // 「探して 0 件」のように探す語を当てたときは、欄をその語で作り直す
        key={String(args.query)}
        initialQuery={String(args.query)}
        state={args.state as DashboardState}
        statSize={args.statSize as StatSize}
        deltaIcon={args.deltaIcon as boolean}
        deltaFill={args.deltaFill as boolean}
      />
    </SamplePage>
  ),
};
