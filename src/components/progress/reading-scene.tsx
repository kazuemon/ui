import { Affix } from '../affix/Affix';
import { Container } from '../container/Container';
import { Heading } from '../heading/Heading';
import { Navbar, NavbarLink } from '../navbar/Navbar';
import { Text } from '../text/Text';
import { Progress, type ProgressProps } from './Progress';
import { useReadingProgress } from './use-reading-progress';

// ストーリーで使う場面（部品ではない）。記事の読了のバー: スクロールする枠の上端に、ラベルを持たない細い Progress を留める
//   既定は 4px（size="sm"）・地あり・端を丸めない（shape="square"）。2px（size="xs"）と地なし（track={false}）も選べる
//   留めるのは Affix（端から離さない）。貼り付けた Navbar があれば、その下に留める（belowNavbar）
//   読んだ割合は、枠のスクロールの位置から計算する（useReadingProgress）

const stop = (event: { preventDefault: () => void }) => event.preventDefault();

const paragraph =
  '部品は自分がどこに置かれるかを知りません。知らないことは決めず、使う側に渡します。値は役割のトークンで持ち、部品の中だけで使う値は部品のトークンに分けます。';

function Article() {
  return (
    <Container>
      <article className="flex flex-col gap-4 py-8">
        <Heading level={1} size={2}>
          デザインの決め方
        </Heading>
        {['候補を並べる', '1 軸ずつ決める', '記録を残す'].map((title) => (
          <section key={title} className="flex flex-col gap-3">
            <Heading level={2} size={3}>
              {title}
            </Heading>
            <Text>{paragraph}</Text>
            <Text>{paragraph}</Text>
          </section>
        ))}
      </article>
    </Container>
  );
}

/** 読了のバー。ラベルを持たない細い Progress で、端を丸めず、読み上げからは外す */
export function ReadingProgress(props: Omit<ProgressProps, 'label' | 'showValue'>) {
  return <Progress size="sm" shape="square" showValue={false} aria-hidden {...props} />;
}

interface ReadingSceneProps {
  /** 読んだ割合を固定する（比較・撮影用）。渡さないときはスクロールに合わせて動く */
  value?: number;
  /** 貼り付けた Navbar を置く */
  navbar?: boolean;
  color?: ProgressProps['color'];
  size?: ProgressProps['size'];
  track?: boolean;
  width?: string;
  height?: string;
}

/** スクロールする枠の上端（Navbar があればその下）に、読了のバーを留めた記事 */
export function ReadingScene({
  value,
  navbar = false,
  color = 'primary',
  size = 'sm',
  track = true,
  width = 'w-[480px]',
  height = 'h-[320px]',
}: ReadingSceneProps) {
  const { setFrame, value: readValue } = useReadingProgress();
  return (
    <div
      ref={setFrame}
      data-slot="reading-scene"
      className={`${width} ${height} overflow-y-auto rounded-card border border-line bg-bg`}
    >
      {navbar ? (
        <Navbar
          sticky
          brand={
            <a href="#top" onClick={stop} className="text-fg no-underline">
              k6n
            </a>
          }
        >
          <NavbarLink href="#blog" current onClick={stop}>
            Blog
          </NavbarLink>
        </Navbar>
      ) : null}
      <Affix belowNavbar={navbar} className="[--affix-gap:0px]">
        <ReadingProgress value={value ?? readValue} color={color} size={size} track={track} />
      </Affix>
      <Article />
    </div>
  );
}
