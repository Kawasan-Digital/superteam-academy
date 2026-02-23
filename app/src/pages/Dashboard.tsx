import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Flame, Trophy, TrendingUp, BookOpen, Award, Clock, Compass, ArrowRight, Sparkles, Target } from 'lucide-react';
import { DailyChallenges } from '@/components/gamification/DailyChallenges';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEO } from '@/components/SEO';
import { CourseCard } from '@/components/course/CourseCard';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { LevelBadge } from '@/components/gamification/LevelBadge';
import { StreakCalendar } from '@/components/gamification/StreakCalendar';
import { AchievementGrid } from '@/components/gamification/AchievementGrid';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { DashboardStatSkeleton } from '@/components/ui/loading-states';
import { useTranslation } from '@/i18n/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useLearningService } from '@/services/ServiceProvider';
import { MOCK_ACHIEVEMENTS } from '@/services/mock-data';
import { AIRecommender } from '@/components/ai/AIRecommender';
import { useCourses } from '@/cms/useCMSContent';
import { supabase } from '@/integrations/supabase/client';
import type { StreakData } from '@/services/types';
import type { Course } from '@/services/types';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const learningService = useLearningService();
  const { data: allCourses = [] } = useCourses();
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(0);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);

  const userId = user?.id || 'anonymous';
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Developer';

  useEffect(() => {
    const load = async () => {
      const [x, l, s] = await Promise.all([
        learningService.getXP(userId),
        learningService.getLevel(userId),
        learningService.getStreak(userId),
      ]);
      setXp(profile?.xp ?? x);
      setLevel(profile?.level ?? l);
      setStreak(s);
      setTimeout(() => setLoading(false), 600);
    };
    load();
  }, [userId, profile]);

  // Fetch enrolled courses from database
  useEffect(() => {
    if (!user?.id || allCourses.length === 0) return;
    const fetchEnrolled = async () => {
      const { data } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user.id);
      if (data && data.length > 0) {
        const enrolledIds = new Set(data.map(e => e.course_id));
        setEnrolledCourses(allCourses.filter(c => enrolledIds.has(c.id)));
      }
    };
    fetchEnrolled();
  }, [user?.id, allCourses]);

  const recommendedCourses = allCourses.filter(c => !enrolledCourses.find(e => e.id === c.id)).slice(0, 2);
  const displayEnrolled = enrolledCourses.length > 0 ? enrolledCourses.slice(0, 2) : allCourses.slice(0, 2);
  const currentStreak = profile?.streak ?? streak?.current ?? 0;


  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return t('dashboard.greeting_morning');
    if (h < 18) return t('dashboard.greeting_afternoon');
    return t('dashboard.greeting_evening');
  })();

  return (
    <MainLayout>
      <SEO title="Dashboard" description="Track your learning progress, XP balance, streak, and achievements on SolDev Labs." path="/dashboard" />

      {/* === Hero Header with mesh gradient === */}
      <div className="relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-primary/10 blur-[100px]"
          />
          <motion.div
            animate={{ x: [0, -25, 0], y: [0, 15, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute -top-10 right-0 w-80 h-80 rounded-full bg-accent/8 blur-[100px]"
          />
          <motion.div
            animate={{ x: [0, 15, 0], y: [0, -10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute top-20 left-1/3 w-60 h-60 rounded-full bg-primary/5 blur-[80px]"
          />
        </div>

        {/* Dot grid overlay */}
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-2">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-2 flex items-center gap-2"
            >
              <span className="w-6 h-px bg-primary" />
              {t('dashboard.title')}
            </motion.p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              {greeting}, <span className="text-gradient">{displayName}</span> 👋
            </h1>
             <p className="text-sm text-muted-foreground mt-2 max-w-md">
               {t('dashboard.continue_journey')}
             </p>
          </motion.div>

          {/* === Stat Cards — Bento Grid === */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <DashboardStatSkeleton key={i} />)
            ) : (
              <>
                {/* XP — Hero card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="col-span-2 relative group"
                >
                  <div className="absolute -inset-px rounded-2xl bg-solana-gradient opacity-20 group-hover:opacity-30 blur-sm transition-opacity duration-500" />
                  <div className="relative p-6 rounded-2xl bg-card border border-border/50 overflow-hidden">
                    {/* Animated shimmer line */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-solana-gradient" />
                    <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
                      <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
                        className="w-1/3 h-full bg-gradient-to-r from-transparent via-accent/80 to-transparent"
                      />
                    </div>
                    {/* Mesh gradient inside */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.03]" />

                    <div className="relative flex items-start justify-between mb-4">
                      <div>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.15em] mb-2">{t('dashboard.xp')}</p>
                        <div className="text-5xl font-display font-bold text-foreground tracking-tight">
                          <AnimatedCounter value={xp} duration={1.2} />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                          {t('dashboard.soulbound')}
                        </p>
                      </div>
                      <div className="relative">
                        <div className="absolute -inset-2 bg-accent/15 rounded-2xl blur-lg" />
                        <div className="relative p-3 rounded-xl bg-accent/10 border border-accent/20">
                          <Zap className="w-6 h-6 text-accent" />
                        </div>
                      </div>
                    </div>
                    <XPProgressBar currentXP={xp} currentLevel={level} showLabel={false} size="sm" />
                  </div>
                </motion.div>

                {/* Level */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  className="relative group"
                >
                  <div className="absolute -inset-px rounded-2xl bg-primary/10 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500" />
                  <div className="relative h-full p-5 rounded-2xl bg-card border border-border/50 flex flex-col items-center justify-center text-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" />
                    <div className="relative">
                      <LevelBadge level={level} size="md" />
                      <p className="text-[10px] text-muted-foreground mt-2 font-medium">
                        {((level + 1) ** 2 * 100 - xp).toLocaleString()} {t('dashboard.xp_to_next')}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Streak */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16 }}
                  className="relative group"
                >
                  {currentStreak >= 7 && (
                    <div className="absolute -inset-px rounded-2xl bg-destructive/15 blur-sm animate-pulse" />
                  )}
                  <div className="relative h-full p-5 rounded-2xl bg-card border border-border/50 flex flex-col items-center justify-center text-center overflow-hidden">
                    {currentStreak >= 7 && (
                      <div className="absolute inset-0 bg-gradient-to-b from-destructive/[0.06] to-transparent" />
                    )}
                    <div className="relative">
                      <motion.div
                        animate={currentStreak >= 3 ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Flame className="w-8 h-8 text-destructive mb-1 mx-auto" />
                      </motion.div>
                      <div className="text-2xl font-display font-bold text-foreground">{currentStreak}</div>
                      <p className="text-[10px] text-muted-foreground font-medium">{t('dashboard.day_streak')}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Rank */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24 }}
                  className="relative group"
                >
                  <div className="relative h-full p-5 rounded-2xl bg-card border border-border/50 flex flex-col items-center justify-center text-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent" />
                    <Trophy className="w-8 h-8 text-primary mb-1 relative" />
                     <div className="text-2xl font-display font-bold text-foreground relative">#—</div>
                    <p className="text-[10px] text-muted-foreground font-medium relative">{t('dashboard.unranked')}</p>
                  </div>
                </motion.div>

                {/* Quick link */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32 }}
                  className="relative group"
                >
                  <div className="absolute -inset-px rounded-2xl bg-solana-gradient opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-500" />
                  <Link to="/leaderboard" className="relative block h-full p-5 rounded-2xl bg-card border border-border/50 flex flex-col items-center justify-center text-center overflow-hidden hover:border-primary/30 transition-colors duration-300">
                    <div className="absolute inset-0 bg-solana-gradient opacity-[0.02] group-hover:opacity-[0.06] transition-opacity duration-500" />
                    <TrendingUp className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform relative" />
                    <p className="text-xs font-semibold text-foreground relative">{t('nav.leaderboard')}</p>
                    <ArrowRight className="w-3 h-3 text-muted-foreground mt-1 group-hover:translate-x-1 transition-transform relative" />
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* === Main Content === */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Courses */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-semibold text-foreground flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  {t('dashboard.current_courses')}
                </h3>
                 <Link to="/courses" className="text-xs text-primary font-medium hover:text-primary/80 flex items-center gap-1 group">
                   {t('dashboard.see_all')} <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {displayEnrolled.map(c => (
                   <CourseCard key={c.id} course={c} />
                ))}
              </div>
            </motion.div>

            {/* Recommended */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h3 className="font-display font-semibold text-foreground mb-5 flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-accent/10">
                  <Compass className="w-4 h-4 text-accent" />
                </div>
                {t('dashboard.recommended')}
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {recommendedCourses.map(c => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            </motion.div>

            {/* AI Recommender */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <AIRecommender
                completedCourses={displayEnrolled.map(c => c.title)}
                currentLevel={profile?.level ?? 1}
                skills={{ Rust: 30, Anchor: 20, Frontend: 60, Security: 10 }}
              />
            </motion.div>

            {/* Achievements */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <h3 className="font-display font-semibold text-foreground mb-5 flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-accent/10">
                  <Award className="w-4 h-4 text-accent" />
                </div>
                {t('dashboard.achievements')}
              </h3>
              <AchievementGrid achievements={MOCK_ACHIEVEMENTS} columns={4} />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Daily Challenges & Seasonal Event */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
            >
              <DailyChallenges />
            </motion.div>
            {/* Streak Calendar */}
            {streak && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative group"
              >
                <div className="absolute -inset-px rounded-2xl bg-accent/5 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500" />
                <div className="relative p-5 rounded-2xl bg-card border border-border/50 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.02] to-transparent" />
                  <div className="relative">
                    <StreakCalendar streakData={streak} weeks={5} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Skills Radar placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="relative group"
            >
              <div className="relative p-5 rounded-2xl bg-card border border-border/50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-accent/[0.02]" />
                <div className="relative">
                  <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" /> {t('dashboard.skill_progress')}
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Rust', value: 30, color: 'bg-primary' },
                      { label: 'Anchor', value: 20, color: 'bg-primary/70' },
                      { label: 'Frontend', value: 60, color: 'bg-accent' },
                      { label: 'Security', value: 10, color: 'bg-destructive/70' },
                    ].map((skill) => (
                      <div key={skill.label}>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-muted-foreground font-medium">{skill.label}</span>
                          <span className="text-foreground font-semibold">{skill.value}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.value}%` }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                            className={`h-full rounded-full ${skill.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative group"
            >
              <div className="relative p-5 rounded-2xl bg-card border border-border/50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent" />
                <div className="relative">
                  <h3 className="font-display font-semibold text-foreground mb-5 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" /> {t('dashboard.recent_activity')}
                  </h3>
                  <div className="space-y-0">
                    {[
                      { text: 'Completed "Accounts Model"', time: '2 hours ago', xp: '+25 XP', color: 'bg-accent' },
                      { text: 'Completed "What is Solana?"', time: '1 day ago', xp: '+20 XP', color: 'bg-primary' },
                      { text: 'Enrolled in Anchor Mastery', time: '2 days ago', xp: '', color: 'bg-primary' },
                      { text: 'Achievement: Week Warrior 🔥', time: '5 days ago', xp: '+50 XP', color: 'bg-destructive' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.08 }}
                        className="flex items-start gap-3 py-3 group/item relative"
                      >
                        {/* Timeline line */}
                        {i < 3 && (
                          <div className="absolute left-[4.5px] top-[24px] bottom-0 w-px bg-border/60" />
                        )}
                        <div className={`w-[10px] h-[10px] rounded-full border-2 border-card ${item.color} mt-1.5 flex-shrink-0 relative z-10 group-hover/item:scale-125 transition-transform`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-snug font-medium">{item.text}</p>
                          <div className="flex justify-between mt-1">
                            <span className="text-[11px] text-muted-foreground">{item.time}</span>
                            {item.xp && (
                              <span className="text-[11px] text-accent font-bold bg-accent/10 px-1.5 py-0.5 rounded">
                                {item.xp}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
