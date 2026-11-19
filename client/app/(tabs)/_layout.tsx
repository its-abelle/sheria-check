import { Tabs } from "expo-router";
import { Scale, BookOpen, Shield, Info } from "lucide-react-native";
export default function TabsLayout(): React.JSX.Element {
  return (
    <Tabs
      screenOptions={{
        headerTintColor: "#6B3A2A",
        tabBarActiveTintColor: "#6B3A2A",
        tabBarInactiveTintColor: "#562F22",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Sheria Check",
          tabBarLabel: "Offenses",
          tabBarIcon: ({ color, size }): React.JSX.Element => (
            <Scale color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Law library",
          tabBarLabel: "Laws",
          tabBarIcon: ({ color, size }): React.JSX.Element => (
            <BookOpen color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="rights"
        options={{
          title: "Rights references",
          tabBarLabel: "Rights",
          tabBarIcon: ({ color, size }): React.JSX.Element => (
            <Shield color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="disclaimer"
        options={{
          title: "About & limitations",
          tabBarLabel: "About",
          tabBarIcon: ({ color, size }): React.JSX.Element => (
            <Info color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
