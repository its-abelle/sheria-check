import { ActivityIndicator, View } from "react-native";

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

export function LoadingSpinner({ size = 32, color = "#6B3A2A" }: LoadingSpinnerProps) {
  return (
    <View className="items-center justify-center py-8">
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}
