import { View, Text, Pressable, ActivityIndicator } from "react-native";
interface RequestStateProps {
  loading: boolean;
  error: string | null;
  retry: () => void;
}
export function RequestState({
  loading,
  error,
  retry,
}: RequestStateProps): React.JSX.Element {
  if (loading)
    return (
      <View className="py-6" accessibilityLabel="Loading">
        <ActivityIndicator color="#6B3A2A" />
      </View>
    );
  if (!error) return <View />;
  return (
    <View className="gap-3 rounded-xl border border-primary-200 bg-white p-4">
      <Text accessibilityRole="alert" className="text-base text-primary-900">
        {error}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={retry}
        className="min-h-12 justify-center self-start rounded-lg bg-primary-500 px-5 active:bg-primary-700"
      >
        <Text className="font-semibold text-white">Try again</Text>
      </Pressable>
    </View>
  );
}
