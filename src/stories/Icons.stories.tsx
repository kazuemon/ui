import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import {
  ArrowUDownLeftIcon,
  ArrowUpRightIcon,
  CaretDownIcon,
  CaretRightIcon,
  CheckCircleIcon,
  CheckIcon,
  CheckMarkIcon,
  CopyIcon,
  EyeIcon,
  EyeSlashIcon,
  InfoIcon,
  WarningCircleIcon,
  WarningIcon,
  XIcon,
} from '../internal/icons';
import { labelClass, sourceCode } from './story-states';

interface Entry {
  name: string;
  regular: ReactNode;
  /** standalone を受け取るアイコンだけ */
  bold?: ReactNode;
  use: string;
}

const entries: Entry[] = [
  { name: 'XIcon', regular: <XIcon />, bold: <XIcon standalone />, use: '閉じる' },
  {
    name: 'EyeIcon',
    regular: <EyeIcon />,
    bold: <EyeIcon standalone />,
    use: 'パスワードを表示',
  },
  {
    name: 'EyeSlashIcon',
    regular: <EyeSlashIcon />,
    bold: <EyeSlashIcon standalone />,
    use: 'パスワードを隠す',
  },
  { name: 'CaretDownIcon', regular: <CaretDownIcon />, use: 'Select の ▼' },
  { name: 'CaretRightIcon', regular: <CaretRightIcon />, use: '枠線のリンクの「›」' },
  {
    name: 'ArrowUpRightIcon',
    regular: <ArrowUpRightIcon />,
    use: '外へのリンク（右上向きの矢印）',
  },
  { name: 'CheckIcon', regular: <CheckIcon />, use: '選んだ選択肢の印' },
  {
    name: 'ArrowUDownLeftIcon',
    regular: <ArrowUDownLeftIcon />,
    use: '脚注の一覧の、参照へ戻るリンク',
  },
  {
    name: 'CopyIcon',
    regular: <CopyIcon />,
    bold: <CopyIcon standalone />,
    use: 'CodeBlock のコピー',
  },
  {
    name: 'CheckMarkIcon',
    regular: <CheckMarkIcon />,
    bold: <CheckMarkIcon standalone />,
    use: 'CodeBlock のコピーしたあとの印',
  },
  {
    name: 'WarningCircleIcon',
    regular: <WarningCircleIcon />,
    bold: <WarningCircleIcon standalone />,
    use: 'エラー・危険',
  },
  { name: 'WarningIcon', regular: <WarningIcon />, bold: <WarningIcon standalone />, use: '警告' },
  { name: 'InfoIcon', regular: <InfoIcon />, bold: <InfoIcon standalone />, use: '情報' },
  {
    name: 'CheckCircleIcon',
    regular: <CheckCircleIcon />,
    bold: <CheckCircleIcon standalone />,
    use: '成功',
  },
];

const meta = {
  title: 'Overview/アイコン',
  id: 'overview-icons',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '@kazuemon/ui の部品の中で使っているアイコンの一覧です（形は [Phosphor Icons](https://phosphoricons.com/)）。これらは公開していません。',
          '',
          '- 部品にアイコンを渡すときは、`<Icon icon={…}>`（アイコン単体は `standalone`）で渡します。部品の中のアイコンと同じ大きさ・線の太さになります。',
          '- 大きさは部品の中の文字に合わせ、密度で切り替わります。色は周りの文字の色を受け継ぎます。',
          '- 飾りなので読み上げません。アイコンだけのボタンには、ボタンに `aria-label` を付けます。',
        ].join('\n'),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Show code: 一覧の表は写しても使えないので、置き方を source.code に手で書く
export const All: Story = {
  tags: ['visual'],
  name: '一覧',
  parameters: {
    docs: {
      source: sourceCode(`
        import { CheckIcon, EyeIcon } from '@phosphor-icons/react';

        {/* 文字と並べるとき（細い線） */}
        <Button>
          <CheckIcon weight="regular" />
          完了にする
        </Button>
        {/* アイコンだけで置くとき（太い線）。名前はボタンに付ける */}
        <FieldAddonButton aria-label="パスワードを表示">
          <EyeIcon weight="bold" />
        </FieldAddonButton>
      `),
    },
  },
  render: () => (
    <div className="overflow-x-auto">
      <table className="text-sm text-fg">
        <thead>
          <tr className="text-left">
            {['名前', '文字と並ぶ（Regular）', '単体（standalone）', '使う場所'].map((label) => (
              <th key={label} className={`px-3 pb-3 ${labelClass}`}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map(({ name, regular, bold, use }) => (
            <tr key={name} className="border-t border-line">
              <td className="px-3 py-2 font-mono text-xs">{name}</td>
              <td className="px-3 py-2">{regular}</td>
              <td className="px-3 py-2">{bold ?? <span className="text-fg-subtle">—</span>}</td>
              <td className="px-3 py-2 text-fg-muted">{use}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};
