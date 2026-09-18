import { Button } from '../button/Button';
import { Checkbox } from '../checkbox/Checkbox';
import { CheckboxGroup } from '../checkbox/CheckboxGroup';
import { Tag } from '../tag/Tag';
import { Text } from '../text/Text';
import { ScrollArea, type ScrollAreaProps } from './ScrollArea';
import { type ScrollPosition, useScrollPosition } from './story-scroll';

// ストーリーで使う場面（部品ではない）。ScrollArea の Docs と、比較のストーリーで共有する

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

/** 利用規約の文（Dialog の中身） */
export function TermsText({
  position = 'start',
  options,
}: {
  position?: ScrollPosition;
  options?: SceneOptions;
}) {
  const ref = useScrollPosition(position);
  return (
    // Dialog の左右の余白の外まで広げ、影を面の幅いっぱいに出す
    <ScrollArea
      {...options}
      viewportRef={ref}
      label="利用規約"
      className="-mx-(--dialog-padding) h-[200px]"
      contentClassName="px-(--dialog-padding)"
    >
      <div className="flex flex-col gap-3">
        {[
          'この規約は、かずえもんのサイト（以下「本サイト」）を使うときの決まりです。本サイトを使った時点で、この規約に同意したものとみなします。',
          '本サイトの記事と画像の著作権は、かずえもんにあります。引用するときは、出どころを明らかにしてください。',
          'コメント欄に書いた内容は、公開されます。ほかの人を傷つける内容や、個人を特定できる内容は書かないでください。',
          '本サイトの内容は、書いた時点の情報です。内容の正しさは保証しません。',
          'この規約は、予告なく変えることがあります。変えたときは、本サイトでお知らせします。',
        ].map((text, i) => (
          <Text key={i} size="sm" tone="muted">
            {text}
          </Text>
        ))}
      </div>
    </ScrollArea>
  );
}

/** 利用規約の Dialog の下に置く操作 */
export function TermsActions() {
  return <Button color="primary">同意して続ける</Button>;
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

const recent = [
  'デザイン原則を書き直した',
  'Select の選択肢を詰めた',
  'シートをはじいて閉じる',
  'フォーカスの線の色',
  '和文フォントの補正',
  '見た目の回帰テスト',
  'Dialog の角と大きさ',
  'Tooltip の面',
  'コードの色分け',
  '表の横スクロール',
] as const;

/** Popover の中の一覧（最近の記事） */
export function RecentList({
  position = 'start',
  options,
}: {
  position?: ScrollPosition;
  options?: SceneOptions;
}) {
  const ref = useScrollPosition(position);
  return (
    // Popover の左右の余白の外まで広げ、影を面の幅いっぱいに出す
    <ScrollArea
      {...options}
      viewportRef={ref}
      label="最近の記事"
      className="-mx-(--popover-padding) h-[176px]"
      contentClassName="px-(--popover-padding)"
    >
      <ul className="flex flex-col">
        {recent.map((title) => (
          <li key={title} className="border-b border-line py-2 last:border-b-0">
            <Text as="span" size="sm">
              {title}
            </Text>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
