'use client';

import type { ComponentProps, ReactNode } from 'react';

import { AttachmentProgressRing } from './AttachmentProgressRing';
import {
  defaultRemoveName,
  type DropzoneFileEntry,
  entryIsImage,
  entryName,
  entrySize,
  formatFileSize,
} from '../../internal/dropzone-utils';
import { FileThumbnail } from '../../internal/FileThumbnail';
import { focusRingForCardAction } from '../../internal/focus-styles';
import { ArrowClockwiseIcon, FileIcon, WarningCircleIcon, XIcon } from '../../internal/icons';
import { textLinkSizeReset } from '../../internal/reading/text-link';
import { tv } from '../../internal/tv';
import { Button } from '../button/Button';
import { Link } from '../link/Link';
import { Progress } from '../progress/Progress';

// 添えたファイルの小さい札。チャットの Composer や吹き出しの中に横に並べる（並べるのは AttachmentList）
//   DropzoneFileList（一覧の行）とは別の部品で、名前・大きさ・種類の判定・縮小画像・外すボタン・進み具合の出し方を共有する
// 面: 白い面に細い線（原則6: 置く地が変わる小物は白い面と細い縁。Composer のグレーの欄の上にも、吹き出しの上にも置く）
//   ページと同じレイヤーなので影は付けない（原則1）。角は部品の角、左の四角は同心の角（原則5）
// 状態は渡された値から決める（DropzoneFileEntry と同じ）
//   送る前: file だけ。大きさを出し、外せる（onRemove）
//   送っている途中: progress（0〜100。null は終わりが分からない）。進み具合を出し、外す（取り消す）ボタンは残す
//   失敗: errorText。線を危険の色にし、大きさの代わりに文を出す。もう一度送る（onRetry）と外すを並べる
//   送ったあと: url。名前の文字を、新しいタブで開くリンクにする（札にほかの操作を足せるよう、札全体はリンクにしない）
// 左の四角: ファイルのアイコン（既定）。画像の縮小画像は使う側が選んだときだけ出す（imageDisplay）。失敗は丸の「!」（原則6: 形でも見分ける）
const attachment = tv({
  slots: {
    base: [
      'relative inline-flex w-(--attachment-width) max-w-full items-center gap-2 rounded-control border border-line bg-surface p-(--attachment-padding) text-fg',
      'data-invalid:border-fg-danger',
    ],
    preview: [
      'relative flex size-(--attachment-preview-size) shrink-0 items-center justify-center overflow-hidden text-fg-muted',
      // 札の角から余白を引いた同心の角（原則5）
      'rounded-[calc(var(--radius-control)-var(--attachment-padding)-var(--border-width-thin))] bg-field',
    ],
    body: 'flex min-w-0 flex-1 flex-col',
    // 名前のリンクのフォーカスの線が切れないよう、線の分だけ内側に余白を取り、外側の余白で打ち消す（DropzoneFileList と同じ）
    //   左右は Link が自分の左右の余白を外へ張り出す分まで取る
    name: '-mx-2 -my-1 truncate px-2 py-1 text-(length:--text-label) leading-(--leading-label) font-bold',
    meta: 'flex h-(--leading-caption) items-center truncate text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle',
    error: 'truncate text-(length:--text-caption) leading-(--leading-caption) text-fg-danger',
    actions: 'flex shrink-0 items-center',
    // 札の下端に沿う進み具合（progressIndicator="edge"・tile）。札の角で切る
    edge: 'pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]',
  },
});

// 画像だけの正方形（imageDisplay="tile"）。名前は読み上げにだけ出す
const tile = tv({
  slots: {
    base: [
      'group relative block size-(--attachment-tile-size) shrink-0 overflow-hidden rounded-control border border-line bg-field',
    ],
    // 角に置く小さな外すボタン。画像の上でも見えるよう塗りのグレー
    remove: [
      'absolute top-1 right-1 z-2',
      '[--spacing-control-sm:calc(var(--spacing)*6)] [--spacing-icon-sm:calc(var(--spacing)*3.5)]',
    ],
  },
  variants: {
    // 送ったあとの画像はリンク（tileAnchor）。フォーカスの線は正方形の輪郭に出す
    linked: {
      true: {
        base: [
          ...focusRingForCardAction,
          '[transition:outline-color_var(--focus-ring-duration)_var(--ease-press)] motion-reduce:[transition:none]',
        ],
      },
    },
  },
});

