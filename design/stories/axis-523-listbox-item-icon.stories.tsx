import { BicycleIcon, CarIcon, PersonSimpleWalkIcon, TrainIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Combobox } from '../../src/components/combobox/Combobox';
import { Icon } from '../../src/components/icon/Icon';
import { List, ListItem } from '../../src/components/list/List';
import { Select } from '../../src/components/select/Select';
import { Tag } from '../../src/components/tag/Tag';
import type { ListboxItem } from '../../src/internal/listbox/use-listbox-option';

// 軸 523: 選択肢のアイコン（ListboxItem の icon）の大きさ・色・ラベルとの間と、選んだ値の見せ方（F10）
const meta = {
  title: 'Design Review/523 選択肢のアイコン',
  id: 'design-review-523-listbox-item-icon',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const icon = (size: string, color: string, gap: string, valueIcon: 'flex' | 'none') => ({
  '--listbox-item-icon-size': size,
  '--listbox-item-icon-color': color,
  '--listbox-item-icon-gap': gap,
  '--select-value-icon-display': valueIcon,
});

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'アイコンなし',
    intent: 'いまは選択肢にアイコンを付けられない（ラベルと 2 行目だけ）。比べるための基準',
    spec: [
      ['大きさ', '—'],
      ['色', '—'],
      ['選んだ値', 'ラベルだけ'],
    ],
    tokens: icon(
      'var(--spacing-icon-input)',
      'var(--color-fg-muted)',
      'calc(var(--spacing) * 2)',
      'flex'
    ),
  },
  {
    id: 'A',
    name: 'Menu の項目と同じ',
    intent:
      '一覧の項目の仲間の Menu にそろえる。アイコンは部品の中のアイコンの大きさ（文字の 1.25 倍）で、一段淡い色。ラベルとの間は 8px。選んだ値の前にも同じアイコンを出す',
    spec: [
      ['大きさ', '20px（文字の 1.25 倍）'],
      ['色', '一段淡い（fg-muted）'],
      ['間', '8px'],
      ['選んだ値', 'アイコン＋ラベル'],
    ],
    tokens: icon(
      'var(--spacing-icon-input)',
      'var(--color-fg-muted)',
      'calc(var(--spacing) * 2)',
      'flex'
    ),
  },
  {
    id: 'B',
    name: 'Tag・Chip と同じ（文字と同じ大きさ・文字の色）',
    intent:
      '小物の中のアイコンと同じ決まり。文字と同じ大きさで、色は文字の色（選んだ項目では選んだ色の文字に合わせて変わる）',
    spec: [
      ['大きさ', '1em（16px）'],
      ['色', '文字の色'],
      ['間', '8px'],
      ['選んだ値', 'アイコン＋ラベル'],
    ],
    tokens: icon('1em', 'currentColor', 'calc(var(--spacing) * 2)', 'flex'),
  },
  {
    id: 'C',
    name: 'List と同じ（1.25 倍・文字の色）',
    intent:
      '一覧の項目の頭に置くアイコンの決まり（List）。大きさは A と同じ 1.25 倍で、色は文字の色。A との違いは色だけ',
    spec: [
      ['大きさ', '1.25em（20px）'],
      ['色', '文字の色'],
      ['間', '8px'],
      ['選んだ値', 'アイコン＋ラベル'],
    ],
    tokens: icon('1.25em', 'currentColor', 'calc(var(--spacing) * 2)', 'flex'),
  },
  {
    id: 'D',
    name: 'A で、選んだ値にはアイコンを出さない',
    intent:
      '一覧は A と同じ。Select の本体にはラベルだけを出し、アイコンは開いた一覧の中だけにする。本体の見た目をほかの入力欄とそろえる',
    spec: [
      ['大きさ', '20px（文字の 1.25 倍）'],
      ['色', '一段淡い（fg-muted）'],
      ['間', '8px'],
      ['選んだ値', 'ラベルだけ'],
    ],
    tokens: icon(
      'var(--spacing-icon-input)',
      'var(--color-fg-muted)',
      'calc(var(--spacing) * 2)',
      'none'
    ),
  },
];

