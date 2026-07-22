import { View, Text } from "react-native";
import { Scale, SearchX, FolderOpen } from "lucide-react-native";

interface EmptyStateProps {
  variant: "no-results" | "no-offenses" | "error";
  query?: string;
}

export function EmptyState({ variant, query }: EmptyStateProps) {
  if (variant === "no-results") {
    return (
      <View className="items-center py-12">
        <SearchX size={48} color="#A87A5E" />
        <Text className="mt-4 text-lg font-semibold text-primary-900">No results found</Text>
        <Text className="mt-2 text-center text-sm text-gray-500">
          No offenses match "{query}". Try different keywords.
        </Text>
      </View>
    );
  }

  if (variant === "no-offenses") {
    return (
      <View className="items-center py-12">
        <FolderOpen size={48} color="#A87A5E" />
        <Text className="mt-4 text-lg font-semibold text-primary-900">No offenses available</Text>
        <Text className="mt-2 text-center text-sm text-gray-500">
          The offense database for this category is currently empty.
        </Text>
      </View>
    );
  }

  return (
    <View className="items-center py-12">
      <Scale size={48} color="#A87A5E" />
      <Text className="mt-4 text-lg font-semibold text-primary-900">Something went wrong</Text>
      <Text className="mt-2 text-center text-sm text-gray-500">
        Please check your connection and try again.
      </Text>
    </View>
  );
}
