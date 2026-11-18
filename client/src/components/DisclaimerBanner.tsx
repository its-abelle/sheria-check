import { View, Text } from "react-native";
import { en } from "../i18n/en";
export function DisclaimerBanner(): React.JSX.Element {
  return (
    <View className="border-t border-primary-100 bg-caution-50 px-4 py-2">
      <Text className="mx-auto w-full max-w-3xl text-xs leading-5 text-primary-800">
        {en.disclaimer}
      </Text>
    </View>
  );
}
