import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';

import { Button } from '../button/Button';
import { Tag } from '../tag/Tag';
import { Text } from '../text/Text';
import { Transition, type TransitionPreset } from './Transition';
import { sourceCode } from '../../stories/story-states';

const presets: (TransitionPreset | undefined)[] = [
  undefined,
  'fade',
  'fade-up',
  'fade-down',
  'scale',
  'collapse',
];

// 中身の見本。白い面に細い輪郭（自前の部品のつもり）
function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-control border border-line bg-surface px-4 py-3 text-sm leading-6">
      {children}
    </div>
  );
}

function Toggle({ preset, keepMounted }: { preset?: TransitionPreset; keepMounted?: boolean }) {
  const [show, setShow] = useState(true);
  return (
    <div className="flex w-[240px] flex-col items-start gap-3">
      <Button onClick={() => setShow((value) => !value)}>{show ? '隠す' : '出す'}</Button>
      <Transition show={show} preset={preset} keepMounted={keepMounted} className="w-full">
        <Card>
          <p className="font-bold">{preset ?? '書かないとき'}</p>
          <p className="text-fg-muted">保存しました。</p>
        </Card>
      </Transition>
    </div>
  );
}

const meta = {
  title: 'Components/Transition',
  component: Transition,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '自分で作った中身に、@kazuemon/ui の浮かぶ面と同じ出入りの動きを付けます。`show` を切り替えると、出るときはふわっと現れ、消えるときは動きが終わってから消します。',
          '',
          '- 出方は `preset` で選びます。書かないときは浮かぶ面と同じ出方です。`fade` は濃さだけ、`fade-up` は下から上へ、`fade-down` は上から下へ、`scale` は少し小さい姿から、`collapse` は高さを 0 から伸ばします。',
          '- 消えたあとは DOM から外します。中の入力の値を保ちたいときは `keepMounted` を付けます（`hidden` で隠します）。',
          '- 一覧に足した項目のように、`show` を true のまま描くときに動かすには `appear` を付けます。外すときは `show` を false にし、`onExited` で一覧から消します。',
          '- 描く要素は `render` で変えられます（一覧の中では `<li />`）。',
          '- 動きを減らす設定では、動かさずにすぐ出す・消します。',
        ].join('\n'),
      },
    },
  },
  args: { show: true, children: null },
} satisfies Meta<typeof Transition>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  args: { show: true },
  render: (args) => (
    <div className="w-[280px]">
      <Transition {...args}>
        <Card>保存しました。</Card>
      </Transition>
    </div>
  ),
};

export const Presets: Story = {
  name: '出方',
  parameters: {
    docs: {
      description: { story: 'ボタンを押すと、それぞれの出方で出し入れします。' },
      source: sourceCode(`
        const [show, setShow] = useState(true);
        <Button onClick={() => setShow(!show)}>隠す</Button>
        <Transition show={show} preset="fade-up">…</Transition>
      `),
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-8">
      {presets.map((preset) => (
        <Toggle key={preset ?? 'auto'} preset={preset} />
      ))}
    </div>
  ),
};

const initialTags = ['React', 'TypeScript', 'Tailwind CSS'];
const moreTags = ['Base UI', 'Storybook', 'Vitest', 'Vite'];

function TagListExample() {
  const [tags, setTags] = useState(initialTags.map((label) => ({ label, show: true })));
  const add = () => {
    const next = moreTags.find((label) => !tags.some((tag) => tag.label === label));
    if (next) setTags([...tags, { label: next, show: true }]);
  };
  return (
    <div className="flex w-[360px] flex-col items-start gap-3">
      <Button onClick={add}>タグを足す</Button>
      <ul className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Transition
            key={tag.label}
            render={<li />}
            show={tag.show}
            preset="scale"
            appear
            onExited={() => setTags((list) => list.filter((t) => t.label !== tag.label))}
          >
            <button
              type="button"
              className="cursor-pointer"
              aria-label={`${tag.label} を外す`}
              onClick={() =>
                setTags((list) =>
                  list.map((t) => (t.label === tag.label ? { ...t, show: false } : t))
                )
              }
            >
              <Tag>{tag.label} ×</Tag>
            </button>
          </Transition>
        ))}
      </ul>
    </div>
  );
}

export const List: Story = {
  name: '一覧に足す・外す',
  parameters: {
    docs: {
      description: {
        story:
          '足した項目は `appear` で出る動きを付けます。外すときは `show` を false にし、消える動きが終わったあとの `onExited` で一覧から消します。',
      },
      source: sourceCode(`
        <ul>
          {tags.map((tag) => (
            <Transition
              key={tag.label}
              render={<li />}
              show={tag.show}
              preset="scale"
              appear
              onExited={() => remove(tag.label)}
            >
              …
            </Transition>
          ))}
        </ul>
      `),
    },
  },
  render: () => <TagListExample />,
};

function CollapseExample() {
  const [show, setShow] = useState(false);
  return (
    <div className="flex w-[320px] flex-col items-start gap-3">
      <Button onClick={() => setShow((value) => !value)}>{show ? '隠す' : '出す'}</Button>
      <Transition show={show} preset="collapse" className="w-full">
        <Card>
          <Text>入力した値は、送る前にもう一度確かめられます。</Text>
        </Card>
      </Transition>
      <Text variant="muted">この文は、上の中身が出ると下へ滑ります。</Text>
    </div>
  );
}

export const Collapse: Story = {
  name: '高さを伸ばす',
  parameters: {
    docs: {
      description: {
        story:
          '`collapse` は高さを 0 から中身の高さまで伸ばします。下の内容は跳ばずに滑ります。押して開閉する行には Collapsible を使います。',
      },
    },
  },
  render: () => <CollapseExample />,
};

export const Behavior: Story = {
  name: '出し入れの確かめ',
  tags: ['!autodocs'],
  render: () => <Toggle preset="fade-up" />,
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button');
    await expect(canvas.getByText('保存しました。')).toBeVisible();
    // 隠すと、消える動きのあとで DOM から外れる
    await userEvent.click(button);
    await waitFor(() => expect(canvas.queryByText('保存しました。')).toBeNull());
    // 出すと、すぐに DOM に戻り、動きが終わると出はじめの印が外れる
    await userEvent.click(button);
    const content = canvas.getByText('保存しました。');
    const wrapper = content.closest('[data-slot="transition"]');
    await expect(wrapper).toHaveAttribute('data-open');
    await waitFor(() => expect(wrapper).not.toHaveAttribute('data-starting-style'));
  },
};

export const KeepMounted: Story = {
  name: '消えても残す（確かめ）',
  tags: ['!autodocs'],
  render: () => <Toggle preset="fade" keepMounted />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button'));
    // keepMounted では DOM に残り、hidden で隠れる
    await waitFor(() =>
      expect(
        canvas.getByText('保存しました。', { selector: 'p' }).closest('[data-slot="transition"]')
      ).toHaveAttribute('hidden')
    );
  },
};
