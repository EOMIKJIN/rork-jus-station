export interface Mission {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  type: 'daily' | 'weekly';
  completed: boolean;
}

export const missions: Mission[] = [
  {
    id: '1',
    title: '첫 거래 완료',
    description: '오늘 첫 번째 토큰 교환하기',
    progress: 0,
    target: 1,
    reward: 50,
    type: 'daily',
    completed: false,
  },
  {
    id: '2',
    title: '1,000 JUS 교환',
    description: '오늘 총 1,000 JUS 이상 교환하기',
    progress: 500,
    target: 1000,
    reward: 100,
    type: 'daily',
    completed: false,
  },
  {
    id: '3',
    title: '5일 연속 로그인',
    description: '5일 연속으로 앱에 로그인하기',
    progress: 3,
    target: 5,
    reward: 200,
    type: 'weekly',
    completed: false,
  },
  {
    id: '4',
    title: '다양한 코인 교환',
    description: '이번 주 3종류 이상의 코인으로 교환',
    progress: 2,
    target: 3,
    reward: 300,
    type: 'weekly',
    completed: false,
  },
];

export interface LeaderboardUser {
  id: string;
  name: string;
  tokens: number;
  rank: number;
  avatar: string;
}

export const leaderboard: LeaderboardUser[] = [
  {
    id: '1',
    name: '다이아킹',
    tokens: 52800,
    rank: 1,
    avatar: '💎',
  },
  {
    id: '2',
    name: '루비마스터',
    tokens: 48500,
    rank: 2,
    avatar: '🔴',
  },
  {
    id: '3',
    name: '사파이어',
    tokens: 43200,
    rank: 3,
    avatar: '🔵',
  },
  {
    id: '4',
    name: 'You',
    tokens: 12500,
    rank: 47,
    avatar: '💜',
  },
  {
    id: '5',
    name: '에메랄드',
    tokens: 39800,
    rank: 4,
    avatar: '💚',
  },
];
