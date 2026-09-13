import { Field as BaseField } from '@base-ui/react/field';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  type ComponentType,
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { Button } from '../../src/components/Button';
import { FieldAddonButton } from '../../src/components/FieldAddon';
import type { CaptionPlacement } from '../../src/components/Field';
import { fieldStyles } from '../../src/components/field-styles';
import { EyeIcon, EyeSlashIcon, WarningCircleIcon, WarningIcon } from '../../src/components/icons';
import { Select } from '../../src/components/Select';
import { TextField } from '../../src/components/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 23: ヘルプテキスト（キャプション）とエラーを同時に出すか（原則4: ラベル / 本体 / キャプションの3層）
// F に決まり、F′ も選べる形になった（design/adr/0041）
//   F・F′ の行は、部品（TextField・Select）をそのまま使う。F は captionPlacement="top"（既定）、F′ は "bottom"。警告は warning で渡す
//   比べたときの Field は、エラーを渡すとキャプションを消し、同じ場所にエラーを出していた（現行版）
// 現行版・A〜E は、いまの部品にない形なので、この中の MessageField で組む（現行版と C の「置き換える」形も、ここで再現する）
//   MessageField は、本体の Field の外に Base UI の Field をもう1つ置き、そこにキャプションとエラーの行を並べる
//   本体の Field は display: contents にして、ラベルと本体を外の枠の並びに加え、CSS の order で並べ替える
//   読み上げの説明は、外の Field に登録した id を、本体が受け継ぐ（Base UI の LabelableProvider の parentMessageIds）
//   TextField は aria-describedby を渡して、読み上げの順を見た目の順にそろえる。Select は渡せないので、登録の順（DOM の順）になる
// 現行版・A〜E の警告の文言は、軸 20 と同じく、三角のアイコンとオリーブ色の文字で組む（比べたときの形）

type Layout =
  | 'replace'
  | 'error-first'
  | 'caption-first'
  | 'inline'
  | 'above'
  | 'help-above'
  | 'help-below';
type Status = 'normal' | 'warning' | 'error';

interface LayoutCandidate extends Candidate {
  layout: Layout;
  /** C: エラーの文に、キャプションの決まりを書き足す（部品は変えない） */
  ruleInError?: boolean;
  /** F・F′: 短いキャプションの列の Select で警告を出す（エラーと並べて見るため） */
  selectWarning?: boolean;
}

