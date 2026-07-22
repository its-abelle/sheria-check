import { View, Text } from "react-native";
import { Link, Stack } from "expo-router";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View className="flex-1 items-center justify-center bg-surface px-6">
        <Text className="text-center text-xl font-bold text-primary-900" style={{ fontFamily: "Fraunces" }}>
          404
        </Text>
        <Text className="mt-2 text-center text-base text-gray-500">
          This page does not exist.
        </Text>
        <Link href="/" className="mt-4 rounded-xl bg-primary-500 px-6 py-3">
          <Text className="font-semibold text-white">Go Home</Text>
        </Link>
      </View>
    </>
  );
}
