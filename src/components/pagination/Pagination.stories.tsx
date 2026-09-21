import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Pagination } from './Pagination';
import { DensityPair, Specimen } from '../../stories/story-parts';
import { type PreviewState, sourceCode, statePseudo } from '../../stories/story-states';

const href = (page: number) => `#page-${page}`;

// 幅を決めた枠（記事一覧の下に置いたところ）。狭い幅は Narrow で見る
const frame = (children: ReactNode) => <div className="max-w-[40rem]">{children}</div>;

const stateRows: { label: string; state?: PreviewState }[] = [
  { label: '通常' },
  { label: 'hover（4）', state: 'hover' },
  { label: '押下（4）', state: 'active' },
  { label: 'フォーカス（キーボード・4）', state: 'focus' },
];

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'ページ番号のナビです。ブログの記事一覧などの下に置き、前へ・番号・省略（…）・次へを 1 行に並べます。',
          '',
          '- `page`（いまのページ、1 から数える）と `count`（ページの数）を渡します。',
          '- リンクにするときは、`href` に番号から行き先を作る関数を渡します。Next.js の `Link` などは `renderPage={(page) => <NextLink href={…} />}` で渡します。',
          '- ボタンにするときは、`href`・`renderPage` を渡さずに `onPageChange` を渡します。押した番号を受け取って、`page` を差し替えます。`page` を渡さないときは、部品が中でいまのページを持ちます（`defaultPage` ではじめのページを決めます）。',
          '- いまのページは `aria-current="page"` で読み上げます。',
          '- いまのページの印は `currentIndicator` で選びます。`neutral`（既定）はグレーの塗り、`neutral-strong` は濃いグレーの塗りに白い文字、`primary` は淡い青の塗りに青い文字、`secondary` は淡いピンクの塗りにピンクの文字です。どれも文字は太字です。ふだんは `neutral` にし、いまの位置を強く見せたいときは `neutral-strong`、サイトの色を出したいときは `primary`・`secondary` にします。Navbar の `currentIndicator` とそろえると、行き先の並びどうしで印がそろいます。',
          '- 番号と前へ・次への形は `shape` で選びます。`square`（既定）はボタンと同じ角、`circle` は丸です。Navbar の行き先と並べるときは `circle` にすると形がそろいます。',
          '- `showOutline` を付けると、番号ごとに細い枠線を引き、押せる範囲をふだんから見せます。',
          '- 端のページでは、前へ・次へは押せない見た目で残ります。並びの位置は動きません。',
          '- どのページにいても番号の数は同じです。ページを送っても、前へ・次へのボタンの位置が変わりません。',
          '- `siblings`（既定 1）はいまのページの左右に出す番号の数、`boundaries`（既定 1）は両端に出す番号の数です。',
          '- 置いた場所の幅が狭いときは、前へ・次へを矢印だけにし、さらに狭いといまのページの左右の番号を省き、いちばん狭いところでは番号をやめて「5 / 10」だけにします。画面の幅ではなく、置いた場所の幅で決めます。',
          '- いちばん狭いところの見せ方は `narrowDisplay` で選びます。`summary`（既定）は「5 / 10」だけ、`pages` は番号を並べたままにします。',
          '- `ellipsisMenu` を付けると、省略（…）を押して間のページをメニューから選べます。押せるので、番号と同じ大きさになります。',
          '- `showPageInput` を付けると、`narrowDisplay="summary"` の「5 / 10」の 5 が、数を打って移る欄になります。Enter か IME の確定で移ります。範囲の外の数では移らず、欄を離すと打った値はいまのページに戻ります。番号が並ばないいちばん狭いところでも、間のページへ行けます。',
          '- `ellipsisMenu`・`showPageInput` を `href` だけで使うときは、その行き先へそのまま移ります。ルーターで移すときは `onPageChange` も渡します（`renderPage` のときは `onPageChange` だけで移します）。',
          '- `accessibleName` は並び（`nav`）の読み上げの名前です（既定は「ページ送り」）。`prevLabel`・`nextLabel`・`pageName` で文言を差し替えられます。',
          '- 記事の前後へ移るだけなら、Pager を使います。',
        ].join('\n'),
      },
    },
  },
  args: {
    page: 5,
    count: 10,
    href,
    align: 'center',
    currentIndicator: 'neutral',
    shape: 'square',
    showOutline: false,
    narrowDisplay: 'summary',
    ellipsisMenu: false,
    showPageInput: false,
  },
  argTypes: {
    page: { control: { type: 'number', min: 1 } },
    count: { control: { type: 'number', min: 1 } },
    siblings: { control: { type: 'number', min: 0 }, table: { defaultValue: { summary: '1' } } },
    boundaries: {
      control: { type: 'number', min: 0 },
      table: { defaultValue: { summary: '1' } },
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
      table: { defaultValue: { summary: "'center'" } },
    },
    currentIndicator: {
      control: 'inline-radio',
      options: ['neutral', 'neutral-strong', 'primary', 'secondary'],
      table: { defaultValue: { summary: "'neutral'" } },
    },
    shape: {
      control: 'inline-radio',
      options: ['square', 'circle'],
      table: { defaultValue: { summary: "'square'" } },
    },
    showOutline: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    narrowDisplay: {
      control: 'inline-radio',
      options: ['summary', 'pages'],
      table: { defaultValue: { summary: "'summary'" } },
    },
    ellipsisMenu: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    showPageInput: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    accessibleName: { control: 'text', table: { defaultValue: { summary: "'ページ送り'" } } },
    prevLabel: { control: 'text', table: { defaultValue: { summary: "'前へ'" } } },
    nextLabel: { control: 'text', table: { defaultValue: { summary: "'次へ'" } } },
    ellipsisName: { control: 'text', table: { defaultValue: { summary: "'間のページ'" } } },
    pageInputName: { control: 'text', table: { defaultValue: { summary: "'ページ番号'" } } },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  parameters: {
    docs: {
      source: sourceCode(`
        <Pagination page={5} count={10} href={(page) => \`/blog/page/\${page}\`} />
      `),
    },
  },
  render: (args) => frame(<Pagination {...args} />),
};

