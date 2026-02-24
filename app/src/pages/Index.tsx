import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Award, Flame, Users, BookOpen, Zap, Shield, Star, Mail, ChevronRight, Play, Terminal, Sparkles, TrendingUp, CheckCircle, Layers, Rocket, GraduationCap, Trophy, Target, GitBranch, Cpu, Wallet, MousePointer } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEO } from '@/components/SEO';
import { CourseCard } from '@/components/course/CourseCard';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { useTranslation } from '@/i18n/LanguageContext';
import { MOCK_TESTIMONIALS, MOCK_LEARNING_PATHS } from '@/services/mock-data';
import { useCourses } from '@/cms/useCMSContent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Typing words cycle ───
const CYCLE_WORDS = ['Learn.', 'Code.', 'Build.', 'Ship.'];

function useTypingCycle(words: string[], typingSpeed = 100, pauseMs = 1800, deleteSpeed = 60) {
  const [display, setDisplay] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplay(word.slice(0, display.length + 1));
        if (display.length + 1 === word.length) {
          setTimeout(() => setIsDeleting(true), pauseMs);
        }
      } else {
        setDisplay(word.slice(0, display.length - 1));
        if (display.length - 1 === 0) {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? deleteSpeed : typingSpeed);
    return () => clearTimeout(timeout);
  }, [display, isDeleting, wordIndex, words, typingSpeed, pauseMs, deleteSpeed]);

  return display;
}

// ─── Mouse glow tracker ───
function useMouseGlow(ref: React.RefObject<HTMLElement | null>) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    };
    el.addEventListener('mousemove', handler);
    return () => el.removeEventListener('mousemove', handler);
  }, [ref, mouseX, mouseY]);

  return { springX, springY };
}

