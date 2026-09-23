'use client';

import {
  Accordion,
  AccordionItem,
  type AccordionVariant,
  Button,
  Card,
  CardBody,
  Grid,
  Heading,
  Icon,
  NumberFormat,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TabList,
  Tabs,
  type TabsColor,
  Tag,
  Text,
} from '@kazuemon/ui';
import { CheckIcon, MinusIcon } from '@phosphor-icons/react';
import { useState } from 'react';

import { SamplePage } from './sample-page';
import { pages } from './sites';
import type { Example } from './types';

// 料金プラン: 3 つのプランのカード、月払いと年払いの切り替え、機能の比べる表、よくある質問
// おすすめのプランは、札と枠の色で目立たせる。いま使っているプランは、ボタンを押せなくする
// 月払い・年払いの切り替えは、Segmented Control ができるまではタブで作る

type Billing = 'monthly' | 'yearly';
type Highlight = 'primary' | 'secondary' | 'none';

interface Plan {
  id: string;
  name: string;
  lead: string;
  monthly: number;
  features: string[];
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'フリー',
    lead: 'ひとりで試すとき',
    monthly: 0,
    features: ['記事 10 本まで', '画像 1 GB', 'コメント'],
  },
  {
    id: 'standard',
    name: 'スタンダード',
    lead: 'ブログを続けるとき',
    monthly: 980,
    features: ['記事は無制限', '画像 10 GB', '独自のドメイン', '予約して公開'],
  },
  {
    id: 'team',
    name: 'チーム',
    lead: '何人かで書くとき',
    monthly: 2_980,
    features: ['スタンダードのすべて', '5 人まで', '下書きのレビュー', 'アクセスの分析'],
  },
];
const recommended = 'standard';

/** 年払いは 2 か月分を引く */
const yearlyPrice = (monthly: number) => monthly * 10;

const comparison: { label: string; values: (string | boolean)[] }[] = [
  { label: '記事の数', values: ['10 本', '無制限', '無制限'] },
  { label: '画像を置く場所', values: ['1 GB', '10 GB', '50 GB'] },
  { label: '独自のドメイン', values: [false, true, true] },
  { label: '予約して公開', values: [false, true, true] },
  { label: '一緒に書く人', values: ['1 人', '1 人', '5 人'] },
  { label: 'アクセスの分析', values: [false, false, true] },
];

