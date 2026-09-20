import type { Meta, StoryObj } from '@storybook/react-vite';
import { type FormEvent, type ReactNode, useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む（Form.stories.tsx と同じ）
import { expect, fn, userEvent, waitFor } from 'storybook/test';

import { Button } from '../button/Button';
import { Checkbox } from './Checkbox';
import { CheckboxGroup } from './CheckboxGroup';
import { Form } from '../form/Form';
import { DensityPair } from '../../stories/story-parts';
import { sourceCode } from '../../stories/story-states';

const colors = ['primary', 'secondary', 'neutral'] as const;

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'チェックボックスです。箱と横の文字（とキャプション）を並べます。横の文字を押しても切り替わります。',
          '',
          '- 1つだけ置くとき（同意など）はそのまま置きます。`error`・`warning` を渡すと、箱の行の下に入力欄と同じ行で出します。`required` で必須にすると、横の文字の後ろに印（既定は「必須」のタグ）が出て、箱に aria-required が付きます。印は読み上げから外れます。',
          '- 複数を1つの問いにまとめるときは、`CheckboxGroup` の中に `value` 付きで置きます。エラー・警告はグループに渡します。',
          '- 「すべて選ぶ」の箱は、`CheckboxGroup` の `selectAll` と `allValues` で付けます。選んだ数に合わせて、箱が自分で選んだ状態・中間の状態に切り替わります。',
          '- `color` は選んだときの色です。指定しないときは濃いグレー（`neutral`）です。選んでいない箱は、色にかかわらず入力欄と同じグレーです。',
          '- グループの必須は、`caption` の文で書きます。',
          '- `readOnly` にすると、箱が押せないときと同じ見た目になります。横の文字は本文の色のままです。フォーカスはでき、読み上げでは「読み取り専用」と伝わります。値は変わりませんが、フォームでは送られます。',
          '- グループを `required` にすると見出しに印は出ますが、`role="group"` には aria-required を付けられません。必須であることは `caption` の文でも書きます。',
        ].join('\n'),
      },
      // Show code: 引数を使わない render も、Storybook が作るコード（dynamic）を出す。既定では story の定義がそのまま出る
      source: { type: 'dynamic' },
    },
  },
  // Controls で既定の値を選んだ状態から始める（部品の既定と同じ値）
  args: {
    label: 'メールで受け取る',
    color: 'neutral',
    disabled: false,
    readOnly: false,
    required: false,
    defaultChecked: false,
    onCheckedChange: fn(),
  },
  argTypes: {
    label: { control: 'text' },
    caption: { control: 'text' },
    error: { control: 'text' },
    warning: { control: 'text' },
    color: {
      control: 'inline-radio',
      options: colors,
      table: { defaultValue: { summary: "'neutral'" } },
    },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    required: { control: 'boolean' },
    defaultChecked: { control: 'boolean' },
    checked: { control: false },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

const narrow = (Story: () => ReactNode) => (
  <div className="max-w-sm">
    <Story />
  </div>
);

export const Playground: Story = {
  name: '基本',
  decorators: [narrow],
};

export const Group: Story = {
  tags: ['visual'],
  name: 'グループ',
  parameters: {
    controls: { include: ['color'] },
    docs: {
      description: {
        story:
          '複数を1つの問いにまとめるときは `CheckboxGroup` の中に置きます。選んだ `value` の並びがグループの値です。必須のときは、キャプションに文で書きます。',
      },
    },
  },
  render: (args) => (
    <div className="max-w-sm">
      <CheckboxGroup
        label="連絡の方法"
        caption="1つ以上選んでください"
        color={args.color}
        defaultValue={['mail']}
      >
        <Checkbox value="mail" label="メール" />
        <Checkbox value="tel" label="電話" caption="平日の 10 時から 18 時" />
        <Checkbox value="post" label="郵送" disabled />
      </CheckboxGroup>
    </div>
  ),
};

const contactValues = ['mail', 'tel', 'post'];

export const SelectAll: Story = {
  name: 'すべて選ぶ',
  parameters: {
    controls: { include: ['color'] },
    docs: {
      description: {
        story:
          '`selectAll` に「すべて選ぶ」の箱の文字を、`allValues` に中の選択肢の `value` をすべて渡します。箱は選択肢の上に置かれ、選択肢は字下げされます。子がすべて選ばれていれば選んだ状態、いくつか選ばれていれば中間の状態に、部品が自分で切り替えます。箱の値は送信されません。',
      },
    },
  },
  render: (args) => (
    <div className="max-w-sm">
      <CheckboxGroup
        label="連絡の方法"
        selectAll="すべて選ぶ"
        allValues={contactValues}
        color={args.color}
        defaultValue={['mail']}
      >
        <Checkbox value="mail" label="メール" />
        <Checkbox value="tel" label="電話" />
        <Checkbox value="post" label="郵送" />
      </CheckboxGroup>
    </div>
  ),
  play: async ({ canvas }) => {
    const all = canvas.getByRole('checkbox', { name: 'すべて選ぶ' });
    const tel = canvas.getByRole('checkbox', { name: '電話' });
    await expect(all).toHaveAttribute('aria-checked', 'mixed');
    await userEvent.click(all);
    for (const name of ['メール', '電話', '郵送']) {
      await expect(canvas.getByRole('checkbox', { name })).toHaveAttribute('aria-checked', 'true');
    }
    await expect(all).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(tel);
    await expect(all).toHaveAttribute('aria-checked', 'mixed');
    await expect(all.getAttribute('aria-controls')?.split(' ')).toHaveLength(3);
  },
};

// 値を確かめるのはアプリの役。ここではストーリーが受け持つ
function ConsentForm() {
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string>();
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(agreed ? undefined : '利用規約に同意してください');
  };
  return (
    <Form onSubmit={submit} className="flex max-w-sm flex-col gap-5">
      <Checkbox
        label="利用規約に同意する"
        caption="規約は登録の前にお読みください"
        required
        checked={agreed}
        onCheckedChange={(checked) => {
          setAgreed(checked);
          if (checked) setError(undefined);
        }}
        error={error}
      />
      <Button type="submit" color="primary" className="self-start">
        登録する
      </Button>
    </Form>
  );
}

