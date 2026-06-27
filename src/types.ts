export type SubjectType = '语文' | '数学' | '英语' | '战术训导';

export type PriorityType = 'I' | 'II' | 'III';

export type DifficultyType = '简单' | '中等' | '困难';

export interface SubTask {
  id: string;
  title: string;
  duration: number; // in minutes
  isCompleted: boolean;
  completedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  subject: SubjectType;
  priority: PriorityType;
  difficulty: DifficultyType;
  estimatedTime: number; // in minutes
  actualTime: number; // in minutes
  coinsReward: number; // 金币 (心愿币)
  tacticalCoinsReward: number; // 战术币 (原怪兽币)
  subTasks: SubTask[];
  isCompleted: boolean;
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface RewardItem {
  id: string;
  name: string;
  cost: number;
  icon: string;
  category: 'wish' | 'tactical';
  description: string;
  rewardType?: 'screen' | 'game' | 'snack' | 'allowance' | 'item';
  duration?: number; // minutes for screens/games
}

export interface SkinItem {
  id: string;
  name: string;
  cost: number;
  avatar: string; // SVG or string name
  description: string;
  unlocked: boolean;
  accentColor: string;
  badge: string;
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string; // Icon identifier
  category: 'growth' | 'habit' | 'efficiency' | 'knowledge' | 'fun';
  currentValue: number;
  targetValue: number;
  isUnlocked: boolean;
  rewardClaimed: boolean;
}

export interface SavingAccount {
  balance: number;
  lastInterestPaid: string; // YYYY-MM-DD
}

export interface Transaction {
  id: string;
  timestamp: string;
  type: 'earn' | 'spend' | 'exchange' | 'save' | 'withdraw';
  description: string;
  goldChange: number;
  tacticalChange: number;
}

export interface OperatorProfile {
  name: string;
  level: number;
  exp: number;
  maxExp: number;
  goldCoins: number; // 心愿币
  tacticalCoins: number; // 战术币
  equippedSkinId: string;
  mood: '满状态' | '轻度疲劳' | '急需补给' | '战意高昂';
}
