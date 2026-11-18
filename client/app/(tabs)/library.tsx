import { useState, useEffect } from "react";
import { Link } from "expo-router";
import { Text, View, Pressable } from "react-native";
import { officialReferences } from "../../src/data/library";
import { SourceLink } from "../../src/components/SourceLink";
import { Page } from "../../src/components/Page";
import { SearchBar } from "../../src/components/SearchBar";
import { RequestState } from "../../src/components/RequestState";
import { ProvisionLink } from "../../src/components/ProvisionLink";
import { useResource } from "../../src/hooks/useResource";
import type { LegalInstrument, LegalProvision } from "../../src/types";
export default function LibraryScreen(): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [cursor, setCursor] = useState(0);
  useEffect((): (() => void) => {
    const timer = setTimeout((): void => {
      setDebounced(query.trim());
      setCursor(0);
    }, 250);
    return (): void => clearTimeout(timer);
  }, [query]);
  const laws = useResource<LegalInstrument[]>(
    `/legislation?q=${encodeURIComponent(debounced)}`,
  );
  const provisions = useResource<LegalProvision[]>(
    debounced
      ? `/provisions?q=${encodeURIComponent(debounced)}&cursor=${cursor}`
      : null,
  );
  return (
    <Page>
      <Text
        accessibilityRole="header"
        className="text-2xl font-bold text-primary-900"
      >
        Read Kenyan law
      </Text>
      <Text className="text-base leading-7 text-gray-700">
        Original legal wording, organized by Act and provision. Published
        coverage may include selected provisions rather than a complete Act.
        Check version dates and the official source.
      </Text>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search laws and provisions"
      />
      <RequestState {...laws} />
      {laws.data?.map((law): React.JSX.Element => (
        <Link
          key={law.id}
          href={{ pathname: "/law/[id]", params: { id: law.id } }}
          asChild
        >
          <Pressable
            accessibilityRole="link"
            className="gap-2 border-b border-primary-100 py-4 active:bg-primary-50"
          >
            <Text className="text-lg font-semibold text-primary-900">
              {law.title} →
            </Text>
            <Text className="text-sm text-gray-700">
              Version {law.version} · {law.provision_count} published provisions
            </Text>
          </Pressable>
        </Link>
      ))}
      {!laws.loading && !laws.error && !laws.data?.length && (
        <Text className="text-base leading-7 text-gray-700">
          {debounced
            ? "No law titles match this search."
            : "The library is being source-checked. No texts have been published yet."}
        </Text>
      )}
      {debounced && (
        <View className="gap-3">
          <Text
            accessibilityRole="header"
            className="text-xl font-semibold text-primary-900"
          >
            Matching provisions
          </Text>
          <RequestState {...provisions} />
          {provisions.data?.map((provision): React.JSX.Element => (
            <ProvisionLink key={provision.id} provision={provision} />
          ))}
          {!provisions.loading &&
            !provisions.error &&
            !provisions.data?.length && (
              <Text className="text-base text-gray-700">
                No published provisions match.
              </Text>
            )}
          <View className="flex-row gap-4">
            {cursor > 0 && (
              <Pressable
                onPress={(): void => setCursor(Math.max(0, cursor - 20))}
                accessibilityRole="button"
                className="min-h-12 justify-center"
              >
                <Text className="text-primary-600 underline">Previous</Text>
              </Pressable>
            )}
            {provisions.pagination?.has_more && (
              <Pressable
                onPress={(): void => setCursor(cursor + 20)}
                accessibilityRole="button"
                className="min-h-12 justify-center"
              >
                <Text className="text-primary-600 underline">
                  Next provisions
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
      <Text
        accessibilityRole="header"
        className="text-xl font-semibold text-primary-900"
      >
        Official reference directory
      </Text>
      <Text className="text-base leading-7 text-gray-700">
        Open these laws on Kenya Law. In-app texts are added after source and
        permission checks; the links below do not imply that their full texts
        are available here.
      </Text>
      {officialReferences.map((reference): React.JSX.Element => (
        <SourceLink
          key={reference.url}
          url={reference.url}
          label={reference.title}
        />
      ))}
    </Page>
  );
}
