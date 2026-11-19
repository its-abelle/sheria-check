import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { Page } from "../../src/components/Page";
import { SearchBar } from "../../src/components/SearchBar";
import { OffenseCard } from "../../src/components/OffenseCard";
import { RequestState } from "../../src/components/RequestState";
import { useSearch } from "../../src/hooks/useSearch";
import { useCategories } from "../../src/hooks/useOffenses";
import { en } from "../../src/i18n/en";
export default function HomeScreen(): React.JSX.Element {
  const search = useSearch();
  const categories = useCategories();
  return (
    <Page>
      <Text
        accessibilityRole="header"
        className="text-3xl font-bold leading-10 text-primary-900"
      >
        {en.heading}
      </Text>
      <Text className="text-lg leading-7 text-gray-700">{en.introduction}</Text>
      <SearchBar
        value={search.query}
        onChangeText={search.setQuery}
        placeholder="Search an offense or legal term"
      />
      <Text className="text-sm leading-6 text-primary-700">{en.coverage}</Text>
      {!search.query && (
        <View className="flex-row flex-wrap gap-3">
          {categories.categories.map((category): React.JSX.Element => (
            <Link
              key={category.id}
              href={{ pathname: "/category/[id]", params: { id: category.id } }}
              className="rounded-lg border border-primary-200 px-4 py-3 text-primary-700"
            >
              {category.name} ({category.count})
            </Link>
          ))}
        </View>
      )}
      <RequestState
        loading={search.loading}
        error={search.error}
        retry={search.retry}
      />
      {!search.loading && !search.error && (
        <Text className="text-sm text-gray-700">
          {search.total} published result{search.total === 1 ? "" : "s"}
        </Text>
      )}
      {search.results.map((offense): React.JSX.Element => (
        <OffenseCard key={offense.id} offense={offense} />
      ))}
      {!search.loading && !search.error && !search.results.length && (
        <View className="gap-3 py-6">
          <Text className="text-base leading-7 text-primary-900">
            {en.noOffenses}
          </Text>
          <Link
            href="/library"
            className="py-3 font-semibold text-primary-600 underline"
          >
            Browse the law library →
          </Link>
        </View>
      )}
      {search.hasMore && (
        <Pressable
          accessibilityRole="button"
          disabled={search.loading}
          onPress={search.loadMore}
          className="min-h-12 justify-center rounded-lg bg-primary-500 px-5"
        >
          <Text className="text-center font-semibold text-white">
            Load more offenses
          </Text>
        </Pressable>
      )}
    </Page>
  );
}
