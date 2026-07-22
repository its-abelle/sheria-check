import { useState, useRef, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Shield, Flag, BookOpen, Share2, Check } from "lucide-react-native";
import { useOffenseDetail } from "../../src/hooks/useOffenses";
import { useShare } from "../../src/hooks/useShare";
import { DetailSkeleton } from "../../src/components/LoadingSkeleton";
import { EmptyState } from "../../src/components/EmptyState";
import { ReportModal } from "../../src/components/ReportModal";
import { formatKES, formatDate } from "../../src/utils/format";
import { cn } from "../../src/utils/cn";

const SEVERITY_MAP = {
  minor: { label: "Minor", color: "text-green-700", bg: "bg-green-50" },
  serious: { label: "Serious", color: "text-amber-700", bg: "bg-amber-50" },
  felony: { label: "Felony", color: "text-red-700", bg: "bg-red-50" },
} as const;

const SEVERITY_FALLBACK = {
  label: "Unknown",
  color: "text-gray-700",
  bg: "bg-gray-50",
} as const;

export default function OffenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { offense, loading, error } = useOffenseDetail(id || "");
  const { share } = useShare();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [reportOpen, setReportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  if (loading) {
    return (
      <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ padding: 16 }}>
        <DetailSkeleton />
      </ScrollView>
    );
  }

  if (error || !offense) {
    return (
      <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ padding: 16 }}>
        <EmptyState variant="no-offenses" />
        <Pressable onPress={() => router.back()} className="mt-4 items-center">
          <Text className="text-sm text-primary-500">Back to home</Text>
        </Pressable>
      </ScrollView>
    );
  }

  const severityInfo = SEVERITY_MAP[offense.severity] ?? SEVERITY_FALLBACK;

  const handleShare = async () => {
    const result = await share({
      title: offense.name,
      message: [
        `${offense.name}`,
        `Severity: ${severityInfo.label}`,
        `Fine: ${formatKES(offense.min_fine)} – ${formatKES(offense.max_fine)}`,
        offense.max_imprisonment ? `Imprisonment: up to ${offense.max_imprisonment}` : null,
        "",
        `Citation: ${offense.citation}`,
        `Act: ${offense.act}, Section ${offense.section}`,
        "",
        "Course of action:",
        offense.course_of_action,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    if (result === "copied" && mountedRef.current) {
      setCopied(true);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}
    >
      {/* Header */}
      <View className="mb-4 flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-xl font-bold text-primary-900" style={{ fontFamily: "Fraunces" }}>
            {offense.name}
          </Text>
          <View className="mt-2 flex-row items-center gap-2">
            <View className={cn("rounded-full px-2 py-0.5", severityInfo.bg)}>
              <Text className={cn("text-xs font-medium", severityInfo.color)}>
                {severityInfo.label}
              </Text>
            </View>
            <Text className="text-xs text-gray-500">{offense.category}</Text>
          </View>
        </View>
        <Pressable
          onPress={handleShare}
          className="rounded-full bg-primary-50 p-2"
          accessibilityLabel="Share offense details"
        >
          {copied ? (
            <Check size={18} color="#16a34a" />
          ) : (
            <Share2 size={18} color="#6B3A2A" />
          )}
        </Pressable>
      </View>

      {/* Fine Range */}
      <View className="mb-4 rounded-2xl border border-primary-200 bg-primary-50 p-4">
        <Text className="text-sm font-medium text-primary-600">Fine Range</Text>
        <Text className="mt-1 text-xl font-bold text-primary-900">
          {formatKES(offense.min_fine)} – {formatKES(offense.max_fine)}
        </Text>
        {offense.max_imprisonment && (
          <Text className="mt-1 text-sm text-primary-700">
            Imprisonment: up to {offense.max_imprisonment}
          </Text>
        )}
      </View>

      {/* Legal Citation */}
      <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
        <View className="mb-2 flex-row items-center gap-2">
          <BookOpen size={16} color="#6B3A2A" />
          <Text className="text-sm font-semibold text-primary-900">Legal Citation</Text>
        </View>
        <Text className="text-sm text-gray-600">{offense.citation}</Text>
        <Text className="mt-1 text-xs text-gray-500">
          {offense.act}, Section {offense.section}
        </Text>
        <Text className="mt-1 text-xs text-gray-400">Law version: {offense.law_version}</Text>
      </View>

      {/* Course of Action */}
      <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
        <View className="mb-2 flex-row items-center gap-2">
          <Shield size={16} color="#6B3A2A" />
          <Text className="text-sm font-semibold text-primary-900">What To Do</Text>
        </View>
        <Text className="text-sm leading-5 text-gray-600">{offense.course_of_action}</Text>
      </View>

      {/* Description */}
      {offense.description && (
        <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
          <View className="mb-2 flex-row items-center gap-2">
            <Flag size={16} color="#6B3A2A" />
            <Text className="text-sm font-semibold text-primary-900">Description</Text>
          </View>
          <Text className="text-sm leading-5 text-gray-600">{offense.description}</Text>
        </View>
      )}

      {/* Aliases */}
      {offense.aliases && offense.aliases.length > 0 && (
        <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
          <Text className="mb-2 text-sm font-semibold text-primary-900">Also Known As</Text>
          <View className="flex-row flex-wrap gap-2">
            {offense.aliases.map((alias) => (
              <View key={alias} className="rounded-full bg-gray-100 px-3 py-1">
                <Text className="text-xs text-gray-600">{alias}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Report Button */}
      <Pressable
        onPress={() => setReportOpen(true)}
        className="mt-2 flex-row items-center justify-center gap-2 rounded-2xl bg-primary-500 py-4"
      >
        <Flag size={18} color="#ffffff" />
        <Text className="font-semibold text-white">Report Corruption</Text>
      </Pressable>

      {/* Updated date */}
      <Text className="mt-4 text-center text-xs text-gray-400">
        Updated: {formatDate(offense.updated_at)}
      </Text>

      {/* Report Modal */}
      <ReportModal
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        offenseId={offense.id}
      />
    </ScrollView>
  );
}