// 状態（原則3）。hover・押下・フォーカスは番号の 4 にだけ当て、いまのページ（5）と並べて見る
export const States: Story = {
  tags: ['visual'],
  name: '状態',
  parameters: {
    pseudo: statePseudo({
      hover: '[data-kind="page"][aria-label="4 ページ目"]',
      active: '[data-kind="page"][aria-label="4 ページ目"]',
      focusVisible: '[data-kind="page"][aria-label="4 ページ目"]',
    }),
    docs: {
      description: {
        story:
          '番号と前へ・次へは、面を持たない押すものです。hover で文字の色を淡く敷き、押すと濃くして沈みます。いまのページはグレーの塗りと太字です。',
      },
    },
  },
  render: (args) => (
    <div className="flex max-w-[40rem] flex-col gap-6">
      {stateRows.map((row) => (
        <Specimen key={row.label} label={row.label}>
          <div data-preview={row.state}>
            <Pagination {...args} />
          </div>
        </Specimen>
      ))}
    </div>
  ),
};

const indicators = ['neutral', 'neutral-strong', 'primary', 'secondary'] as const;
const shapes = ['square', 'circle'] as const;
const target = '[data-kind="page"][aria-label="4 ページ目"]';
const currentPage = '[data-kind="page"][aria-current="page"]';

// いまのページの印の種類。hover はいまのページ（5）、フォーカスは隣の番号（4）に当てる
export const CurrentIndicators: Story = {
  tags: ['visual'],
  name: 'いまのページの印',
  parameters: {
    pseudo: statePseudo({ hover: currentPage, focusVisible: target }),
    // secondary を足して縦に長くなった分、撮る枠を高くする（既定は 1200×900）
    viewport: {
      defaultViewport: 'tall',
      viewports: { tall: { name: 'tall', styles: { width: '1200px', height: '1250px' } } },
    },
    docs: {
      description: {
        story:
          '`currentIndicator` でいまのページの印を選びます。`neutral`（既定）はグレーの塗り、`neutral-strong` は濃いグレーの塗りに白い文字、`primary` は淡い青の塗りに青い文字、`secondary` は淡いピンクの塗りにピンクの文字です。',
      },
    },
  },
  render: (args) => (
    <div className="flex max-w-[40rem] flex-col gap-6">
      {indicators.map((indicator) =>
        (['通常', 'hover（5）', 'フォーカス（4）'] as const).map((label, i) => (
          <Specimen key={`${indicator}-${label}`} label={`${indicator}・${label}`}>
            <div data-preview={([undefined, 'hover', 'focus'] as const)[i]}>
              <Pagination {...args} currentIndicator={indicator} />
            </div>
          </Specimen>
        ))
      )}
    </div>
  ),
};

