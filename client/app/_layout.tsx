import { Stack } from "expo-router";
import { View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { DisclaimerBanner } from "../src/components/DisclaimerBanner";
import "../app.css";
export { ErrorBoundary } from "expo-router";
export default function RootLayout(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-surface">
        <StatusBar style="dark" />
        <View className="flex-1">
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: "#FFFFFF" },
              headerTintColor: "#6B3A2A",
              contentStyle: { backgroundColor: "#FAFAF8" },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="offense/[id]"
              options={{ title: "Offense provisions" }}
            />
            <Stack.Screen
              name="category/[id]"
              options={{ title: "Browse offenses" }}
            />
            <Stack.Screen name="law/[id]" options={{ title: "Read the law" }} />
            <Stack.Screen
              name="provision/[id]"
              options={{ title: "Original provision" }}
            />
          </Stack>
        </View>
        <DisclaimerBanner />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
