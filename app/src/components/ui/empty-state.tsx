import { motion } from 'framer-motion';
import { BookOpen, Trophy, Wallet, Search as SearchIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  type: 'courses' | 'achievements' | 'credentials' | 'search' | 'activity';
  message?: string;
  actionLabel?: string;
  actionPath?: string;
}

const configs = {
  courses: {
    icon: BookOpen,
    title: 'No courses yet',
    description: 'Start your Solana journey by enrolling in your first course.',
    defaultAction: { label: 'Browse Courses', path: '/courses' },
    gradient: 'from-primary/20 to-accent/20',
  },
  achievements: {
    icon: Trophy,
    title: 'No achievements unlocked',
    description: 'Complete lessons and challenges to earn badges and rewards.',
    defaultAction: { label: 'Start Learning', path: '/courses' },
    gradient: 'from-accent/20 to-primary/20',
  },
  credentials: {
    icon: Wallet,
    title: 'No credentials earned',
    description: 'Complete courses to earn evolving NFT credentials on Solana.',
    defaultAction: { label: 'Explore Courses', path: '/courses' },
    gradient: 'from-primary/20 to-solana-green/20',
  },
  search: {
    icon: SearchIcon,
    title: 'No results found',
    description: 'Try adjusting your search or filters to find what you\'re looking for.',
    defaultAction: null,
    gradient: 'from-secondary to-muted',
  },
  activity: {
    icon: BookOpen,
    title: 'No recent activity',
    description: 'Start a lesson to see your progress here.',
    defaultAction: { label: 'Start Learning', path: '/courses' },
    gradient: 'from-primary/10 to-accent/10',
  },
};

export function EmptyState({ type, message, actionLabel, actionPath }: EmptyStateProps) {
  const config = configs[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center mb-4`}>
        <Icon className="w-7 h-7 text-muted-foreground" />
      </div>
      <h4 className="font-semibold text-foreground mb-1">{config.title}</h4>
      <p className="text-sm text-muted-foreground max-w-xs">
        {message || config.description}
      </p>
      {(actionLabel || config.defaultAction) && (
        <Link to={actionPath || config.defaultAction?.path || '/courses'} className="mt-4">
          <Button variant="outline" size="sm" className="border-border text-foreground gap-1">
            {actionLabel || config.defaultAction?.label}
          </Button>
        </Link>
      )}
    </motion.div>
  );
}
