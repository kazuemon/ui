import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, userEvent } from 'storybook/test';

import { Radio, RadioGroup, RadioGroupControl } from './Radio';
import { Field, FieldCaption, FieldLabel, FieldMessages } from '../field/Field';
import { Link } from '../link/Link';

const colors = ['primary', 'secondary', 'neutral'] as const;

const meta = {
  title: 'Components/Radio',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '1つだけ選ぶ問いのラジオです。`RadioGroup` の中に `Radio` を `value` 付きで置きます。横の文字を押しても選ばれます。',
          '',
          '- `required` で必須にします。見出しの後ろに印（既定は「必須」のタグ）が出て、グループに aria-required が付きます。印は読み上げから外れ、必須であることは aria-required が伝えます。印の形は `requiredMark` で変えられます。',
          '- `errorText`・`warningText`・`infoText` は選択肢の下に、入力欄と同じ行で出します。',
          '- グループの `caption`・`errorText`・`warningText` は、グループの説明です。選択肢1つずつの説明は、その `Radio` の `caption`（2 行目）だけです。',
          '- `color` は選んだときの色です。指定しないときは濃いグレー（`neutral`）です。',
          '- `direction="horizontal"` で選択肢を横に 1 行で並べます。「はい／いいえ」のような短い選択肢のときに使います。既定では折り返さず、狭い入れ物でも縦には戻しません。',
          '- 横に並べたとき、`wrap` を渡すと入りきらない選択肢を次の行へ折り返します。`itemWidth="equal"` は選択肢を同じ幅の列にそろえ、説明文の長い選択肢があっても並びが偏りません。',
          '- `frame="card"` で選択肢 1 つずつをカードの形にし、カード全体を押せるようにします。`Radio` の `labelAside` で値段などを右端に置けます。選んでいるカードは線で示し、`selectedIndicator="fill"` で面も淡く塗ります。',
          '- `readOnly` にすると、丸が押せないときと同じ見た目になります。横の文字は本文の色のままです。フォーカスはでき、読み上げでは「読み取り専用」と伝わります。値は変わりませんが、フォームでは送られます。',
        ].join('\n'),
      },
    },
  },
  args: {
    label: '配送の時間',
    color: 'neutral',
    disabled: false,
    readOnly: false,
    required: false,
    children: null,
  },
  argTypes: {
    label: { control: 'text' },
    caption: { control: 'text' },
    errorText: { control: 'text' },
    warningText: { control: 'text' },
    infoText: { control: 'text' },
    color: {
      control: 'inline-radio',
      options: colors,
      table: { defaultValue: { summary: "'neutral'" } },
    },
    direction: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
      table: { defaultValue: { summary: "'vertical'" } },
    },
    wrap: { control: 'boolean' },
    itemWidth: {
      control: 'inline-radio',
      options: ['fit', 'equal'],
      table: { defaultValue: { summary: "'fit'" } },
    },
    frame: {
      control: 'inline-radio',
      options: ['none', 'card'],
      table: { defaultValue: { summary: "'none'" } },
    },
    selectedIndicator: {
      control: 'inline-radio',
      options: ['line', 'fill'],
      table: { defaultValue: { summary: "'line'" } },
    },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    required: { control: 'boolean' },
    children: { control: false },
  },
  render: (args) => (
    <div className="max-w-sm">
      <RadioGroup {...args}>
        <Radio value="am" label="午前" />
        <Radio value="pm" label="午後" caption="14 時から 18 時" />
        <Radio value="night" label="夜" disabled />
      </RadioGroup>
    </div>
  ),
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  args: { defaultValue: 'am' },
};

export const Required: Story = {
  name: '必須',
  args: { required: true, caption: '必ず選んでください' },
  parameters: {
    docs: {
      description: {
        story:
          '`required` を付けると、見出しの後ろに「必須」のタグが出て、グループ（role="radiogroup"）に aria-required が付きます。印は読み上げから外れます。印の形は `requiredMark`（`tag`・`asterisk`・`none`）で変えられます。',
      },
    },
  },
  play: async ({ canvas }) => {
    const group = canvas.getByRole('radiogroup', { name: '配送の時間' });
    await expect(group).toHaveAttribute('aria-required', 'true');
    // グループのキャプションは、グループにだけ付く
    await expect(group).toHaveAccessibleDescription('必ず選んでください');
    // 1つずつのラジオの説明は、その選択肢の 2 行目だけ（グループのキャプションは二度読まない）
    await expect(canvas.getByRole('radio', { name: '午前' })).toHaveAccessibleDescription('');
    await expect(canvas.getByRole('radio', { name: '午後' })).toHaveAccessibleDescription(
      '14 時から 18 時'
    );
  },
};

