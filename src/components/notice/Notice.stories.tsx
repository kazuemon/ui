import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
// 引数の userEvent は、LAN の IP で開いたとき（clipboard のない環境）は空になり、click などが呼べない
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from '../button/Button';
import { Link } from '../link/Link';
import { Notice, type NoticeAppearance, type NoticeColor, type NoticeProps } from './Notice';
import { NoticeRegion } from './NoticeRegion';
import { Gallery, Matrix, Specimen } from '../../stories/story-parts';
import { sourceCode } from '../../stories/story-states';

const colors: NoticeColor[] = ['info', 'success', 'warning', 'danger'];
const appearances: NoticeAppearance[] = ['soft', 'filled', 'outline'];

const samples: Record<NoticeColor, { title: string; body: string }> = {
  info: { title: 'メンテナンスのお知らせ', body: '9月20日 2:00〜4:00 は、サービスを使えません。' },
  success: { title: '保存しました', body: '変更は、すぐにプロフィールに反映されます。' },
  warning: {
    title: '保存していない変更があります',
    body: 'このページを離れると、変更が消えます。',
  },
  danger: {
    title: '保存できませんでした',
    body: '通信が切れた可能性があります。時間をおいて、もう一度お試しください。',
  },
};

// 部品にせず要素のまま置く。Show code に中身（Button と Link）が出る
const sampleActions = (
  <>
    <Button color="white">もう一度試す</Button>
    <Link href="#detail">くわしく見る</Link>
  </>
);

// ストーリーの中だけの引数。actions と onClose を、パネルのスイッチで付け外しする
type NoticeStoryArgs = NoticeProps & { showActions: boolean; closable: boolean };

const meta = {
  title: 'Components/Notice',
  component: Notice,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '情報・成功・警告・危険を知らせる帯です。お知らせそのものは押せず、押せるのは中の操作だけです。',
          '',
          '- `color` は状態の色（`info`・`success`・`warning`・`danger`）から選びます。利用者が選ぶ `primary`・`secondary`・`neutral` は持ちません。',
          '- 題・本文・操作は読み上げの箱に入ります。`info`・`success`・`warning` は `role="status"`（区切りを待って読む）、`danger` は `role="alert"`（割り込んで読む）です。',
          '- `appearance` は見た目です。`soft`（既定）は淡い面、`filled` は濃い塗り、`outline` は白い面に状態の色の枠線です。',
          '- 操作は `actions` に、白いボタン（`<Button color="white">`）か文字のリンク（`<Link>`）を置きます。リンクはお知らせの文字の色の太字になります。',
          '- `onClose` を渡すと、右上に閉じるボタン（×）が出ます。読み上げの名前は `closeLabel`（既定は「閉じる」）で、題があるときは「閉じる 題」と読みます。',
          '- 操作のあとで出すお知らせは、`NoticeRegion` の中に入れます。ページを開いたときからあるお知らせは、領域に入れずに置きます。',
        ].join('\n'),
      },
      // Show code: 引数を使わない render も、Storybook が作るコード（dynamic）を出す。既定では story の定義がそのまま出る
      source: { type: 'dynamic' },
    },
  },
  args: {
    color: 'info',
    appearance: 'soft',
    title: samples.info.title,
    children: samples.info.body,
    live: true,
    showActions: false,
    closable: false,
    onClose: fn(),
  },
  argTypes: {
    color: { control: 'inline-radio', options: colors },
    appearance: { control: 'inline-radio', options: appearances },
    title: { control: 'text' },
    children: { control: 'text' },
    live: { control: 'boolean' },
    showActions: {
      control: 'boolean',
      description: 'ストーリー用: 操作（`actions`）を置く',
      table: { category: 'ストーリー' },
    },
    closable: {
      control: 'boolean',
      description: 'ストーリー用: `onClose` を渡して × を出す',
      table: { category: 'ストーリー' },
    },
    actions: { control: false },
    onClose: { control: false },
  },
  render: ({ showActions, closable, onClose, ...args }) => (
    <Notice
      {...args}
      actions={showActions ? sampleActions : undefined}
      onClose={closable ? onClose : undefined}
    />
  ),
} satisfies Meta<NoticeStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
};

// Show code: 表（Matrix）の中身は出ないので、代表の使い方を source.code に手で書く
export const ColorsAndAppearances: Story = {
  tags: ['visual'],
  name: '色と見た目',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '行が色（`color`）、列が見た目（`appearance`）です。`filled` の警告だけは、黄色の塗りに濃い文字です。',
      },
      source: sourceCode(`
        {/* color: info・success・warning・danger / appearance: soft（既定）・filled・outline */}
        <Notice color="info" title="メンテナンスのお知らせ">
          9月20日 2:00〜4:00 は、サービスを使えません。
        </Notice>
        <Notice
          color="danger"
          appearance="filled"
          title="保存できませんでした"
          actions={
            <>
              <Button color="white">もう一度試す</Button>
              <Link href="#detail">くわしく見る</Link>
            </>
          }
        >
          通信が切れた可能性があります。時間をおいて、もう一度お試しください。
        </Notice>
        <Notice color="success" appearance="outline" title="保存しました" />
      `),
    },
  },
  render: () => (
    <Matrix
      rows={colors}
      rowLabel={(color) => color}
      columns={appearances.map((appearance) => ({ label: appearance, appearance }))}
      columnWidth="20rem"
      renderCell={(color, { appearance }) => (
        <Notice
          color={color}
          appearance={appearance}
          title={samples[color].title}
          actions={sampleActions}
        >
          {samples[color].body}
        </Notice>
      )}
    />
  ),
};

