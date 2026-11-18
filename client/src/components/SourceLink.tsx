import { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
interface SourceLinkProps {
  url: string;
  label?: string;
}
export function SourceLink({
  url,
  label = "Read official source",
}: SourceLinkProps): React.JSX.Element {
  const [error, setError] = useState(false);
  const open = (): void => {
    setError(false);
    void Linking.openURL(url).catch((): void => setError(true));
  };
  return (
    <View>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${label} (opens official website)`}
        onPress={open}
        className="min-h-12 justify-center py-2"
      >
        <Text className="text-base font-semibold text-primary-600 underline">
          {label} ↗
        </Text>
      </Pressable>
      {error && (
        <Text accessibilityRole="alert" className="text-sm text-primary-800">
          Unable to open the source. Check your connection and try again.
        </Text>
      )}
    </View>
  );
}
