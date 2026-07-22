import { Tabs } from "expo-router";
import { Text } from "react-native";
import { Scale, Info, BarChart3 } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTintColor: "#6B3A2A",
        headerTitleStyle: { fontFamily: "Fraunces", fontWeight: "600" },
        tabBarActiveTintColor: "#6B3A2A",
        tabBarInactiveTintColor: "#A87A5E",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E2CBB8",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Sheria Check",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => <Scale size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarLabel: "Insights",
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="disclaimer"
        options={{
          title: "Disclaimer",
          tabBarLabel: "Info",
          tabBarIcon: ({ color, size }) => <Info size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