/** 進み具合の出し方。bar は名前の下の細い帯、ring は左の四角を囲む円、edge は札の下端に沿う線です */
export type AttachmentProgressIndicator = 'bar' | 'ring' | 'edge';

/** 画像の出し方。icon は縮小画像を出さずアイコンのまま、thumbnail は札の左の四角に縮小画像、tile は画像だけの正方形です */
export type AttachmentImageDisplay = 'icon' | 'thumbnail' | 'tile';

export interface AttachmentProps extends Omit<ComponentProps<'div'>, 'children' | 'color'> {
  /** 添えたファイル（いま選んだもの）。書かないときは、name・size・url・type で書いた送ったあとのファイルとして出します */
  file?: File;
  /** 名前。書かないときは file の名前 */
  name?: string;
  /** 大きさ（バイト）。書かないときは file の大きさ。どちらもないときは大きさを出しません */
  size?: number;
  /** 送ったあとのファイルの URL。押して開けるリンクになり、画像なら縮小画像にも使います */
  url?: string;
  /** ファイルの種類（MIME タイプ）。画像として出すかを決めます。書かないときは file の種類、なければ url の拡張子で決めます */
  type?: string;
  /**
   * 送っている途中の進み具合（0〜100）。終わりが分からないときは null を渡します。
   * 渡さない（undefined）ときは、送っている途中ではないとみなします
   */
  progress?: number | null;
  /** 送るのに失敗したときの文。渡すと、札の線を危険の色にし、大きさの代わりにこの文を出します */
  errorText?: ReactNode;
  /** 外すボタンを押したときに呼びます。渡さないと外すボタンを出しません（送ったあとの吹き出しの中など） */
  onRemove?: () => void;
  /**
   * 外すボタンの読み上げの名前。渡さないときは、いま選んだもの（file を渡したもの）は「外す: {名前}」、
   * 送ったあとのものは「削除: {名前}」です
   */
  removeName?: string;
  /** もう一度送るボタンを押したときに呼びます。失敗したとき（errorText）だけボタンを出します */
  onRetry?: () => void;
  /**
   * もう一度送るボタンの読み上げの名前
   * @default `もう一度送る: ${name}`
   */
  retryName?: string;
  /**
   * 進み具合の出し方。bar は名前の下の細い帯、ring は左の四角を囲む円、edge は札の下端に沿う線です。
   * どれも、progress が数のときは割合を文字でも添えます（null のときは出しません）
   * @default 'bar'
   */
  progressIndicator?: AttachmentProgressIndicator;
  /**
   * 画像の出し方。icon は縮小画像を出さず、ほかのファイルと同じアイコンです。
   * 縮小画像を出すと、選んだ画像を画面に読み込むので、出すかどうかは使う側が決めます。
   * thumbnail は札の左の四角に縮小画像を出します。tile は画像だけの正方形にし、名前は読み上げにだけ出します
   * （失敗したときは札に戻します。正方形の大きさは --attachment-tile-size で変えられます）
   * @default 'icon'
   */
  imageDisplay?: AttachmentImageDisplay;
  /** 札そのもの（いちばん外の要素）に付きます */
  className?: string;
}

/**
 * 添えたファイルの小さい札。名前と大きさ、送っている途中の進み具合、失敗、送ったあとのリンクを見せます（送ることそのものは行いません）。
 * 横に並べるときは AttachmentList に入れます
 */
