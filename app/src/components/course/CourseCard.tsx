import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Clock, BookOpen } from 'lucide-react';
import { Course } from '@/services/types';
import { useTranslation } from '@/i18n/LanguageContext';
import { Badge } from '@/components/ui/badge';

interface CourseCardProps {
  course: Course;
  progress?: number;
}

const difficultyConfig = {
  beginner: { class: 'bg-accent/15 text-accent border-accent/20', dot: 'bg-accent' },
  intermediate: { class: 'bg-primary/15 text-primary border-primary/20', dot: 'bg-primary' },
  advanced: { class: 'bg-destructive/15 text-destructive border-destructive/20', dot: 'bg-destructive' },
};

const trackGradients: Record<string, string> = {
  'Solana Core': 'from-primary/30 via-primary/10 to-accent/20',
  'Program Development': 'from-primary/25 via-primary/15 to-primary/5',
  'DeFi Engineering': 'from-accent/30 via-accent/10 to-primary/15',
  'Digital Assets': 'from-primary/20 via-primary/10 to-accent/15',
};

const trackIcons: Record<string, string> = {
  'Solana Core': '◆',
  'Program Development': '⚓',
  'DeFi Engineering': '◈',
  'Digital Assets': '◇',
};

export function CourseCard({ course, progress }: CourseCardProps) {
  const { t } = useTranslation();
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const gradient = trackGradients[course.track] || 'from-primary/20 to-accent/10';
  const dc = difficultyConfig[course.difficulty];

  return (
    <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ duration: 0.25 }} className="group h-full">
      <Link to={`/courses/${course.slug}`} className="block h-full">
        <div className="h-full rounded-2xl bg-card border border-border/50 overflow-hidden transition-all duration-300 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 relative">
          {/* Hover glow */}
          <div className="absolute -inset-px rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500 pointer-events-none" />
          
          {/* Thumbnail with track-specific gradient + pattern */}
          <div className={`h-36 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
            <div className="absolute inset-0 dot-grid opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
            
            {/* Animated track icon watermark */}
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl text-foreground/[0.03] font-display select-none"
            >
              {trackIcons[course.track] || '◆'}
            </motion.div>
            
            <div className="absolute top-3 left-3">
              <Badge className={`text-[10px] font-semibold ${dc.class} gap-1 backdrop-blur-sm`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dc.dot}`} />
                {t(`courses.${course.difficulty}`)}
              </Badge>
            </div>
            <div className="absolute bottom-3 right-3 text-[10px] font-mono text-accent font-bold bg-card/90 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-accent/10">
              +{course.xpReward} XP
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3 relative">
            <div>
              <p className="text-[10px] text-primary font-bold mb-1 uppercase tracking-[0.15em]">{course.track}</p>
              <h3 className="font-display font-semibold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1">
                {course.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{course.shortDescription}</p>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{totalLessons}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.enrolledCount.toLocaleString()}</span>
            </div>

            {/* Progress */}
            {progress !== undefined && progress > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-primary font-bold">{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-solana-gradient relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[gradient-shift_3s_ease_infinite] bg-[length:200%_100%]" />
                  </motion.div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