// Show code: 状態を持ち、ハンドラーが要の例なので、写して使える部品の形を source.code に手で書く
export const Consent: Story = {
  name: '1つだけ置く（同意）',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '同意のように1つだけ置く箱は、`required` で必須にし（横の文字の後ろに印が出て、箱に aria-required が付きます）、`error` で箱の行の下にエラーの行を出します。行は箱の説明につながり、`Form` で送信したときは、エラーのある最初の欄としてこの箱にフォーカスが移ります。「登録する」を押して確かめてください。',
      },
      source: sourceCode(`
        function ConsentForm() {
          const [agreed, setAgreed] = useState(false);
          const [error, setError] = useState<string>();
          const submit = (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setError(agreed ? undefined : '利用規約に同意してください');
          };
          return (
            <Form onSubmit={submit} className="flex max-w-sm flex-col gap-5">
              <Checkbox
                label="利用規約に同意する"
                caption="規約は登録の前にお読みください"
                required
                checked={agreed}
                onCheckedChange={(checked) => {
                  setAgreed(checked);
                  if (checked) setError(undefined);
                }}
                error={error}
              />
              <Button type="submit" color="primary" className="self-start">
                登録する
              </Button>
            </Form>
          );
        }
      `),
    },
  },
  render: () => <ConsentForm />,
  play: async ({ canvas }) => {
    const box = canvas.getByRole('checkbox', { name: '利用規約に同意する' });
    await expect(box).toHaveAttribute('aria-required', 'true');
    await userEvent.click(canvas.getByRole('button', { name: '登録する' }));
    await waitFor(() => expect(box).toHaveFocus());
    const line = await canvas.findByText('利用規約に同意してください');
    const lineId = line.closest('[id]')?.id;
    // 説明は見た目の順（キャプション → エラー）
    const ids = box.getAttribute('aria-describedby')?.split(' ') ?? [];
    await expect(ids).toHaveLength(2);
    await expect(document.getElementById(ids[0])).toHaveTextContent(
      '規約は登録の前にお読みください'
    );
    await expect(ids[1]).toBe(lineId);
    await userEvent.click(box);
    await waitFor(() => expect(box.getAttribute('aria-describedby')?.split(' ')).toHaveLength(1));
  },
};

// Show code: render の JSX をそのまま出す（dynamic。meta の source.type）
export const Messages: Story = {
  tags: ['visual'],
  name: 'エラーと警告',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '1つだけ置く箱のエラーと警告は、入力欄と同じ行で箱の行の下に出します。エラーでは選んでいない箱の塗りが淡い赤になります。警告は箱の見た目を変えません。',
      },
    },
  },
  render: () => (
    <div className="flex max-w-sm flex-col gap-5">
      <Checkbox label="利用規約に同意する" required error="利用規約に同意してください" />
      <Checkbox label="お知らせのメールを受け取る" defaultChecked warning="週に数回届きます" />
    </div>
  ),
};

export const ReadOnly: Story = {
  tags: ['visual'],
  name: '読み取り専用',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`readOnly` の箱は、押せない箱と同じ見た目になります。横の文字は読むための文字なので、本文の色のままです。フォーカスはでき、読み上げでは「読み取り専用」と伝わります。押してもキーボードでも値は変わりませんが、フォームでは値が送られます（押せない箱は送られません）。グループごと読み取り専用にするときは、`CheckboxGroup` に `readOnly` を渡します。',
      },
    },
  },
  render: () => (
    <div className="flex max-w-sm flex-col gap-5">
      <Checkbox label="お知らせのメールを受け取る" defaultChecked readOnly />
      <CheckboxGroup label="連絡の方法" readOnly defaultValue={['mail']}>
        <Checkbox value="mail" label="メール" />
        <Checkbox value="tel" label="電話" caption="平日の 10 時から 18 時" />
      </CheckboxGroup>
    </div>
  ),
  play: async ({ canvas }) => {
    const box = canvas.getByRole('checkbox', { name: 'お知らせのメールを受け取る' });
    // 読み上げは「読み取り専用」。押せない（aria-disabled）とは伝えない
    await expect(box).toHaveAttribute('aria-readonly', 'true');
    await expect(box).not.toHaveAttribute('aria-disabled');
    // 押しても値は変わらない
    await userEvent.click(box);
    await expect(box).toHaveAttribute('aria-checked', 'true');
    // フォーカスできる（見た目の比較は、線のない状態で撮るので最後に外す）
    box.focus();
    await expect(box).toHaveFocus();
    box.blur();
    // グループの readOnly は中の箱に伝わる
    await expect(canvas.getByRole('checkbox', { name: '電話' })).toHaveAttribute(
      'aria-readonly',
      'true'
    );
  },
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: {
    docs: {
      description: {
        story:
          '行の高さと箱の大きさは入力方式で切り替わります。ツールバーの「密度」でも切り替えられます。',
      },
    },
  },
  render: (args) => (
    <DensityPair>
      <div className="flex w-72 flex-col">
        <Checkbox {...args} caption="週に1回、まとめて届きます" defaultChecked />
        <Checkbox {...args} label="電話で受け取る" />
      </div>
    </DensityPair>
  ),
};
