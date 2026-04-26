import { WorkoutHistoryItem } from '../types';

const STORAGE_KEY = 'tactical_app_v3_history';

export const loadHistory = (): WorkoutHistoryItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to load history', err);
    return [];
  }
};

export const saveWorkout = (lvl: string, sr: number, shr: number) => {
  try {
    const history = loadHistory();
    const newItem: WorkoutHistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      lvl,
      sr,
      shr,
      ts: new Date().toISOString(),
      date: new Date().toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    const newHistory = [newItem, ...history];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    return newHistory;
  } catch (err) {
    console.error('Failed to save workout', err);
    return loadHistory();
  }
};
