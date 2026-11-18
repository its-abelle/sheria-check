import { useState } from "react";
import { Text, View, Pressable } from "react-native";
import { SourceLink } from "../../src/components/SourceLink";
import { Page } from "../../src/components/Page";
import { RequestState } from "../../src/components/RequestState";
import { ProvisionLink } from "../../src/components/ProvisionLink";
import { useResource } from "../../src/hooks/useResource";
import type { LegalProvision } from "../../src/types";
const topics = [
  { id: "arrest", label: "Arrest" },
  { id: "detention", label: "Detention" },
  { id: "bail", label: "Bail & bond" },
  { id: "fair-trial", label: "Fair trial" },
  { id: "legal-aid", label: "Legal assistance" },
];
export default function RightsScreen(): React.JSX.Element {
  const [topic, setTopic] = useState("arrest");
  const [cursor, setCursor] = useState(0);
  const article =
    topic === "detention"
      ? "51"
      : topic === "fair-trial" || topic === "legal-aid"
        ? "50"
        : "49";
  const resource = useResource<LegalProvision[]>(
    `/provisions?topic=${topic}&cursor=${cursor}`,
  );
  return (
    <Page>
      <Text
        accessibilityRole="header"
        className="text-2xl font-bold text-primary-900"
      >
        Find your rights in the law
      </Text>
      <Text className="text-base leading-7 text-gray-700">
        Read original provisions on arrest and criminal proceedings. These
        references are general information; their application depends on your
        circumstances.
      </Text>
      <View className="flex-row flex-wrap gap-3">
        {topics.map((item): React.JSX.Element => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityState={{ selected: topic === item.id }}
            onPress={(): void => {
              setTopic(item.id);
              setCursor(0);
            }}
            className={
              topic === item.id
                ? "min-h-12 justify-center rounded-lg bg-primary-500 px-4"
                : "min-h-12 justify-center rounded-lg border border-primary-200 px-4"
            }
          >
            <Text
              className={
                topic === item.id
                  ? "font-semibold text-white"
                  : "font-semibold text-primary-700"
              }
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <SourceLink
        url={`https://new.kenyalaw.org/akn/ke/act/2010/constitution/eng/#art_${article}`}
        label={`Open Constitution — Article ${article}`}
      />
      <RequestState {...resource} />
      {resource.data?.map((provision): React.JSX.Element => (
        <ProvisionLink key={provision.id} provision={provision} />
      ))}
      {!resource.loading && !resource.error && !resource.data?.length && (
        <Text className="text-base leading-7 text-gray-700">
          No source-verified provisions are published for this topic yet.
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
        {resource.pagination?.has_more && (
          <Pressable
            onPress={(): void => setCursor(cursor + 20)}
            accessibilityRole="button"
            className="min-h-12 justify-center"
          >
            <Text className="text-primary-600 underline">Next</Text>
          </Pressable>
        )}
      </View>
    </Page>
  );
}
