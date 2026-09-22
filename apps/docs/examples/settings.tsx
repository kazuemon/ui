'use client';

import {
  AlertDialog,
  type AlertDialogColor,
  Button,
  Checkbox,
  CheckboxGroup,
  type CaptionPlacement,
  Heading,
  Link,
  Notice,
  Radio,
  RadioGroup,
  Select,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  type TabsColor,
  Text,
  Textarea,
  TextField,
  type ToastVariant,
  ToastProvider,
  type ToastPosition,
  useToast,
} from '@kazuemon/ui';
import { type ReactNode, useState } from 'react';

import { SamplePage } from './sample-page';
import { town } from './sites';
import { environmentNote, type Example } from './types';

// 設定の画面: タブで分けた設定と、保存のお知らせ（Toast）、取り消せない操作の確認（AlertDialog）

interface SettingsArgs {
  tabsColor: TabsColor;
  toastPosition: ToastPosition;
  toastAppearance: ToastVariant;
  captionPlacement: CaptionPlacement;
  dangerTone: AlertDialogColor;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <Heading level={2} size={3}>
        {title}
      </Heading>
      {children}
    </section>
  );
}

function SaveBar({ label = '保存する' }: { label?: string }) {
  const toast = useToast();
  return (
    <div className="flex gap-2">
      <Button
        color="primary"
        onClick={() => toast.show({ status: 'success', title: '保存しました', timeout: 4000 })}
      >
        {label}
      </Button>
      <Button variant="outline">キャンセル</Button>
    </div>
  );
}

function AccountPanel({ captionPlacement }: { captionPlacement: CaptionPlacement }) {
  return (
    <div className="flex flex-col gap-8">
      <Section title="プロフィール">
        <TextField
          label="表示名"
          defaultValue="かずえもん"
          caption="ほかの人に表示される名前です"
          captionPlacement={captionPlacement}
        />
        <TextField
          label="ユーザー名"
          defaultValue="kazuemon"
          caption="半角英数字で入力します"
          captionPlacement={captionPlacement}
        />
        <Textarea
          label="自己紹介"
          defaultValue="UI ライブラリを作っています。"
          caption="160 文字まで"
          captionPlacement={captionPlacement}
          minRows={3}
        />
        <Select
          label="言語"
          items={[
            { label: '日本語', value: 'ja' },
            { label: 'English', value: 'en' },
          ]}
          defaultValue="ja"
        />
      </Section>
      <Text size="sm" variant="subtle">
        メールアドレスの変更は、<Link href="#security">セキュリティ</Link>から行います。
      </Text>
      <SaveBar />
    </div>
  );
}

function NotificationPanel({ captionPlacement }: { captionPlacement: CaptionPlacement }) {
  return (
    <div className="flex flex-col gap-8">
      <Section title="通知の方法">
        <div className="flex flex-col gap-2">
          <Switch label="メールで受け取る" caption="週に 1 回、まとめて届きます" defaultChecked />
          <Switch label="プッシュ通知" />
        </div>
      </Section>
      <Section title="通知するできごと">
        <CheckboxGroup
          label="受け取る通知"
          caption="1 つ以上選んでください"
          captionPlacement={captionPlacement}
          defaultValue={['reply', 'follow']}
        >
          <Checkbox value="reply" label="返信" />
          <Checkbox value="follow" label="フォロー" />
          <Checkbox value="news" label="お知らせ" caption="新しい機能や、メンテナンスの予定です" />
        </CheckboxGroup>
      </Section>
      <SaveBar />
    </div>
  );
}

function DisplayPanel({ captionPlacement }: { captionPlacement: CaptionPlacement }) {
  return (
    <div className="flex flex-col gap-8">
      <Section title="表示">
        <RadioGroup label="テーマ" defaultValue="system">
          <Radio value="system" label="端末に合わせる" />
          <Radio value="light" label="ライト" />
          <Radio value="dark" label="ダーク" />
        </RadioGroup>
        <RadioGroup
          label="文字の大きさ"
          caption="読みやすい大きさを選びます"
          captionPlacement={captionPlacement}
          defaultValue="md"
        >
          <Radio value="sm" label="小" />
          <Radio value="md" label="標準" />
          <Radio value="lg" label="大" />
        </RadioGroup>
        <Switch label="動きを減らす" caption="画面の動きを小さくします" />
      </Section>
      <SaveBar />
    </div>
  );
}

