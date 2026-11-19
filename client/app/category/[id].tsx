import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { Page } from "../../src/components/Page";
import { RequestState } from "../../src/components/RequestState";
import { OffenseCard } from "../../src/components/OffenseCard";
import { useOffensesByCategory } from "../../src/hooks/useOffenses";
import { en } from "../../src/i18n/en";
export default function CategoryScreen(): React.JSX.Element {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const resource = useOffensesByCategory(id);
  return (
    <Page>
      <Text
        accessibilityRole="header"
        className="text-2xl font-bold text-primary-900"
      >
        {id.replace(/-/g, " ")}
      </Text>
      <RequestState {...resource} />
      {resource.offenses.map((offense): React.JSX.Element => (
        <OffenseCard key={offense.id} offense={offense} />
      ))}
      {!resource.loading && !resource.error && !resource.offenses.length && (
        <Text className="text-base leading-7 text-gray-700">
          {en.noOffenses}
        </Text>
      )}
    </Page>
  );
}
