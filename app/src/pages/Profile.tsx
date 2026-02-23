import { motion } from 'framer-motion';
import { Github, Twitter, Calendar, ExternalLink } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEO } from '@/components/SEO';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { LevelBadge } from '@/components/gamification/LevelBadge';
import { AchievementGrid } from '@/components/gamification/AchievementGrid';
import { NFTCredentialGallery } from '@/components/wallet/NFTCredentialGallery';
import { useTranslation } from '@/i18n/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { MOCK_ACHIEVEMENTS, MOCK_CREDENTIALS } from '@/services/mock-data';
import { useCourses } from '@/cms/useCMSContent';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { data: allCourses = [] } = useCourses();

  const displayName = profile?.display_name || 'Developer';
  const username = profile?.username || 'user';
  const bio = profile?.bio || '';
  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const streak = profile?.streak ?? 0;
  const joinedAt = profile?.joined_at || new Date().toISOString();
  const githubUsername = profile?.github_username;
  const twitterUsername = profile?.twitter_username;
  const walletAddress = profile?.wallet_address;

  const skills: Record<string, number> = { Rust: 65, Anchor: 45, Frontend: 80, Security: 30, DeFi: 20, NFTs: 55 };
  const skillEntries = Object.entries(skills);
  const maxSkill = Math.max(...skillEntries.map(([, v]) => v));

  return (
    <MainLayout>
      <SEO title="My Profile" description="View your SolDev Labs profile, on-chain credentials, achievements, and learning stats." path="/profile" />

      {/* Hero banner with gradient orbs */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient-hero" />
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px] animate-pulse-glow" />
        <div className="absolute -top-10 right-10 w-[300px] h-[300px] rounded-full bg-accent/8 blur-[80px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-12">
        {/* Profile header card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group/header mb-8"
        >
          {/* Hover glow */}
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-primary/20 via-border/30 to-border/10 opacity-0 group-hover/header:opacity-100 transition-opacity duration-500" />
          <div className="relative p-6 rounded-2xl card-premium noise">
            {/* Shimmer line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="relative flex-shrink-0">
                <div className="absolute -inset-2 rounded-2xl bg-accent/15 blur-lg animate-pulse-glow" />
                <div className="w-24 h-24 rounded-2xl bg-solana-gradient flex items-center justify-center text-4xl font-bold text-background ring-4 ring-background shadow-xl relative">
                  {displayName[0]?.toUpperCase() || 'D'}
                </div>
                <div className="absolute -bottom-1 -right-1">
                  <LevelBadge level={level} size="sm" showLabel={false} />
                </div>
              </div>

              <div className="flex-1 pt-2">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h1 className="font-display text-2xl font-bold text-foreground">{displayName}</h1>
                  <span className="text-xs font-mono text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded-lg border border-border/30">@{username}</span>
                </div>
                {bio && <p className="text-sm text-muted-foreground mt-1 max-w-lg">{bio}</p>}

                <div className="flex items-center gap-4 mt-3 flex-wrap text-sm">
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <span className="text-accent">⚡</span> {xp.toLocaleString()} XP
                  </span>
                  <span className="text-muted-foreground">Level {level}</span>
                  <span className="text-muted-foreground">🔥 {streak} day streak</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" /> Joined {new Date(joinedAt).toLocaleDateString('en', { month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  {githubUsername && (
                    <a href={`https://github.com/${githubUsername}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {twitterUsername && (
                    <a href={`https://twitter.com/${twitterUsername}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {walletAddress && (
                    <a
                      href={`https://explorer.solana.com/address/${walletAddress}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono text-muted-foreground bg-secondary/50 px-2 py-1 rounded-lg flex items-center gap-1 hover:text-foreground transition-colors border border-border/20"
                    >
                      {walletAddress.length > 12 ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : walletAddress}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  <Link to="/settings" className="ml-auto">
                    <Button variant="outline" size="sm" className="border-border text-foreground text-xs">{t('profile.edit')}</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* XP Progress with glow */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative group/xp mb-8">
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 opacity-0 group-hover/xp:opacity-100 transition-opacity duration-500" />
          <div className="relative p-5 rounded-2xl card-premium noise">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
            <XPProgressBar currentXP={xp} currentLevel={level} size="lg" />
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-8">
            {/* Skills with hover glow */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative group/skills">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-primary/15 via-border/20 to-border/5 opacity-0 group-hover/skills:opacity-100 transition-opacity duration-500" />
              <div className="relative p-6 rounded-2xl card-premium noise">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-px w-6 bg-primary/60" />
                  <h3 className="font-display font-semibold text-foreground">{t('profile.skills')}</h3>
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
                      <span className="text-[10px] text-muted-foreground w-8 text-right font-mono">{value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* NFT Credentials */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px w-6 bg-primary/60" />
                <h3 className="font-display font-semibold text-foreground">{t('profile.credentials')}</h3>
              </div>
              <NFTCredentialGallery credentials={MOCK_CREDENTIALS} />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements with hover glow */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="relative group/ach">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-accent/15 via-border/20 to-border/5 opacity-0 group-hover/ach:opacity-100 transition-opacity duration-500" />
              <div className="relative p-6 rounded-2xl card-premium noise">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px w-6 bg-accent/60" />
                  <h3 className="font-display font-semibold text-foreground">{t('profile.achievements')}</h3>
                </div>
                <AchievementGrid achievements={MOCK_ACHIEVEMENTS} columns={3} />
              </div>
            </motion.div>

            {/* Completed courses with hover glow */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="relative group/completed">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-primary/15 via-border/20 to-border/5 opacity-0 group-hover/completed:opacity-100 transition-opacity duration-500" />
              <div className="relative p-6 rounded-2xl card-premium noise">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px w-6 bg-primary/60" />
                  <h3 className="font-display font-semibold text-foreground">{t('profile.completed')}</h3>
                </div>
                <div className="space-y-2">
                  {allCourses.slice(0, 2).map(c => (
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

export default Profile;
