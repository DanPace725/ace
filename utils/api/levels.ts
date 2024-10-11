import { createClient } from '@/utils/supabase/client';

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