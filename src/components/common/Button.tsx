import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "text";
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const buttonStyles = [
    styles.button,
    variant === "primary" && styles.primaryButton,
    variant === "secondary" && styles.secondaryButton,
    variant === "text" && styles.textButton,
    isDisabled && styles.disabledButton,
    style,
  ];

  const textStyles = [
    styles.buttonText,
    variant === "primary" && styles.primaryText,
    variant === "secondary" && styles.secondaryText,
    variant === "text" && styles.textButtonText,
    isDisabled && styles.disabledText,
    textStyle,
  ];

  const iconColor =
    variant === "primary"
      ? "#ffffff"
      : variant === "secondary"
        ? "#3b82f6"
        : "#6b7280";

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#ffffff" : "#3b82f6"}
        />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={24}
              color={isDisabled ? "#9ca3af" : iconColor}
              style={styles.icon}
            />
          )}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
  },
  secondaryButton: {
    backgroundColor: "#eff6ff",
  },
  textButton: {
    backgroundColor: "transparent",
    paddingVertical: 12,
  },
  disabledButton: {
    backgroundColor: "#e5e7eb",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  primaryText: {
    color: "#ffffff",
  },
  secondaryText: {
    color: "#3b82f6",
  },
  textButtonText: {
    color: "#6b7280",
    fontSize: 16,
  },
  disabledText: {
    color: "#9ca3af",
  },
  icon: {
    marginRight: 4,
  },
});
