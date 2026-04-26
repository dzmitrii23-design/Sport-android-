import { useState, useEffect, useRef, useCallback } from 'react';
import { LevelInfo, Phase, ExercisePlanItem } from '../types';
import { beep, initAudio } from '../lib/audio';

// Wake lock wrapper
const requestWakeLock = async () => {
  if ('wakeLock' in navigator) {
    try {
      return await navigator.wakeLock.request('screen');
    } catch (err: any) {
      console.warn('Wake lock not granted', err.name, err.message);
    }
  }
  return null;
};

const releaseWakeLock = (wakeLock: any) => {
  if (wakeLock && typeof wakeLock.release === 'function') {
    wakeLock.release().catch(() => {});
  }
};

const EXERCISES = {
  warmup: [
    { title: 'Суставная гимнастика', block: 'Блок 0: Разминка' },
    { title: 'Динамическая растяжка', block: 'Блок 0: Разминка' },
    { title: 'Легкое кардио', block: 'Блок 0: Разминка' },
    { title: 'Активация кора (Планка)', block: 'Блок 0: Разминка' },
  ],
  strength: [
    { title: 'Становая тяга с резинкой', block: 'Блок 1: Силовая' },
    { title: 'Медвежья походка', block: 'Блок 1: Силовая' },
    { title: 'Берпи', block: 'Блок 1: Силовая' },
    { title: 'Вертикальная тяга резинки', block: 'Блок 1: Силовая' },
    { title: 'Бег в планке', block: 'Блок 1: Силовая' },
  ],
  shaolin: [
    { title: 'Удержание лодочки', block: 'Блок 2: Шаолинь' },
    { title: 'Стульчик у стены', block: 'Блок 2: Шаолинь' },
    { title: 'Стойка всадника', block: 'Блок 2: Шаолинь' },
    { title: 'Изометрическое отжимание', block: 'Блок 2: Шаолинь' },
    { title: 'Медвежья планка', block: 'Блок 2: Шаолинь' },
  ],
};

export const useWorkoutTimer = () => {
  const [plan, setPlan] = useState<ExercisePlanItem[]>([]);
  const [curIdx, setCurIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('prepare');
  const [timeLeft, setTimeLeft] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<any>(null);

  const switchPhase = useCallback((newPhase: Phase, time: number) => {
    setPhase(newPhase);
    setTimeLeft(time);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      stopTimer();
      releaseWakeLock(wakeLockRef.current);
    };
  }, [stopTimer]);

  const tick = useCallback(() => {
    setTimeLeft(prevTime => {
      const newTime = prevTime - 1;
      
      if (newTime <= 3 && newTime > 0) {
        beep(600, 200);
      } else if (newTime === 0) {
        beep(800, 500);
      }

      return newTime;
    });
  }, []);

  // Monitor time to trigger phase transitions
  useEffect(() => {
    if (timeLeft <= 0 && isRunning) {
      if (phase === 'prepare') {
        setPhase('work');
        setTimeLeft(plan[curIdx].w);
      } else if (phase === 'work') {
        if (curIdx < plan.length - 1) {
          setPhase('rest');
          setTimeLeft(plan[curIdx].r);
        } else {
          setPhase('done');
          setIsRunning(false);
          stopTimer();
          releaseWakeLock(wakeLockRef.current);
          setIsCompleted(true);
        }
      } else if (phase === 'rest') {
        if (curIdx < plan.length - 1) {
          setCurIdx(c => c + 1);
          setPhase('work');
          setTimeLeft(plan[curIdx + 1].w);
        }
      }
    }
  }, [timeLeft, isRunning, phase, curIdx, plan, stopTimer]);


  const startWorkout = useCallback((level: LevelInfo, strengthRounds: number, shaolinRounds: number) => {
    initAudio();
    const newPlan: ExercisePlanItem[] = [];
    let idCounter = 1;
    const t = level.t;

    EXERCISES.warmup.forEach((e) => {
      newPlan.push({
        id: `warmup-${idCounter++}`,
        ...e,
        w: t.w.w,
        r: t.w.r,
        info: 'Круг 1/1',
      });
    });

    for (let i = 1; i <= strengthRounds; i++) {
      EXERCISES.strength.forEach((e, idx) => {
        newPlan.push({
          id: `strength-${i}-${idx}`,
          ...e,
          w: t.s.w,
          r: idx === 4 && i < strengthRounds ? 60 : t.s.r,
          info: `Круг ${i}/${strengthRounds}`,
        });
      });
    }

    // Fix last element before big transition if needed
    if (newPlan.length > 0) {
      newPlan[newPlan.length - 1].r = Math.max(newPlan[newPlan.length - 1].r, 60);
    }

    for (let i = 1; i <= shaolinRounds; i++) {
      EXERCISES.shaolin.forEach((e, idx) => {
        newPlan.push({
          id: `shaolin-${i}-${idx}`,
          ...e,
          w: t.sh.w,
          r: idx === 4 && i < shaolinRounds ? 60 : t.sh.r,
          info: `Круг ${i}/${shaolinRounds}`,
        });
      });
    }

    setPlan(newPlan);
    setCurIdx(0);
    setPhase('prepare');
    setTimeLeft(10);
    setIsRunning(false);
    setIsCompleted(false);
    stopTimer();
  }, [stopTimer]);

  const togglePlayPause = useCallback(async () => {
    if (isRunning) {
      setIsRunning(false);
      stopTimer();
      releaseWakeLock(wakeLockRef.current);
      wakeLockRef.current = null;
    } else {
      initAudio();
      beep(0, 0); // Activate audio context unconditionally
      setIsRunning(true);
      wakeLockRef.current = await requestWakeLock();
      stopTimer(); // Ensure no duplicates
      timerRef.current = setInterval(tick, 1000);
    }
  }, [isRunning, stopTimer, tick]);

  const resetCurrent = useCallback(() => {
    setIsRunning(false);
    stopTimer();
    setPhase('prepare');
    setTimeLeft(10);
  }, [stopTimer]);

  const skipCurrent = useCallback(() => {
    setIsRunning(false);
    stopTimer();
    if (curIdx < plan.length - 1) {
      setCurIdx((c) => c + 1);
      setPhase('prepare');
      setTimeLeft(5);
    } else {
      setPhase('done');
      setIsCompleted(true);
    }
  }, [curIdx, plan.length, stopTimer]);

  const abortWorkout = useCallback(() => {
    setIsRunning(false);
    stopTimer();
    releaseWakeLock(wakeLockRef.current);
    wakeLockRef.current = null;
  }, [stopTimer]);

  return {
    plan,
    curIdx,
    currentExercise: plan[curIdx],
    nextExercise: curIdx < plan.length - 1 ? plan[curIdx + 1] : null,
    phase,
    timeLeft,
    isRunning,
    isCompleted,
    startWorkout,
    togglePlayPause,
    resetCurrent,
    skipCurrent,
    abortWorkout,
  };
};
