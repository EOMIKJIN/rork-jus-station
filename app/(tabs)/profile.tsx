import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { User, BarChart3, Settings, LogOut, Gem, Award, ArrowRightLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";

import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { useFirebase } from "@/contexts/FirebaseContext";

export default function ProfileScreen() {
  const { jusTokens, ethBalance, usdtBalance, transactions, missions } = useApp();
  const { userData, isAuthenticated } = useFirebase();

  const totalExchanged = transactions
    .filter(t => t.type === 'exchange')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalDeposited = transactions
    .filter(t => t.type === 'deposit' || t.type === 'bonus')
    .reduce((sum, t) => sum + t.amount, 0);

  const completedMissions = missions.filter(m => m.completed).length;

  const stats = [
    { label: '총 교환', value: totalExchanged.toLocaleString(), unit: 'JUS', icon: ArrowRightLeft },
    { label: '총 입금', value: totalDeposited.toLocaleString(), unit: 'JUS', icon: BarChart3 },
    { label: '완료 미션', value: completedMissions, unit: '개', icon: Award },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary]}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>프로필</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.avatar}
            >
              <User size={48} color={Colors.white} />
            </LinearGradient>
          </View>
          <Text style={styles.userName}>{userData?.nickname || 'JewelSpin 유저'}</Text>
          <Text style={styles.userEmail}>{userData?.email || 'user@jewelspin.io'}</Text>
          {isAuthenticated && userData && (
            <View style={styles.firebaseBadge}>
              <Text style={styles.firebaseBadgeText}>Firebase 연동됨</Text>
            </View>
          )}
          
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Gem size={20} color={Colors.primary} />
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>JUS (로컬)</Text>
                <Text style={styles.balanceValue}>{jusTokens.toLocaleString()}</Text>
              </View>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceIcon}>⟠</Text>
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>ETH</Text>
                <Text style={styles.balanceValue}>{ethBalance.toFixed(4)}</Text>
              </View>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceIcon}>💵</Text>
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>USDT</Text>
                <Text style={styles.balanceValue}>{usdtBalance.toFixed(2)}</Text>
              </View>
            </View>
          </View>
          
          {userData && (
            <View style={styles.firebaseDataRow}>
              <View style={styles.firebaseDataItem}>
                <Text style={styles.firebaseDataLabel}>Firebase 쥬얼</Text>
                <Text style={styles.firebaseDataValue}>{userData.jewels?.toLocaleString() || '0'}</Text>
              </View>
              {userData.level && (
                <View style={styles.firebaseDataItem}>
                  <Text style={styles.firebaseDataLabel}>레벨</Text>
                  <Text style={styles.firebaseDataValue}>{userData.level}</Text>
                </View>
              )}
              {userData.experience !== undefined && (
                <View style={styles.firebaseDataItem}>
                  <Text style={styles.firebaseDataLabel}>경험치</Text>
                  <Text style={styles.firebaseDataValue}>{userData.experience}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>거래 통계</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <View key={index} style={styles.statCard}>
                  <View style={styles.statIconContainer}>
                    <Icon size={24} color={Colors.primary} />
                  </View>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <View style={styles.statValueRow}>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statUnit}>{stat.unit}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>설정</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Settings size={20} color={Colors.primary} />
            </View>
            <Text style={styles.settingText}>앱 설정</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <User size={20} color={Colors.primary} />
            </View>
            <Text style={styles.settingText}>계정 관리</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <LogOut size={20} color={Colors.error} />
            </View>
            <Text style={[styles.settingText, styles.settingTextDanger]}>로그아웃</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>JewelSpin Exchange v1.0.0</Text>
          <Text style={styles.footerSubtext}>게임 토큰을 실제 가치로</Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    margin: 16,
    marginTop: -10,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  balanceRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    width: '100%',
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
  },
  balanceItem: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
  },
  balanceIcon: {
    fontSize: 20,
  },
  balanceInfo: {
    alignItems: 'flex-start' as const,
  },
  balanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  balanceLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  statsSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  statValueRow: {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  statUnit: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  settingsSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  settingItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  settingTextDanger: {
    color: Colors.error,
  },
  footer: {
    alignItems: 'center' as const,
    marginTop: 32,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 13,
    color: Colors.textLight,
  },
  firebaseBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  firebaseBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  firebaseDataRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 12,
  },
  firebaseDataItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  firebaseDataLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  firebaseDataValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
});
