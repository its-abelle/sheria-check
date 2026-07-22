import { useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOffensesByCategory } from "../../src/hooks/useOffenses";
import { OffenseCard } from "../../src/components/OffenseCard";
import { EmptyState } from "../../src/components/EmptyState";
import { DetailSkeleton } from "../../src/components/LoadingSkeleton";
import { DEFAULT_CATEGORIES } from "../../src/data/categories";

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { offenses, loading, error } = useOffensesByCategory(id || "");
  const category = DEFAULT_CATEGORIES.find((c) => c.id === id);
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      <View className="px-4 pt-4">
        {category && (
          <View className="mb-4">
            <Text className="text-xl font-bold text-primary-900" style={{ fontFamily: "Fraunces" }}>
              {category.name}
            </Text>
            <Text className="mt-1 text-sm text-gray-500">{category.description}</Text>
          </View>
        )}

        {loading && <DetailSkeleton />}
        {error && (
          <View className="rounded-xl border border-red-200 bg-red-50 p-4">
            <Text className="text-sm text-red-600">{error}</Text>
          </View>
        )}
        {!loading && !error && offenses.length === 0 && (
          <EmptyState variant="no-offenses" />
        )}
        {!loading && offenses.length > 0 && (
          <View className="gap-3">
            {offenses.map((offense) => (
              <OffenseCard
                key={offense.id}
                id={offense.id}
                name={offense.name}
                category={offense.category}
                severity={offense.severity}
                min_fine={offense.min_fine}
                max_fine={offense.max_fine}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
