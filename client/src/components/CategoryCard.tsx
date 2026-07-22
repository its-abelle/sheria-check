import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { cn } from "../utils/cn";
import type { OffenseCategory } from "../types";

const ICON_MAP: Record<string, string> = {
  gauge: "⏱",
  "file-text": "📄",
  wine: "🍷",
  car: "🚗",
  "square-parking": "🅿",
  bus: "🚌",
  sign: "🪧",
  list: "📋",
};

interface CategoryCardProps {
  category: OffenseCategory;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/category/${category.id}`)}
      className={cn(
        "flex-row items-center justify-between rounded-2xl border border-primary-100 bg-white p-4",
        "active:bg-primary-50"
      )}
      accessibilityLabel={`${category.name}, ${category.count} offenses`}
    >
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
          <Text className="text-lg">{ICON_MAP[category.icon] || "📋"}</Text>
        </View>
        <View>
          <Text className="text-base font-semibold text-primary-900">{category.name}</Text>
          <Text className="text-sm text-gray-500">{category.count} offense{category.count !== 1 ? "s" : ""}</Text>
        </View>
      </View>
      <ChevronRight size={18} color="#A87A5E" />
    </Pressable>
  );
}
