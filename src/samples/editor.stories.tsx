import {
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  CopyIcon,
  LinkIcon,
  ScissorsIcon,
  ClipboardTextIcon,
  TextBIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../components/button/Button';
import { ButtonGroup } from '../components/button-group/ButtonGroup';
import { ContextMenu } from '../components/context-menu/ContextMenu';
import { DatePicker } from '../components/date-picker/DatePicker';
import { Dropzone } from '../components/dropzone/Dropzone';
import { Heading } from '../components/heading/Heading';
import { Icon } from '../components/icon/Icon';
import {
  MenuCheckboxItem,
  MenuItem,
  MenuSeparator,
  MenuSubmenu,
} from '../components/menu/MenuItem';
import { Menubar, MenubarMenu } from '../components/menubar/Menubar';
import { Prose } from '../components/prose/Prose';
import { Select } from '../components/select/Select';
import { Switch } from '../components/switch/Switch';
import { Tab, TabList, TabPanel, Tabs } from '../components/tabs/Tabs';
import { TagsInput } from '../components/tags-input/TagsInput';
import { Text } from '../components/text/Text';
import { TextField } from '../components/text-field/TextField';
import { Textarea } from '../components/textarea/Textarea';
import { ToastProvider, useToast } from '../components/toast/Toast';
import { ToggleGroup } from '../components/toggle/ToggleGroup';
import { Toggle } from '../components/toggle/Toggle';
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from '../components/toolbar/Toolbar';
import { Temporal } from '../index';
import { MarkdownPreview } from './editor-markdown';
import { densityOf } from './SamplePage';

const initialBody = `## はじめに

このブログは、自分で作った **UI ライブラリ** の部品だけで組んでいます。
書いた記事は _Markdown_ で残し、そのまま公開します。

## 使っているもの

- 見出しと本文は \`Prose\` で整える
- コードは CodeBlock、図は Figure
- ~~CMS~~ は使わない

> 小さく作って、毎日少しずつ直す。

詳しくは [ドキュメント](#docs) を見てください。`;

// 書式の印。斜体は太字の ** と見分けるため _ にする
const marks = { bold: '**', italic: '_', strike: '~~' } as const;
type Mark = keyof typeof marks;

const headingItems = [
  { label: '本文', value: 'p' },
  { label: '見出し 2', value: 'h2' },
  { label: '見出し 3', value: 'h3' },
];
const headingPrefix: Record<string, string> = { p: '', h2: '## ', h3: '### ' };

interface Selection {
  start: number;
  end: number;
}

/** 選んでいる範囲が、印で挟まれているか */
function isWrapped(text: string, { start, end }: Selection, mark: string) {
  return (
    start >= mark.length &&
    text.slice(start - mark.length, start) === mark &&
    text.slice(end, end + mark.length) === mark
  );
}

/** 選んでいる範囲のある行の、見出しの段 */
function headingOf(text: string, { start }: Selection) {
  const line = text.slice(text.lastIndexOf('\n', start - 1) + 1);
  if (line.startsWith('### ')) return 'h3';
  if (line.startsWith('## ')) return 'h2';
  return 'p';
}

/** 本文と、元に戻す・やり直すための履歴 */
function useHistory(initial: string) {
  const [state, setState] = useState({
    past: [] as string[],
    present: initial,
    future: [] as string[],
  });
  return {
    value: state.present,
    set: (next: string) =>
      setState((s) =>
        next === s.present ? s : { past: [...s.past, s.present], present: next, future: [] }
      ),
    undo: () =>
      setState((s) =>
        s.past.length === 0
          ? s
          : { past: s.past.slice(0, -1), present: s.past.at(-1)!, future: [s.present, ...s.future] }
      ),
    redo: () =>
      setState((s) =>
        s.future.length === 0
          ? s
          : { past: [...s.past, s.present], present: s.future[0], future: s.future.slice(1) }
      ),
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}

/** 画面が広いか（本文とプレビューを並べるか、タブで切り替えるか） */
function useWide() {
  const query = '(min-width: 1024px)';
  const [wide, setWide] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setWide(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return wide;
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="flex min-w-0 flex-col gap-2">
      <Heading level={2} size="md">
        {title}
      </Heading>
      {children}
    </section>
  );
}

function EditorScreen() {
  const toast = useToast();
  const wide = useWide();
  const body = useHistory(initialBody);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState<Selection>({ start: 0, end: 0 });
  const [showPreview, setShowPreview] = useState(true);
  const [showSettings, setShowSettings] = useState(true);
  const [title, setTitle] = useState('UI ライブラリでブログを作る');
  const [published, setPublished] = useState(false);

  // 欄で選んでいる範囲。書式のボタンを押しても欄の範囲は残るので、操作のたびに欄から直に読む
  const currentSelection = (): Selection => {
    const el = textarea.current;
    return el ? { start: el.selectionStart, end: el.selectionEnd } : selection;
  };
  const readSelection = () => setSelection(currentSelection());
  // 書き換えたあと、選んでいる範囲を戻して欄にフォーカスを返す
  const replace = (next: string, nextSelection: Selection) => {
    body.set(next);
    setSelection(nextSelection);
    requestAnimationFrame(() => {
      textarea.current?.focus();
      textarea.current?.setSelectionRange(nextSelection.start, nextSelection.end);
    });
  };

  const toggleMark = (mark: Mark) => {
    const text = body.value;
    const m = marks[mark];
    const current = currentSelection();
    const { start, end } = current;
    if (isWrapped(text, current, m)) {
      replace(
        text.slice(0, start - m.length) + text.slice(start, end) + text.slice(end + m.length),
        {
          start: start - m.length,
          end: end - m.length,
        }
      );
    } else {
      replace(text.slice(0, start) + m + text.slice(start, end) + m + text.slice(end), {
        start: start + m.length,
        end: end + m.length,
      });
    }
  };

  const setHeading = (level: string) => {
    const text = body.value;
    const current = currentSelection();
    const lineStart = text.lastIndexOf('\n', current.start - 1) + 1;
    const rest = text.slice(lineStart).replace(/^#{1,3}\s+/, '');
    const removed = text.length - lineStart - rest.length;
    const prefix = headingPrefix[level] ?? '';
    const shift = prefix.length - removed;
    replace(text.slice(0, lineStart) + prefix + rest, {
      start: Math.max(lineStart, current.start + shift),
      end: Math.max(lineStart, current.end + shift),
    });
  };

  const insertLink = () => {
    const text = body.value;
    const { start, end } = currentSelection();
    const label = text.slice(start, end) || 'リンク';
    const inserted = `[${label}](https://)`;
    replace(text.slice(0, start) + inserted + text.slice(end), {
      start: start + label.length + 3,
      end: start + inserted.length - 1,
    });
  };

  const clipboard = async (action: 'cut' | 'copy' | 'paste') => {
    const text = body.value;
    const { start, end } = currentSelection();
    try {
      if (action === 'paste') {
        const pasted = await navigator.clipboard.readText();
        replace(text.slice(0, start) + pasted + text.slice(end), {
          start: start + pasted.length,
          end: start + pasted.length,
        });
        return;
      }
      await navigator.clipboard.writeText(text.slice(start, end));
      if (action === 'cut') replace(text.slice(0, start) + text.slice(end), { start, end: start });
    } catch {
      toast.show({ status: 'danger', title: 'クリップボードを使えませんでした', timeout: 4000 });
    }
  };

  const save = () =>
    toast.show({
      status: 'success',
      title: published ? '記事を公開しました' : '下書きを保存しました',
      timeout: 4000,
    });

  // 本文の欄。右クリック（指では長押し）で、編集のメニューを開く
  const editorArea = (
    <ContextMenu
      title="本文"
      trigger={
        <div className="min-w-0">
          <Textarea
            accessibleName="本文"
            value={body.value}
            onValueChange={body.set}
            ref={textarea}
            onSelect={readSelection}
            onKeyUp={readSelection}
            onMouseUp={readSelection}
            minRows={16}
            maxRows={40}
            className="font-mono"
          />
        </div>
      }
      // 開く前に、選んでいる範囲を読み直す（右クリックで範囲が変わることがある）
      onOpenChange={(open) => open && readSelection()}
    >
      <MenuItem icon={<ScissorsIcon />} shortcut="Ctrl+X" onClick={() => clipboard('cut')}>
        切り取り
      </MenuItem>
      <MenuItem icon={<CopyIcon />} shortcut="Ctrl+C" onClick={() => clipboard('copy')}>
        コピー
      </MenuItem>
      <MenuItem icon={<ClipboardTextIcon />} shortcut="Ctrl+V" onClick={() => clipboard('paste')}>
        貼り付け
      </MenuItem>
      <MenuSeparator />
      <MenuItem icon={<LinkIcon />} shortcut="Ctrl+K" onClick={insertLink}>
        リンクを挿入
      </MenuItem>
    </ContextMenu>
  );

  const preview = (
    <Prose className="min-w-0 rounded-card border border-line p-6">
      <h1>{title}</h1>
      <MarkdownPreview source={body.value} />
    </Prose>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-4 py-2">
        <Text weight="bold">Kakuz</Text>
        <Menubar accessibleName="Kakuz のメニュー">
          <MenubarMenu label="ファイル">
            <MenuItem shortcut="Ctrl+N">新しい記事</MenuItem>
            <MenuSubmenu
              items={
                <>
                  <MenuItem>Storybook の見本を作り直す</MenuItem>
                  <MenuItem>Base UI で部品を組む</MenuItem>
                </>
              }
            >
              最近の下書き
            </MenuSubmenu>
            <MenuSeparator />
            <MenuItem shortcut="Ctrl+S" onClick={save}>
              保存
            </MenuItem>
            <MenuSubmenu
              items={
                <>
                  <MenuItem>Markdown（.md）</MenuItem>
                  <MenuItem>MDX（.mdx）</MenuItem>
                </>
              }
            >
              書き出す
            </MenuSubmenu>
          </MenubarMenu>
          <MenubarMenu label="編集">
            <MenuItem shortcut="Ctrl+Z" disabled={!body.canUndo} onClick={body.undo}>
              元に戻す
            </MenuItem>
            <MenuItem shortcut="Ctrl+Shift+Z" disabled={!body.canRedo} onClick={body.redo}>
              やり直す
            </MenuItem>
            <MenuSeparator />
            <MenuItem shortcut="Ctrl+X" onClick={() => clipboard('cut')}>
              切り取り
            </MenuItem>
            <MenuItem shortcut="Ctrl+C" onClick={() => clipboard('copy')}>
              コピー
            </MenuItem>
            <MenuItem shortcut="Ctrl+V" onClick={() => clipboard('paste')}>
              貼り付け
            </MenuItem>
          </MenubarMenu>
          <MenubarMenu label="表示">
            <MenuCheckboxItem checked={showPreview} onCheckedChange={setShowPreview}>
              プレビュー
            </MenuCheckboxItem>
            <MenuCheckboxItem checked={showSettings} onCheckedChange={setShowSettings}>
              記事の設定
            </MenuCheckboxItem>
          </MenubarMenu>
          <MenubarMenu label="挿入">
            <MenuItem shortcut="Ctrl+K" onClick={insertLink}>
              リンク
            </MenuItem>
            <MenuItem onClick={() => replace(`${body.value}\n\n---\n`, selection)}>
              区切り線
            </MenuItem>
            <MenuItem
              onClick={() =>
                replace(`${body.value}\n\n\`\`\`tsx\n<Button>保存</Button>\n\`\`\`\n`, selection)
              }
            >
              コードブロック
            </MenuItem>
          </MenubarMenu>
        </Menubar>
        <Text size="sm" variant="muted" className="ms-auto">
          {published ? '公開中' : '下書き'}
        </Text>
        <ButtonGroup aria-label="記事の操作">
          <Button variant="outline" onClick={save}>
            保存
          </Button>
          <Button variant="outline" onClick={() => setShowPreview((shown) => !shown)}>
            {showPreview ? 'プレビューを閉じる' : 'プレビュー'}
          </Button>
        </ButtonGroup>
      </header>

      <div className="border-b border-line px-4 py-2">
        <Toolbar aria-label="書式">
          <ToolbarGroup aria-label="元に戻す・やり直す">
            <ToolbarButton
              iconOnly
              aria-label="元に戻す"
              disabled={!body.canUndo}
              onClick={body.undo}
            >
              <Icon icon={ArrowCounterClockwiseIcon} standalone />
            </ToolbarButton>
            <ToolbarButton
              iconOnly
              aria-label="やり直す"
              disabled={!body.canRedo}
              onClick={body.redo}
            >
              <Icon icon={ArrowClockwiseIcon} standalone />
            </ToolbarButton>
          </ToolbarGroup>
          <ToolbarSeparator />
          <Select
            accessibleName="段落の種類"
            items={headingItems}
            value={headingOf(body.value, selection)}
            onValueChange={(level) => level && setHeading(level)}
            presentation="popover"
            className="w-36"
          />
          <ToolbarSeparator />
          <ToggleGroup
            multiple
            aria-label="文字の書式"
            value={(Object.keys(marks) as Mark[]).filter((mark) =>
              isWrapped(body.value, selection, marks[mark])
            )}
          >
            <Toggle value="bold" iconOnly aria-label="太字" onClick={() => toggleMark('bold')}>
              <Icon icon={TextBIcon} standalone />
            </Toggle>
            <Toggle value="italic" iconOnly aria-label="斜体" onClick={() => toggleMark('italic')}>
              <Icon icon={TextItalicIcon} standalone />
            </Toggle>
            <Toggle
              value="strike"
              iconOnly
              aria-label="取り消し線"
              onClick={() => toggleMark('strike')}
            >
              <Icon icon={TextStrikethroughIcon} standalone />
            </Toggle>
          </ToggleGroup>
          <ToolbarSeparator />
          <ToolbarButton onClick={insertLink}>
            <Icon icon={LinkIcon} />
            リンク
          </ToolbarButton>
        </Toolbar>
      </div>

      <main
        className={[
          'grid flex-1 content-start items-start gap-6 p-4',
          wide && showSettings && showPreview && 'grid-cols-[minmax(0,1fr)_minmax(0,1fr)_18rem]',
          wide && showSettings && !showPreview && 'grid-cols-[minmax(0,1fr)_18rem]',
          wide && !showSettings && showPreview && 'grid-cols-2',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <TextField
          label="タイトル"
          value={title}
          onValueChange={setTitle}
          className={wide ? 'col-span-full' : undefined}
        />
        {wide ? (
          <>
            <Panel title="本文">{editorArea}</Panel>
            {showPreview && <Panel title="プレビュー">{preview}</Panel>}
          </>
        ) : (
          <Tabs defaultValue="write">
            <TabList aria-label="本文の表示">
              <Tab value="write">書く</Tab>
              <Tab value="preview">プレビュー</Tab>
            </TabList>
            <TabPanel value="write">{editorArea}</TabPanel>
            <TabPanel value="preview">{preview}</TabPanel>
          </Tabs>
        )}
        {showSettings && (
          <aside aria-label="記事の設定" className="flex flex-col gap-5">
            <TagsInput label="タグ" placeholder="タグを打つ" defaultValue={['Design', 'React']} />
            <DatePicker label="公開日" defaultValue={Temporal.PlainDate.from('2026-10-10')} />
            <Dropzone
              label="カバー画像"
              caption="JPEG・PNG、5MB まで"
              accept="image/png,image/jpeg"
              maxSize={5 * 1000 * 1000}
            />
            <Switch
              label="公開する"
              caption="オフのあいだは、下書きとして自分だけが見られます"
              checked={published}
              onCheckedChange={setPublished}
            />
          </aside>
        )}
      </main>
    </div>
  );
}

const meta = {
  title: 'Overview/見本',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'ブログの記事を書く画面の見本です。上にメニューの帯と書式の帯を置き、本文（Markdown）とプレビューを並べ、右に記事の設定を置きます。本文の上で右クリックすると、編集のメニューが開きます。',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Editor: Story = {
  name: 'エディタ',
  render: (_args, { globals }) => (
    <div data-density={densityOf(globals)} className="min-h-screen bg-bg text-fg">
      <ToastProvider>
        <EditorScreen />
      </ToastProvider>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = await canvas.findByRole('textbox', { name: '本文' });
    // 「はじめに」を選んで太字にすると、本文が ** で挟まれ、太字のトグルが押された状態になる
    const start = (body as HTMLTextAreaElement).value.indexOf('はじめに');
    await userEvent.click(body);
    (body as HTMLTextAreaElement).setSelectionRange(start, start + 'はじめに'.length);
    body.dispatchEvent(new Event('select', { bubbles: true }));
    const bold = canvas.getByRole('button', { name: '太字' });
    await userEvent.click(bold);
    await waitFor(() => expect((body as HTMLTextAreaElement).value).toContain('**はじめに**'));
    await expect(bold).toHaveAttribute('aria-pressed', 'true');
    // 元に戻すと、太字が外れる
    await userEvent.click(canvas.getByRole('button', { name: '元に戻す' }));
    await waitFor(() => expect((body as HTMLTextAreaElement).value).not.toContain('**はじめに**'));
    // 開いたときの見た目に、確かめで動かしたフォーカスを残さない
    (canvasElement.ownerDocument.activeElement as HTMLElement | null)?.blur();
  },
};
