import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, Component, ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { Gem } from "lucide-react-native";

import { AppProvider, useApp } from "@/contexts/AppContext";
import { FirebaseProvider } from "@/contexts/FirebaseContext";
import Colors from "@/constants/colors";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>앱 오류</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || '알 수 없는 오류가 발생했습니다'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isLoading } = useApp();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <View style={styles.logoContainer}>
            <Gem size={64} color={Colors.primary} />
          </View>
          <Text style={styles.appName}>JUS Station</Text>
          <Text style={styles.appTagline}>토큰 거래소</Text>
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        </View>
        <View style={styles.copyrightContainer}>
          <Text style={styles.copyrightText}>© 2025 NFLOYD LABS INC</Text>
          <Text style={styles.copyrightSubtext}>All Rights Reserved</Text>
        </View>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerBackTitle: "뒤로" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <FirebaseProvider>
          <AppProvider>
            <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
              <StatusBar style="light" />
              <RootLayoutNav />
            </GestureHandlerRootView>
          </AppProvider>
        </FirebaseProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.background,
    paddingVertical: 60,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  loader: {
    marginTop: 16,
  },
  copyrightContainer: {
    alignItems: 'center' as const,
    gap: 4,
    paddingBottom: 20,
  },
  copyrightText: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  copyrightSubtext: {
    fontSize: 10,
    color: Colors.textLight,
    opacity: 0.6,
    fontWeight: '400' as const,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.background,
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.error,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
