export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'deposit' | 'withdraw' | 'exchange' | 'bonus';
  status: 'completed' | 'pending';
  coinType?: string;
}

export const transactions: Transaction[] = [
  {
    id: '1',
    date: '2025-01-13T10:30:00',
    description: '게임 보상 입금',
    amount: 500,
    type: 'deposit',
    status: 'completed',
  },
  {
    id: '2',
    date: '2025-01-12T15:45:00',
    description: 'ETH로 교환',
    amount: -1000,
    type: 'exchange',
    status: 'completed',
    coinType: 'ETH',
  },
  {
    id: '3',
    date: '2025-01-12T09:20:00',
    description: '일일 보너스',
    amount: 50,
    type: 'bonus',
    status: 'completed',
  },
  {
    id: '4',
    date: '2025-01-11T18:00:00',
    description: 'USDT로 교환',
    amount: -500,
    type: 'exchange',
    status: 'completed',
    coinType: 'USDT',
  },
  {
    id: '5',
    date: '2025-01-11T14:30:00',
    description: '게임 보상 입금',
    amount: 800,
    type: 'deposit',
    status: 'completed',
  },
  {
    id: '6',
    date: '2025-01-10T11:00:00',
    description: '출금 요청',
    amount: -200,
    type: 'withdraw',
    status: 'pending',
  },
];
