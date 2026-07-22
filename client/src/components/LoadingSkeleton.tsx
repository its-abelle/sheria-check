import { View } from "react-native";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <View
      className={`rounded-xl bg-gray-200 ${className || ""}`}
      accessibilityLabel="Loading"
    />
  );
}

export function SearchSkeleton() {
  return (
    <View className="gap-3">
      <SkeletonBlock className="h-12 w-full rounded-2xl" />
      <SkeletonBlock className="h-20 w-full" />
      <SkeletonBlock className="h-20 w-full" />
    </View>
  );
}

export function CategorySkeleton() {
  return (
    <View className="gap-3">
      <SkeletonBlock className="h-16 w-full" />
      <SkeletonBlock className="h-16 w-full" />
      <SkeletonBlock className="h-16 w-full" />
    </View>
  );
}

export function DetailSkeleton() {
  return (
    <View className="gap-3">
      <SkeletonBlock className="h-8 w-3/4" />
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-32 w-full" />
      <SkeletonBlock className="h-24 w-full" />
    </View>
  );
}

export function LoadingSkeleton() {
  return <SearchSkeleton />;
}
