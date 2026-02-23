import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Zap, TrendingUp, Crown, Star, Wifi, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEO } from '@/components/SEO';
import { useTranslation } from '@/i18n/LanguageContext';
import { fetchLeaderboard, isHeliusConfigured } from '@/services/helius-leaderboard';
import type { LeaderboardEntry } from '@/services/types';

const timeframes = ['weekly', 'monthly', 'alltime'] as const;

const Leaderboard = () => {
  const { t } = useTranslation();
  const [timeframe, setTimeframe] = useState<typeof timeframes[number]>('alltime');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const heliusActive = isHeliusConfigured();

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard(timeframe)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [timeframe]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  const podiumOrder = [top3[1], top3[0], top3[2]];
  const podiumHeights = ['h-28', 'h-36', 'h-24'];
  const podiumColors = [
    'from-muted-foreground/20 to-muted-foreground/5',
    'from-accent/30 to-accent/5',
    'from-primary/20 to-primary/5',
  ];
  const medals = ['🥈', '🥇', '🥉'];

  return (
    <MainLayout>
      <SEO title={t('leaderboard.title')} description={t('leaderboard.subtitle')} path="/leaderboard" />

      <div className="relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px] animate-pulse-glow pointer-events-none" />
        <div className="absolute -top-20 right-0 w-[400px] h-[400px] rounded-full bg-accent/6 blur-[100px] animate-pulse-glow pointer-events-none" style={{ animationDelay: '1s' }} />
        <div className="absolute top-40 left-1/2 w-[300px] h-[300px] rounded-full bg-primary/5 blur-[80px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px w-8 bg-primary/60" />
              <p className="text-xs uppercase tracking-widest text-primary font-semibold">{t('leaderboard.rankings')}</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {t('leaderboard.title')}
                </h1>
                <p className="text-sm text-muted-foreground mb-8">{t('leaderboard.subtitle')}</p>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium border ${
                heliusActive
                  ? 'bg-accent/10 text-accent border-accent/20'
                  : 'bg-secondary text-muted-foreground border-border/50'
              }`}>
                {heliusActive ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {heliusActive ? t('leaderboard.onchain') : t('leaderboard.offchain')}
              </div>
            </div>
          </motion.div>

          <div className="flex gap-1 mb-10 p-1 rounded-xl bg-secondary/50 w-fit backdrop-blur-sm border border-border/30">
            {timeframes.map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeframe === tf ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {timeframe === tf && (
                  <motion.div layoutId="lb-tab" className="absolute inset-0 bg-card rounded-lg border border-border shadow-sm shadow-primary/5" />
                )}
                <span className="relative z-10">{t(`leaderboard.${tf}`)}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Podium */}
              <div className="flex items-end justify-center gap-3 mb-10">
                {podiumOrder.map((entry, i) => {
                  if (!entry) return null;
                  const isFirst = entry.rank === 1;
                  return (
                    <motion.div
                      key={entry.user.id}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15, type: 'spring', stiffness: 200 }}
                      className="flex-1 max-w-[180px] group"
                    >
                      <Link to={`/profile/${entry.user.username}`} className={`block text-center mb-3 ${isFirst ? 'scale-105' : ''}`}>
                        <div className="relative inline-block mb-2">
                          {isFirst && <div className="absolute -inset-2 rounded-2xl bg-accent/20 blur-lg animate-pulse-glow" />}
                          <div className={`w-14 h-14 rounded-2xl bg-solana-gradient flex items-center justify-center text-background font-bold text-lg relative ${isFirst ? 'ring-2 ring-accent/40 ring-offset-2 ring-offset-background' : ''}`}>
                            {entry.user.displayName[0]}
                          </div>
                          {isFirst && (
                            <motion.div
                              animate={{ y: [0, -3, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute -top-3 -right-2"
                            >
                              <Crown className="w-5 h-5 text-accent fill-accent/20" />
                            </motion.div>
                          )}
                        </div>
                        <p className="font-display font-bold text-foreground text-sm hover:text-primary transition-colors">{entry.user.displayName}</p>
                        <p className="text-[10px] text-muted-foreground">@{entry.user.username}</p>
                        <div className="flex items-center justify-center gap-1 text-xs mt-1">
                          <Zap className="w-3 h-3 text-accent" />
                          <span className="font-bold text-foreground">{entry.xp.toLocaleString()}</span>
                        </div>
                      </Link>
                      <div className="relative group/podium">
                        <div className="absolute -inset-1 rounded-t-xl bg-primary/0 group-hover/podium:bg-primary/10 blur-lg transition-all duration-500" />
                        <div className={`${podiumHeights[i]} rounded-t-xl bg-gradient-to-t ${podiumColors[i]} relative overflow-hidden border border-border/20`}>
                          <div className="absolute inset-0 dot-grid opacity-30" />
                          <div className="absolute top-3 left-1/2 -translate-x-1/2 text-2xl">{medals[i]}</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Table */}
              <div className="relative group/table">
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-primary/20 via-border/30 to-border/10 opacity-0 group-hover/table:opacity-100 transition-opacity duration-500" />
                <div className="rounded-2xl card-premium overflow-hidden noise relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

                  <div className="grid grid-cols-12 gap-2 px-5 py-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                    <div className="col-span-1">#</div>
                    <div className="col-span-5">{t('leaderboard.learner')}</div>
                    <div className="col-span-2 text-right">{t('leaderboard.xp')}</div>
                    <div className="col-span-2 text-right">{t('leaderboard.level')}</div>
                    <div className="col-span-2 text-right">{t('leaderboard.streak')}</div>
                  </div>
                  {rest.map((entry, i) => {
                    const isCurrentUser = entry.user.id === 'user-1';
                    return (
                      <Link to={`/profile/${entry.user.username}`} key={entry.user.id}>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.04 }}
                          className={`grid grid-cols-12 gap-2 px-5 py-3.5 items-center text-sm border-b border-border/50 last:border-0 group/row cursor-pointer ${
                            isCurrentUser ? 'bg-primary/5 relative' : 'hover:bg-secondary/30'
                          } transition-all duration-300`}
                        >
                          {isCurrentUser && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r" />}
                          {!isCurrentUser && <div className="absolute inset-0 bg-primary/0 group-hover/row:bg-primary/[0.02] transition-colors duration-300 rounded-lg pointer-events-none" />}
                          <div className="col-span-1 font-mono text-muted-foreground text-xs relative">{entry.rank}</div>
                          <div className="col-span-5 flex items-center gap-2.5 relative">
                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-foreground group-hover/row:bg-primary/10 transition-colors">
                              {entry.user.displayName[0]}
                            </div>
                            <div>
                              <span className={`font-medium text-sm group-hover/row:text-primary transition-colors ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>{entry.user.displayName}</span>
                              {isCurrentUser && <span className="text-[10px] text-primary ml-1.5">{t('leaderboard.you')}</span>}
                            </div>
                          </div>
                          <div className="col-span-2 text-right flex items-center justify-end gap-1 text-xs relative">
                            <Zap className="w-3 h-3 text-accent" />
                            <span className="font-semibold">{entry.xp.toLocaleString()}</span>
                          </div>
                          <div className="col-span-2 text-right flex items-center justify-end gap-1 text-xs text-muted-foreground relative">
                            <TrendingUp className="w-3 h-3 text-primary" /> {entry.level}
                          </div>
                          <div className="col-span-2 text-right flex items-center justify-end gap-1 text-xs text-muted-foreground relative">
                            <Flame className="w-3 h-3 text-destructive" /> {entry.streak}
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Leaderboard;
