import { Text } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { Page } from "../../src/components/Page";
import { RequestState } from "../../src/components/RequestState";
import { SourceLink } from "../../src/components/SourceLink";
import { useResource } from "../../src/hooks/useResource";
import type { LegalProvision } from "../../src/types";
export default function ProvisionScreen(): React.JSX.Element {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const resource = useResource<LegalProvision>(
    `/provisions/${encodeURIComponent(id)}`,
  );
  const provision = resource.data;
  return (
    <Page>
      <RequestState {...resource} />
      {provision && (
        <>
          <Text className="text-base text-primary-700">
            {provision.instrument_title}
          </Text>
          <Text
            accessibilityRole="header"
            className="text-2xl font-bold leading-9 text-primary-900"
          >
            {provision.number} — {provision.heading}
          </Text>
          <Text className="text-sm leading-6 text-gray-700">
            Source version {provision.source_version} · Checked{" "}
            {new Date(provision.verified_at).toLocaleDateString("en-KE")}
          </Text>
          <Text selectable className="text-base leading-8 text-primary-900">
            {provision.text}
          </Text>
          <SourceLink url={provision.source_url} />
          <Link
            href={{
              pathname: "/law/[id]",
              params: { id: provision.instrument_id },
            }}
            className="py-3 text-primary-600 underline"
          >
            Browse this law →
          </Link>
        </>
      )}
    </Page>
  );
}
