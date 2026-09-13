import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import {
  ArrowUpRightIcon,
  CaretDownIcon,
  CaretRightIcon,
  CheckCircleIcon,
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
  InfoIcon,
  WarningCircleIcon,
  WarningIcon,
  XIcon,
} from '../components/icons';
import { labelClass } from './story-states';

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
  { name: 'ArrowUpRightIcon', regular: <ArrowUpRightIcon />, use: '外へのリンク（↗）' },
  { name: 'CheckIcon', regular: <CheckIcon />, use: '選んだ選択肢の印' },
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
  title: 'Components/Icons',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '部品の中で使うアイコンです（Phosphor の形）。`src/components/icons` から読み込みます。',
          '',
          '- 文字と並べるときは細い線（Regular）、アイコンだけで置くとき（アイコンだけのボタンなど）は `standalone` を付けて太い線（Bold）にします。',
          '- 大きさは部品の中の文字に合わせ、密度で切り替わります。色は周りの文字の色を受け継ぎます。',
          '- 飾りなので読み上げません。アイコンだけのボタンには、ボタンに `aria-label` を付けます。',
        ].join('\n'),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {
  name: '一覧',
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
