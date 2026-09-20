'use client';

import { createContext } from 'react';

/** prefix・suffix の形。attached: 本体の端に接する（既定）、floating: 本体の内側に浮かせる */
export type AddonShape = 'attached' | 'floating';

/** 入力欄が押せないとき、prefix・suffix のボタン（FieldAddonButton）も押せなくする */
export const FieldAddonDisabled = createContext(false);
