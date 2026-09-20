import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Menu } from '../../src/components/menu/Menu';
import { MenuItem } from '../../src/components/menu/MenuItem';
import { Pagination } from '../../src/components/pagination/Pagination';
import {
  type PaginationSlot,
  paginationSlots,
} from '../../src/components/pagination/pagination-items';
import { focusRing } from '../../src/internal/focus-styles';
import { CaretDownIcon, CaretLeftIcon, CaretRightIcon } from '../../src/internal/icons';

// 後半の軸 179: Pagination のいちばん狭い形と、省略（…）の扱い
//   backlog の「…を押すと間のページを選べる形」「5 / 10 のように数だけを出す、いちばん狭い形」を比べる
//   A・B・C の形は部品にまだない。部品は変えず、このストーリーの中で Pagination と同じ見た目を組み立てて近づけている
//     （番号・前へ・次への見た目は Pagination.tsx の tv の item スロットを写したもの。決めたら部品に入れる）
//   幅で切り替わる段のうち、現行版の 2 か所（32rem・28rem）はコンテナクエリのまま。
//     B・C で足す「数だけ」の段は、列の幅が決まっているのでこのストーリーでは幅の値から選んでいる
//   決まったら pick を採用した案にし、比較画像を撮って、このストーリーは消す

const COUNT = 20;

const range = (from: number, to: number) =>
  Array.from({ length: Math.max(to - from + 1, 0) }, (_, i) => from + i);

// 省略（…）が隠しているページの範囲
function hiddenRange(slots: PaginationSlot[], index: number) {
  let from = 1;
  for (let i = index - 1; i >= 0; i--) {
    const slot = slots[i];
    if (typeof slot === 'number') {
      from = slot + 1;
      break;
    }
  }
  let to = from;
  for (let i = index + 1; i < slots.length; i++) {
    const slot = slots[i];
    if (typeof slot === 'number') {
      to = slot - 1;
      break;
    }
  }
  return { from, to };
}

const ROOT = [
  '@container/pagination text-fg',
  '[--pagination-current-bg:var(--color-neutral)] [--pagination-current-fg:var(--color-fg)]',
].join(' ');

const LIST = 'flex items-center justify-center gap-(--pagination-gap)';

// 左右の余白と文字の色だけ、使う場所ごとに足す（tv を使わないので、打ち消し合うクラスを base に入れない）
const ITEM = [
  'relative inline-flex h-(--spacing-control) min-w-(--spacing-control) shrink-0 cursor-pointer items-center justify-center',
  'rounded-(--radius-control)',
  'text-(length:--text-control) leading-(--leading-control) whitespace-nowrap tabular-nums no-underline select-none',
  '[--pagination-item-ink:var(--color-fg)] [--pagination-item-rest:transparent]',
  'bg-(color:--flat-bg) [--flat-bg:var(--pagination-item-rest)]',
  'not-[:disabled,[data-disabled]]:hover:[--flat-bg:color-mix(in_oklab,var(--pagination-item-ink)_var(--flat-hover-mix),var(--pagination-item-rest))]',
  'not-[:disabled,[data-disabled]]:active:translate-y-(--flat-press-depth) not-[:disabled,[data-disabled]]:active:[--flat-bg:color-mix(in_oklab,var(--pagination-item-ink)_var(--flat-press-mix),var(--pagination-item-rest))]',
  '[transition:--flat-bg_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
  'motion-reduce:[transition:none]',
  ...focusRing,
  'aria-[current=page]:font-bold aria-[current=page]:text-(color:--pagination-current-fg)',
  'aria-[current=page]:[--pagination-item-ink:var(--pagination-current-fg)] aria-[current=page]:[--pagination-item-rest:var(--pagination-current-bg)]',
  'disabled:cursor-not-allowed disabled:text-(color:--color-outline-neutral-disabled-text)',
].join(' ');

const PAGE_ITEM = `${ITEM} px-(--pagination-item-px) text-(color:--pagination-item-color)`;

const STEP_ITEM = [
  ITEM,
  'gap-(--pagination-step-gap) px-0 @lg/pagination:px-(--pagination-step-px)',
  '@max-lg/pagination:[--icon-stroke:var(--icon-stroke-standalone)]',
  'text-(color:--pagination-item-color)',
].join(' ');

