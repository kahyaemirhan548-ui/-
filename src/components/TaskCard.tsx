import React, { useState } from 'react';
import { Task } from '../types';
import { Play, Check, ChevronDown, ChevronUp, Target, ShieldAlert, Award } from 'lucide-react';

interface TaskCardProps {
  key?: string;
  task: Task;
  onCompleteTask: (taskId: string) => void;
  onToggleSubTask: (taskId: string, subTaskId: string) => void;
  onStartFocus: (task: Task, subTaskId?: string) => void;
}

export default function TaskCard({ task, onCompleteTask, onToggleSubTask, onStartFocus }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getSubjectStyles = (subject: string) => {
    switch (subject) {
      case '真理':
        return {
          bg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
          badge: 'bg-purple-600 text-white',
          accent: 'border-l-purple-500'
        };
      case '语文':
        return {
          bg: 'bg-red-500/10 border-red-500/30 text-red-400',
          badge: 'bg-red-500 text-white',
          accent: 'border-l-red-500'
        };
      case '数学':
        return {
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          badge: 'bg-blue-500 text-white',
          accent: 'border-l-blue-500'
        };
      case '英语':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
          badge: 'bg-amber-400 text-slate-900',
          accent: 'border-l-amber-400'
        };
      case '生活':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          badge: 'bg-emerald-600 text-white',
          accent: 'border-l-emerald-500'
        };
      case '其他':
      default:
        return {
          bg: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
          badge: 'bg-teal-600 text-white',
          accent: 'border-l-teal-500'
        };
    }
  };

  const getDifficultyStyles = (diff: string) => {
    switch (diff) {
      case '困难':
        return 'bg-red-950/40 text-red-400 border border-red-500/30';
      case '中等':
        return 'bg-amber-950/40 text-amber-400 border border-amber-500/30';
      case '简单':
      default:
        return 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30';
    }
  };

  const completedSubtasks = task.subTasks.filter(st => st.isCompleted).length;
  const totalSubtasks = task.subTasks.length;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
  const styles = getSubjectStyles(task.subject);

  return (
    <div 
      className={`relative rounded-xl border border-slate-700/60 bg-slate-850/85 backdrop-blur-md shadow-lg overflow-hidden transition-all duration-300 hover:border-slate-500/50 hover:shadow-cyan-500/5 border-l-4 ${styles.accent} ${task.isCompleted ? 'opacity-70 saturate-50' : ''}`}
    >
      {/* Top Tag */}
      <div className="absolute top-0 right-0">
        <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-bl-lg font-bold tracking-widest ${task.isCompleted ? 'bg-slate-700 text-slate-300' : 'bg-cyan-950 text-cyan-400 border-l border-b border-cyan-500/30'}`}>
          {task.isCompleted ? 'MISSION SECURED' : `PRIORITY ${task.priority}`}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        {/* Header Subject Label */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md shadow-sm ${styles.badge}`}>
            {task.subject}
          </span>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${getDifficultyStyles(task.difficulty)}`}>
            {task.difficulty}
          </span>
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1 ml-auto">
            <Target className="w-3.5 h-3.5 text-slate-500" />
            {task.estimatedTime} 分钟
          </span>
        </div>

        {/* Title */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className={`text-base font-bold text-slate-100 leading-snug flex items-center gap-2 ${task.isCompleted ? 'line-through text-slate-400' : ''}`}>
              {task.title}
              {task.priority === 'I' && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </h3>
            {task.notes && (
              <p className="text-xs text-slate-400 mt-1 italic font-sans">
                💡 备注: {task.notes}
              </p>
            )}
          </div>
        </div>

        {/* Coin Rewards */}
        <div className="flex items-center gap-4 mt-4 py-2 px-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-[11px] font-black text-slate-950 shadow-inner">🪙</div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-amber-300 font-mono">+{task.coinsReward}</span>
              <span className="text-[9px] text-slate-400">心愿币</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-4">
            <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-black text-white shadow-inner">🔋</div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-purple-300 font-mono">+{task.tacticalCoinsReward}</span>
              <span className="text-[9px] text-slate-400">战术币</span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <span className="text-xs font-mono text-slate-300">{completedSubtasks}/{totalSubtasks} 子任务</span>
            <button 
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="查看任务拆解步骤"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {totalSubtasks > 0 && (
          <div className="mt-3.5">
            <div className="flex justify-between items-center mb-1 text-[10px] font-mono">
              <span className="text-slate-400">特工突破进度</span>
              <span className="text-cyan-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/40">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Expanded Subtasks details */}
        {expanded && totalSubtasks > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
            <span className="text-xs font-bold text-slate-400 block mb-2 flex items-center gap-1 font-mono">
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />战术执行拆解计划:
            </span>
            {task.subTasks.map((sub, index) => (
              <div 
                key={sub.id} 
                className={`flex items-center gap-2.5 p-2 rounded-md border text-xs transition-all duration-200 ${sub.isCompleted ? 'bg-slate-900/30 border-slate-800/40 text-slate-500' : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700/60'}`}
              >
                <button
                  onClick={() => onToggleSubTask(task.id, sub.id)}
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${sub.isCompleted ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-slate-600 hover:border-cyan-500 bg-slate-950'}`}
                >
                  {sub.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                
                <span className={`flex-1 leading-normal ${sub.isCompleted ? 'line-through' : ''}`}>
                  <span className="font-mono text-cyan-500 font-bold mr-1.5">{index + 1}</span>
                  {sub.title}
                </span>

                <span className="text-[10px] font-mono text-slate-500">{sub.duration}min</span>

                {!sub.isCompleted && !task.isCompleted && (
                  <button
                    onClick={() => onStartFocus(task, sub.id)}
                    className="flex items-center gap-1 py-1 px-2 rounded bg-cyan-900/50 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 font-bold font-mono text-[10px] transition-all border border-cyan-500/30"
                    title="对该子步骤发起专注倒计时挑战"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    行动
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 pt-1">
          {!task.isCompleted ? (
            <>
              <button
                onClick={() => onStartFocus(task)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-slate-950 font-black text-xs shadow-md shadow-cyan-500/10 transition-all font-mono"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                开启全套专注挑战
              </button>
              
              <button
                onClick={() => onCompleteTask(task.id)}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 hover:text-white text-xs font-bold transition-all"
                title="标记此项大任务为已完成并收获奖励"
              >
                一键通关
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-center py-2 px-3 bg-slate-900/40 border border-emerald-950 text-emerald-400 text-xs font-black font-mono rounded-lg gap-1.5">
              <Check className="w-4 h-4 stroke-[3]" />
              MISSION COMPLETED (REWARDS SECURED)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
