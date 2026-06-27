import React, { useState, useEffect, useRef } from 'react';
import { Task, SubTask } from '../types';
import { FOCUS_SOUNDS, FocusSound } from '../data';
import { X, Play, Pause, Volume2, VolumeX, ArrowUpCircle, ArrowDownCircle, Info, Zap, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaskTimerProps {
  task: Task;
  subTaskId?: string;
  onClose: () => void;
  onFinish: (taskId: string, subTaskId: string | undefined, secondsSpent: number, successRate: number) => void;
}

export default function TaskTimer({ task, subTaskId, onClose, onFinish }: TaskTimerProps) {
  const subTask = subTaskId ? task.subTasks.find(st => st.id === subTaskId) : undefined;
  const initialDurationMinutes = subTask ? subTask.duration : task.estimatedTime;
  const initialSeconds = initialDurationMinutes * 60;

  // Timer states
  const [isCountdown, setIsCountdown] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  
  // Audio states
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeSound, setActiveSound] = useState<FocusSound>(FOCUS_SOUNDS[0]);

  // Web Audio API refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundNodeRef = useRef<AudioNode | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and tick
  useEffect(() => {
    if (!isPaused) {
      timerIntervalRef.current = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
        if (isCountdown) {
          setSecondsLeft(prev => {
            if (prev <= 1) {
              handleTimerComplete();
              return 0;
            }
            return prev - 1;
          });
        } else {
          setSecondsLeft(prev => prev + 1);
        }
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isPaused, isCountdown]);

  // Handle ambient audio synthesizers based on selected sound
  useEffect(() => {
    if (soundEnabled && !isPaused) {
      startAmbientSound();
    } else {
      stopAmbientSound();
    }
    return () => stopAmbientSound();
  }, [soundEnabled, activeSound, isPaused]);

  // Audio synthesis logic using browser Web Audio API
  const startAmbientSound = () => {
    try {
      stopAmbientSound();
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Create noise buffer
      const bufferSize = ctx.sampleRate * 2; // 2 seconds
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter to shape noise depending on sound type
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      if (activeSound.id === 'static') {
        // Radio Static: Bandpass filter to sound like radio frequencies
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.Q.setValueAtTime(1.5, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.04, ctx.currentTime); // Low volume
        
        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        whiteNoise.start();
        soundNodeRef.current = whiteNoise;
      } 
      else if (activeSound.id === 'rain') {
        // Rainstorm: Lowpass filter + slight periodic roar
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        whiteNoise.start();
        soundNodeRef.current = whiteNoise;
      } 
      else if (activeSound.id === 'fire') {
        // Campfire: Lowpass filtered noise + custom popping clicks
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.07, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        whiteNoise.start();

        // Create periodic crackle pop timer
        const crackleInterval = setInterval(() => {
          if (ctx.state === 'closed') return;
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(100 + Math.random() * 300, ctx.currentTime);
          oscGain.gain.setValueAtTime(0.02, ctx.currentTime);
          oscGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
          osc.connect(oscGain);
          oscGain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
        }, 400);

        soundNodeRef.current = {
          disconnect: () => {
            whiteNoise.disconnect();
            clearInterval(crackleInterval);
          }
        } as any;
      } 
      else if (activeSound.id === 'clock') {
        // Ticking Clock: No noise buffer, just periodic ticking pulses
        const tickingInterval = setInterval(() => {
          if (ctx.state === 'closed') return;
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(2000, ctx.currentTime);
          oscGain.gain.setValueAtTime(0.05, ctx.currentTime);
          oscGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
          osc.connect(oscGain);
          oscGain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.06);
        }, 1000);

        soundNodeRef.current = {
          disconnect: () => {
            clearInterval(tickingInterval);
          }
        } as any;
      } 
      else if (activeSound.id === 'lofi') {
        // Lofi Beats: Ambient hum + very slow chord pulse
        const lofiOsc = ctx.createOscillator();
        const lofiGain = ctx.createGain();
        lofiOsc.type = 'sine';
        lofiOsc.frequency.setValueAtTime(110, ctx.currentTime); // A2 base chord notes
        lofiGain.gain.setValueAtTime(0.06, ctx.currentTime);
        
        // Custom volume swell LFO
        let time = 0;
        const lfoInterval = setInterval(() => {
          if (ctx.state === 'closed') return;
          time += 0.2;
          const val = 0.03 + Math.sin(time) * 0.02;
          lofiGain.gain.setValueAtTime(val, ctx.currentTime);
        }, 200);

        lofiOsc.connect(lofiGain);
        lofiGain.connect(ctx.destination);
        lofiOsc.start();

        soundNodeRef.current = {
          disconnect: () => {
            lofiOsc.disconnect();
            clearInterval(lfoInterval);
          }
        } as any;
      }

    } catch (e) {
      console.warn("Web Audio API not allowed or supported yet:", e);
    }
  };

  const stopAmbientSound = () => {
    if (soundNodeRef.current) {
      try {
        soundNodeRef.current.disconnect();
      } catch (e) {}
      soundNodeRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimerComplete = () => {
    stopAmbientSound();
    setIsPaused(true);
    // Success rate is based on whether they finished the time or completed earlier
    onFinish(task.id, subTaskId, secondsElapsed, 100);
  };

  const handleEarlyComplete = () => {
    stopAmbientSound();
    setIsPaused(true);
    // Estimate spent time or raw countdown
    const spent = isCountdown ? (initialSeconds - secondsLeft) : secondsElapsed;
    const finalSpent = spent > 0 ? spent : 10; // minimum 10 seconds tracking
    onFinish(task.id, subTaskId, finalSpent, 100);
  };

  // Radial progress calculations
  const totalDurationSeconds = initialSeconds;
  const progressPercent = isCountdown 
    ? (secondsLeft / totalDurationSeconds) * 100 
    : Math.min((secondsElapsed / totalDurationSeconds) * 100, 100);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
      
      {/* Background Camo Grid Patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#022c22_1px,transparent_1px),linear-gradient(to_bottom,#022c22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
      
      <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 flex flex-col items-center overflow-hidden shadow-2xl shadow-emerald-950/20 z-10">
        
        {/* Radar sweeping visual accent */}
        <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full border border-emerald-500/20 bg-emerald-500/5 animate-pulse" />
        
        {/* Top bar */}
        <div className="w-full flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400">TACTICAL OPERATIONS</span>
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              任务进行中: {subTask ? subTask.title : task.title}
            </h2>
          </div>
          <button 
            onClick={() => {
              stopAmbientSound();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info panel (Screenshot elements) */}
        <div className="w-full bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between gap-2.5 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs text-slate-300 font-medium">特工状态: <strong className="text-emerald-400">专注特训中</strong></span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>预估时间: {initialDurationMinutes}分钟</span>
          </div>
        </div>

        {/* Timer Mode Toggle Button */}
        <div className="flex bg-slate-950/90 rounded-full p-1 border border-slate-800 mb-8 z-10">
          <button
            onClick={() => {
              setIsCountdown(true);
              setSecondsLeft(initialSeconds);
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isCountdown ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            倒计时
          </button>
          <button
            onClick={() => {
              setIsCountdown(false);
              setSecondsLeft(0);
              setSecondsElapsed(0);
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!isCountdown ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            正计时
          </button>
        </div>

        {/* RADIAL PROGRESS WHEEL */}
        <div className="relative flex items-center justify-center w-56 h-56 mb-8">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="112"
              cy="112"
              r={radius * 2}
              stroke="#1e293b"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Active glowing meter */}
            <circle
              cx="112"
              cy="112"
              r={radius * 2}
              stroke="url(#timerGradient)"
              strokeWidth="10"
              strokeDasharray={circumference * 2}
              strokeDashoffset={strokeDashoffset * 2}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-300"
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" /> {/* Emerald */}
                <stop offset="50%" stopColor="#06b6d4" /> {/* Cyan */}
                <stop offset="100%" stopColor="#6366f1" /> {/* Indigo */}
              </linearGradient>
            </defs>
          </svg>

          {/* Core Numerical display */}
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl sm:text-5xl font-mono font-black tracking-tight text-white drop-shadow-[0_4px_12px_rgba(16,185,129,0.3)]">
              {formatTime(isCountdown ? secondsLeft : secondsElapsed)}
            </span>
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold mt-1.5">
              {isPaused ? 'ACTIVE STANDBY' : 'ENGAGED'}
            </span>
          </div>
        </div>

        {/* Ambient audio selection panel */}
        <div className="w-full bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 mb-8">
          <div className="flex items-center justify-between mb-3 border-b border-slate-900 pb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              战术自噪白音 (屏蔽外部噪音)
            </span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${soundEnabled ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-slate-900'}`}
              title={soundEnabled ? '静音' : '播放自燥白音'}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  已启用
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  未启用
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FOCUS_SOUNDS.map((snd) => (
              <button
                key={snd.id}
                onClick={() => {
                  setActiveSound(snd);
                  if (!soundEnabled) setSoundEnabled(true);
                }}
                className={`flex items-center gap-1.5 p-2 rounded-lg border text-left transition-all ${activeSound.id === snd.id ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700/60'}`}
              >
                <span className="text-sm">{snd.emoji}</span>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold truncate">{snd.name}</span>
                  <span className="text-[8px] font-mono text-slate-500">{snd.frequency}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Audio Context activation tip */}
        {soundEnabled && isPaused && (
          <div className="text-[10px] text-amber-400 mb-3 text-center flex items-center gap-1 justify-center">
            <Info className="w-3 h-3 flex-shrink-0" />
            <span>注：点击“开始”按钮，白音将自动响起</span>
          </div>
        )}

        {/* CONTROLS */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm shadow-lg transition-all ${isPaused ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-emerald-500/10' : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/10'}`}
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4 fill-current" />
                开始特训
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 fill-current" />
                战术暂停
              </>
            )}
          </button>

          <button
            onClick={handleEarlyComplete}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 font-bold text-sm border border-slate-700 transition-all flex items-center gap-1.5 font-mono"
          >
            <Award className="w-4 h-4" />
            完成挑战
          </button>
        </div>

        {/* Interactive gamification quotes at bottom */}
        <div className="mt-6 text-[11px] text-slate-400 text-center italic border-t border-slate-800/60 pt-4 w-full flex items-center justify-center gap-1.5">
          🏆 提前完成且专注质量过关可以额外获得 <strong>战术勋章币</strong> 奖励！
        </div>

      </div>
    </div>
  );
}
