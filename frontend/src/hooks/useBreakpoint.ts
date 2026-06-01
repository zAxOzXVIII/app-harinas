import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

const PHONE_SMALL_MAX = 360;
const PHONE_MEDIUM_MAX = 767;

export const useBreakpoint = () => {
  const { width } = useWindowDimensions();

  return useMemo(() => {
    const isSmallPhone = width <= PHONE_SMALL_MAX;
    const isMediumPhone = width > PHONE_SMALL_MAX && width <= PHONE_MEDIUM_MAX;
    const isTablet = width > PHONE_MEDIUM_MAX;

    const contentPadding = isSmallPhone ? 12 : isTablet ? 24 : 16;
    const chartWidth = Math.min(width - contentPadding * 2 - 24, isTablet ? 560 : 360);
    const dashboardColumns = isTablet ? 3 : isSmallPhone ? 1 : 2;

    return {
      width,
      isSmallPhone,
      isMediumPhone,
      isTablet,
      contentPadding,
      chartWidth,
      dashboardColumns,
    };
  }, [width]);
};

