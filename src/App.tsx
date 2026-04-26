import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  CheckCircle2, 
  Minus, 
  Plus, 
  LineChart, 
  History, 
  Settings2,
  Undo2,
  Play,
  Pause,
  Forward,
  Coffee,
  Download
} from 'lucide-react';
import { useWorkoutTimer } from './hooks/useWorkoutTimer';
import { LEVELS, LevelId, WorkoutHistoryItem } from './types';
import { loadHistory, saveWorkout } from './lib/storage';

type Screen = 'setup' | 'workout' | 'stats';

export default function App() {
  const [screen, setScreen] = useState<Screen>('setup');
  const [levelId, setLevelId] = useState<LevelId>('beginner');
  const [strengthRounds, setStrengthRounds] = useState(2);
  const [shaolinRounds, setShaolinRounds] = useState(2);
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const timer = useWorkoutTimer();

  useEffect(() => {
    setHistory(loadHistory());

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const handleStartWorkout = () => {
    timer.startWorkout(LEVELS[levelId], strengthRounds, shaolinRounds);
    setScreen('workout');
  };

  // When timer completes, save workout history
  useEffect(() => {
    if (timer.isCompleted && timer.phase === 'done' && !timer.isRunning) {
      const newHistory = saveWorkout(LEVELS[levelId].name, strengthRounds, shaolinRounds);
      setHistory(newHistory);
    }
  }, [timer.isCompleted, timer.phase, timer.isRunning, levelId, strengthRounds, shaolinRounds]);

  const switchScreen = (sc: Screen) => {
    if (screen === 'workout' && timer.isRunning) {
       timer.togglePlayPause();
    }
    setScreen(sc);
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto sm:border-x sm:border-neutral-800 shadow-2xl relative select-none bg-[#0a0a0a] text-[#f5f5f5]">
      
      {/* SETUP SCREEN */}
      {screen === 'setup' && (
        <div className="flex flex-col h-full w-full absolute inset-0 z-10 bg-[#0a0a0a]">
          <header className="p-6 pt-10 text-center border-b border-neutral-900 bg-neutral-900/50 flex-shrink-0">
            <Dumbbell className="w-8 h-8 mx-auto mb-3 text-blue-500" />
            <h1 className="text-2xl font-bold uppercase tracking-tight">Параметры</h1>
          </header>

          <div className="flex-1 p-6 space-y-6 overflow-y-auto pb-24">
            
            {deferredPrompt && (
              <div className="bg-blue-900/20 border border-blue-500/50 rounded-xl p-4 flex flex-col items-center text-center shadow-lg animate-pulse">
                <Download className="w-6 h-6 text-blue-400 mb-2" />
                <h3 className="font-bold text-white mb-1">Установить приложение</h3>
                <p className="text-xs text-neutral-400 mb-4">Добавь таймер на главный экран телефона для работы без интернета.</p>
                <button 
                  onClick={handleInstallClick} 
                  className="w-full bg-blue-600 py-3 rounded-lg text-sm font-bold uppercase transition-transform active:scale-95 hover:bg-blue-500">
                  Установить
                </button>
              </div>
            )}

            <div className="space-y-3">
              <h2 className="text-xs uppercase tracking-widest text-neutral-500 font-bold">1. Сложность</h2>
              
              {(Object.keys(LEVELS) as LevelId[]).map((lvl) => {
                const isSel = levelId === lvl;
                const levelConfig = LEVELS[lvl];
                return (
                  <div 
                    key={lvl}
                    onClick={() => setLevelId(lvl)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-colors ${isSel ? 'border-blue-500 bg-blue-900/20' : 'border-neutral-800 bg-neutral-900'}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h3 className={`font-bold ${isSel ? 'text-blue-400' : 'text-white'}`}>{levelConfig.name}</h3>
                      {isSel && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] text-center font-mono mt-2 opacity-80">
                      <div>Р: {levelConfig.t.w.w}/{levelConfig.t.w.r}с</div>
                      <div>С: {levelConfig.t.s.w}/{levelConfig.t.s.r}с</div>
                      <div>Ш: {levelConfig.t.sh.w}/{levelConfig.t.sh.r}с</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              <h2 className="text-xs uppercase tracking-widest text-neutral-500 font-bold">2. Объем работы</h2>
              
              <div className="flex items-center justify-between p-4 bg-neutral-900 rounded-xl border border-neutral-800">
                <div>
                  <span className="block font-bold text-white">Силовой блок</span>
                  <span className="text-xs text-neutral-400">Кругов</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button onClick={() => setStrengthRounds(r => Math.max(1, r - 1))} className="w-10 h-10 rounded bg-neutral-800 active:bg-neutral-700 flex items-center justify-center"><Minus className="w-4 h-4"/></button>
                  <span className="text-xl font-mono font-bold w-6 text-center">{strengthRounds}</span>
                  <button onClick={() => setStrengthRounds(r => Math.min(5, r + 1))} className="w-10 h-10 rounded bg-neutral-800 active:bg-neutral-700 flex items-center justify-center"><Plus className="w-4 h-4"/></button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-neutral-900 rounded-xl border border-neutral-800">
                <div>
                  <span className="block font-bold text-white">Шаолинь блок</span>
                  <span className="text-xs text-neutral-400">Кругов</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button onClick={() => setShaolinRounds(r => Math.max(1, r - 1))} className="w-10 h-10 rounded bg-neutral-800 active:bg-neutral-700 flex items-center justify-center"><Minus className="w-4 h-4"/></button>
                  <span className="text-xl font-mono font-bold w-6 text-center">{shaolinRounds}</span>
                  <button onClick={() => setShaolinRounds(r => Math.min(5, r + 1))} className="w-10 h-10 rounded bg-neutral-800 active:bg-neutral-700 flex items-center justify-center"><Plus className="w-4 h-4"/></button>
                </div>
              </div>
            </div>

            <button 
              onClick={handleStartWorkout} 
              className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold uppercase tracking-widest shadow-lg active:bg-blue-700 transition hover:bg-blue-500"
            >
              Начать тренировку
            </button>
          </div>
        </div>
      )}

      {/* WORKOUT SCREEN */}
      {screen === 'workout' && (
        <div className="flex flex-col h-full w-full absolute inset-0 z-20 bg-[#0a0a0a]">
          <header className="p-4 pt-10 border-b border-neutral-800 flex justify-between items-center bg-neutral-900 flex-shrink-0">
            <button onClick={() => switchScreen('setup')} className="text-xs text-blue-400 uppercase tracking-wider py-2 font-semibold">
              Прервать
            </button>
            <div className="text-sm font-mono text-neutral-300 bg-neutral-800 px-2 py-1 rounded">
              {timer.curIdx + 1}/{timer.plan.length || 0}
            </div>
          </header>

          <div className="w-full h-1.5 bg-neutral-800 flex-shrink-0">
            <div 
              className="h-full bg-blue-500 transition-all duration-1000 ease-linear" 
              style={{ width: `${((timer.curIdx) / (timer.plan.length || 1)) * 100}%` }}
            ></div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-hidden w-full relative">
            
            {timer.phase !== 'done' && timer.currentExercise ? (
              <div className="w-full flex flex-col items-center justify-center fade-in">
                <div className="w-full mb-6">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">{timer.currentExercise.block}</span>
                    <span className="text-xs bg-blue-900/50 text-blue-400 px-2 py-0.5 rounded font-mono">{timer.currentExercise.info}</span>
                  </div>
                  <h2 className="text-2xl font-bold leading-tight min-h-[60px] flex items-center justify-center px-4 w-full break-words">
                    {timer.currentExercise.title}
                  </h2>
                </div>

                <div className={`transition-colors duration-500 relative w-64 h-64 rounded-full border-4 flex flex-col items-center justify-center shadow-2xl 
                  ${timer.phase === 'prepare' ? 'bg-[#1e3a8a] border-blue-500 text-blue-100' : 
                    timer.phase === 'work' ? 'bg-[#7f1d1d] border-red-500 text-red-100' : 
                    (timer.phase === 'rest' && timer.currentExercise.r >= 60) ? 'bg-[#312e81] border-indigo-500 text-indigo-100' : 
                    'bg-[#14532d] border-green-500 text-green-100'}`}>
                  
                  {timer.phase === 'rest' && timer.currentExercise.r >= 60 && (
                    <Coffee className="w-6 h-6 mb-2 opacity-50" />
                  )}
                  
                  <span className="text-sm font-bold tracking-widest opacity-80 mb-1">
                    {timer.phase === 'prepare' ? 'ГОТОВНОСТЬ' : 
                     timer.phase === 'work' ? 'РАБОТА' : 
                     (timer.phase === 'rest' && timer.currentExercise.r >= 60) ? 'МЕЖДУ КРУГАМИ' : 'ОТДЫХ'}
                  </span>
                  
                  <span className="text-7xl font-mono font-bold tabular-nums tracking-tighter">
                    {Math.floor(timer.timeLeft / 60).toString().padStart(2, '0')}:{(timer.timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="h-12 flex items-center justify-center text-sm text-neutral-400 w-full mt-6 px-4">
                  {timer.phase === 'rest' && timer.nextExercise && (
                    <p className="truncate">Далее: <span className="text-white font-medium">{timer.nextExercise.title}</span></p>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center space-y-4 px-4 fade-in">
                <CheckCircle2 className="text-green-500 w-20 h-20 mb-4" />
                <h2 className="text-3xl font-bold uppercase">Выполнено</h2>
                <p className="text-neutral-400">Данные сохранены</p>
                <button 
                  onClick={() => switchScreen('stats')} 
                  className="w-full py-4 mt-8 rounded-xl bg-blue-600 text-white font-bold uppercase tracking-widest active:bg-blue-700"
                >
                  Прогресс
                </button>
              </div>
            )}
          </div>

          {timer.phase !== 'done' && (
            <div className="p-6 pb-8 bg-neutral-900 border-t border-neutral-800 flex justify-center space-x-6 items-center flex-shrink-0">
              <button 
                onClick={timer.resetCurrent} 
                className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300 active:bg-neutral-700"
              >
                <Undo2 className="w-5 h-5"/>
              </button>
              <button 
                onClick={timer.togglePlayPause} 
                className={`w-20 h-20 rounded-full shadow-lg text-white flex items-center justify-center transition-transform active:scale-95 ${timer.isRunning ? 'bg-red-600' : 'bg-blue-600'}`}
              >
                {timer.isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </button>
              <button 
                onClick={timer.skipCurrent} 
                className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300 active:bg-neutral-700"
              >
                <Forward className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* STATS SCREEN */}
      {screen === 'stats' && (
        <div className="flex flex-col h-full w-full absolute inset-0 z-10 bg-[#0a0a0a]">
          <header className="p-6 pt-10 border-b border-neutral-900 bg-neutral-900/50 flex-shrink-0">
            <LineChart className="w-8 h-8 text-blue-500 mb-3" />
            <h1 className="text-2xl font-bold uppercase tracking-tight">Аналитика</h1>
          </header>
          
          <div className="flex-1 p-6 overflow-y-auto pb-24">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-center">
                <span className="text-4xl font-bold text-white block">{history.length}</span>
                <span className="text-xs text-neutral-400 uppercase">Сессий</span>
              </div>
              <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-center">
                <span className="text-4xl font-bold text-blue-500 block">
                  {history.filter(w => new Date(w.ts) > new Date(Date.now() - 7 * 86400000)).length}
                </span>
                <span className="text-xs text-neutral-400 uppercase">За 7 дней</span>
              </div>
            </div>
            
            <h3 className="text-sm uppercase tracking-widest text-neutral-500 mb-4 flex items-center">
              <History className="w-4 h-4 mr-2" /> Лог
            </h3>
            
            <div className="space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-8 text-neutral-600 border-2 border-dashed border-neutral-800 rounded-xl">
                  Нет записей
                </div>
              ) : (
                history.map((w) => (
                  <div key={w.id} className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-bold text-white">
                        {w.lvl} 
                        <span className="text-xs text-neutral-500 font-normal ml-2">{w.date}</span>
                      </div>
                    </div>
                    <div className="text-xs text-neutral-400 font-mono">
                      С:{w.sr} Ш:{w.shr}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      {screen !== 'workout' && (
        <div className="absolute bottom-0 w-full bg-neutral-900 border-t border-neutral-800 flex z-30 pb-safe pb-[env(safe-area-inset-bottom)]">
          <button 
            onClick={() => switchScreen('setup')} 
            className={`flex-1 py-4 flex flex-col items-center ${screen === 'setup' ? 'text-blue-400 bg-neutral-800/50' : 'text-neutral-400'}`}
          >
            <Settings2 className="w-5 h-5 mb-1" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Настройка</span>
          </button>
          <button 
            onClick={() => switchScreen('stats')} 
            className={`flex-1 py-4 flex flex-col items-center ${screen === 'stats' ? 'text-blue-400 bg-neutral-800/50' : 'text-neutral-400'}`}
          >
            <LineChart className="w-5 h-5 mb-1" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Прогресс</span>
          </button>
        </div>
      )}
      
    </div>
  );
}
