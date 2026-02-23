import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Search, ThumbsUp, MessageCircle, Eye, Pin, CheckCircle, Clock, Plus, TrendingUp, HelpCircle, Lightbulb, Bug, ChevronUp, ChevronDown, User, Award, ArrowLeft, Send, Heart } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/i18n/LanguageContext';

type Category = 'all' | 'general' | 'help' | 'showcase' | 'bugs';
type SortBy = 'latest' | 'popular' | 'unanswered';

interface Reply {
  id: string;
  author: { name: string; level: number };
  body: string;
  votes: number;
  createdAt: string;
  isAccepted?: boolean;
}

interface Thread {
  id: string;
  title: string;
  body: string;
  author: { name: string; avatar?: string; level: number; xp: number };
  category: Exclude<Category, 'all'>;
  tags: string[];
  votes: number;
  replies: Reply[];
  views: number;
  pinned?: boolean;
  solved?: boolean;
  createdAt: string;
  lastActivity: string;
}

const INITIAL_THREADS: Thread[] = [
  {
    id: '1', title: 'How to implement CPI in Anchor?', body: 'I\'m trying to make a cross-program invocation from my Anchor program to the Token program. What\'s the best pattern for this?\n\nI\'ve tried using the `CpiContext` but keep getting account validation errors. Here\'s what I have:\n\n```rust\nlet cpi_accounts = Transfer {\n    from: ctx.accounts.source.to_account_info(),\n    to: ctx.accounts.destination.to_account_info(),\n    authority: ctx.accounts.authority.to_account_info(),\n};\n```\n\nAny help would be appreciated!',
    author: { name: 'solanaDev42', level: 8, xp: 6400 }, category: 'help', tags: ['Anchor', 'CPI', 'Rust'],
    votes: 24, replies: [
      { id: 'r1', author: { name: 'anchorPro', level: 15 }, body: 'You need to make sure the token program is passed as an account. Add `pub token_program: Program<\'info, Token>` to your accounts struct. Then use:\n\n```rust\nlet cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);\ntoken::transfer(cpi_ctx, amount)?;\n```', votes: 18, createdAt: '1h ago', isAccepted: true },
      { id: 'r2', author: { name: 'rustLover', level: 12 }, body: 'Also check that your authority signer seeds are correct if using a PDA as the authority.', votes: 8, createdAt: '45m ago' },
    ], views: 342, solved: true, createdAt: '2h ago', lastActivity: '30m ago',
  },
  {
    id: '2', title: '📢 Welcome to SolDev Labs Community!', body: 'This is the official community forum for SolDev Labs.',
    author: { name: 'SolDev Team', level: 50, xp: 99999 }, category: 'general', tags: ['Announcement'],
    votes: 89, replies: [
      { id: 'r3', author: { name: 'web3noob', level: 3 }, body: 'Excited to be here! Just started learning Solana development. 🎉', votes: 12, createdAt: '2d ago' },
      { id: 'r4', author: { name: 'cryptoMaster', level: 20 }, body: 'Great platform! The interactive challenges are amazing.', votes: 15, createdAt: '1d ago' },
    ], views: 1205, pinned: true, createdAt: '3d ago', lastActivity: '1h ago',
  },
  {
    id: '3', title: 'Built a DEX aggregator — feedback welcome!', body: 'Just finished my capstone project: a DEX aggregator that finds the best swap routes across Raydium, Orca, and Jupiter.',
    author: { name: 'rustLover', level: 12, xp: 14400 }, category: 'showcase', tags: ['DeFi', 'Project', 'TypeScript'],
    votes: 45, replies: [
      { id: 'r5', author: { name: 'defiBuilder', level: 10 }, body: 'This is incredible! How did you handle the routing algorithm?', votes: 9, createdAt: '20h ago' },
    ], views: 567, createdAt: '1d ago', lastActivity: '4h ago',
  },
  {
    id: '4', title: 'Token-2022 NonTransferable mint not working', body: 'Getting an error when trying to create a NonTransferable token mint.',
    author: { name: 'web3noob', level: 3, xp: 900 }, category: 'bugs', tags: ['Token-2022', 'SPL'],
    votes: 7, replies: [
      { id: 'r6', author: { name: 'solanaDev42', level: 8 }, body: 'Make sure you\'re using the Token-2022 program ID, not the legacy Token program.', votes: 5, createdAt: '3h ago' },
    ], views: 89, createdAt: '5h ago', lastActivity: '2h ago',
  },
  {
    id: '5', title: 'Best practices for PDA derivation?', body: 'What seeds should I use for PDA derivation in a marketplace program?',
    author: { name: 'anchorPro', level: 15, xp: 22500 }, category: 'help', tags: ['PDA', 'Architecture', 'Anchor'],
    votes: 31, replies: [
      { id: 'r7', author: { name: 'SolDev Team', level: 50 }, body: 'Your approach is solid. Using the seller + mint combination ensures uniqueness per listing.', votes: 22, createdAt: '8h ago', isAccepted: true },
    ], views: 423, solved: true, createdAt: '12h ago', lastActivity: '1h ago',
  },
  {
    id: '6', title: 'Metaplex Core vs Token Metadata — which to use?', body: 'Starting a new NFT project and wondering whether to use Metaplex Core or the legacy Token Metadata standard.',
    author: { name: 'nftBuilder', level: 6, xp: 3600 }, category: 'general', tags: ['Metaplex', 'NFT'],
    votes: 19, replies: [
      { id: 'r8', author: { name: 'rustLover', level: 12 }, body: 'Metaplex Core is the future. Much simpler API, lower costs, and better composability.', votes: 14, createdAt: '18h ago' },
    ], views: 298, createdAt: '1d ago', lastActivity: '6h ago',
  },
  {
    id: '7', title: 'My on-chain game — Solana Battleships', body: 'Check out my fully on-chain battleship game built with Anchor.',
    author: { name: 'gameDevSol', level: 10, xp: 10000 }, category: 'showcase', tags: ['Gaming', 'Anchor', 'On-chain'],
    votes: 62, replies: [], views: 891, createdAt: '2d ago', lastActivity: '3h ago',
  },
  {
    id: '8', title: 'How do I read account data in frontend?', body: 'New to Solana development. How do I deserialize account data from an Anchor program in my React frontend?',
    author: { name: 'newbie_dev', level: 1, xp: 100 }, category: 'help', tags: ['Frontend', 'React', 'Beginner'],
    votes: 5, replies: [], views: 34, createdAt: '1h ago', lastActivity: '1h ago',
  },
];