// 番号の形。hover・押下・フォーカスは隣の番号（4）に当てる
export const Shapes: Story = {
  tags: ['visual'],
  name: '形',
  parameters: {
    pseudo: statePseudo({ hover: target, active: target, focusVisible: target }),
    docs: {
      description: {
        story:
          '`shape` で番号と前へ・次への形を選びます。`square`（既定）はボタンと同じ角、`circle` は丸です。2 桁以上の番号と、文字の付いた前へ・次へは、両端の丸い形になります。',
      },
    },
  },
  render: (args) => (
    <div className="flex max-w-[40rem] flex-col gap-4">
      {shapes.map((shape) =>
        stateRows.map((row) => (
          <Specimen key={`${shape}-${row.label}`} label={`${shape}・${row.label}`}>
            <div data-preview={row.state}>
              <Pagination {...args} shape={shape} />
            </div>
          </Specimen>
        ))
      )}
      <Specimen label="circle・3 桁のページ（120 / 240）">
        <Pagination {...args} shape="circle" page={120} count={240} />
      </Specimen>
    </div>
  ),
};

// 枠線。hover・押下・フォーカスは隣の番号（4）に当てる
export const Outline: Story = {
  tags: ['visual'],
  name: '枠線',
  args: { showOutline: true },
  parameters: {
    pseudo: statePseudo({ hover: target, active: target, focusVisible: target }),
    docs: {
      description: {
        story:
          '`showOutline` を付けると、番号と前へ・次へに細い枠線を引き、押せる範囲をふだんから見せます。',
      },
    },
  },
  render: (args) => (
    <div className="flex max-w-[40rem] flex-col gap-4">
      {stateRows.map((row) => (
        <Specimen key={row.label} label={row.label}>
          <div data-preview={row.state}>
            <Pagination {...args} />
          </div>
        </Specimen>
      ))}
      <Specimen label="最初のページ（1 / 10）">
        <Pagination {...args} page={1} />
      </Specimen>
      <Specimen label="3 桁のページ（120 / 240）">
        <Pagination {...args} page={120} count={240} />
      </Specimen>
    </div>
  ),
};

// 端のページと、ページが少ないとき
export const Ends: Story = {
  tags: ['visual'],
  name: '端のページ',
  parameters: {
    docs: {
      description: {
        story:
          '最初のページでは前へ、最後のページでは次へが押せない見た目になります。ページが少ないときは、省略せずに全部の番号を並べます。',
      },
    },
  },
  render: (args) => (
    <div className="flex max-w-[40rem] flex-col gap-6">
      <Specimen label="最初のページ（1 / 10）">
        <Pagination {...args} page={1} />
      </Specimen>
      <Specimen label="最後のページ（10 / 10）">
        <Pagination {...args} page={10} />
      </Specimen>
      <Specimen label="ページが少ないとき（2 / 5）">
        <Pagination {...args} page={2} count={5} />
      </Specimen>
      <Specimen label="3 桁のページ（120 / 240）">
        <Pagination {...args} page={120} count={240} />
      </Specimen>
    </div>
  ),
};

// 置いた場所の幅で、番号の数と前へ・次への文字を変える（原則16: 構造は置いた場所の幅で決める）
const widthLabels: [width: number, note: string][] = [
  [560, '32rem 以上: 番号と、文字の付いた前へ・次へ'],
  [480, '32rem 未満: 前へ・次へを矢印だけに'],
  [400, '28rem 未満: いまのページの左右の番号を省く'],
  [320, '24rem 未満: 番号をやめて「5 / 10」だけに'],
];

