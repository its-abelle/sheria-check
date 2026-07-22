import { View, Text } from "react-native";
import { AlertTriangle } from "lucide-react-native";

export function DisclaimerBanner() {
  return (
    <View className="flex-row items-start gap-2 rounded-xl bg-caution-50 px-4 py-3">
      <AlertTriangle size={18} color="#B8860B" style={{ marginTop: 1 }} />
      <Text className="flex-1 text-xs leading-5 text-caution-700">
        Sheria Check is an informational tool based on publicly available legal texts. It does not
        constitute legal advice. Always verify with official sources.
      </Text>
    </View>
  );
}
