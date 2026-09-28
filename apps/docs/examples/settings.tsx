'use client';

import {
  AlertDialog,
  type AlertDialogColor,
  Button,
  Checkbox,
  CheckboxGroup,
  type CaptionPlacement,
  Dropzone,
  DropzoneFileList,
  type DropzoneRejection,
  Heading,
  Link,
  MaskField,
  Notice,
  PasswordField,
  PinField,
  Radio,
  RadioGroup,
  Select,
  Slider,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  type TabsColor,
  type TabValue,
  Text,
  Textarea,
  TextField,
  Temporal,
  TimeField,
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
// アカウント: アイコン画像（Dropzone）・ウェブサイト（https:// の prefix）
// セキュリティ: パスワードの変更（PasswordField）・二段階認証（電話番号の MaskField と、確認コードの PinField）
// 通知: 通知を止める時間帯（TimeField）。表示: 文字の大きさ（Slider）

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

const rejectionText: Record<DropzoneRejection['reason'], string> = {
  accept: 'PNG か JPEG の画像を選んでください',
  maxSize: '5MB までの画像を選んでください',
  maxFiles: '画像は 1 つだけ選べます',
};

// 通知を止める時間帯の初めの値（夜 23 時から朝 7 時まで）
const quietStart = Temporal.PlainTime.from('23:00');
const quietEnd = Temporal.PlainTime.from('07:00');

// 携帯電話・IP 電話（070・080・090・050）は 3-4-4、ほかは 2-4-4
const phoneMask = (value: string) =>
  /^0[5789]0/.test(value.replace(/\D/g, '')) ? '###-####-####' : '##-####-####';

function AvatarField({ captionPlacement }: { captionPlacement: CaptionPlacement }) {
  const [files, setFiles] = useState<File[]>([]);
  const [rejections, setRejections] = useState<DropzoneRejection[]>([]);
  return (
    <div className="flex flex-col gap-3">
      <Dropzone
        label="アイコン"
        caption="PNG・JPEG、5MB まで。正方形に切り取って表示します"
        captionPlacement={captionPlacement}
        accept="image/png,image/jpeg"
        maxSize={5 * 1000 * 1000}
        value={files}
        onValueChange={(next) => {
          setFiles(next);
          setRejections([]);
        }}
        onFilesRejected={setRejections}
        errorText={rejections.length > 0 ? rejectionText[rejections[0].reason] : undefined}
      />
      <DropzoneFileList
        files={files.map((file) => ({ file }))}
        onRemove={(file) => setFiles((current) => current.filter((f) => f !== file))}
      />
    </div>
  );
}

function AccountPanel({
  captionPlacement,
  onOpenSecurity,
}: {
  captionPlacement: CaptionPlacement;
  onOpenSecurity: () => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <Section title="プロフィール">
        <AvatarField captionPlacement={captionPlacement} />
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
        <TextField
          label="ウェブサイト"
          prefix="https://"
          placeholder="例: example.com"
          type="url"
          autoComplete="url"
          caption="プロフィールに載せるリンクです"
          captionPlacement={captionPlacement}
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
        メールアドレスとパスワードの変更は、
        <Link
          href="#security"
          onClick={(event) => {
            event.preventDefault();
            onOpenSecurity();
          }}
        >
          セキュリティ
        </Link>
        から行います。
      </Text>
      <SaveBar />
    </div>
  );
}

function TwoFactorSection({ captionPlacement }: { captionPlacement: CaptionPlacement }) {
  const [enabled, setEnabled] = useState(false);
  const [verified, setVerified] = useState(false);
  const toast = useToast();
  return (
    <Section title="二段階認証">
      <Switch
        label="二段階認証を使う"
        caption="ログインのたびに、SMS で届くコードを確かめます"
        checked={enabled}
        onCheckedChange={(next) => {
          setEnabled(next);
          setVerified(false);
        }}
      />
      {enabled &&
        (verified ? (
          <Notice status="success" title="二段階認証を有効にしました">
            次のログインから、SMS で届くコードを入力します。
          </Notice>
        ) : (
          <>
            <MaskField
              label="電話番号"
              mask={phoneMask}
              type="tel"
              autoComplete="tel"
              defaultValue="09012345678"
              caption="この番号に確認コードを送ります"
              captionPlacement={captionPlacement}
            />
            <PinField
              label="確認コード"
              caption="SMS で届いた 6 桁のコードを入力します"
              captionPlacement={captionPlacement}
              showEmptyDots
              onValueCompleted={() => {
                setVerified(true);
                toast.show({
                  status: 'success',
                  title: '二段階認証を有効にしました',
                  timeout: 4000,
                });
              }}
            />
          </>
        ))}
    </Section>
  );
}

function SecurityPanel({ captionPlacement }: { captionPlacement: CaptionPlacement }) {
  return (
    <div className="flex flex-col gap-8">
      <Section title="メールアドレス">
        <TextField
          label="メールアドレス"
          type="email"
          autoComplete="email"
          defaultValue="kazuemon@example.com"
          caption="変更すると、新しいアドレスに確認のメールが届きます"
          captionPlacement={captionPlacement}
        />
      </Section>
      <Section title="パスワードの変更">
        <PasswordField label="いまのパスワード" autoComplete="current-password" />
        <PasswordField
          label="新しいパスワード"
          autoComplete="new-password"
          caption="8 文字以上で、英字と数字を混ぜます"
          captionPlacement={captionPlacement}
        />
      </Section>
      <SaveBar />
      <TwoFactorSection captionPlacement={captionPlacement} />
    </div>
  );
}

function NotificationPanel({ captionPlacement }: { captionPlacement: CaptionPlacement }) {
  const [quiet, setQuiet] = useState(true);
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
      <Section title="通知を止める時間帯">
        <Switch
          label="夜は通知を止める"
          caption="この時間帯に届いた通知は、終わる時刻にまとめて届きます"
          checked={quiet}
          onCheckedChange={setQuiet}
        />
        <div className="grid grid-cols-2 gap-4">
          <TimeField label="始まり" defaultValue={quietStart} disabled={!quiet} />
          <TimeField label="終わり" defaultValue={quietEnd} disabled={!quiet} />
        </div>
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
        <Slider
          label="文字の大きさ"
          caption="読みやすい大きさにします"
          captionPlacement={captionPlacement}
          defaultValue={1}
          min={0.8}
          max={1.5}
          step={0.1}
          largeStep={0.2}
          format={{ style: 'percent' }}
        />
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
            description="投稿・フォロー・設定がすべて消え、元に戻せません。"
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
  const [tab, setTab] = useState<TabValue>('account');
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Heading level={1} size={2}>
          設定
        </Heading>
        <Text variant="muted" className="mt-1">
          アカウントとセキュリティ、通知、表示の設定です。
        </Text>
      </div>
      <Tabs value={tab} onValueChange={setTab} color={args.tabsColor} panelGap="lg">
        <TabList aria-label="設定の項目">
          <Tab value="account">アカウント</Tab>
          <Tab value="security">セキュリティ</Tab>
          <Tab value="notification">通知</Tab>
          <Tab value="display">表示</Tab>
          <Tab value="danger">削除</Tab>
        </TabList>
        <TabPanel value="account">
          <AccountPanel
            captionPlacement={args.captionPlacement}
            onOpenSecurity={() => setTab('security')}
          />
        </TabPanel>
        <TabPanel value="security">
          <SecurityPanel captionPlacement={args.captionPlacement} />
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
  description: 'アカウント・通知・表示などを、タブで分けた設定の画面',
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
      <SamplePage density={density} site={town} current="設定" width="md">
        <ToastProvider position={settingsArgs.toastPosition} variant={settingsArgs.toastAppearance}>
          <SettingsScreen args={settingsArgs} />
        </ToastProvider>
      </SamplePage>
    );
  },
};
