import { createClient } from '@/utils/supabase/client';

export interface LevelData {
  level_number: number;
  xp_required: number;
  cumulative_xp: number | null;
}

export interface LevelProgress {
  level: number;
  currentLevelXP: number;
  nextLevelXP: number | null;
  progress: number;
  xpToNext: number | null;
}

export const calculateLevelProgress = (
  totalXP: number,
  levels: LevelData[],
  fallbackLevel = 1
): LevelProgress => {
  const xp = Math.max(Number(totalXP) || 0, 0);
  const thresholds = levels
    .filter((level): level is LevelData & { cumulative_xp: number } => (
      level.cumulative_xp !== null && Number.isFinite(level.cumulative_xp)
    ))
    .sort((a, b) => a.cumulative_xp - b.cumulative_xp || a.level_number - b.level_number);

  if (thresholds.length === 0) {
    return {
      level: Math.max(fallbackLevel, 1),
      currentLevelXP: 0,
      nextLevelXP: null,
      progress: 0,
      xpToNext: null,
    };
  }

  const reachedThresholds = thresholds.filter((level) => xp >= level.cumulative_xp);
  const currentThreshold = reachedThresholds.at(-1);
  const nextThreshold = thresholds.find((level) => level.cumulative_xp > xp);
  const level = Math.max((currentThreshold?.level_number ?? 0) + 1, 1);
  const currentLevelXP = currentThreshold?.cumulative_xp ?? 0;
  const nextLevelXP = nextThreshold?.cumulative_xp ?? null;

  if (nextLevelXP === null || nextLevelXP <= currentLevelXP) {
    return {
      level,
      currentLevelXP,
      nextLevelXP,
      progress: 100,
      xpToNext: null,
    };
  }

  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return {
    level,
    currentLevelXP,
    nextLevelXP,
    progress: Math.max(0, Math.min(progress, 100)),
    xpToNext: Math.max(nextLevelXP - xp, 0),
  };
};

export const fetchLevels = async (): Promise<LevelData[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('levels')
    .select('level_number, xp_required, cumulative_xp')
    .order('level_number', { ascending: true });

  if (error) throw error;
  return data as LevelData[];
};

export const updateLevel = async (
  levelNumber: number,
  updates: Pick<LevelData, 'xp_required' | 'cumulative_xp'>
): Promise<LevelData> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('levels')
    .update(updates)
    .eq('level_number', levelNumber)
    .select('level_number, xp_required, cumulative_xp')
    .single();

  if (error) throw error;
  return data as LevelData;
};