// Show code: Storybook が作るコード（dynamic）。actions は要素のまま渡し、中身が出るようにする
export const WithClose: Story = {
  name: '操作と閉じるボタン',
  args: {
    color: 'danger',
    title: samples.danger.title,
    children: samples.danger.body,
    showActions: true,
    closable: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '× は読み上げの箱の外に置きます。読み上げの名前は、題を続けた「閉じる 保存できませんでした」です。閉じたあとに消すのは呼び出し側です。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '閉じる 保存できませんでした' }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const TextOnly: Story = {
  name: '題だけ・本文だけ',
  parameters: { controls: { include: ['appearance'] } },
  render: ({ appearance }) => (
    <Gallery columnWidth="20rem">
      <Specimen label="題だけ">
        <Notice color="success" appearance={appearance} title={samples.success.title} />
      </Specimen>
      <Specimen label="本文だけ">
        <Notice color="info" appearance={appearance}>
          {samples.info.body}
        </Notice>
      </Specimen>
    </Gallery>
  ),
};

export const CloseLabel: Story = {
  name: '閉じるボタンの読み上げ',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '× の読み上げの名前は `closeLabel` で変えられます（既定は「閉じる」）。題があるときは名前のあとに題が続き、「閉じる メンテナンスのお知らせ」と読みます。題がないときは名前だけです。',
      },
    },
  },
  render: ({ onClose }) => (
    <Gallery columnWidth="20rem">
      <Specimen label="題あり（既定）">
        <Notice color="info" title={samples.info.title} onClose={onClose}>
          {samples.info.body}
        </Notice>
      </Specimen>
      <Specimen label='closeLabel="非表示にする"・題なし'>
        <Notice color="success" closeLabel="非表示にする" onClose={onClose}>
          {samples.success.body}
        </Notice>
      </Specimen>
    </Gallery>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: '閉じる メンテナンスのお知らせ' })
    ).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: '非表示にする' })).toBeInTheDocument();
  },
};

// 操作のあとでお知らせを出す例。領域は最初から置き、お知らせだけを出し入れする
function RegionExample() {
  const [saved, setSaved] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setSaved(true)}>保存する</Button>
        <Button onClick={() => setFailed(true)}>保存に失敗させる</Button>
      </div>
      <NoticeRegion>
        {saved && (
          <Notice color="success" title={samples.success.title} onClose={() => setSaved(false)}>
            {samples.success.body}
          </Notice>
        )}
        {failed && (
          <Notice color="danger" title={samples.danger.title} onClose={() => setFailed(false)}>
            {samples.danger.body}
          </Notice>
        )}
      </NoticeRegion>
    </div>
  );
}

// Show code: 状態を持ち、ハンドラーが要の例なので、写して使える部品の形を source.code に手で書く
export const InRegion: Story = {
  name: 'あとから出すお知らせ',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: [
          '操作のあとで出すお知らせは、`NoticeRegion` の中に入れます。領域はページを開いたときから置いておき、お知らせだけを出し入れします。',
          '領域には、最初から空の読み上げの箱（危険のための `role="alert"` と、ほかのための `role="status"`）があり、中のお知らせはその箱の中に描かれます。お知らせ自身は箱を出しません。危険のお知らせが上に来ます。',
          'ページを開いたときからあるお知らせは、領域に入れずにそのまま置きます。',
        ].join('\n\n'),
      },
      source: sourceCode(`
        function RegionExample() {
          const [saved, setSaved] = useState(false);
          const [failed, setFailed] = useState(false);
          return (
            <div className="flex max-w-xl flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setSaved(true)}>保存する</Button>
                <Button onClick={() => setFailed(true)}>保存に失敗させる</Button>
              </div>
              {/* 領域は最初から置き、お知らせだけを出し入れする */}
              <NoticeRegion>
                {saved && (
                  <Notice color="success" title="保存しました" onClose={() => setSaved(false)}>
                    変更は、すぐにプロフィールに反映されます。
                  </Notice>
                )}
                {failed && (
                  <Notice color="danger" title="保存できませんでした" onClose={() => setFailed(false)}>
                    通信が切れた可能性があります。時間をおいて、もう一度お試しください。
                  </Notice>
                )}
              </NoticeRegion>
            </div>
          );
        }
      `),
    },
  },
  render: () => <RegionExample />,
  play: async ({ canvas }) => {
    const alertBox = canvas.getByRole('alert');
    const statusBox = canvas.getByRole('status');
    await expect(alertBox).toBeEmptyDOMElement();
    await expect(statusBox).toBeEmptyDOMElement();

    await userEvent.click(canvas.getByRole('button', { name: '保存する' }));
    await expect(within(statusBox).getByText(samples.success.title)).toBeInTheDocument();
    // お知らせ自身は role の箱を出さない（二重に読まない）
    await expect(canvas.getAllByRole('status')).toHaveLength(1);

    await userEvent.click(canvas.getByRole('button', { name: '保存に失敗させる' }));
    await expect(within(alertBox).getByText(samples.danger.title)).toBeInTheDocument();
    await expect(canvas.getAllByRole('alert')).toHaveLength(1);

    await userEvent.click(canvas.getByRole('button', { name: `閉じる ${samples.danger.title}` }));
    await expect(alertBox).toBeEmptyDOMElement();
  },
};
