import React from 'react';
import { Achievement } from '../types';
import { 
  Sun, Flame, Shield, Award, Compass, Zap, BookOpen, Calculator, 
  Globe, DollarSign, Armchair, TrendingUp, Sparkles, CheckCircle2, Lock, Milestone
} from 'lucide-react';

interface AchievementsProps {
  achievements: Achievement[];
  onClaimReward: (achId: string) => void;
}

export default function Achievements({ achievements, onClaimReward }: AchievementsProps) {
  
  const getAchievementIcon = (iconName: string, isUnlocked: boolean) => {
    const className = `w-8 h-8 ${isUnlocked ? 'text-amber-400 stroke-[2.2] animate-pulse' : 'text-slate-600 stroke-[1.5]'}`;
    
    switch (iconName) {
      case 'Milestone': return <Milestone className={className} />;
      case 'Sun': return <Sun className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'Shield': return <Shield className={className} />;
      case 'Award': return <Award className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'BookOpen': return <BookOpen className={className} />;
      case 'Calculator': return <Calculator className={className} />;
      case 'Globe': return <Globe className={className} />;
      case 'DollarSign': return <DollarSign className={className} />;
      case 'Armchair': return <Armchair className={className} />;
      case 'TrendingUp': return <TrendingUp className={className} />;
      case 'Sparkles': default: return <Sparkles className={className} />;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'growth': return '等级成长';
      case 'habit': return '晨起习惯';
      case 'efficiency': return '高效专注';
      case 'knowledge': return '学科研究';
      case 'fun': return '趣味道具';
      default: return '普通荣誉';
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'growth': return 'bg-emerald-950 text-emerald-400 border-emerald-800/30';
      case 'habit': return 'bg-orange-950 text-orange-400 border-orange-800/30';
      case 'efficiency': return 'bg-red-950 text-red-400 border-red-800/30';
      case 'knowledge': return 'bg-blue-950 text-blue-400 border-blue-800/30';
      case 'fun': return 'bg-purple-950 text-purple-400 border-purple-800/30';
      default: return 'bg-slate-900 text-slate-400 border-slate-800';
    }
  };

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      
      {/* Top statistics summary */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex flex-col sm:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/10 select-none">
            🎖️
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">特工功勋成就大厅</h2>
            <p className="text-xs text-slate-400 mt-1">
              完成特定的专注学习任务或达成自律天数，解锁军事特种战勋章。
            </p>
          </div>
        </div>

        {/* Big level progress wheel style bar */}
        <div className="w-full sm:w-64">
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-slate-400">功勋解锁进度</span>
            <span className="text-amber-400 font-bold">{unlockedCount} / {totalCount} ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid of achievements cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
        {achievements.map((ach) => {
          const isUnlocked = ach.isUnlocked;
          const isClaimed = ach.rewardClaimed;
          const progress = Math.min(Math.round((ach.currentValue / ach.targetValue) * 100), 100);

          return (
            <div 
              key={ach.id}
              className={`relative border rounded-2xl p-4.5 backdrop-blur-md flex flex-col justify-between transition-all duration-300 ${isUnlocked ? 'bg-slate-900/80 border-slate-800 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-950/10' : 'bg-slate-900/40 border-slate-900/50 opacity-60'}`}
            >
              {/* Category tag */}
              <div className="absolute top-3.5 right-3.5">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getCategoryColor(ach.category)}`}>
                  {getCategoryLabel(ach.category)}
                </span>
              </div>

              <div className="flex gap-4 mb-4 mt-2">
                {/* Custom glowing icon plate */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border flex-shrink-0 relative ${isUnlocked ? 'bg-amber-500/10 border-amber-500/30 shadow-md' : 'bg-slate-950 border-slate-850'}`}>
                  {getAchievementIcon(ach.icon, isUnlocked)}
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-slate-950/50 flex items-center justify-center rounded-2xl">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className={`text-xs font-black truncate leading-tight ${isUnlocked ? 'text-amber-300' : 'text-slate-400'}`}>
                    {ach.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 leading-normal mt-1.5 font-sans">
                    {ach.desc}
                  </p>
                </div>
              </div>

              {/* Progress and claim rewards action bar */}
              <div>
                {!isUnlocked ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-mono text-slate-500">
                      <span>解锁条件</span>
                      <span>{ach.currentValue} / {ach.targetValue}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-700 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-800/40 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      已解锁
                    </span>

                    {!isClaimed ? (
                      <button
                        onClick={() => onClaimReward(ach.id)}
                        className="py-1 px-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-[10px] rounded-lg shadow-md hover:shadow-amber-500/10 hover:scale-105 transition-all"
                        title="领取这枚功勋背后的金币与大额经验"
                      >
                        领取战功 (+50 金币)
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">
                        战勋奖品已发放
                      </span>
                    )}
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