const STEP_LABEL = 'sr-only @lg/pagination:not-sr-only';

// 「…」を押せるようにした形。幅はキャプションの色のまま、指で押せる大きさ（部品の高さ）にそろえる
const ELLIPSIS_ITEM = `${ITEM} px-0 text-(color:--pagination-ellipsis-color)`;

// 「10 / 20」の数。押せないときは span、押せるときは button
const COUNT_TEXT = [
  'inline-flex h-(--spacing-control) shrink-0 items-center justify-center px-(--pagination-item-px)',
  'text-(length:--text-control) leading-(--leading-control) whitespace-nowrap tabular-nums select-none',
  'text-(color:--pagination-item-color)',
].join(' ');

const COUNT_BUTTON = [
  ITEM,
  'gap-(--pagination-step-gap) px-(--pagination-item-px) text-(color:--pagination-item-color)',
  '[--icon-stroke:var(--icon-stroke-standalone)]',
].join(' ');

function StepButton({ kind, disabled }: { kind: 'prev' | 'next'; disabled: boolean }) {
  return (
    <button type="button" disabled={disabled} data-kind={kind} className={STEP_ITEM}>
      {kind === 'prev' && <CaretLeftIcon />}
      <span className={STEP_LABEL}>{kind === 'prev' ? '前へ' : '次へ'}</span>
      {kind === 'next' && <CaretRightIcon />}
    </button>
  );
}

function PageButton({ value, current }: { value: number; current: boolean }) {
  return (
    <button
      type="button"
      aria-current={current ? 'page' : undefined}
      aria-label={`${value} ページ目`}
      className={PAGE_ITEM}
    >
      {value}
    </button>
  );
}

/** 「…」を押すと、省いた番号がメニューに並ぶ */
function EllipsisMenu({ from, to }: { from: number; to: number }) {
  return (
    <Menu
      modal={false}
      side="top"
      title="ページを選ぶ"
      trigger={
        <button
          type="button"
          aria-label={`${from} ページから ${to} ページを選ぶ`}
          className={ELLIPSIS_ITEM}
        >
          …
        </button>
      }
    >
      {range(from, to).map((value) => (
        <MenuItem key={value}>{value} ページ目</MenuItem>
      ))}
    </Menu>
  );
}

/** 現行版と同じ並び。違うのは「…」がメニューの開くボタンになっているところだけ */
function MenuEllipsisPagination({ page, count }: { page: number; count: number }) {
  const list = (slots: PaginationSlot[], listClass: string) => (
    <ul className={`${LIST} ${listClass}`}>
      <li className="flex">
        <StepButton kind="prev" disabled={page <= 1} />
      </li>
      {slots.map((slot, index) => {
        if (typeof slot === 'number') {
          return (
            <li key={slot} className="flex">
              <PageButton value={slot} current={slot === page} />
            </li>
          );
        }
        const { from, to } = hiddenRange(slots, index);
        return (
          <li key={slot} className="flex">
            <EllipsisMenu from={from} to={to} />
          </li>
        );
      })}
      <li className="flex">
        <StepButton kind="next" disabled={page >= count} />
      </li>
    </ul>
  );
  return (
    <nav aria-label="ページ送り" className={ROOT}>
      {list(paginationSlots(page, count, 1, 1), 'hidden @md/pagination:flex')}
      {list(paginationSlots(page, count, 0, 1), 'flex @md/pagination:hidden')}
    </nav>
  );
}

