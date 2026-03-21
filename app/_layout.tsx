import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, Component, ReactNode, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { Gem } from "lucide-react-native";

// [추가] Firebase 관련 에러 방지를 위해 다시 임포트합니다.
import { FirebaseProvider } from "@/contexts/FirebaseContext"; 
import { AppProvider } from "@/contexts/AppContext";
import Colors from "@/constants/colors";

// 웹에서 첫 로딩 시 스플래시 화면을 유지합니다.
SplashScreen.preventAutoHideAsync().catch(() => {});

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
            {this.state.error?.message || "알 수 없는 오류가 발생했습니다."}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => window.location.reload()}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // [수정] 0.5초 대기 후 즉시 실행. 
        // FirebaseProvider 내부 로직이 무겁더라도 AppContent는 0.5초 후 렌더링을 시작합니다.
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn("Preparation error:", e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // 준비가 완료되면 스플래시 화면을 숨깁니다.
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.logoContainer}>
          <Gem size={60} color={Colors.white} />
        </View>
        <Text style={styles.appName}>JUS Station</Text>
        <Text style={styles.appTagline}>토큰 거래소</Text>
        <ActivityIndicator size="large" color={Colors.white} style={styles.loader} />
        
        <View style={styles.copyrightContainer}>
          <Text style={styles.copyrightText}>© 2026 NFLOYD LABS INC.</Text>
          <Text style={styles.copyrightSubtext}>REPRESENTATIVE: EOM IKJIN</Text>
        </View>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          {/* [해결] FirebaseProvider를 다시 추가하여 하위 컴포넌트(WalletScreen 등)의 
            useFirebase() 호출 시 발생하는 undefined 에러를 방지합니다.
          */}
          <FirebaseProvider>
            <AppProvider>
              <StatusBar style="light" />
              <AppContent />
            </AppProvider>
          </FirebaseProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
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
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
    gap: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  copyrightSubtext: {
    fontSize: 10,
    color: Colors.textLight,
    opacity: 0.6,
    fontWeight: '400',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.error,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
});