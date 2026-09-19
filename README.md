# @kazuemon/ui

![banner](./banner.png)

## もくひょう

- コンポーネントがいっぱいあるけど、マテリアルデザインほどかたい感じじゃないモダンなUIライブラリがつくりたい。
- とりあえず手を進めていきたいので、アクセシビリティへの対応は後ほど。

## つかうもの

- ベース: Tailwind CSS
- フォント: Mulish + IBM Plex Sans JP（等幅: Geist Mono）
- アイコン: [Phosphor Icons](https://phosphoricons.com/)

以下画像は日本語と英語を混ぜた文章を作るために、色んな単語を無理やり英語に置き換えたサンプルテキストです。

![フォントのサンプルテキスト「@kazuemon/uiは、「ぼくがかんがえたさいきょうのUIライブラリ」をConceptに、かずえもんが個人で制作しています。SimpleでModernな見た目かつ、Usabilityも重視したUI Libraryを目指しています。Designはほぼ独学で、Design Systemなどの勉強も兼ねているので、DesignのRuleにおいては正しくないかもしれません。ご容赦ください。」](./text-sample.png)

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
- [ ] HeadingAnchor
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
- [ ] FileTree
- [x] CodeGroup
- [ ] Embed
- [ ] Gallery
- [ ] ImageZoom
- [x] Bleed
- [x] Spoiler
- [ ] TypeTable
- [ ] Mermaid
- [ ] Math

### ページの枠

- [x] Container
- [x] Navbar
- [ ] Sidebar
- [ ] Stack
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
- [ ] Stepper
- [ ] NavigationMenu
- [ ] ContextMenu
- [ ] Toolbar
- [ ] CommandPalette
- [ ] BackToTop
- [ ] Menubar
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
- [ ] Chip
- [ ] Timeline
- [x] Accordion
- [x] Image
- [ ] AvatarGroup
- [ ] DescriptionList
- [ ] Stat
- [x] Meter
- [ ] Carousel
- [ ] Indicator

### 操作

- [x] Button
- [x] Link
- [ ] Toggle
- [ ] ToggleGroup
- [ ] ButtonGroup
- [x] CopyButton

### 入力

- [x] TextField
- [x] Select
- [x] Switch
- [x] Form
- [x] Textarea
- [x] Checkbox
- [x] Radio
- [ ] Fieldset
- [ ] Combobox
- [ ] Segmented Control
- [ ] Slider
- [ ] NumberField
- [ ] DatePicker
- [ ] Dropzone
- [ ] SearchField
- [ ] PasswordField
- [ ] Autocomplete
- [ ] PinField
- [ ] TagsInput
- [ ] TimePicker
- [ ] ColorPicker
- [ ] Rating
- [x] Calendar
- [ ] DateRangePicker
- [x] CheckboxGroup
- [ ] MaskInput
- [ ] Editable
- [ ] FileInput

### 通知

- [x] Notice
- [x] Loading
- [ ] Spinner
- [x] Toast
- [x] Progress
- [x] Skeleton
- [ ] StatusPanel
- [ ] LoadingOverlay

### 重なるもの

- [x] Dialog
- [x] Drawer
- [x] Popover
- [x] Tooltip
- [x] AlertDialog
- [ ] PreviewCard

### アプリの画面

Web アプリで使うものです。ポートフォリオのあとに作ります。土台は外のヘッドレス（TanStack Table・TanStack Virtual・dnd-kit）に peer dependency で乗り、ここでは見た目とトークンを持ちます。

- [ ] DataTable
- [ ] VirtualList
- [ ] Sortable
- [ ] Kanban
- [ ] Popconfirm
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

## Figma

(準備中)
