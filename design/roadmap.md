# ロードマップ

@kazuemon/ui で作りたいもの・作ったものの一覧です。部品を作ったら、ここにチェックを付けます。使い方は[ドキュメント](https://ui.k6n.jp)にあります。

## つくりたい機能

部品ではなく、ライブラリとして使うときに要るものです。

- [ ] ダークモード
- [x] Server Components 対応
- [ ] 多言語
- [ ] Tailwind なしでの利用
- [ ] スタイルの衝突を避ける（Tailwind あり・なし）
- [x] ツリーシェイク

## つくりたいコンポーネント

### 土台

- [x] Icon
- [x] VisuallyHidden
- [x] ThemeProvider
- [x] Collapsible
- [x] ScrollArea
- [x] AspectRatio
- [x] Portal
- [x] Transition

### 文字

- [x] Heading
- [x] HeadingAnchor
- [x] Text
- [x] Code
- [x] Kbd
- [x] Mark
- [ ] Ruby
- [ ] Highlight
- [x] NumberFormat

### 本文

- [x] Prose
- [x] CodeBlock
- [x] Blockquote
- [x] Figure
- [x] Callout
- [x] LinkCard
- [x] Footnote
- [x] Steps
- [x] FileTree
- [x] CodeGroup
- [x] Embed
- [x] Video
- [x] Gallery
- [x] ImageZoom
- [x] Bleed
- [x] Spoiler
- [ ] TypeTable
- [ ] Mermaid
- [ ] Math

### ページの枠

- [x] Container
- [x] Navbar
- [x] Sidebar
- [x] Inspector
- [x] Stack
- [x] Grid
- [x] Masonry
- [x] SkipLink
- [x] Affix
- [ ] Splitter

### ナビゲーション

- [x] TableOfContents
- [x] Pager
- [x] Breadcrumb
- [x] Tabs
- [x] Pagination
- [x] Menu
- [x] Stepper
- [x] NavigationMenu
- [x] ContextMenu
- [x] Toolbar
- [x] CommandPalette
- [ ] BackToTop
- [x] Menubar
- [x] Tree
- [ ] Tour

### 表示

- [x] Tag
- [x] Card
- [x] List
- [x] Table
- [x] Divider
- [x] Time
- [x] RelativeTime
- [x] Avatar
- [x] Badge
- [x] Chip
- [x] Timeline
- [x] Accordion
- [x] Image
- [x] AvatarGroup
- [x] DescriptionList
- [x] Stat
- [x] Meter
- [x] Carousel
- [x] Thumbnails
- [ ] Indicator
- [ ] BarList
- [ ] Sparkline・グラフの見た目
- [ ] タイムテーブル
- [ ] CompareSlider（Splitter も計画にあるので、同時に作れそう）

### 操作

- [x] Button
- [x] Link
- [x] Toggle
- [x] ToggleGroup
- [x] ButtonGroup
- [x] CopyButton

### 入力

- [x] TextField
- [x] Select
- [x] Switch
- [x] Form
- [x] Textarea
- [x] Checkbox
- [x] Radio
- [x] Fieldset
- [x] Combobox
- [x] Segmented Control
- [x] Slider
- [x] NumberField
- [x] DateField
- [x] DatePicker
- [x] Dropzone
- [x] SearchField
- [x] PasswordField
- [x] Autocomplete
- [x] PinField
- [x] TagsInput
- [x] TimeField
- [x] TimePicker
- [ ] ColorPicker
- [ ] Rating
- [x] Calendar
- [x] DateRangePicker
- [x] CheckboxGroup
- [x] MaskField
- [ ] Editable
- [ ] FileInput

### 通知

- [x] Notice
- [x] Loading
- [x] Spinner
- [x] Toast
- [x] Progress
- [x] Skeleton
- [x] StatusPanel
- [ ] LoadingOverlay

### 重なるもの

- [x] Dialog
- [x] Drawer
- [x] Popover
- [x] Tooltip
- [x] AlertDialog
- [x] PreviewCard

### アプリの画面

Web アプリで使うものです。実装の重い部品（DataTable・VirtualList・Sortable・Kanban）は、見た目だけを部品にし、外のヘッドレス（TanStack Table・TanStack Virtual・dnd-kit）とのつなぎ方はレシピ（Storybook の Recipes）で案内します。ヘッドレスは依存に入れないので、使う人がアプリに入れて、レシピのコードを写して使います。

- [x] DataTable
- [ ] VirtualList
- [x] Sortable
- [ ] Kanban
- [x] Popconfirm
- [ ] ActionBar
- [ ] Mentions
- [ ] Cascader
- [ ] TreeSelect
- [ ] Transfer

### チャット

- [ ] Composer
- [ ] MessageList
- [ ] Bubble
- [ ] TypingIndicator
- [ ] Attachment
- [ ] StreamingText