// ─── 3D tilt hook ───
function useTilt() {
  const handleMouse = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.03)`;
  }, []);
  const handleLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)';
  }, []);
  return { onMouseMove: handleMouse, onMouseLeave: handleLeave };
}

const stats = [
  { key: 'stats.courses', value: 12, suffix: '+', icon: BookOpen },
  { key: 'stats.learners', value: 5000, suffix: '+', icon: Users, format: 'compact' as const },
  { key: 'stats.xp_earned', value: 1200000, suffix: '', icon: Zap, format: 'compact' as const },
  { key: 'stats.credentials', value: 890, suffix: '+', icon: Award },
];

const features = [
  { key: 'features.interactive', descKey: 'features.interactive_desc', icon: Terminal, color: 'text-primary', accent: 'bg-primary/10 border-primary/20', span: 'sm:col-span-2 sm:row-span-2' },
  { key: 'features.credentials', descKey: 'features.credentials_desc', icon: Award, color: 'text-accent', accent: 'bg-accent/10 border-accent/20', span: '' },
  { key: 'features.gamification', descKey: 'features.gamification_desc', icon: Flame, color: 'text-destructive', accent: 'bg-destructive/10 border-destructive/20', span: '' },
  { key: 'features.community', descKey: 'features.community_desc', icon: Shield, color: 'text-accent', accent: 'bg-accent/10 border-accent/20', span: 'sm:col-span-2' },
];

const partnerLogos = [
  { name: 'Solana Foundation', icon: (
    <svg viewBox="0 0 397 312" className="w-5 h-5" fill="currentColor"><path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z"/><path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z"/><path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"/></svg>
  )},
  { name: 'Superteam', icon: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
  )},
  { name: 'Metaplex', icon: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 2l10 6v8l-10 6-10-6V8l10-6zm0 2.18L4 9.09v5.82L12 19.82l8-4.91V9.09L12 4.18z"/><path d="M12 8l4 2.5v5L12 18l-4-2.5v-5L12 8z"/></svg>
  )},
  { name: 'Helius', icon: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><circle cx="12" cy="12" r="5"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
  )},
  { name: 'Dialect', icon: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg>
  )},
  { name: 'Anchor', icon: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" stroke="currentColor" strokeWidth="0.5"><path d="M12 2a3 3 0 00-3 3c0 1.3.84 2.4 2 2.82V11H9.5a.5.5 0 000 1H11v6.18A5.001 5.001 0 017 13H5a7 7 0 0014 0h-2a5.001 5.001 0 01-4 4.9V12h1.5a.5.5 0 000-1H13V7.82A3.001 3.001 0 0012 2zm0 2a1 1 0 110 2 1 1 0 010-2z"/></svg>
  )},
];

const howItWorksData = (t: (k: string) => string) => [
  { step: '01', title: t('how.step1_title'), desc: t('how.step1_desc'), icon: Target, color: 'text-primary' },
  { step: '02', title: t('how.step2_title'), desc: t('how.step2_desc'), icon: Code, color: 'text-accent' },
  { step: '03', title: t('how.step3_title'), desc: t('how.step3_desc'), icon: TrendingUp, color: 'text-primary' },
  { step: '04', title: t('how.step4_title'), desc: t('how.step4_desc'), icon: Award, color: 'text-accent' },
];

const techStack = [
  { name: 'Rust', icon: Cpu, desc: 'Systems programming' },
  { name: 'Anchor', icon: GitBranch, desc: 'Solana framework' },
  { name: 'Token-2022', icon: Layers, desc: 'Token extensions' },
  { name: 'Metaplex', icon: Wallet, desc: 'NFT standard' },
  { name: 'Web3.js', icon: Code, desc: 'Client SDK' },
  { name: 'React', icon: Zap, desc: 'Frontend dApps' },
];

const Index = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const { data: dbCourses = [] } = useCourses();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  
  // Typing effect
  const typingText = useTypingCycle(CYCLE_WORDS);
  
  // Mouse glow
  const { springX, springY } = useMouseGlow(heroRef);
  
  // 3D tilt for tech cards
  const tilt = useTilt();

  // Active how-it-works step on scroll
  const [activeStep, setActiveStep] = useState(0);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: howProgress } = useScroll({ target: howItWorksRef, offset: ['start 0.7', 'end 0.3'] });
  
  useEffect(() => {
    return howProgress.on('change', (v) => {
      setActiveStep(Math.min(3, Math.floor(v * 4)));
    });
  }, [howProgress]);

  return (
    <MainLayout>
      <SEO
        title="SolDev Labs"
        description="Master Solana development with interactive courses, coding challenges, and on-chain credentials. Learn by building real dApps."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: "SolDev Labs",
          description: "Interactive learning platform for Solana developers",
          url: "https://soldevlabs.lovable.app",
        }}
      />

      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative overflow-hidden min-h-[85vh] sm:min-h-[92vh] flex items-center">
        {/* Mouse-following glow */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-primary/8 blur-[180px] pointer-events-none hidden lg:block"
          style={{ left: springX, top: springY, x: '-50%', y: '-50%' }}
        />

        {/* Cinematic gradient mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,hsl(var(--primary)/0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_100%_50%,hsl(var(--accent)/0.08),transparent_60%)]" />
          <motion.div
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[5%] right-[10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[150px]"
          />
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            className="absolute bottom-[5%] left-[0%] w-[600px] h-[400px] rounded-full bg-accent/6 blur-[160px]"
          />
        </div>

        {/* Animated grid dots */}
        <div className="absolute inset-0 dot-grid opacity-[0.04] pointer-events-none" />
        <div className="absolute inset-0 line-pattern opacity-[0.03] pointer-events-none" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
          <div className="grid lg:grid-cols-[1fr_440px] gap-12 lg:gap-20 items-center">
            {/* Left — Copy */}
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-6">
                <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-border/50 bg-card/50 text-xs text-muted-foreground font-medium backdrop-blur-sm">
                  <span className="flex items-center gap-1.5 text-accent font-semibold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                    </span>
                    LIVE
                  </span>
                   <span className="w-px h-3 bg-border" />
                  {t('hero.powered_by')}
                </span>
              </motion.div>

              {/* Typing hero headline */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-display text-[2.75rem] sm:text-6xl lg:text-[5rem] font-bold tracking-[-0.03em] leading-[0.95] mb-6"
              >
                <span className="text-gradient block h-[1.1em] relative">
                  {typingText}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                    className="inline-block w-[4px] h-[0.85em] bg-primary ml-1 align-middle rounded-sm"
                  />
                </span>
                <span className="text-foreground block">Build.</span>
                <span className="text-gradient block">Ship on Solana.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-base sm:text-lg text-muted-foreground max-w-md mb-8 leading-relaxed"
              >
                {t('hero.subtitle')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3 mb-10"
              >
                <Link to="/courses">
                  <Button size="lg" className="relative bg-solana-gradient text-background hover:opacity-90 px-8 gap-2.5 font-semibold text-sm h-12 rounded-xl overflow-hidden group shadow-lg shadow-primary/20">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                    <span className="relative">{t('hero.cta_start')}</span> <ArrowRight className="w-4 h-4 relative group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button variant="outline" size="lg" className="border-border/50 text-muted-foreground hover:text-foreground px-6 gap-2 font-medium text-sm h-12 rounded-xl bg-card/30 backdrop-blur-sm hover:bg-card/60 group">
                    <Play className="w-4 h-4 group-hover:scale-110 transition-transform" /> {t('hero.watch_demo')}
                  </Button>
                </Link>
              </motion.div>

              {/* Quick trust signals */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-col gap-2 mb-10">
                {[t('hero.trust_1'), t('hero.trust_2'), t('hero.trust_3')].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex items-center gap-2 text-xs text-muted-foreground/70"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>{item}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Stats with staggered count-up */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.6 }} className="flex flex-wrap gap-8 sm:gap-10">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.key}
                    className="relative group cursor-default"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    {i > 0 && <div className="absolute -left-4 sm:-left-5 top-1/2 -translate-y-1/2 w-px h-8 bg-border/40 hidden sm:block" />}
                    <div className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight group-hover:text-gradient transition-all">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} format={stat.format || 'number'} duration={2} />
                    </div>
                    <div className="text-[11px] text-muted-foreground/60 mt-0.5 uppercase tracking-wider font-medium">{t(stat.key)}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right — Code terminal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.8 }}
              className="hidden lg:block relative"
            >
              <div className="absolute -inset-10 bg-primary/5 rounded-[40px] blur-3xl" />
              
              <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-card shadow-2xl shadow-primary/5 hover:shadow-primary/15 transition-shadow duration-700">
                <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
                    className="w-1/3 h-full bg-gradient-to-r from-transparent via-primary/60 to-transparent"
                  />
                </div>

                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-secondary/30">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive/50 hover:bg-destructive transition-colors cursor-pointer" />
                    <div className="w-2.5 h-2.5 rounded-full bg-accent/30 hover:bg-accent/60 transition-colors cursor-pointer" />
                    <div className="w-2.5 h-2.5 rounded-full bg-accent/50 hover:bg-accent transition-colors cursor-pointer" />
                  </div>
                  <div className="ml-3 flex gap-0.5">
                    <div className="px-3 py-1 rounded-md bg-card/80 text-[10px] text-foreground font-mono font-medium border border-border/30">counter.rs</div>
                    <div className="px-3 py-1 rounded-md text-[10px] text-muted-foreground/50 font-mono">test.ts</div>
                  </div>
                </div>

                <div className="relative">
                  <pre className="px-4 py-5 text-[13px] font-mono overflow-x-auto leading-[1.8]">
                    <code>
                      <span className="text-muted-foreground/30 select-none mr-4">1</span><span className="text-primary">use</span> <span className="text-accent">anchor_lang</span>::prelude::*;{'\n'}
                      <span className="text-muted-foreground/30 select-none mr-4">2</span>{'\n'}
                      <span className="text-muted-foreground/30 select-none mr-4">3</span><span className="text-muted-foreground/50">#[program]</span>{'\n'}
                      <span className="text-muted-foreground/30 select-none mr-4">4</span><span className="text-primary">pub mod</span> <span className="text-accent">counter</span> {'{\n'}
                      <span className="text-muted-foreground/30 select-none mr-4">5</span>{'  '}<span className="text-primary">pub fn</span> <span className="text-foreground">increment</span>(ctx: <span className="text-accent">Context</span>&lt;Inc&gt;) {'{\n'}
                      <span className="text-muted-foreground/30 select-none mr-4">6</span>{'    '}ctx.accounts.counter.count <span className="text-primary">+=</span> <span className="text-accent">1</span>;{'\n'}
                      <span className="text-muted-foreground/30 select-none mr-4">7</span>{'    '}<span className="text-muted-foreground/50">msg!</span>(<span className="text-accent/70">"Count: {'{}'}"</span>, ctx...);{'\n'}
                      <span className="text-muted-foreground/30 select-none mr-4">8</span>{'    '}Ok(()){'\n'}
                      <span className="text-muted-foreground/30 select-none mr-4">9</span>{'  }\n'}
                      <span className="text-muted-foreground/30 select-none mr-3">10</span>{'}'}
                    </code>
                  </pre>
                </div>

                <div className="px-4 py-2.5 border-t border-border/40 bg-secondary/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="flex items-center gap-1.5 text-accent"><span className="w-1.5 h-1.5 rounded-full bg-accent" /> All tests passed</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-primary font-bold">
                    <Sparkles className="w-3 h-3" /> +50 XP
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="absolute -bottom-5 -left-8 z-10">
                <motion.div whileHover={{ scale: 1.08, rotate: -2 }} className="p-3 rounded-xl bg-card border border-border/40 flex items-center gap-3 shadow-xl shadow-background/50 backdrop-blur-sm cursor-default">
                  <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center text-base">🔥</div>
                  <div>
                    <p className="text-xs font-bold text-foreground">12-Day Streak</p>
                    <p className="text-[10px] text-muted-foreground">Keep it going</p>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }} className="absolute -top-3 -right-5 z-10">
                <motion.div whileHover={{ scale: 1.08, rotate: 2 }} className="p-2.5 rounded-xl bg-card border border-border/40 flex items-center gap-2 shadow-xl shadow-background/50 backdrop-blur-sm cursor-default">
                  <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <span className="text-xs font-mono font-bold text-foreground">2,450 XP</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══ PARTNERS — Infinite Marquee ═══ */}
      <section className="border-y border-border/20 bg-card/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-8 sm:gap-12">
            <span className="text-[10px] text-muted-foreground/70 uppercase tracking-[0.25em] font-semibold whitespace-nowrap shrink-0">{t('landing.ecosystem')}</span>
            <div className="w-px h-4 bg-border/40 shrink-0" />
            <div className="flex-1 overflow-hidden relative">
              {/* Fade edges */}
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
              <div className="marquee-track">
                {[...partnerLogos, ...partnerLogos].map((partner, i) => (
                  <div
                    key={`${partner.name}-${i}`}
                    className="flex items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors duration-300 whitespace-nowrap shrink-0 mx-6 sm:mx-8"
                  >
                    <span className="text-lg">{partner.icon}</span>
                    <span className="text-xs font-medium">{partner.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS — Interactive Steps ═══ */}
      <section ref={howItWorksRef} className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(var(--primary)/0.06),transparent_70%)]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-4 inline-flex items-center gap-3">
              <span className="w-8 h-px bg-accent/50" /> {t('how.label')} <span className="w-8 h-px bg-accent/50" />
            </p>
            <h2 className="font-display text-3xl sm:text-[2.75rem] font-bold text-foreground leading-[1.1] mb-4">{t('how.title')}</h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">{t('how.desc')}</p>
          </motion.div>

          {/* Progress bar */}
          <div className="hidden lg:block max-w-3xl mx-auto mb-10">
            <div className="h-1 rounded-full bg-border/30 relative overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-solana-gradient"
                style={{ width: `${((activeStep + 1) / 4) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorksData(t).map((item, i) => {
              const isActive = i <= activeStep;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="relative group cursor-default"
                >
                  {/* Connector line */}
                  {i < 3 && <div className="hidden lg:block absolute top-10 left-[calc(100%+0.5rem)] w-[calc(100%-1rem)] h-px bg-gradient-to-r from-border/40 to-border/10 z-0" />}
                  
                  <div className={`relative p-6 rounded-2xl border transition-all duration-500 h-full ${
                    isActive 
                      ? 'bg-card/90 border-primary/30 shadow-lg shadow-primary/5' 
                      : 'bg-card/60 border-border/30 group-hover:border-primary/20 group-hover:bg-card/90'
                  }`}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`text-[2rem] font-display font-black leading-none transition-colors duration-500 ${isActive ? 'text-primary/40' : 'text-primary/15'}`}>{item.step}</span>
                      <motion.div
                        animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                        transition={{ duration: 0.5 }}
                        className={`w-10 h-10 rounded-xl bg-card border flex items-center justify-center transition-all ${
                          isActive ? 'border-primary/40 shadow-lg shadow-primary/20 scale-110' : 'border-border/40 group-hover:scale-110 group-hover:shadow-lg group-hover:border-primary/30'
                        }`}
                      >
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                      </motion.div>
                    </div>
                    <h3 className="font-display font-semibold text-foreground mb-2 text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES — Bento Grid ═══ */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,hsl(var(--primary)/0.06),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_20%,hsl(var(--accent)/0.04),transparent_60%)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 max-w-xl">
            <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4 flex items-center gap-3">
              <span className="w-8 h-px bg-primary/50" /> {t('features.why')}
            </p>
            <h2 className="font-display text-3xl sm:text-[2.75rem] font-bold text-foreground leading-[1.1] mb-4">{t('features.title')}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{t('features.subtitle')}</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* Interactive Coding — Large card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative group lg:col-span-2"
            >
              <div className="relative rounded-2xl bg-card border border-border/40 overflow-hidden transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-2xl group-hover:shadow-primary/10">
                {/* Top gradient accent bar */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-accent to-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-accent/[0.04]" />
                
                {/* Header */}
                <div className="relative p-5 sm:p-6 pb-0">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ rotate: 12, scale: 1.15 }}
                        className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center transition-all group-hover:shadow-lg group-hover:shadow-primary/25 group-hover:bg-primary/20"
                      >
                        <Terminal className="w-5 h-5 text-primary" />
                      </motion.div>
                      <div>
                        <h3 className="font-display font-bold text-foreground text-base">{t('features.interactive')}</h3>
                        <p className="text-xs text-muted-foreground">{t('features.interactive_desc')}</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1.5 rounded-lg bg-accent/15 border border-accent/25 text-accent text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm shadow-accent/10 cursor-pointer"
                      >
                        <Play className="w-3 h-3" /> Run
                      </motion.span>
                    </div>
                  </div>
                </div>

                {/* Code editor mock */}
                <div className="relative mx-5 sm:mx-6 mb-5 sm:mb-6 rounded-xl overflow-hidden border border-border/50 bg-[hsl(228,22%,4%)] shadow-inner">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
                    <motion.div
                      animate={{ y: ['-100%', '200%'] }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
                      className="w-full h-8 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent"
                    />
                  </div>

                  <div className="flex items-center px-3 py-2 border-b border-border/30 bg-[hsl(228,18%,7%)]">
                    <div className="flex gap-1.5 mr-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-accent/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-accent/60" />
                    </div>
                    <div className="flex gap-0.5">
                      <div className="px-3 py-1 rounded-t-md bg-[hsl(228,22%,4%)] text-[10px] text-foreground/90 font-mono font-medium border-t border-x border-primary/30 relative">
                        transfer.rs
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-primary/40" />
                      </div>
                      <div className="px-3 py-1 text-[10px] text-muted-foreground/40 font-mono hover:text-muted-foreground/60 cursor-pointer transition-colors">test.ts</div>
                      <div className="px-3 py-1 text-[10px] text-muted-foreground/30 font-mono">Cargo.toml</div>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="px-3 py-3 text-right select-none border-r border-border/20 bg-[hsl(228,18%,5%)]">
                      {Array.from({length: 15}, (_, i) => (
                        <div key={i} className={`text-[11px] font-mono leading-[1.65] ${i >= 4 && i <= 8 ? 'text-muted-foreground/50' : 'text-muted-foreground/20'}`}>{i + 1}</div>
                      ))}
                    </div>
                    <div className="flex-1 py-3 px-4 overflow-hidden relative">
                      <div className="absolute left-0 right-0 top-[calc(0.75rem+1.65em*4)] h-[1.65em] bg-primary/[0.04] pointer-events-none" />
                      <pre className="text-[11px] font-mono leading-[1.65]">
                        <code>
                          <span className="text-primary font-semibold">use</span> <span className="text-accent">anchor_lang</span>::prelude::*;{'\n'}
                          {'\n'}
                          <span className="text-muted-foreground/50">#[program]</span>{'\n'}
                          <span className="text-primary font-semibold">pub mod</span> <span className="text-accent">sol_transfer</span> {'{\n'}
                          {'  '}<span className="text-primary font-semibold">pub fn</span> <span className="text-foreground font-medium">transfer</span>({'\n'}
                          {'    '}ctx: <span className="text-accent">Context</span>&lt;Transfer&gt;,{'\n'}
                          {'    '}amount: <span className="text-accent">u64</span>{'\n'}
                          {'  '}) -&gt; <span className="text-primary">Result</span>&lt;()&gt; {'{\n'}
                          {'    '}<span className="text-primary">require!</span>(amount &gt; <span className="text-accent">0</span>, <span className="text-destructive">Err</span>::Zero);{'\n'}
                          {'    '}anchor_lang::system_program{'\n'}
                          {'      '}::transfer(ctx.accounts{'\n'}
                          {'        '}.into_ctx(), amount)?;{'\n'}
                          {'    '}<span className="text-primary">msg!</span>(<span className="text-accent/80">"Sent {} lamports"</span>, amount);{'\n'}
                          {'    '}Ok(())  {'\n'}
                          {'  }'}{'\n'}
                          {'}'}
                        </code>
                      </pre>
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
                        className="inline-block w-[2px] h-[14px] bg-accent ml-0.5 -mb-0.5"
                      />
                    </div>
                  </div>

                  <div className="border-t border-border/30 bg-[hsl(228,18%,6%)]">
                    <div className="px-3 py-1.5 border-b border-border/20 flex items-center gap-2">
                      <span className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        Terminal
                      </span>
                    </div>
                    <div className="px-3 py-2.5 text-[10px] font-mono space-y-1">
                      <div className="text-muted-foreground/50">$ anchor test</div>
                      <div className="text-accent flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3" /> <span>test_transfer ... <span className="font-bold">ok</span></span>
                      </div>
                      <div className="text-accent flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3" /> <span>test_zero_amount ... <span className="font-bold">ok</span></span>
                      </div>
                      <div className="text-accent flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3" /> <span>test_insufficient ... <span className="font-bold">ok</span></span>
                      </div>
                      <div className="flex items-center justify-between pt-1.5 border-t border-border/20 mt-1.5">
                        <span className="text-accent font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-accent" />
                          3 passed · 0 failed
                        </span>
                        <span className="text-primary font-bold flex items-center gap-1"><Sparkles className="w-3 h-3" /> +75 XP earned!</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* On-Chain Credentials */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              whileHover={{ y: -4 }}
              className="relative group"
            >
              <div className="relative p-6 rounded-2xl bg-card border border-border/40 h-full transition-all duration-500 group-hover:border-accent/40 group-hover:shadow-2xl group-hover:shadow-accent/10 overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent to-primary opacity-40 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.05] via-transparent to-primary/[0.04]" />
                
                <div className="relative mb-5">
                  <motion.div whileHover={{ rotate: -8, scale: 1.15 }} className="w-11 h-11 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center mb-4 transition-all group-hover:shadow-lg group-hover:shadow-accent/25 group-hover:bg-accent/20">
                    <Award className="w-5 h-5 text-accent" />
                  </motion.div>
                  <h3 className="font-display font-bold text-foreground mb-1.5 text-base">{t('features.credentials')}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t('features.credentials_desc')}</p>
                </div>

                <div className="relative mt-auto">
                  <div className="absolute -top-2 left-3 right-3 h-full rounded-xl border border-accent/10 bg-accent/[0.03] -z-20" />
                  <div className="absolute -top-1 left-1.5 right-1.5 h-full rounded-xl border border-accent/15 bg-accent/[0.02] -z-10" />
                  
                  <motion.div whileHover={{ scale: 1.02 }} className="p-4 rounded-xl border border-accent/25 bg-gradient-to-br from-accent/[0.08] to-primary/[0.06] shadow-lg shadow-accent/5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-solana-gradient flex items-center justify-center shrink-0 shadow-lg shadow-primary/25">
                        <GraduationCap className="w-5 h-5 text-background" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground truncate">Anchor Developer</p>
                        <p className="text-[10px] text-accent font-mono">Soulbound NFT · Verified</p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                        <CheckCircle className="w-3.5 h-3.5 text-accent" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2.5 border-t border-accent/15">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className="w-3 h-3 text-accent fill-accent" />
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground ml-auto font-mono font-medium">Level 5</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Gamified Learning */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.12 }}
              whileHover={{ y: -4 }}
              className="relative group"
            >
              <div className="relative p-6 rounded-2xl bg-card border border-border/40 h-full transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-2xl group-hover:shadow-primary/10 overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-destructive opacity-40 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] via-transparent to-destructive/[0.04]" />
                
                <div className="relative mb-5">
                  <motion.div whileHover={{ rotate: 12, scale: 1.15 }} className="w-11 h-11 rounded-xl bg-destructive/15 border border-destructive/25 flex items-center justify-center mb-4 transition-all group-hover:shadow-lg group-hover:shadow-destructive/25 group-hover:bg-destructive/20">
                    <Flame className="w-5 h-5 text-destructive" />
                  </motion.div>
                  <h3 className="font-display font-bold text-foreground mb-1.5 text-base">{t('features.gamification')}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t('features.gamification_desc')}</p>
                </div>

                <div className="relative mt-auto space-y-3">
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border/20">
                    <div className="flex items-center justify-between text-[10px] mb-2">
                      <span className="text-foreground font-bold flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-md bg-solana-gradient flex items-center justify-center text-[9px] text-background font-black shadow-sm shadow-primary/20">12</span>
                        Level 12
                      </span>
                      <span className="text-primary font-bold font-mono">2,450 / 3,000</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: '82%' }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
                        className="h-full rounded-full bg-solana-gradient relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-gradient-shift bg-[length:200%_100%]" />
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background shadow-lg shadow-primary/30" />
                      </motion.div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {[
                      { emoji: '🔥', label: '12 streak', bg: 'bg-destructive/10 border-destructive/20' },
                      { emoji: '⚡', label: 'Speed', bg: 'bg-accent/10 border-accent/20' },
                      { emoji: '🏆', label: 'Top 10', bg: 'bg-primary/10 border-primary/20' },
                      { emoji: '💎', label: 'Perfect', bg: 'bg-accent/10 border-accent/20' },
                    ].map((badge, j) => (
                      <motion.div
                        key={j}
                        whileHover={{ scale: 1.12, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-1 py-2 rounded-lg ${badge.bg} border flex flex-col items-center gap-0.5 cursor-default`}
                      >
                        <span className="text-sm">{badge.emoji}</span>
                        <span className="text-[7px] text-muted-foreground font-medium">{badge.label}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-destructive/[0.08] border border-destructive/20">
                    <div className="text-lg">🔥</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-foreground">12-Day Streak!</p>
                      <p className="text-[8px] text-muted-foreground">Don't break the chain</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(7)].map((_, d) => (
                        <motion.div
                          key={d}
                          initial={{ height: 0 }}
                          whileInView={{ height: 14 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.8 + d * 0.08 }}
                          className={`w-2 rounded-sm ${d < 5 ? 'bg-accent shadow-sm shadow-accent/30' : 'bg-secondary/60'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Community Driven — Wide card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative group lg:col-span-2"
            >
              <div className="relative p-6 sm:p-7 rounded-2xl bg-card border border-border/40 h-full transition-all duration-500 group-hover:border-accent/40 group-hover:shadow-2xl group-hover:shadow-accent/10 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent via-primary to-accent opacity-40 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-r from-accent/[0.04] via-transparent to-primary/[0.03]" />
                
                <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="flex items-center gap-3 flex-1">
                    <motion.div whileHover={{ rotate: -8, scale: 1.15 }} className="w-11 h-11 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center shrink-0 transition-all group-hover:shadow-lg group-hover:shadow-accent/25 group-hover:bg-accent/20">
                      <Users className="w-5 h-5 text-accent" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-foreground mb-1 text-base">{t('features.community')}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{t('features.community_desc')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="flex -space-x-2.5">
                      {['A', 'M', 'K', 'S', 'R', 'J'].map((letter, j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + j * 0.05 }}
                          whileHover={{ y: -4, zIndex: 10 }}
                          className="w-9 h-9 rounded-full bg-solana-gradient flex items-center justify-center text-background text-[10px] font-bold border-2 border-card shadow-md cursor-default"
                        >
                          {letter}
                        </motion.div>
                      ))}
                      <div className="w-9 h-9 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-[9px] text-muted-foreground font-bold shadow-md">
                        +5K
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-sm shadow-accent/50" />
                        <span className="text-foreground font-bold">142 {t('landing.online_now')}</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground">Discord · GitHub · Forum</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ WHAT YOU'LL LEARN — Tech Stack with 3D Tilt ═══ */}
      <section className="py-20 sm:py-28 relative overflow-hidden border-y border-border/10">
        <div className="absolute inset-0 bg-gradient-to-b from-card/30 via-transparent to-card/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4 inline-flex items-center gap-3">
              <span className="w-8 h-px bg-primary/50" /> {t('landing.tech_stack')} <span className="w-8 h-px bg-primary/50" />
            </p>
            <h2 className="font-display text-3xl sm:text-[2.75rem] font-bold text-foreground leading-[1.1] mb-4">{t('landing.tech_stack_title')}</h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">{t('landing.tech_subtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group"
              >
                <div
                  onMouseMove={tilt.onMouseMove}
                  onMouseLeave={tilt.onMouseLeave}
                  className="relative p-5 rounded-2xl bg-card/60 border border-border/30 text-center transition-all duration-300 group-hover:border-primary/25 group-hover:bg-card/90 group-hover:shadow-xl group-hover:shadow-primary/10 will-change-transform"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Glow on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 8 }}
                    className="w-12 h-12 rounded-xl bg-primary/5 border border-border/30 flex items-center justify-center mx-auto mb-3 transition-colors group-hover:bg-primary/10"
                  >
                    <tech.icon className="w-5 h-5 text-primary" />
                  </motion.div>
                  <h3 className="font-display font-bold text-foreground text-sm mb-0.5">{tech.name}</h3>
                  <p className="text-[10px] text-muted-foreground">{tech.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ LEARNING PATHS ═══ */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/20 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-accent/50" /> {t('landing.structured_learning')}
              </p>
              <h2 className="font-display text-3xl sm:text-[2.75rem] font-bold text-foreground leading-[1.1] mb-3">{t('landing.curated_paths')}</h2>
              <p className="text-muted-foreground text-sm max-w-md">{t('landing.curated_paths_desc')}</p>
            </div>
            <Link to="/courses" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1.5 font-medium transition-colors group shrink-0">
              {t('landing.view_all_paths')} <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {MOCK_LEARNING_PATHS.map((path, i) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group"
              >
                <Link to="/courses" className="block h-full">
                  <div className="rounded-2xl bg-card/60 border border-border/30 overflow-hidden p-6 sm:p-7 h-full transition-all duration-500 group-hover:border-primary/20 group-hover:bg-card/90 group-hover:shadow-xl group-hover:shadow-primary/5 relative">
                    <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${path.color} opacity-40 group-hover:opacity-80 transition-opacity`} />
                    <motion.div whileHover={{ scale: 1.15, rotate: -5 }} className="text-3xl mb-5 inline-block">{path.icon}</motion.div>
                    <h3 className="font-display font-bold text-foreground mb-2.5 text-base group-hover:text-primary transition-colors">{path.name}</h3>
                    <p className="text-sm text-muted-foreground mb-5 leading-relaxed line-clamp-2">{path.description}</p>
                    <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
                      {path.courseIds.length} {t('landing.courses_count')} <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COURSES ═══ */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-primary/50" /> {t('landing.start_building')}
              </p>
              <h2 className="font-display text-3xl sm:text-[2.75rem] font-bold text-foreground leading-[1.1] mb-3">{t('courses.title')}</h2>
              <p className="text-muted-foreground text-sm max-w-md">{t('landing.courses_desc')}</p>
            </div>
            <Link to="/courses" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1.5 font-medium transition-colors group shrink-0">
              {t('landing.all_courses')} <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dbCourses.slice(0, 4).map((course, i) => (
              <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <CourseCard course={course} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-card/20 via-transparent to-card/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-4 inline-flex items-center gap-3">
              <span className="w-8 h-px bg-accent/50" /> {t('landing.testimonials_label')} <span className="w-8 h-px bg-accent/50" />
            </p>
            <h2 className="font-display text-3xl sm:text-[2.75rem] font-bold text-foreground leading-[1.1] mb-4">{t('landing.testimonials')}</h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">{t('landing.testimonials_subtitle')}</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-4">
            {MOCK_TESTIMONIALS.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group"
              >
                <div className="relative p-6 sm:p-7 rounded-2xl bg-card/60 border border-border/30 transition-all duration-500 group-hover:border-primary/15 group-hover:bg-card/80 group-hover:shadow-xl group-hover:shadow-primary/5 h-full overflow-hidden">
                  <div className="absolute top-0 left-6 w-8 h-0.5 bg-solana-gradient opacity-40 group-hover:w-16 transition-all duration-500" />
                  <div className="flex gap-0.5 mb-5 mt-2">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <motion.div key={j} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + j * 0.05, type: 'spring' }}>
                        <Star className="w-3 h-3 text-accent fill-accent" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3 mt-auto">
                    <motion.div whileHover={{ scale: 1.1 }} className="w-8 h-8 rounded-full bg-solana-gradient flex items-center justify-center text-background font-bold text-[11px] shrink-0">
                      {testimonial.avatar}
                    </motion.div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-[11px] text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-[2rem] overflow-hidden"
          >
            <div className="absolute inset-0 bg-card" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_0%,hsl(var(--primary)/0.08),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_100%_100%,hsl(var(--accent)/0.06),transparent_50%)]" />
            <div className="absolute inset-0 line-pattern opacity-[0.03]" />
            <div className="absolute inset-0 rounded-[2rem] border border-border/30" />

            {/* Floating particles in CTA */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -30, 0],
                    x: [0, (i % 2 === 0 ? 15 : -15), 0],
                    opacity: [0.2, 0.6, 0.2],
                  }}
                  transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
                  className="absolute w-1.5 h-1.5 rounded-full bg-primary/30"
                  style={{ left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%` }}
                />
              ))}
            </div>

            <div className="relative text-center py-20 sm:py-24 px-6 sm:px-12">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/30 bg-secondary/30 text-[11px] text-muted-foreground font-medium mb-8 cursor-default"
                >
                  <Sparkles className="w-3 h-3 text-primary" /> {t('landing.cta_free')}
                </motion.div>
                <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-5 leading-[1.05] tracking-[-0.02em]">
                  {t('landing.cta_title')}<br /><span className="text-gradient">Solana</span>?
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-10 text-sm sm:text-base">
                  {t('landing.cta_desc')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/courses">
                    <Button size="lg" className="relative bg-solana-gradient text-background hover:opacity-90 px-10 gap-2.5 font-semibold rounded-xl h-13 text-sm overflow-hidden group shadow-lg shadow-primary/20">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                      <span className="relative">{t('hero.cta_start')}</span> <ArrowRight className="w-4 h-4 relative group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/leaderboard">
                    <Button variant="outline" size="lg" className="border-border/50 text-muted-foreground hover:text-foreground px-6 gap-2 font-medium text-sm h-13 rounded-xl bg-card/30 hover:bg-card/60">
                      <Trophy className="w-4 h-4" /> {t('landing.view_leaderboard')}
                    </Button>
                  </Link>
                </div>

                {/* Newsletter */}
                <div className="max-w-sm mx-auto mt-12">
                  <p className="text-xs text-muted-foreground/50 mb-3">{t('landing.weekly_tips')}</p>
                  {subscribed ? (
                    <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-sm text-accent font-bold">
                      ✓ Subscribed!
                    </motion.p>
                  ) : (
                    <form onSubmit={e => { e.preventDefault(); if (email) setSubscribed(true); }} className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="dev@solana.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="bg-secondary/30 border-border/30 flex-1 rounded-xl text-sm"
                        required
                      />
                      <Button type="submit" variant="outline" className="gap-2 border-border/30 text-foreground rounded-xl hover:bg-primary/5 px-4">
                        <Mail className="w-4 h-4" />
                      </Button>
                    </form>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