export function Attachment({
  file,
  name: nameProp,
  size: sizeProp,
  url,
  type,
  progress,
  errorText,
  onRemove,
  removeName,
  onRetry,
  retryName,
  progressIndicator = 'bar',
  imageDisplay = 'icon',
  className,
  ...props
}: AttachmentProps) {
  const entry: DropzoneFileEntry = { file, name: nameProp, size: sizeProp, url, type };
  const name = entryName(entry);
  const size = entrySize(entry);
  const failed = errorText != null && errorText !== false;
  const uploading = !failed && progress !== undefined;
  const linked = !failed && !uploading && url != null;
  const isImage = entryIsImage(entry) && (file != null || url != null);
  const removeLabel = removeName ?? defaultRemoveName(entry);
  const progressLabel = `${name} の進み具合`;
  const percent = progress == null ? null : Math.min(100, Math.max(0, progress));

  // 札の中は塗りも線もない軽いボタン（原則7）。画像の上（tile）は、画像に溶けないよう塗りのグレー
  const removeButton = (onImage = false) =>
    onRemove ? (
      <Button
        iconOnly
        shape="circle"
        size="sm"
        variant={onImage ? 'filled' : 'underline'}
        aria-label={removeLabel}
        onClick={onRemove}
      >
        <XIcon standalone />
      </Button>
    ) : null;

  // 名前の文字のリンク。DropzoneFileList の保存済みの名前と同じ形（↗ は付けない）
  const nameLink = (
    <Link
      href={url}
      target="_blank"
      color="inherit"
      newTabIcon={false}
      className={textLinkSizeReset}
    >
      {name}
    </Link>
  );
  // 画像だけの正方形（tile）のリンク。名前の文字がないので、正方形いっぱいの見えないリンクを置き、フォーカスの線は正方形の輪郭に出す
  //   （Card の押すカードと同じ data-slot と線 — focusRingForCardAction）。名前はリンクの中の読み上げの文
  const tileAnchor = (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-slot="card-action"
      className="absolute inset-0 z-1 rounded-[inherit] outline-none"
    >
      <span className="sr-only">
        {name}
        （新しいタブで開きます）
      </span>
    </a>
  );

  const edgeProgress = (
    <span className={attachment().edge()}>
      <Progress
        value={percent}
        size="xs"
        hideTrack
        hideValue
        color="primary"
        aria-label={progressLabel}
        className="absolute inset-x-0 bottom-0"
      />
    </span>
  );

  // 画像だけの正方形
  if (isImage && imageDisplay === 'tile' && !failed) {
    const t = tile({ linked });
    return (
      <div
        data-slot="attachment"
        data-uploading={uploading ? '' : undefined}
        className={t.base({ className })}
        {...props}
      >
        <FileThumbnail entry={entry} iconClassName="size-(--spacing-icon)" />
        {linked ? tileAnchor : <span className="sr-only">{name}</span>}
        {onRemove && <span className={t.remove()}>{removeButton(true)}</span>}
        {uploading && edgeProgress}
      </div>
    );
  }

  const s = attachment();
  const showRing = uploading && progressIndicator === 'ring';
  return (
    <div
      data-slot="attachment"
      data-invalid={failed ? '' : undefined}
      data-uploading={uploading ? '' : undefined}
      className={s.base({ className })}
      {...props}
    >
      <span className={s.preview()}>
        {failed ? (
          <span className="flex size-full items-center justify-center bg-danger-subtle text-fg-danger">
            <WarningCircleIcon />
          </span>
        ) : isImage && imageDisplay !== 'icon' ? (
          <FileThumbnail entry={entry} iconClassName="size-(--spacing-icon)" />
        ) : (
          <FileIcon />
        )}
        {showRing && <AttachmentProgressRing value={percent} label={progressLabel} />}
      </span>
      <span className={s.body()}>
        <span className={s.name()}>{linked ? nameLink : name}</span>
        {failed ? (
          <span className={s.error()}>{errorText}</span>
        ) : uploading && progressIndicator === 'bar' ? (
          <span className={s.meta({ class: 'gap-2' })}>
            <Progress
              value={percent}
              size="xs"
              hideValue
              color="primary"
              aria-label={progressLabel}
              className="min-w-0 flex-1"
            />
            {/* 割合が数で分かるときは、帯の後ろに文字でも添える（終わりが分からないときは出さない）。読み上げは帯の値が担う */}
            {percent != null && (
              <span aria-hidden className="shrink-0 tabular-nums">{`${Math.round(percent)}%`}</span>
            )}
          </span>
        ) : size != null || (uploading && percent != null) ? (
          <span className={s.meta()}>
            {size != null && formatFileSize(size)}
            {/* 円・下端の線では、割合を文字でも添える（線だけでは残りが読みにくい） */}
            {uploading && percent != null && (
              <span aria-hidden>{`${size != null ? ' ・ ' : ''}${Math.round(percent)}%`}</span>
            )}
          </span>
        ) : null}
      </span>
      {(onRemove || (failed && onRetry)) && (
        <span className={s.actions()}>
          {failed && onRetry && (
            <Button
              iconOnly
              shape="circle"
              size="sm"
              variant="underline"
              aria-label={retryName ?? `もう一度送る: ${name}`}
              onClick={onRetry}
            >
              <ArrowClockwiseIcon standalone />
            </Button>
          )}
          {removeButton()}
        </span>
      )}
      {uploading && progressIndicator === 'edge' && edgeProgress}
    </div>
  );
}
