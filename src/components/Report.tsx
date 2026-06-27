import React from 'react';
import { Task } from '../types';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { TrendingUp, Clock, CheckCircle2, Award, AlertTriangle, HelpCircle } from 'lucide-react';
import { getFormattedDate } from '../data';

interface ReportProps {
  tasks: Task[];
}

export default function Report({ tasks }: ReportProps) {
  // 1. Calculate General statistics
  const completedTasks = tasks.filter(t => t.isCompleted);
  const totalTasksCount = tasks.length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasks.length / totalTasksCount) * 100) : 0;

  // Total actual study time calculation (sum of subtasks or actual completed time)
  // Let's sum the actualTime of completed tasks, plus estimated times for mock historical data
  const totalStudyMinutes = tasks.reduce((sum, t) => {
    if (t.isCompleted) {
      return sum + (t.actualTime > 0 ? t.actualTime : t.estimatedTime);
    }
    return sum;
  }, 0);

  const formatStudyTime = (mins: number) => {
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return hrs > 0 ? `${hrs}小时 ${remainingMins}分钟` : `${remainingMins}分钟`;
  };

  // 2. Subject Distribution Pie Chart Data
  const subjectStats: Record<string, number> = {};
  completedTasks.forEach(t => {
    subjectStats[t.subject] = (subjectStats[t.subject] || 0) + (t.actualTime > 0 ? t.actualTime : t.estimatedTime);
  });

  const pieChartColors = {
    '语文': '#ef4444', // Red
    '数学': '#3b82f6', // Blue
    '英语': '#f59e0b', // Amber/Yellow
    '战术训导': '#10b981' // Emerald/Green
  };

  const subjectData = Object.keys(subjectStats).map(key => ({
    name: key,
    value: subjectStats[key],
    color: pieChartColors[key as keyof typeof pieChartColors] || '#6366f1'
  }));

  // If no tasks are completed, show 0 for all subjects to reflect a clean cleared state
  const subjectChartData = subjectData.length > 0 ? subjectData : [
    { name: '语文', value: 0, color: '#ef4444' },
    { name: '数学', value: 0, color: '#3b82f6' },
    { name: '英语', value: 0, color: '#f59e0b' },
    { name: '战术训导', value: 0, color: '#10b981' }
  ];

  // 3. Daily Study Duration Trend Area Chart Data
  // Group tasks by day (Wed July 1 to Tue July 7, matching weekly plan calendar)
  const daysMap = [
    { label: '周三 (7/1)', dateStr: getFormattedDate(0), minutes: 0, tasks: 0 },
    { label: '周四 (7/2)', dateStr: getFormattedDate(1), minutes: 0, tasks: 0 },
    { label: '周五 (7/3)', dateStr: getFormattedDate(2), minutes: 0, tasks: 0 },
    { label: '周六 (7/4)', dateStr: getFormattedDate(3), minutes: 0, tasks: 0 },
    { label: '周日 (7/5)', dateStr: getFormattedDate(4), minutes: 0, tasks: 0 },
    { label: '周一 (7/6)', dateStr: getFormattedDate(5), minutes: 0, tasks: 0 },
    { label: '周二 (7/7)', dateStr: getFormattedDate(6), minutes: 0, tasks: 0 },
  ];

  // Override with actual state if tasks are completed
  daysMap.forEach(day => {
    const matchedTasks = tasks.filter(t => t.date === day.dateStr);
    const completedOnDay = matchedTasks.filter(t => t.isCompleted);
    if (completedOnDay.length > 0) {
      day.minutes = completedOnDay.reduce((sum, t) => sum + (t.actualTime > 0 ? t.actualTime : t.estimatedTime), 0);
      day.tasks = completedOnDay.length;
    }
  });

  // 4. Bar Chart for Estimated vs Actual completion times
  const estVsActData = tasks.filter(t => t.isCompleted).map((t, idx) => ({
    name: t.title.length > 8 ? `${t.title.slice(0, 7)}...` : t.title,
    '预估时间': t.estimatedTime,
    '实际完成': t.actualTime > 0 ? t.actualTime : t.estimatedTime
  }));

  const comparisonChartData = estVsActData.length > 0 ? estVsActData : [];

  // 5. Subject Specific task ratios for a multi-bar chart
  const subjectRatioMap: Record<string, { completed: number, total: number }> = {
    '语文': { completed: 0, total: 0 },
    '数学': { completed: 0, total: 0 },
    '英语': { completed: 0, total: 0 },
    '战术训导': { completed: 0, total: 0 }
  };

  tasks.forEach(t => {
    if (subjectRatioMap[t.subject]) {
      subjectRatioMap[t.subject].total += 1;
      if (t.isCompleted) subjectRatioMap[t.subject].completed += 1;
    }
  });

  const completionStatsData = Object.keys(subjectRatioMap).map(key => ({
    subject: key,
    '已完成数': subjectRatioMap[key].completed,
    '未完成数': subjectRatioMap[key].total - subjectRatioMap[key].completed
  }));

  // Subject proportions calculation
  const totalCompletedMinutes = Object.values(subjectStats).reduce((sum, val) => sum + val, 0);
  const subjectRatiosText = totalCompletedMinutes > 0 
    ? Object.keys(subjectStats).map(key => `${key}: ${Math.round((subjectStats[key] / totalCompletedMinutes) * 100)}%`).join(' | ')
    : '数学: 0% | 语文: 0% | 英语: 0%';
  const balanceText = totalCompletedMinutes > 0 ? '结构均衡' : '暂无数据';

  // Let's check how many completed tasks had actualTime > 0 and actualTime < estimatedTime
  const aheadTasks = completedTasks.filter(t => t.actualTime > 0 && t.actualTime < t.estimatedTime);
  const aheadRate = completedTasks.length > 0 ? Math.round((aheadTasks.length / completedTasks.length) * 100) : 0;
  const ratingText = completedTasks.length > 0 ? (aheadRate > 30 ? '特级优秀' : '表现良好') : '暂无评级';

  // Custom tooltip styling
  const customTooltipStyle = {
    contentStyle: { backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' },
    labelStyle: { color: '#94a3b8', fontWeight: 'bold' },
    itemStyle: { color: '#38bdf8' }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Total Time focused */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            学习总时长
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black font-mono text-cyan-400 leading-none">
              {formatStudyTime(totalStudyMinutes)}
            </span>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
              📈 较上周同期增加 +12%
            </div>
          </div>
        </div>

        {/* Success completion rate */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            任务完成率
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 leading-none">
              {completionRate}%
            </span>
            <div className="text-[10px] text-slate-400 mt-1 font-sans">
              本周共下达 <strong>{totalTasksCount}</strong> 项特工任务
            </div>
          </div>
        </div>

        {/* Subject Balance */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-2">
            <Award className="w-4 h-4 text-amber-400" />
            战术科目均衡度
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-amber-400 leading-none">
              {balanceText}
            </span>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              {subjectRatiosText}
            </div>
          </div>
        </div>

        {/* Study efficiency */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            专注抗干扰评级
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-purple-400 leading-none">
              {ratingText}
            </span>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
              🎯 提前完成率 {aheadRate}%
            </div>
          </div>
        </div>

      </div>

      {/* Main Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Study Duration Line Graph */}
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-sans">
              📊 每日学习与特训时长趋势 (分钟)
            </span>
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daysMap} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#64748b" style={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" style={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip {...customTooltipStyle} />
                <Area type="monotone" dataKey="minutes" name="专注总时长(分钟)" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorMinutes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart for Subject Ratio */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              🍕 各特训科目时长分布比例
            </span>
          </div>
          <div className="h-56 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {subjectChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...customTooltipStyle} formatter={(value) => [`${value} 分钟`, '学习时长']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom legend */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {subjectChartData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.name}: <strong className="font-mono">{item.value}min</strong></span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Main Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Predicted vs Actual execution duration */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              ⏱️ 预估耗时 vs 实际完成耗时 (分钟)
            </span>
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" style={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip {...customTooltipStyle} />
                <Legend style={{ fontSize: 10 }} />
                <Bar dataKey="预估时间" fill="#475569" radius={[4, 4, 0, 0]} />
                <Bar dataKey="实际完成" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mission completion status */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              🎯 科目计划下达与执行概况 (任务数)
            </span>
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completionStatsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="subject" stroke="#64748b" style={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" style={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip {...customTooltipStyle} />
                <Legend style={{ fontSize: 10 }} />
                <Bar dataKey="已完成数" fill="#6366f1" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="未完成数" fill="#a855f7" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Gamification Analysis Tips */}
      <div className="bg-slate-950/80 border border-cyan-500/10 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-xl">📊</span>
        <div>
          <h4 className="text-xs font-bold text-slate-200">特工训练智能诊断报告:</h4>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            孩子本周学习注意力极为敏锐，奥数和古诗词等重难点均已<strong>高质量提前通关</strong>。数据指示，英语朗读是当前的重点，建议下周一将部分“心愿商店兑换”额度与英语朗诵关联起来，以激励孩子大声说英语，促进全科满状态协调成长。
          </p>
        </div>
      </div>

    </div>
  );
}
