import React, { useState } from 'react';
import { Task, SubjectType, PriorityType, DifficultyType } from '../types';
import { TASK_TEMPLATES, getFormattedDate, getDynamicWeekDays } from '../data';
import { 
  Calendar, Plus, CheckCircle, Circle, Tag, Sparkles, 
  PlusCircle, ChevronLeft, ChevronRight, Compass, Trash2, Edit2, Save, X 
} from 'lucide-react';

interface WeeklyPlanProps {
  tasks: Task[];
  onAddTask: (newTask: Omit<Task, 'id' | 'actualTime' | 'isCompleted'>) => void;
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}

export default function WeeklyPlan({ tasks, onAddTask, onToggleComplete, onDeleteTask, onEditTask }: WeeklyPlanProps) {
  // Local state for the selected date (YYYY-MM-DD), default to today
  const [selectedDate, setSelectedDate] = useState<string>(getFormattedDate(0));
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Local state for the calendar panel navigation (dynamic current month/year)
  const todayObj = new Date();
  const [calYear, setCalYear] = useState(todayObj.getFullYear());
  const [calMonth, setCalMonth] = useState(todayObj.getMonth()); // 0-indexed month
  
  // New task form fields
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<SubjectType>('语文');
  const [priority, setPriority] = useState<PriorityType>('II');
  const [difficulty, setDifficulty] = useState<DifficultyType>('中等');
  const [estimatedTime, setEstimatedTime] = useState(30);
  const [notes, setNotes] = useState('');

  // Editing state fields
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState<SubjectType>('语文');
  const [editPriority, setEditPriority] = useState<PriorityType>('II');
  const [editDifficulty, setEditDifficulty] = useState<DifficultyType>('中等');
  const [editEstimatedTime, setEditEstimatedTime] = useState(30);
  const [editNotes, setEditNotes] = useState('');
  const [editCoinsReward, setEditCoinsReward] = useState(20);
  const [editTacticalCoinsReward, setEditTacticalCoinsReward] = useState(8);

  const startEditing = (t: Task) => {
    setEditingTaskId(t.id);
    setEditTitle(t.title);
    setEditSubject(t.subject);
    setEditPriority(t.priority);
    setEditDifficulty(t.difficulty);
    setEditEstimatedTime(t.estimatedTime);
    setEditNotes(t.notes || '');
    setEditCoinsReward(t.coinsReward);
    setEditTacticalCoinsReward(t.tacticalCoinsReward);
  };

  const handleSaveEdit = (taskId: string) => {
    const original = tasks.find(t => t.id === taskId);
    if (!original) return;
    
    // Automatically recalculate rewards if difficulty changed
    let goldRewards = editCoinsReward;
    let tacRewards = editTacticalCoinsReward;
    if (editDifficulty !== original.difficulty) {
      if (editDifficulty === '困难') { goldRewards = 10; tacRewards = 5; }
      else if (editDifficulty === '中等') { goldRewards = 7; tacRewards = 3; }
      else { goldRewards = 5; tacRewards = 2; }
    }

    const updated: Task = {
      ...original,
      title: editTitle,
      subject: editSubject,
      estimatedTime: Number(editEstimatedTime),
      priority: editPriority,
      difficulty: editDifficulty,
      notes: editNotes.trim() || undefined,
      coinsReward: goldRewards,
      tacticalCoinsReward: tacRewards,
    };
    
    onEditTask(updated);
    setEditingTaskId(null);
  };

  // Split selectedDate ("YYYY-MM-DD") safely to avoid JS timezone offset shifts
  const [selYear, selMonth1, selDay] = selectedDate.split('-').map(Number);
  const selMonth0 = selMonth1 - 1; // 0-indexed month
  const maxDaysInSelMonth = new Date(selYear, selMonth1, 0).getDate();

  // Dynamically generated Wednesday-to-Tuesday current week
  const daysOfWeek = getDynamicWeekDays();

  // Helper to dynamically get Chinese day names for custom select date
  const getChineseDayName = (dateStr: string) => {
    const matchingDay = daysOfWeek.find(d => d.date === dateStr);
    if (matchingDay) return matchingDay.name;
    
    try {
      const d = new Date(dateStr);
      const dayIndex = d.getDay(); // 0 (Sun) to 6 (Sat)
      const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return dayNames[dayIndex];
    } catch (e) {
      return '计划日';
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Default calculations for coins payouts
    let goldRewards = 5;
    let tacRewards = 2;
    if (difficulty === '困难') { goldRewards = 10; tacRewards = 5; }
    else if (difficulty === '中等') { goldRewards = 7; tacRewards = 3; }

    onAddTask({
      title,
      subject,
      priority,
      difficulty,
      estimatedTime: Number(estimatedTime),
      coinsReward: goldRewards,
      tacticalCoinsReward: tacRewards,
      date: selectedDate, // Schedules exactly on selected custom date
      notes: notes.trim() || undefined,
      subTasks: [
        { id: `sub-${Date.now()}-1`, title: '阅读/朗读/核心突破', duration: Math.ceil(estimatedTime * 0.4), isCompleted: false },
        { id: `sub-${Date.now()}-2`, title: '重难点突破与作答', duration: Math.ceil(estimatedTime * 0.4), isCompleted: false },
        { id: `sub-${Date.now()}-3`, title: '核对批改与回顾反思', duration: Math.ceil(estimatedTime * 0.2), isCompleted: false }
      ]
    });

    setTitle('');
    setNotes('');
    setShowAddForm(false);
  };

  const handleAddTemplate = (template: typeof TASK_TEMPLATES[0]) => {
    let goldRewards = 5;
    let tacRewards = 2;
    if (template.difficulty === '困难') { goldRewards = 10; tacRewards = 5; }
    else if (template.difficulty === '中等') { goldRewards = 7; tacRewards = 3; }

    onAddTask({
      title: template.title,
      subject: template.subject,
      priority: template.priority,
      difficulty: template.difficulty,
      estimatedTime: template.duration,
      coinsReward: goldRewards,
      tacticalCoinsReward: tacRewards,
      date: selectedDate, // Deploys template directly to selected date
      notes: '由战术训练模版一键分解创建',
      subTasks: template.subTasks.map((st, i) => ({
        id: `sub-${Date.now()}-${i}`,
        title: st.title,
        duration: st.duration,
        isCompleted: false
      }))
    });
  };

  const getSubjectColor = (subj: string) => {
    switch (subj) {
      case '真理': return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
      case '语文': return 'bg-red-500/10 border-red-500/30 text-red-400';
      case '数学': return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case '英语': return 'bg-amber-500/10 border-amber-500/30 text-amber-300';
      case '生活': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case '其他': default: return 'bg-teal-500/10 border-teal-500/30 text-teal-400';
    }
  };

  // --- CALENDAR GRID GENERATION ENGINE ---
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDayIndex = getFirstDayOfMonth(calYear, calMonth); // 0 (Sun) to 6 (Sat)

  // Shift Sunday (0) to index 6, Monday (1) to index 0
  let startOffset = firstDayIndex - 1;
  if (startOffset < 0) startOffset = 6;

  const calendarCells = [];

  // Previous month trailing cells
  const prevMonthYear = calMonth === 0 ? calYear - 1 : calYear;
  const prevMonth = calMonth === 0 ? 11 : calMonth - 1;
  const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);

  for (let i = startOffset - 1; i >= 0; i--) {
    calendarCells.push({
      day: daysInPrevMonth - i,
      month: prevMonth,
      year: prevMonthYear,
      isCurrentMonth: false,
    });
  }

  // Current month active cells
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({
      day: i,
      month: calMonth,
      year: calYear,
      isCurrentMonth: true,
    });
  }

  // Next month leading cells to complete 42 cells (6-week grid)
  const nextMonthYear = calMonth === 11 ? calYear + 1 : calYear;
  const nextMonth = calMonth === 11 ? 0 : calMonth + 1;
  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({
      day: i,
      month: nextMonth,
      year: nextMonthYear,
      isCurrentMonth: false,
    });
  }

  // Quick navigation year & month collections
  const years = Array.from({ length: 9 }, (_, i) => 2022 + i); // 2022 to 2030
  const months = [
    '一月', '二月', '三月', '四月', '五月', '六月', 
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(prev => prev - 1);
    } else {
      setCalMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(prev => prev + 1);
    } else {
      setCalMonth(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Week Quick Navigation Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h2 className="text-sm font-bold text-slate-200">特工战术周视图计划 (快捷导航)</h2>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1 rounded-full font-bold">
            {daysOfWeek[0]?.label} - {daysOfWeek[6]?.label} 战役
          </span>
        </div>

        {/* Days grid row selection */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
          {daysOfWeek.map((day) => {
            const dayTasks = tasks.filter(t => t.date === day.date);
            const total = dayTasks.length;
            const completed = dayTasks.filter(t => t.isCompleted).length;
            const isSelected = selectedDate === day.date;
            const isToday = day.date === getFormattedDate(0); // dynamic today

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => {
                  setSelectedDate(day.date);
                  setShowAddForm(false);
                }}
                className={`relative flex flex-col items-center p-2.5 rounded-xl border transition-all duration-300
                  ${isSelected 
                    ? 'bg-gradient-to-b from-cyan-50 to-sky-100 border-cyan-500 shadow-md text-cyan-950 scale-102 font-bold' 
                    : isToday 
                    ? 'bg-blue-50/70 border-blue-200 text-blue-900 hover:border-blue-300' 
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'}`}
              >
                {isToday && (
                  <span className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 bg-amber-500 text-slate-950 font-black text-[8px] px-1.5 rounded-full uppercase scale-90 tracking-wide shadow-sm">
                    今日
                  </span>
                )}
                
                <span className={`text-[10px] font-bold ${isSelected ? 'text-cyan-700' : 'text-slate-400'}`}>
                  {day.name}
                </span>
                
                <span className={`text-xs font-bold font-mono mt-0.5 ${isSelected ? 'text-cyan-900 font-extrabold' : 'text-slate-700'}`}>
                  {day.label}
                </span>

                {/* Progress indicator */}
                <div className="flex items-center gap-0.5 mt-2">
                  {total === 0 ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  ) : total === completed ? (
                    <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] font-black text-white shadow-sm">✓</span>
                  ) : (
                    <span className="text-[9px] font-bold font-mono text-cyan-600 bg-cyan-50 px-1 rounded-sm">
                      {completed}/{total}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Workstation Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Active Day Task Details */}
        <div id="active-day-tasks-card" className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex flex-col min-h-[500px] shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-black tracking-widest">TACTICAL PLANNER</span>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
                {getChineseDayName(selectedDate)} ({selectedDate}) 任务计划
              </h3>
            </div>
            
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/40 hover:bg-cyan-500 hover:text-slate-950 font-bold text-xs transition-all font-mono shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              追加任务
            </button>
          </div>

          {/* New Task Add Form */}
          {showAddForm && (
            <form onSubmit={handleCreateTask} className="mb-4 p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">任务名称 (任务目标)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="例如：课文朗读、数学习题、巩固复习"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">训练科目</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as SubjectType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="真理">真理</option>
                    <option value="语文">语文</option>
                    <option value="数学">数学</option>
                    <option value="英语">英语</option>
                    <option value="生活">生活</option>
                    <option value="其他">其他</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">预估耗时 (分钟)</label>
                  <input
                    type="number"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(Number(e.target.value))}
                    min="1"
                    max="180"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">战术优先级</label>
                  <div className="flex gap-1.5">
                    {['I', 'II', 'III'].map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setPriority(p as PriorityType)}
                        className={`flex-1 py-1 px-2.5 rounded-md border text-xs font-bold font-mono transition-all ${priority === p ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">挑战难度</label>
                  <div className="flex gap-1.5">
                    {['简单', '中等', '困难'].map((d) => (
                      <button
                        type="button"
                        key={d}
                        onClick={() => setDifficulty(d as DifficultyType)}
                        className={`flex-1 py-1 px-2 rounded-md border text-xs font-bold transition-all ${difficulty === d ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">备注说明</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="可在此添加任务具体要求 (选填)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-black text-xs rounded-lg shadow-md hover:shadow-cyan-500/10 transition-all"
                >
                  确立任务目标
                </button>
              </div>
            </form>
          )}

          {/* Tasks List Grid for selected date */}
          <div className="flex-1 space-y-2.5">
            {tasks.filter(t => t.date === selectedDate).length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50">
                <span className="text-3xl animate-bounce">📡</span>
                <p className="text-slate-600 text-xs font-bold mt-3">该指定日期暂无任何战术任务</p>
                <p className="text-[10px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                  您可以点击右上角的“追加任务”自定义添加，或者在右侧“星际时空历”中选择任意年月日，随后从下方模板库部署任务。
                </p>
              </div>
            ) : (
              tasks.filter(t => t.date === selectedDate).map((t) => (
                editingTaskId === t.id ? (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl border border-cyan-400 bg-slate-900 text-slate-100 transition-all shadow-md space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                      <span className="text-[10px] font-mono font-bold text-cyan-400">正在修改战术任务</span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(t.id)}
                          className="p-1 px-2 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/60 text-cyan-400 font-bold text-[10px] flex items-center gap-1"
                          title="保存修改"
                        >
                          <Save className="w-3 h-3" />
                          保存
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTaskId(null)}
                          className="p-1 px-2 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 font-bold text-[10px] flex items-center gap-1"
                          title="取消编辑"
                        >
                          <X className="w-3 h-3" />
                          取消
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[9px] font-mono font-bold text-slate-400 block mb-0.5">任务目标</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-bold"
                          placeholder="任务名称"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-mono font-bold text-slate-400 block mb-0.5">科目类型</label>
                          <select
                            value={editSubject}
                            onChange={(e) => setEditSubject(e.target.value as SubjectType)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                          >
                            <option value="真理">真理</option>
                            <option value="语文">语文</option>
                            <option value="数学">数学</option>
                            <option value="英语">英语</option>
                            <option value="生活">生活</option>
                            <option value="其他">其他</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] font-mono font-bold text-slate-400 block mb-0.5">预估时间 (分)</label>
                          <input
                            type="number"
                            value={editEstimatedTime}
                            onChange={(e) => setEditEstimatedTime(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-mono font-bold text-slate-400 block mb-0.5">任务优先级</label>
                          <select
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value as PriorityType)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                          >
                            <option value="I">I (高)</option>
                            <option value="II">II (中)</option>
                            <option value="III">III (低)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] font-mono font-bold text-slate-400 block mb-0.5">挑战难度 (影响奖励)</label>
                          <select
                            value={editDifficulty}
                            onChange={(e) => setEditDifficulty(e.target.value as DifficultyType)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                          >
                            <option value="简单">简单</option>
                            <option value="中等">中等</option>
                            <option value="困难">困难</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-mono font-bold text-slate-400 block mb-0.5">备注要求</label>
                        <input
                          type="text"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                          placeholder="补充说明"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={t.id}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-sm ${t.isCompleted ? 'opacity-65 bg-slate-50/50' : ''}`}
                  >
                    {/* Status Checkbox */}
                    <button
                      onClick={() => onToggleComplete(t.id)}
                      className="flex-shrink-0 text-slate-400 hover:text-cyan-600 transition-all"
                      type="button"
                      title={t.isCompleted ? '标记未完成' : '极速标记通关此任务'}
                    >
                      {t.isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-500/10 stroke-[2.5]" />
                      ) : (
                        <Circle className="w-5 h-5 hover:scale-105 stroke-[2]" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${getSubjectColor(t.subject)}`}>
                          {t.subject}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">{t.estimatedTime}分钟 | 优先级 {t.priority}</span>
                      </div>
                      <h4 className={`text-xs font-bold text-slate-800 truncate ${t.isCompleted ? 'line-through text-slate-400 font-medium' : ''}`}>
                        {t.title}
                      </h4>
                      {t.notes && (
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{t.notes}</p>
                      )}
                    </div>

                    {/* Coin displays */}
                    <div className="flex-shrink-0 flex items-center gap-2 bg-slate-50 py-1.5 px-2 rounded-lg border border-slate-100">
                      <span className="text-xs font-bold text-amber-600 font-mono flex items-center gap-0.5">
                        🪙{t.coinsReward}
                      </span>
                      <span className="text-xs font-bold text-purple-600 font-mono flex items-center gap-0.5">
                        🔋{t.tacticalCoinsReward}
                      </span>
                    </div>

                    {/* Actions Group */}
                    <div className="flex items-center gap-1.5 ml-1">
                      <button
                        onClick={() => startEditing(t)}
                        type="button"
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-cyan-600 border border-slate-100 hover:border-slate-200 transition-all shadow-sm"
                        title="编辑任务目标"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(t.id)}
                        type="button"
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-500 border border-slate-100 hover:border-red-100 transition-all shadow-sm"
                        title="彻底删除此任务"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Perpetual Calendar & Templates Stack */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* CARD A: INTERACTIVE SPACE-TIME PERPETUAL CALENDAR */}
          <div id="perpetual-calendar-card" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                <h3 className="text-sm font-bold text-slate-200">特工星历：自由日期排程</h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded-md">
                AD 2020-2030
              </span>
            </div>

            {/* Free Date Selector Dropdowns Row */}
            <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 space-y-2.5 mb-4">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider">
                ⏱️ 星历自由时空调谐 (可任意选择年月日)
              </label>
              
              <div className="grid grid-cols-3 gap-2">
                {/* Year Dropdown Selection */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-400 font-bold">年份</span>
                  <select
                    value={selYear}
                    onChange={(e) => {
                      const newY = Number(e.target.value);
                      const daysInNewMonth = new Date(newY, selMonth1, 0).getDate();
                      const newD = Math.min(selDay, daysInNewMonth);
                      const newDateStr = `${newY}-${String(selMonth1).padStart(2, '0')}-${String(newD).padStart(2, '0')}`;
                      setSelectedDate(newDateStr);
                      setCalYear(newY);
                    }}
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold px-2 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500 font-mono shadow-sm"
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y} 年</option>
                    ))}
                  </select>
                </div>

                {/* Month Dropdown Selection */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-400 font-bold">月份</span>
                  <select
                    value={selMonth0}
                    onChange={(e) => {
                      const newM0 = Number(e.target.value);
                      const newM1 = newM0 + 1;
                      const daysInNewMonth = new Date(selYear, newM1, 0).getDate();
                      const newD = Math.min(selDay, daysInNewMonth);
                      const newDateStr = `${selYear}-${String(newM1).padStart(2, '0')}-${String(newD).padStart(2, '0')}`;
                      setSelectedDate(newDateStr);
                      setCalMonth(newM0);
                    }}
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold px-2 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500 shadow-sm"
                  >
                    {months.map((m, idx) => (
                      <option key={idx} value={idx}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Day Dropdown Selection */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-400 font-bold">日期</span>
                  <select
                    value={selDay}
                    onChange={(e) => {
                      const newD = Number(e.target.value);
                      const newDateStr = `${selYear}-${String(selMonth1).padStart(2, '0')}-${String(newD).padStart(2, '0')}`;
                      setSelectedDate(newDateStr);
                    }}
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold px-2 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500 font-mono shadow-sm"
                  >
                    {Array.from({ length: maxDaysInSelMonth }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>{day} 日</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Standard HTML5 Date Input & Month quick-shifter */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/40">
                <input
                  type="date"
                  value={selectedDate}
                  min="2020-01-01"
                  max="2030-12-31"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      setSelectedDate(val);
                      const [y, m1] = val.split('-').map(Number);
                      setCalYear(y);
                      setCalMonth(m1 - 1);
                    }
                  }}
                  className="bg-white border border-slate-200 text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-lg focus:outline-none focus:border-cyan-500 font-mono shadow-sm cursor-pointer flex-1"
                />

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-sm"
                    title="上个月"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono font-bold text-slate-400 px-1">
                    {calYear}年{calMonth + 1}月
                  </span>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-sm"
                    title="下个月"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid Header: Weekdays (Monday first) */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              <span>一</span>
              <span>二</span>
              <span>三</span>
              <span>四</span>
              <span>五</span>
              <span className="text-cyan-600">六</span>
              <span className="text-cyan-600">日</span>
            </div>

            {/* Days cells layout */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {calendarCells.map((cell, cidx) => {
                if (!cell.isCurrentMonth) {
                  return (
                    <div key={cidx} className="h-9" />
                  );
                }
                const cellDateStr = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
                const isSelected = selectedDate === cellDateStr;
                const isToday = cellDateStr === '2026-07-01'; // system baseline date
                const cellTasks = tasks.filter(t => t.date === cellDateStr);
                const hasTasks = cellTasks.length > 0;
                const allCompleted = hasTasks && cellTasks.every(t => t.isCompleted);

                return (
                  <button
                    key={cidx}
                    type="button"
                    onClick={() => {
                      setSelectedDate(cellDateStr);
                      // Align calendar view if they clicked on neighboring month trailing cells
                      if (cell.year !== calYear) setCalYear(cell.year);
                      if (cell.month !== calMonth) setCalMonth(cell.month);
                    }}
                    className={`relative flex flex-col items-center justify-center p-1 h-9 rounded-lg transition-all border text-xs font-bold
                      ${isSelected
                        ? 'bg-gradient-to-b from-cyan-500 to-indigo-600 text-white border-cyan-500 shadow-md scale-102 z-10'
                        : isToday
                        ? 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                        : 'text-slate-700 hover:bg-slate-50 hover:border-slate-300 bg-white border-slate-100'}`}
                  >
                    <span>{cell.day}</span>
                    
                    {/* Status dot in cell */}
                    <div className="absolute bottom-1 flex gap-0.5 justify-center">
                      {isToday && (
                        <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-500'}`} title="今日" />
                      )}
                      {hasTasks && (
                        <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : allCompleted ? 'bg-emerald-500' : 'bg-cyan-500'}`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend and helper info */}
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />
                <span>有未完任务</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>任务已通关</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                <span>基准今日</span>
              </div>
            </div>
          </div>

          {/* CARD B: TACTICAL MICRO-LECTURE TEMPLATES */}
          <div id="templates-card" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3 mb-3">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-200">一键部署！战术微课模板库</h3>
            </div>
            
            <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
              💡 <strong>微步骤拆解方案</strong>：极简分解法能将大目标切片为 3 个 5-15 分钟的微型子任务。选择上方任何日期后，点击部署一键导入！
            </p>

            <div className="space-y-3">
              {TASK_TEMPLATES.map((tmpl, idx) => (
                <div
                  key={idx}
                  className="group relative border border-slate-200 bg-white rounded-xl p-3 hover:border-cyan-400 hover:shadow-sm transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded mr-1.5 ${getSubjectColor(tmpl.subject)}`}>
                        {tmpl.subject}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-400">{tmpl.duration}分钟 | {tmpl.difficulty}</span>
                      <h4 className="text-xs font-bold text-slate-800 mt-1 font-sans">{tmpl.title}</h4>
                    </div>
                    
                    <button
                      onClick={() => handleAddTemplate(tmpl)}
                      type="button"
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 font-black text-[10px] transition-all border border-cyan-800/40 shadow-sm"
                      title={`部署至 ${selectedDate}`}
                    >
                      <PlusCircle className="w-3 h-3" />
                      部署
                    </button>
                  </div>

                  {/* Subtask micro-steps list preview */}
                  {tmpl.subTasks && tmpl.subTasks.length > 0 && (
                    <div className="mt-2 space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {tmpl.subTasks.map((st, sidx) => (
                        <div key={sidx} className="flex items-center justify-between text-[9px] text-slate-500">
                          <span className="truncate">
                            <strong className="text-cyan-600 font-mono mr-1">{sidx + 1}</strong>
                            {st.title}
                          </span>
                          <span className="text-slate-400 font-mono ml-1.5 flex-shrink-0">{st.duration}分钟</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
