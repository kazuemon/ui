import type { Meta, StoryObj } from '@storybook/react-vite';
import { type RefObject, useLayoutEffect, useRef, useState } from 'react';

import { Heading, type HeadingSize } from '../components/heading/Heading';
import { Text, type TextSize } from '../components/text/Text';
import { labelClass } from './story-states';

// 文字の大きさの段の一覧。Heading・Text の段と、部品の中の役割の大きさを、密度ごとに並べる
// 各行の名前の右に、描いたあとの文字の大きさと行の高さ（px）を出す

const headingSizes: [size: HeadingSize, role: string][] = [
  ['5xl', 'Hero'],
  ['4xl', '節の大見出し'],
  ['3xl', '大きな数字'],
  ['2xl', '見出し 1'],
  ['xl', '見出し 2'],
  ['lg', '見出し 3'],
  ['md', '見出し 4〜6'],
];

const textSizes: [size: TextSize, role: string][] = [
  ['md', '本文'],
  ['sm', '注記'],
  ['xs', 'キャプション'],
];

// 段の外にある、部品の中の文字（役割の大きさ）
const roleText: [role: string, className: string][] = [
  ['部品の文字', 'text-control'],
  ['入力欄の値', 'text-input'],
  ['ラベル', 'text-label font-bold'],
];

type Frame = { label: string; density: 'fine' | 'coarse'; reading?: boolean };

const densityFrames: Frame[] = [
  { label: 'マウス（fine）', density: 'fine' },
  { label: '指（coarse）', density: 'coarse' },
];

const readingFrames: Frame[] = [
  { label: '指（coarse）', density: 'coarse' },
  { label: '指・読みもの（data-reading）', density: 'coarse', reading: true },
];

// 描いたあとの文字の大きさと行の高さ（px）を読む
function useMeasuredType(ref: RefObject<HTMLElement | null>) {
  const [value, setValue] = useState('');
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const style = getComputedStyle(element);
    setValue(
      `${Math.round(parseFloat(style.fontSize))}/${Math.round(parseFloat(style.lineHeight))}`
    );
  }, [ref]);
  return value;
}

function Name({ name, role, px }: { name: string; role: string; px: string }) {
  return (
    <span className="flex w-44 shrink-0 items-baseline gap-2 text-xs whitespace-nowrap text-fg-subtle">
      <span className="w-7 font-mono">{name}</span>
      <span className="w-12 font-mono text-fg-muted tabular-nums">{px}</span>
      <span>{role}</span>
    </span>
  );
}

function HeadingRow({ size, role }: { size: HeadingSize; role: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const px = useMeasuredType(ref);
  return (
    <div className="flex items-baseline gap-3">
      <Name name={size} role={role} px={px} />
      <Heading ref={ref} level={3} size={size} className="truncate">
        見出し Aa
      </Heading>
    </div>
  );
}

function TextRow({ size, role }: { size: TextSize; role: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const px = useMeasuredType(ref);
  return (
    <div className="flex items-baseline gap-3">
      <Name name={size} role={role} px={px} />
      <Text ref={ref} size={size} className="truncate">
        文字の大きさ Aa 123
      </Text>
    </div>
  );
}

function RoleRow({ role, className }: { role: string; className: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const px = useMeasuredType(ref);
  return (
    <div className="flex items-baseline gap-3">
      <Name name="—" role={role} px={px} />
      <span ref={ref} className={`truncate text-fg ${className}`}>
        文字の大きさ Aa 123
      </span>
    </div>
  );
}

function Tiers() {
  return (
    <div className="flex flex-col gap-3">
      {headingSizes.map(([size, role]) => (
        <HeadingRow key={size} size={size} role={role} />
      ))}
      <div className="border-t border-line" />
      {textSizes.map(([size, role]) => (
        <TextRow key={size} size={size} role={role} />
      ))}
      <div className="border-t border-line" />
      {roleText.map(([role, className]) => (
        <RoleRow key={role} role={role} className={className} />
      ))}
    </div>
  );
}

const meta = {
  title: 'Overview/文字の大きさ',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '文字の大きさの段を並べた一覧です。上から Heading の size、Text の size、部品の中の文字です。名前の右は、描いた文字の大きさと行の高さ（px）です。Text の lg〜5xl は Heading と同じ大きさです。',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Frames({ frames }: { frames: Frame[] }) {
  return (
    <div className="flex flex-wrap items-start gap-x-12 gap-y-8">
      {frames.map(({ label, density, reading }) => (
        <div
          key={label}
          data-density={density}
          data-reading={reading ? '' : undefined}
          className="flex min-w-0 flex-col gap-3"
        >
          <p className={labelClass}>{label}</p>
          <div className="w-[34rem] max-w-full rounded-card border border-line bg-bg p-6">
            <Tiers />
          </div>
        </div>
      ))}
    </div>
  );
}

/** マウスと指で段を並べる */
export const Scale: Story = {
  name: '段の一覧',
  tags: ['visual'],
  render: () => <Frames frames={densityFrames} />,
};

/** 読みもの（Prose の中）では、指で操作していても、読む文字（見出し・本文）はマウスと同じ大きさになる */
export const Reading: Story = {
  name: '読みものの中',
  tags: ['visual'],
  render: () => <Frames frames={readingFrames} />,
};
