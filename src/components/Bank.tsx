import React, { useState } from 'react';
import { Transaction, SavingAccount } from '../types';
import { Landmark, ArrowLeftRight, TrendingUp, Inbox, Receipt, PlusCircle, MinusCircle, Info } from 'lucide-react';

interface BankProps {
  goldCoins: number;
  tacticalCoins: number;
  savings: SavingAccount;
  transactions: Transaction[];
  onExchange: (from: 'gold' | 'tactical', amount: number) => void;
  onSavingAction: (actionType: 'deposit' | 'withdraw', coinType: 'gold' | 'tactical', amount: number) => void;
  onPaySimulatedInterest: (rate: number) => void; // +5% simulated day trigger
}

export default function Bank({ goldCoins, tacticalCoins, savings, transactions, onExchange, onSavingAction, onPaySimulatedInterest }: BankProps) {
  // Exchange form state
  const [exchangeType, setExchangeType] = useState<'t_to_g' | 'g_to_t'>('t_to_g'); // Tactical to Gold is default (1:6)
  const [exchangeVal, setExchangeVal] = useState<number>(10);

  // Deposit/Withdraw form state
  const [savingAction, setSavingAction] = useState<'deposit' | 'withdraw'>('deposit');
  const [savingCoinType, setSavingCoinType] = useState<'gold' | 'tactical'>('gold');
  const [savingVal, setSavingVal] = useState<number>(20);

  const handleExchangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (exchangeVal <= 0) return;
    
    if (exchangeType === 't_to_g') {
      onExchange('tactical', exchangeVal);
    } else {
      onExchange('gold', exchangeVal);
    }
  };

  const handleSavingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (savingVal <= 0) return;
    onSavingAction(savingAction, savingCoinType, savingVal);
  };

  // Safe checks for form labels
  const maxAvailableForExchange = exchangeType === 't_to_g' ? tacticalCoins : goldCoins;
  const maxAvailableForSaving = savingAction === 'deposit' 
    ? (savingCoinType === 'gold' ? goldCoins : tacticalCoins)
    : savings.balance; // savings is simple gold balance for this example

  return (
    <div className="space-y-6">
      
      {/* Dynamic Bank Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Wallet Balance */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-3">
            <Landmark className="w-4 h-4 text-cyan-400" />
            现特工钱包余额
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">心愿金币:</span>
              <span className="font-mono text-base font-bold text-amber-400">🪙 {goldCoins}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">战术怪兽币:</span>
              <span className="font-mono text-base font-bold text-purple-400">🔋 {tacticalCoins}</span>
            </div>
          </div>
        </div>

        {/* Savings Vault */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-3">
            <Inbox className="w-4 h-4 text-emerald-400" />
            战术金库存款
          </div>
          <div className="flex flex-col justify-between h-14">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-emerald-400">{savings.balance}</span>
              <span className="text-[10px] text-slate-400">心愿币</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono">每日利息计提收益：<strong>+5.0% / 日复利</strong></span>
          </div>
        </div>

        {/* Compound interest simulator banner */}
        <div className="bg-gradient-to-br from-emerald-950/40 to-teal-950/40 border border-emerald-500/20 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-1">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold tracking-widest block">INTEREST ACCRUAL</span>
              <h4 className="text-xs font-bold text-slate-200 mt-1">模拟生息 (理财小特训)</h4>
              <p className="text-[9px] text-slate-400 leading-normal mt-0.5">
                储蓄能赚取高额利息！点击右侧按钮模拟天数推移，结算结算利息。
              </p>
            </div>
          </div>

          <button
            onClick={() => onPaySimulatedInterest(0.05)}
            className="w-full mt-3 py-1.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[11px] rounded-lg shadow-md hover:shadow-emerald-500/10 transition-all flex items-center justify-center gap-1 font-mono"
            title="手动触发5%生息事件"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            手动结算一日利息 (+5.0%)
          </button>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Bidirectional Exchange Panel */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3 mb-4">
            <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-200">双向汇兑窗口</h3>
          </div>
          
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 mb-4 text-[11px] text-slate-400 leading-relaxed flex items-start gap-1.5">
            <Info className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
            <span>
              💡 <strong>兑换规定</strong>：战区中央银行支持<strong>双向按需兑换</strong>。
              兑换比率规定：<strong>1个战术币 = 6个心愿币</strong>。
              用自律赚的战术币可以灵活换成现实愿望哦！
            </span>
          </div>

          <form onSubmit={handleExchangeSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-400 block mb-1.5">汇兑方向</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setExchangeType('t_to_g');
                    setExchangeVal(10);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${exchangeType === 't_to_g' ? 'bg-cyan-950/40 border-cyan-500 text-cyan-400' : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'}`}
                >
                  <span className="font-sans">🔋 战术币 → 🪙 心愿币</span>
                  <span className="text-[9px] font-mono opacity-80">(1 : 6 兑换)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setExchangeType('g_to_t');
                    setExchangeVal(60);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${exchangeType === 'g_to_t' ? 'bg-cyan-950/40 border-cyan-500 text-cyan-400' : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'}`}
                >
                  <span className="font-sans">🪙 心愿币 → 🔋 战术币</span>
                  <span className="text-[9px] font-mono opacity-80">(6 : 1 兑换)</span>
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 block">兑换数量</label>
                <span className="text-[10px] font-mono text-slate-500">
                  最多可用: {maxAvailableForExchange}
                </span>
              </div>
              
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={maxAvailableForExchange}
                  value={exchangeVal}
                  onChange={(e) => setExchangeVal(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  required
                />
                
                {/* Visual result preview inside input */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-bold font-mono text-emerald-400">
                  {exchangeType === 't_to_g' 
                    ? `可得 🪙 ${exchangeVal * 6}` 
                    : `可得 🔋 ${Math.floor(exchangeVal / 6)}`}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={exchangeVal <= 0 || exchangeVal > maxAvailableForExchange}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${exchangeVal > 0 && exchangeVal <= maxAvailableForExchange ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-black shadow-md' : 'bg-slate-850 text-slate-600 cursor-not-allowed'}`}
            >
              批准汇兑交易
            </button>
          </form>
        </div>

        {/* Savings Deposit & Withdraw Panel */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3 mb-4">
            <Inbox className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-200">存款保险库理财窗口</h3>
          </div>

          <form onSubmit={handleSavingSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-400 block mb-1.5">办理业务</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSavingAction('deposit');
                    setSavingVal(20);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 ${savingAction === 'deposit' ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'}`}
                >
                  <PlusCircle className="w-4 h-4" />
                  存入金库 (赚利息)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSavingAction('withdraw');
                    setSavingVal(Math.min(savings.balance, 20));
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 ${savingAction === 'withdraw' ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'}`}
                >
                  <MinusCircle className="w-4 h-4" />
                  支取存款 (用于消费)
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 block">货币种类</label>
                <span className="text-[10px] font-mono text-slate-500">
                  {savingAction === 'deposit' ? `钱包最多拥有: ${savingCoinType === 'gold' ? goldCoins : tacticalCoins}` : `金库最多拥有: ${savings.balance}`}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={savingAction === 'withdraw'}
                  onClick={() => setSavingCoinType('gold')}
                  className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${savingCoinType === 'gold' ? 'bg-slate-900 border-slate-700 text-amber-400' : 'bg-slate-950 border-slate-850 text-slate-500'}`}
                >
                  🪙 心愿金币
                </button>
                <button
                  type="button"
                  disabled={true} // For simplicity, savings is gold coin based only
                  className="py-1.5 rounded-lg border border-slate-900 bg-slate-950 text-slate-600 text-xs font-bold cursor-not-allowed"
                >
                  🔋 暂不开放战术币生息
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 block">业务数量</label>
                <span className="text-[10px] font-mono text-slate-500">
                  最高可用: {maxAvailableForSaving}
                </span>
              </div>
              
              <input
                type="number"
                min="1"
                max={maxAvailableForSaving}
                value={savingVal}
                onChange={(e) => setSavingVal(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={savingVal <= 0 || savingVal > maxAvailableForSaving}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${savingVal > 0 && savingVal <= maxAvailableForSaving ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md' : 'bg-slate-850 text-slate-600 cursor-not-allowed'}`}
            >
              {savingAction === 'deposit' ? '提交存款凭证' : '提交支取申请'}
            </button>
          </form>
        </div>

      </div>

      {/* Transaction History Ledger */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
        <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3 mb-4">
          <Receipt className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-200">金库账目流水账本</h3>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              这里空空如也，暂无最近的储蓄、兑换或支取交易历史。
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-900 text-xs"
              >
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <p className="font-bold text-slate-300 mt-0.5">{tx.description}</p>
                </div>

                <div className="flex items-center gap-3 font-mono text-right">
                  {tx.goldChange !== 0 && (
                    <span className={`font-bold ${tx.goldChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.goldChange > 0 ? `+${tx.goldChange}` : tx.goldChange} 🪙
                    </span>
                  )}
                  {tx.tacticalChange !== 0 && (
                    <span className={`font-bold ${tx.tacticalChange > 0 ? 'text-purple-400' : 'text-red-400'}`}>
                      {tx.tacticalChange > 0 ? `+${tx.tacticalChange}` : tx.tacticalChange} 🔋
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