/** いちばん狭い形。番号を並べず「10 / 20」の数だけにする（前へ・次への矢印は残す） */
function CountPagination({
  page,
  count,
  menu = false,
}: {
  page: number;
  count: number;
  menu?: boolean;
}) {
  const label = `${count} ページ中 ${page} ページ目`;
  const value = (
    <span aria-hidden="true">
      <span className="font-bold text-fg">{page}</span> / {count}
    </span>
  );
  return (
    <nav aria-label="ページ送り" className={ROOT}>
      <ul className={LIST}>
        <li className="flex">
          <StepButton kind="prev" disabled={page <= 1} />
        </li>
        <li className="flex">
          {menu ? (
            <Menu
              modal={false}
              side="top"
              title="ページを選ぶ"
              trigger={
                <button
                  type="button"
                  aria-label={`${label}。ページを選ぶ`}
                  className={COUNT_BUTTON}
                >
                  {value}
                  <CaretDownIcon />
                </button>
              }
            >
              {range(1, count).map((target) => (
                <MenuItem key={target}>{target} ページ目</MenuItem>
              ))}
            </Menu>
          ) : (
            <span className={COUNT_TEXT}>
              {value}
              <span className="sr-only">{label}</span>
            </span>
          )}
        </li>
        <li className="flex">
          <StepButton kind="next" disabled={page >= count} />
        </li>
      </ul>
    </nav>
  );
}

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '番号を省く（… は押せない）',
    intent:
      '32rem 未満で前へ・次へを矢印だけにし、28rem 未満でいまのページの左右の番号を省きます。「…」はキャプションの色の文字で、押せません。24rem では押せる場所が 4 つ（前へ・1・20・次へ）で、どれも部品の高さ（44px）の箱です。間のページ（2〜9・11〜19）へは、前へ・次へを何度も押すか、1 か 20 まで飛んでから送ります。',
    spec: [
      ['切り替わる幅', '32rem: 前へ・次へを矢印だけに／28rem: 左右の番号を省く（2 か所）'],
      ['24rem に出るもの', '‹ 1 … 10 … 20 ›（並びの幅はおよそ 292px）'],
      ['押せる場所（24rem）', '4 つ ＋ いまのページ'],
      ['「…」', '押せない。幅 24px・キャプションの色'],
    ],
  },
  {
    id: 'A',
    name: '「…」を押すと間のページを選べる',
    intent:
      '「…」をメニューの開くボタンにし、省いた番号をその中に並べます。指で押せる大きさを保つため、「…」の幅を 24px から部品の高さと同じ 44px に広げます。24rem では押せる場所が 6 つになり、並びの幅は 292px から 332px に増えます（24rem = 384px には収まります）。どの幅でも、2 回の操作でどのページにも届きます。',
    spec: [
      ['切り替わる幅', '現行版と同じ 2 か所（32rem・28rem）'],
      ['24rem に出るもの', '‹ 1 … 10 … 20 ›（並びの幅はおよそ 332px）'],
      ['押せる場所（24rem）', '6 つ（前へ・1・…・…・20・次へ）＋ いまのページ'],
      ['「…」', 'メニューの開くボタン。44px 角・キャプションの色。押すと省いた番号が並ぶ'],
    ],
  },
  {
    id: 'B',
    name: 'いちばん狭いところは「10 / 20」',
    intent:
      '28rem 未満では番号を並べるのをやめ、「10 / 20」の数だけにします（前へ・次への矢印は残します）。段の数は現行版と同じ 2 か所のままで、「1 … 10 … 20」の段が数に置き換わります。並びはおよそ 170px まで縮み、狭い欄の中にも置けますが、押せる場所は前へ・次への 2 つだけになり、間のページへは 1 ページずつ送ることになります。矢印は 44px 角のままです。',
    spec: [
      ['切り替わる幅', '32rem: 矢印だけに／28rem: 「10 / 20」の数だけに（2 か所）'],
      ['24rem に出るもの', '‹ 10 / 20 ›（並びの幅はおよそ 170px）'],
      ['押せる場所（24rem）', '2 つ（前へ・次へ）'],
      ['数の部分', '押せない。いまのページだけ本文の色の太字、残りはキャプションの色'],
    ],
  },
  {
    id: 'C',
    name: 'A と B の両方',
    intent:
      'A の「…」のメニューを持たせ、さらに 26rem 未満に「10 / 20」の段を足します（幅で切り替わる段が 1 つ増えて 3 か所）。数の部分そのものがメニューの開くボタンで、後ろに下向きの ▾ が付きます。24rem では押せる場所は 3 つ（前へ・数・次へ）で、数のボタンは高さ 44px・幅は文字の分だけ広く、指で押せます。番号が並ばなくても、どのページにも 2 回の操作で届きます。',
    spec: [
      [
        '切り替わる幅',
        '32rem: 矢印だけに／28rem: 左右の番号を省く／26rem: 「10 / 20」の数だけに（3 か所）',
      ],
      ['24rem に出るもの', '‹ 10 / 20 ▾ ›（並びの幅はおよそ 200px）'],
      ['押せる場所（24rem）', '3 つ（前へ・数・次へ）。数から 20 ページのどこへでも飛べる'],
      ['「…」', 'A と同じメニュー（26rem 以上の幅で出る）'],
    ],
  },
];

