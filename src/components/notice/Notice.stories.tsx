import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
// 引数の userEvent は、LAN の IP で開いたとき（clipboard のない環境）は空になり、click などが呼べない
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button/Button';
import { Link } from '../link/Link';
import { Notice, type NoticeProps, type NoticeStatus, type NoticeVariant } from './Notice';
import { NoticeRegion } from './NoticeRegion';
import { Gallery, Matrix, Specimen } from '../../stories/story-parts';
import { sourceCode } from '../../stories/story-states';

// 状態を書かないとき（色を持たないグレー）は neutral として並べる
type NoticeSample = NoticeStatus | 'neutral';
const statuses: NoticeStatus[] = ['info', 'success', 'warning', 'danger'];
const variants: NoticeVariant[] = ['soft', 'filled', 'outline'];
const allVariants: NoticeVariant[] = [...variants, 'muted'];

const samples: Record<NoticeSample, { title: string; body: string }> = {
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
  neutral: { title: 'メモ', body: 'タブレットとマウスでは、浮かぶ選択肢のままです。' },
};

// 部品にせず要素のまま置く。Show code に中身（Button と Link）が出る
const sampleActions = (
  <>
    <Button color="white">もう一度試す</Button>
    <Link href="#detail">くわしく見る</Link>
  </>
);

// ストーリーの中だけの引数。actions と onClosed を、パネルのスイッチで付け外しする
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
          '- `status` は状態の色（`info`・`success`・`warning`・`danger`）です。書かないと、色を持たないグレーになります。利用者が選ぶ `primary`・`secondary` は持ちません。',
          '- 題・本文・操作は読み上げの箱に入ります。`danger` は `role="alert"`（割り込んで読む）、ほかは `role="status"`（区切りを待って読む）です。',
          '- `variant` は見た目です。`soft`（既定）は淡い面、`filled` は濃い塗り、`outline` は白い面に状態の色の枠線、`muted` はグレーの面に状態の色の小さな題です。',
          '- アイコンは状態の色ごとに付きます（`neutral` と `muted` ではなし）。`icon` にほかのアイコンを渡すと置き換わり、`icon={false}` で消えます。',
          '- 記事の中にはじめからある補足や注意には、読み上げで知らせない `Callout` を使います。',
          '- 操作は `actions` に、白いボタン（`<Button color="white">`）か文字のリンク（`<Link>`）を置きます。リンクはお知らせの文字の色の太字になります。',
          '- `onClosed` を渡すと、右上に閉じるボタン（×）が出ます。読み上げの名前は `closeName`（既定は「閉じる」）で、題があるときは「閉じる 題」と読みます。',
          '- × で閉じてお知らせが消えると、フォーカスはその次にあるフォーカスできるものへ移ります。なければ前のもの、それもなければ `NoticeRegion` そのものです。',
          '- 操作のあとで出すお知らせは、`NoticeRegion` の中に入れます。ページを開いたときからあるお知らせは、領域に入れずに置きます。',
        ].join('\n'),
      },
      // Show code: 引数を使わない render も、Storybook が作るコード（dynamic）を出す。既定では story の定義がそのまま出る
      source: { type: 'dynamic' },
    },
  },
  args: {
    status: 'info',
    variant: 'soft',
    title: samples.info.title,
    children: samples.info.body,
    live: true,
    showActions: false,
    closable: false,
    onClosed: fn(),
  },
  argTypes: {
    status: { control: 'inline-radio', options: statuses },
    variant: { control: 'inline-radio', options: allVariants },
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
      description: 'ストーリー用: `onClosed` を渡して × を出す',
      table: { category: 'ストーリー' },
    },
    actions: { control: false },
    onClosed: { control: false },
  },
  render: ({ showActions, closable, onClosed, ...args }) => (
    <Notice
      {...args}
      actions={showActions ? sampleActions : undefined}
      onClosed={closable ? onClosed : undefined}
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
          '行が状態（`status`）、列が見た目（`variant`）です。`filled` の警告だけは、黄色の塗りに濃い文字です。',
      },
      source: sourceCode(`
        {/* status: info・success・warning・danger / variant: soft（既定）・filled・outline */}
        <Notice status="info" title="メンテナンスのお知らせ">
          9月20日 2:00〜4:00 は、サービスを使えません。
        </Notice>
        <Notice
          status="danger"
          variant="filled"
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
        <Notice status="success" variant="outline" title="保存しました" />
      `),
    },
  },
  render: () => (
    <Matrix
      rows={statuses}
      rowLabel={(status) => status}
      columns={variants.map((variant) => ({ label: variant, variant }))}
      columnWidth="20rem"
      renderCell={(status, { variant }) => (
        <Notice
          status={status}
          variant={variant}
          title={samples[status].title}
          actions={sampleActions}
        >
          {samples[status].body}
        </Notice>
      )}
    />
  ),
};

