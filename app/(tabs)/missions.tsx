import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Trophy, Award, Clock, Target, Gem, Sparkles } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";

import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";

export default function MissionsScreen() {
  const { missions, leaderboard, completeMission } = useApp();
  const [selectedTab, setSelectedTab] = useState<'daily' | 'weekly'>('daily');

  const filteredMissions = missions.filter(m => m.type === selectedTab);

  const handleCompleteMission = (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;

    if (mission.progress >= mission.target && !mission.completed) {
      Alert.alert(
        '🎉 미션 완료!',
        `${mission.title}을(를) 완료하여 ${mission.reward} JUS를 획득했습니다!`,
        [
          {
            text: '받기',
            onPress: () => completeMission(missionId),
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary]}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>미션</Text>
            <Trophy size={28} color={Colors.accent} fill={Colors.accent} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'daily' && styles.tabActive]}
          onPress={() => setSelectedTab('daily')}
        >
          <Clock size={18} color={selectedTab === 'daily' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, selectedTab === 'daily' && styles.tabTextActive]}>
            일일 미션
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'weekly' && styles.tabActive]}
          onPress={() => setSelectedTab('weekly')}
        >
          <Target size={18} color={selectedTab === 'weekly' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, selectedTab === 'weekly' && styles.tabTextActive]}>
            주간 미션
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.missionsSection}>
          {filteredMissions.map((mission) => {
            const progressPercent = (mission.progress / mission.target) * 100;
            const canComplete = mission.progress >= mission.target && !mission.completed;

            return (
              <TouchableOpacity
                key={mission.id}
                style={[styles.missionCard, mission.completed && styles.missionCardCompleted]}
                onPress={() => handleCompleteMission(mission.id)}
                disabled={!canComplete}
              >
                <View style={styles.missionHeader}>
                  <View style={[styles.missionIcon, mission.completed && styles.missionIconCompleted]}>
                    {mission.completed ? (
                      <Award size={24} color={Colors.white} fill={Colors.white} />
                    ) : (
                      <Sparkles size={24} color={Colors.primary} />
                    )}
                  </View>
                  <View style={styles.rewardBadge}>
                    <Gem size={14} color={Colors.white} />
                    <Text style={styles.rewardText}>+{mission.reward}</Text>
                  </View>
                </View>

                <Text style={styles.missionTitle}>{mission.title}</Text>
                <Text style={styles.missionDescription}>{mission.description}</Text>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <LinearGradient
                      colors={[Colors.primary, Colors.secondary]}
                      style={[styles.progressFill, { width: `${Math.min(progressPercent, 100)}%` }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {mission.progress}/{mission.target}
                  </Text>
                </View>

                {mission.completed && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>✓ 완료</Text>
                  </View>
                )}
                {canComplete && (
                  <LinearGradient
                    colors={[Colors.accent, '#D97706']}
                    style={styles.claimBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.claimText}>탭하여 보상 받기</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.leaderboardSection}>
          <View style={styles.leaderboardHeader}>
            <Trophy size={20} color={Colors.gold} fill={Colors.gold} />
            <Text style={styles.leaderboardTitle}>거래 랭킹</Text>
          </View>

          {leaderboard.map((user, index) => (
            <View key={user.id} style={[styles.leaderboardCard, user.name === 'You' && styles.leaderboardCardMe]}>
              <View style={[
                styles.leaderboardRank,
                index === 0 && styles.rankGold,
                index === 1 && styles.rankSilver,
                index === 2 && styles.rankBronze,
              ]}>
                <Text style={[
                  styles.rankNumber,
                  index < 3 && styles.rankNumberTop
                ]}>#{user.rank}</Text>
              </View>
              <Text style={styles.userAvatar}>{user.avatar}</Text>
              <View style={styles.leaderboardInfo}>
                <Text style={[styles.userName, user.name === 'You' && styles.userNameMe]}>
                  {user.name}
                </Text>
                <Text style={styles.userTokens}>{user.tokens.toLocaleString()} JUS</Text>
              </View>
              {index < 3 && (
                <View style={[
                  styles.topBadge,
                  index === 0 && styles.topBadgeGold,
                  index === 1 && styles.topBadgeSilver,
                  index === 2 && styles.topBadgeBronze,
                ]}>
                  <Text style={styles.topBadgeText}>TOP {index + 1}</Text>
                </View>
              )}
            </View>
          ))}
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
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.white,
  },
  tabContainer: {
    flexDirection: 'row' as const,
    marginHorizontal: 16,
    marginTop: -10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  tabActive: {
    backgroundColor: Colors.surfaceLight,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
  missionsSection: {
    padding: 16,
  },
  missionCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  missionCardCompleted: {
    opacity: 0.6,
  },
  missionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  missionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  missionIconCompleted: {
    backgroundColor: Colors.primary,
  },
  rewardBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 6,
  },
  missionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: Colors.cardBg,
    borderRadius: 5,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    minWidth: 50,
    textAlign: 'right' as const,
  },
  completedBadge: {
    marginTop: 12,
    backgroundColor: Colors.success,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start' as const,
  },
  completedText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  claimBadge: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
  claimText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  leaderboardSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  leaderboardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 16,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  leaderboardCard: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  leaderboardCardMe: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  leaderboardRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  rankGold: {
    backgroundColor: Colors.gold,
  },
  rankSilver: {
    backgroundColor: Colors.silver,
  },
  rankBronze: {
    backgroundColor: Colors.bronze,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  rankNumberTop: {
    color: Colors.black,
  },
  userAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  leaderboardInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  userNameMe: {
    color: Colors.primary,
  },
  userTokens: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  topBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  topBadgeGold: {
    backgroundColor: Colors.gold,
  },
  topBadgeSilver: {
    backgroundColor: Colors.silver,
  },
  topBadgeBronze: {
    backgroundColor: Colors.bronze,
  },
  topBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.black,
  },
});
