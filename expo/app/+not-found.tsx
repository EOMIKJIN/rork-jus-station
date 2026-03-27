import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { Home } from 'lucide-react-native';

import Colors from '@/constants/colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '페이지를 찾을 수 없습니다' }} />
      <View style={styles.container}>
        <Home size={64} color={Colors.textLight} />
        <Text style={styles.title}>페이지를 찾을 수 없습니다</Text>
        <Text style={styles.subtitle}>요청하신 페이지가 존재하지 않습니다</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>홈으로 돌아가기</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  link: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  linkText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});