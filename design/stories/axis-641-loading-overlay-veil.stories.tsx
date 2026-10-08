import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Card } from '../../src/components/card/Card';
import { LoadingOverlay } from '../../src/components/loading-overlay/LoadingOverlay';
import { TextField } from '../../src/components/text-field/TextField';

// 軸 641: LoadingOverlay の幕の濃さとぼかし
const meta = {
  title: 'Design Review/641 LoadingOverlay の幕',
  id: 'design-review-641-loading-overlay-veil',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'B,C,E,G' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'B', 'C', 'D', 'E', 'F', 'G'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: 'B',
    name: '淡い幕＋ぼかし（おすすめ・既定）',
    intent:
      '淡い幕（面の色 60%）に、後ろを 2px ぼかす。下の文字が読めなくなるので、止まっていることがはっきり伝わり、暗くしないので領域だけが重く見えない',
    spec: [
      ['色', '面の色 60%'],
      ['ぼかし', '2px'],
      ['円・文言', '灰色'],
    ],
    tokens: {
      '--loading-overlay-bg': 'rgb(from var(--color-surface) r g b / 0.6)',
      '--loading-overlay-blur': '2px',
    },
  },
  {
    id: 'C',
    name: '濃い幕（85%）',
    intent: '面の色を 85% かぶせる。下の内容はほとんど見えず、円と文言が読みやすい。選べる案',
    spec: [
      ['色', '面の色 85%'],
      ['ぼかし', 'なし'],
      ['円・文言', '灰色'],
    ],
    tokens: { '--loading-overlay-bg': 'rgb(from var(--color-surface) r g b / 0.85)' },
  },
  {
    id: 'D',
    name: 'Dialog と同じ暗い幕＋白い円',
    intent:
      'Dialog・Drawer の後ろと同じ幕（影の色 30%）に、白い円と白い文言を載せる。幕が暗いので、円は白で見える',
    spec: [
      ['色', '重なる面の幕（影の色 30%）'],
      ['ぼかし', 'なし'],
      ['円・文言', '白'],
    ],
    tokens: {
      '--loading-overlay-bg': 'var(--color-backdrop)',
      '--loading-overlay-blur': '0px',
      '--loading-overlay-fg': 'var(--palette-white)',
    },
  },
  {
    id: 'E',
    name: '暗い幕（50%）＋白い円',
    intent: 'D より幕を暗く（影の色 50%）して、白い円と文言をはっきり見せる。領域は沈んで見える',
    spec: [
      ['色', '影の色 50%'],
      ['ぼかし', 'なし'],
      ['円・文言', '白'],
    ],
    tokens: {
      '--loading-overlay-bg': 'rgb(from var(--color-shadow) r g b / 0.5)',
      '--loading-overlay-fg': 'var(--palette-white)',
    },
  },
  {
    id: 'F',
    name: '暗い幕（30%）＋ぼかし＋白い円',
    intent: 'D の幕に 2px のぼかしを掛ける。下の文字が読めなくなり、白い円が背景に埋もれにくい',
    spec: [
      ['色', '重なる面の幕（影の色 30%）'],
      ['ぼかし', '2px'],
      ['円・文言', '白'],
    ],
    tokens: {
      '--loading-overlay-bg': 'var(--color-backdrop)',
      '--loading-overlay-blur': '2px',
      '--loading-overlay-fg': 'var(--palette-white)',
    },
  },
  {
    id: 'G',
    name: '暗い幕（50%）＋ぼかし＋白い円',
    intent: 'E の幕に 2px のぼかしを掛ける。いちばん強く止まっていることを伝える',
    spec: [
      ['色', '影の色 50%'],
      ['ぼかし', '2px'],
      ['円・文言', '白'],
    ],
    tokens: {
      '--loading-overlay-bg': 'rgb(from var(--color-shadow) r g b / 0.5)',
      '--loading-overlay-blur': '2px',
      '--loading-overlay-fg': 'var(--palette-white)',
    },
  },
];

const columns: Column[] = [
  { label: '出ているところ（文言あり）', note: '幕が出た状態を固定' },
  { label: '押して試す', note: '「読み込む」で 2 秒ほど幕が出る' },
];

type Variant = { variant: 'light' | 'dark'; blur: boolean };

// 採った案（B・C・E・G）は variant と blur で、採らなかった案（D・F）はトークンの上書きで描く
const variantOf: Record<string, Variant | undefined> = {
  B: { variant: 'light', blur: true },
  C: { variant: 'light', blur: false },
  E: { variant: 'dark', blur: false },
  G: { variant: 'dark', blur: true },
};

function Region({ loading, variant }: { loading: boolean; variant?: Variant }) {
  return (
    <LoadingOverlay
      loading={loading}
      delay={0}
      minDuration={0}
      showLoadingText
      variant={variant?.variant}
      blur={variant?.blur}
      className="w-72 rounded-card"
    >
      <Card>
        <div className="flex flex-col gap-3 p-4">
          <p className="font-bold">今月の記録</p>
          <TextField label="メモ" />
          <Button color="primary">保存する</Button>
        </div>
      </Card>
    </LoadingOverlay>
  );
}

function Trial({ variant }: { variant?: Variant }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex flex-col items-start gap-3">
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 2000);
        }}
      >
        読み込む
      </Button>
      <Region loading={loading} variant={variant} />
    </div>
  );
}

export const Axis: Story = {
  name: '幕の濃さとぼかし',
  render: ({ pick }) => (
    <Comparison
      index={641}
      axis="LoadingOverlay の幕の濃さとぼかし"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) =>
        column.label.startsWith('出ている') ? (
          <Region loading variant={variantOf[candidate.id]} />
        ) : (
          <Trial variant={variantOf[candidate.id]} />
        )
      }
    >
      <p>
        領域の上にかぶせる幕を、Dialog
        の後ろと同じにするか、もっと淡くするかを選びます。どの案でも、下の領域は押せません。
      </p>
      <p>
        決定: 既定は B（淡い幕＋ぼかし）。C・E・G も選べる。D・F（暗い
        30%）は、読み込み中の文が埋もれるので採らない。
      </p>
      <p>
        返事: 既定は淡い幕＋ぼかし（B）で、C
        も選べる方向。暗い幕に白い円を載せる案（D・E）と、暗い幕にぼかしを掛ける案（F・G）を足しました。
      </p>
      <p>既定を 1 つ選び、ほかの案も選べるようにするかを答えてください。</p>
    </Comparison>
  ),
};