export const Horizontal: Story = {
  tags: ['visual'],
  name: '横に並べる',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`direction="horizontal"` は、選択肢ごとの文字の幅のまま 1 行に並べます。`wrap` で入りきらない選択肢を折り返し、`itemWidth="equal"` で同じ幅の列にそろえます。',
      },
    },
  },
  render: () => (
    <div className="flex max-w-xl flex-col gap-8">
      <RadioGroup label="メールで知らせる" defaultValue="yes" direction="horizontal">
        <Radio value="yes" label="はい" />
        <Radio value="no" label="いいえ" />
      </RadioGroup>
      <div className="max-w-64">
        <RadioGroup label="性別（wrap）" direction="horizontal" wrap>
          <Radio value="female" label="女性" />
          <Radio value="male" label="男性" />
          <Radio value="none" label="回答しない" />
        </RadioGroup>
      </div>
      <RadioGroup
        label="プラン（itemWidth=equal）"
        defaultValue="free"
        direction="horizontal"
        itemWidth="equal"
      >
        <Radio value="free" label="無料" caption="月 3 件まで" />
        <Radio
          value="pro"
          label="プロ"
          caption="件数の上限なし。チームで使うときは、あとから席を足せます"
        />
        <Radio value="team" label="チーム" caption="10 人から" />
      </RadioGroup>
      <RadioGroup
        label="配送の時間（itemWidth=equal・wrap）"
        direction="horizontal"
        itemWidth="equal"
        wrap
      >
        {['午前', '12〜14 時', '14〜16 時', '16〜18 時', '18〜20 時', '19〜21 時'].map((time) => (
          <Radio key={time} value={time} label={time} />
        ))}
      </RadioGroup>
    </div>
  ),
};

const planRadios = (disabledTeam = false) => [
  <Radio key="free" value="free" label="フリー" caption="個人の試用に" labelAside="0 円" />,
  <Radio
    key="standard"
    value="standard"
    label="スタンダード"
    caption="記事 100 本まで"
    labelAside="月 500 円"
  />,
  <Radio
    key="team"
    value="team"
    label="チーム"
    caption="5 人まで"
    labelAside="月 1,500 円"
    disabled={disabledTeam}
  />,
];

export const Card: Story = {
  tags: ['visual'],
  name: 'カードの形',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`frame="card"` は、選択肢 1 つずつを Card と同じ白い面・輪郭・角のカードにし、カードのどこを押しても選ばれます。題（`label`）・説明（`caption`）に加え、`labelAside` で値段などを右端に置けます。選んでいるカードは、面を白のまま輪郭の上に色の線を重ねます（`selectedIndicator="line"`、既定）。`selectedIndicator="fill"` は面も色の淡い面にし、選んでいることをより強く見せます。キーボードのフォーカスの線はカードの外に出します。`direction`・`itemWidth` と組み合わせられます。',
      },
    },
  },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <div className="flex flex-wrap items-start gap-8">
        <div className="w-72">
          <RadioGroup label="プラン" frame="card" defaultValue="standard">
            {planRadios()}
          </RadioGroup>
        </div>
        <div className="w-72">
          <RadioGroup
            label="プラン（fill・primary）"
            frame="card"
            selectedIndicator="fill"
            color="primary"
            defaultValue="standard"
          >
            {planRadios(true)}
          </RadioGroup>
        </div>
      </div>
      <RadioGroup
        label="プラン（横・同じ幅）"
        frame="card"
        direction="horizontal"
        itemWidth="equal"
        defaultValue="standard"
      >
        {planRadios()}
      </RadioGroup>
    </div>
  ),
};