const candidates: LayoutCandidate[] = [
  {
    id: '現行版',
    layout: 'replace',
    name: '置き換える',
    intent:
      'エラーが出ると、キャプションが消え、同じ場所にエラーが出る（比べたときの Field）。キャプションがある欄は、高さが変わらない。決まりを書いたキャプションは、エラーのあいだ見えない。',
    spec: [
      ['並び', 'ラベル → 本体 → エラー'],
      ['キャプション', 'エラーのあいだ消える'],
      ['読み上げの説明', 'エラーだけ'],
      ['高さの変化', '±0px（キャプションのない欄は +24px、マウス用 +22px）'],
    ],
  },
  {
    id: 'A',
    layout: 'error-first',
    name: '両方出す（エラーが上）',
    intent:
      'キャプションを残し、エラーを本体のすぐ下に足す。何が悪いかは本体の近くに出て、決まりはその下に残る。エラーが出ると、キャプションが1行分下に動く。',
    spec: [
      ['並び', 'ラベル → 本体 → エラー → キャプション'],
      ['キャプション', '残る（1行下に動く）'],
      ['読み上げの説明', 'エラー → キャプション'],
      ['高さの変化', '+24px（マウス用 +22px）'],
    ],
  },
  {
    id: 'B',
    layout: 'caption-first',
    name: '両方出す（キャプションが上）',
    intent:
      'キャプションはいつもの場所から動かさず、その下にエラーを足す。ふだん見ている行は動かない。エラーは本体から1行離れる。',
    spec: [
      ['並び', 'ラベル → 本体 → キャプション → エラー'],
      ['キャプション', '残る（動かない）'],
      ['読み上げの説明', 'キャプション → エラー'],
      ['高さの変化', '+24px（マウス用 +22px）'],
    ],
  },
  {
    id: 'C',
    layout: 'replace',
    ruleInError: true,
    name: '置き換える（エラーに決まりを書く）',
    intent:
      '部品は今のまま。エラーの文に、キャプションの決まりを書き足す。書き方の約束だけで済むが、文が長くなり、2行になることがある。決まりのないキャプション（URL）は、エラーのあいだ消える。URL のエラーには、直し方の例を書き足す。',
    spec: [
      ['並び', 'ラベル → 本体 → エラー'],
      ['キャプション', 'エラーのあいだ消える（決まりはエラーの文に入る）'],
      ['読み上げの説明', 'エラーだけ（決まりを含む）'],
      ['高さの変化', '1行なら ±0px。2行になると +16px（パスワード。指用は Select も）'],
      ['部品の変更', '要らない（書き方の約束）'],
    ],
  },
  {
    id: 'D',
    layout: 'inline',
    name: '同じ行に続ける',
    intent:
      'キャプションの行の頭に、アイコン付きのエラーを入れ、そのあとにキャプションを続ける。1行に収まれば高さは変わらない。折り返すと1行増える。',
    spec: [
      ['並び', 'ラベル → 本体 → エラー＋キャプション（1行）'],
      ['キャプション', '残る（エラーのうしろに続く）'],
      ['アイコン', 'エラーの前に丸の「!」（#BA012D、白地 6.71:1）'],
      ['読み上げの説明', 'エラー → キャプション'],
      ['高さの変化', '1行なら ±0px。パスワードは折り返して +16px（指用はどの欄も +16px）'],
    ],
  },
  {
    id: 'E',
    layout: 'above',
    name: '例外: キャプションを本体の上に',
    intent:
      'GOV.UK の形。ラベルのすぐ下にキャプション、その下にエラー、最後に本体。入力する前に決まりを読める。原則4【固定】（キャプションは本体の下）を破るので、選ぶなら原則を変えることになる。エラーが出ると、本体そのものが下に動く。',
    spec: [
      ['並び', 'ラベル → キャプション → エラー → 本体'],
      ['キャプション', '本体の上（原則4の例外）'],
      ['読み上げの説明', 'キャプション → エラー'],
      ['高さの変化', '+24px（マウス用 +22px）。本体も同じだけ下に動く'],
    ],
  },
  {
    id: 'F',
    layout: 'help-above',
    selectWarning: true,
    name: 'ヘルプテキストを上に（ユーザーの案・既定）',
    intent:
      'ユーザーの案。ラベルのすぐ下にキャプション、その下に本体、本体のすぐ下にアイコン付きのエラーか警告。エラーは赤の丸の「!」、警告はオリーブ色の三角で見分ける。キャプションはエラーのあいだも消えず、本体も動かない。E はキャプションもエラーも本体の上に出すが、F はエラーを本体の下に出す。短いキャプションの列の Select は、エラーと並べるため警告を出している。',
    spec: [
      ['並び', 'ラベル → キャプション → 本体 → アイコン＋エラー（警告）'],
      ['キャプション', '本体の上。エラーのあいだも残る（動かない）'],
      [
        'アイコン',
        'エラーは丸の「!」、アイコンも文字も #BA012D（白地 6.71:1）。警告は三角、アイコンも文字も #727200（白地 5.09:1）',
      ],
      ['読み上げの説明', 'キャプション → エラー（警告）。URL は https:// → キャプション → エラー'],
      ['高さの変化', '+24px（マウス用 +22px）。本体は動かない'],
      [
        '原則4',
        '入力欄のヘルプテキスト（左寄せ）は、原則4のボタンのキャプション（参照画像では中央寄せ）とは別のものとして扱い、本体の上に置ける。ボタンのキャプションは本体の下のまま',
      ],
    ],
  },
  {
    id: 'F′',
    layout: 'help-below',
    selectWarning: true,
    name: 'F でヘルプテキストを下に（選べる形）',
    intent:
      'ユーザーの案の「下強制」。キャプションは本体の下の、いつもの場所から動かさない。エラーか警告は、その下にアイコン付きで足す。エラーと警告のアイコンと色は F と同じ。並びは B と同じで、B にアイコンを足した形。短いキャプションの列の Select は、F と同じく警告を出している。',
    spec: [
      ['並び', 'ラベル → 本体 → キャプション → アイコン＋エラー（警告）'],
      ['キャプション', '本体の下。エラーのあいだも残る（動かない）'],
      ['アイコン', 'F と同じ'],
      ['読み上げの説明', 'キャプション → エラー（警告）。URL は https:// → キャプション → エラー'],
      ['高さの変化', '+24px（マウス用 +22px）。本体もキャプションも動かない'],
    ],
  },
];

