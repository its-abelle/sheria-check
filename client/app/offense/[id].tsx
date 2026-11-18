import { Link, useLocalSearchParams } from "expo-router";
import { Text, View, Pressable } from "react-native";
import { Page } from "../../src/components/Page";
import { RequestState } from "../../src/components/RequestState";
import { SourceLink } from "../../src/components/SourceLink";
import { useOffenseDetail } from "../../src/hooks/useOffenses";
import { useResource } from "../../src/hooks/useResource";
import { useShare } from "../../src/hooks/useShare";
import type { JudgmentReference } from "../../src/types";
import { en } from "../../src/i18n/en";
export default function OffenseDetailScreen(): React.JSX.Element {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const resource = useOffenseDetail(id);
  const offense = resource.offense;
  const judgments = useResource<JudgmentReference[]>(
    offense ? `/judgments?offense_id=${encodeURIComponent(id)}` : null,
  );
  const { share, message } = useShare();
  return (
    <Page>
      <RequestState {...resource} />
      {offense && (
        <>
          <Text
            accessibilityRole="header"
            className="text-2xl font-bold leading-9 text-primary-900"
          >
            {offense.name}
          </Text>
          <Text className="text-base text-primary-700">{offense.citation}</Text>
          <Text className="text-sm leading-6 text-gray-700">
            Source version: {offense.source_version} · Checked{" "}
            {new Date(offense.verified_at).toLocaleDateString("en-KE")}. Later
            changes may apply.
          </Text>
          <Text
            accessibilityRole="header"
            className="text-xl font-semibold text-primary-900"
          >
            Offense provision
          </Text>
          <Text selectable className="text-base leading-8 text-primary-900">
            {offense.defining_text}
          </Text>
          <Link
            href={{
              pathname: "/provision/[id]",
              params: { id: offense.defining_provision_id },
            }}
            className="py-3 text-primary-600 underline"
          >
            Read defining provision in context →
          </Link>
          <Text
            accessibilityRole="header"
            className="text-xl font-semibold text-primary-900"
          >
            {en.penalties}
          </Text>
          <Text className="text-sm leading-6 text-primary-700">
            {offense.penalty_act}, {offense.penalty_section} · Source version{" "}
            {offense.penalty_source_version}
          </Text>
          <Text selectable className="text-base leading-8 text-primary-900">
            {offense.penalty_text}
          </Text>
          <Text className="text-sm leading-6 text-primary-700">
            {en.penaltyNotice}
          </Text>
          <SourceLink
            url={offense.penalty_source_url}
            label="Read official penalty provision"
          />
          <Text
            accessibilityRole="header"
            className="text-xl font-semibold text-primary-900"
          >
            Related judgments
          </Text>
          <Text className="text-sm leading-6 text-gray-700">
            {en.casesNotice}
          </Text>
          <RequestState {...judgments} />
          {judgments.data?.map((judgment): React.JSX.Element => (
            <View
              key={judgment.id}
              className="border-b border-primary-100 py-3"
            >
              <Text className="text-base font-semibold text-primary-900">
                {judgment.citation}
              </Text>
              <Text className="text-sm text-gray-700">
                {judgment.court} · {judgment.decision_date.slice(0, 10)}
              </Text>
              <SourceLink url={judgment.source_url} label="Read judgment" />
            </View>
          ))}
          {!judgments.loading &&
            !judgments.error &&
            !judgments.data?.length && (
              <Text className="text-base text-gray-700">
                No verified judgment references are linked yet.
              </Text>
            )}
          <Pressable
            accessibilityRole="button"
            onPress={(): void => {
              void share({
                title: offense.name,
                message: `${offense.name}\n${offense.citation}\n${en.disclaimer}`,
                url: offense.source_url,
              });
            }}
            className="min-h-12 justify-center rounded-lg bg-primary-500 px-5"
          >
            <Text className="text-center font-semibold text-white">
              Share official reference
            </Text>
          </Pressable>
          {message && (
            <Text
              accessibilityRole="alert"
              className="text-sm text-primary-800"
            >
              {message}
            </Text>
          )}
        </>
      )}
    </Page>
  );
}
