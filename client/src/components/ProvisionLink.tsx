import { Link } from "expo-router";
import { Text, Pressable } from "react-native";
import type { LegalProvision } from "../types";
interface ProvisionLinkProps {
  provision: LegalProvision;
}
export function ProvisionLink({
  provision,
}: ProvisionLinkProps): React.JSX.Element {
  return (
    <Link
      href={{ pathname: "/provision/[id]", params: { id: provision.id } }}
      asChild
    >
      <Pressable
        accessibilityRole="link"
        className="gap-2 border-b border-primary-100 py-4 active:bg-primary-50"
      >
        <Text className="text-base font-semibold text-primary-900">
          {provision.number} — {provision.heading} →
        </Text>
        {provision.instrument_title && (
          <Text className="text-sm text-primary-700">
            {provision.instrument_title}
          </Text>
        )}
      </Pressable>
    </Link>
  );
}