const columns: Column[] = [
  { label: 'パスワード', note: 'キャプションに入力の決まりがある欄。suffix にボタン' },
  { label: '短いキャプション', note: '上が TextField、下が Select。どちらも prefix 付き' },
  {
    label: '出し入れ（高さの変化）',
    note: 'ボタンで、ふだん・警告・エラーを切り替えます。下の「登録する」が動く量を見てください',
  },
];

// ── 見本の文 ──────────────────────────────────────────

interface Sample {
  caption: string;
  error: string;
  /** C のエラーの文。決まりを書き足したもの */
  errorWithRule: string;
  warning?: string;
}

const passwordSample: Sample = {
  caption: '8文字以上で、英字と数字を含めます',
  error: '数字が入っていません',
  errorWithRule: '数字が入っていません。8文字以上で、英字と数字を含めてください',
  warning: 'よく使われるパスワードに似ています',
};

const urlSample: Sample = {
  caption: 'プロフィールに表示します',
  error: 'URL の形が正しくありません',
  errorWithRule: 'URL の形が正しくありません。例: k6n.jp',
};

const wardSample: Sample = {
  caption: 'お届けは23区内だけです',
  error: 'この地域にはお届けできません',
  errorWithRule: 'この地域にはお届けできません。23区内から選んでください',
  warning: '荒川区は、お届けが翌日になります',
};

const passwordValue: Record<Status, string> = {
  normal: 'kazuemon2026',
  warning: 'password1234',
  error: 'kazuemon',
};

const wards = [
  { label: '足立区', value: 'adachi' },
  { label: '荒川区', value: 'arakawa' },
  { label: '八王子市', value: 'hachioji' },
];

// ── アイコン ──────────────────────────────────────────
// 部品のアイコン（丸の「!」と三角 — design/adr/0041）をそのまま使う。文字と並ぶので Regular の線幅（ADR-0018）
// D は1行の中に入れるので、文字の大きさに合わせて置く
const inlineIcon = 'mr-0.5 inline-block size-[1.25em] align-[-0.3em]';

// 警告の文言（ADR-0038）。オリーブ色 #727200（白地 5.09:1）。inline は D の1行に入れるとき
const WarningMessage = ({ children, inline }: { children: ReactNode; inline?: boolean }) =>
  inline ? (
    <span style={{ color: 'var(--color-fg-warning)' }}>
      <WarningIcon className={inlineIcon} />
      {children}
    </span>
  ) : (
    <span className="flex items-start gap-1" style={{ color: 'var(--color-fg-warning)' }}>
      <WarningIcon className="size-4 shrink-0" />
      {children}
    </span>
  );

// ── 本体（部品をそのまま使う） ──────────────────────────

