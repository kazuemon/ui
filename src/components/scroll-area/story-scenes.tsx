'use client';

import { Checkbox } from '../checkbox/Checkbox';
import { CheckboxGroup } from '../checkbox/CheckboxGroup';
import { Tag } from '../tag/Tag';
import { ScrollArea, type ScrollAreaProps } from './ScrollArea';
import { type ScrollPosition, useScrollPosition } from './story-scroll';

// ストーリーで使う場面（部品ではない）

/** 場面の ScrollArea に渡す、影とつまみの出し方 */
export type SceneOptions = Pick<ScrollAreaProps, 'edgeShadow' | 'scrollbar'>;

const topics = [
  ['design', 'デザイン'],
  ['frontend', 'フロントエンド'],
  ['a11y', 'アクセシビリティ'],
  ['typography', '文字組み'],
  ['color', '色'],
  ['motion', '動き'],
  ['tooling', '開発の道具'],
  ['testing', 'テスト'],
  ['performance', '速さ'],
  ['infra', 'インフラ'],
  ['writing', '文章'],
  ['life', '暮らし'],
] as const;

/** カードの中の長い一覧（Checkbox の行） */
export function TopicCard({
  position = 'start',
  width = 'w-[240px]',
  options,
}: {
  position?: ScrollPosition;
  width?: string;
  options?: SceneOptions;
}) {
  const ref = useScrollPosition(position);
  return (
    <div className={`${width} rounded-card border border-line bg-surface`}>
      {/* 枠をカードの端まで広げ、余白は中身に付ける。影がカードの幅いっぱいに出る */}
      <ScrollArea
        {...options}
        viewportRef={ref}
        label="興味のある話題"
        className="h-[248px]"
        contentClassName="p-4"
      >
        <CheckboxGroup label="興味のある話題" defaultValue={['design', 'a11y']}>
          {topics.map(([value, label]) => (
            <Checkbox key={value} value={value} label={label} />
          ))}
        </CheckboxGroup>
      </ScrollArea>
    </div>
  );
}

const tags = [
  'React',
  'TypeScript',
  'Tailwind CSS',
  'Base UI',
  'Storybook',
  'Vitest',
  'Figma',
  'アクセシビリティ',
  'デザインシステム',
  'Next.js',
] as const;

/** 横に並ぶ Tag の列 */
export function TagRow({
  position = 'start',
  width = 'w-[240px]',
  options,
}: {
  position?: ScrollPosition;
  width?: string;
  options?: SceneOptions;
}) {
  const ref = useScrollPosition(position, 'x');
  return (
    <ScrollArea {...options} viewportRef={ref} label="使った技術" className={width}>
      <div className="flex gap-2 pb-3">
        {tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    </ScrollArea>
  );
}
