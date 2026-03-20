import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gem, ArrowRightLeft, TrendingUp, TrendingDown, ChevronDown } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";

import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { useFirebase } from "@/contexts/FirebaseContext";

export default function WalletScreen() {
  const { jusTokens, ethBalance, usdtBalance, transactions, exchangeTokens, marketCoins } = useApp();
  const { userData } = useFirebase();
  const [exchangeAmount, setExchangeAmount] = useState<string>('');
  const [selectedCoin, setSelectedCoin] = useState<string>('ETH');
  const [showCoinSelector, setShowCoinSelector] = useState<boolean>(false);
  const fee = 0.05;

  const selectedCoinData = marketCoins.find(c => c.symbol === selectedCoin);
  const exchangeRate = selectedCoinData?.price || 0.0001;

  const handleExchange = () => {
    const amount = parseFloat(exchangeAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('오류', '유효한 토큰 수량을 입력하세요');
      return;
    }
    if (amount > jusTokens) {
      Alert.alert('오류', '보유 JUS가 부족합니다');
      return;
    }

    const coinAmount = amount * exchangeRate * (1 - fee);
    Alert.alert(
      '교환 확인',
      `${amount.toLocaleString()} JUS를 ${coinAmount.toFixed(6)} ${selectedCoin}으로 교환하시겠습니까?\n(수수료 5% 포함)`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: () => {
            exchangeTokens(amount, selectedCoin, coinAmount);
            setExchangeAmount('');
            Alert.alert('성공', '토큰 교환이 완료되었습니다!');
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${month}/${day} ${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'bonus':
        return <TrendingUp size={20} color={Colors.success} />;
      case 'exchange':
      case 'withdraw':
        return <TrendingDown size={20} color={Colors.secondary} />;
      default:
        return <ArrowRightLeft size={20} color={Colors.primary} />;
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
            <Text style={styles.headerTitle}>지갑</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.balanceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.balanceRow}>
              <View>
                <Text style={styles.balanceLabel}>JUS 보유량 (로컬)</Text>
                <Text style={styles.balanceAmount}>{jusTokens.toLocaleString()}</Text>
                <Text style={styles.balanceSubtext}>≈ ${(jusTokens * 0.001).toFixed(2)} USD</Text>
                {userData && (
                  <Text style={styles.firebaseBalanceText}>Firebase: {userData.jewels?.toLocaleString() || '0'} 쥬얼</Text>
                )}
              </View>
              <Gem size={56} color={Colors.white} strokeWidth={1.5} />
            </View>
          </LinearGradient>

          <View style={styles.otherBalances}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemIcon}>⟠</Text>
              <View style={styles.balanceItemInfo}>
                <Text style={styles.balanceItemLabel}>ETH</Text>
                <Text style={styles.balanceItemValue}>{ethBalance.toFixed(6)}</Text>
              </View>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemIcon}>💵</Text>
              <View style={styles.balanceItemInfo}>
                <Text style={styles.balanceItemLabel}>USDT</Text>
                <Text style={styles.balanceItemValue}>{usdtBalance.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.exchangeSection}>
          <View style={styles.sectionHeader}>
            <ArrowRightLeft size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>토큰 교환</Text>
          </View>

          <View style={styles.exchangeCard}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>교환할 JUS</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={exchangeAmount}
                  onChangeText={setExchangeAmount}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textLight}
                />
                <TouchableOpacity
                  style={styles.maxButton}
                  onPress={() => setExchangeAmount(jusTokens.toString())}
                >
                  <Text style={styles.maxButtonText}>MAX</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.coinSelectorContainer}>
              <Text style={styles.inputLabel}>받을 코인</Text>
              <TouchableOpacity
                style={styles.coinSelector}
                onPress={() => setShowCoinSelector(!showCoinSelector)}
              >
                <Text style={styles.coinSelectorIcon}>{selectedCoinData?.icon}</Text>
                <Text style={styles.coinSelectorText}>{selectedCoin}</Text>
                <ChevronDown size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
              
              {showCoinSelector && (
                <View style={styles.coinDropdown}>
                  {marketCoins.map((coin) => (
                    <TouchableOpacity
                      key={coin.id}
                      style={styles.coinOption}
                      onPress={() => {
                        setSelectedCoin(coin.symbol);
                        setShowCoinSelector(false);
                      }}
                    >
                      <Text style={styles.coinOptionIcon}>{coin.icon}</Text>
                      <Text style={styles.coinOptionText}>{coin.symbol}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.exchangeInfo}>
              <View style={styles.exchangeRow}>
                <Text style={styles.exchangeLabel}>환율</Text>
                <Text style={styles.exchangeValue}>1 JUS = {exchangeRate} {selectedCoin}</Text>
              </View>
              <View style={styles.exchangeRow}>
                <Text style={styles.exchangeLabel}>수수료 (5%)</Text>
                <Text style={styles.exchangeValue}>
                  {(parseFloat(exchangeAmount || '0') * exchangeRate * fee).toFixed(6)} {selectedCoin}
                </Text>
              </View>
              <View style={[styles.exchangeRow, styles.exchangeTotal]}>
                <Text style={styles.exchangeTotalLabel}>받을 금액</Text>
                <Text style={styles.exchangeTotalValue}>
                  {(parseFloat(exchangeAmount || '0') * exchangeRate * (1 - fee)).toFixed(6)} {selectedCoin}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.exchangeButton} onPress={handleExchange}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.exchangeButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.exchangeButtonText}>교환하기</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>거래 내역</Text>
          {transactions.map((tx) => (
            <View key={tx.id} style={styles.transactionCard}>
              <View style={[
                styles.transactionIcon,
                tx.amount >= 0 ? styles.earnIcon : styles.exchangeIcon
              ]}>
                {getTransactionIcon(tx.type)}
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionName}>{tx.description}</Text>
                <Text style={styles.transactionDate}>{formatDate(tx.date)}</Text>
              </View>
              <View style={styles.transactionRight}>
                <Text style={[
                  styles.transactionAmount,
                  tx.amount >= 0 ? styles.earnAmount : styles.exchangeAmountText
                ]}>
                  {tx.amount >= 0 ? '+' : ''}{tx.amount.toLocaleString()} JUS
                </Text>
                {tx.status === 'pending' && (
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>대기중</Text>
                  </View>
                )}
              </View>
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
  balanceCard: {
    margin: 16,
    marginTop: -10,
    borderRadius: 20,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  balanceGradient: {
    padding: 24,
  },
  balanceRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '800' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.7,
  },
  firebaseBalanceText: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.6,
    marginTop: 4,
  },
  otherBalances: {
    backgroundColor: Colors.surface,
    padding: 20,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  balanceItem: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  balanceItemIcon: {
    fontSize: 28,
  },
  balanceItemInfo: {
    flex: 1,
  },
  balanceItemLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  balanceItemValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  balanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  exchangeSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  exchangeCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  maxButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
  },
  maxButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  coinSelectorContainer: {
    marginBottom: 20,
    position: 'relative' as const,
    zIndex: 10,
  },
  coinSelector: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  coinSelectorIcon: {
    fontSize: 24,
  },
  coinSelectorText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  coinDropdown: {
    position: 'absolute' as const,
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden' as const,
  },
  coinOption: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  coinOptionIcon: {
    fontSize: 24,
  },
  coinOptionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  exchangeInfo: {
    marginBottom: 20,
    gap: 12,
  },
  exchangeRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  exchangeLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  exchangeValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  exchangeTotal: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  exchangeTotalLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  exchangeTotalValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  exchangeButton: {
    borderRadius: 12,
    overflow: 'hidden' as const,
  },
  exchangeButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center' as const,
  },
  exchangeButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  transactionsSection: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  transactionCard: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  earnIcon: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  exchangeIcon: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  transactionRight: {
    alignItems: 'flex-end' as const,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  earnAmount: {
    color: Colors.success,
  },
  exchangeAmountText: {
    color: Colors.secondary,
  },
  pendingBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  pendingText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