export const MutedAndNeutral: Story = {
  tags: ['visual'],
  name: 'グレーの面と色なし',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '左が `muted`（グレーの面に状態の色の小さな題）、右が状態を書かないとき（色を持たないグレー）の各見た目です。どちらも既定ではアイコンを出しません。',
      },
      source: sourceCode(`
        <Notice status="warning" variant="muted" title="保存していない変更があります">
          このページを離れると、変更が消えます。
        </Notice>
        <Notice title="メモ">
          タブレットとマウスでは、浮かぶ選択肢のままです。
        </Notice>
      `),
    },
  },
  render: () => (
    <div className="flex flex-wrap items-start gap-8">
      <div className="flex w-[20rem] flex-col gap-3">
        {statuses.map((status) => (
          <Notice key={status} status={status} variant="muted" title={samples[status].title}>
            {samples[status].body}
          </Notice>
        ))}
      </div>
      <div className="flex w-[20rem] flex-col gap-3">
        {allVariants.map((variant) => (
          <Notice key={variant} variant={variant} title={samples.neutral.title}>
            {samples.neutral.body}
          </Notice>
        ))}
      </div>
    </div>
  ),
};

export const Icons: Story = {
  tags: ['visual'],
  name: 'アイコン',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`icon={false}` でアイコンを消すと、文が左端から始まります。`muted` と、状態を書かないときは、既定でアイコンを出しません。',
      },
      source: sourceCode(`
        <Notice status="info" icon={false} title="メンテナンスのお知らせ">
          9月20日 2:00〜4:00 は、サービスを使えません。
        </Notice>
      `),
    },
  },
  render: () => (
    <Gallery columnWidth="20rem">
      <Specimen label="icon なし">
        <Notice status="info" icon={false} title={samples.info.title}>
          {samples.info.body}
        </Notice>
      </Specimen>
      <Specimen label="既定（アイコンあり）">
        <Notice status="info" title={samples.info.title}>
          {samples.info.body}
        </Notice>
      </Specimen>
    </Gallery>
  ),
};

// Show code: Storybook が作るコード（dynamic）。actions は要素のまま渡し、中身が出るようにする
export const WithClose: Story = {
  name: '操作と閉じるボタン',
  args: {
    status: 'danger',
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
    await expect(args.onClosed).toHaveBeenCalledOnce();
  },
};

export const TextOnly: Story = {
  name: '題だけ・本文だけ',
  parameters: { controls: { include: ['variant'] } },
  render: ({ variant }) => (
    <Gallery columnWidth="20rem">
      <Specimen label="題だけ">
        <Notice status="success" variant={variant} title={samples.success.title} />
      </Specimen>
      <Specimen label="本文だけ">
        <Notice status="info" variant={variant}>
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
          '× の読み上げの名前は `closeName` で変えられます（既定は「閉じる」）。題があるときは名前のあとに題が続き、「閉じる メンテナンスのお知らせ」と読みます。題がないときは名前だけです。',
      },
    },
  },
  render: ({ onClosed }) => (
    <Gallery columnWidth="20rem">
      <Specimen label="題あり（既定）">
        <Notice status="info" title={samples.info.title} onClosed={onClosed}>
          {samples.info.body}
        </Notice>
      </Specimen>
      <Specimen label='closeName="非表示にする"・題なし'>
        <Notice status="success" closeName="非表示にする" onClosed={onClosed}>
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

// × で閉じたあとのフォーカスの例。閉じると、お知らせの次にあるボタンへ移る
function CloseFocusExample() {
  const [shown, setShown] = useState(true);
  return (
    <div className="flex max-w-xl flex-col items-start gap-4">
      <Button variant="outline">前のボタン</Button>
      {shown && (
        <Notice status="info" title={samples.info.title} onClosed={() => setShown(false)}>
          {samples.info.body}
        </Notice>
      )}
      <Button variant="outline">次のボタン</Button>
    </div>
  );
}

export const CloseFocus: Story = {
  name: '閉じたあとのフォーカス',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: [
          '× で閉じてお知らせが消えると、フォーカスはその次にあるフォーカスできるものへ移ります。',
          'なければ前のもの、それもなければ `NoticeRegion` そのものです。閉じてもお知らせを残すときは、フォーカスは × のままです。',
        ].join('\n\n'),
      },
      source: sourceCode(`
        function CloseFocusExample() {
          const [shown, setShown] = useState(true);
          return (
            <div className="flex max-w-xl flex-col items-start gap-4">
              <Button variant="outline">前のボタン</Button>
              {shown && (
                <Notice status="info" title="メンテナンスのお知らせ" onClosed={() => setShown(false)}>
                  9月20日 2:00〜4:00 は、サービスを使えません。
                </Notice>
              )}
              <Button variant="outline">次のボタン</Button>
            </div>
          );
        }
      `),
    },
  },
  render: () => <CloseFocusExample />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: `閉じる ${samples.info.title}` }));
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: '次のボタン' })).toHaveFocus();
    });
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
          <Notice status="success" title={samples.success.title} onClosed={() => setSaved(false)}>
            {samples.success.body}
          </Notice>
        )}
        {failed && (
          <Notice status="danger" title={samples.danger.title} onClosed={() => setFailed(false)}>
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
                  <Notice status="success" title="保存しました" onClosed={() => setSaved(false)}>
                    変更は、すぐにプロフィールに反映されます。
                  </Notice>
                )}
                {failed && (
                  <Notice status="danger" title="保存できませんでした" onClosed={() => setFailed(false)}>
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
    // 閉じたあとのフォーカスは、次にあるフォーカスできるもの（残っているお知らせの ×）へ移る
    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: `閉じる ${samples.success.title}` })
      ).toHaveFocus();
    });
  },
};
