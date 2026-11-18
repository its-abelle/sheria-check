import { Link } from "expo-router";
import { View, Text, Pressable } from "react-native";
import type { Offense } from "../types";
interface OffenseCardProps {
  offense: Offense;
}
export function OffenseCard({ offense }: OffenseCardProps): React.JSX.Element {
  return (
    <Link
      href={{ pathname: "/offense/[id]", params: { id: offense.id } }}
      asChild
    >
      <Pressable
        accessibilityRole="link"
        className="gap-2 border-b border-primary-100 py-4 active:bg-primary-50"
      >
        <Text className="text-lg font-semibold text-primary-900">
          {offense.name} →
        </Text>
        <Text className="text-sm text-primary-700">{offense.citation}</Text>
        <View>
          <Text className="text-sm leading-6 text-gray-700">
            Read the offense and statutory penalty wording.
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}
