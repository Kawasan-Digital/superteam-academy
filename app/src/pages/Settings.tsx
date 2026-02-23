import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Globe, Bell, Wallet, Sun, Moon, Link2, Unlink, CheckCircle2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEO } from '@/components/SEO';
import { useTranslation } from '@/i18n/LanguageContext';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { lovable } from '@/integrations/lovable/index';
import { Language } from '@/i18n/translations';

const tabs = [
  { id: 'profile', icon: User, key: 'settings.profile' },
  { id: 'account', icon: Shield, key: 'settings.account' },
  { id: 'preferences', icon: Globe, key: 'settings.preferences' },
  { id: 'privacy', icon: Bell, key: 'settings.privacy' },
];

const PremiumCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className="relative group/card">
    <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-primary/20 via-border/30 to-border/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
    <div className={`relative rounded-2xl card-premium noise ${className}`}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      {children}
    </div>
  </div>
);

const Settings = () => {
  const { t, language, setLanguage } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const { publicKey, connected, select, disconnect, wallets } = useWallet();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  // Profile form state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [github, setGithub] = useState('');
  const [twitter, setTwitter] = useState('');
  const [profilePublic, setProfilePublic] = useState(true);

  // Sync form state with profile
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setUsername(profile.username || '');
      setGithub(profile.github_username || '');
      setTwitter(profile.twitter_username || '');
      setProfilePublic(profile.profile_public);
    }
  }, [profile]);

  // Save wallet address to profile when connected
  useEffect(() => {
    if (connected && publicKey && profile && !profile.wallet_address) {
      updateProfile({
        wallet_address: publicKey.toBase58(),
        wallet_connected: true,
      });
    }
  }, [connected, publicKey, profile]);

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await updateProfile({
      display_name: displayName,
      bio: bio || null,
      username: username || null,
      github_username: github || null,
      twitter_username: twitter || null,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile updated!' });
    }
    setSaving(false);
  };

  const handleConnectWallet = async () => {
    const phantom = wallets.find(w => w.adapter.name === 'Phantom');
    if (phantom) {
      select(phantom.adapter.name);
    } else if (wallets.length > 0) {
      select(wallets[0].adapter.name);
    }
  };

  const handleDisconnectWallet = async () => {
    await disconnect();
    await updateProfile({ wallet_address: null, wallet_connected: false });
    toast({ title: 'Wallet disconnected' });
  };

  const handleLinkGoogle = async () => {
    const { error } = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin + '/settings',
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const truncateAddress = (addr: string) =>
    addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

  const walletAddress = profile?.wallet_address || (connected && publicKey ? publicKey.toBase58() : null);

  return (
    <MainLayout>
      <SEO title="Settings" description="Manage your SolDev Labs account, preferences, connected wallets, and privacy settings." path="/settings" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Background orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px w-8 bg-gradient-to-r from-primary to-transparent" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Account</span>
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground">{t('settings.title')}</h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-8">
            {/* Tabs sidebar */}
            <PremiumCard className="sm:w-56 p-2">
              <div className="flex sm:flex-col gap-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                      activeTab === tab.id
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="settings-tab"
                        className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <tab.icon className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{t(tab.key)}</span>
                  </button>
                ))}
              </div>
            </PremiumCard>

            {/* Content */}
            <div className="flex-1">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'profile' && (
                  <PremiumCard className="p-8 space-y-6">
                    <div className="space-y-2">
                      <Label className="text-foreground text-sm font-medium">Display Name</Label>
                      <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="bg-background/50 border-border/50 rounded-xl focus:border-primary/40" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground text-sm font-medium">Username</Label>
                      <Input value={username} onChange={e => setUsername(e.target.value)} className="bg-background/50 border-border/50 rounded-xl" placeholder="@username" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground text-sm font-medium">Bio</Label>
                      <Textarea value={bio} onChange={e => setBio(e.target.value)} className="bg-background/50 border-border/50 rounded-xl min-h-[100px]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-foreground text-sm font-medium">GitHub</Label>
                        <Input value={github} onChange={e => setGithub(e.target.value)} className="bg-background/50 border-border/50 rounded-xl" placeholder="username" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground text-sm font-medium">Twitter / X</Label>
                        <Input value={twitter} onChange={e => setTwitter(e.target.value)} className="bg-background/50 border-border/50 rounded-xl" placeholder="@handle" />
                      </div>
                    </div>
                    <Button onClick={handleSaveProfile} disabled={saving} className="bg-solana-gradient text-background hover:opacity-90 rounded-xl h-11 font-semibold">
                      {saving ? 'Saving...' : t('settings.save')}
                    </Button>
                  </PremiumCard>
                )}

                {activeTab === 'account' && (
                  <PremiumCard className="p-8 space-y-8">
                    {/* Email */}
                    <div className="space-y-2">
                      <Label className="text-foreground text-sm font-medium">Email</Label>
                      <Input value={user?.email || ''} disabled className="bg-secondary/20 border-border/30 rounded-xl text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
                    </div>

                    {/* Wallet */}
                    <div>
                      <Label className="text-foreground mb-3 block text-sm font-medium">Solana Wallet</Label>
                      {walletAddress ? (
                        <div className="relative group/wallet">
                          <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-primary/30 to-accent/30 opacity-60 group-hover/wallet:opacity-100 transition-opacity" />
                          <div className="relative p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-solana-gradient flex items-center justify-center shadow-lg shadow-primary/20">
                                  <Wallet className="w-5 h-5 text-background" />
                                </div>
                                <div>
                                  <p className="text-sm font-mono font-medium text-foreground">{truncateAddress(walletAddress)}</p>
                                  <p className="text-xs text-accent flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Connected</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" onClick={handleDisconnectWallet} className="text-muted-foreground hover:text-destructive">
                                <Unlink className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-5 rounded-xl border border-dashed border-border/50 bg-secondary/5">
                          <p className="text-sm text-muted-foreground mb-4">
                            Connect your Solana wallet to receive on-chain credentials and XP tokens.
                          </p>
                          <Button onClick={handleConnectWallet} variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/10 rounded-xl">
                            <Wallet className="w-4 h-4" /> Connect Wallet
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Linked Accounts */}
                    <div>
                      <Label className="text-foreground mb-3 block text-sm font-medium">Linked Accounts</Label>
                      <div className="space-y-3">
                        {[
                          {
                            name: 'Google',
                            provider: 'google',
                            icon: (
                              <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                              </svg>
                            ),
                            onLink: handleLinkGoogle,
                          },
                          {
                            name: 'Apple',
                            provider: 'apple',
                            icon: (
                              <svg className="w-4 h-4 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                              </svg>
                            ),
                            onLink: async () => {
                              const { error } = await lovable.auth.signInWithOAuth('apple', {
                                redirect_uri: window.location.origin + '/settings',
                              });
                              if (error) {
                                toast({ title: 'Error', description: error.message, variant: 'destructive' });
                              }
                            },
                          },
                        ].map(account => {
                          const isLinked = user?.app_metadata?.providers?.includes(account.provider);
                          return (
                            <div key={account.provider} className="flex items-center justify-between p-4 rounded-xl border border-border/30 bg-secondary/5 hover:border-border/60 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center">
                                  {account.icon}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">{account.name}</p>
                                  <p className={`text-xs ${isLinked ? 'text-accent' : 'text-muted-foreground'}`}>
                                    {isLinked ? 'Linked' : 'Not linked'}
                                  </p>
                                </div>
                              </div>
                              {!isLinked && (
                                <Button variant="outline" size="sm" onClick={account.onLink} className="gap-1.5 text-xs rounded-lg border-border/50">
                                  <Link2 className="w-3.5 h-3.5" /> Link
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </PremiumCard>
                )}

                {activeTab === 'preferences' && (
                  <PremiumCard className="p-8 space-y-6">
                    <div>
                      <Label className="text-foreground mb-3 block text-sm font-medium">{t('settings.language')}</Label>
                      <div className="flex gap-2">
                        {(['en', 'pt', 'es'] as Language[]).map(lang => (
                          <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                              language === lang
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {language === lang && (
                              <motion.div
                                layoutId="lang-tab"
                                className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                              />
                            )}
                            <span className="relative z-10">
                              {lang === 'en' ? 'English' : lang === 'pt' ? 'Português' : 'Español'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/5 border border-border/20">
                      <div>
                        <p className="text-sm font-medium text-foreground">Theme</p>
                        <p className="text-xs text-muted-foreground">Switch between dark and light mode</p>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
                      >
                        {theme === 'dark' ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-accent" />}
                        <span className="text-sm text-foreground capitalize">{theme}</span>
                      </button>
                    </div>

                    {[
                      { label: 'Email Notifications', desc: 'Receive updates about new courses', checked: false },
                      { label: 'Streak Reminders', desc: 'Daily reminder to keep your streak', checked: true },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-secondary/5 border border-border/20">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <Switch defaultChecked={item.checked} />
                      </div>
                    ))}
                  </PremiumCard>
                )}

                {activeTab === 'privacy' && (
                  <PremiumCard className="p-8 space-y-6">
                    {[
                      { label: 'Public Profile', desc: 'Show your profile on the leaderboard', isPublicProfile: true },
                      { label: 'Show Achievements', desc: 'Display achievements on your profile', isPublicProfile: false },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-secondary/5 border border-border/20">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        {item.isPublicProfile ? (
                          <Switch
                            checked={profilePublic}
                            onCheckedChange={async (val) => {
                              setProfilePublic(val);
                              await updateProfile({ profile_public: val });
                            }}
                          />
                        ) : (
                          <Switch defaultChecked />
                        )}
                      </div>
                    ))}
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                    <Button
                      variant="outline"
                      className="border-border/50 text-foreground rounded-xl"
                      onClick={() => {
                        if (!profile) return;
                        const exportData = {
                          profile: {
                            display_name: profile.display_name,
                            username: profile.username,
                            bio: profile.bio,
                            xp: profile.xp,
                            level: profile.level,
                            streak: profile.streak,
                            joined_at: profile.joined_at,
                            github_username: profile.github_username,
                            twitter_username: profile.twitter_username,
                            profile_public: profile.profile_public,
                            wallet_connected: profile.wallet_connected,
                          },
                          account: {
                            email: user?.email,
                            created_at: user?.created_at,
                            providers: user?.app_metadata?.providers || [],
                          },
                          exported_at: new Date().toISOString(),
                          platform: 'SolDev Labs',
                        };
                        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `soldev-labs-data-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast({ title: 'Data exported!', description: 'Your data has been downloaded as a JSON file.' });
                      }}
                    >
                      Export My Data
                    </Button>
                  </PremiumCard>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Settings;