interface ControlProps {
  status: Status;
  caption?: ReactNode;
  /** F・F′: キャプションの場所（部品の captionPlacement） */
  captionPlacement?: CaptionPlacement;
  error?: ReactNode;
  /** F・F′: 警告の文（部品の warning） */
  warning?: ReactNode;
  /** 読み上げの説明の順（MessageField が決める）。TextField だけが受け取れる */
  describedBy?: string;
}

// パスワードの表示・非表示。目のアイコンだけのボタン（アイコン単体なので線は Bold — ADR-0018）
const PasswordControl = ({
  status,
  caption,
  captionPlacement,
  error,
  warning,
  describedBy,
}: ControlProps) => {
  const [visible, setVisible] = useState(false);
  const Eye = visible ? EyeSlashIcon : EyeIcon;
  return (
    <TextField
      label="パスワード"
      type={visible ? 'text' : 'password'}
      defaultValue={passwordValue[status]}
      autoComplete="off"
      caption={caption}
      captionPlacement={captionPlacement}
      error={error}
      warning={warning}
      aria-describedby={describedBy}
      suffix={
        <FieldAddonButton
          aria-label={visible ? 'パスワードを隠す' : 'パスワードを表示'}
          onClick={() => setVisible(!visible)}
        >
          <Eye standalone />
        </FieldAddonButton>
      }
    />
  );
};

const UrlControl = ({ status, caption, captionPlacement, error, describedBy }: ControlProps) => (
  <TextField
    label="サイトの URL"
    prefix="https://"
    defaultValue={status === 'error' ? 'k6n jp' : 'k6n.jp'}
    caption={caption}
    captionPlacement={captionPlacement}
    error={error}
    aria-describedby={describedBy}
  />
);

const WardControl = ({ status, caption, captionPlacement, error, warning }: ControlProps) => (
  <Select
    label="住所"
    prefix="東京都"
    items={wards}
    defaultValue={{ normal: 'adachi', warning: 'arakawa', error: 'hachioji' }[status]}
    caption={caption}
    captionPlacement={captionPlacement}
    error={error}
    warning={warning}
  />
);

// ── 現行版・A〜E の枠 ────────────────────────────────────

const layoutCss = `
/* 本体の Field を display: contents にして、ラベルと本体を外の枠の並びに加える */
[data-axis23-nest] > :first-child { display: contents; }
/* 本体の Field の中のエラーの行。中身はなく、本体をエラーの状態にするためだけに置く */
[data-axis23-nest] > :first-child > [data-slot="field-message"] { display: none; }
/* 並び: ラベル（0）→ 上に置く行（1）→ 本体（3）→ 下に置く行（4） */
[data-axis23-nest] > :first-child > [data-slot="control"] { order: 3; }
[data-axis23-nest] > :not(:first-child) { order: 4; }
[data-axis23-nest="above"] > :not(:first-child) { order: 1; }
`;

interface MessageFieldProps {
  layout: Exclude<Layout, 'help-above' | 'help-below'>;
  caption: string;
  status: Status;
  /** エラーか警告の文 */
  message?: string;
  children: (props: { describedBy: string; invalid: boolean }) => ReactNode;
}

