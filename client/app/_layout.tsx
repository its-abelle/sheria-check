import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { ToastProvider } from "../src/components/Toast";
import { offenseRepository } from "../src/repositories/OffenseRepository";
import "../app.css";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces: require("../assets/fonts/Fraunces-VariableFont_opsz,wght.ttf"),
    SourceSans3: require("../assets/fonts/SourceSans3-VariableFont_wght.ttf"),
  });

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    offenseRepository
      .hydrate()
      .then(() => offenseRepository.refreshFromServer())
      .catch((err) => console.error("Offense repository init failed:", err));
  }, []);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <ToastProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#FFFFFF" },
            headerTintColor: "#6B3A2A",
            headerTitleStyle: { fontFamily: "Fraunces", fontWeight: "600" },
            contentStyle: { backgroundColor: "#FAFAF8" },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="offense/[id]"
            options={{ title: "Offense Details", presentation: "card" }}
          />
          <Stack.Screen
            name="category/[id]"
            options={{ title: "Category", presentation: "card" }}
          />
          <Stack.Screen
            name="disclaimer"
            options={{ title: "Disclaimer", presentation: "card" }}
          />
        </Stack>
      </ToastProvider>
    </ErrorBoundary>
  );
}