export const CardClick: Story = {
  name: 'カードを押す',
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: 'カードのどこを押しても選ばれます。値段の文字を押しても選ばれます。' },
    },
  },
  render: () => (
    <div className="w-72">
      <RadioGroup label="プラン" frame="card" defaultValue="standard">
        {planRadios()}
      </RadioGroup>
    </div>
  ),
  play: async ({ canvas }) => {
    // 値段の文字の上にあるのは、カードいっぱいに広げた横の文字の押せる範囲
    const aside = canvas.getByText('0 円').getBoundingClientRect();
    const hit = document.elementFromPoint(
      aside.left + aside.width / 2,
      aside.top + aside.height / 2
    );
    await expect(hit).toBeInstanceOf(HTMLLabelElement);
    if (hit instanceof HTMLElement) await userEvent.click(hit);
    await expect(canvas.getByRole('radio', { name: 'フリー' })).toBeChecked();
    // 値段は名前に入らず、説明として読む（caption の前）
    await expect(canvas.getByRole('radio', { name: 'スタンダード' })).toHaveAccessibleDescription(
      '月 500 円 記事 100 本まで'
    );
  },
};

export const CardWithLink: Story = {
  name: 'カードの中のリンク',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '説明（`caption`）の中にリンクやボタンを置くと、カードの押せる範囲より上に出るので、マウスでもそのまま押せます。カードのほかの場所を押すと選ばれます。読み取り専用のカードは、マウスを載せても塗りを変えません。',
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-8">
      <div className="w-72">
        <RadioGroup label="プラン" frame="card" defaultValue="free">
          <Radio value="free" label="フリー" caption="個人の試用に" labelAside="0 円" />
          <Radio
            value="standard"
            label="スタンダード"
            caption={
              <>
                記事 100 本まで。<Link href="#compare">詳しい比較</Link>
              </>
            }
            labelAside="月 500 円"
          />
        </RadioGroup>
      </div>
      <div className="w-72">
        <RadioGroup label="プラン（読み取り専用）" frame="card" readOnly defaultValue="free">
          <Radio value="free" label="フリー" caption="個人の試用に" labelAside="0 円" />
        </RadioGroup>
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    // リンクの上にあるのはリンク（押せる範囲の広がりに覆われない）
    const link = canvas.getByRole('link', { name: '詳しい比較' });
    // 折り返したときは外枠の真ん中が文字の外になるので、1 行目の真ん中で確かめる
    const rect = link.getClientRects()[0];
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    await expect(link.contains(hit)).toBe(true);
    await expect(canvas.getByRole('radio', { name: 'スタンダード' })).not.toBeChecked();
    // 読み取り専用のカードには、載せたときの塗りを付けない
    const readOnlyGroup = canvas.getByRole('radiogroup', { name: 'プラン（読み取り専用）' });
    const card = readOnlyGroup.querySelector<HTMLElement>('[data-radio-card]')!;
    await expect(card.className).not.toContain('hover:');
  },
};

export const HorizontalKeyboard: Story = {
  name: '横に並べたときのキーボード',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: '横に並べても 1 つのグループです。矢印キーで隣の選択肢へ移って選びます。',
      },
    },
  },
  render: () => (
    <RadioGroup label="メールで知らせる" defaultValue="yes" direction="horizontal">
      <Radio value="yes" label="はい" />
      <Radio value="no" label="いいえ" />
    </RadioGroup>
  ),
  play: async ({ canvas }) => {
    const group = canvas.getByRole('radiogroup', { name: 'メールで知らせる' });
    await expect(group).toBeInTheDocument();
    const yes = canvas.getByRole('radio', { name: 'はい' });
    const no = canvas.getByRole('radio', { name: 'いいえ' });
    await userEvent.click(yes);
    await userEvent.keyboard('{ArrowRight}');
    await expect(no).toBeChecked();
    await expect(no).toHaveFocus();
  },
};

export const Messages: Story = {
  tags: ['visual'],
  name: 'エラー',
  args: { required: true, errorText: '配送の時間を選んでください' },
  parameters: {
    docs: {
      description: {
        story:
          'エラーは選択肢の下に丸の「!」と赤い文字で出し、選んでいない丸の塗りを淡い赤にします。押せない選択肢（夜）は、エラーでも押せない丸の色のままです。行はグループの説明につながります。',
      },
    },
  },
};

