import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AlertTriangle } from "lucide-react-native";

export default function DisclaimerScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      <View className="px-4 pt-6">
        <View className="mb-6 flex-row items-center gap-2">
          <AlertTriangle size={22} color="#B8860B" />
          <Text className="text-lg font-bold text-primary-900" style={{ fontFamily: "Fraunces" }}>
            Disclaimer
          </Text>
        </View>

        <View className="gap-4">
          <Section title="Informational Tool Only">
            Sheria Check is an informational tool based on publicly available legal texts. It does
            not constitute legal advice.
          </Section>
          <Section title="Data Source">
            All offense data is sourced from the Kenya Traffic Act (Cap 403) and related statutory
            instruments. While we strive for accuracy, always verify with official legal texts.
          </Section>
          <Section title="No Warranty">
            The information provided is offered "as is" without warranty of any kind. Sheria Check
            is not responsible for any decisions made based on the information provided.
          </Section>
          <Section title="Not a Substitute for Legal Counsel">
            For legal advice regarding specific situations, consult a qualified legal professional
            registered with the Law Society of Kenya.
          </Section>
          <Section title="Anonymous Reporting">
            Incident reports are anonymous and help track corruption patterns. They do not constitute
            formal complaints or legal proceedings.
          </Section>
        </View>

        <Text className="mt-8 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Sheria Check. Data sourced from Traffic Act Cap 403.
        </Text>
      </View>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="rounded-2xl border border-gray-200 bg-white p-4">
      <Text className="mb-2 text-base font-semibold text-primary-900">{title}</Text>
      <Text className="text-sm leading-5 text-gray-600">{children}</Text>
    </View>
  );
}
