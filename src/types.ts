export type LevelId = 'beginner' | 'base' | 'advanced';

export interface LevelTimes {
  w: { w: number; r: number };
  s: { w: number; r: number };
  sh: { w: number; r: number };
}

export interface LevelInfo {
  id: LevelId;
  name: string;
  t: LevelTimes;
}

export const LEVELS: Record<LevelId, LevelInfo> = {
  beginner: {
    id: 'beginner',
    name: 'Новичок',
    t: {
      w: { w: 45, r: 15 },
      s: { w: 30, r: 30 },
      sh: { w: 20, r: 30 },
    },
  },
  base: {
    id: 'base',
    name: 'База',
    t: {
      w: { w: 60, r: 10 },
      s: { w: 40, r: 20 },
      sh: { w: 45, r: 15 },
    },
  },
  advanced: {
    id: 'advanced',
    name: 'Продвинутый',
    t: {
      w: { w: 60, r: 0 },
      s: { w: 50, r: 10 },
      sh: { w: 60, r: 10 },
    },
  },
};

export type Phase = 'prepare' | 'work' | 'rest' | 'done';

export interface ExercisePlanItem {
  id: string; // unique
  title: string;
  block: string;
  w: number;
  r: number;
  info: string;
}

export interface WorkoutHistoryItem {
  id: string;
  lvl: string;
  sr: number;
  shr: number;
  ts: string;
  date: string;
}
