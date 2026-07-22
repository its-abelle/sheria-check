import { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BarChart3, MapPin, Calendar, TrendingUp } from "lucide-react-native";
import { LoadingSpinner } from "../../src/components/LoadingSpinner";
import type { IncidentInsight } from "../../src/types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export default function InsightsScreen() {
  const [insights, setInsights] = useState<IncidentInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/reports/insights`);
        if (!res.ok) throw new Error("Failed to load insights");
        const body = await res.json();
        const data = Array.isArray(body) ? body : body?.data ?? [];
        if (!cancelled) setInsights(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load insights");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      <View className="px-4 pt-6">
        <View className="mb-6 flex-row items-center gap-2">
          <BarChart3 size={22} color="#6B3A2A" />
          <Text className="text-lg font-bold text-primary-900" style={{ fontFamily: "Fraunces" }}>
            Incident Insights
          </Text>
        </View>

        <Text className="mb-4 text-sm text-gray-500">
          Aggregated, anonymized incident data — no personal information is shown.
        </Text>

        {loading && <LoadingSpinner />}
        {error && (
          <View className="rounded-xl border border-red-200 bg-red-50 p-4">
            <Text className="text-sm text-red-600">{error}</Text>
          </View>
        )}
        {!loading && !error && insights.length === 0 && (
          <View className="items-center py-12">
            <BarChart3 size={48} color="#A87A5E" />
            <Text className="mt-4 text-center text-base font-semibold text-primary-900">
              No incident data yet
            </Text>
            <Text className="mt-2 text-center text-sm text-gray-500">
              Incident insights will appear here once reports are submitted.
            </Text>
          </View>
        )}
        {!loading && insights.length > 0 && (
          <View className="gap-3">
            {insights.map((insight, i) => (
              <View key={i} className="rounded-2xl border border-gray-200 bg-white p-4">
                <View className="flex-row items-center gap-2">
                  <MapPin size={14} color="#A87A5E" />
                  <Text className="text-sm font-medium text-primary-900">{insight.area}</Text>
                  <View className="ml-auto flex-row items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5">
                    <TrendingUp size={12} color="#6B3A2A" />
                    <Text className="text-xs font-medium text-primary-600">
                      {insight.report_count} report{insight.report_count !== 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
                <View className="mt-2 flex-row items-center gap-2">
                  <Calendar size={12} color="#A87A5E" />
                  <Text className="text-xs text-gray-500">{insight.period}</Text>
                </View>
                {insight.top_offense_name && (
                  <Text className="mt-2 text-xs text-gray-500">
                    Most reported: {insight.top_offense_name}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
