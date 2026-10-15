import type { TreeSelectProps } from '../../src/components/tree-select/TreeSelect';
import type { TreeSelectItem } from '../../src/components/tree-select/tree-select-items';
import type { Column } from './Comparison';
import { OpenFrame } from './tree-select-axis-parts';

// 軸 645・646（「親もほかの行と同じ点」のルール）で共有する、場面と列とルールの説明

/** 1 つの場面。現実の木と、その場面で渡す props */
export interface Scene {
  items: TreeSelectItem[];
  label: string;
  props: Partial<TreeSelectProps<string, boolean>>;
  /** 渡した値の親を「〇〇 全体」と読み、この文を添える（scope） */
  scopeNote?: string;
  /** play で枠を探すための data-testid（「その場面」の列だけに付ける） */
  testId?: string;
}

export const pointColumns: Column[] = [
  { label: 'その場面', note: '押して選べます。選んでも閉じません。下に、外へ渡す値が出ます' },
  { label: '指・狭い幅', note: '同じ場面を、指の密度・幅 16rem で' },
];

export function sceneCell(column: Column, scene: Scene, height: string) {
  const narrow = column.label === '指・狭い幅';
  return (
    <OpenFrame
      items={scene.items}
      label={scene.label}
      scopeNote={scene.scopeNote}
      density={narrow ? 'coarse' : 'fine'}
      width={narrow ? 'w-64' : 'w-80'}
      height={height}
      showValue
      testId={narrow ? undefined : scene.testId}
      props={scene.props}
    />
  );
}

/** ルールの説明（2 つの軸で同じ文） */
export function PointRules() {
  return (
    <>
      <p>
        考え方: TreeSelect は木の全体を見て、点（行）を指す部品です。親もほかの行と同じ 1
        つの点で、特別な行（「〇〇 のすべて」「〇〇
        そのもの」）や、子をまとめて選ぶ箱は作りません。途中で止めて「〇〇 のすべて」を選ぶのは
        Cascader の考え方なので、ここには持ち込みません。
      </p>
      <p>
        見た目と操作（どの形でも同じ）: 選べる行は、親子に関係なく左に印を付けます（1
        つ選ぶ形は丸、複数選ぶ形は箱）。子を持つ行の開け閉めは、右端の正方形（行の高さいっぱい）だけで行い、それより左は押すと選ぶだけです。選べない親（ただのまとまり）は印も左の余白もなく、行のどこを押しても開け閉めします。キーボードは
        → ← で開け閉め、Enter・Space で選びます（選べない親では開け閉め）。
      </p>
      <p>
        親の扱い（仮の props は parentPoint。統合のときに Cascader の parentSelect
        と名前をそろえます）: none は親を選べない（印は子だけ）。label
        は親も独立した項目で、親を選んでも子は変わりません。scope
        は親が子を覆います（複数選ぶ形）。親を入れると値は親 1
        つになり、配下は「含まれる」見た目（塗らない箱に淡いチェック）になります。含まれる子を押すと、親を外して、押した子以外の兄弟を個別に入れます（押した子は外れます）。子を全部入れても親にはまとめません（「親を選んだ＝あとから増えた子も含む」と見分けるため）。空の親の箱を押すと親を選び（個別の子は親にまとまります）、入っている親を押すと配下ごと外れます。
      </p>
      <p>
        親の箱は、親そのものを選んでいるかだけを表します（中間の −
        は使いません）。親の配下に選んだ行があるときは、開いていても閉じていても、どのモードでも名前の右に点を出します（読み上げでは「配下に選択あり」と補足します）。
      </p>
    </>
  );
}
