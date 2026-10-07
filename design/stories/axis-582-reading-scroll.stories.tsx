import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useCallback, useRef } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { CodeBlock } from '../../src/components/code-block/CodeBlock';
import { longLineHtml } from '../../src/components/code-block/fixtures';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type TableVariant,
} from '../../src/components/table/Table';
import { statePseudo } from '../../src/stories/story-states';

// 軸 582: 横にあふれる表とコードのスクロール
const meta = {
  title: 'Design Review/582 横にあふれる表とコードのスクロール',
  id: 'design-review-582-reading-scroll',
  parameters: {
    layout: 'fullscreen',
    // 「マウスを載せたとき」の列は、枠に hover を当てる（ScrollArea のつまみは、載せたときに出る）
    pseudo: statePseudo({ hover: '[data-slot$="-scroll"]' }),
  },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

// 表とコードの両方の切り替えのトークンを、同じ値でそろえて書く
function scrollTokens(values: {
  nativeWidth: string;
  nativeColor: string;
  thumbVisibility: string;
  thumbRest: string;
  edgeShadow: string;
}): Candidate['tokens'] {
  const tokens: Record<`--${string}`, string> = {};
  for (const part of ['table', 'code-block']) {
    tokens[`--${part}-scroll-native-width`] = values.nativeWidth;
    tokens[`--${part}-scroll-native-color`] = values.nativeColor;
    tokens[`--${part}-scroll-thumb-visibility`] = values.thumbVisibility;
    tokens[`--${part}-scroll-thumb-rest`] = values.thumbRest;
    tokens[`--${part}-scroll-edge-shadow`] = values.edgeShadow;
  }
  return tokens;
}

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'ブラウザのスクロールバー',
    intent:
      'ブラウザのスクロールバーをそのまま出す。続きがあることは、OS がスクロールバーを出す設定のときだけ分かる（macOS の既定やスマホでは、スクロールするまで何も出ない）。このページのバーの色は、比べるために線の色で描いた近い形',
    spec: [
      ['続きの合図', 'ブラウザのスクロールバー'],
      ['端の影', 'なし'],
    ],
    tokens: scrollTokens({
      nativeWidth: 'auto',
      nativeColor: 'var(--color-line-strong) transparent',
      thumbVisibility: 'hidden',
      thumbRest: '0',
      edgeShadow: 'transparent',
    }),
  },
  {
    id: 'A',
    name: 'ScrollArea と同じ（影＋載せたときのつまみ）',
    intent:
      '続きのある左右の端に内側の影を落とし、つまみは載せたとき・スクロール中・キーボードで止まったときに出す。DataTable・Autocomplete・ScrollArea と同じ見た目。縦にもスクロールする表は、貼り付いた見出しの下に影を落とす（DataTable と同じ）',
    spec: [
      ['続きの合図', '端の内側の影'],
      ['つまみ', '載せたとき・スクロール中'],
    ],
    tokens: scrollTokens({
      nativeWidth: 'none',
      nativeColor: 'auto',
      thumbVisibility: 'visible',
      thumbRest: '0',
      edgeShadow: 'var(--color-sheet-edge-shadow)',
    }),
  },
  {
    id: 'B',
    name: 'つまみをいつも出す（影なし）',
    intent:
      '影は落とさず、ScrollArea のつまみをいつも出す（ScrollArea の hideEdgeShadow と同じ）。つまみは中身の上に重ねるので、ブラウザのバーのように下の場所は取らない。表の線やコードの面に細い棒が重なる',
    spec: [
      ['続きの合図', 'いつも出すつまみ'],
      ['端の影', 'なし'],
    ],
    tokens: scrollTokens({
      nativeWidth: 'none',
      nativeColor: 'auto',
      thumbVisibility: 'visible',
      thumbRest: '1',
      edgeShadow: 'transparent',
    }),
  },
];

const columns: Column[] = [
  { label: '表（左の端）', note: '幅 320px に 6 列' },
  { label: '表（途中・載せたとき）', note: '左右に続き', preview: 'hover' },
  { label: '表 framed（途中）', note: '外枠の中' },
  { label: '表 maxHeight（途中）', note: '縦にも。見出しが上に貼り付く' },
  { label: 'コード（左の端）', note: '長い行' },
  { label: 'コード（途中・載せたとき）', note: '題の帯つき', preview: 'hover' },
];

