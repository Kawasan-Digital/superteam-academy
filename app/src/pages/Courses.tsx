import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEO } from '@/components/SEO';
import { CourseCard } from '@/components/course/CourseCard';
import { EmptyState } from '@/components/ui/empty-state';
import { useTranslation } from '@/i18n/LanguageContext';
import { useCourses, useLearningPaths } from '@/cms/useCMSContent';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const difficultyFilters = ['all', 'beginner', 'intermediate', 'advanced'] as const;
const durationFilters = ['all', '< 2h', '2-5h', '5h+'] as const;

const Courses = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [durationFilter, setDurationFilter] = useState<string>('all');
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const { data: learningPaths = [], isLoading: pathsLoading } = useLearningPaths();

  const filtered = useMemo(() => {
    return courses.filter(c => {
      const q = search.toLowerCase();
      const matchesSearch = !q || c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.shortDescription.toLowerCase().includes(q) ||
        c.tags.some(tag => tag.toLowerCase().includes(q));
      const matchesDifficulty = difficultyFilter === 'all' || c.difficulty === difficultyFilter;
      // Parse duration string like "3 hours", "1.5 hours", "45 min"
      let matchesDuration = true;
      if (durationFilter !== 'all') {
        const hours = parseDurationHours(c.duration);
        if (durationFilter === '< 2h') matchesDuration = hours < 2;
        else if (durationFilter === '2-5h') matchesDuration = hours >= 2 && hours <= 5;
        else if (durationFilter === '5h+') matchesDuration = hours > 5;
      }
      return matchesSearch && matchesDifficulty && matchesDuration;
    });
  }, [courses, search, difficultyFilter, durationFilter]);

function parseDurationHours(duration: string): number {
  const h = duration.match(/(\d+\.?\d*)\s*h/i);
  if (h) return parseFloat(h[1]);
  const m = duration.match(/(\d+)\s*min/i);
  if (m) return parseInt(m[1]) / 60;
  const num = parseFloat(duration);
  return isNaN(num) ? 0 : num;
}

  return (
    <MainLayout>
      <SEO title="Course Catalog" description="Browse interactive Solana development courses. Filter by difficulty, topic, and duration. Start learning today." path="/courses" />

      {/* Hero header with mesh gradient */}
      <div className="relative overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ x: [0, 25, 0], y: [0, -15, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-10 right-[20%] w-64 h-64 rounded-full bg-primary/10 blur-[100px]"
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute top-10 left-[10%] w-72 h-72 rounded-full bg-accent/6 blur-[100px]"
          />
        </div>

        <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-2 flex items-center gap-2">
              <span className="w-6 h-px bg-primary" /> Course Catalog
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">{t('courses.title')}</h1>
            <p className="text-muted-foreground max-w-lg">Explore learning paths from fundamentals to advanced DeFi.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Learning Paths */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Learning Paths
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {pathsLoading ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            )) : learningPaths.map((path, i) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                whileHover={{ y: -3, scale: 1.01 }}
                className="relative group"
              >
                <div className="absolute -inset-px rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500" />
                <div className="relative p-4 rounded-xl border border-border/50 bg-card hover:border-primary/20 transition-all cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${path.color} flex items-center justify-center text-lg flex-shrink-0`}>
                      {path.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{path.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{path.courseIds.length} courses</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder={t('courses.search')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 bg-card border-border/50 focus:border-primary/30 rounded-xl"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {difficultyFilters.map(f => (
                <button
                  key={f}
                  onClick={() => setDifficultyFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    difficultyFilter === f
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm shadow-primary/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card border border-transparent hover:border-border/50'
                  }`}
                >
                  {t(`courses.${f}`)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground self-center mr-1">Duration:</span>
            {durationFilters.map(f => (
              <button
                key={f}
                onClick={() => setDurationFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  durationFilter === f
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card border border-transparent hover:border-border/50'
                }`}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Course Grid */}
        {coursesLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState type="search" message="No courses found matching your criteria. Try adjusting your search or filters." />
        )}
      </div>
    </MainLayout>
  );
};

export default Courses;
