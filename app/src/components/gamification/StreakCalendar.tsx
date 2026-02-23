import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import type { StreakData } from '@/services/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface StreakCalendarProps {
  streakData: StreakData;
  weeks?: number;
}

export function StreakCalendar({ streakData, weeks = 5 }: StreakCalendarProps) {
  const days = useMemo(() => {
    const today = new Date();
    const totalDays = weeks * 7;
    return Array.from({ length: totalDays }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (totalDays - 1 - i));
      const key = d.toISOString().split('T')[0];
      const isToday = i === totalDays - 1;
      return {
        date: d,
        key,
        active: !!streakData.history[key],
        isToday,
        dayOfWeek: d.getDay(),
        label: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      };
    });
  }, [streakData, weeks]);

  // Group by week columns
  const columns: typeof days[0][][] = [];
  for (let i = 0; i < days.length; i += 7) {
    columns.push(days.slice(i, i + 7));
  }

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-destructive" />
          <span className="font-semibold text-foreground">{streakData.current} day streak</span>
        </div>
        <span className="text-xs text-muted-foreground">Longest: {streakData.longest} days</span>
      </div>

      {/* Calendar grid */}
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1">
          {dayLabels.map((label, i) => (
            <div key={i} className="w-4 h-4 flex items-center justify-center text-[9px] text-muted-foreground">
              {i % 2 === 1 ? label : ''}
            </div>
          ))}
        </div>

        {/* Columns */}
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {col.map((day, di) => (
              <Tooltip key={day.key}>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (ci * 7 + di) * 0.01, type: 'spring', stiffness: 300 }}
                    className={`w-4 h-4 rounded-sm cursor-default transition-colors ${
                      day.active
                        ? day.isToday
                          ? 'bg-accent shadow-sm shadow-accent/30'
                          : 'bg-accent/50'
                        : day.isToday
                        ? 'bg-secondary ring-1 ring-primary/30'
                        : 'bg-secondary/60'
                    }`}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {day.label} — {day.active ? '✓ Active' : 'No activity'}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-secondary/60" /> No activity
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-accent/50" /> Active
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-accent" /> Today
        </span>
      </div>
    </div>
  );
}
