import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gem, TrendingUp, TrendingDown, ArrowRightLeft, Sparkles } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";

import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";

export default function HomeScreen() {
  const { jusTokens, ethBalance, usdtBalance, marketCoins, transactions } = useApp();
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);

  const recentTransactions = transactions.slice(0, 3);

  const totalValueUsd = (jusTokens * 0.001) + (ethBalance * 2500) + usdtBalance;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary]}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>JUS Station</Text>
              <Text style={styles.headerSubtitle}>토큰 거래소</Text>
            </View>
            <TouchableOpacity style={styles.tokenBadge}>
              <Gem size={20} color={Colors.accent} fill={Colors.accent} />
              <Text style={styles.tokenAmount}>{jusTokens.toLocaleString()}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.portfolioCard}>
          <LinearGradient
            colors={[Colors.surfaceLight, Colors.surface]}
            style={styles.portfolioGradient}
          >
            <View style={styles.portfolioHeader}>
              <Sparkles size={20} color={Colors.accent} />
              <Text style={styles.portfolioLabel}>내 포트폴리오</Text>
            </View>
            <Text style={styles.portfolioValue}>${totalValueUsd.toFixed(2)}</Text>
            <Text style={styles.portfolioSubtext}>총 자산 가치</Text>

            <View style={styles.assetsRow}>
              <View style={styles.assetItem}>
                <Text style={styles.assetIcon}>💎</Text>
                <View>
                  <Text style={styles.assetValue}>{jusTokens.toLocaleString()}</Text>
                  <Text style={styles.assetLabel}>JUS</Text>
                </View>
              </View>
              <View style={styles.assetDivider} />
              <View style={styles.assetItem}>
                <Text style={styles.assetIcon}>⟠</Text>
                <View>
                  <Text style={styles.assetValue}>{ethBalance.toFixed(4)}</Text>
                  <Text style={styles.assetLabel}>ETH</Text>
                </View>
              </View>
              <View style={styles.assetDivider} />
              <View style={styles.assetItem}>
                <Text style={styles.assetIcon}>💵</Text>
                <View>
                  <Text style={styles.assetValue}>{usdtBalance.toFixed(2)}</Text>
                  <Text style={styles.assetLabel}>USDT</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.marketSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>시장 시세</Text>
            <Text style={styles.sectionSubtitle}>JUS 교환 비율</Text>
          </View>

          {marketCoins.map((coin) => (
            <TouchableOpacity key={coin.id} style={styles.coinCard}>
              <View style={styles.coinLeft}>
                <Text style={styles.coinIcon}>{coin.icon}</Text>
                <View>
                  <Text style={styles.coinSymbol}>{coin.symbol}</Text>
                  <Text style={styles.coinName}>{coin.name}</Text>
                </View>
              </View>
              <View style={styles.coinRight}>
                <Text style={styles.coinPrice}>1 JUS = {coin.price} {coin.symbol}</Text>
                <View style={[styles.changeContainer, coin.change24h >= 0 ? styles.changePositive : styles.changeNegative]}>
                  {coin.change24h >= 0 ? (
                    <TrendingUp size={12} color={Colors.success} />
                  ) : (
                    <TrendingDown size={12} color={Colors.error} />
                  )}
                  <Text style={[styles.changeText, coin.change24h >= 0 ? styles.changeTextPositive : styles.changeTextNegative]}>
                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>빠른 실행</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.actionGradient}
              >
                <ArrowRightLeft size={28} color={Colors.white} />
                <Text style={styles.actionText}>교환하기</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient
                colors={[Colors.secondary, '#0891B2']}
                style={styles.actionGradient}
              >
                <TrendingUp size={28} color={Colors.white} />
                <Text style={styles.actionText}>입금하기</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>최근 거래</Text>
          {recentTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>거래 내역이 없습니다</Text>
            </View>
          ) : (
            recentTransactions.map((tx) => (
              <View key={tx.id} style={styles.transactionCard}>
                <View style={[
                  styles.txIcon,
                  tx.amount >= 0 ? styles.txIconPositive : styles.txIconNegative
                ]}>
                  {tx.amount >= 0 ? (
                    <TrendingUp size={18} color={Colors.success} />
                  ) : (
                    <TrendingDown size={18} color={Colors.error} />
                  )}
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txDescription}>{tx.description}</Text>
                  <Text style={styles.txDate}>
                    {new Date(tx.date).toLocaleDateString('ko-KR')}
                  </Text>
                </View>
                <Text style={[
                  styles.txAmount,
                  tx.amount >= 0 ? styles.txAmountPositive : styles.txAmountNegative
                ]}>
                  {tx.amount >= 0 ? '+' : ''}{tx.amount.toLocaleString()} JUS
                </Text>
              </View>
            ))
          )}
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
  headerSubtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
    marginTop: 2,
  },
  tokenBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  tokenAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  portfolioCard: {
    margin: 16,
    marginTop: -10,
    borderRadius: 20,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  portfolioGradient: {
    padding: 24,
  },
  portfolioHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 12,
  },
  portfolioLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  portfolioValue: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  portfolioSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  assetsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
  },
  assetItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  assetIcon: {
    fontSize: 24,
  },
  assetValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  assetLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  assetDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  marketSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  coinCard: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  coinLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  coinIcon: {
    fontSize: 32,
  },
  coinSymbol: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  coinName: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  coinRight: {
    alignItems: 'flex-end' as const,
  },
  coinPrice: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  changePositive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  changeNegative: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  changeTextPositive: {
    color: Colors.success,
  },
  changeTextNegative: {
    color: Colors.error,
  },
  quickActions: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  actionsRow: {
    flexDirection: 'row' as const,
    gap: 12,
    marginTop: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden' as const,
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center' as const,
    gap: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  recentSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  emptyState: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center' as const,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  transactionCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  txIconPositive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  txIconNegative: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  txInfo: {
    flex: 1,
  },
  txDescription: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  txDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  txAmountPositive: {
    color: Colors.success,
  },
  txAmountNegative: {
    color: Colors.error,
  },
});
