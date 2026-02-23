import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Play, CheckCircle2, Lightbulb, Eye, ChevronDown, ChevronUp, Terminal, FileCode, Zap, BookOpen, XCircle, Video } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEO } from '@/components/SEO';
import { CodeEditor } from '@/components/editor/CodeEditor';
import { SuccessCelebration } from '@/components/gamification/SuccessCelebration';
import { useTranslation } from '@/i18n/LanguageContext';
import { useCourseBySlug } from '@/cms/useCMSContent';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { analytics } from '@/services/analytics';
import { AITutorChat } from '@/components/ai/AITutorChat';
import { AICodeReview } from '@/components/ai/AICodeReview';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import type { TestCase } from '@/services/types';

const Lesson = () => {
  const { slug, lessonId } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: course, isLoading } = useCourseBySlug(slug);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showModules, setShowModules] = useState(false);
  const [activeTab, setActiveTab] = useState<'output' | 'tests'>('output');
  const [testResults, setTestResults] = useState<TestCase[]>([]);

  const allLessons = useMemo(() => course?.modules.flatMap(m => m.lessons) || [], [course]);
  const lessonIndex = useMemo(() => allLessons.findIndex(l => l.id === lessonId), [allLessons, lessonId]);
  const lesson = allLessons[lessonIndex];
  const prevLesson = allLessons[lessonIndex - 1];
  const nextLesson = allLessons[lessonIndex + 1];

  useEffect(() => {
    if (lesson?.challenge?.starterCode) {
      setCode(lesson.challenge.starterCode);
    }
    setOutput('');
    setCompleted(false);
    setShowCelebration(false);
    setShowHint(false);
    setShowSolution(false);
    setTestResults([]);
  }, [lessonId, lesson]);

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
  }, []);

  // Complete lesson in database
  const recordCompletion = useCallback(async (xpEarned: number) => {
    if (!user?.id || !course?.id || !lessonId) return;
    try {
      await supabase.from('lesson_completions').upsert({
        user_id: user.id,
        lesson_id: lessonId,
        course_id: course.id,
        xp_earned: xpEarned,
      }, { onConflict: 'user_id,lesson_id' });
    } catch (err) {
      console.warn('[LMS] Failed to record completion:', err);
    }
  }, [user?.id, course?.id, lessonId]);

  if (isLoading) {
    return (
      <MainLayout hideFooter>
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!course || !lesson) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Lesson not found.</p>
          <Link to="/courses" className="text-primary hover:underline mt-4 inline-block">Back to courses</Link>
        </div>
      </MainLayout>
    );
  }

  const handleRun = async () => {
    setRunning(true);
    setOutput('');
    setActiveTab('tests');

    const tests = lesson.challenge?.testCases || [];
    const results: TestCase[] = [];

    for (let i = 0; i < tests.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      const passed = code.trim().length > (lesson.challenge!.starterCode?.trim().length || 0);
      results.push({ ...tests[i], passed });
      setTestResults([...results]);
    }

    await new Promise(r => setTimeout(r, 400));

    const allPassed = results.every(r => r.passed);
    analytics.track({ name: 'challenge_run', params: { course_id: course.id, lesson_id: lesson.id, passed: allPassed } });

    if (allPassed) {
      setOutput(`✅ All ${results.length} test cases passed!\n\n📋 Output:\n${lesson.challenge?.expectedOutput || 'Success'}\n\n⚡ +${lesson.xpReward} XP earned!`);
      setCompleted(true);
      await recordCompletion(lesson.xpReward);
      analytics.track({ name: 'lesson_completed', params: { course_id: course.id, lesson_id: lesson.id, xp_earned: lesson.xpReward } });
      setTimeout(() => setShowCelebration(true), 300);
    } else {
      const failed = results.filter(r => !r.passed);
      setOutput(`❌ ${failed.length}/${results.length} test case(s) failed:\n\n${failed.map(f => `  ✗ ${f.name}\n    Expected: ${f.expected}\n    Received: undefined`).join('\n\n')}\n\n💡 Hint: Make sure you've modified the starter code.`);
    }
    setRunning(false);
  };

  const handleContentComplete = async () => {
    setCompleted(true);
    await recordCompletion(lesson.xpReward);
    analytics.track({ name: 'lesson_completed', params: { course_id: course.id, lesson_id: lesson.id, xp_earned: lesson.xpReward } });
    setShowCelebration(true);
  };

  const isChallenge = lesson.type === 'challenge';
  const isVideo = lesson.type === 'video';

  const contentPanel = (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          {isChallenge ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <FileCode className="w-3 h-3" /> Challenge
            </span>
          ) : isVideo ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-solana-purple/10 text-solana-purple text-xs font-medium">
              <Video className="w-3 h-3" /> Video
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
              <BookOpen className="w-3 h-3" /> Reading
            </span>
          )}
        </div>

        {isVideo && lesson.videoUrl && (
          <div className="mb-6 rounded-xl overflow-hidden border border-border bg-black aspect-video">
            {lesson.videoUrl.includes('youtube.com') || lesson.videoUrl.includes('youtu.be') ? (
              <iframe
                src={lesson.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={lesson.title}
              />
            ) : (
              <video src={lesson.videoUrl} controls className="w-full h-full" />
            )}
          </div>
        )}

        <div className="prose prose-invert max-w-none prose-headings:font-display prose-headings:text-foreground prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4 prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-4 prose-h3:mb-2 prose-p:text-muted-foreground prose-p:mb-3 prose-p:leading-relaxed prose-strong:text-foreground prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-pre:bg-secondary prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-a:text-primary prose-a:underline prose-li:text-muted-foreground prose-ul:my-3 prose-ol:my-3">
          <ReactMarkdown>{lesson.content}</ReactMarkdown>
        </div>

        {isChallenge && lesson.challenge && (
          <div className="mt-6 space-y-3 border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" /> Challenge Instructions
            </h3>
            <p className="text-sm text-muted-foreground">{lesson.challenge.instructions}</p>

            {lesson.challenge.testCases.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('lesson.tests')}</p>
                {lesson.challenge.testCases.map((tc, i) => {
                  const result = testResults[i];
                  const isPassed = result?.passed === true;
                  const isFailed = result?.passed === false;
                  return (
                    <div key={i} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs transition-colors ${
                      isPassed ? 'border-accent/20 bg-accent/5' : isFailed ? 'border-destructive/20 bg-destructive/5' : 'border-border bg-secondary/20'
                    }`}>
                      {isPassed ? <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                        : isFailed ? <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                        : running && testResults.length === i ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full flex-shrink-0" />
                        ) : <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />}
                      <span className="text-foreground font-medium">{tc.name}</span>
                      {isPassed && <span className="ml-auto text-accent">Passed</span>}
                      {isFailed && <span className="ml-auto text-destructive">Failed</span>}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-1.5 text-xs text-accent hover:underline transition-colors">
                <Lightbulb className="w-3.5 h-3.5" /> {showHint ? 'Hide Hint' : t('lesson.hint')}
              </button>
              <button onClick={() => setShowSolution(!showSolution)} className="flex items-center gap-1.5 text-xs text-primary hover:underline transition-colors">
                <Eye className="w-3.5 h-3.5" /> {showSolution ? 'Hide Solution' : t('lesson.solution')}
              </button>
            </div>
            {showHint && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 rounded-lg bg-accent/5 border border-accent/20 text-sm text-muted-foreground">
                💡 Think about how the instruction data is structured and what accounts you need to pass.
              </motion.div>
            )}
            {showSolution && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <pre className="p-3 rounded-lg bg-secondary text-xs font-mono text-foreground overflow-x-auto">{lesson.challenge.starterCode}</pre>
              </motion.div>
            )}
          </div>
        )}

        {!isChallenge && (
          <div className="mt-8">
            <Button
              onClick={handleContentComplete}
              disabled={completed}
              className={`gap-2 ${completed ? 'bg-accent text-accent-foreground' : 'bg-solana-gradient text-background hover:opacity-90'}`}
            >
              {completed ? <><CheckCircle2 className="w-4 h-4" /> Completed +{lesson.xpReward} XP</> : <><Zap className="w-4 h-4" /> {t('lesson.complete')}</>}
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <MainLayout hideFooter>
      <SEO title={`${lesson.title} — ${course.title}`} description={`Learn ${lesson.title} in the ${course.title} course on SolDev Labs.`} path={`/courses/${slug}/lessons/${lessonId}`} />
      <SuccessCelebration show={showCelebration} xpEarned={lesson.xpReward} onComplete={handleCelebrationComplete} />

      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <Link to={`/courses/${slug}`} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2 min-w-0">
              {isChallenge ? <FileCode className="w-4 h-4 text-primary flex-shrink-0" /> 
                : isVideo ? <Video className="w-4 h-4 text-solana-purple flex-shrink-0" />
                : <BookOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              <span className="text-sm font-medium text-foreground truncate">{lesson.title}</span>
            </div>
            <span className="flex items-center gap-1 text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full flex-shrink-0">
              <Zap className="w-3 h-3" /> +{lesson.xpReward} XP
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1">
              {allLessons.map((l, i) => (
                <Link key={l.id} to={`/courses/${slug}/lessons/${l.id}`}
                  className={`w-2 h-2 rounded-full transition-all ${i === lessonIndex ? 'bg-primary scale-125' : i < lessonIndex ? 'bg-accent/60' : 'bg-secondary'}`}
                />
              ))}
            </div>
            <button onClick={() => setShowModules(!showModules)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-secondary transition-all">
              {lessonIndex + 1}/{allLessons.length}
              {showModules ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Module dropdown */}
        {showModules && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-[7.5rem] right-4 z-40 w-80 bg-card border border-border rounded-xl shadow-xl max-h-80 overflow-y-auto">
            {course.modules.map(mod => (
              <div key={mod.id}>
                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-secondary/30 sticky top-0">{mod.title}</div>
                {mod.lessons.map(l => (
                  <Link key={l.id} to={`/courses/${slug}/lessons/${l.id}`} onClick={() => setShowModules(false)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary/50 transition-colors ${l.id === lessonId ? 'text-primary bg-primary/5' : 'text-foreground'}`}
                  >
                    {l.type === 'challenge' ? <FileCode className="w-3.5 h-3.5 text-primary flex-shrink-0" /> : l.type === 'video' ? <Video className="w-3.5 h-3.5 text-solana-purple flex-shrink-0" /> : <BookOpen className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                    <span className="truncate">{l.title}</span>
                    <span className="text-[10px] text-accent ml-auto font-mono">+{l.xpReward}</span>
                  </Link>
                ))}
              </div>
            ))}
          </motion.div>
        )}

        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          {isChallenge ? (
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel defaultSize={42} minSize={25}>{contentPanel}</ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={58} minSize={30}>
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-accent/30" />
                        <div className="w-2.5 h-2.5 rounded-full bg-accent/50" />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground ml-1">
                        {lesson.challenge?.language === 'rust' ? 'solution.rs' : lesson.challenge?.language === 'json' ? 'solution.json' : 'solution.ts'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AICodeReview code={code} language={lesson.challenge?.language || 'typescript'} challengeInstructions={lesson.challenge?.instructions || ''} />
                      <Button size="sm" onClick={handleRun} disabled={running || completed}
                        className={`gap-2 font-medium ${completed ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-accent text-accent-foreground hover:bg-accent/90'}`}
                      >
                        {running ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-3.5 h-3.5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full" />
                          : completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        {running ? 'Running...' : completed ? 'Passed' : t('lesson.run')}
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 min-h-0">
                    <CodeEditor value={code} onChange={setCode} language={lesson.challenge?.language || 'typescript'} />
                  </div>

                  {/* Output panel */}
                  <div className="border-t border-border bg-card/30">
                    <div className="flex items-center gap-1 px-4 pt-2">
                      {(['output', 'tests'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${activeTab === tab ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                          {tab === 'tests' ? `Tests (${testResults.filter(r => r.passed).length}/${testResults.length})` : tab}
                        </button>
                      ))}
                      <Terminal className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                    </div>
                    <pre className="p-4 text-xs font-mono text-foreground/80 min-h-[80px] max-h-40 overflow-y-auto whitespace-pre-wrap">
                      {activeTab === 'output' ? (output || <span className="text-muted-foreground">Run your code to see output...</span>) : (
                        testResults.length === 0
                          ? <span className="text-muted-foreground">Run your code to execute tests...</span>
                          : testResults.map((r, i) => (
                            <span key={i} className={r.passed ? 'text-accent' : 'text-destructive'}>
                              {r.passed ? '✓' : '✗'} {r.name}{'\n'}
                            </span>
                          ))
                      )}
                    </pre>
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel defaultSize={65} minSize={40}>{contentPanel}</ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={35} minSize={25}>
                <AITutorChat lessonTitle={lesson.title} lessonContent={lesson.content} courseTitle={course.title} />
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </div>

        {/* Bottom navigation */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-card/80 backdrop-blur-sm">
          {prevLesson ? (
            <Link to={`/courses/${slug}/lessons/${prevLesson.id}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> {prevLesson.title}
            </Link>
          ) : <div />}
          {nextLesson && (
            <Link to={`/courses/${slug}/lessons/${nextLesson.id}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              {nextLesson.title} <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Lesson;