const columns: Column[] = [
  { label: 'Select の一覧', note: '開いた状態。「電車」を選んでいる（primary）。「車」は選べない' },
  { label: '選んだ値', note: 'Select の本体（通常・押せない）' },
  { label: 'Combobox の一覧', note: '2 行目のある選択肢' },
  { label: '参考', note: 'Tag（文字と同じ）・List（1.25 倍）' },
];

const withIcons = (on: boolean): ListboxItem[] => [
  { label: '電車', value: 'train', icon: on ? <Icon icon={TrainIcon} /> : undefined },
  { label: '自転車', value: 'bike', icon: on ? <Icon icon={BicycleIcon} /> : undefined },
  {
    label: '車',
    value: 'car',
    icon: on ? <Icon icon={CarIcon} /> : undefined,
    disabled: true,
    note: { kind: 'reason', text: '駐車場がありません' },
  },
  { label: '徒歩', value: 'walk', icon: on ? <Icon icon={PersonSimpleWalkIcon} /> : undefined },
];

const withNotes = (on: boolean): ListboxItem[] => [
  {
    label: '電車',
    value: 'train',
    icon: on ? <Icon icon={TrainIcon} /> : undefined,
    note: { kind: 'description', text: '約 25 分・乗り換え 1 回' },
  },
  {
    label: '自転車',
    value: 'bike',
    icon: on ? <Icon icon={BicycleIcon} /> : undefined,
    note: { kind: 'description', text: '約 40 分' },
  },
  {
    label: '徒歩',
    value: 'walk',
    icon: on ? <Icon icon={PersonSimpleWalkIcon} /> : undefined,
    note: { kind: 'warning', text: '約 1 時間 50 分。坂があります' },
  },
];

// 開いた一覧を、セルの中に描く（浮かぶ部分の置き場をセルにする）
function PopoverFrame({ children }: { children: (container: HTMLElement) => ReactNode }) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setContainer} className="relative h-[19rem] w-[240px]">
      {container && children(container)}
    </div>
  );
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={523}
      axis="選択肢のアイコン"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const on = candidate.id !== '現行版';
        switch (column.label) {
          case 'Select の一覧':
            return (
              <PopoverFrame>
                {(container) => (
                  <Select
                    label="行き方"
                    items={withIcons(on)}
                    defaultValue="train"
                    color="primary"
                    defaultOpen
                    modal={false}
                    presentation="popover"
                    popoverMaxHeight="none"
                    portalContainer={container}
                  />
                )}
              </PopoverFrame>
            );
          case '選んだ値':
            return (
              <div className="flex w-[240px] flex-col gap-3">
                <Select label="行き方" items={withIcons(on)} defaultValue="bike" />
                <Select label="行き方" items={withIcons(on)} defaultValue="walk" disabled />
              </div>
            );
          case 'Combobox の一覧':
            return (
              <PopoverFrame>
                {(container) => (
                  <Combobox
                    label="行き方"
                    items={withNotes(on)}
                    defaultOpen
                    popoverMaxHeight="none"
                    modal={false}
                    portalContainer={container}
                  />
                )}
              </PopoverFrame>
            );
          default:
            return (
              <div className="flex w-[240px] flex-col items-start gap-3">
                <Tag icon={<Icon icon={TrainIcon} />}>電車</Tag>
                <List>
                  <ListItem icon={<TrainIcon />}>電車で行く</ListItem>
                  <ListItem icon={<BicycleIcon />}>自転車で行く</ListItem>
                </List>
              </div>
            );
        }
      }}
    >
      <p>
        Select・Combobox・Autocomplete・TagsInput の選択肢（items の 1 項目）に icon
        を足し、ラベルの前にアイコンを置けるようにします。アイコンは飾りで、読み上げません。2
        行目のある選択肢では、アイコンをラベルの 1
        行目にそろえます。選べない選択肢では、ラベルと同じ押せない色にします。
      </p>
      <p>
        選ぶのは、アイコンの大きさ（Tag・Chip の「文字と同じ」か、Menu・List の「1.25
        倍」か）、色（一段淡い色か、文字の色か）と、Select
        の本体で選んだ値の前にもアイコンを出すかです。Select には、選んだ値の見せ方を変える
        renderValue も足します。Combobox
        の本体は文字を打つ欄なので、選んだ値の前にアイコンは出せません。
      </p>
    </Comparison>
  ),
};
