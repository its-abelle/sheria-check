import { View, Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { cn } from "../utils/cn";

interface OffenseCardProps {
  id: string;
  name: string;
  category: string;
  severity: "minor" | "serious" | "felony";
  min_fine: number;
  max_fine: number;
}

const SEVERITY_COLORS = {
  minor: { bg: "bg-green-50", text: "text-green-700", label: "Minor" },
  serious: { bg: "bg-amber-50", text: "text-amber-700", label: "Serious" },
  felony: { bg: "bg-red-50", text: "text-red-700", label: "Felony" },
} as const;

export function OffenseCard({ id, name, category, severity, min_fine, max_fine }: OffenseCardProps) {
  const router = useRouter();
  const sev = SEVERITY_COLORS[severity];

  return (
    <Pressable
      onPress={() => router.push(`/offense/${id}`)}
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-4",
        "active:bg-gray-50"
      )}
      accessibilityLabel={`${name}, severity ${severity}, fine KES ${min_fine.toLocaleString("en-KE")} to ${max_fine.toLocaleString("en-KE")}`}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-base font-semibold text-primary-900">{name}</Text>
          <Text className="mt-1 text-sm text-gray-500">{category}</Text>
          <View className="mt-2 flex-row items-center gap-2">
            <View className={cn("rounded-full px-2 py-0.5", sev.bg)}>
              <Text className={cn("text-xs font-medium", sev.text)}>{sev.label}</Text>
            </View>
            <Text className="text-sm text-primary-600">
              KES {min_fine.toLocaleString("en-KE")} – {max_fine.toLocaleString("en-KE")}
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color="#A87A5E" style={{ marginTop: 2 }} />
      </View>
    </Pressable>
  );
}
