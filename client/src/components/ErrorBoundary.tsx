import React from "react";
import { View, Text } from "react-native";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-surface px-6">
          <Text className="text-center text-lg font-semibold text-primary-900">
            Something went wrong
          </Text>
          <Text className="mt-2 text-center text-sm text-gray-500">
            {this.state.error?.message || "An unexpected error occurred."}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}
