import { Text } from "react-native";
import { Page } from "../../src/components/Page";
import { en } from "../../src/i18n/en";
export default function DisclaimerScreen(): React.JSX.Element {
  return (
    <Page>
      <Text
        accessibilityRole="header"
        className="text-2xl font-bold text-primary-900"
      >
        About Sheria Check
      </Text>
      <Text className="text-base leading-8 text-primary-900">
        {en.disclaimer}
      </Text>
      <Text
        accessibilityRole="header"
        className="text-xl font-semibold text-primary-900"
      >
        Sources and limits
      </Text>
      <Text className="text-base leading-8 text-gray-700">
        We publish source-verified provisions from Kenyan legislation and
        references to public judgments. Coverage is selective. Source versions
        and verification dates do not guarantee that no later amendments or
        court decisions exist. Always check the official text.
      </Text>
      <Text
        accessibilityRole="header"
        className="text-xl font-semibold text-primary-900"
      >
        Penalties and proceedings
      </Text>
      <Text className="text-base leading-8 text-gray-700">
        {en.penaltyNotice} A judgment concerns its own facts and legal context.
      </Text>
      <Text
        accessibilityRole="header"
        className="text-xl font-semibold text-primary-900"
      >
        Privacy
      </Text>
      <Text className="text-base leading-8 text-gray-700">
        No account is required. We do not retain your searches, IP address or
        personal case history in application logs. The hosting service processes
        network connections to serve requests; its configuration must follow the
        published privacy policy. Do not enter names or identifying case
        details. Internet access is required.
      </Text>
      <Text
        accessibilityRole="header"
        className="text-xl font-semibold text-primary-900"
      >
        Language
      </Text>
      <Text className="text-base leading-8 text-gray-700">
        English is currently supported. Future translations will be reviewed and
        clearly separated from original legal texts.
      </Text>
    </Page>
  );
}
