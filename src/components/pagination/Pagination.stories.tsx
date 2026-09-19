import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
import { expect, fn, userEvent } from 'storybook/test';

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
          '- リンクにするときは、`href` に番号から行き先を作る関数を渡します。Next.js の `Link` などは `render={(page) => <NextLink href={…} />}` で渡します。',
          '- ボタンにするときは、`href`・`render` を渡さずに `onChange` を渡します。押した番号を受け取って、`page` を差し替えます。',
          '- いまのページは `aria-current="page"` で読み上げます。',
          '- いまのページの印は `currentIndicator` で選びます。`neutral`（既定）はグレーの塗り、`neutral-strong` は濃いグレーの塗りに白い文字、`primary` は淡い青の塗りに青い文字です。どれも文字は太字です。ふだんは `neutral` にし、いまの位置を強く見せたいときは `neutral-strong`、サイトの色を出したいときは `primary` にします。Navbar の `currentIndicator` とそろえると、行き先の並びどうしで印がそろいます。',
          '- 番号と前へ・次への形は `shape` で選びます。`square`（既定）はボタンと同じ角、`round` は丸です。Navbar の行き先と並べるときは `round` にすると形がそろいます。',
          '- `outline` を付けると、番号ごとに細い枠線を引き、押せる範囲をふだんから見せます。',
          '- 端のページでは、前へ・次へは押せない見た目で残ります。並びの位置は動きません。',
          '- どのページにいても番号の数は同じです。ページを送っても、前へ・次へのボタンの位置が変わりません。',
          '- `siblings`（既定 1）はいまのページの左右に出す番号の数、`boundaries`（既定 1）は両端に出す番号の数です。',
          '- 置いた場所の幅が狭いときは、いまのページの左右の番号を省き、前へ・次へを矢印だけにします。画面の幅ではなく、置いた場所の幅で決めます。',
          '- `label` は並び（`nav`）の読み上げの名前です（既定は「ページ送り」）。`prevLabel`・`nextLabel`・`pageLabel` で文言を差し替えられます。',
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
    outline: false,
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
      options: ['neutral', 'neutral-strong', 'primary'],
      table: { defaultValue: { summary: "'neutral'" } },
    },
    shape: {
      control: 'inline-radio',
      options: ['square', 'round'],
      table: { defaultValue: { summary: "'square'" } },
    },
    outline: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    label: { control: 'text', table: { defaultValue: { summary: "'ページ送り'" } } },
    prevLabel: { control: 'text', table: { defaultValue: { summary: "'前へ'" } } },
    nextLabel: { control: 'text', table: { defaultValue: { summary: "'次へ'" } } },
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

const indicators = ['neutral', 'neutral-strong', 'primary'] as const;
const shapes = ['square', 'round'] as const;
const target = '[data-kind="page"][aria-label="4 ページ目"]';
const currentPage = '[data-kind="page"][aria-current="page"]';

// いまのページの印の種類。hover はいまのページ（5）、フォーカスは隣の番号（4）に当てる
export const CurrentIndicators: Story = {
  tags: ['visual'],
  name: 'いまのページの印',
  parameters: {
    pseudo: statePseudo({ hover: currentPage, focusVisible: target }),
    docs: {
      description: {
        story:
          '`currentIndicator` でいまのページの印を選びます。`neutral`（既定）はグレーの塗り、`neutral-strong` は濃いグレーの塗りに白い文字、`primary` は淡い青の塗りに青い文字です。',
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
          '`shape` で番号と前へ・次への形を選びます。`square`（既定）はボタンと同じ角、`round` は丸です。2 桁以上の番号と、文字の付いた前へ・次へは、両端の丸い形になります。',
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
      <Specimen label="round・3 桁のページ（120 / 240）">
        <Pagination {...args} shape="round" page={120} count={240} />
      </Specimen>
    </div>
  ),
};

// 枠線。hover・押下・フォーカスは隣の番号（4）に当てる
export const Outline: Story = {
  tags: ['visual'],
  name: '枠線',
  args: { outline: true },
  parameters: {
    pseudo: statePseudo({ hover: target, active: target, focusVisible: target }),
    docs: {
      description: {
        story:
          '`outline` を付けると、番号と前へ・次へに細い枠線を引き、押せる範囲をふだんから見せます。',
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
export const Narrow: Story = {
  tags: ['visual'],
  name: '狭いとき',
  parameters: {
    docs: {
      description: {
        story:
          '置いた場所が狭いと、前へ・次へを矢印だけにし、さらに狭いと、いまのページの左右の番号を省きます。画面の幅ではなく、置いた場所の幅で決めます。',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col items-start gap-8">
      {[560, 480, 320].map((width) => (
        <Specimen key={width} label={`幅 ${width}px`}>
          <div className="border border-dashed border-line" style={{ width }}>
            <Pagination {...args} />
          </div>
        </Specimen>
      ))}
    </div>
  ),
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

function ButtonsExample(props: { onChange: (page: number) => void }) {
  const [page, setPage] = useState(1);
  return (
    <div className="flex max-w-[40rem] flex-col gap-3">
      <p className="text-body-sm text-fg-muted">いまのページ: {page}</p>
      <Pagination
        page={page}
        count={8}
        onChange={(next) => {
          setPage(next);
          props.onChange(next);
        }}
      />
    </div>
  );
}

// ボタンで使う（その場で一覧を差し替えるとき）
export const Buttons: Story = {
  name: 'ボタンで使う',
  args: { href: undefined, onChange: fn() },
  parameters: {
    docs: {
      description: {
        story:
          '`href`・`render` を渡さずに `onChange` を渡すと、ボタンで描きます。押した番号を受け取って `page` を差し替えます。',
      },
      source: sourceCode(`
        const [page, setPage] = useState(1);
        <Pagination page={page} count={8} onChange={setPage} />
      `),
    },
  },
  render: (args) => <ButtonsExample onChange={args.onChange ?? (() => {})} />,
  play: async ({ canvas, args }) => {
    const prev = canvas.getByRole('button', { name: '前へ' });
    await expect(prev).toBeDisabled();
    await expect(canvas.getByRole('button', { name: '1 ページ目' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    await userEvent.click(canvas.getByRole('button', { name: '次へ' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(2);
    await expect(canvas.getByRole('button', { name: '2 ページ目' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    // いまのページを押しても呼ばない
    await userEvent.click(canvas.getByRole('button', { name: '2 ページ目' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('button', { name: '8 ページ目' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(8);
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
