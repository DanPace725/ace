import { createClient } from '@/utils/supabase/client';

export interface LevelData {
  level_number: number;
  xp_required: number;
  cumulative_xp: number | null;
}

export const fetchLevels = async (): Promise<LevelData[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('levels')
    .select('level_number, xp_required, cumulative_xp')
    .order('level_number', { ascending: true });

  if (error) throw error;
  return data as LevelData[];
};

export const fetchLevelData = async (level: number) => {
  const supabase = createClient();
  const { data: levelData, error } = await supabase
    .from('levels')
    .select('level_number, xp_required, cumulative_xp')
    .order('level_number', { ascending: true })
    .limit(2)
    .gte('level_number', level);

  if (error) {
    console.error('Error fetching level data:', error);
    return null;
  }

  return levelData;
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