function PlanCard({
  plan,
  billing,
  highlight,
  current,
  signedIn,
}: {
  plan: Plan;
  billing: Billing;
  highlight: Highlight;
  current: boolean;
  signedIn: boolean;
}) {
  const featured = plan.id === recommended && highlight !== 'none';
  const ring =
    featured && highlight === 'primary'
      ? 'outline-2 outline-primary'
      : featured
        ? 'outline-2 outline-secondary'
        : undefined;
  const price = billing === 'monthly' ? plan.monthly : yearlyPrice(plan.monthly);

  return (
    <Card className={ring}>
      <CardBody className="flex h-full flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <Heading level={2} size={3}>
              {plan.name}
            </Heading>
            {featured && (
              <Tag color={highlight === 'primary' ? 'primary' : 'secondary'}>おすすめ</Tag>
            )}
          </div>
          <Text size="sm" variant="muted">
            {plan.lead}
          </Text>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-(length:--text-heading-1) leading-(--leading-heading-1) font-bold">
            <NumberFormat value={price} currency="JPY" />
          </span>
          <Text as="span" size="sm" variant="subtle">
            {billing === 'monthly' ? '/ 月' : '/ 年'}
          </Text>
        </div>
        {billing === 'yearly' && plan.monthly > 0 && (
          <Text size="sm" variant="subtle">
            月あたり <NumberFormat value={Math.round(price / 12)} currency="JPY" />
            。2 か月分お得です
          </Text>
        )}
        <ul className="flex flex-1 flex-col gap-2">
          {plan.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-(length:--text-body) leading-(--leading-body)"
            >
              {/* アイコンの入れ物を 1 行の高さ（1lh）にして中央に置くと、文が折り返しても 1 行目の中央にそろう */}
              <span className="flex h-[1lh] items-center text-fg-success">
                <Icon icon={CheckIcon} />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        {current ? (
          <Button variant="outline" disabled>
            いまのプラン
          </Button>
        ) : (
          <Button
            color={featured ? highlight : 'neutral'}
            variant={featured ? 'filled' : 'outline'}
          >
            {/* サインインしていれば切り替え、していなければ始める */}
            {signedIn
              ? `${plan.name}にする`
              : plan.monthly === 0
                ? '無料で始める'
                : `${plan.name}を始める`}
          </Button>
        )}
      </CardBody>
    </Card>
  );
}

function ComparisonTable() {
  return (
    <Table accessibleName="プランの機能を比べる" verticalAlign="middle">
      <TableHead>
        <TableRow>
          <TableHeader>機能</TableHeader>
          {plans.map((p) => (
            <TableHeader key={p.id}>{p.name}</TableHeader>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {comparison.map((row) => (
          <TableRow key={row.label}>
            <TableHeader scope="row">{row.label}</TableHeader>
            {row.values.map((value, i) => (
              <TableCell key={plans[i].id}>
                {typeof value === 'string' ? (
                  value
                ) : value ? (
                  <span className="inline-flex items-center gap-1 text-fg-success">
                    <Icon icon={CheckIcon} />
                    <span className="text-fg">あり</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-fg-subtle">
                    <Icon icon={MinusIcon} />
                    なし
                  </span>
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function PricingScreen({
  initialBilling,
  signedIn,
  highlight,
  tabsColor,
  accordionAppearance,
}: {
  initialBilling: Billing;
  signedIn: boolean;
  highlight: Highlight;
  tabsColor: TabsColor;
  accordionAppearance: AccordionVariant;
}) {
  const [billing, setBilling] = useState<Billing>(initialBilling);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <Heading level={1} size={1}>
          料金プラン
        </Heading>
        <Text variant="muted">
          いつでも変えられます。年払いにすると、2 か月分が無料になります。
        </Text>
        <Tabs
          value={billing}
          onValueChange={(value) => setBilling(value as Billing)}
          color={tabsColor}
        >
          <TabList aria-label="支払いの間隔">
            <Tab value="monthly">月払い</Tab>
            <Tab value="yearly">年払い</Tab>
          </TabList>
        </Tabs>
      </div>

      <Grid columns={{ base: 1, md: 3 }} gap="lg">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billing={billing}
            highlight={highlight}
            current={signedIn && plan.id === 'free'}
            signedIn={signedIn}
          />
        ))}
      </Grid>

      <section className="flex flex-col gap-4">
        <Heading level={2} size={3}>
          機能を比べる
        </Heading>
        <div className="overflow-x-auto">
          <ComparisonTable />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <Heading level={2} size={3}>
          よくある質問
        </Heading>
        <Accordion variant={accordionAppearance}>
          <AccordionItem value="change" title="途中でプランを変えられますか？">
            いつでも変えられます。上のプランにすると、その日から使えます。差額は日割りで計算します。
          </AccordionItem>
          <AccordionItem value="cancel" title="解約すると、記事は消えますか？">
            消えません。フリーに戻り、11 本目からの記事は下書きとして残ります。
          </AccordionItem>
          <AccordionItem value="pay" title="支払いの方法は？">
            クレジットカードと、請求書での支払い（チームのみ）に対応しています。
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
}

export const example: Example = {
  slug: 'pricing',
  title: '料金プラン',
  description: '3 つのプランのカード、月払いと年払いの切り替え、機能を比べる表、よくある質問です。',
  initialLabel: '月払い・サインイン前',
  presets: [
    { label: '年払い', args: { billing: 'yearly' } },
    { label: 'フリーを使っている', args: { signedIn: true } },
  ],
  controls: [
    {
      name: 'highlight',
      label: 'おすすめのプランの印',
      type: 'radio',
      options: [
        { value: 'primary', label: 'ブルー', caption: '札と枠をブルーにします' },
        { value: 'secondary', label: 'ピンク', caption: '札と枠をピンクにします' },
        { value: 'none', label: 'なし', caption: 'どのプランも同じ見た目にします' },
      ],
    },
    {
      name: 'tabsColor',
      label: '支払いの間隔のタブの色',
      type: 'radio',
      options: [
        { value: 'neutral', label: 'グレー' },
        { value: 'primary', label: 'ブルー' },
        { value: 'secondary', label: 'ピンク' },
      ],
    },
    {
      name: 'accordionAppearance',
      label: 'よくある質問の見た目',
      type: 'select',
      options: [
        { value: 'divided', label: '線で区切る' },
        { value: 'plain', label: '飾りなし' },
        { value: 'filled', label: '面を敷く' },
        { value: 'open-filled', label: '開いたものだけ面を敷く' },
      ],
    },
  ],
  defaults: {
    billing: 'monthly',
    signedIn: false,
    highlight: 'primary',
    tabsColor: 'neutral',
    accordionAppearance: 'divided',
  },
  Screen: ({ args, density }) => (
    <SamplePage density={density} site={pages} current="料金" width="lg">
      <PricingScreen
        initialBilling={args.billing as Billing}
        signedIn={args.signedIn as boolean}
        highlight={args.highlight as Highlight}
        tabsColor={args.tabsColor as TabsColor}
        accordionAppearance={args.accordionAppearance as AccordionVariant}
      />
    </SamplePage>
  ),
};