const PremiumCard = ({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div className="relative group/card" onClick={onClick}>
    <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-primary/20 via-border/30 to-border/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
    <div className={`relative rounded-2xl card-premium noise ${className}`}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      {children}
    </div>
  </div>
);

const LevelBadgeInline = ({ level }: { level: number }) => {
  const color = level >= 20 ? 'from-yellow-500 to-amber-400' : level >= 10 ? 'from-solana-purple to-pink-500' : level >= 5 ? 'from-primary to-accent' : 'from-muted-foreground to-muted-foreground';
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r ${color} text-white`}>
      <Award className="w-2.5 h-2.5" /> {level}
    </span>
  );
};

const Community = () => {
  const { t } = useTranslation();
  const [threads, setThreads] = useState<Thread[]>(INITIAL_THREADS);
  const [category, setCategory] = useState<Category>('all');
  const [sortBy, setSortBy] = useState<SortBy>('latest');
  const [search, setSearch] = useState('');
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newThreadOpen, setNewThreadOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCategory, setNewCategory] = useState<Exclude<Category, 'all'>>('general');
  const [newTags, setNewTags] = useState('');
  const { toast } = useToast();

  const CATEGORIES: { key: Category; labelKey: string; icon: typeof MessageSquare; color: string }[] = [
    { key: 'all', labelKey: 'community.all_topics', icon: MessageSquare, color: 'text-foreground' },
    { key: 'general', labelKey: 'community.general', icon: MessageCircle, color: 'text-primary' },
    { key: 'help', labelKey: 'community.help', icon: HelpCircle, color: 'text-accent' },
    { key: 'showcase', labelKey: 'community.showcase', icon: Lightbulb, color: 'text-solana-purple' },
    { key: 'bugs', labelKey: 'community.bugs', icon: Bug, color: 'text-destructive' },
  ];

  const filtered = threads
    .filter(t => category === 'all' || t.category === category)
    .filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (sortBy === 'popular') return b.votes - a.votes;
      if (sortBy === 'unanswered') return a.replies.length - b.replies.length;
      return 0;
    });

  const handleVote = (threadId: string, dir: 1 | -1) => {
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, votes: t.votes + dir } : t));
    if (selectedThread?.id === threadId) {
      setSelectedThread(prev => prev ? { ...prev, votes: prev.votes + dir } : prev);
    }
  };

  const handleReply = () => {
    if (!replyText.trim() || !selectedThread) return;
    const newReply: Reply = {
      id: `r-${Date.now()}`,
      author: { name: 'You', level: 4 },
      body: replyText,
      votes: 0,
      createdAt: 'Just now',
    };
    const updated = { ...selectedThread, replies: [...selectedThread.replies, newReply] };
    setSelectedThread(updated);
    setThreads(prev => prev.map(t => t.id === selectedThread.id ? updated : t));
    setReplyText('');
    toast({ title: t('community.reply_posted'), description: t('community.reply_posted_desc') });
  };

  const handleReplyVote = (replyId: string, dir: 1 | -1) => {
    if (!selectedThread) return;
    const updated = {
      ...selectedThread,
      replies: selectedThread.replies.map(r => r.id === replyId ? { ...r, votes: r.votes + dir } : r),
    };
    setSelectedThread(updated);
    setThreads(prev => prev.map(t => t.id === selectedThread.id ? updated : t));
  };

  const handleCreateThread = () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    const thread: Thread = {
      id: `t-${Date.now()}`,
      title: newTitle,
      body: newBody,
      author: { name: 'You', level: 4, xp: 2450 },
      category: newCategory,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      votes: 0,
      replies: [],
      views: 0,
      createdAt: 'Just now',
      lastActivity: 'Just now',
    };
    setThreads(prev => [thread, ...prev]);
    setNewTitle('');
    setNewBody('');
    setNewTags('');
    setNewThreadOpen(false);
    toast({ title: t('community.thread_created'), description: t('community.thread_created_desc') });
  };

  const stats = { threads: threads.length, members: 3891, answers: threads.reduce((s, t) => s + t.replies.length, 0), online: 142 };

  // ─── Thread Detail View ───
  if (selectedThread) {
    return (
      <MainLayout>
        <SEO title={`${selectedThread.title} — ${t('community.title')}`} description={selectedThread.body.slice(0, 160)} path="/community" />
        <div className="relative min-h-screen">
          <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <button onClick={() => setSelectedThread(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft className="w-4 h-4" /> {t('community.back')}
              </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <PremiumCard className="p-6 sm:p-8 mb-6">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-1 min-w-[48px]">
                    <button onClick={() => handleVote(selectedThread.id, 1)} className="p-1 rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all">
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <span className="text-lg font-bold text-foreground">{selectedThread.votes}</span>
                    <button onClick={() => handleVote(selectedThread.id, -1)} className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-3 flex-wrap">
                      {selectedThread.pinned && <Badge variant="secondary" className="text-[10px] gap-1"><Pin className="w-3 h-3" /> {t('community.pinned')}</Badge>}
                      {selectedThread.solved && <Badge className="text-[10px] gap-1 bg-accent/10 text-accent border-accent/20"><CheckCircle className="w-3 h-3" /> {t('community.solved')}</Badge>}
                      <Badge variant="secondary" className="text-[10px] capitalize">{selectedThread.category}</Badge>
                    </div>

                    <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">{selectedThread.title}</h1>

                    <div className="prose prose-sm prose-invert max-w-none mb-4">
                      {selectedThread.body.split('\n').map((line, i) => {
                        if (line.startsWith('```')) return null;
                        if (line.startsWith('- ')) return <li key={i} className="text-sm text-muted-foreground ml-4">{line.slice(2)}</li>;
                        return line ? <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-2">{line}</p> : <br key={i} />;
                      })}
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-solana-gradient flex items-center justify-center text-xs font-bold text-background">
                          {selectedThread.author.name[0]}
                        </div>
                        <span className="text-sm font-medium text-foreground">{selectedThread.author.name}</span>
                        <LevelBadgeInline level={selectedThread.author.level} />
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {selectedThread.createdAt}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye className="w-3 h-3" /> {selectedThread.views} {t('community.views')}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {selectedThread.tags.map(tag => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}
                    </div>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>

            {/* Replies */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                {selectedThread.replies.length} {t('community.replies')}
              </h3>

              <div className="space-y-3">
                <AnimatePresence>
                  {selectedThread.replies.map((reply, i) => (
                    <motion.div
                      key={reply.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <PremiumCard className={`p-4 sm:p-5 ${reply.isAccepted ? 'border-accent/30 bg-accent/[0.02]' : ''}`}>
                        <div className="flex gap-3">
                          <div className="flex flex-col items-center gap-1 min-w-[36px]">
                            <button onClick={() => handleReplyVote(reply.id, 1)} className="p-0.5 text-muted-foreground hover:text-accent transition-colors">
                              <Heart className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold text-foreground">{reply.votes}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            {reply.isAccepted && (
                              <div className="flex items-center gap-1 text-accent text-[10px] font-bold mb-2">
                                <CheckCircle className="w-3 h-3" /> {t('community.accepted_answer')}
                              </div>
                            )}
                            <div className="text-sm text-muted-foreground leading-relaxed mb-3 whitespace-pre-wrap">
                              {reply.body}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                                <User className="w-3 h-3 text-foreground" />
                              </div>
                              <span className="text-xs font-medium text-foreground">{reply.author.name}</span>
                              <LevelBadgeInline level={reply.author.level} />
                              <span className="text-[10px] text-muted-foreground ml-auto">{reply.createdAt}</span>
                            </div>
                          </div>
                        </div>
                      </PremiumCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Reply form */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <PremiumCard className="p-5">
                <h4 className="text-sm font-semibold text-foreground mb-3">{t('community.post_reply')}</h4>
                <Textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={t('community.write_reply')}
                  className="bg-background/50 border-border/50 rounded-xl mb-3 min-h-[100px] text-sm"
                />
                <div className="flex justify-end">
                  <Button onClick={handleReply} disabled={!replyText.trim()} className="gap-2 bg-solana-gradient text-background hover:opacity-90">
                    <Send className="w-4 h-4" /> {t('community.reply')}
                  </Button>
                </div>
              </PremiumCard>
            </motion.div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ─── Thread List View ───
  return (
    <MainLayout>
      <SEO title={`${t('community.title')} — SolDev Labs`} description={t('community.subtitle')} path="/community" />

      <div className="relative min-h-screen">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="font-display text-4xl font-bold text-foreground mb-2">
                  {t('community.title')} <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">{t('community.forum')}</span>
                </h1>
                <p className="text-muted-foreground">{t('community.forum_desc')}</p>
              </div>
              <Dialog open={newThreadOpen} onOpenChange={setNewThreadOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-solana-gradient text-background hover:opacity-90 font-semibold self-start sm:self-auto">
                    <Plus className="w-4 h-4" /> {t('community.new_thread')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-display">{t('community.create_dialog')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('community.create_title')}</label>
                      <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder={t('community.create_title_placeholder')} className="bg-background/50 rounded-xl" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('community.create_category')}</label>
                      <div className="flex gap-2 flex-wrap">
                        {CATEGORIES.filter(c => c.key !== 'all').map(cat => (
                          <button
                            key={cat.key}
                            onClick={() => setNewCategory(cat.key as Exclude<Category, 'all'>)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              newCategory === cat.key ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground bg-secondary/30 border border-border/20'
                            }`}
                          >
                            <cat.icon className="w-3 h-3" /> {t(cat.labelKey)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('community.create_body')}</label>
                      <Textarea value={newBody} onChange={e => setNewBody(e.target.value)} placeholder={t('community.create_body_placeholder')} className="bg-background/50 rounded-xl min-h-[120px]" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('community.create_tags')}</label>
                      <Input value={newTags} onChange={e => setNewTags(e.target.value)} placeholder={t('community.create_tags_placeholder')} className="bg-background/50 rounded-xl" />
                    </div>
                    <Button onClick={handleCreateThread} disabled={!newTitle.trim() || !newBody.trim()} className="w-full gap-2 bg-solana-gradient text-background hover:opacity-90">
                      <Send className="w-4 h-4" /> {t('community.create_submit')}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: t('community.threads'), value: stats.threads.toLocaleString(), icon: MessageSquare },
              { label: t('community.members'), value: stats.members.toLocaleString(), icon: User },
              { label: t('community.answers'), value: stats.answers.toLocaleString(), icon: CheckCircle },
              { label: t('community.online'), value: stats.online.toString(), icon: TrendingUp },
            ].map(s => (
              <PremiumCard key={s.label} className="p-4 text-center">
                <s.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </PremiumCard>
            ))}
          </motion.div>

          {/* Filters */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('community.search')} className="pl-10 bg-background/50 border-border/50 rounded-xl" />
            </div>
            <Tabs value={sortBy} onValueChange={v => setSortBy(v as SortBy)}>
              <TabsList className="bg-secondary/30 border border-border/20 rounded-xl">
                <TabsTrigger value="latest" className="text-xs rounded-lg">{t('community.latest')}</TabsTrigger>
                <TabsTrigger value="popular" className="text-xs rounded-lg">{t('community.popular')}</TabsTrigger>
                <TabsTrigger value="unanswered" className="text-xs rounded-lg">{t('community.unanswered')}</TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>

          <div className="grid lg:grid-cols-[200px_1fr] gap-6">
            {/* Sidebar */}
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="hidden lg:block space-y-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    category === cat.key ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <cat.icon className={`w-4 h-4 ${category === cat.key ? 'text-primary' : cat.color}`} />
                  {t(cat.labelKey)}
                </button>
              ))}
              <div className="pt-6">
                <p className="text-xs font-semibold text-muted-foreground mb-3 px-3">{t('community.popular_tags')}</p>
                <div className="flex flex-wrap gap-1.5 px-3">
                  {['Anchor', 'Rust', 'Token-2022', 'DeFi', 'NFT', 'CPI', 'PDA', 'Frontend'].map(tag => (
                    <Badge key={tag} variant="secondary" className="text-[10px] cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => setSearch(tag)}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Mobile categories */}
            <div className="lg:hidden flex gap-1.5 overflow-x-auto pb-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    category === cat.key ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground bg-secondary/30 border border-border/20'
                  }`}
                >
                  <cat.icon className="w-3 h-3" /> {t(cat.labelKey)}
                </button>
              ))}
            </div>

            {/* Thread list */}
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filtered.map((thread, i) => (
                  <motion.div
                    key={thread.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <PremiumCard className="p-4 sm:p-5 cursor-pointer hover:border-primary/20 transition-all" onClick={() => setSelectedThread(thread)}>
                      <div className="flex gap-3 sm:gap-4">
                        <div className="hidden sm:flex flex-col items-center gap-0.5 min-w-[40px]">
                          <button onClick={e => { e.stopPropagation(); handleVote(thread.id, 1); }} className="p-0.5 text-muted-foreground hover:text-primary transition-colors">
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-bold text-foreground">{thread.votes}</span>
                          <button onClick={e => { e.stopPropagation(); handleVote(thread.id, -1); }} className="p-0.5 text-muted-foreground hover:text-destructive transition-colors">
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1.5">
                            {thread.pinned && <Pin className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />}
                            {thread.solved && <CheckCircle className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />}
                            <h3 className="font-semibold text-foreground text-sm leading-snug hover:text-primary transition-colors line-clamp-1">
                              {thread.title}
                            </h3>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{thread.body}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                                <User className="w-3 h-3 text-foreground" />
                              </div>
                              <span className="text-xs text-muted-foreground">{thread.author.name}</span>
                              <LevelBadgeInline level={thread.author.level} />
                            </div>
                            <span className="text-border">·</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {thread.createdAt}</span>
                            <div className="hidden sm:flex items-center gap-3 ml-auto text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {thread.replies.length}</span>
                              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {thread.views}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {thread.tags.map(tag => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}
                          </div>
                        </div>
                      </div>
                    </PremiumCard>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">{t('community.no_threads')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Community;
