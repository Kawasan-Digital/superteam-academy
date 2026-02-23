import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Zap, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import logoImg from '@/assets/logo.png';

interface QuizQuestion {
  id: string;
  question: string;
  options: { label: string; value: string }[];
}

const questions: QuizQuestion[] = [
  {
    id: 'experience',
    question: 'What\'s your blockchain development experience?',
    options: [
      { label: '🌱 Complete beginner', value: 'beginner' },
      { label: '📚 Familiar with Web3 concepts', value: 'familiar' },
      { label: '💻 Built dApps on other chains', value: 'intermediate' },
      { label: '🚀 Experienced Solana developer', value: 'advanced' },
    ],
  },
  {
    id: 'language',
    question: 'Which programming languages do you know?',
    options: [
      { label: '🟨 JavaScript / TypeScript', value: 'js' },
      { label: '🦀 Rust', value: 'rust' },
      { label: '🐍 Python', value: 'python' },
      { label: '☕ Other (Java, C++, Go, etc.)', value: 'other' },
    ],
  },
  {
    id: 'goal',
    question: 'What do you want to build on Solana?',
    options: [
      { label: '💰 DeFi protocols (AMM, lending)', value: 'defi' },
      { label: '🎨 NFTs & digital assets', value: 'nft' },
      { label: '🎮 Games & metaverse', value: 'gaming' },
      { label: '🏗️ Infrastructure & tooling', value: 'infra' },
    ],
  },
  {
    id: 'pace',
    question: 'How much time can you dedicate weekly?',
    options: [
      { label: '⏰ 1-3 hours', value: 'casual' },
      { label: '📅 3-7 hours', value: 'moderate' },
      { label: '🔥 7-15 hours', value: 'dedicated' },
      { label: '💪 15+ hours (full-time learner)', value: 'fulltime' },
    ],
  },
];

const getRecommendedPath = (answers: Record<string, string>) => {
  if (answers.goal === 'defi') return { path: 'DeFi Developer', slug: 'defi-development' };
  if (answers.goal === 'nft') return { path: 'NFT & Gaming', slug: 'nft-compressed' };
  if (answers.experience === 'advanced') return { path: 'DeFi Developer', slug: 'defi-development' };
  return { path: 'Solana Fundamentals', slug: 'solana-fundamentals' };
};

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const isComplete = step >= questions.length;
  const recommendation = isComplete ? getRecommendedPath(answers) : null;

  const handleNext = () => {
    if (!selected) return;
    setAnswers(prev => ({ ...prev, [questions[step].id]: selected }));
    setSelected(null);
    setStep(s => s + 1);
  };

  return (
    <MainLayout>
      <SEO title="Get Started" description="Take a quick assessment to get a personalized learning path on SolDev Labs." path="/onboarding" />
      <div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[100px] pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          <div className="relative group/card">
            <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-b from-primary/25 via-border/30 to-border/10 opacity-60 group-hover/card:opacity-100 transition-opacity duration-500" />
            <div className="relative p-8 sm:p-10 rounded-3xl card-premium noise">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

              {/* Header */}
              <div className="text-center mb-8">
                <img src={logoImg} alt="SolDev Labs" className="w-12 h-12 rounded-xl mx-auto mb-4" />
                <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                  {isComplete ? 'Your Path is Ready!' : 'Skill Assessment'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isComplete ? 'Based on your answers, here\'s your recommended starting point.' : `Question ${step + 1} of ${questions.length}`}
                </p>
              </div>

              {/* Progress bar */}
              {!isComplete && (
                <div className="h-1.5 rounded-full bg-secondary/50 mb-8 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-solana-gradient"
                    animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}

              <AnimatePresence mode="wait">
                {isComplete ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 text-center">
                      <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-3" />
                      <h3 className="font-display text-xl font-bold text-foreground mb-1">
                        {recommendation?.path}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        We recommend starting with this learning path based on your experience and goals.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { icon: Code, label: 'Interactive', desc: 'Coding' },
                        { icon: Zap, label: 'Gamified', desc: 'XP System' },
                        { icon: BookOpen, label: 'Structured', desc: 'Path' },
                      ].map(item => (
                        <div key={item.label} className="p-3 rounded-xl bg-secondary/20 border border-border/20 text-center">
                          <item.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                          <p className="text-xs font-medium text-foreground">{item.label}</p>
                          <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => navigate(`/courses/${recommendation?.slug}`)}
                      className="w-full bg-solana-gradient text-background hover:opacity-90 font-semibold h-12 rounded-xl gap-2"
                    >
                      Start Learning <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => navigate('/courses')}
                      variant="outline"
                      className="w-full rounded-xl border-border/50"
                    >
                      Browse All Courses
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h2 className="font-medium text-foreground text-lg mb-4">
                      {questions[step].question}
                    </h2>
                    {questions[step].options.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setSelected(opt.value)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          selected === opt.value
                            ? 'border-primary/50 bg-primary/5 text-foreground'
                            : 'border-border/30 bg-secondary/5 text-muted-foreground hover:border-border/60 hover:text-foreground'
                        }`}
                      >
                        <span className="text-sm font-medium">{opt.label}</span>
                      </button>
                    ))}
                    <Button
                      onClick={handleNext}
                      disabled={!selected}
                      className="w-full bg-solana-gradient text-background hover:opacity-90 font-semibold h-11 rounded-xl gap-2 mt-4"
                    >
                      {step < questions.length - 1 ? 'Next' : 'See Results'}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Onboarding;