function MessageField({ layout, caption, status, message, children }: MessageFieldProps) {
  const id = useId();
  const styles = fieldStyles();
  const captionId = `${id}caption`;
  const messageId = `${id}message`;
  const inline = layout === 'inline';
  const invalid = status === 'error';
  const hasMessage = status !== 'normal' && !!message;
  // 現行版・C は、エラーか警告が出るとキャプションを消し、同じ場所に出す（比べたときの Field）
  const showCaption = !(layout === 'replace' && hasMessage);
  // D は1行に入れるので span にする
  const span = inline ? <span /> : undefined;
  let messageNode: ReactNode = null;
  if (hasMessage && invalid)
    messageNode = (
      <BaseField.Error
        key="message"
        id={messageId}
        match
        render={span}
        className={styles.error({ className: inline ? 'mr-1.5' : '' })}
      >
        {inline && <WarningCircleIcon className={inlineIcon} />}
        {message}
      </BaseField.Error>
    );
  else if (hasMessage)
    messageNode = (
      <BaseField.Description
        key="message"
        id={messageId}
        render={span}
        className={styles.caption({ className: inline ? 'mr-1.5' : '' })}
      >
        <WarningMessage inline={inline}>{message}</WarningMessage>
      </BaseField.Description>
    );
  const captionNode = showCaption && (
    <BaseField.Description key="caption" id={captionId} render={span} className={styles.caption()}>
      {caption}
    </BaseField.Description>
  );
  // B・E は、キャプションを DOM でもエラーの前に置く（読み上げの説明の順と、Select の登録の順をそろえる）
  const captionFirst = layout !== 'error-first' && layout !== 'inline';
  const nodes = captionFirst ? [captionNode, messageNode] : [messageNode, captionNode];
  const ids = captionFirst
    ? [showCaption && captionId, hasMessage && messageId]
    : [hasMessage && messageId, showCaption && captionId];
  return (
    <BaseField.Root
      invalid={invalid || undefined}
      data-axis23-nest={layout}
      className={styles.root()}
    >
      {children({ describedBy: ids.filter(Boolean).join(' '), invalid })}
      {inline ? <p className={styles.caption()}>{nodes}</p> : nodes}
    </BaseField.Root>
  );
}

// 案ごとに、部品をそのまま使うか（F・F′）、MessageField で包むかを決める
function Sampled({
  candidate,
  status,
  sample,
  Control,
}: {
  candidate: LayoutCandidate;
  status: Status;
  sample: Sample;
  Control: ComponentType<ControlProps>;
}) {
  const { layout } = candidate;
  if (layout === 'help-above' || layout === 'help-below') {
    // 決まった形（design/adr/0041）。キャプション・エラー・警告を、部品の props でそのまま渡す
    return (
      <Control
        status={status}
        caption={sample.caption}
        captionPlacement={layout === 'help-above' ? 'top' : 'bottom'}
        error={status === 'error' ? sample.error : undefined}
        warning={status === 'warning' ? sample.warning : undefined}
      />
    );
  }
  // 現行版・C の警告は、軸 20 と同じくキャプションの場所に出す（キャプションを置き換える）
  const errorText = candidate.ruleInError ? sample.errorWithRule : sample.error;
  const message = status === 'error' ? errorText : sample.warning;
  return (
    <MessageField layout={layout} caption={sample.caption} status={status} message={message}>
      {({ describedBy, invalid }) => (
        <Control status={status} error={invalid || undefined} describedBy={describedBy} />
      )}
    </MessageField>
  );
}

// ── 出し入れの列 ────────────────────────────────────────

const statuses: [Status, string][] = [
  ['normal', 'ふだん'],
  ['warning', '警告'],
  ['error', 'エラー'],
];

const signed = (value: number) =>
  value === 0 ? '±0px' : `${value > 0 ? '+' : '−'}${Math.abs(value)}px`;

// 密度で寸法が変わるので、ふだんの高さは密度ごとに覚える（寸法の値を鍵にする）
const densityKey = (el: Element) => {
  const style = getComputedStyle(el);
  return ['--size-control', '--space-field-gap', '--text-caption']
    .map((name) => style.getPropertyValue(name).trim())
    .join(' ');
};

