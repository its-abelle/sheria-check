import { useState } from "react";
import { Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Page } from "../../src/components/Page";
import { SearchBar } from "../../src/components/SearchBar";
import { RequestState } from "../../src/components/RequestState";
import { SourceLink } from "../../src/components/SourceLink";
import { ProvisionLink } from "../../src/components/ProvisionLink";
import { useResource } from "../../src/hooks/useResource";
import type { InstrumentDetail } from "../../src/types";
export default function LawScreen(): React.JSX.Element {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const [query, setQuery] = useState("");
  const resource = useResource<InstrumentDetail>(
    `/legislation/${encodeURIComponent(id)}`,
  );
  const law = resource.data;
  return (
    <Page>
      <RequestState {...resource} />
      {law && (
        <>
          <Text
            accessibilityRole="header"
            className="text-2xl font-bold text-primary-900"
          >
            {law.title}
          </Text>
          <Text className="text-sm leading-6 text-gray-700">
            Version {law.version} · Source checked{" "}
            {new Date(law.verified_at).toLocaleDateString("en-KE")}. Later
            amendments or court decisions may apply.
          </Text>
          <Text className="text-base leading-7 text-primary-700">
            This collection contains published provisions. Use the official
            source to check the complete instrument and its current status.
          </Text>
          <SourceLink url={law.source_url} />
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Find a section, article or phrase"
          />
          {law.provisions
            .filter((p): boolean =>
              `${p.number} ${p.heading} ${p.text}`
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            .map((p): React.JSX.Element => (
              <ProvisionLink key={p.id} provision={p} />
            ))}
          {!law.provisions.length && (
            <Text className="text-base text-gray-700">
              No provision text has been published for this version yet.
            </Text>
          )}
        </>
      )}
    </Page>
  );
}
