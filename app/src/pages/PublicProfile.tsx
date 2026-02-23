import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, Twitter, Calendar, ExternalLink, ArrowLeft, Zap, Flame, Trophy } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEO } from '@/components/SEO';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { LevelBadge } from '@/components/gamification/LevelBadge';
import { AchievementGrid } from '@/components/gamification/AchievementGrid';
import { MOCK_LEADERBOARD, MOCK_ACHIEVEMENTS, MOCK_CREDENTIALS } from '@/services/mock-data';
import { useCourses } from '@/cms/useCMSContent';
import { NFTCredentialGallery } from '@/components/wallet/NFTCredentialGallery';
import { Button } from '@/components/ui/button';

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const { data: allCourses = [] } = useCourses();
  const entry = MOCK_LEADERBOARD.find(e => e.user.username === username);

  if (!entry) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <p className="text-4xl mb-4">👤</p>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">User not found</h1>
          <p className="text-muted-foreground mb-6">The profile you're looking for doesn't exist.</p>
          <Link to="/leaderboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Leaderboard
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const user = entry.user;
  const skills: Record<string, number> = {
    Rust: Math.min(100, entry.xp / 100 + 20),
    Anchor: Math.min(100, entry.xp / 120 + 10),
    Frontend: Math.min(100, entry.xp / 80 + 30),
    Security: Math.min(100, entry.xp / 200 + 5),
    DeFi: Math.min(100, entry.xp / 150 + 10),
    NFTs: Math.min(100, entry.xp / 130 + 15),
  };
  const skillEntries = Object.entries(skills);
  const maxSkill = Math.max(...skillEntries.map(([, v]) => v));

  // Simulate some achievements based on XP
  const unlockedAchievements = MOCK_ACHIEVEMENTS.map(a => ({
    ...a,
    unlockedAt: entry.xp > 5000 ? '2025-02-01' : entry.xp > 2000 && ['first-lesson', 'week-warrior', 'rust-rookie'].includes(a.id) ? '2025-01-20' : a.unlockedAt,
  }));

  return (
    <MainLayout>
      <SEO title={`${user.displayName} — SolDev Labs`} description={`View ${user.displayName}'s profile on SolDev Labs.`} path={`/profile/${user.username}`} />

      {/* Hero banner */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient-hero" />
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px] animate-pulse-glow" />
        <div className="absolute -top-10 right-10 w-[300px] h-[300px] rounded-full bg-accent/8 blur-[80px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-12">
        {/* Back link */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
          <Link to="/leaderboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Leaderboard
          </Link>
        </motion.div>

        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative group/header mb-8">
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-primary/20 via-border/30 to-border/10 opacity-0 group-hover/header:opacity-100 transition-opacity duration-500" />
          <div className="relative p-6 rounded-2xl card-premium noise">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="relative flex-shrink-0">
                <div className="absolute -inset-2 rounded-2xl bg-accent/15 blur-lg animate-pulse-glow" />
                <div className="w-24 h-24 rounded-2xl bg-solana-gradient flex items-center justify-center text-4xl font-bold text-background ring-4 ring-background shadow-xl relative">
                  {user.displayName[0]}
                </div>
                <div className="absolute -bottom-1 -right-1">
                  <LevelBadge level={entry.level} size="sm" showLabel={false} />
                </div>
              </div>

              <div className="flex-1 pt-2">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h1 className="font-display text-2xl font-bold text-foreground">{user.displayName}</h1>
                  <span className="text-xs font-mono text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded-lg border border-border/30">@{user.username}</span>
                  {entry.rank <= 3 && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                      <Trophy className="w-3 h-3" /> #{entry.rank}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-3 flex-wrap text-sm">
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <Zap className="w-4 h-4 text-accent" /> {entry.xp.toLocaleString()} XP
                  </span>
                  <span className="text-muted-foreground">Level {entry.level}</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Flame className="w-4 h-4 text-destructive" /> {entry.streak} day streak
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* XP Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative group/xp mb-8">
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 opacity-0 group-hover/xp:opacity-100 transition-opacity duration-500" />
          <div className="relative p-5 rounded-2xl card-premium noise">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
            <XPProgressBar currentXP={entry.xp} currentLevel={entry.level} size="lg" />
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-8">
            {/* Skills */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative group/skills">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-primary/15 via-border/20 to-border/5 opacity-0 group-hover/skills:opacity-100 transition-opacity duration-500" />
              <div className="relative p-6 rounded-2xl card-premium noise">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-px w-6 bg-primary/60" />
                  <h3 className="font-display font-semibold text-foreground">Skills</h3>
                </div>
                <div className="space-y-3.5">
                  {skillEntries.map(([name, value], i) => (
                    <div key={name} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-16 flex-shrink-0 font-medium">{name}</span>
                      <div className="flex-1 h-2.5 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(value / maxSkill) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }}
                          className="h-full rounded-full bg-solana-gradient relative"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[gradient-shift_3s_ease_infinite] bg-[length:200%_100%]" />
                        </motion.div>
                      </div>
                      <span className="text-[10px] text-muted-foreground w-8 text-right font-mono">{Math.round(value)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Credentials */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px w-6 bg-primary/60" />
                <h3 className="font-display font-semibold text-foreground">Credentials</h3>
              </div>
              <NFTCredentialGallery credentials={entry.xp > 3000 ? MOCK_CREDENTIALS : MOCK_CREDENTIALS.slice(0, 1)} />
            </motion.div>
          </div>

          <div className="space-y-6">
            {/* Achievements */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="relative group/ach">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-accent/15 via-border/20 to-border/5 opacity-0 group-hover/ach:opacity-100 transition-opacity duration-500" />
              <div className="relative p-6 rounded-2xl card-premium noise">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px w-6 bg-accent/60" />
                  <h3 className="font-display font-semibold text-foreground">Achievements</h3>
                </div>
                <AchievementGrid achievements={unlockedAchievements} columns={3} />
              </div>
            </motion.div>

            {/* Completed courses */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="relative group/completed">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-primary/15 via-border/20 to-border/5 opacity-0 group-hover/completed:opacity-100 transition-opacity duration-500" />
              <div className="relative p-6 rounded-2xl card-premium noise">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px w-6 bg-primary/60" />
                  <h3 className="font-display font-semibold text-foreground">Completed Courses</h3>
                </div>
                <div className="space-y-2">
                  {allCourses.slice(0, entry.xp > 5000 ? 3 : 1).map(c => (
                    <Link key={c.id} to={`/courses/${c.slug}`} className="block p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all group border border-border/20 hover:border-primary/20">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{c.title}</p>
                      <p className="text-[10px] text-accent mt-0.5 font-medium">+{c.xpReward} XP earned</p>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PublicProfile;