function ToggleCell({ candidate }: { candidate: LayoutCandidate }) {
  const [status, setStatus] = useState<Status>('normal');
  const box = useRef<HTMLDivElement>(null);
  // ふだんのときの高さと本体の位置（密度ごと）。ほかの状態との差を出す
  const base = useRef(new Map<string, { height: number; top: number }>());
  const [shift, setShift] = useState<{ height: number; dh?: number; dy?: number }>({ height: 0 });
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const control = el.querySelector('[data-slot="control"]');
      const height = Math.round(rect.height);
      const top = control ? Math.round(control.getBoundingClientRect().top - rect.top) : 0;
      const key = densityKey(el);
      if (status === 'normal') base.current.set(key, { height, top });
      const normal = base.current.get(key);
      setShift({ height, dh: normal && height - normal.height, dy: normal && top - normal.top });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [status]);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {statuses.map(([value, label]) => (
          <Button
            key={value}
            // 選んでいる状態はグレーの塗り。青い塗りは「登録する」だけにする（原則7）
            appearance={status === value ? 'filled' : 'outline'}
            color="neutral"
            aria-pressed={status === value}
            onClick={() => setStatus(value)}
          >
            {label}
          </Button>
        ))}
      </div>
      <p className="text-xs leading-5 text-fg-subtle tabular-nums" data-axis23-readout>
        {shift.dh === undefined || shift.dy === undefined
          ? `高さ ${shift.height}px（密度を変えました。「ふだん」を押すと、差を測り直します）`
          : `高さ ${shift.height}px（ふだんとの差 ${signed(shift.dh)}）・本体の位置 ${signed(shift.dy)}`}
      </p>
      <div ref={box}>
        <Sampled
          key={status}
          candidate={candidate}
          status={status}
          sample={passwordSample}
          Control={PasswordControl}
        />
      </div>
      <Button color="primary" className="self-start">
        登録する
      </Button>
    </div>
  );
}

const Cell = ({ column, candidate }: { column: Column; candidate: LayoutCandidate }) => {
  if (column.label === 'パスワード')
    return (
      <div data-axis23-field="password">
        <Sampled
          candidate={candidate}
          status="error"
          sample={passwordSample}
          Control={PasswordControl}
        />
      </div>
    );
  if (column.label === '短いキャプション')
    return (
      <div className="flex flex-col gap-5">
        <div data-axis23-field="url">
          <Sampled candidate={candidate} status="error" sample={urlSample} Control={UrlControl} />
        </div>
        <div data-axis23-field="select">
          <Sampled
            candidate={candidate}
            status={candidate.selectWarning ? 'warning' : 'error'}
            sample={wardSample}
            Control={WardControl}
          />
        </div>
      </div>
    );
  return <ToggleCell candidate={candidate} />;
};

// ── エラーと警告の両方（design/adr/0041 の追記） ──────────────────
// 比べたときは、両方渡すとエラーだけを出していた。「エラーと警告が両方あるなら、両方出したいですね」
// 部品は、エラーの行、警告の行の順に出す。行の間は --space-field-gap（キャプションと行の間と同じ）
// Select のシートの見出しにも、ヘルプテキストの下に両方出す（行の間は、ヘルプテキストとの間と同じ 4px）

type BothStatus = Status | 'both';

const bothStatuses: [BothStatus, string][] = [...statuses, ['both', '両方']];

// パスワード（数字がなく、よく使われる形）: エラー「数字が入っていません」と警告「よく使われるパスワードに似ています」
function BothPassword({
  status,
  captionPlacement,
}: {
  status: BothStatus;
  captionPlacement: CaptionPlacement;
}) {
  const [visible, setVisible] = useState(false);
  const Eye = visible ? EyeSlashIcon : EyeIcon;
  return (
    <TextField
      label="パスワード"
      type={visible ? 'text' : 'password'}
      defaultValue="password"
      autoComplete="off"
      caption={passwordSample.caption}
      captionPlacement={captionPlacement}
      error={status === 'error' || status === 'both' ? passwordSample.error : undefined}
      warning={status === 'warning' || status === 'both' ? passwordSample.warning : undefined}
      suffix={
        <FieldAddonButton
          aria-label={visible ? 'パスワードを隠す' : 'パスワードを表示'}
          onClick={() => setVisible(!visible)}
        >
          <Eye standalone />
        </FieldAddonButton>
      }
    />
  );
}

