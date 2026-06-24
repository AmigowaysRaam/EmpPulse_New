import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

const isTablet = Math.min(width, height) >= 600;

export const wp = (percent) => {
  const screenWidth = Dimensions.get('window').width;
  const size = (screenWidth * percent) / 100;

  return PixelRatio.roundToNearestPixel(
    isTablet ? size * 0.7 : size
  );
};

export const hp = (percent) => {
  const screenHeight = Dimensions.get('window').height;
  const size = (screenHeight * percent) / 100;

  return PixelRatio.roundToNearestPixel(size);
};

export { isTablet };
