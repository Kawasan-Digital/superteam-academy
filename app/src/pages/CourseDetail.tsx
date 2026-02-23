import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, Users, BookOpen, CheckCircle2, Circle, Code, FileText, Zap, Star, Wallet, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEO } from '@/components/SEO';
import { useTranslation } from '@/i18n/LanguageContext';
import { useCourseBySlug } from '@/cms/useCMSContent';
import { MOCK_REVIEWS } from '@/services/mock-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useEnrollCourse } from '@/hooks/useEnrollCourse';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '@/hooks/useAuth';

const CourseDetail = () => {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { data: course, isLoading } = useCourseBySlug(slug);
  const { enroll, status, txSignature, error, reset } = useEnrollCourse();
  const { connected } = useWallet();
  const { user } = useAuth();
  const [enrolled, setEnrolled] = useState(false);
  const { completedLessonIds, refetch: refetchProgress } = useCourseProgress(course?.id);

  const handleEnroll = async () => {
    if (!course) return;
    const success = await enroll(course.id, course.title);
    if (success) {
      setEnrolled(true);
      refetchProgress();
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </MainLayout>
    );
  }

  if (!course) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">{t('course.not_found')}</p>
          <Link to="/courses" className="text-primary hover:underline mt-4 inline-block">{t('course.back_courses')}</Link>
        </div>
      </MainLayout>
    );
  }

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedCount = course.modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => completedLessonIds.has(l.id)).length,
    0
  );
  const progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  return (
    <MainLayout>
      <SEO title={course.title} description={course.shortDescription} path={`/courses/${slug}`} type="article" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/courses" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> {t('common.back')}
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Header */}
              <div className="mb-8">
                <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">{course.track}</Badge>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">{course.title}</h1>
                <p className="text-muted-foreground text-lg mb-4">{course.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{course.duration}</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{totalLessons} {t('courses.lessons')}</span>
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" />{course.enrolledCount.toLocaleString()} {t('courses.enrolled')}</span>
                  <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-accent" />+{course.xpReward} XP</span>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-8 p-4 rounded-xl border border-border bg-card">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{t('course.progress')}</span>
                  <span className="text-primary font-medium">{completedCount}/{totalLessons} {t('courses.lessons')}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full bg-solana-gradient"
                  />
                </div>
              </div>

              {/* Modules */}
              <div className="space-y-4">
                {course.modules.map((module) => (
                  <div key={module.id} className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-5 py-4 border-b border-border bg-secondary/20">
                      <h3 className="font-semibold text-foreground">{module.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{module.lessons.length} {t('courses.lessons')}</p>
                    </div>
                    <div className="divide-y divide-border">
                      {module.lessons.map((lesson) => {
                        const isCompleted = completedLessonIds.has(lesson.id);
                        return (
                          <Link
                            key={lesson.id}
                            to={`/courses/${course.slug}/lessons/${lesson.id}`}
                            className="flex items-center gap-3 px-5 py-3 hover:bg-secondary/30 transition-colors"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${isCompleted ? 'text-muted-foreground' : 'text-foreground'}`}>
                                {lesson.title}
                              </p>
                            </div>
                            {lesson.type === 'challenge' ? (
                              <Code className="w-4 h-4 text-primary flex-shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className="text-xs text-muted-foreground">+{lesson.xpReward} XP</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reviews Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-8"
              >
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-accent" /> {t('course.reviews')}
                </h3>
                <div className="space-y-4">
                  {MOCK_REVIEWS.map((review, i) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="p-4 rounded-xl border border-border bg-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
                            {review.userName[0]}
                          </div>
                          <span className="text-sm font-medium text-foreground">{review.userName}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: review.rating }).map((_, j) => (
                            <Star key={j} className="w-3.5 h-3.5 text-accent fill-accent" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                      <p className="text-xs text-muted-foreground/60 mt-2">{new Date(review.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Enrollment CTA Card */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-display font-bold text-gradient mb-1">+{course.xpReward}</div>
                  <p className="text-sm text-muted-foreground">{t('course.xp_completion')}</p>
                </div>

                <AnimatePresence mode="wait">
                  {status === 'success' || enrolled ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-3"
                    >
                      <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-center">
                        <CheckCircle2 className="w-5 h-5 text-accent mx-auto mb-1" />
                        <p className="text-sm font-medium text-accent">{t('course.enrolled_success')}</p>
                        {txSignature && (
                          <a
                            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-1 font-mono"
                          >
                            {t('course.view_explorer')} <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <Link to={`/courses/${slug}/lessons/${course.modules[0]?.lessons[0]?.id}`}>
                        <Button className="w-full bg-solana-gradient text-background hover:opacity-90 font-semibold">
                          {t('courses.start_learning')}
                        </Button>
                      </Link>
                    </motion.div>
                  ) : status === 'error' ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3"
                    >
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
                        <AlertCircle className="w-5 h-5 text-destructive mx-auto mb-1" />
                        <p className="text-xs text-destructive">{error}</p>
                      </div>
                      <Button onClick={() => { reset(); handleEnroll(); }} className="w-full bg-solana-gradient text-background hover:opacity-90 font-semibold">
                        {t('course.try_again')}
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                      <Button
                        onClick={handleEnroll}
                        disabled={status === 'signing' || status === 'confirming'}
                        className="w-full bg-solana-gradient text-background hover:opacity-90 font-semibold h-11 gap-2"
                      >
                        {status === 'signing' ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> {t('course.sign_wallet')}</>
                        ) : status === 'confirming' ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> {t('course.confirming')}</>
                        ) : connected ? (
                          <><Wallet className="w-4 h-4" /> {t('course.enroll_sign')}</>
                        ) : user ? (
                          <>{t('courses.enroll')}</>
                        ) : (
                          <>{t('courses.continue')}</>
                        )}
                      </Button>
                      {connected && (status === 'idle') && (
                        <p className="text-[10px] text-center text-muted-foreground">
                          {t('course.memo_note')}
                        </p>
                      )}
                      {!connected && user && (
                        <p className="text-[10px] text-center text-muted-foreground">
                          {t('course.enroll_offchain')}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Instructor */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h4 className="text-sm font-semibold text-foreground mb-3">{t('course.instructor')}</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-solana-gradient flex items-center justify-center text-background font-bold text-sm">
                    {course.instructor.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{course.instructor.name}</p>
                    <p className="text-xs text-muted-foreground">{course.instructor.bio}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h4 className="text-sm font-semibold text-foreground mb-3">{t('course.topics')}</h4>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CourseDetail;