// 住所: 選んだ区の警告（荒川区）と、選択肢に関係ない欄のエラー（郵便番号と合わない）
const BothWard = ({ captionPlacement }: { captionPlacement: CaptionPlacement }) => (
  <Select
    label="住所"
    prefix="東京都"
    items={wards}
    defaultValue="arakawa"
    caption={wardSample.caption}
    captionPlacement={captionPlacement}
    error="郵便番号と合いません"
    warning={wardSample.warning}
  />
);

function BothToggle() {
  const [status, setStatus] = useState<BothStatus>('both');
  const box = useRef<HTMLDivElement>(null);
  const base = useRef(new Map<string, number>());
  const [shift, setShift] = useState<{ height: number; dh?: number }>({ height: 0 });
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const measure = () => {
      const height = Math.round(el.getBoundingClientRect().height);
      const key = densityKey(el);
      if (status === 'normal') base.current.set(key, height);
      const normal = base.current.get(key);
      setShift({ height, dh: normal === undefined ? undefined : height - normal });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [status]);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {bothStatuses.map(([value, label]) => (
          <Button
            key={value}
            appearance={status === value ? 'filled' : 'outline'}
            color="neutral"
            aria-pressed={status === value}
            onClick={() => setStatus(value)}
          >
            {label}
          </Button>
        ))}
      </div>
      <p className="text-xs leading-5 text-fg-subtle tabular-nums" data-axis23-both-readout>
        {shift.dh === undefined
          ? `高さ ${shift.height}px（「ふだん」を押すと、差を測ります）`
          : `高さ ${shift.height}px（ふだんとの差 ${signed(shift.dh)}）`}
      </p>
      <div ref={box}>
        <BothPassword status={status} captionPlacement="top" />
      </div>
      <Button color="primary" className="self-start">
        登録する
      </Button>
    </div>
  );
}

const bothColumns: [CaptionPlacement, string, string][] = [
  ['top', 'F（既定）', 'ラベル → キャプション → 本体 → エラー → 警告'],
  ['bottom', 'F′（captionPlacement="bottom"）', 'ラベル → 本体 → キャプション → エラー → 警告'],
];

function BothStory() {
  return (
    <div className="flex min-h-screen flex-col gap-8 bg-bg px-6 py-8 text-fg">
      <style>{layoutCss}</style>
      <header className="flex max-w-[68ch] flex-col gap-3">
        <p className="text-sm font-bold text-fg-subtle">後半の軸 23（あとから決めたこと）</p>
        <h1 className="text-2xl font-heading">エラーと警告の両方</h1>
        <div className="flex flex-col gap-2 text-sm leading-6 text-fg-muted">
          <p>
            比べたときは、エラーと警告を両方渡すと、エラーだけを出していました。「エラーと警告が両方あるなら、両方出したいですね」
          </p>
          <p>
            いまの部品は、本体の下に、エラーの行、警告の行の順に出します。行の間は、キャプションと行の間と同じ（指用
            8px・マウス用 6px）です。読み上げの説明は、キャプション → エラー →
            警告の順です。読み上げ（polite）と、0.2 秒で開き閉じる動きは、行ごとに働きます。
          </p>
          <p>
            Select
            は、指で操作する狭い画面ではシートで開きます。シートの見出しにも、ヘルプテキストの下に両方出します（行の間は
            4px）。
          </p>
        </div>
      </header>
      <div className="grid gap-x-8 gap-y-10 md:grid-cols-3">
        {bothColumns.map(([placement, label, note]) => (
          <section
            key={placement}
            className="flex min-w-0 flex-col gap-4 border-t border-line pt-6"
            data-axis23-both={placement}
          >
            <div className="flex flex-col gap-0.5">
              <h2 className="text-sm font-bold">{label}</h2>
              <p className="text-xs text-fg-subtle">{note}</p>
            </div>
            <div className="flex flex-col gap-5">
              <BothPassword status="both" captionPlacement={placement} />
              <BothWard captionPlacement={placement} />
            </div>
          </section>
        ))}
        <section
          className="flex min-w-0 flex-col gap-4 border-t border-line pt-6"
          data-axis23-both="toggle"
        >
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-bold">出し入れ（高さの変化）</h2>
            <p className="text-xs text-fg-subtle">
              ボタンで、ふだん・警告・エラー・両方を切り替えます。行ごとに開き、閉じます
            </p>
          </div>
          <BothToggle />
        </section>
      </div>
    </div>
  );
}

