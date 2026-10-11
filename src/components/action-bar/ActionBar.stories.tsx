import { CopyIcon, DownloadSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ActionBar, ActionBarButton } from './ActionBar';
import { SelectableListScene } from './story-scenes';
import { Icon } from '../icon/Icon';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';
import { statePseudo } from '../../stories/story-states';

const meta = {
  title: 'Components/ActionBar',
  component: ActionBar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '一覧の項目を選んでいるあいだだけ、置いた場所の下に浮かぶ操作の帯です。件数の文と、選んだものへの操作を並べます。',
          '',
          '- 一覧のすぐ後ろ（一覧と同じ親の中）に置きます。一覧をスクロールしているあいだは置いた場所の下の端に貼り付き、一覧の終わりまでスクロールすると一覧の下に収まるので、最後の行が帯に隠れたままになりません。',
          '- `open` には「1 件以上選んでいるか」を渡し、`label` に件数の文（「2 件を選択中」）を渡します。件数の文は変わるたびに読み上げでも知らせます。',
          '- 面は `variant` で選びます。`surface`（既定）は白い面に影と細い輪郭、`neutral-strong` は濃いグレー、`primary-subtle` は淡い青、`primary` は青の面です。`primary` の上では危険の赤が読めないので、削除も白い文字になります。',
          '- 幅と寄せは `placement` で選びます。`full`（既定）は置いた場所の幅いっぱいで、件数を左、操作を右に置きます。`center` は中身の幅で真ん中に浮かべ、`docked` は浮かべずに下の端へ着けます。',
          '- 出入りの動きは `motion` で選びます。`fade-up`（既定）は 8px 下から浮かび、`slide` は下の端から滑り、`scale` は小さい姿から広がり、`none` は動かしません。',
          '- 操作は `ActionBarButton` で並べます。削除のような取り消せない操作は `status="danger"` にします。',
          '- `onClear` を渡すと、左に選択を外す × のボタンを置きます。帯の中にフォーカスがあるときは Esc でも外せます（`closeOnEscape`）。帯が消えると、帯に入る前にいた場所へフォーカスが戻ります。',
          '- 操作が入りきらないときは、後ろの操作から ⋮ のメニューに畳みます（`narrowDisplay="menu"`）。`icon-only` はまず文字を外してアイコンだけにし、`wrap` は件数の行と操作の行に分けます。',
          '- `center` でも、指で操作していて画面が狭いときは、左右の余白を残して幅いっぱいに広がります。',
          '',
          '表（DataTable）の上に検索などの帯があり、そこに件数と操作を並べられるときは、ActionBar を使わずに帯の右に並べます。ActionBar は、上に帯のない一覧（カードや行の一覧）や、長い一覧で上の帯がスクロールで見えなくなる画面で使います。',
        ].join('\n'),
      },
    },
  },
  args: {
    open: true,
    label: '2 件を選択中',
    variant: 'surface',
    placement: 'full',
    motion: 'fade-up',
    closeOnEscape: true,
    narrowDisplay: 'menu',
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['surface', 'neutral-strong', 'primary-subtle', 'primary'],
      table: { defaultValue: { summary: "'surface'" } },
    },
    placement: {
      control: 'inline-radio',
      options: ['full', 'center', 'docked'],
      table: { defaultValue: { summary: "'full'" } },
    },
    motion: {
      control: 'inline-radio',
      options: ['fade-up', 'slide', 'scale', 'none'],
      table: { defaultValue: { summary: "'fade-up'" } },
    },
    narrowDisplay: {
      control: 'inline-radio',
      options: ['menu', 'icon-only', 'wrap'],
      table: { defaultValue: { summary: "'menu'" } },
    },
    clearName: { table: { defaultValue: { summary: "'選択を外す'" } } },
    moreName: { table: { defaultValue: { summary: "'その他の操作'" } } },
    children: { control: false },
  },
} satisfies Meta<typeof ActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  parameters: {
    docs: {
      description: {
        story:
          '行を選ぶと帯が出ます。× か Esc で選択を外すと消え、削除を押すと選んだ行が消えます。',
      },
    },
  },
  render: (args) => (
    <SelectableListScene
      narrowDisplay={args.narrowDisplay}
      barProps={{ variant: args.variant, placement: args.placement, motion: args.motion }}
    />
  ),
};

// 見た目の一覧。帯を開いたまま、枠の下に置く
function Frame({
  children,
  width = 420,
  height = 120,
}: {
  children: React.ReactNode;
  width?: number;
  height?: number;
}) {
  return (
    <div
      className="relative flex flex-col justify-end overflow-hidden rounded-card border border-line bg-bg"
      style={{ width, height }}
    >
      {children}
    </div>
  );
}

const bar = (props: Partial<React.ComponentProps<typeof ActionBar>> = {}) => (
  <ActionBar open label="2 件を選択中" onClear={() => {}} {...props}>
    <ActionBarButton>複製</ActionBarButton>
    <ActionBarButton status="danger">削除</ActionBarButton>
  </ActionBar>
);

