import { useEffect, useRef } from "react";
import { Animated, Easing, type ViewStyle } from "react-native";

interface AnimatedRevealProps {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  style?: ViewStyle;
}

export const AnimatedReveal = ({
  children,
  delay = 0,
  distance = 10,
  style,
}: AnimatedRevealProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
};

