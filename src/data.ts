import { Task, RewardItem, SkinItem, Achievement, OperatorProfile } from './types';

// Utility helper to format date strings
export const getFormattedDate = (offsetDays: number = 0): string => {
  const baseDate = new Date('2026-07-01T00:00:00-07:00'); // Wednesday, July 1, 2026
  const date = new Date(baseDate);
  date.setDate(baseDate.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
};

export const INITIAL_OPERATOR: OperatorProfile = {
  name: "冷锋特工",
  level: 1,
  exp: 0,
  maxExp: 100,
  goldCoins: 0, // 心愿币
  tacticalCoins: 0, // 战术币
  equippedSkinId: 'skin-classic',
  mood: '满状态'
};

export const INITIAL_SKINS: SkinItem[] = [
  {
    id: 'skin-classic',
    name: '特种尖兵',
    cost: 0,
    avatar: 'classic',
    description: '标准战术特种部队涂装，配备战术目镜与全套通讯装备。',
    unlocked: true,
    accentColor: 'from-emerald-500 to-teal-600',
    badge: '标准装配'
  },
  {
    id: 'skin-desert',
    name: '沙漠猎鹰',
    cost: 150,
    avatar: 'desert',
    description: '沙漠迷彩特制装甲，适合荒漠潜行，配备红外侦测面罩。',
    unlocked: false,
    accentColor: 'from-amber-500 to-orange-600',
    badge: '中阶装备'
  },
  {
    id: 'skin-arctic',
    name: '极地白狼',
    cost: 200,
    avatar: 'arctic',
    description: '寒带极地作战防寒重装，表面覆盖超低反射白色涂层，抗冻性能极佳。',
    unlocked: false,
    accentColor: 'from-blue-400 to-indigo-600',
    badge: '精英极寒'
  },
  {
    id: 'skin-cyber',
    name: '幽灵黑客',
    cost: 350,
    avatar: 'cyber',
    description: '未来电子战机动装甲，拥有光学迷彩电容和微型量子运算辅助器。',
    unlocked: false,
    accentColor: 'from-purple-500 to-pink-600',
    badge: '终极科技'
  }
];

export const INITIAL_REWARDS: RewardItem[] = [
  // Wish store rewards (Require Gold Coins / 心愿币)
  {
    id: 'wish-tablet',
    name: '玩平板 15分钟',
    cost: 30,
    icon: 'Tablet',
    category: 'wish',
    description: '使用平板看视频或浏览内容，每次消耗30心愿币。',
    rewardType: 'screen',
    duration: 15
  },
  {
    id: 'wish-game',
    name: '玩主机游戏 30分钟',
    cost: 50,
    icon: 'Gamepad2',
    category: 'wish',
    description: '周末可兑换Switch或PlayStation联机游戏时间，全神贯注畅玩！',
    rewardType: 'game',
    duration: 30
  },
  {
    id: 'wish-tv',
    name: '看电视 30分钟',
    cost: 30,
    icon: 'Tv',
    category: 'wish',
    description: '大屏观影体验，用于看动漫或少儿纪录片。',
    rewardType: 'screen',
    duration: 30
  },
  {
    id: 'wish-money',
    name: '零花钱 10元',
    cost: 100,
    icon: 'Coins',
    category: 'wish',
    description: '可以直接存入零钱包的现实硬币，用于购买小玩具或文具！',
    rewardType: 'allowance'
  },
  {
    id: 'wish-toy',
    name: '兑换现实乐高/拼图',
    cost: 800,
    icon: 'PackageOpen',
    category: 'wish',
    description: '终极心愿，通过持续自律积攒，兑换一款中型模型或拼装玩具！',
    rewardType: 'item'
  },
  {
    id: 'wish-snack-real',
    name: '周五大餐/零食自选',
    cost: 150,
    icon: 'Cookie',
    category: 'wish',
    description: '兑换一次麦当劳、必胜客或周末超市自选一袋最爱的零食包！',
    rewardType: 'snack'
  },

  // Tactical Store Rewards (Require Tactical Coins / 战术币)
  {
    id: 'tac-energy',
    name: '战术能量棒 (压缩饼干)',
    cost: 15,
    icon: 'Zap',
    category: 'tactical',
    description: '食用后特工状态立刻恢复至“满状态”，并提供 +20 EXP 经验奖励。',
    rewardType: 'snack'
  },
  {
    id: 'tac-drink',
    name: '电磁激能饮料',
    cost: 25,
    icon: 'Flame',
    category: 'tactical',
    description: '激发脑力专注！半小时内完成任何任务可获得 1.5 倍经验奖励！',
    rewardType: 'snack'
  },
  {
    id: 'tac-drone',
    name: '迷你侦察无人机',
    cost: 100,
    icon: 'Radio',
    category: 'tactical',
    description: '特工专属战术挂件。解锁雷达探测动画，能在专注时自动清理20%干扰噪声。',
    rewardType: 'item'
  },
  {
    id: 'tac-goggles',
    name: '红外夜视仪',
    cost: 150,
    icon: 'Eye',
    category: 'tactical',
    description: '特工必备极客装配，佩戴可解锁“夜视仪黑绿滤镜”，并在主界面展示。',
    rewardType: 'item'
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  // Growth
  { id: 'ach-1', title: '勇闯恐龙谷', desc: '累计完成 5 个挑战任务，开始探索危险区域！', icon: 'Milestone', category: 'growth', currentValue: 0, targetValue: 5, isUnlocked: false, rewardClaimed: false },
  { id: 'ach-2', title: '特警队长', desc: '特工等级达到 Lv.5 级，成为军营中坚力量！', icon: 'Shield', category: 'growth', currentValue: 0, targetValue: 5, isUnlocked: false, rewardClaimed: false },
  { id: 'ach-3', title: '精英上将', desc: '特工等级达到 Lv.10 级，解锁所有战术权限。', icon: 'Award', category: 'growth', currentValue: 0, targetValue: 10, isUnlocked: false, rewardClaimed: false },
  
  // Habit
  { id: 'ach-4', title: '晨光小勇士', desc: '连续 3 天在上午 9:00 前开始专注挑战。', icon: 'Sun', category: 'habit', currentValue: 0, targetValue: 3, isUnlocked: false, rewardClaimed: false },
  { id: 'ach-5', title: '连胜狂人', desc: '连续 5 天保持至少完成 1 项主线任务。', icon: 'Flame', category: 'habit', currentValue: 0, targetValue: 5, isUnlocked: false, rewardClaimed: false },
  { id: 'ach-6', title: '周末大丰收', desc: '在周六、周日两天内，累计完成 6 项任务。', icon: 'Sparkles', category: 'habit', currentValue: 0, targetValue: 6, isUnlocked: false, rewardClaimed: false },

  // Efficiency
  { id: 'ach-7', title: '雷达精准预估', desc: '预估耗时与实际耗时偏差在 10% 以内达到 3 次。', icon: 'Compass', category: 'efficiency', currentValue: 0, targetValue: 3, isUnlocked: false, rewardClaimed: false },
  { id: 'ach-8', title: '闪电速决手', desc: '提前 5 分钟以上高质量完成一项困难任务。', icon: 'Zap', category: 'efficiency', currentValue: 0, targetValue: 1, isUnlocked: false, rewardClaimed: false },
  { id: 'ach-9', title: '全能小学霸', desc: '单次无中断专注超过 40 分钟，耐力惊人！', icon: 'GraduationCap', category: 'efficiency', currentValue: 0, targetValue: 40, isUnlocked: false, rewardClaimed: false },

  // Knowledge
  { id: 'ach-10', title: '博古通今(语文)', desc: '累计完成 10 个语文类别挑战任务。', icon: 'BookOpen', category: 'knowledge', currentValue: 0, targetValue: 10, isUnlocked: false, rewardClaimed: false },
  { id: 'ach-11', title: '破译密码(数学)', desc: '累计完成 10 个数学数论与思维练习任务。', icon: 'Calculator', category: 'knowledge', currentValue: 0, targetValue: 10, isUnlocked: false, rewardClaimed: false },
  { id: 'ach-12', title: '环球外交(英语)', desc: '累计完成 10 个英语口语及阅读任务。', icon: 'Globe', category: 'knowledge', currentValue: 0, targetValue: 10, isUnlocked: false, rewardClaimed: false },

  // Fun
  { id: 'ach-13', title: '超级大富翁', desc: '金币（心愿币）余额累计突破 500 枚。', icon: 'DollarSign', category: 'fun', currentValue: 0, targetValue: 500, isUnlocked: false, rewardClaimed: false },
  { id: 'ach-14', title: '战术装备收藏家', desc: '解锁至少 3 款特工专属战术皮肤。', icon: 'Armchair', category: 'fun', currentValue: 1, targetValue: 3, isUnlocked: false, rewardClaimed: false },
  { id: 'ach-15', title: '精打细算', desc: '在银行中完成 3 次金币与战术币的双向兑换。', icon: 'TrendingUp', category: 'fun', currentValue: 0, targetValue: 3, isUnlocked: false, rewardClaimed: false }
];

export const INITIAL_TASKS: Task[] = [
  // Monday (June 22) - Reset
  {
    id: 'task-mon-1',
    title: '预习第14课《古诗三首》',
    subject: '语文',
    priority: 'II',
    difficulty: '中等',
    estimatedTime: 30,
    actualTime: 0,
    coinsReward: 20,
    tacticalCoinsReward: 8,
    isCompleted: false,
    date: getFormattedDate(-5),
    subTasks: [
      { id: 'sub-mon-1-1', title: '朗读诗歌2遍', duration: 8, isCompleted: false },
      { id: 'sub-mon-1-2', title: '圈出难读字、查字典标拼音', duration: 10, isCompleted: false },
      { id: 'sub-mon-1-3', title: '结合注释口头说出诗意', duration: 12, isCompleted: false }
    ]
  },
  {
    id: 'task-mon-2',
    title: '口算练习与思维训练10题',
    subject: '数学',
    priority: 'I',
    difficulty: '简单',
    estimatedTime: 15,
    actualTime: 0,
    coinsReward: 15,
    tacticalCoinsReward: 5,
    isCompleted: false,
    date: getFormattedDate(-5),
    subTasks: [
      { id: 'sub-mon-2-1', title: '完成两页口算大通关', duration: 8, isCompleted: false },
      { id: 'sub-mon-2-2', title: '核对答案并更正错题', duration: 7, isCompleted: false }
    ]
  },

  // Tuesday (June 23) - Reset
  {
    id: 'task-tue-1',
    title: '数学奥数几何专题突破',
    subject: '数学',
    priority: 'I',
    difficulty: '困难',
    estimatedTime: 45,
    actualTime: 0,
    coinsReward: 35,
    tacticalCoinsReward: 15,
    isCompleted: false,
    date: getFormattedDate(-4),
    subTasks: [
      { id: 'sub-tue-1-1', title: '观看名师视频微课', duration: 15, isCompleted: false },
      { id: 'sub-tue-1-2', title: '自主探究2道例题', duration: 15, isCompleted: false },
      { id: 'sub-tue-1-3', title: '完成3道课后培优挑战', duration: 15, isCompleted: false }
    ]
  },
  {
    id: 'task-tue-2',
    title: '背诵英语课文及常用短语',
    subject: '英语',
    priority: 'II',
    difficulty: '简单',
    estimatedTime: 20,
    actualTime: 0,
    coinsReward: 15,
    tacticalCoinsReward: 5,
    isCompleted: false,
    date: getFormattedDate(-4),
    subTasks: [
      { id: 'sub-tue-2-1', title: '熟读背诵Unit 3课文', duration: 10, isCompleted: false },
      { id: 'sub-tue-2-2', title: '默写12个重点单词短语', duration: 10, isCompleted: false }
    ]
  },

  // Wednesday (June 24) - Reset
  {
    id: 'task-wed-1',
    title: '语文阅读理解专项精练',
    subject: '语文',
    priority: 'I',
    difficulty: '中等',
    estimatedTime: 30,
    actualTime: 0,
    coinsReward: 25,
    tacticalCoinsReward: 10,
    isCompleted: false,
    date: getFormattedDate(-3),
    subTasks: [
      { id: 'sub-wed-1-1', title: '默读散文，概括段落大意', duration: 10, isCompleted: false },
      { id: 'sub-wed-1-2', title: '分析重点句子的表达效果', duration: 10, isCompleted: false },
      { id: 'sub-wed-1-3', title: '完成3道选择题与简答题', duration: 10, isCompleted: false }
    ]
  },

  // Thursday (June 25) - Reset
  {
    id: 'task-thu-1',
    title: '英语听力理解与自评',
    subject: '英语',
    priority: 'II',
    difficulty: '中等',
    estimatedTime: 25,
    actualTime: 0,
    coinsReward: 20,
    tacticalCoinsReward: 8,
    isCompleted: false,
    date: getFormattedDate(-2),
    subTasks: [
      { id: 'sub-thu-1-1', title: '精听一期口语广播', duration: 12, isCompleted: false },
      { id: 'sub-thu-1-2', title: '完成同步理解题并打分', duration: 13, isCompleted: false }
    ]
  },

  // Friday (June 26) - Reset
  {
    id: 'task-fri-1',
    title: '数学周复习与错题大扫除',
    subject: '数学',
    priority: 'I',
    difficulty: '困难',
    estimatedTime: 40,
    actualTime: 0,
    coinsReward: 30,
    tacticalCoinsReward: 12,
    isCompleted: false,
    date: getFormattedDate(-1),
    subTasks: [
      { id: 'sub-fri-1-1', title: '重做本周奥数和课内错题', duration: 20, isCompleted: false },
      { id: 'sub-fri-1-2', title: '归纳思维盲点、写出分析', duration: 20, isCompleted: false }
    ]
  },

  // Saturday (June 27) - Today! User can complete these
  {
    id: 'task-sat-1',
    title: '语文《复习当天功课》及写作',
    subject: '语文',
    priority: 'I',
    difficulty: '简单',
    estimatedTime: 10,
    actualTime: 0,
    coinsReward: 10,
    tacticalCoinsReward: 4,
    isCompleted: false,
    date: getFormattedDate(0),
    subTasks: [
      { id: 'sub-sat-1-1', title: '复习今天学过的段落笔记，听写生字词', duration: 10, isCompleted: false }
    ]
  },
  {
    id: 'task-sat-2',
    title: '朗读英语笔记与核心对话',
    subject: '英语',
    priority: 'II',
    difficulty: '简单',
    estimatedTime: 10,
    actualTime: 0,
    coinsReward: 10,
    tacticalCoinsReward: 4,
    isCompleted: false,
    date: getFormattedDate(0),
    subTasks: [
      { id: 'sub-sat-2-1', title: '朗读朗诵课本笔记、核心句型', duration: 10, isCompleted: false }
    ]
  },
  {
    id: 'task-sat-3',
    title: '战术训导：障碍跑与体能考核',
    subject: '战术训导',
    priority: 'III',
    difficulty: '困难',
    estimatedTime: 25,
    actualTime: 0,
    coinsReward: 30,
    tacticalCoinsReward: 15,
    isCompleted: false,
    date: getFormattedDate(0),
    subTasks: [
      { id: 'sub-sat-3-1', title: '核心体能俯卧撑 3 组', duration: 10, isCompleted: false },
      { id: 'sub-sat-3-2', title: '小区变速折返跑 10 分钟', duration: 15, isCompleted: false }
    ]
  },

  // Sunday (June 28) - Tomorrow!
  {
    id: 'task-sun-1',
    title: '英语口语模仿秀与电影赏析',
    subject: '英语',
    priority: 'III',
    difficulty: '简单',
    estimatedTime: 20,
    actualTime: 0,
    coinsReward: 15,
    tacticalCoinsReward: 5,
    isCompleted: false,
    date: getFormattedDate(1),
    subTasks: [
      { id: 'sub-sun-1-1', title: '模仿英语动画配音3个片段', duration: 10, isCompleted: false },
      { id: 'sub-sun-1-2', title: '阅读绘本并录音上传', duration: 10, isCompleted: false }
    ]
  },
  {
    id: 'task-sun-2',
    title: '思维脑图：本周知识网拉网',
    subject: '数学',
    priority: 'I',
    difficulty: '中等',
    estimatedTime: 30,
    actualTime: 0,
    coinsReward: 25,
    tacticalCoinsReward: 10,
    isCompleted: false,
    date: getFormattedDate(1),
    subTasks: [
      { id: 'sub-sun-2-1', title: '梳理本周所有数学知识点', duration: 15, isCompleted: false },
      { id: 'sub-sun-2-2', title: '在白板上完成逻辑框图', duration: 15, isCompleted: false }
    ]
  }
];

// Focus music choices
export interface FocusSound {
  id: string;
  name: string;
  description: string;
  emoji: string;
  frequency: string;
}

export const FOCUS_SOUNDS: FocusSound[] = [
  { id: 'static', name: '战术电台静电', description: '低频电台白噪音，过滤环境杂音', emoji: '📻', frequency: '432Hz' },
  { id: 'rain', name: '热带雨林雷雨', description: '逼真丛林降雨，舒缓紧张脑波', emoji: '🌧️', frequency: '528Hz' },
  { id: 'fire', name: '野战营地篝火', description: '劈啪作响的篝火声，增强温暖踏实感', emoji: '🔥', frequency: '396Hz' },
  { id: 'clock', name: '精密机械秒表', description: '有规律的滴答节奏，提示时间的推移', emoji: '⏱️', frequency: '639Hz' },
  { id: 'lofi', name: '特工休整Lo-Fi', description: '轻松且有节奏感的低传真电子节奏', emoji: '🎵', frequency: '741Hz' }
];

export const TASK_TEMPLATES = [
  {
    title: '课前新课预习',
    subject: '语文' as const,
    duration: 30,
    priority: 'II' as const,
    difficulty: '中等' as const,
    subTasks: [
      { title: '朗读新课文 2-3 遍', duration: 8 },
      { title: '圈划段落、标记难懂字词并查字典', duration: 10 },
      { title: '书写生字词，并标出部首和音调', duration: 7 },
      { title: '默读思考课后习题', duration: 5 }
    ]
  },
  {
    title: '课后作业与巩固',
    subject: '语文' as const,
    duration: 20,
    priority: 'I' as const,
    difficulty: '简单' as const,
    subTasks: [
      { title: '完成课后配套练习册对应章节', duration: 12 },
      { title: '对答案，用红笔在错题上打圈', duration: 4 },
      { title: '朗读课文并重温课堂笔记', duration: 4 }
    ]
  },
  {
    title: '奥数与思维突破',
    subject: '数学' as const,
    duration: 40,
    priority: 'I' as const,
    difficulty: '困难' as const,
    subTasks: [
      { title: '自主读题并拆解题意', duration: 10 },
      { title: '尝试画图或列方程探究解答', duration: 15 },
      { title: '观看解题教学微课或核对参考答案', duration: 8 },
      { title: '在本子上抄录错题，总结核心原理', duration: 7 }
    ]
  },
  {
    title: '口语与听力特训',
    subject: '英语' as const,
    duration: 20,
    priority: 'II' as const,
    difficulty: '简单' as const,
    subTasks: [
      { title: '聆听原版录音 2 遍并进行逐句跟读', duration: 10 },
      { title: '在口语软件中完成模仿评测', duration: 6 },
      { title: '复习单元核心词汇并做大声拼读', duration: 4 }
    ]
  }
];
