import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Checkbox } from '../../src/components/checkbox/Checkbox';
import { CheckboxGroup } from '../../src/components/checkbox/CheckboxGroup';
import { Radio, RadioGroup } from '../../src/components/radio/Radio';
import { Select } from '../../src/components/select/Select';
import { Switch } from '../../src/components/switch/Switch';
import { CheckMarkIcon } from '../../src/internal/icons';
import { statePseudo } from '../../src/stories/story-states';

// 後半の軸 177: 選ぶ部品（Checkbox・Radio・Switch・Select）の読み取り専用の形
//   文字の欄の読み取り専用は ADR-0170 で「塗りなし・破線の輪郭・一段淡い文字」に決めた。選ぶ部品の形はまだない
//   候補 A・B は、部品にまだ読み取り専用の見た目がないので、Base UI が置く data-readonly を手がかりに、
//   このストーリーの中の CSS（readOnlyLook）で描く。差はトークン（--ro-line-*）だけで、部品のコードは変えていない
//   Select は readOnly の props を持たないので、本体（data-slot="control"）に文字の欄と同じ見た目を当てて並べる

// 候補のトークンから読み取り専用の輪郭を描く。かかるのは data-ro を付けたセルの中だけ
//   フォーカスの列（data-preview="focus"）では輪郭を消し、部品がふだん出すフォーカスの線に戻す
const readOnlyLook = `
  [data-ro] :is([role='checkbox'], [role='radio'])[data-readonly] {
    --color-choice: transparent;
    --color-choice-hover: transparent;
    --choice-on: transparent;
    --choice-mark: var(--color-fg-muted);
    border: var(--ro-line-width) var(--ro-line-style) var(--ro-line-color);
  }
  [data-ro] [role='switch'][data-readonly] {
    --switch-track: transparent;
    border: var(--ro-line-width) var(--ro-line-style) var(--ro-line-color);
    padding: calc(var(--switch-inset) - var(--ro-line-width));
  }
  [data-ro] [role='switch'][data-readonly] > * {
    background-color: var(--color-fg-muted);
    box-shadow: none;
  }
  [data-ro] [data-slot='control'] {
    --color-field: transparent;
    --color-field-hover: transparent;
    --color-field-focus: transparent;
    --color-field-addon: transparent;
    color: var(--color-fg-muted);
    outline: var(--ro-line-width) var(--ro-line-style) var(--ro-line-color);
    outline-offset: calc(-1 * var(--ro-line-width));
  }
  [data-preview='focus'] [data-ro] :is([role='checkbox'], [role='radio'], [role='switch'])[data-readonly] {
    border-color: transparent;
  }
  [data-preview='focus'] [data-ro] [data-slot='control'] {
    outline-color: transparent;
  }
`;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '読み取り専用がなく、押せないで代用する',
    intent:
      '読み取り専用の形がないので、書き換えさせたくないときは押せない（disabled）で止めるほかありません。箱もトラックも薄いグレーの地になり、横の文字も薄くなります。値を読ませたいだけなのに、押せないものと同じ見た目になり、読み上げでも「無効」と読まれます。',
    spec: [
      ['箱・トラック', '押せない塗り（--color-choice-disabled・--color-switch-off-disabled）'],
      ['選んだ箱', '押せない地に灰色の印（--color-choice-neutral-on-disabled）'],
      ['横の文字', '押せない文字（--color-on-field-disabled）'],
      ['Select', '押せない欄の塗りと文字'],
    ],
  },
  {
    id: 'A',
    name: '塗りなし・破線の輪郭',
    intent:
      '文字の欄の読み取り専用（ADR-0170）と同じ考えにそろえます。箱の塗りを外し、3:1 の濃さの細い破線で形だけを残します。チェックと丸は、白ではなく一段淡いグレーで描きます。トグルは箱ではないので、トラックの塗りを外して破線のピルにし、ノブは白いままだと見えなくなるので一段淡いグレーにし、押せることの記号である影を外します。Select は文字の欄の形をそのまま使えます。心配なのは、18px・22px の小さな箱で破線の点が数えるほどしか入らず、輪郭がざらついて見えないかどうかです。',
    spec: [
      ['箱の塗り', 'なし（hover でも変えない）'],
      ['輪郭', '細い破線（--border-width-thin・dashed・--color-line-strong）'],
      ['印（チェック・丸・ノブ）', '一段淡いグレー（--color-fg-muted）'],
      ['ノブの影', 'なし'],
      ['フォーカス', '輪郭を消し、ふだんの離した線（focusRing）だけにする'],
      ['Select', '文字の欄と同じ（ADR-0170）。▼ は残す'],
    ],
    tokens: {
      '--ro-line-width': 'var(--border-width-thin)',
      '--ro-line-style': 'dashed',
      '--ro-line-color': 'var(--color-line-strong)',
    },
  },
  {
    id: 'B',
    name: '塗りなし・細い実線の輪郭',
    intent:
      'A と同じで、輪郭だけを細い実線にします。小さな箱で破線が潰れて見えるときの案です。線が 1 本につながるぶん形は読みやすくなりますが、白いボタンやカードの細い輪郭と同じ線になり、線の種類では見分けられません。塗りのあるなしだけが手がかりになります。トグルと Select への当て方は A と同じです。',
    spec: [
      ['箱の塗り', 'なし（hover でも変えない）'],
      ['輪郭', '細い実線（--border-width-thin・solid・--color-line-strong）'],
      ['印（チェック・丸・ノブ）', '一段淡いグレー（--color-fg-muted）'],
      ['ノブの影', 'なし'],
      ['フォーカス', '輪郭を消し、ふだんの離した線（focusRing）だけにする'],
      ['Select', '文字の欄と同じ形で、輪郭だけ実線。▼ は残す'],
    ],
    tokens: {
      '--ro-line-width': 'var(--border-width-thin)',
      '--ro-line-style': 'solid',
      '--ro-line-color': 'var(--color-line-strong)',
    },
  },
  {
    id: 'C',
    name: '箱をやめ、選んだものだけを印と文字で見せる',
    intent:
      '箱そのものをやめ、選んだものだけをチェックの印と文字で並べます。値を読ませるだけなら、これがいちばん読みやすい形です。ただし選んでいない項目は消えるので、何が選べたのかは分かりません。トグルのように 2 つで 1 組のものは OFF を出せず、「—」になります。フォーカスも止まらず、読み上げでも「読み取り専用のチェックボックス」とは読まれないので、値を写す欄というより、キーと値の組を示す部品に近づきます。',
    spec: [
      ['箱・トラック', 'なし'],
      ['印', 'チェック（--spacing-icon-input の大きさ）'],
      ['値の文字', '一段淡いグレー（--color-fg-muted）'],
      ['選んでいない項目', '出さない（何もなければ「—」）'],
      ['フォーカス', '止まらない'],
    ],
  },
];

