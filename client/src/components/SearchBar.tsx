import { View, TextInput, Pressable } from "react-native";
import { Search } from "lucide-react-native";
import { cn } from "../utils/cn";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = "Search offenses..." }: SearchBarProps) {
  return (
    <View className="flex-row items-center rounded-2xl border border-primary-200 bg-white px-4 py-3">
      <Search size={20} color="#6B3A2A" />
      <TextInput
        className="ml-3 flex-1 text-base text-primary-900"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A87A5E"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Search traffic offenses"
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText("")}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <View className="h-6 w-6 items-center justify-center rounded-full bg-primary-100">
            <Search size={12} color="#6B3A2A" />
          </View>
        </Pressable>
      )}
    </View>
  );
}
