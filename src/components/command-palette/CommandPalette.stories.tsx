import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { CommandPalette } from './CommandPalette';
import { sampleGroups } from './command-palette-story-data';
import { PhoneFrame, ScreenFrame } from '../../stories/story-parts';
import { Button } from '../button/Button';
import { Kbd } from '../kbd/Kbd';

// 開いた状態のストーリーも、ドキュメントのページでは閉じて描く（開くとフォーカスが移り、ページが流れるため）
const openOnLoad = (viewMode: string) => viewMode !== 'docs';

const trigger = (
  <Button variant="outline">
    コマンドを探す
    <Kbd>Ctrl</Kbd>
    <Kbd>K</Kbd>
  </Button>
);

const meta = {
  title: 'Components/CommandPalette',
  component: CommandPalette,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '打って探し、その場で実行する面です。⌘K などのキーで開き、上の検索欄に打つと下の候補が絞られます。↑↓ で候補を移り、Enter か押すことで実行します。',
          '',
          '- 候補は `items` に、そのまま並べる配列か、見出し付きのまとまり（`{ label, items }`）の配列で渡します。1 つの候補は `value`・`label` と、`keywords`（打って当てる別名）・`icon`・`description`（2 行目）・`shortcut`（右端の表示）・`status="danger"`・`disabled`・`onSelect` を持てます。',
          '- 選んだときは、候補の `onSelect`、続けて `onSelect`（部品の props）を呼び、面を閉じます。閉じないときは `event.preventDefault()` を呼びます。',
          "- `openShortcut` にキーの組み合わせ（`'mod+k'`。mod は Mac では ⌘、ほかでは Ctrl）を渡すと、ページのどこで押しても開閉します。開くボタンは `trigger` に渡すか、`open`・`onOpenChange` で外から開きます。",
          '- 画面の上寄りに浮かべます。幅は `size` の段で選びます（`sm` 480px・`md` 560px（既定）・`lg` 640px）。',
          '- 下の帯に、キー操作の案内（↑↓ 移動・Enter 実行・Esc 閉じる）を出します。隠すときは `hideKeyHints`、文字を差し替えるときは `moveHintLabel`・`runHintLabel`・`closeHintLabel` を渡します。',
          '- 打った文字に当たる候補がないときは、`emptyText` を出します。渡さないときは、検索欄だけを残します。',
          '- 題は画面に出さないので、`accessibleName` で面と検索欄の名前を渡します。',
          '- 指で操作していて画面が狭いときは、画面の下から全高のシートで出し、開いた時点から打てます（`presentation`）。',
        ].join('\n'),
      },
    },
  },
  args: {
    accessibleName: 'コマンドを探す',
    placeholder: 'コマンドやページを探す',
    items: sampleGroups,
    emptyText: '当たるコマンドがありません',
    groupLabelStyle: 'label',
    showGroupSeparator: false,
    iconVariant: 'plain',
    size: 'md',
    hideKeyHints: false,
  },
  argTypes: {
    items: { control: false },
    groupLabelStyle: {
      control: 'inline-radio',
      options: ['label', 'caption'],
      table: { defaultValue: { summary: "'label'" } },
    },
    iconVariant: {
      control: 'inline-radio',
      options: ['plain', 'soft'],
      table: { defaultValue: { summary: "'plain'" } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      table: { defaultValue: { summary: "'md'" } },
    },
    hideKeyHints: { table: { defaultValue: { summary: 'false' } } },
    moveHintLabel: { table: { defaultValue: { summary: "'移動'" } } },
    runHintLabel: { table: { defaultValue: { summary: "'実行'" } } },
    closeHintLabel: { table: { defaultValue: { summary: "'閉じる'" } } },
    showGroupSeparator: { table: { defaultValue: { summary: 'false' } } },
  },
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

// 押すか Ctrl+K（Mac は ⌘K）で開く。選んだ候補を下に書き出す
function PlaygroundDemo(args: Story['args']) {
  const [last, setLast] = useState<string>();
  return (
    <div className="flex flex-col items-start gap-3">
      <CommandPalette
        {...(args as React.ComponentProps<typeof CommandPalette>)}
        trigger={trigger}
        openShortcut="mod+k"
        onSelect={(item) => setLast(item.label)}
      />
      <p className="text-sm text-fg-muted">選んだ候補: {last ?? 'なし'}</p>
    </div>
  );
}

export const Playground: Story = {
  name: '基本',
  render: (args) => <PlaygroundDemo {...args} />,
};

export const Open: Story = {
  tags: ['visual'],
  name: '開いた状態',
  parameters: {
    docs: {
      description: {
        story:
          '画面の上寄りに浮かべます。打って候補が減っても、検索欄の位置は動きません。ここでは画面の代わりの枠の中に描いています。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[600px]" width="w-[760px]">
      {(frame) => (
        <CommandPalette
          {...args}
          presentation="popover"
          trigger={trigger}
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        />
      )}
    </ScreenFrame>
  ),
};

export const Filtered: Story = {
  tags: ['visual'],
  name: '打って絞り込んだ',
  parameters: {
    docs: {
      description: {
        story:
          '文字（`label`）と `keywords` に打った文字を含む候補だけが残ります。英語の別名（「set」で「設定を開く」）でも当たります。',
      },
    },
  },
  args: { defaultValue: 'set' },
  render: Open.render,
};

export const Empty: Story = {
  tags: ['visual'],
  name: '当たる候補がない',
  parameters: {
    docs: {
      description: {
        story:
          '当たる候補がないときは `emptyText` を出します。渡さないときは、候補の場所を閉じて検索欄だけにします（右）。',
      },
    },
  },
  args: { defaultValue: 'zzz' },
  render: (args, { viewMode }) => (
    <div className="flex flex-wrap gap-4">
      {[args.emptyText, undefined].map((emptyText, i) => (
        <ScreenFrame key={i} height="h-[280px]" width="w-[640px]">
          {(frame) => (
            <CommandPalette
              {...args}
              emptyText={emptyText}
              presentation="popover"
              modal={false}
              trigger={trigger}
              defaultOpen={openOnLoad(viewMode)}
              portalContainer={frame}
            />
          )}
        </ScreenFrame>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  tags: ['visual'],
  name: '幅の段',
  parameters: {
    controls: { exclude: ['size'] },
    docs: {
      description: {
        story:
          '`size` で幅の段を選びます。`sm` は Dialog の既定と同じ 480px、`md`（既定）は 560px、`lg` は候補の文字が長いときの 640px です。',
      },
    },
  },
  args: { defaultValue: 'set' },
  render: (args, { viewMode }) => (
    // 3 段を縦に並べるため、ここだけ面を枠の上に寄せる（画面の上との間を詰める）
    <div className="flex flex-col gap-4 [--command-palette-offset:calc(var(--spacing)*20)]">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <ScreenFrame key={size} height="h-[290px]" width="w-[720px]">
          {(frame) => (
            <CommandPalette
              {...args}
              size={size}
              presentation="popover"
              modal={false}
              autoFocus={false}
              trigger={<Button variant="outline">size=&quot;{size}&quot;</Button>}
              defaultOpen={openOnLoad(viewMode)}
              portalContainer={frame}
            />
          )}
        </ScreenFrame>
      ))}
    </div>
  ),
};

export const HideKeyHints: Story = {
  tags: ['visual'],
  name: 'キー操作の案内を隠す',
  parameters: {
    docs: {
      description: {
        story:
          '`hideKeyHints` で下の帯を隠し、検索欄と候補だけにします。案内の文字は `moveHintLabel`・`runHintLabel`・`closeHintLabel` で差し替えられます。',
      },
    },
  },
  args: { hideKeyHints: true },
  render: Open.render,
};

export const SoftIcons: Story = {
  tags: ['visual'],
  name: 'アイコンの箱',
  parameters: {
    docs: {
      description: {
        story:
          '`iconVariant="soft"` で、候補の頭のアイコンをグレーの角丸の箱に入れます（Menu の項目と同じ）。見出しは `groupLabelStyle="caption"` で控えめにできます。',
      },
    },
  },
  args: { iconVariant: 'soft', groupLabelStyle: 'caption' },
  render: Open.render,
};

export const Sheet: Story = {
  tags: ['visual'],
  name: 'シート',
  parameters: {
    docs: {
      description: {
        story:
          '`presentation="sheet"` のとき、または `auto` で指で操作していて画面が狭いときは、画面の下から全高のシートで出します。検索欄はシートの上にあり、開いた時点から打てます。右上の × で閉じます。ショートカットの表示は出しません。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <PhoneFrame>
      {(frame) => (
        <CommandPalette
          {...args}
          presentation="sheet"
          trigger={<Button>コマンドを探す</Button>}
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        />
      )}
    </PhoneFrame>
  ),
};

// 確かめ: 絞り込み・Enter で最初の候補を実行・選べない候補・Esc・キーの組み合わせで開く
export const Behavior: Story = {
  name: '確かめ（キー操作）',
  tags: ['!dev', '!autodocs'],
  args: { onSelect: fn() },
  render: (args) => (
    <CommandPalette {...args} presentation="popover" openShortcut="ctrl+k" trigger={trigger} />
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const onSelect = args.onSelect as ReturnType<typeof fn>;

    // キーの組み合わせで開き、検索欄にフォーカスが入る
    await userEvent.keyboard('{Control>}k{/Control}');
    const input = await body.findByRole('combobox', { name: 'コマンドを探す' });
    await waitFor(() => expect(input).toHaveFocus());
    await expect(body.getByRole('dialog', { name: 'コマンドを探す' })).toBeInTheDocument();

    // 打つと絞られ、別名（keywords）でも当たる
    await userEvent.type(input, 'set');
    await waitFor(() =>
      expect(body.getAllByRole('option').map((option) => option.textContent)).toEqual([
        '設定を開くCtrl+,',
      ])
    );

    // Enter で印のある最初の候補を実行し、面を閉じる
    await userEvent.keyboard('{Enter}');
    await expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'settings' }),
      expect.anything()
    );
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());

    // 開き直すと、打った文字は空に戻っている
    await userEvent.click(canvas.getByRole('button', { name: /コマンドを探す/ }));
    const reopened = await body.findByRole('combobox', { name: 'コマンドを探す' });
    await waitFor(() => expect(reopened).toHaveValue(''));

    // 選べない候補は押しても実行しない
    onSelect.mockClear();
    await userEvent.click(body.getByRole('option', { name: 'アーカイブ' }));
    await expect(onSelect).not.toHaveBeenCalled();

    // 当たらないときは emptyText
    await userEvent.type(reopened, 'zzz');
    await expect(await body.findByText('当たるコマンドがありません')).toBeVisible();

    // 閉じる × は、Tab で止まったときだけ見え、押すと閉じる
    const close = body.getByRole('button', { name: '閉じる' });
    await userEvent.tab();
    await waitFor(() => expect(close).toHaveFocus());
    await expect(close.getBoundingClientRect().width).toBeGreaterThan(1);
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());

    // Esc で閉じる
    await userEvent.click(canvas.getByRole('button', { name: /コマンドを探す/ }));
    await body.findByRole('combobox', { name: 'コマンドを探す' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  },
};
