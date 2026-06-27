import React, { useState } from 'react';
import { RewardItem, SkinItem } from '../types';
import { INITIAL_REWARDS } from '../data';
import { Gamepad2, Tablet, Tv, Coins, PackageOpen, Cookie, Zap, Flame, Radio, Eye, CheckCircle2, ShoppingBag } from 'lucide-react';

interface ShopProps {
  goldCoins: number;
  tacticalCoins: number;
  skins: SkinItem[];
  onPurchaseReward: (item: RewardItem) => void;
  onBuySkin: (skinId: string, cost: number) => void;
}

export default function Shop({ goldCoins, tacticalCoins, skins, onPurchaseReward, onBuySkin }: ShopProps) {
  const [activeTab, setActiveTab] = useState<'wish' | 'tactical' | 'skins'>('wish');

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Tablet': return <Tablet className="w-6 h-6 text-cyan-400" />;
      case 'Gamepad2': return <Gamepad2 className="w-6 h-6 text-emerald-400" />;
      case 'Tv': return <Tv className="w-6 h-6 text-indigo-400" />;
      case 'Coins': return <Coins className="w-6 h-6 text-amber-400" />;
      case 'PackageOpen': return <PackageOpen className="w-6 h-6 text-rose-400" />;
      case 'Cookie': return <Cookie className="w-6 h-6 text-amber-500" />;
      case 'Zap': return <Zap className="w-6 h-6 text-yellow-400 fill-current" />;
      case 'Flame': return <Flame className="w-6 h-6 text-red-400 fill-current" />;
      case 'Radio': return <Radio className="w-6 h-6 text-purple-400" />;
      case 'Eye': return <Eye className="w-6 h-6 text-emerald-400" />;
      default: return <ShoppingBag className="w-6 h-6 text-slate-400" />;
    }
  };

  const getSkinAvatarComponent = (avatarType: string) => {
    switch (avatarType) {
      case 'desert': return '🐫 沙漠迷彩';
      case 'arctic': return '❄️ 极寒破冰';
      case 'cyber': return '👾 赛博幽灵';
      default: return '🌲 经典特攻';
    }
  };

  const wishRewards = INITIAL_REWARDS.filter(r => r.category === 'wish');
  const tacticalRewards = INITIAL_REWARDS.filter(r => r.category === 'tactical');

  return (
    <div className="space-y-6">
      
      {/* Coins summary header */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/80 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-md">
          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-xl shadow-inner select-none">🪙</div>
          <div>
            <span className="text-2xl font-black font-mono text-amber-400">{goldCoins}</span>
            <div className="text-[10px] text-slate-400 font-bold">心愿币余额 (可兑换现实愿望)</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-purple-500/20 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-md">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-lg shadow-inner select-none">🔋</div>
          <div>
            <span className="text-2xl font-black font-mono text-purple-400">{tacticalCoins}</span>
            <div className="text-[10px] text-slate-400 font-bold">战术币余额 (可兑换装备及皮肤)</div>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex bg-slate-950/90 rounded-xl p-1 border border-slate-800 self-start w-fit">
        <button
          onClick={() => setActiveTab('wish')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'wish' ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          心愿商店 (兑换现实生活奖励)
        </button>
        <button
          onClick={() => setActiveTab('tactical')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'tactical' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          战术补给 (专注增强药水)
        </button>
        <button
          onClick={() => setActiveTab('skins')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'skins' ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          特工换装 (解锁高阶炫酷迷彩)
        </button>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Wish Store Items List */}
        {activeTab === 'wish' && wishRewards.map((item) => {
          const canAfford = goldCoins >= item.cost;
          return (
            <div 
              key={item.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between group hover:border-amber-500/20 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    {getIconComponent(item.icon)}
                  </div>
                  <span className="text-xs font-bold text-amber-400 bg-amber-950/30 border border-amber-800/40 px-2.5 py-1 rounded-full font-mono flex items-center gap-1">
                    🪙 {item.cost} 心愿币
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-200 mb-1.5 font-sans">{item.name}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{item.description}</p>
              </div>

              <button
                onClick={() => onPurchaseReward(item)}
                disabled={!canAfford}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${canAfford ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/5' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
              >
                {canAfford ? '确定兑换心愿' : '心愿币余额不足'}
              </button>
            </div>
          );
        })}

        {/* Tactical Store Items List */}
        {activeTab === 'tactical' && tacticalRewards.map((item) => {
          const canAfford = tacticalCoins >= item.cost;
          return (
            <div 
              key={item.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between group hover:border-purple-500/20 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    {getIconComponent(item.icon)}
                  </div>
                  <span className="text-xs font-bold text-purple-400 bg-purple-950/30 border border-purple-800/40 px-2.5 py-1 rounded-full font-mono flex items-center gap-1">
                    🔋 {item.cost} 战术币
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-200 mb-1.5 font-sans">{item.name}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{item.description}</p>
              </div>

              <button
                onClick={() => onPurchaseReward(item)}
                disabled={!canAfford}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${canAfford ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/5' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
              >
                {canAfford ? '兑换补给物资' : '战术币余额不足'}
              </button>
            </div>
          );
        })}

        {/* Skins Wardrobe Shop List */}
        {activeTab === 'skins' && skins.map((skin) => {
          const isUnlocked = skin.unlocked;
          const canAfford = tacticalCoins >= skin.cost;
          
          return (
            <div 
              key={skin.id}
              className={`bg-slate-900/80 border rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between transition-all duration-300 ${isUnlocked ? 'border-cyan-500/20 shadow-md shadow-cyan-950/10' : 'border-slate-800 hover:border-cyan-500/10'}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full ${isUnlocked ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-850 text-slate-400'}`}>
                    {skin.badge}
                  </span>
                  
                  {!isUnlocked ? (
                    <span className="text-xs font-bold text-purple-400 bg-purple-950/30 border border-purple-800/40 px-2.5 py-1 rounded-full font-mono">
                      🔋 {skin.cost} 战术币
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      已拥有
                    </span>
                  )}
                </div>

                {/* Skin Preview Block representation */}
                <div className={`aspect-video rounded-xl bg-gradient-to-b ${skin.accentColor} mb-4 flex flex-col items-center justify-center relative overflow-hidden border border-white/5`}>
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-30" />
                  <span className="text-3xl relative z-10 select-none">
                    {skin.id === 'skin-classic' ? '🌲' : skin.id === 'skin-desert' ? '🐫' : skin.id === 'skin-arctic' ? '❄️' : '👾'}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-white bg-slate-950/40 px-2 py-0.5 rounded-md mt-2 relative z-10 border border-white/5">
                    {skin.name}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-200 mb-1.5 font-sans">{skin.name} 迷彩服</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{skin.description}</p>
              </div>

              {isUnlocked ? (
                <div className="text-center py-2 text-xs font-bold text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  已添加至衣柜（可在主控区穿戴）
                </div>
              ) : (
                <button
                  onClick={() => onBuySkin(skin.id, skin.cost)}
                  disabled={!canAfford}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${canAfford ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-md shadow-cyan-500/5' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                >
                  {canAfford ? '解锁并购买此特工皮肤' : '战术币余额不足'}
                </button>
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
}
