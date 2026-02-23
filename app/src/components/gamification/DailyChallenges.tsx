import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, CheckCircle2, Zap, Gift, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Challenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  timeLeft: string;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  type: 'daily' | 'seasonal';
}

const DAILY_CHALLENGES: Challenge[] = [
  {
    id: 'dc-1',
    title: 'Complete a Lesson',
    description: 'Finish any lesson to earn bonus XP today.',
    xpReward: 25,
    timeLeft: '12h left',
    difficulty: 'easy',
    completed: false,
    type: 'daily',
  },
  {
    id: 'dc-2',
    title: 'Pass a Code Challenge',
    description: 'Submit a passing solution to any coding challenge.',
    xpReward: 50,
    timeLeft: '12h left',
    difficulty: 'medium',
    completed: false,
    type: 'daily',
  },
  {
    id: 'dc-3',
    title: 'Read 3 Lessons',
    description: 'Read through any 3 lesson content pages.',
    xpReward: 15,
    timeLeft: '12h left',
    difficulty: 'easy',
    completed: true,
    type: 'daily',
  },
];

const SEASONAL_EVENT = {
  name: 'Solana Summer Sprint 🌴',
  description: 'Complete 5 courses this month for a limited-edition NFT badge!',
  progress: 2,
  total: 5,
  endsIn: '18 days',
  xpBonus: 500,
};

const difficultyColor = {
  easy: 'text-accent bg-accent/10',
  medium: 'text-primary bg-primary/10',
  hard: 'text-destructive bg-destructive/10',
};

export function DailyChallenges() {
  const [challenges, setChallenges] = useState(DAILY_CHALLENGES);

  const handleClaim = (id: string) => {
    setChallenges(prev => prev.map(c => c.id === id ? { ...c, completed: true } : c));
  };

  const completedCount = challenges.filter(c => c.completed).length;

  return (
    <div className="space-y-4">
      {/* Daily Challenges */}
      <div className="relative group">
        <div className="relative p-5 rounded-2xl bg-card border border-border/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.03] to-primary/[0.02]" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-accent/10">
                  <Sparkles className="w-4 h-4 text-accent" />
                </div>
                Daily Challenges
              </h3>
              <span className="text-[10px] text-muted-foreground font-medium bg-secondary/50 px-2 py-1 rounded-full">
                {completedCount}/{challenges.length} done
              </span>
            </div>

            <div className="space-y-2.5">
              <AnimatePresence>
                {challenges.map((challenge, i) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`relative p-3 rounded-xl border transition-all duration-300 ${
                      challenge.completed
                        ? 'bg-accent/5 border-accent/20'
                        : 'bg-secondary/30 border-border/50 hover:border-primary/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        challenge.completed ? 'bg-accent/20' : 'bg-secondary'
                      }`}>
                        {challenge.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className={`text-xs font-semibold ${challenge.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            {challenge.title}
                          </p>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${difficultyColor[challenge.difficulty]}`}>
                            {challenge.difficulty}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{challenge.description}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] text-accent font-bold flex items-center gap-1">
                            <Zap className="w-3 h-3" /> +{challenge.xpReward} XP
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {challenge.timeLeft}
                          </span>
                        </div>
                      </div>
                      {!challenge.completed && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[10px] text-primary hover:bg-primary/10"
                          onClick={() => handleClaim(challenge.id)}
                        >
                          Claim <ChevronRight className="w-3 h-3 ml-0.5" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Seasonal Event */}
      <div className="relative group">
        <div className="absolute -inset-px rounded-2xl bg-solana-gradient opacity-10 group-hover:opacity-20 blur-sm transition-opacity duration-500" />
        <div className="relative p-5 rounded-2xl bg-card border border-primary/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.03]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-solana-gradient opacity-40" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Gift className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground text-sm">{SEASONAL_EVENT.name}</h3>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">{SEASONAL_EVENT.description}</p>
            
            <div className="mb-2">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-muted-foreground">{SEASONAL_EVENT.progress}/{SEASONAL_EVENT.total} courses</span>
                <span className="text-accent font-bold">+{SEASONAL_EVENT.xpBonus} XP</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(SEASONAL_EVENT.progress / SEASONAL_EVENT.total) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full bg-solana-gradient"
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Ends in <span className="text-foreground font-semibold">{SEASONAL_EVENT.endsIn}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
