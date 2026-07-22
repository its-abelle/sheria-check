import { View, Text } from "react-native";
import { Scale } from "lucide-react-native";

interface BalanceScaleProps {
  size?: number;
  className?: string;
}

export function BalanceScale({ size = 96, className }: BalanceScaleProps) {
  return (
    <View className={`items-center justify-center ${className || ""}`}>
      <Scale size={size} color="#6B3A2A" strokeWidth={1.5} />
    </View>
  );
}
