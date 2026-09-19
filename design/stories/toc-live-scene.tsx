import { TableOfContents } from '../../src/components/table-of-contents/TableOfContents';
import { useSceneItems } from '../../src/components/table-of-contents/story-items';
import { Article, SceneFrame } from '../../src/components/table-of-contents/story-scenes';

// 軸 165・166 の比較で使う、スクロールして今の見出しが移るのを確かめる場面（部品ではない）
export function TocLiveScene() {
  const items = useSceneItems();
  return (
    <SceneFrame width={400} height={280}>
      <div className="grid grid-cols-[1fr_9rem] items-start gap-5">
        <Article items={items} />
        <div className="sticky top-0">
          <TableOfContents items={items} />
        </div>
      </div>
    </SceneFrame>
  );
}
