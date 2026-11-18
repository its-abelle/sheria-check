import type { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
export function Page({ children }: PropsWithChildren): React.JSX.Element {
  return (
    <ScrollView
      className="flex-1 bg-surface"
      keyboardShouldPersistTaps="handled"
    >
      <View className="mx-auto w-full max-w-3xl gap-5 px-5 py-6">
        {children}
      </View>
    </ScrollView>
  );
}
