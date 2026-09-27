import type { ReactNode } from 'react';

import { Button } from '../../src/components/button/Button';
import {
  Inspector,
  type InspectorPresentation,
  type InspectorSide,
} from '../../src/components/inspector/Inspector';
import { InspectorLayout, InspectorTrigger } from '../../src/components/inspector/InspectorLayout';
import { Switch } from '../../src/components/switch/Switch';
import { TextField } from '../../src/components/text-field/TextField';

// 軸 350〜355（Inspector）の比較で共有する、領域の代わりの枠
// 帯に開閉のボタン（「詳細」）を置き、本文にファイルの一覧を並べる。どのセルも押して開閉を試せる

const files = [
  '企画書.pdf',
  '見積もり.xlsx',
  'ロゴ.svg',
  '議事録 9月.md',
  '写真 001.jpg',
  '写真 002.jpg',
  '契約書.pdf',
];

export function InspectorArea({
  presentation = 'push',
  side = 'right',
  defaultOpen = true,
  width = 'w-[560px]',
  children,
}: {
  presentation?: InspectorPresentation;
  side?: InspectorSide;
  defaultOpen?: boolean;
  width?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`flex h-[320px] ${width} max-w-full flex-col overflow-hidden rounded-card border border-line bg-bg`}
    >
      <InspectorLayout
        header={
          <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-2">
            <span className="font-bold">ファイル</span>
            <InspectorTrigger render={<Button variant="outline">詳細</Button>} />
          </div>
        }
        defaultOpen={defaultOpen}
        inspector={
          <Inspector
            title="企画書.pdf"
            description="PDF・2.4 MB"
            presentation={presentation}
            side={side}
          >
            {children ?? (
              <div className="flex flex-col gap-4">
                <TextField label="名前" defaultValue="企画書.pdf" />
                <Switch label="リンクを知っている人に公開" defaultChecked />
                <Switch label="コメントを許可" />
              </div>
            )}
          </Inspector>
        }
      >
        <ul className="flex flex-col p-2">
          {files.map((file) => (
            <li key={file} className="truncate rounded-control px-3 py-2 odd:bg-neutral">
              {file}
            </li>
          ))}
        </ul>
      </InspectorLayout>
    </div>
  );
}
