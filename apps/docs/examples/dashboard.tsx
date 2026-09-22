'use client';

import {
  Badge,
  Button,
  Card,
  CardBody,
  Heading,
  Meter,
  Notice,
  NumberFormat,
  Progress,
  RelativeTime,
  Select,
  Skeleton,
  Stat,
  type StatSize,
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
// 期間を替えると数字が替わる。読み込み中は面だけを置き、容量が足りないときは上に知らせを出す

type DashboardState = 'normal' | 'loading' | 'full';
type Period = '7d' | '30d' | '90d';

const now = new Date('2026-09-21T10:00:00+09:00').getTime();
const ago = (minutes: number) => now - minutes * 60_000;

const figures: Record<
  Period,
  { sales: number; orders: number; visitors: number; conversion: number; deltas: string[] }
> = {
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
  '90d': {
    sales: 2_118_400,
    orders: 703,
    visitors: 40_210,
    conversion: 1.75,
    deltas: ['3%', '21', '2%', '0.3pt'],
  },
};
const trends = ['up', 'up', 'up', 'down'] as const;
const periodLabel: Record<Period, string> = {
  '7d': '前の 7 日',
  '30d': '前の 30 日',
  '90d': '前の 90 日',
};

type OrderStatus = 'paid' | 'shipped' | 'refunded';
const orders: { id: string; customer: string; total: number; status: OrderStatus; at: number }[] = [
  { id: '#1042', customer: 'Hanako Yamada', total: 4_800, status: 'paid', at: ago(12) },
  { id: '#1041', customer: 'Taro Suzuki', total: 12_600, status: 'shipped', at: ago(95) },
  { id: '#1040', customer: 'Mika Tanaka', total: 2_200, status: 'refunded', at: ago(60 * 5) },
  { id: '#1039', customer: 'Ken Ito', total: 7_400, status: 'shipped', at: ago(60 * 26) },
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
}: {
  state: DashboardState;
  statSize: StatSize;
  deltaIcon: boolean;
  deltaFill: boolean;
}) {
  const [period, setPeriod] = useState<Period>('7d');
  const busy = state === 'loading';
  const f = figures[period];
  const storage = state === 'full' ? 4.7 : 3.2;

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
          <Heading level={1} size={2}>
            ダッシュボード
          </Heading>
          <Text variant="muted" className="mt-1">
            お店の、最近のようすです。
          </Text>
        </div>
        <div className="w-full sm:w-44">
          <Select
            label="期間"
            value={period}
            onValueChange={(value) => value && setPeriod(value as Period)}
            disabled={busy}
            items={[
              { label: '直近 7 日', value: '7d' },
              { label: '直近 30 日', value: '30d' },
              { label: '直近 90 日', value: '90d' },
            ]}
          />
        </div>
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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-busy={busy}>
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
                    deltaIcon ? f.deltas[i] : `${trends[i] === 'down' ? '-' : '+'}${f.deltas[i]}`
                  }
                  deltaIndicator={trends[i]}
                  caption={periodLabel[period] + 'と比べて'}
                  hideDeltaIcon={!deltaIcon}
                  deltaFill={deltaFill}
                />
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Panel title="最近の注文" action={<Button variant="underline">すべて見る</Button>}>
          {busy ? (
            <Skeleton variant="text" lines={4} />
          ) : (
            // 狭い画面では、表だけを横に送る（カードからはみ出さない）
            <div className="overflow-x-auto">
              <Table accessibleName="最近の注文" verticalAlign="middle">
                <TableHead>
                  <TableRow>
                    <TableHeader>注文</TableHeader>
                    <TableHeader>お客さま</TableHeader>
                    <TableHeader>状態</TableHeader>
                    <TableHeader align="end">金額</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{o.id}</span>
                          <Text as="span" size="sm" variant="subtle">
                            <RelativeTime dateTime={o.at} now={now} />
                          </Text>
                        </div>
                      </TableCell>
                      <TableCell>{o.customer}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-2">
                          <Badge
                            color={statusColor[o.status]}
                            accessibleName={statusLabel[o.status]}
                          />
                          {statusLabel[o.status]}
                        </span>
                      </TableCell>
                      <TableCell align="end">
                        <NumberFormat value={o.total} currency="JPY" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel title="今月の目標">
            {busy ? (
              <Skeleton variant="text" lines={2} />
            ) : (
              <Progress
                label="売上 100 万円まで"
                value={74}
                caption="あと 25 万 7,200 円。残りは 9 日です"
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
  description: 'お店の管理画面。数字のまとめ・目標までの進み・容量・最近の注文を並べます。',
  initialLabel: '読み込み済み',
  presets: [
    { label: '読み込み中', args: { state: 'loading' } },
    { label: '容量が足りない', args: { state: 'full' } },
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
  defaults: { state: 'normal', statSize: 'heading-2', deltaIcon: true, deltaFill: false },
  Screen: ({ args, density }) => (
    <SamplePage density={density} site={shop} current="ダッシュボード" width="lg">
      <DashboardScreen
        state={args.state as DashboardState}
        statSize={args.statSize as StatSize}
        deltaIcon={args.deltaIcon as boolean}
        deltaFill={args.deltaFill as boolean}
      />
    </SamplePage>
  ),
};