export const Narrow: Story = {
  tags: ['visual'],
  name: '狭いとき',
  parameters: {
    docs: {
      description: {
        story:
          '置いた場所が狭いと、前へ・次へを矢印だけにし、さらに狭いと、いまのページの左右の番号を省き、いちばん狭いところでは番号をやめて「5 / 10」だけにします。画面の幅ではなく、置いた場所の幅で決めます。',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col items-start gap-8">
      {widthLabels.map(([width, note]) => (
        <Specimen key={width} label={`幅 ${width}px — ${note}`}>
          <div className="border border-dashed border-line" style={{ width }}>
            <Pagination {...args} />
          </div>
        </Specimen>
      ))}
    </div>
  ),
};

// いちばん狭いところの選び方（narrowDisplay・showPageInput・ellipsisMenu）
export const NarrowOptions: Story = {
  tags: ['visual'],
  name: 'いちばん狭いときの選び方',
  parameters: {
    docs: {
      description: {
        story:
          'いちばん狭いところ（24rem 未満）では、`narrowDisplay="summary"`（既定）が「5 / 10」だけを出します。番号が並ばない分、押せる場所が減るので、`showPageInput` で数を打って移るか、`narrowDisplay="pages"` と `ellipsisMenu` で番号と間のページを残します。',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col items-start gap-8">
      {(
        [
          ['summary（既定）', {}],
          ['summary・showPageInput', { showPageInput: true }],
          ['pages', { narrowDisplay: 'pages' as const }],
          ['pages・ellipsisMenu', { narrowDisplay: 'pages' as const, ellipsisMenu: true }],
        ] as const
      ).map(([label, extra]) => (
        <Specimen key={label} label={`幅 320px・${label}`}>
          <div className="border border-dashed border-line" style={{ width: 320 }}>
            <Pagination {...args} {...extra} />
          </div>
        </Specimen>
      ))}
      <Specimen label="幅 560px・ellipsisMenu（省略が押せる大きさになる）">
        <div className="border border-dashed border-line" style={{ width: 560 }}>
          <Pagination {...args} ellipsisMenu />
        </div>
      </Specimen>
    </div>
  ),
};

function PageInputExample(props: { onPageChange: (page: number) => void }) {
  const [page, setPage] = useState(5);
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-body-sm text-fg-muted">いまのページ: {page}</p>
      <div className="border border-dashed border-line" style={{ width: 320 }}>
        <Pagination
          page={page}
          count={20}
          showPageInput
          onPageChange={(next) => {
            setPage(next);
            props.onPageChange(next);
          }}
        />
      </div>
    </div>
  );
}

// 数を打って移る欄（showPageInput）
export const PageInput: Story = {
  name: 'ページ番号を打つ',
  args: { href: undefined, onPageChange: fn() },
  parameters: {
    docs: {
      description: {
        story:
          '`showPageInput` を付けると、いちばん狭いところの「5 / 20」の 5 が、数を打って移る欄になります。Enter か IME の確定で移ります。ページの数より大きい数や 0 以下では移らず、欄を離すと打った値はいまのページに戻ります。',
      },
      source: sourceCode(`
        const [page, setPage] = useState(5);
        <Pagination page={page} count={20} showPageInput onPageChange={setPage} />
      `),
    },
  },
  render: (args) => <PageInputExample onPageChange={args.onPageChange ?? (() => {})} />,
  play: async ({ canvas, args }) => {
    const input = canvas.getByRole('textbox', { name: 'ページ番号' });
    await expect(input).toHaveValue('5');
    // 範囲の中の数は、Enter で移る
    await userEvent.clear(input);
    await userEvent.type(input, '12{Enter}');
    await expect(args.onPageChange).toHaveBeenLastCalledWith(12);
    await expect(input).toHaveValue('12');
    // 範囲の外の数では移らず、欄を離すといまのページに戻る
    await userEvent.clear(input);
    await userEvent.type(input, '99{Enter}');
    await expect(args.onPageChange).toHaveBeenCalledTimes(1);
    await userEvent.tab();
    await expect(input).toHaveValue('12');
  },
};

// 省略（…）を押して間のページを選ぶ（ellipsisMenu）
export const EllipsisMenu: Story = {
  name: '省略のメニュー',
  args: { ellipsisMenu: true, count: 20, page: 10 },
  parameters: {
    docs: {
      description: {
        story:
          '`ellipsisMenu` を付けると、省略（…）が押せるボタンになり、間のページをメニューから選べます。押せるので、番号と同じ大きさ（指で押せる大きさ）になります。',
      },
    },
  },
  render: (args) => (
    <div className="border border-dashed border-line" style={{ width: 560 }}>
      <Pagination {...args} />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const triggers = canvas.getAllByRole('button', { name: '間のページ' });
    await expect(triggers).toHaveLength(2);
    await userEvent.click(triggers[0]);
    const menu = await body.findByRole('menu');
    // 最初の省略は 2〜8 ページを隠している
    await expect(within(menu).getByRole('menuitem', { name: '2 ページ目' })).toHaveAttribute(
      'href',
      '#page-2'
    );
    await expect(within(menu).getAllByRole('menuitem')).toHaveLength(7);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('menu')).toBeNull());
  },
};

export const Aligns: Story = {
  name: '寄せ方',
  parameters: {
    docs: {
      description: { story: '`align` で並びを左・中央（既定）・右に寄せます。' },
    },
  },
  render: (args) => (
    <div className="flex max-w-[40rem] flex-col gap-6">
      {(['start', 'center', 'end'] as const).map((align) => (
        <Specimen key={align} label={align}>
          <div className="border border-dashed border-line">
            <Pagination {...args} count={5} page={2} align={align} />
          </div>
        </Specimen>
      ))}
    </div>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  render: (args) => (
    <DensityPair>
      <div className="w-[36rem]">
        <Pagination {...args} />
      </div>
    </DensityPair>
  ),
};

function ButtonsExample(props: { onPageChange: (page: number) => void }) {
  const [page, setPage] = useState(1);
  return (
    <div className="flex max-w-[40rem] flex-col gap-3">
      <p className="text-body-sm text-fg-muted">いまのページ: {page}</p>
      <Pagination
        page={page}
        count={8}
        onPageChange={(next) => {
          setPage(next);
          props.onPageChange(next);
        }}
      />
    </div>
  );
}

// ボタンで使う（その場で一覧を差し替えるとき）
export const Buttons: Story = {
  name: 'ボタンで使う',
  args: { href: undefined, onPageChange: fn() },
  parameters: {
    docs: {
      description: {
        story:
          '`href`・`renderPage` を渡さずに `onPageChange` を渡すと、ボタンで描きます。押した番号を受け取って `page` を差し替えます。',
      },
      source: sourceCode(`
        const [page, setPage] = useState(1);
        <Pagination page={page} count={8} onPageChange={setPage} />
      `),
    },
  },
  render: (args) => <ButtonsExample onPageChange={args.onPageChange ?? (() => {})} />,
  play: async ({ canvas, args }) => {
    const prev = canvas.getByRole('button', { name: '前へ' });
    await expect(prev).toBeDisabled();
    await expect(canvas.getByRole('button', { name: '1 ページ目' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    await userEvent.click(canvas.getByRole('button', { name: '次へ' }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(2);
    await expect(canvas.getByRole('button', { name: '2 ページ目' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    // いまのページを押しても呼ばない
    await userEvent.click(canvas.getByRole('button', { name: '2 ページ目' }));
    await expect(args.onPageChange).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('button', { name: '8 ページ目' }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(8);
    await expect(canvas.getByRole('button', { name: '次へ' })).toBeDisabled();
  },
};

// 読み上げ: 並びの名前、いまのページ、行き先、押せない前へ
export const Accessibility: Story = {
  name: '読み上げ',
  args: { page: 1 },
  render: (args) => frame(<Pagination {...args} />),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('navigation', { name: 'ページ送り' })).toBeVisible();
    const current = canvas.getByRole('link', { name: '1 ページ目' });
    await expect(current).toHaveAttribute('aria-current', 'page');
    await expect(canvas.getByRole('link', { name: '3 ページ目' })).toHaveAttribute(
      'href',
      '#page-3'
    );
    // 最初のページの前へは、href のない押せないリンク
    const prev = canvas.getByRole('link', { name: '前へ' });
    await expect(prev).toHaveAttribute('aria-disabled', 'true');
    await expect(prev).not.toHaveAttribute('href');
    await expect(canvas.getByRole('link', { name: '次へ' })).toHaveAttribute('href', '#page-2');
  },
};