const columns: Column[] = [
  { label: '選んだ', note: 'チェックあり・ON・値あり' },
  { label: '選んでいない', note: 'チェックなし・OFF・値なし' },
  { label: 'フォーカス', note: '輪郭が枠線に変わる', preview: 'focus' },
  { label: 'グループ', note: '3 つ並べたところ' },
  { label: 'キャプションつき' },
  { label: '押せない', note: '比較のため。読み取り専用ではなく disabled' },
  { label: '大きい指用', note: '指の密度・coarse-large' },
];

const prefectures = [
  { label: '東京都', value: 'tokyo' },
  { label: '大阪府', value: 'osaka' },
  { label: '福岡県', value: 'fukuoka' },
];

/** 部品に渡す止め方。読み取り専用（A・B）か、押せない（現行版・押せないの列） */
interface Mode {
  readOnly?: boolean;
  disabled?: boolean;
}

/** 4 つの部品を縦に並べる。checked で選んだ・選んでいないを、caption でキャプションの有無を切り替える */
function Quartet({ mode, checked, caption }: { mode: Mode; checked: boolean; caption: boolean }) {
  return (
    <>
      <Checkbox
        label="利用規約に同意する"
        caption={caption ? '登録した日から適用されます' : undefined}
        defaultChecked={checked}
        {...mode}
      />
      <RadioGroup label="お支払い" defaultValue={checked ? 'card' : undefined} {...mode}>
        <Radio
          value="card"
          label="クレジットカード"
          caption={caption ? '登録済みのカードを使います' : undefined}
          {...mode}
        />
      </RadioGroup>
      <Switch
        label="メールで受け取る"
        caption={caption ? 'お知らせを毎朝まとめて送ります' : undefined}
        defaultChecked={checked}
        {...mode}
      />
      <Select
        label="都道府県"
        caption={caption ? '登録した住所から選んでいます' : undefined}
        items={prefectures}
        defaultValue={checked ? 'tokyo' : undefined}
        placeholder="選んでください"
        disabled={mode.disabled}
      />
    </>
  );
}

/** グループの列。チェックボックスとラジオを 3 つずつ並べる */
function Groups({ mode }: { mode: Mode }) {
  return (
    <>
      <CheckboxGroup label="受け取る通知" defaultValue={['news', 'event']}>
        <Checkbox value="news" label="お知らせ" {...mode} />
        <Checkbox value="event" label="イベント" {...mode} />
        <Checkbox value="campaign" label="キャンペーン" {...mode} />
      </CheckboxGroup>
      <RadioGroup label="お支払い" defaultValue="card" {...mode}>
        <Radio value="card" label="クレジットカード" {...mode} />
        <Radio value="bank" label="銀行振込" {...mode} />
        <Radio value="conv" label="コンビニ払い" {...mode} />
      </RadioGroup>
    </>
  );
}