const rows = [
  ['2026-10-01', '東京', '新宿', '晴れ', '24.1℃', '12,400 人'],
  ['2026-10-02', '大阪', '梅田', 'くもり', '22.8℃', '9,850 人'],
  ['2026-10-03', '名古屋', '栄', '雨', '19.5℃', '7,210 人'],
  ['2026-10-04', '福岡', '天神', '晴れ', '25.3℃', '8,030 人'],
  ['2026-10-05', '札幌', '大通', '晴れ', '16.2℃', '6,480 人'],
  ['2026-10-06', '仙台', '一番町', 'くもり', '18.0℃', '5,120 人'],
];

function SampleTable({ variant, maxHeight }: { variant?: TableVariant; maxHeight?: number }) {
  return (
    <Table
      variant={variant}
      maxHeight={maxHeight}
      accessibleName="催しの記録"
      className="[&_td]:whitespace-nowrap [&_th]:whitespace-nowrap"
    >
      <TableHead>
        <TableRow>
          {['日付', '都市', '会場', '天気', '気温', '来場者'].map((label) => (
            <TableHeader key={label}>{label}</TableHeader>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row[0]}>
            {row.map((cell, i) => (
              <TableCell key={cell} align={i >= 4 ? 'end' : undefined}>
                {cell}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// 中のスクロールの枠を、横（と縦）の途中に置く。文字の読み込みで幅が変わっても置き直す
function Middle({ children }: { children: ReactNode }) {
  const observer = useRef<ResizeObserver | null>(null);
  const ref = useCallback((wrapper: HTMLDivElement | null) => {
    observer.current?.disconnect();
    if (!wrapper) return;
    const place = () => {
      for (const viewport of wrapper.querySelectorAll<HTMLElement>(
        '[data-slot="scroll-area-viewport"]'
      )) {
        viewport.scrollLeft = Math.round((viewport.scrollWidth - viewport.clientWidth) / 2);
        viewport.scrollTop = Math.round((viewport.scrollHeight - viewport.clientHeight) / 2);
      }
    };
    place();
    requestAnimationFrame(place);
    observer.current = new ResizeObserver(() => requestAnimationFrame(place));
    observer.current.observe(wrapper);
  }, []);
  return <div ref={ref}>{children}</div>;
}

export const Default: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={582}
      axis="横にあふれる表とコードのスクロール"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => {
        const cell = (() => {
          switch (column.label) {
            case '表（左の端）':
              return <SampleTable />;
            case '表（途中・載せたとき）':
              return (
                <Middle>
                  <SampleTable />
                </Middle>
              );
            case '表 framed（途中）':
              return (
                <Middle>
                  <SampleTable variant="framed" />
                </Middle>
              );
            case '表 maxHeight（途中）':
              return (
                <Middle>
                  <SampleTable maxHeight={180} />
                </Middle>
              );
            case 'コード（左の端）':
              return <CodeBlock html={longLineHtml} />;
            default:
              return (
                <Middle>
                  <CodeBlock title="astro.config.ts" html={longLineHtml} />
                </Middle>
              );
          }
        })();
        return <div className="w-80">{cell}</div>;
      }}
    >
      <p>
        表（Table）と複数行のコード（CodeBlock）が、本文の幅より広いときの続きの見せ方を選びます。
        原則
        1「スクロールできる面は、続きがあることを必ず見せ、見た目は部品によらずそろえる」を、まだ当てていない部品です。
        DataTable・Autocomplete・ScrollArea・最大の高さを付けた CodeBlock は、すでに A
        の見た目です。
      </p>
      <p>
        現行版のブラウザのスクロールバーは、Windows では下に 15px ほどの場所を取り、CodeBlock
        はそのときだけ下の角を四角くしています。A・B
        では場所を取らないので、角はいつも丸いままです。 A
        を選ぶと、表の見出しが上に貼り付くとき（maxHeight）の影も DataTable
        とそろいます（丸い帯の見出し banded の角の処理は、DataTable のようにはしていません）。
      </p>
      <p>
        Prose の中の素の表と pre（Markdown を変換した HTML）は、CSS
        で見た目を当てているだけで、枠で包めないので、この軸では変わりません。決めた見た目にそろえるには、MDX
        の components で table を Table に、pre を CodeBlock に差し替えて使います。
      </p>
    </Comparison>
  ),
};
