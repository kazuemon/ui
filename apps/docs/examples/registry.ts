'use client';

import { example as apply } from './apply';
import { example as article } from './article';
import { example as blogList } from './blog-list';
import { example as dashboard } from './dashboard';
import { example as docs } from './docs';
import { example as list } from './list';
import { example as markdownProse } from './markdown-prose';
import { example as museum } from './museum';
import { example as pricing } from './pricing';
import { example as profile } from './profile';
import { example as reservation } from './reservation';
import { resetPassword, signIn, signUp, verifyCode } from './sign-in';
import { example as settings } from './settings';
import { example as sns } from './sns';
import { example as tasks } from './tasks';
import type { Example } from './types';

// 名前から見本を引く表。画面は 'use client' なので、サーバーからは manifest.ts の方を読む

export const registry: Record<string, Example> = Object.fromEntries(
  [
    article,
    markdownProse,
    docs,
    signIn,
    signUp,
    resetPassword,
    verifyCode,
    settings,
    list,
    sns,
    apply,
    blogList,
    profile,
    dashboard,
    reservation,
    pricing,
    museum,
    tasks,
  ].map((example) => [example.slug, example])
);