export const ReadOnly: Story = {
  tags: ['visual'],
  name: '読み取り専用',
  args: { readOnly: true, defaultValue: 'am' },
  parameters: {
    controls: { exclude: ['readOnly'] },
    docs: {
      description: {
        story:
          '`readOnly` のグループは、丸が押せないときと同じ見た目になります。横の文字は読むための文字なので、本文の色のままです。フォーカスはでき、読み上げではグループが「読み取り専用」と伝わります。矢印キーでも押しても選び直せませんが、フォームでは値が送られます。',
      },
    },
  },
  play: async ({ canvas }) => {
    // 読み上げは「読み取り専用」（aria-readonly はグループが持つ。role="radio" は持てない）
    const group = canvas.getByRole('radiogroup', { name: '配送の時間' });
    await expect(group).toHaveAttribute('aria-readonly', 'true');
    const am = canvas.getByRole('radio', { name: '午前' });
    const pm = canvas.getByRole('radio', { name: '午後' });
    // 押せない（aria-disabled）とは伝えない
    await expect(am).not.toHaveAttribute('aria-disabled');
    // 押しても選び直せない
    await userEvent.click(pm);
    await expect(am).toHaveAttribute('aria-checked', 'true');
    await expect(pm).toHaveAttribute('aria-checked', 'false');
    // フォーカスできる（見た目の比較は、線のない状態で撮るので最後に外す）
    am.focus();
    await expect(am).toHaveFocus();
    am.blur();
  },
};

export const LabelStart: Story = {
  name: 'ラベルを左に置く',
  args: { labelPlacement: 'start', defaultValue: 'am' },
  parameters: {
    docs: {
      description: {
        story:
          '`labelPlacement="start"` で、見出しを選択肢の左に置きます。設定の画面のように、見出しと値を横に並べるときに使います。',
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('radiogroup', { name: '配送の時間' })).toBeInTheDocument();
  },
};

export const Composed: Story = {
  name: '組み立てる',
  parameters: {
    docs: {
      description: {
        story:
          '並べ方を変えたいときは、`Field` の中に `FieldLabel`・`RadioGroupControl`・`FieldCaption`・`FieldMessages` を置きます。見出し・キャプション・状態の文・`disabled`・`required` は `Field` に渡し、値と選択肢は `RadioGroupControl` に渡します。見出しはグループの名前になり、キャプションはグループにだけつながります。',
      },
    },
  },
  render: () => (
    <div className="max-w-sm">
      <Field label="配送の時間" caption="14 時から 18 時は午後です" required>
        <FieldLabel />
        <RadioGroupControl defaultValue="am">
          <Radio value="am" label="午前" />
          <Radio value="pm" label="午後" />
        </RadioGroupControl>
        <FieldCaption />
        <FieldMessages />
      </Field>
    </div>
  ),
  play: async ({ canvas }) => {
    const group = canvas.getByRole('radiogroup', { name: '配送の時間' });
    await expect(group).toHaveAttribute('aria-required', 'true');
    await expect(group).toHaveAccessibleDescription('14 時から 18 時は午後です');
    // 見出しは <label> ではない（グループの名前として付く）
    await expect(canvas.getByText('配送の時間').closest('label')).toBeNull();
    await expect(canvas.getByRole('radio', { name: '午前' })).toHaveAccessibleDescription('');
  },
};

export const HorizontalNarrow: Story = {
  name: '横並び（狭い入れ物）',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '折り返さない横並びは、狭い入れ物でも選択肢を縮めず、文字を 1 行のまま並べます。入りきらない分ははみ出すので、狭いときは `wrap` か縦の並びにします。',
      },
    },
  },
  render: () => (
    <div className="w-48 overflow-x-auto">
      <RadioGroup label="届け方" defaultValue="home" direction="horizontal">
        <Radio value="home" label="自宅に届ける" />
        <Radio value="store" label="近くの店で受け取る" />
      </RadioGroup>
    </div>
  ),
  play: async ({ canvas }) => {
    // 選択肢の文字は改行されない（1 行の高さのまま）
    for (const name of ['自宅に届ける', '近くの店で受け取る']) {
      const label = canvas.getByText(name);
      const lineHeight = parseFloat(getComputedStyle(label).lineHeight);
      await expect(label.getBoundingClientRect().height).toBeLessThan(lineHeight * 1.5);
    }
  },
};
