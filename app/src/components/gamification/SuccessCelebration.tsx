import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, PartyPopper } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SuccessCelebrationProps {
  show: boolean;
  xpEarned: number;
  onComplete?: () => void;
}

export function SuccessCelebration({ show, xpEarned, onComplete }: SuccessCelebrationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; size: number; color: string }>>([]);

  useEffect(() => {
    if (show) {
      const colors = [
        'hsl(var(--primary))',
        'hsl(var(--accent))',
        'hsl(var(--primary))',
        'hsl(var(--accent))',
      ];
      setParticles(
        Array.from({ length: 20 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 0.5,
          size: 4 + Math.random() * 8,
          color: colors[i % colors.length],
        }))
      );
      const timer = setTimeout(() => onComplete?.(), 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

          {/* Particles */}
          {particles.map(p => (
            <motion.div
              key={p.id}
              initial={{ 
                x: '50vw', 
                y: '50vh', 
                scale: 0, 
                opacity: 1 
              }}
              animate={{ 
                x: `${p.x}vw`, 
                y: `${p.y}vh`, 
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{ 
                duration: 1.5, 
                delay: p.delay,
                ease: 'easeOut',
              }}
              className="absolute rounded-full"
              style={{ 
                width: p.size, 
                height: p.size, 
                backgroundColor: p.color,
              }}
            />
          ))}

          {/* Content */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
            className="relative flex flex-col items-center gap-4 p-8 rounded-2xl bg-card border border-border shadow-2xl"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: 2, duration: 0.5, delay: 0.5 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-solana-gradient flex items-center justify-center">
                <PartyPopper className="w-8 h-8 text-background" />
              </div>
            </motion.div>

            <div className="text-center">
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="font-display text-2xl font-bold text-foreground mb-1"
              >
                Challenge Complete!
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-sm text-muted-foreground"
              >
                Great work! You nailed it.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: 'spring' }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20"
            >
              <Zap className="w-5 h-5 text-accent" />
              <span className="text-lg font-display font-bold text-accent">+{xpEarned} XP</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center gap-1 text-xs text-muted-foreground"
            >
              <Sparkles className="w-3 h-3" /> Transaction confirmed on Solana
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
