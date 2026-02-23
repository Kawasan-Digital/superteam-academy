import { motion } from 'framer-motion';
import type { Achievement } from '@/services/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AchievementGridProps {
  achievements: Achievement[];
  columns?: number;
}

const categoryAccents: Record<string, string> = {
  progress: 'bg-primary/8 border-primary/20 hover:border-primary/40',
  streak: 'bg-destructive/8 border-destructive/20 hover:border-destructive/40',
  skill: 'bg-accent/8 border-accent/20 hover:border-accent/40',
  community: 'bg-solana-purple/8 border-solana-purple/20 hover:border-solana-purple/40',
  special: 'bg-accent/8 border-accent/20 hover:border-accent/40',
};

export function AchievementGrid({ achievements, columns = 4 }: AchievementGridProps) {
  const unlocked = achievements.filter(a => a.unlockedAt);
  const locked = achievements.filter(a => !a.unlockedAt);

  return (
    <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {unlocked.map((achievement, i) => (
        <Tooltip key={achievement.id}>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
              whileHover={{ scale: 1.08, y: -2 }}
              className={`p-3 rounded-xl border ${categoryAccents[achievement.category] || 'bg-card border-border'} text-center cursor-default transition-all duration-200`}
            >
              <motion.div
                className="text-xl mb-1"
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ delay: i * 0.05 + 0.3, duration: 0.4 }}
              >
                {achievement.icon}
              </motion.div>
              <div className="text-[10px] font-semibold text-foreground leading-tight">{achievement.name}</div>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent className="max-w-[200px] text-center">
            <p className="font-medium text-xs">{achievement.name}</p>
            <p className="text-[10px] text-muted-foreground">{achievement.description}</p>
            {achievement.unlockedAt && (
              <p className="text-[9px] text-accent mt-1">{new Date(achievement.unlockedAt).toLocaleDateString()}</p>
            )}
          </TooltipContent>
        </Tooltip>
      ))}

      {locked.map((achievement, i) => (
        <Tooltip key={achievement.id}>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: (unlocked.length + i) * 0.03 }}
              className="p-3 rounded-xl border border-border/50 bg-card/30 text-center cursor-default"
            >
              <div className="text-xl mb-1 grayscale opacity-40">{achievement.icon}</div>
              <div className="text-[10px] font-medium text-muted-foreground/60 leading-tight">{achievement.name}</div>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent className="max-w-[200px] text-center">
            <p className="font-medium text-xs">{achievement.name}</p>
            <p className="text-[10px] text-muted-foreground">{achievement.description}</p>
            <p className="text-[9px] text-muted-foreground/60 mt-1">🔒 Locked</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
