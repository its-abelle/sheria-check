import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SearchBar } from "../../src/components/SearchBar";
import { CategoryCard } from "../../src/components/CategoryCard";
import { DisclaimerBanner } from "../../src/components/DisclaimerBanner";
import { BalanceScale } from "../../src/components/BalanceScale";
import { OffenseCard } from "../../src/components/OffenseCard";
import { EmptyState } from "../../src/components/EmptyState";
import { SearchSkeleton, CategorySkeleton } from "../../src/components/LoadingSkeleton";
import { useSearch } from "../../src/hooks/useSearch";
import { useCategories, useApiStatus } from "../../src/hooks/useOffenses";

export default function HomeScreen() {
  const { query, setQuery, results, loading, error, total } = useSearch();
  const { categories, loading: catLoading } = useCategories();
  const status = useApiStatus();
  const insets = useSafeAreaInsets();
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setShowResults(query.trim().length > 0);
  }, [query]);

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <View className="bg-primary-500 px-6 pb-10 pt-12">
        <View className="items-center">
          <BalanceScale size={72} />
          <Text className="mt-4 text-center text-2xl font-bold text-white" style={{ fontFamily: "Fraunces" }}>
            Know Your Fine.{"\n"}Stand Your Ground.
          </Text>
          <Text className="mt-3 text-center text-sm text-white/80">
            Look up traffic offense fines under Kenyan law.{"\n"}Don't let anyone overcharge you.
          </Text>
        </View>
        <View className="mt-8">
          <SearchBar value={query} onChangeText={setQuery} />
        </View>
        {status && (
          <Text className="mt-3 text-center text-xs text-white/50">
            {status.total_offenses} offenses · updated {new Date(status.last_updated).toLocaleDateString("en-KE")}
          </Text>
        )}
      </View>

      {/* Search Results */}
      {showResults && (
        <View className="border-b border-gray-100 bg-white px-4 py-6">
          <View className="mx-auto max-w-3xl">
            {loading && results.length === 0 && <SearchSkeleton />}
            {error && (
              <View className="rounded-xl border border-red-200 bg-red-50 p-4">
                <Text className="text-sm text-red-600">{error}</Text>
              </View>
            )}
            {!loading && !error && results.length === 0 && query.trim() && (
              <EmptyState variant="no-results" query={query} />
            )}
            {!loading && results.length > 0 && (
              <>
                <Text className="mb-3 text-sm text-gray-500">
                  {total} result{total !== 1 ? "s" : ""}
                </Text>
                <View className="gap-3">
                  {results.map((offense) => (
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
              </>
            )}
          </View>
        </View>
      )}

      {/* Categories */}
      {!showResults && (
        <View className="px-4 py-6">
          <View className="mx-auto max-w-3xl gap-3">
            <DisclaimerBanner />
            {catLoading ? (
              <CategorySkeleton />
            ) : (
              categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
