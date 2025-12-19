import { useColorScheme } from "react-native";
import { THEME } from "../constants";

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? THEME.dark : THEME.light;

  return {
    isDark,
    colors,
    colorScheme,
  };
}
