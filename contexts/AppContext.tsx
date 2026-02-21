import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';

import { transactions as mockTransactions, Transaction } from '@/mocks/transactions';
import { missions as mockMissions, Mission, leaderboard as mockLeaderboard, LeaderboardUser } from '@/mocks/missions';

export interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  icon: string;
}

interface AppState {
  jusTokens: number;
  ethBalance: number;
  usdtBalance: number;
  transactions: Transaction[];
  missions: Mission[];
  leaderboard: LeaderboardUser[];
  marketCoins: MarketCoin[];
  addTokens: (amount: number) => void;
  exchangeTokens: (amount: number, coinType: string, coinAmount: number) => void;
  completeMission: (missionId: string) => void;
  isLoading: boolean;
}

export const [AppProvider, useApp] = createContextHook<AppState>(() => {
  const [jusTokens, setJusTokens] = useState<number>(12500);
  const [ethBalance, setEthBalance] = useState<number>(0.05);
  const [usdtBalance, setUsdtBalance] = useState<number>(25.50);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [missions, setMissions] = useState<Mission[]>(mockMissions);
  const [leaderboard] = useState<LeaderboardUser[]>(mockLeaderboard);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const marketCoins: MarketCoin[] = [
    { id: 'eth', symbol: 'ETH', name: 'Ethereum', price: 0.0001, change24h: 2.34, icon: '⟠' },
    { id: 'usdt', symbol: 'USDT', name: 'Tether', price: 0.001, change24h: 0.01, icon: '💵' },
    { id: 'bnb', symbol: 'BNB', name: 'BNB', price: 0.00015, change24h: -1.25, icon: '🔶' },
    { id: 'sol', symbol: 'SOL', name: 'Solana', price: 0.0008, change24h: 5.67, icon: '◎' },
  ];

  useEffect(() => {
    console.log('[AppContext] Initializing...');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('[AppContext] Loading data from AsyncStorage...');
      const storedTokens = await AsyncStorage.getItem('jusTokens');
      const storedEth = await AsyncStorage.getItem('ethBalance');
      const storedUsdt = await AsyncStorage.getItem('usdtBalance');
      const storedTransactions = await AsyncStorage.getItem('transactions');
      const storedMissions = await AsyncStorage.getItem('missions');

      console.log('[AppContext] Loaded:', { storedTokens, storedEth, storedUsdt });

      if (storedTokens) setJusTokens(parseFloat(storedTokens));
      if (storedEth) setEthBalance(parseFloat(storedEth));
      if (storedUsdt) setUsdtBalance(parseFloat(storedUsdt));
      if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
      if (storedMissions) setMissions(JSON.parse(storedMissions));
      
      console.log('[AppContext] Data loaded successfully');
    } catch (error) {
      console.error('[AppContext] Error loading data:', error);
    } finally {
      console.log('[AppContext] Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const saveData = async (tokens: number, eth: number, usdt: number, txs: Transaction[], msns: Mission[]) => {
    try {
      await AsyncStorage.setItem('jusTokens', tokens.toString());
      await AsyncStorage.setItem('ethBalance', eth.toString());
      await AsyncStorage.setItem('usdtBalance', usdt.toString());
      await AsyncStorage.setItem('transactions', JSON.stringify(txs));
      await AsyncStorage.setItem('missions', JSON.stringify(msns));
    } catch (error) {
      console.log('Error saving data:', error);
    }
  };

  const addTokens = (amount: number) => {
    const newTokens = jusTokens + amount;
    const transaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      description: '게임 보상 입금',
      amount: amount,
      type: 'deposit',
      status: 'completed',
    };
    const newTransactions = [transaction, ...transactions];
    setJusTokens(newTokens);
    setTransactions(newTransactions);
    saveData(newTokens, ethBalance, usdtBalance, newTransactions, missions);
    console.log(`Added ${amount} tokens. New balance: ${newTokens}`);
  };

  const exchangeTokens = (amount: number, coinType: string, coinAmount: number) => {
    const newTokens = jusTokens - amount;
    let newEth = ethBalance;
    let newUsdt = usdtBalance;

    if (coinType === 'ETH') {
      newEth = ethBalance + coinAmount;
      setEthBalance(newEth);
    } else if (coinType === 'USDT') {
      newUsdt = usdtBalance + coinAmount;
      setUsdtBalance(newUsdt);
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      description: `${coinType}로 교환`,
      amount: -amount,
      type: 'exchange',
      status: 'completed',
      coinType: coinType,
    };
    const newTransactions = [transaction, ...transactions];
    setJusTokens(newTokens);
    setTransactions(newTransactions);
    saveData(newTokens, newEth, newUsdt, newTransactions, missions);
    console.log(`Exchanged ${amount} JUS for ${coinAmount} ${coinType}`);
  };

  const completeMission = (missionId: string) => {
    const updatedMissions = missions.map(m =>
      m.id === missionId ? { ...m, completed: true, progress: m.target } : m
    );
    const mission = missions.find(m => m.id === missionId);
    if (mission) {
      const newTokens = jusTokens + mission.reward;
      setJusTokens(newTokens);
      setMissions(updatedMissions);
      saveData(newTokens, ethBalance, usdtBalance, transactions, updatedMissions);
      console.log(`Completed mission: ${mission.title}. Reward: ${mission.reward} tokens`);
    }
  };

  return {
    jusTokens,
    ethBalance,
    usdtBalance,
    transactions,
    missions,
    leaderboard,
    marketCoins,
    addTokens,
    exchangeTokens,
    completeMission,
    isLoading,
  };
});
