import { JewelSpinUserData } from '@/contexts/FirebaseContext';

export const dummyUsers: JewelSpinUserData[] = [
  {
    userId: 'dummy-user-1',
    nickname: '스파클 마스터',
    jewels: 15000,
    level: 12,
    experience: 3500,
    email: 'sparkle.master@jewelbox.com',
    lastLogin: new Date().toISOString(),
  },
  {
    userId: 'dummy-user-2',
    nickname: '다이아몬드 헌터',
    jewels: 8500,
    level: 8,
    experience: 2100,
    email: 'diamond.hunter@jewelbox.com',
    lastLogin: new Date().toISOString(),
  },
  {
    userId: 'dummy-user-3',
    nickname: '루비 콜렉터',
    jewels: 22000,
    level: 15,
    experience: 5800,
    email: 'ruby.collector@jewelbox.com',
    lastLogin: new Date().toISOString(),
  },
  {
    userId: 'dummy-user-4',
    nickname: '사파이어 킹',
    jewels: 5000,
    level: 5,
    experience: 1200,
    email: 'sapphire.king@jewelbox.com',
    lastLogin: new Date().toISOString(),
  },
  {
    userId: 'dummy-user-5',
    nickname: '에메랄드 퀸',
    jewels: 18500,
    level: 11,
    experience: 4200,
    email: 'emerald.queen@jewelbox.com',
    lastLogin: new Date().toISOString(),
  },
];

export const getRandomDummyUser = (): JewelSpinUserData => {
  const randomIndex = Math.floor(Math.random() * dummyUsers.length);
  return { ...dummyUsers[randomIndex] };
};