// ── ストーリー ────────────────────────────────────────

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/23 ヘルプテキストとエラー',
  id: 'design-review-23-caption-error',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'F' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D', 'E', 'F', 'F′'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <>
      <style>{layoutCss}</style>
      <Comparison
        index={23}
        axis="ヘルプテキストとエラーを同時に出すか"
        pick={pick}
        candidates={candidates}
        columns={columns}
        renderCell={(column, candidate) => {
          const found = candidates.find((c) => c.id === candidate.id);
          return (
            found && (
              <div data-axis23-row={found.id} data-axis23-col={column.label}>
                <Cell column={column} candidate={found} />
              </div>
            )
          );
        }}
      >
        <p>
          ヘルプテキスト（キャプション）とエラーを、同時に出すかを選びます。「ヘルプテキストとバリデーションエラーを同時に表示するかどうか迷っています。」
        </p>
        <p>
          比べたときの Field
          は、エラーが出るとキャプションを消し、同じ場所にエラーを出していました（現行版）。キャプションに入力の決まり（「8文字以上で、英字と数字を含めます」）を書いていると、エラーのあいだ、その決まりが見えません。
        </p>
        <p>
          両方出すと（A・B・D・E・F・F′）、行が1つ増えます。エラーが出たり消えたりするたびに、下の内容が動きます。右の列のボタンで切り替えると、動く量を確かめられます。警告（ADR-0038）の文言も、エラーと同じ場所に出しています。
        </p>
        <p>
          読み上げの順も、案によって違います。各案の表の「読み上げの説明」は、Chrome
          が読み上げソフトに渡す説明を測ったものです。本体に入ったとき、名前（ラベル）のあとに読まれます。
        </p>
        <p>
          F に決まり、F′ も選べるようになりました（ADR-0041）。F・F′
          の行は、部品（TextField・Select）をそのまま描いています。現行版と A〜E
          は、比べたときの形をこのストーリーの中で組んでいます。C
          は部品を変えず、エラーの文の書き方で決まりを伝える案です。E
          は原則4【固定】を破る例外として並べています。密度は、ツールバーの「密度」で切り替えられます。
        </p>
        <p>
          F と F′ はユーザーの案です。「タイトル → ヘルプテキスト → 入力欄 →
          バリデーションエラーアイコン＋テキスト（warning/danger）」を既定にし（F）、ヘルプテキストを下に置く形も選べるようにします（F′）。「ヘルプテキストは上下を選べる（デフォルトは上、選択肢として下強制も選べる）が個人的には好みです。」エラーと警告は、どちらもアイコン付きです。F
          はエラーを本体のすぐ下に出します。F′
          はヘルプテキストを本体の下の場所から動かさず、その下にエラーを足します。
        </p>
        <p>
          入力欄のヘルプテキストは左寄せで、原則4のボタンのキャプション（参照画像では中央寄せ）とは別のものとして扱います。そのため
          F
          のように本体の上に置いても、原則4に沿った形です。ボタンのキャプションは、本体の下のままです。
        </p>
        <p>
          判断の基準（軽い・やわらかい・整然・人懐っこい）に最も近い案を1つ選び、一言添えてください。
        </p>
      </Comparison>
    </>
  ),
};

export const Both: Story = {
  name: 'エラーと警告の両方',
  render: () => <BothStory />,
};
