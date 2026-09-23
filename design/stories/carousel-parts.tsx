import { Image } from '../../src/components/image/Image';
import { manyScreens, screens } from '../../src/components/carousel/story-images';

// 軸 285〜289（Carousel・Thumbnails）の比較で使う見本。決まったら軸のストーリーと一緒に消す

/** スライド（作品のスクリーンショット風、5 枚） */
export const slides = screens.map((screen) => (
  <Image key={screen.alt} ratio={16 / 9} src={screen.src} alt={screen.alt} />
));

/** スライドと同じ画像の Thumbnails の子 */
export const thumbs = screens.map((screen) => (
  <img key={screen.alt} src={screen.src} alt={screen.alt} />
));

/** 数の多い並び（12 枚） */
export const manySlides = manyScreens.map((screen) => (
  <Image key={screen.alt} ratio={16 / 9} src={screen.src} alt={screen.alt} />
));
export const manyThumbs = manyScreens.map((screen) => (
  <img key={screen.alt} src={screen.src} alt={screen.alt} />
));
