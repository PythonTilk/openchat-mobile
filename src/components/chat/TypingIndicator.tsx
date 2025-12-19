import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, useColorScheme } from "react-native";

export function TypingIndicator() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };

    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, [dot1, dot2, dot3]);

  const dotStyle = (animValue: Animated.Value) => ({
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
    ],
  });

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Animated.View
        style={[styles.dot, isDark && styles.dotDark, dotStyle(dot1)]}
      />
      <Animated.View
        style={[styles.dot, isDark && styles.dotDark, dotStyle(dot2)]}
      />
      <Animated.View
        style={[styles.dot, isDark && styles.dotDark, dotStyle(dot3)]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    alignSelf: "flex-start",
    gap: 4,
  },
  containerDark: {
    backgroundColor: "#374151",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#9ca3af",
  },
  dotDark: {
    backgroundColor: "#6b7280",
  },
});
