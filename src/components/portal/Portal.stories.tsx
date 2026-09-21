import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, within } from 'storybook/test';

import { Portal } from './Portal';
import { Button } from '../button/Button';
import { Checkbox } from '../checkbox/Checkbox';
import { Text } from '../text/Text';
import { labelClass } from '../../stories/story-states';

const files = ['企画書.pdf', '見積もり.xlsx', '議事録.md', '写真 2026-09-18.jpg'];

// 選んだ数を、画面の下に貼り付く操作の帯で出す。帯は一覧の中に書くが、描くのは画面の枠（container）
function SelectionBar({ container }: { container: HTMLElement }) {
  const [selected, setSelected] = useState<string[]>(['企画書.pdf', '議事録.md']);
  return (
    <div className="flex flex-col gap-3" data-density="fine">
      <p className={labelClass}>ファイル（一覧の中に Portal を書いている）</p>
      {files.map((file) => (
        <Checkbox
          key={file}
          label={file}
          checked={selected.includes(file)}
          onCheckedChange={(checked) =>
            setSelected((prev) => (checked ? [...prev, file] : prev.filter((f) => f !== file)))
          }
        />
      ))}
      {selected.length > 0 && (
        <Portal container={container}>
          <div
            data-testid="selection-bar"
            className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-card border border-surface-line bg-surface px-4 py-3 shadow-overlay"
          >
            <Text as="span" className="grow">
              {selected.length} 件を選んでいます
            </Text>
            <Button variant="outline" onClick={() => setSelected([])}>
              選ぶのをやめる
            </Button>
            <Button color="danger">削除</Button>
          </div>
        </Portal>
      )}
    </div>
  );
}

function Screen() {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setFrame}
      className="relative h-[420px] w-[560px] max-w-full [transform:translateZ(0)] overflow-clip rounded-card border border-line bg-bg"
    >
      <div className="max-h-full overflow-auto p-6">
        {frame && <SelectionBar container={frame} />}
      </div>
    </div>
  );
}

const meta = {
  title: 'Components/Portal',
  component: Portal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '中身を、書いた場所ではなく別の場所（既定は `document.body`）に描きます。',
          '',
          '- Select・Dialog・Popover・Tooltip・Drawer は自分で描く場所を移すので、Portal で包みません。描く場所を変えるときは、それぞれの `portalContainer`（ThemeProvider でまとめて決めることもできます）を使います。',
          '- 自前の重なるもの（画面の下に貼り付く操作の帯、全画面の画像など）を、スクロールする枠や `overflow: hidden` の外に出したいときに使います。',
          '- `container`（既定は ThemeProvider の `portalContainer`、なければ `document.body`）で描く場所を決めます。',
          '- 書いた場所の祖先の密度（`data-density`）を、描く場所でも引き継ぎます。',
          '- サーバーでは描かず、ブラウザで描いたあとに出します。',
        ].join('\n'),
      },
    },
  },
} satisfies Meta<typeof Portal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SelectionActions: Story = {
  tags: ['visual'],
  name: '操作の帯',
  render: () => <Screen />,
  play: async ({ canvasElement }) => {
    const bar = await within(canvasElement).findByTestId('selection-bar');
    // 一覧（スクロールする枠）の外、画面の枠の直下に描かれ、一覧の密度を引き継ぐ
    await expect(bar.closest('.overflow-auto')).toBeNull();
    await expect(bar.parentElement).toHaveAttribute('data-density', 'fine');
  },
};