export const Looks: Story = {
  tags: ['visual'],
  name: '見た目',
  render: () => (
    <Gallery columnWidth="27rem">
      <Specimen label="既定">
        <Frame>{bar()}</Frame>
      </Specimen>
      <Specimen label="× なし">
        <Frame>{bar({ onClear: undefined })}</Frame>
      </Specimen>
      <Specimen label="アイコン付き・押せない操作">
        <Frame>
          <ActionBar open label="5 件を選択中" onClear={() => {}}>
            <ActionBarButton icon={<Icon icon={CopyIcon} />} disabled>
              複製
            </ActionBarButton>
            <ActionBarButton icon={<Icon icon={TrashIcon} />} status="danger">
              削除
            </ActionBarButton>
          </ActionBar>
        </Frame>
      </Specimen>
      <Specimen label="フォーカス（キーボード）">
        <div data-preview="focus">
          <Frame>{bar()}</Frame>
        </div>
      </Specimen>
    </Gallery>
  ),
  parameters: {
    pseudo: statePseudo({
      focusVisible:
        '[data-slot="action-bar"] [data-slot="toolbar-button"][aria-label="選択を外す"]',
    }),
  },
};

export const Variants: Story = {
  tags: ['visual'],
  name: '面',
  render: () => (
    <Gallery columnWidth="27rem">
      {(['surface', 'neutral-strong', 'primary-subtle', 'primary'] as const).map((variant) => (
        <Specimen key={variant} label={variant}>
          <Frame>
            <ActionBar open label="2 件を選択中" onClear={() => {}} variant={variant}>
              <ActionBarButton icon={<Icon icon={CopyIcon} />} disabled>
                複製
              </ActionBarButton>
              <ActionBarButton status="danger">削除</ActionBarButton>
            </ActionBar>
          </Frame>
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const Placements: Story = {
  tags: ['visual'],
  name: '幅と寄せ',
  render: () => (
    <Gallery columnWidth="34rem">
      {(['full', 'center', 'docked'] as const).map((placement) => (
        <Specimen key={placement} label={placement}>
          <Frame width={520}>{bar({ placement })}</Frame>
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const NarrowDisplays: Story = {
  tags: ['visual'],
  name: '入りきらないとき',
  render: () => (
    <Gallery columnWidth="27rem">
      {(['menu', 'icon-only', 'wrap'] as const).map((narrowDisplay) => (
        <Specimen key={narrowDisplay} label={narrowDisplay}>
          <Frame width={380} height={220}>
            <ActionBar open label="12 件を選択中" onClear={() => {}} narrowDisplay={narrowDisplay}>
              <ActionBarButton icon={<Icon icon={CopyIcon} />}>複製</ActionBarButton>
              <ActionBarButton icon={<Icon icon={DownloadSimpleIcon} />}>書き出す</ActionBarButton>
              <ActionBarButton icon={<Icon icon={TrashIcon} />} status="danger">
                削除
              </ActionBarButton>
            </ActionBar>
          </Frame>
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  render: () => (
    <DensityPair>
      <Frame>{bar()}</Frame>
    </DensityPair>
  ),
};

export const Accessibility: Story = {
  name: '読み上げとキーボード',
  render: () => <SelectableListScene defaultSelected={[]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvasElement.querySelector('[role="status"]:not([data-slot])');
    // 選ぶ前は帯がなく、知らせの箱は空
    await expect(canvas.queryByRole('toolbar')).toBeNull();
    await userEvent.click(canvas.getByRole('checkbox', { name: '見積書（10 月分）' }));
    const toolbar = await canvas.findByRole('toolbar', { name: '1 件を選択中' });
    await waitFor(() => expect(status).toHaveTextContent('1 件を選択中'));
    // 件数の文は二度読ませない（見える文は読み上げから外す）
    await expect(within(toolbar).getByText('1 件を選択中')).toHaveAttribute('aria-hidden', 'true');
    await userEvent.click(canvas.getByRole('checkbox', { name: 'デザインのラフ v3' }));
    await waitFor(() => expect(status).toHaveTextContent('2 件を選択中'));
    // 帯へ Tab で入り、Esc で選択を外すと、帯に入る前の場所へ戻る
    // 一覧の最後のチェックボックスから Tab で帯へ
    canvas.getByRole('checkbox', { name: '家計簿 2026' }).focus();
    await userEvent.tab();
    await expect(within(toolbar).getByRole('button', { name: '選択を外す' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.queryByRole('toolbar')).toBeNull());
    await expect(canvas.getByRole('checkbox', { name: '家計簿 2026' })).toHaveFocus();
    await expect(status).toBeEmptyDOMElement();
  },
};

export const Handlers: Story = {
  name: '操作を押す',
  args: { onClear: fn() },
  render: (args) => (
    <Frame>
      <ActionBar open label="2 件を選択中" onClear={args.onClear}>
        <ActionBarButton onClick={args.onClear}>複製</ActionBarButton>
        <ActionBarButton status="danger">削除</ActionBarButton>
      </ActionBar>
    </Frame>
  ),
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '選択を外す' }));
    await expect(args.onClear).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('button', { name: '複製' }));
    await expect(args.onClear).toHaveBeenCalledTimes(2);
  },
};
