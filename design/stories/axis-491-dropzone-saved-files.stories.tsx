import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  type DropzoneFileEntry,
  DropzoneFileList,
} from '../../src/components/dropzone/DropzoneFileList';

// 軸 491: DropzoneFileList で、保存済みのファイル（サーバーにあるもの）と、いま選んだものの見分け方
const meta = {
  title: 'Design Review/491 保存済みのファイルの見分け方',
  id: 'design-review-491-dropzone-saved-files',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      hover: ['[data-preview="link"] a'],
      focusVisible: ['[data-preview="link"] li:first-child a'],
    },
  },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

// 見本: 保存済みの 2 つ（画像・PDF）と、いま選んでアップロード中の 1 つ
const photo = (fill: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="${fill}"/><circle cx="84" cy="36" r="14" fill="#fff4cc"/><path d="M0 90 L40 56 L70 84 L120 60 L120 120 L0 120Z" fill="#2f6b58"/></svg>`)}`;
// いま選んだ画像（16×9 px の PNG。thumbnail で実際に描ける中身）
const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAIAAAC0SDtlAAAA0UlEQVR42mNoOPqDJMTQefIHQbTn9hMggrAZJp37gRVNPvMNiCDsj+8vAhGEzTD70k8QuvBtzonXUDaYO3fHNSACMoDcRVe+AdHsc5+BbIal134uvvhl/s5r8zefX3TiJZC75Mo3CBeEdl4DcoGCCw49hChgWHXp4/ytF6HSm88vO/F84a7rcC4QAbnIIgwLtl6cuOpAQlcPEAEZEFEgI7KtxbYkLb1/8ox1x+GqgeIMQY21+tkRcATketeWIouY5ccDteVNnuVSkQfkMiDLEYMAA9EatvHG6TMAAAAASUVORK5CYII=';
const png = (name: string) =>
  new File([Uint8Array.from(atob(PNG_BASE64), (c) => c.charCodeAt(0))], name, {
    type: 'image/png',
  });

const files: DropzoneFileEntry[] = [
  { name: 'cover.jpg', size: 380_000, url: photo('#cfeafc'), type: 'image/jpeg' },
  { name: 'resume.pdf', size: 820_000, url: '#resume.pdf' },
  { file: png('kazuemon-icon.png'), size: 42_000, progress: 60 },
];

const removeSame = (entry: DropzoneFileEntry) => `外す: ${entry.name ?? entry.file?.name}`;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '見分けない',
    intent:
      '保存済みのものも、いま選んだものと同じ行で並べる。名前はリンクにするが、下線も印もない。外すボタンの読み上げも同じ「外す」',
    spec: [
      ['印', 'なし'],
      ['名前のリンク', '下線なし（地の文と同じ）'],
      ['面', '同じ塗り'],
      ['外すボタンの読み上げ', 'どちらも「外す: 名前」'],
    ],
    tokens: {
      '--dropzone-file-saved-mark-display': 'none',
      '--dropzone-file-link-decoration': 'none',
      '--dropzone-file-saved-bg': 'var(--color-field)',
      '--dropzone-file-saved-border-color': 'transparent',
    },
  },
  {
    id: 'A',
    name: '印＋リンクの下線',
    intent:
      '大きさの後ろに「保存済み」の文字を添え、名前に薄い下線を引いてリンクだと分かるようにする。thumbnail では左上に小さな印を置く。面は同じ',
    spec: [
      ['印', '「・ 保存済み」（キャプションの色）。thumbnail は左上の札'],
      ['名前のリンク', '薄い下線（hover で濃く）'],
      ['面', '同じ塗り'],
      ['外すボタンの読み上げ', '保存済みは「削除: 名前」'],
    ],
    tokens: {
      '--dropzone-file-saved-mark-display': 'inline',
      '--dropzone-file-link-decoration': 'underline',
      '--dropzone-file-saved-bg': 'var(--color-field)',
      '--dropzone-file-saved-border-color': 'transparent',
    },
  },
  {
    id: 'B',
    name: 'リンクの下線だけ',
    intent:
      '印は出さず、名前の下線だけで分ける。いま選んだものはリンクにならないので、下線のあるなしが見分けになる。文字が増えない',
    spec: [
      ['印', 'なし'],
      ['名前のリンク', '薄い下線（hover で濃く）'],
      ['面', '同じ塗り'],
      ['外すボタンの読み上げ', '保存済みは「削除: 名前」'],
    ],
    tokens: {
      '--dropzone-file-saved-mark-display': 'none',
      '--dropzone-file-link-decoration': 'underline',
      '--dropzone-file-saved-bg': 'var(--color-field)',
      '--dropzone-file-saved-border-color': 'transparent',
    },
  },
  {
    id: 'C',
    name: '面で分ける＋印',
    intent:
      '保存済みの行は塗らずに細い枠だけにし、いま選んだもの（まだ確定していないもの）を塗りで目立たせる。A の印と下線も付ける',
    spec: [
      ['印', '「・ 保存済み」。thumbnail は左上の札'],
      ['名前のリンク', '薄い下線'],
      ['面', '保存済みは地の色＋細い枠、いま選んだものは塗り'],
      ['外すボタンの読み上げ', '保存済みは「削除: 名前」'],
    ],
    tokens: {
      '--dropzone-file-saved-mark-display': 'inline',
      '--dropzone-file-link-decoration': 'underline',
      '--dropzone-file-saved-bg': 'var(--color-bg)',
      '--dropzone-file-saved-border-color': 'var(--color-line)',
    },
  },
];

const columns: Column[] = [
  { label: 'list', note: '保存済み 2 つと、アップロード中の 1 つ' },
  { label: 'thumbnail', note: '同じ 3 つ。画像は url をそのまま出す' },
  {
    label: 'リンクに hover・フォーカス',
    note: 'list。1 行目はフォーカス、全行 hover',
    preview: 'link',
  },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={491}
      axis="保存済みのファイルの見分け方"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const removeName = candidate.id === '現行版' ? removeSame : undefined;
        return (
          <div className="w-80">
            <DropzoneFileList
              files={files}
              variant={column.label === 'thumbnail' ? 'thumbnail' : 'list'}
              onRemove={() => {}}
              removeName={removeName}
            />
          </div>
        );
      }}
    >
      <p>
        DropzoneFileList
        に、保存済みのファイル（サーバーに置いてあるもの）を並べられるようにしました。{' '}
        <code>file</code>
        を書かずに <code>name</code>・<code>size</code>・<code>url</code>{' '}
        を渡すと保存済みとして扱い、名前は <code>url</code>
        を新しいタブで開くリンクになります。編集の画面で、前に上げたファイルと、いま足したファイルを
        1 つの一覧に並べる使い方です。
      </p>
      <p>
        選ぶのは、保存済みとそうでないものの見分け方（印・リンクの下線・面）です。外すボタンの読み上げは、保存済みを「削除」、いま選んだものを「外す」に分けます（現行版の行だけ、どちらも「外す」）。どれを既定にするか、ほかに選べるようにしたい案があれば添えてください。
      </p>
    </Comparison>
  ),
};