function DangerPanel({ dangerTone }: { dangerTone: AlertDialogColor }) {
  const [deleted, setDeleted] = useState(false);
  const toast = useToast();
  return (
    <div className="flex flex-col gap-6">
      <Notice status="warning" title="この操作は元に戻せません">
        アカウントを削除すると、投稿と設定がすべて消えます。
      </Notice>
      {deleted ? (
        <Text variant="muted">アカウントを削除しました。</Text>
      ) : (
        <div>
          <AlertDialog
            color={dangerTone}
            title="アカウントを削除しますか？"
            description="投稿・フォロー・設定がすべて消えます。この操作は元に戻せません。"
            actionLabel="削除する"
            onAction={() => {
              setDeleted(true);
              toast.show({ status: 'danger', title: 'アカウントを削除しました', timeout: 4000 });
            }}
            trigger={<Button color={dangerTone}>アカウントを削除する</Button>}
          />
        </div>
      )}
    </div>
  );
}

function SettingsScreen({ args }: { args: SettingsArgs }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Heading level={1} size={2}>
          設定
        </Heading>
        <Text variant="muted" className="mt-1">
          アカウントと通知、表示の設定です。
        </Text>
      </div>
      <Tabs defaultValue="account" color={args.tabsColor} panelGap="lg">
        <TabList aria-label="設定の項目">
          <Tab value="account">アカウント</Tab>
          <Tab value="notification">通知</Tab>
          <Tab value="display">表示</Tab>
          <Tab value="danger">危険な操作</Tab>
        </TabList>
        <TabPanel value="account">
          <AccountPanel captionPlacement={args.captionPlacement} />
        </TabPanel>
        <TabPanel value="notification">
          <NotificationPanel captionPlacement={args.captionPlacement} />
        </TabPanel>
        <TabPanel value="display">
          <DisplayPanel captionPlacement={args.captionPlacement} />
        </TabPanel>
        <TabPanel value="danger">
          <DangerPanel dangerTone={args.dangerTone} />
        </TabPanel>
      </Tabs>
    </div>
  );
}

export const example: Example = {
  slug: 'settings',
  title: '設定',
  description: 'タブで分けた設定画面。保存はトーストで知らせ、削除は確認のダイアログを挟みます。',
  controls: [
    {
      name: 'tabsColor',
      label: 'タブの色',
      type: 'radio',
      options: [
        { value: 'neutral', label: 'グレー' },
        { value: 'primary', label: 'ブルー' },
        { value: 'secondary', label: 'ピンク' },
      ],
    },
    {
      name: 'toastPosition',
      label: '保存時のトーストの位置',
      type: 'select',
      options: [
        {
          value: 'auto',
          label: '自動',
          caption: (environment) =>
            environment.sheet === undefined
              ? '指で操作していて、画面が狭いときだけ下中央になります'
              : `いまは${environment.sheet ? '下中央' : '右下'}になります（${environmentNote(environment)}）`,
        },
        { value: 'bottom-end', label: '右下' },
        { value: 'bottom-center', label: '下中央' },
        { value: 'top-end', label: '右上' },
      ],
    },
    {
      name: 'toastAppearance',
      label: '保存時のトーストの見た目',
      type: 'radio',
      options: [
        { value: 'soft', label: '淡い', caption: '状態の色の淡い面に、状態の色の文字を置きます' },
        {
          value: 'filled',
          label: '塗り',
          caption: '状態の色で濃く塗り、白い文字にします（警告だけ黄色の塗りに濃紺の文字）',
        },
      ],
    },
    {
      name: 'captionPlacement',
      label: '入力欄のキャプション位置',
      type: 'radio',
      options: [
        { value: 'top', label: 'ラベルの下' },
        { value: 'bottom', label: '本体の下' },
      ],
    },
    {
      name: 'dangerTone',
      label: '危険な操作の色',
      type: 'radio',
      options: [
        { value: 'danger', label: '赤（危険色）' },
        { value: 'primary', label: 'ブルー' },
      ],
    },
  ],
  defaults: {
    tabsColor: 'neutral',
    toastPosition: 'auto',
    toastAppearance: 'soft',
    captionPlacement: 'top',
    dangerTone: 'danger',
  },
  Screen: ({ args, density }) => {
    const settingsArgs: SettingsArgs = {
      tabsColor: args.tabsColor as TabsColor,
      toastPosition: args.toastPosition as ToastPosition,
      toastAppearance: args.toastAppearance as ToastVariant,
      captionPlacement: args.captionPlacement as CaptionPlacement,
      dangerTone: args.dangerTone as AlertDialogColor,
    };
    return (
      <SamplePage density={density} site={town} current="設定" width="sm">
        <ToastProvider position={settingsArgs.toastPosition} variant={settingsArgs.toastAppearance}>
          <SettingsScreen args={settingsArgs} />
        </ToastProvider>
      </SamplePage>
    );
  },
};
