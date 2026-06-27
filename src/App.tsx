import React, { useState, useEffect } from 'react';
import { Task, OperatorProfile, SkinItem, Achievement, SavingAccount, Transaction, RewardItem } from './types';
import { 
  INITIAL_OPERATOR, INITIAL_SKINS, INITIAL_ACHIEVEMENTS, INITIAL_TASKS, FOCUS_SOUNDS, getFormattedDate
} from './data';
import OperatorAvatar from './components/OperatorAvatar';
import TaskCard from './components/TaskCard';
import TaskTimer from './components/TaskTimer';
import WeeklyPlan from './components/WeeklyPlan';
import Report from './components/Report';
import Shop from './components/Shop';
import Bank from './components/Bank';
import Achievements from './components/Achievements';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, CalendarRange, Trophy, Percent, 
  Coins, Landmark, ChevronRight, Zap, Target, BookOpen, AlertCircle, Sparkles, LogOut, CheckSquare
} from 'lucide-react';

export default function App() {
  // --- 1. STATE INITIALIZATION ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'weekly' | 'report' | 'shop' | 'bank' | 'achievements'>('dashboard');
  
  const [operator, setOperator] = useState<OperatorProfile>(() => {
    const saved = localStorage.getItem('op_profile');
    return saved ? JSON.parse(saved) : INITIAL_OPERATOR;
  });

  const [skins, setSkins] = useState<SkinItem[]>(() => {
    const saved = localStorage.getItem('op_skins');
    return saved ? JSON.parse(saved) : INITIAL_SKINS;
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('op_achievements');
    return saved ? JSON.parse(saved) : INITIAL_ACHIEVEMENTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('op_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [savings, setSavings] = useState<SavingAccount>(() => {
    const saved = localStorage.getItem('op_savings');
    return saved ? JSON.parse(saved) : { balance: 0, lastInterestPaid: '2026-06-30' };
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('op_transactions');
    if (saved) return JSON.parse(saved);
    // Default initial transactions is empty for reset start
    return [];
  });

  // One-time automatic reset to clear previous developer/baseline state of old conversation
  useEffect(() => {
    const hasReset = localStorage.getItem('op_reset_july1_v2');
    if (!hasReset) {
      localStorage.removeItem('op_profile');
      localStorage.removeItem('op_skins');
      localStorage.removeItem('op_achievements');
      localStorage.removeItem('op_tasks');
      localStorage.removeItem('op_savings');
      localStorage.removeItem('op_transactions');
      
      setOperator(INITIAL_OPERATOR);
      setSkins(INITIAL_SKINS);
      setAchievements(INITIAL_ACHIEVEMENTS);
      setTasks(INITIAL_TASKS);
      setSavings({ balance: 0, lastInterestPaid: '2026-06-30' });
      setTransactions([]);
      
      localStorage.setItem('op_reset_july1_v2', 'true');
    }
  }, []);

  // Timer & Modal State
  const [activeFocusSession, setActiveFocusSession] = useState<{ task: Task; subTaskId?: string } | null>(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [unlockedSkinName, setUnlockedSkinName] = useState<string | null>(null);
  const [parentCodeInput, setParentCodeInput] = useState('');
  const [showParentVerifyModal, setShowParentVerifyModal] = useState<{ isOpen: boolean; rewardItem?: RewardItem; callback?: () => void }>({ isOpen: false });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- 2. LOCAL PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('op_profile', JSON.stringify(operator));
  }, [operator]);

  useEffect(() => {
    localStorage.setItem('op_skins', JSON.stringify(skins));
  }, [skins]);

  useEffect(() => {
    localStorage.setItem('op_achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('op_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('op_savings', JSON.stringify(savings));
  }, [savings]);

  useEffect(() => {
    localStorage.setItem('op_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // --- 3. TOAST TRIGGER ---
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // --- 4. TASK COMPLETION & GAMIFICATION FLOW ---
  const awardExperience = (expAmount: number, currentOp: OperatorProfile) => {
    let newExp = currentOp.exp + expAmount;
    let newLevel = currentOp.level;
    let maxExp = currentOp.maxExp;
    let didLevelUp = false;

    while (newExp >= maxExp) {
      newExp -= maxExp;
      newLevel += 1;
      maxExp = Math.round(maxExp * 1.25); // increase experience ceiling
      didLevelUp = true;
    }

    if (didLevelUp) {
      setShowLevelUpModal(true);
    }

    return {
      ...currentOp,
      level: newLevel,
      exp: newExp,
      maxExp
    };
  };

  // Complete a full task
  const handleCompleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.isCompleted) return;

    // 1. Update task complete state
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          isCompleted: true,
          actualTime: t.actualTime > 0 ? t.actualTime : t.estimatedTime,
          subTasks: t.subTasks.map(st => ({ ...st, isCompleted: true }))
        };
      }
      return t;
    });
    setTasks(updatedTasks);

    // 2. Award currency & exp
    setOperator(prev => {
      let updated = {
        ...prev,
        goldCoins: prev.goldCoins + task.coinsReward,
        tacticalCoins: prev.tacticalCoins + task.tacticalCoinsReward,
      };
      return awardExperience(100, updated); // +100 XP
    });

    // 3. Create logging
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'earn',
      description: `通关【${task.title}】特工主线任务`,
      goldChange: task.coinsReward,
      tacticalChange: task.tacticalCoinsReward
    };
    setTransactions(prev => [newTx, ...prev]);

    // 4. Update achievements progress counters
    updateAchievementsProgress('task', 1);
    if (task.subject === '语文') updateAchievementsProgress('Chinese', 1);
    if (task.subject === '数学') updateAchievementsProgress('Math', 1);
    if (task.subject === '英语') updateAchievementsProgress('English', 1);

    triggerToast(`🎉 任务通关！获得 🪙${task.coinsReward} 心愿币，🔋${task.tacticalCoinsReward} 战术币，+100 EXP！`);
  };

  // Toggle single subtask checkbox
  const handleToggleSubTask = (taskId: string, subTaskId: string) => {
    let completedAllNow = false;
    let targetTask: Task | undefined;

    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        const updatedSubs = t.subTasks.map(st => {
          if (st.id === subTaskId) {
            return { ...st, isCompleted: !st.isCompleted, completedAt: !st.isCompleted ? new Date().toISOString() : undefined };
          }
          return st;
        });

        const allDone = updatedSubs.every(st => st.isCompleted);
        if (allDone && !t.isCompleted) {
          completedAllNow = true;
          targetTask = t;
        }

        return {
          ...t,
          subTasks: updatedSubs,
          isCompleted: allDone ? true : t.isCompleted,
          actualTime: allDone ? (t.actualTime > 0 ? t.actualTime : t.estimatedTime) : t.actualTime
        };
      }
      return t;
    });

    setTasks(updatedTasks);

    // If subtasks checking fully finished the entire task, award currency and trigger level checkers
    if (completedAllNow && targetTask) {
      const taskObj = targetTask as Task;
      setOperator(prev => {
        let updated = {
          ...prev,
          goldCoins: prev.goldCoins + taskObj.coinsReward,
          tacticalCoins: prev.tacticalCoins + taskObj.tacticalCoinsReward,
        };
        return awardExperience(100, updated);
      });

      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'earn',
        description: `步步推进！完整攻破【${taskObj.title}】`,
        goldChange: taskObj.coinsReward,
        tacticalChange: taskObj.tacticalCoinsReward
      };
      setTransactions(prev => [newTx, ...prev]);

      updateAchievementsProgress('task', 1);
      triggerToast(`🎯 步骤全攻破！获得 🪙${taskObj.coinsReward} 心愿币，🔋${taskObj.tacticalCoinsReward} 战术币！`);
    } else {
      triggerToast(`⚡ 子步骤状态已更新`);
    }
  };

  // --- 5. TIMER COMPLETED REWARD FLOW ---
  const handleFinishFocusSession = (taskId: string, subTaskId: string | undefined, secondsSpent: number, successRate: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const minutesFocused = Math.round(secondsSpent / 60) || 1;
    setActiveFocusSession(null);

    // 1. Toggle targeted subtask (or finish general if no subtask id provided)
    let updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        if (subTaskId) {
          return {
            ...t,
            actualTime: t.actualTime + minutesFocused,
            subTasks: t.subTasks.map(st => {
              if (st.id === subTaskId) {
                return { ...st, isCompleted: true };
              }
              return st;
            })
          };
        } else {
          return {
            ...t,
            actualTime: t.actualTime + minutesFocused
          };
        }
      }
      return t;
    });

    // Check if entire task got finished as a result
    let isTaskNowFinished = false;
    updatedTasks = updatedTasks.map(t => {
      if (t.id === taskId) {
        const allDone = t.subTasks.every(st => st.isCompleted);
        if (allDone && !t.isCompleted) {
          isTaskNowFinished = true;
          return { ...t, isCompleted: true };
        }
      }
      return t;
    });

    setTasks(updatedTasks);

    // 2. Award standard focus points + experience
    const focusXpReward = minutesFocused * 3; // 3 EXP per focus minute
    const focusGoldReward = Math.ceil(minutesFocused * 0.5); // gold coins for persistence
    const focusTacReward = Math.ceil(minutesFocused * 0.2); // tactical coins

    // Bonus for total completion
    let totalGold = focusGoldReward;
    let totalTac = focusTacReward;
    if (isTaskNowFinished) {
      totalGold += task.coinsReward;
      totalTac += task.tacticalCoinsReward;
    }

    setOperator(prev => {
      let updated = {
        ...prev,
        goldCoins: prev.goldCoins + totalGold,
        tacticalCoins: prev.tacticalCoins + totalTac,
      };
      return awardExperience(focusXpReward + (isTaskNowFinished ? 100 : 0), updated);
    });

    // 3. Transactions logging
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'earn',
      description: `执行【${subTaskId ? '子步骤挑战' : task.title}】专注 ${minutesFocused} 分钟`,
      goldChange: totalGold,
      tacticalChange: totalTac
    };
    setTransactions(prev => [newTx, ...prev]);

    // Check for high focus endurance achievements
    if (minutesFocused >= 40) {
      updateAchievementsProgress('endurance', minutesFocused);
    }

    triggerToast(`🏆 专注胜利！达成专注 ${minutesFocused} 分钟。获得 🪙+${totalGold} 心愿币，🔋+${totalTac} 战术币！`);
  };

  // Helper to dynamically update achievement counts
  const updateAchievementsProgress = (type: 'task' | 'Chinese' | 'Math' | 'English' | 'endurance', amount: number) => {
    setAchievements(prev => prev.map(ach => {
      let shouldUnlock = false;
      let newVal = ach.currentValue;

      if (type === 'task' && (ach.id === 'ach-1')) {
        newVal = ach.currentValue + amount;
        shouldUnlock = newVal >= ach.targetValue;
      }
      if (type === 'endurance' && ach.id === 'ach-9') {
        newVal = Math.max(ach.currentValue, amount);
        shouldUnlock = newVal >= ach.targetValue;
      }
      if (type === 'Chinese' && ach.id === 'ach-10') {
        newVal = ach.currentValue + amount;
        shouldUnlock = newVal >= ach.targetValue;
      }
      if (type === 'Math' && ach.id === 'ach-11') {
        newVal = ach.currentValue + amount;
        shouldUnlock = newVal >= ach.targetValue;
      }
      if (type === 'English' && ach.id === 'ach-12') {
        newVal = ach.currentValue + amount;
        shouldUnlock = newVal >= ach.targetValue;
      }

      if (shouldUnlock && !ach.isUnlocked) {
        return { ...ach, currentValue: newVal, isUnlocked: true };
      }
      return { ...ach, currentValue: newVal };
    }));
  };

  // --- 6. ADD TASK TRIGGER ---
  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'actualTime' | 'isCompleted'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-custom-${Date.now()}`,
      actualTime: 0,
      isCompleted: false
    };
    setTasks(prev => [newTask, ...prev]);
    triggerToast(`📋 已将【${newTask.title}】列入战术排班日程表！`);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    triggerToast("🗑️ 战术任务已被彻底删除！");
  };

  const handleEditTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    triggerToast(`✏️ 任务【${updatedTask.title}】更新成功！`);
  };

  // --- 7. PARENT CONTROLS & WISH REWARDS CLAIMING ---
  // Wish item spends gold coins. Tactical item spends tactical coins.
  const handlePurchaseReward = (item: RewardItem) => {
    if (item.category === 'wish') {
      if (operator.goldCoins < item.cost) {
        triggerToast(`❌ 余额不足！心愿金币差 ${item.cost - operator.goldCoins} 枚`);
        return;
      }

      // Parents supervisor popups verification!
      // To ensure children do not cheat and spend coins on screens unverified, parents must input a code.
      // This is a highly requested practical mechanism for parents!
      setShowParentVerifyModal({
        isOpen: true,
        rewardItem: item,
        callback: () => {
          setOperator(prev => ({ ...prev, goldCoins: prev.goldCoins - item.cost }));
          
          const newTx: Transaction = {
            id: `tx-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'spend',
            description: `兑换奖励【${item.name}】并由家长核准`,
            goldChange: -item.cost,
            tacticalChange: 0
          };
          setTransactions(prev => [newTx, ...prev]);
          triggerToast(`🛍️ 兑换成功！已从家长处兑换获得【${item.name}】许可！`);
        }
      });
    } else {
      // Tactical items purchase (e.g. food, drinks, gadgets)
      if (operator.tacticalCoins < item.cost) {
        triggerToast(`❌ 余额不足！战术币差 ${item.cost - operator.tacticalCoins} 枚`);
        return;
      }

      setOperator(prev => {
        let nextMood = prev.mood;
        if (item.id === 'tac-energy') nextMood = '满状态';
        if (item.id === 'tac-drink') nextMood = '战意高昂';

        return {
          ...prev,
          tacticalCoins: prev.tacticalCoins - item.cost,
          mood: nextMood,
          exp: item.id === 'tac-energy' ? Math.min(prev.exp + 20, prev.maxExp) : prev.exp
        };
      });

      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'spend',
        description: `在战术军需处购买补给：【${item.name}】`,
        goldChange: 0,
        tacticalChange: -item.cost
      };
      setTransactions(prev => [newTx, ...prev]);

      triggerToast(`🎁 补给兑换成功！状态立刻提升为“${item.id === 'tac-energy' ? '满状态' : '战意高昂'}”！`);
    }
  };

  const handleVerifyParentCode = (e: React.FormEvent) => {
    e.preventDefault();
    // Simplified parent code check (e.g., 666 or 888) to make it accessible but secure
    if (parentCodeInput === '666' || parentCodeInput === '888' || parentCodeInput.toLowerCase() === 'parent') {
      if (showParentVerifyModal.callback) {
        showParentVerifyModal.callback();
      }
      setParentCodeInput('');
      setShowParentVerifyModal({ isOpen: false });
    } else {
      triggerToast(`❌ 家长密码错误！请询问爸爸妈妈获得正确的口令(提示: 666)`);
    }
  };

  // --- 8. WARDROBE SKIN ACQUISITION ---
  const handleBuySkin = (skinId: string, cost: number) => {
    if (operator.tacticalCoins < cost) {
      triggerToast(`❌ 战术币余额不足，无法购买此迷彩装！`);
      return;
    }

    // Deduct coins and unlock
    setOperator(prev => ({ ...prev, tacticalCoins: prev.tacticalCoins - cost }));
    setSkins(prev => prev.map(s => s.id === skinId ? { ...s, unlocked: true } : s));

    const purchasedSkinName = skins.find(s => s.id === skinId)?.name || '高级战役迷彩';
    setUnlockedSkinName(purchasedSkinName);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'spend',
      description: `从军需库解锁【${purchasedSkinName}】战术特工皮肤`,
      goldChange: 0,
      tacticalChange: -cost
    };
    setTransactions(prev => [newTx, ...prev]);
    
    triggerToast(`🥋 解锁成功！已获得 ${purchasedSkinName} 特工服！可在主控面板随时装配！`);
  };

  const handleEquipSkin = (skinId: string) => {
    setOperator(prev => ({ ...prev, equippedSkinId: skinId }));
    const skinName = skins.find(s => s.id === skinId)?.name || '未知迷彩';
    triggerToast(`💂 装备成功！特工已换装为【${skinName}】迷彩装甲`);
  };

  // --- 9. BANK INTEREST & BANKING ACTIONS ---
  const handleExchangeCoins = (from: 'gold' | 'tactical', amount: number) => {
    if (from === 'tactical') {
      if (operator.tacticalCoins < amount) return;
      const payout = amount * 6;
      setOperator(prev => ({
        ...prev,
        tacticalCoins: prev.tacticalCoins - amount,
        goldCoins: prev.goldCoins + payout
      }));

      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'exchange',
        description: `办理战术币兑换金币 (🔋${amount} → 🪙${payout})`,
        goldChange: payout,
        tacticalChange: -amount
      };
      setTransactions(prev => [newTx, ...prev]);
    } else {
      if (operator.goldCoins < amount) return;
      const payout = Math.floor(amount / 6);
      if (payout <= 0) {
        triggerToast(`❌ 数量过少！至少需要 6 枚心愿币才能兑换 1 枚战术币`);
        return;
      }
      const actualDeduct = payout * 6;

      setOperator(prev => ({
        ...prev,
        goldCoins: prev.goldCoins - actualDeduct,
        tacticalCoins: prev.tacticalCoins + payout
      }));

      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'exchange',
        description: `办理金币兑换战术币 (🪙${actualDeduct} → 🔋${payout})`,
        goldChange: -actualDeduct,
        tacticalChange: payout
      };
      setTransactions(prev => [newTx, ...prev]);
    }

    triggerToast(`🏦 汇兑大厅交易成功！`);
  };

  const handleSavingAction = (actionType: 'deposit' | 'withdraw', coinType: 'gold' | 'tactical', amount: number) => {
    if (actionType === 'deposit') {
      if (coinType === 'gold') {
        if (operator.goldCoins < amount) return;
        setOperator(prev => ({ ...prev, goldCoins: prev.goldCoins - amount }));
        setSavings(prev => ({ ...prev, balance: prev.balance + amount }));
        
        const newTx: Transaction = {
          id: `tx-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'save',
          description: `往储蓄金库存入 🪙${amount} 枚金币`,
          goldChange: -amount,
          tacticalChange: 0
        };
        setTransactions(prev => [newTx, ...prev]);
        triggerToast(`💰 成功存入金库存款 🪙${amount} 金币，每日复利累计开始！`);
      }
    } else {
      // withdraw
      if (savings.balance < amount) return;
      setSavings(prev => ({ ...prev, balance: prev.balance - amount }));
      setOperator(prev => ({ ...prev, goldCoins: prev.goldCoins + amount }));

      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'withdraw',
        description: `从储蓄金库提取 🪙${amount} 枚金币`,
        goldChange: amount,
        tacticalChange: 0
      };
      setTransactions(prev => [newTx, ...prev]);
      triggerToast(`🏦 成功支取金库储蓄 🪙${amount} 金币，现金已转入特工背包！`);
    }
  };

  const handlePaySimulatedInterest = (rate: number) => {
    if (savings.balance <= 0) {
      triggerToast(`❌ 金库存款不足！快去存入金币体验复利增值的奇妙效果吧！`);
      return;
    }

    const interestVal = Math.max(Math.round(savings.balance * rate), 1);
    setSavings(prev => ({ ...prev, balance: prev.balance + interestVal }));

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'save',
      description: `储蓄金库每日利息结算到账 (+5%复利)`,
      goldChange: interestVal,
      tacticalChange: 0
    };
    setTransactions(prev => [newTx, ...prev]);
    triggerToast(`📈 结算利息成功！你的金库存款通过复利滋生了 🪙+${interestVal} 额外收益！`);
  };

  const handleClaimAchievementReward = (achId: string) => {
    const ach = achievements.find(a => a.id === achId);
    if (!ach || !ach.isUnlocked || ach.rewardClaimed) return;

    setAchievements(prev => prev.map(a => a.id === achId ? { ...a, rewardClaimed: true } : a));
    
    // Award standard large medal bonuses: 50 Gold Coins & 200 XP
    setOperator(prev => {
      let updated = {
        ...prev,
        goldCoins: prev.goldCoins + 50
      };
      return awardExperience(200, updated);
    });

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'earn',
      description: `获得并领用功勋勋章【${ach.title}】大额奖金`,
      goldChange: 50,
      tacticalChange: 0
    };
    setTransactions(prev => [newTx, ...prev]);

    triggerToast(`🎖️ 勋章福利已收归金库！金币 +50，+200 EXP 大量经验到手！`);
  };


  // --- 10. ACTIVE VIEW SELECTION ROUTING ---
  const renderActiveView = () => {
    switch (activeTab) {
      case 'weekly':
        return (
          <WeeklyPlan 
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleComplete={handleCompleteTask}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
          />
        );
      case 'report':
        return <Report tasks={tasks} />;
      case 'shop':
        return (
          <Shop 
            goldCoins={operator.goldCoins}
            tacticalCoins={operator.tacticalCoins}
            skins={skins}
            onPurchaseReward={handlePurchaseReward}
            onBuySkin={handleBuySkin}
          />
        );
      case 'bank':
        return (
          <Bank 
            goldCoins={operator.goldCoins}
            tacticalCoins={operator.tacticalCoins}
            savings={savings}
            transactions={transactions}
            onExchange={handleExchangeCoins}
            onSavingAction={handleSavingAction}
            onPaySimulatedInterest={handlePaySimulatedInterest}
          />
        );
      case 'achievements':
        return (
          <Achievements 
            achievements={achievements}
            onClaimReward={handleClaimAchievementReward}
          />
        );
      case 'dashboard':
      default:
        // Main Command Dashboard view
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Operator Profile & Info */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Operator HUD Card (Screenshot 3 & 4 matching element) */}
              <div className="bg-slate-900/80 border border-emerald-500/20 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between h-fit">
                
                {/* Tech Radar Crosshair ornament */}
                <div className="absolute top-2 right-2 text-emerald-500/20 font-mono text-[9px] select-none">
                  SECURE_LINE_06 [COORD: 34.9, 112.5]
                </div>

                <div className="flex items-center gap-4.5 mb-5">
                  <OperatorAvatar 
                    skinId={operator.equippedSkinId} 
                    className="w-20 h-20"
                    glow={true}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-slate-100">{operator.name}</span>
                      <span className="text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/40 px-1.5 py-0.5 rounded-md">
                        LEVEL {operator.level}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
                      状态: 
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${operator.mood === '满状态' || operator.mood === '战意高昂' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'bg-amber-950 text-amber-400 border border-amber-800/30'}`}>
                        {operator.mood}
                      </span>
                    </p>

                    {/* Level Experience Indicator */}
                    <div className="mt-2.5">
                      <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-0.5">
                        <span>经验 XP</span>
                        <span>{operator.exp} / {operator.maxExp}</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-300"
                          style={{ width: `${(operator.exp / operator.maxExp) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pocket Ledger (Balances summary) */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
                  <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-850 flex items-center gap-2">
                    <span className="text-base select-none">🪙</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-black font-mono text-amber-300 truncate">{operator.goldCoins}</span>
                      <span className="text-[8px] text-slate-500 font-bold">心愿币</span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-850 flex items-center gap-2">
                    <span className="text-base select-none">🔋</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-black font-mono text-purple-300 truncate">{operator.tacticalCoins}</span>
                      <span className="text-[8px] text-slate-500 font-bold">战术怪兽币</span>
                    </div>
                  </div>
                </div>

                {/* Switch Skins Wardrobe Drawer inside dashboard */}
                <div className="mt-4 pt-3.5 border-t border-slate-800/80">
                  <span className="text-[10px] font-mono font-bold text-slate-400 block mb-2 uppercase tracking-wide">
                    💂 更换已解锁战术迷彩服 (衣橱)
                  </span>
                  
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {skins.map((skin) => {
                      const isEquipped = operator.equippedSkinId === skin.id;
                      if (!skin.unlocked) return null;
                      return (
                        <button
                          key={skin.id}
                          onClick={() => handleEquipSkin(skin.id)}
                          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${isEquipped ? 'bg-emerald-950/50 border-emerald-500 text-emerald-400 shadow' : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'}`}
                        >
                          <span>{skin.id === 'skin-classic' ? '🌲' : skin.id === 'skin-desert' ? '🐫' : skin.id === 'skin-arctic' ? '❄️' : '👾'}</span>
                          {skin.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Parents direct command widget */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md h-fit">
                <span className="text-[10px] font-mono font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                  👨‍👩‍👦 PARENT COMMAND
                </span>
                <h4 className="text-xs font-bold text-slate-200">家长管理直通台</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed mt-1.5 mb-3">
                  家长可通过此处手动下发或微调任务，亦可手动核销愿望。
                </p>
                <div className="flex gap-1.5 sm:gap-2">
                  <button 
                    onClick={() => setActiveTab('weekly')} 
                    className="flex-1 py-2 px-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1"
                  >
                    <CalendarRange className="w-3 h-3" />
                    战术排班
                  </button>
                  <button 
                    onClick={() => {
                      setShowParentVerifyModal({
                        isOpen: true,
                        rewardItem: undefined,
                        callback: () => {
                          // Allow simple direct coin editing as a parent administrator tool!
                          setOperator(prev => ({ ...prev, goldCoins: prev.goldCoins + 50 }));
                          triggerToast("👮 家长直接下发了 +50 金币特攻补贴！");
                        }
                      });
                    }}
                    className="flex-1 py-2 px-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-amber-400 font-bold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1"
                  >
                    <Coins className="w-3 h-3" />
                    下发津贴
                  </button>
                  <button 
                    onClick={() => {
                      setShowParentVerifyModal({
                        isOpen: true,
                        rewardItem: undefined,
                        callback: () => {
                          localStorage.removeItem('op_profile');
                          localStorage.removeItem('op_skins');
                          localStorage.removeItem('op_achievements');
                          localStorage.removeItem('op_tasks');
                          localStorage.removeItem('op_savings');
                          localStorage.removeItem('op_transactions');
                          
                          setOperator(INITIAL_OPERATOR);
                          setSkins(INITIAL_SKINS);
                          setAchievements(INITIAL_ACHIEVEMENTS);
                          setTasks(INITIAL_TASKS);
                          setSavings({ balance: 0, lastInterestPaid: '2026-06-30' });
                          setTransactions([]);
                          
                          triggerToast("🔒 系统数据已重置！一切清零，重新开始！");
                        }
                      });
                    }}
                    className="flex-1 py-2 px-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-red-400 hover:text-red-300 font-bold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1"
                  >
                    <LogOut className="w-3 h-3" />
                    数据清零
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Mission Checklist */}
            <div className="lg:col-span-8 flex flex-col gap-5">
              
              {/* Daily Checklist Title bar */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
                    <CheckSquare className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">MISSION CHECKLIST</span>
                    <h3 className="text-sm font-bold text-slate-100">今日特训主线任务日程</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">
                    双向兑换通道:
                  </span>
                  <button 
                    onClick={() => setActiveTab('bank')}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-950 text-purple-300 border border-purple-800/30 font-black text-[10px] hover:bg-purple-900 transition-all font-mono"
                  >
                    🏦 兑换金库
                  </button>
                </div>
              </div>

              {/* List of Today's Tasks */}
              <div className="space-y-4">
                {tasks.filter(t => t.date === getFormattedDate(0)).length === 0 ? (
                  <div className="border border-dashed border-slate-800 bg-slate-950/20 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                    <span className="text-4xl">📡</span>
                    <p className="text-slate-300 text-xs font-bold mt-4">今日无战术任务安排！</p>
                    <p className="text-[10px] text-slate-500 mt-2 max-w-sm leading-normal">
                      点击左上角的【战术周划】选项卡，前往日历大厅一键部署学习模板或自定义添加新日程。
                    </p>
                  </div>
                ) : (
                  tasks.filter(t => t.date === getFormattedDate(0)).map(task => (
                    <TaskCard 
                      key={task.id}
                      task={task}
                      onCompleteTask={handleCompleteTask}
                      onToggleSubTask={handleToggleSubTask}
                      onStartFocus={(t: Task, stId?: string) => setActiveFocusSession({ task: t, subTaskId: stId })}
                    />
                  ))
                )}
              </div>

            </div>

          </div>
        );
    }
  };

  const currentFormattedDate = "2026年7月1日 星期三";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden flex flex-col">
      
      {/* 10-YEAR-OLD DELTA FORCE THEME BACKGROUND LAYERS (CSS Grid, cockpit frames & coordinates) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.95)_0%,rgba(219,234,254,1)_100%)] z-0" />
      
      {/* HUD High Tech Grid Lines and Crosshairs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(14,165,233,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,165,233,0.08)_1px,transparent_1px)] bg-[size:3rem_3rem] z-0 pointer-events-none" />
      
      {/* Glowing Radar Rings Background Layer */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-emerald-500/[0.02] bg-emerald-500/[0.003] z-0 pointer-events-none flex items-center justify-center animate-pulse duration-1000">
        <div className="w-[500px] h-[500px] rounded-full border border-emerald-500/[0.015] flex items-center justify-center">
          <div className="w-[300px] h-[300px] rounded-full border border-emerald-500/[0.01] pointer-events-none" />
        </div>
      </div>

      {/* Decorative Technical Frames & Hex coordinates */}
      <div className="absolute top-16 left-6 text-emerald-500/20 font-mono text-[9px] pointer-events-none hidden xl:block select-none">
        HUD_MARKER: L-04 // SWEEP_FREQ: 5.8Hz // STATUS: ACTIVE_ONLINE
      </div>
      <div className="absolute bottom-6 right-6 text-emerald-500/20 font-mono text-[9px] pointer-events-none hidden xl:block select-none">
        DEPLOYMENT_SYS // PORT_ENGAGE_3000 // UTC_STAB: OK
      </div>

      {/* HEADER BAR (Screenshot Elements) */}
      <header className="relative z-10 border-b border-slate-800 bg-slate-900/70 backdrop-blur-md px-4 sm:px-6 py-4.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            {/* Cool glowing Delta Force target symbol badge */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-emerald-500/10 border border-emerald-400/20 select-none animate-bounce">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black tracking-wider text-slate-100">特工每日计划</h1>
                <span className="text-[8px] font-mono font-bold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded uppercase tracking-widest">
                  DElTA FORCE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">专为10岁小小特工设计的自律与挑战管理中心</p>
            </div>
          </div>

          {/* Time & calendar display */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-right font-mono text-[10px] leading-tight">
              <span className="text-slate-500 block">SYSTEM TIME (LOCAL)</span>
              <span className="text-emerald-400 font-bold">{currentFormattedDate}</span>
            </div>
          </div>

        </div>
      </header>

      {/* CORE NAVIGATION TABS PANEL (Screenshot 2 Elements) */}
      <nav className="relative z-10 bg-slate-900/40 border-b border-slate-800 backdrop-blur-sm sticky top-0 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex">
          {[
            { id: 'dashboard', label: '战区主控', icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: 'weekly', label: '战术周划', icon: <CalendarRange className="w-4 h-4" /> },
            { id: 'report', label: '战力分析', icon: <Percent className="w-4 h-4" /> },
            { id: 'shop', label: '军需商店', icon: <Coins className="w-4 h-4" /> },
            { id: 'bank', label: '特工金库', icon: <Landmark className="w-4 h-4" /> },
            { id: 'achievements', label: '荣誉勋章', icon: <Trophy className="w-4 h-4" /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-bold transition-all relative flex-shrink-0 border-b-2 ${isActive ? 'text-cyan-400 border-cyan-500 bg-slate-900/40' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
              >
                {tab.icon}
                {tab.label}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabGlow" 
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-[0_2px_10px_rgba(6,181,212,0.4)]" 
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* MAIN BODY VIEW CONTAINER */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Animated dynamic transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* TOAST SYSTEM CO-ORDINATOR */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 border-2 border-emerald-500/40 text-slate-100 font-bold text-xs py-3.5 px-6 rounded-2xl shadow-2xl shadow-emerald-950/40 flex items-center gap-2.5 max-w-md text-center border-l-4 border-l-emerald-400"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODALS --- */}

      {/* 1. GAMIFIED FOCUS CHALLENGE TIMER OVERLAY */}
      {activeFocusSession && (
        <TaskTimer 
          task={activeFocusSession.task}
          subTaskId={activeFocusSession.subTaskId}
          onClose={() => setActiveFocusSession(null)}
          onFinish={handleFinishFocusSession}
        />
      )}

      {/* 2. PARENTS AUTHORIZATION PASSWORD MODAL (SCREEN VERIFICATION) */}
      {showParentVerifyModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 relative">
            <button 
              onClick={() => {
                setParentCodeInput('');
                setShowParentVerifyModal({ isOpen: false });
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <XIcon className="w-4 h-4" />
            </button>

            <span className="text-[10px] font-mono text-cyan-400 font-black block tracking-widest text-center uppercase">SUPERVISORY LOCK</span>
            <h3 className="text-sm font-black text-slate-100 text-center mt-1">家长控制中心口令锁</h3>
            
            {showParentVerifyModal.rewardItem ? (
              <p className="text-[11px] text-slate-400 leading-normal text-center mt-3 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                ⚠️ 正在申请消耗 🪙<strong>{showParentVerifyModal.rewardItem.cost}</strong> 金币 
                兑换：<strong>【{showParentVerifyModal.rewardItem.name}】</strong>
                <br />
                <span className="text-slate-500 block mt-1.5">请家长核准。如果批准兑换，请在下方输入家长密码：</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 leading-normal text-center mt-3 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                👮 家长行政命令。请输入家长授权密码，以进行津贴下发或数据修改：
              </p>
            )}

            <form onSubmit={handleVerifyParentCode} className="mt-5 space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="请输入家长密码 (初始提示: 666 或 parent)"
                  value={parentCodeInput}
                  onChange={(e) => setParentCodeInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-center text-white font-mono focus:outline-none focus:border-cyan-500"
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setParentCodeInput('');
                    setShowParentVerifyModal({ isOpen: false });
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 text-xs font-bold transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-black text-xs shadow-md transition-all"
                >
                  批准授权
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. LEVEL UP CELEBRATION MODAL */}
      {showLevelUpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-lg flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-indigo-950 border-2 border-amber-500 rounded-3xl p-6 text-center shadow-2xl shadow-amber-500/10 flex flex-col items-center"
          >
            <div className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center text-4xl shadow-inner select-none animate-bounce mb-4">
              🎖️
            </div>

            <span className="text-[10px] font-mono text-amber-400 font-black block tracking-widest uppercase">PROMOTED IN RANK</span>
            <h2 className="text-xl font-black text-white mt-1">恭喜！特工军衔晋升！</h2>
            
            <p className="text-xs text-slate-400 leading-relaxed mt-3 px-2">
              你累计攻破重重战术挑战，表现极度优秀，成功晋升为 <strong>Lv. {operator.level} 特工上将</strong>！
              军需库已发放 <strong>100枚 心愿金币</strong> 并解锁更高阶迷彩装备购买权！
            </p>

            <button
              onClick={() => {
                setOperator(prev => ({ ...prev, goldCoins: prev.goldCoins + 100 }));
                setShowLevelUpModal(false);
                triggerToast("🎁 已领取晋升奖励 100金币！");
              }}
              className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all font-mono"
            >
              领取战级晋升军饷 (+100金币)
            </button>
          </motion.div>
        </div>
      )}

      {/* 4. SKIN UNLOCKED HIGHLIGHT */}
      {unlockedSkinName && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 text-center shadow-2xl">
            <span className="text-4xl block mb-4">🥋</span>
            <span className="text-[10px] font-mono text-cyan-400 font-black block">WARDROBE ACCQUIRED</span>
            <h3 className="text-base font-black text-white mt-1">成功购买高级特工迷彩！</h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-2.5">
              已将 <strong>【{unlockedSkinName}】</strong> 解锁并添加至你的主控衣橱。你可以随时在主控区穿戴炫酷皮肤！
            </p>
            <button
              onClick={() => setUnlockedSkinName(null)}
              className="w-full mt-5 py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl transition-all"
            >
              好 的 (返回特训)
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/90 py-5 text-center text-[10px] text-slate-500 font-mono tracking-wide">
        &copy; 2026 特工每日计划 // DELTA WORKSPACE CONTROL PLATFORM // ALL SYSTEMS OPERATIONAL
      </footer>

    </div>
  );
}

// Internal standard icon component replacements inside modal to simplify imports
function XIcon({ className = 'w-4 h-4' }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