const columns: Column[] = [
  { label: '広い', note: '48rem・全部出る' },
  { label: '40rem', note: '全部出る' },
  { label: '32rem', note: '前へ・次へに文字が出る境目' },
  { label: '28rem', note: '前へ・次へは矢印だけ' },
  { label: '24rem', note: 'スマートフォンの幅' },
  { label: '1 ページ目', note: '24rem・前へは押せない' },
  { label: '最後のページ', note: '24rem・20 ページ目' },
];

// 列ごとの枠の幅（rem）と、描くページ。既定はページ数が多いとき（全 20 ページ・10 ページ目）
const cells: Record<string, { width: number; page: number }> = {
  広い: { width: 48, page: 10 },
  '40rem': { width: 40, page: 10 },
  '32rem': { width: 32, page: 10 },
  '28rem': { width: 28, page: 10 },
  '24rem': { width: 24, page: 10 },
  '1 ページ目': { width: 24, page: 1 },
  最後のページ: { width: 24, page: COUNT },
};

// 「10 / 20」の段に切り替わる幅（rem 未満）。0 は、その段を持たない案
const countTier: Record<string, number> = { 現行版: 0, A: 0, B: 28, C: 26 };

function renderCell(column: Column, candidate: Candidate) {
  const { width, page } = cells[column.label];
  const compact = width < (countTier[candidate.id] ?? 0);
  const hasMenu = candidate.id === 'A' || candidate.id === 'C';
  return (
    <div className="border border-dashed border-line py-2" style={{ width: `${width}rem` }}>
      {compact ? (
        <CountPagination page={page} count={COUNT} menu={candidate.id === 'C'} />
      ) : hasMenu ? (
        <MenuEllipsisPagination page={page} count={COUNT} />
      ) : (
        <Pagination page={page} count={COUNT} />
      )}
    </div>
  );
}

const meta = {
  title: 'Design Review/179 Pagination の狭い形',
  id: 'design-review-179-pagination-compact',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'B,A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'current,A', 'current,B', 'A,C', 'B,C'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={179}
      axis="Pagination のいちばん狭い形と、省略（…）の扱い"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={renderCell}
    >
      <p>
        決定: いちばん狭い形は、28rem 未満で番号をやめて「10 / 20」の数だけにする B
        を既定にします。「…」を押すと間のページを選べる A も選べるようにします（ADR-0198）。
      </p>
      <p>
        Pagination は、置いた場所の幅で形が変わります。いまは 32rem 未満で前へ・次へを矢印だけにし、
        28rem 未満でいまのページの左右の番号を省きます（1 … 10 … 20）。「…」は押せません。
      </p>
      <p>
        比べるのは、いちばん狭いところをどこまで削るかと、省いた番号へどうやって届くかです。24rem
        では現行版も収まりますが、44px の箱が 7 つ並んで詰まって見えます。
      </p>
      <p>
        各列は、幅を決めた破線の枠に部品を入れて描いています（枠の幅が、部品が読む「置いた場所の幅」です）。
        列は左から広い順で、右の 2 列は 24rem のまま 1 ページ目と最後のページにしています。全 20
        ページ・10 ページ目が既定です。
      </p>
      <p>
        A・B・C の形は部品にまだありません。部品は変えず、このストーリーの中で Pagination
        と同じ見た目を組み立てて近づけています。「…」と「10 / 20」のメニューは Menu
        で作ってあるので、実際に押して開けます。
      </p>
      <p>
        どれを既定にするか、ほかに選べるようにしたい案があれば教えてください（「…」のメニューと「10
        / 20」は、どちらも使う側が選べる形にもできます）。
      </p>
    </Comparison>
  ),
};