/** 候補 C の 1 まとまり。選んだものだけを印と文字で出し、何もなければ「—」を出す */
function ValueField({
  label,
  caption,
  values,
}: {
  label?: ReactNode;
  caption?: ReactNode;
  values: string[];
}) {
  return (
    <div className="flex flex-col gap-(--spacing-field-gap)">
      {label && (
        <span className="text-(length:--text-label) leading-(--leading-label) font-bold text-fg">
          {label}
        </span>
      )}
      {values.length === 0 ? (
        <span className="text-input text-fg-subtle">—</span>
      ) : (
        values.map((value) => (
          <span
            key={value}
            className="flex items-center gap-(--choice-gap) text-input text-fg-muted"
          >
            <CheckMarkIcon className="size-(--spacing-icon-input) shrink-0" />
            {value}
          </span>
        ))
      )}
      {caption && (
        <span className="text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle">
          {caption}
        </span>
      )}
    </div>
  );
}

function ValueOnly({ column }: { column: Column }) {
  if (column.label === 'グループ') {
    return (
      <>
        <ValueField label="受け取る通知" values={['お知らせ', 'イベント']} />
        <ValueField label="お支払い" values={['クレジットカード']} />
      </>
    );
  }
  const caption = column.label === 'キャプションつき';
  const on = column.label !== '選んでいない';
  return (
    <>
      <ValueField
        caption={caption ? '登録した日から適用されます' : undefined}
        values={on ? ['利用規約に同意する'] : []}
      />
      <ValueField
        label="お支払い"
        caption={caption ? '登録済みのカードを使います' : undefined}
        values={on ? ['クレジットカード'] : []}
      />
      <ValueField
        label="メールで受け取る"
        caption={caption ? 'お知らせを毎朝まとめて送ります' : undefined}
        values={on ? ['受け取る'] : []}
      />
      <ValueField
        label="都道府県"
        caption={caption ? '登録した住所から選んでいます' : undefined}
        values={on ? ['東京都'] : []}
      />
    </>
  );
}

function renderCell(column: Column, candidate: Candidate) {
  // 「押せない」の列はどの案も disabled で描き、読み取り専用の見た目を当てない（比べるため）
  const disabled = candidate.id === '現行版' || column.label === '押せない';
  const valueOnly = candidate.id === 'C' && !disabled;
  const readOnly = !disabled && !valueOnly;
  const mode: Mode = disabled ? { disabled: true } : { readOnly: true };
  const cell = (
    <div data-ro={readOnly || undefined} className="flex flex-col gap-4">
      {valueOnly ? (
        <ValueOnly column={column} />
      ) : column.label === 'グループ' ? (
        <Groups mode={mode} />
      ) : (
        <Quartet
          mode={mode}
          checked={column.label !== '選んでいない'}
          caption={column.label === 'キャプションつき'}
        />
      )}
    </div>
  );
  if (column.label === '大きい指用') {
    return (
      <div data-density="coarse" className="coarse-large">
        {cell}
      </div>
    );
  }
  return cell;
}

const meta = {
  title: 'Design Review/177 選ぶ部品の読み取り専用',
  id: 'design-review-177-choice-readonly',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({
      focusVisible: ':is([role="checkbox"],[role="radio"],[role="switch"])',
      focusWithin: '[data-slot="control"]',
    }),
  },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <>
      <style>{readOnlyLook}</style>
      <Comparison
        index={177}
        axis="選ぶ部品の読み取り専用"
        pick={pick}
        candidates={candidates}
        columns={columns}
        renderCell={renderCell}
      >
        <p>
          決定: 見た目は押せないときと同じにし、読み上げと操作だけを変えます。Select
          は文字の欄と同じ破線にします（ADR-0196）。
        </p>
        <p>
          チェックボックス・ラジオ・トグル・Select
          を、値は見せるけれど書き換えさせない形にするときの見た目です。文字の欄は ADR-0170
          で「塗りなし・破線の輪郭・一段淡い文字」に決めましたが、選ぶ部品の形はまだありません。
        </p>
        <p>
          読み取り専用は、押せない（disabled）とは意味が違います。フォーカスで止まり、フォームで送られ、読み上げでは「読み取り専用」と読まれます。値は読むための文字なので、押せないときのようには薄くしません。
        </p>
        <p>
          A・B はまだ部品に読み取り専用の見た目がないので、このストーリーの中の CSS
          で描いています。A と B の差は、輪郭の種類のトークンだけです。Select は読み取り専用の props
          を持たないので、本体に文字の欄と同じ見た目を当てています（押すと選択肢は開きます）。▼
          を残すかどうかも、あわせて決めたいところです。
        </p>
        <p>
          いちばん見たいのは、18px・22px
          の小さな箱で破線（A）が読めるかどうかです。密度はツールバーの「密度」で固定して、指の大きさでも確かめてください。
        </p>
        <p>どれを既定にするか、ほかに選べるようにしたい案があれば教えてください。</p>
      </Comparison>
    </>
  ),
};
