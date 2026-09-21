import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';

import { AlertDialog } from '../components/alert-dialog/AlertDialog';
import { Button } from '../components/button/Button';
import { Checkbox } from '../components/checkbox/Checkbox';
import { CheckboxGroup } from '../components/checkbox/CheckboxGroup';
import { Heading } from '../components/heading/Heading';
import { Link } from '../components/link/Link';
import { Notice } from '../components/notice/Notice';
import { Radio, RadioGroup } from '../components/radio/Radio';
import { Select } from '../components/select/Select';
import { Stack } from '../components/stack/Stack';
import { Switch } from '../components/switch/Switch';
import { Tab, TabList, TabPanel, Tabs } from '../components/tabs/Tabs';
import { Text } from '../components/text/Text';
import { Textarea } from '../components/textarea/Textarea';
import { TextField } from '../components/text-field/TextField';
import { ToastProvider, useToast } from '../components/toast/Toast';
import { SamplePage, densityOf } from './SamplePage';

// 設定の画面: タブで分けた設定と、保存のお知らせ（Toast）、取り消せない操作の確認（AlertDialog）

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack gap="md" render={<section />}>
      <Heading level={2} size={3}>
        {title}
      </Heading>
      {children}
    </Stack>
  );
}

function SaveBar({ label = '保存する' }: { label?: string }) {
  const toast = useToast();
  return (
    <Stack direction="horizontal" gap="sm">
      <Button
        color="primary"
        onClick={() => toast.show({ status: 'success', title: '保存しました', timeout: 4000 })}
      >
        {label}
      </Button>
      <Button variant="outline">キャンセル</Button>
    </Stack>
  );
}

function AccountPanel() {
  return (
    <div className="flex flex-col gap-8">
      <Section title="プロフィール">
        <TextField
          label="表示名"
          defaultValue="かずえもん"
          caption="ほかの人に表示される名前です"
        />
        <TextField label="ユーザー名" defaultValue="kazuemon" caption="半角英数字で入力します" />
        <Textarea
          label="自己紹介"
          defaultValue="UI ライブラリを作っています。"
          caption="160 文字まで"
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

function NotificationPanel() {
  return (
    <div className="flex flex-col gap-8">
      <Section title="通知の方法">
        <Stack gap="sm">
          <Switch label="メールで受け取る" caption="週に 1 回、まとめて届きます" defaultChecked />
          <Switch label="プッシュ通知" />
        </Stack>
      </Section>
      <Section title="通知するできごと">
        <CheckboxGroup
          label="受け取る通知"
          caption="1 つ以上選んでください"
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

function DisplayPanel() {
  return (
    <div className="flex flex-col gap-8">
      <Section title="表示">
        <RadioGroup label="テーマ" defaultValue="system">
          <Radio value="system" label="端末に合わせる" />
          <Radio value="light" label="ライト" />
          <Radio value="dark" label="ダーク" />
        </RadioGroup>
        <RadioGroup label="文字の大きさ" caption="読みやすい大きさを選びます" defaultValue="md">
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

function DangerPanel() {
  const [deleted, setDeleted] = useState(false);
  const toast = useToast();
  return (
    <Stack gap="lg">
      <Notice status="warning" title="この操作は元に戻せません">
        アカウントを削除すると、投稿と設定がすべて消えます。
      </Notice>
      {deleted ? (
        <Text variant="muted">アカウントを削除しました。</Text>
      ) : (
        <div>
          <AlertDialog
            title="アカウントを削除しますか？"
            description="投稿・フォロー・設定がすべて消えます。この操作は元に戻せません。"
            actionLabel="削除する"
            onAction={() => {
              setDeleted(true);
              toast.show({ status: 'danger', title: 'アカウントを削除しました', timeout: 4000 });
            }}
            trigger={<Button color="danger">アカウントを削除する</Button>}
          />
        </div>
      )}
    </Stack>
  );
}

function SettingsScreen() {
  return (
    <Stack gap="lg">
      <div>
        <Heading level={1} size={2}>
          設定
        </Heading>
        <Text variant="muted" className="mt-1">
          アカウントと通知、表示の設定です。
        </Text>
      </div>
      <Tabs defaultValue="account">
        <TabList aria-label="設定の項目">
          <Tab value="account">アカウント</Tab>
          <Tab value="notification">通知</Tab>
          <Tab value="display">表示</Tab>
          <Tab value="danger">危険な操作</Tab>
        </TabList>
        <TabPanel value="account">
          <AccountPanel />
        </TabPanel>
        <TabPanel value="notification">
          <NotificationPanel />
        </TabPanel>
        <TabPanel value="display">
          <DisplayPanel />
        </TabPanel>
        <TabPanel value="danger">
          <DangerPanel />
        </TabPanel>
      </Tabs>
    </Stack>
  );
}

const meta = {
  title: 'Overview/見本',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '設定の画面の見本です。タブで項目を分け、保存するとトーストで知らせ、アカウントの削除は確認のダイアログを挟みます。',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Settings: Story = {
  name: '設定',
  render: (_args, { globals }) => (
    <SamplePage density={densityOf(globals)} width="sm">
      <ToastProvider>
        <SettingsScreen />
      </ToastProvider>
    </SamplePage>
  ),
};
