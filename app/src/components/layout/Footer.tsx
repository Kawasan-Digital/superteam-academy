import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import logoImg from '@/assets/logo.png';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="border-t border-border/50 bg-card/30 noise relative" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <img src={logoImg} alt="SolDev Labs" className="w-7 h-7 rounded-lg" />
              <span className="font-display font-bold text-foreground text-sm">SolDev Labs</span>
            </div>
            <p className="text-xs text-muted-foreground mb-5 leading-relaxed max-w-xs">
              The ultimate learning platform for Solana developers. Built by Superteam Brazil.
            </p>
            <div className="flex gap-2 mb-6">
              <a href="https://github.com/solana-labs" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://twitter.com/SuperteamBR" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                <Twitter className="w-4 h-4" />
              </a>
            </div>

            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Subscribe to updates</p>
              {subscribed ? (
                <p className="text-xs text-accent font-medium">✓ Subscribed!</p>
              ) : (
                <form onSubmit={e => { e.preventDefault(); if (email) setSubscribed(true); }} className="flex gap-2">
                  <Input type="email" placeholder="dev@solana.com" value={email} onChange={e => setEmail(e.target.value)} className="bg-background/50 border-border/50 text-xs h-8 max-w-[180px] rounded-lg" required />
                  <Button type="submit" size="sm" variant="outline" className="border-border/50 text-foreground h-8 rounded-lg">
                    <Mail className="w-3.5 h-3.5" />
                  </Button>
                </form>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Platform</h4>
            <div className="space-y-2">
              <Link to="/courses" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Courses</Link>
              <Link to="/leaderboard" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Leaderboard</Link>
              <Link to="/dashboard" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Resources</h4>
            <div className="space-y-2">
              <a href="https://solana.com/docs" target="_blank" rel="noopener noreferrer" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Solana Docs</a>
              <a href="https://www.anchor-lang.com/" target="_blank" rel="noopener noreferrer" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Anchor</a>
              <a href="https://solanacookbook.com/" target="_blank" rel="noopener noreferrer" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Cookbook</a>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Community</h4>
            <div className="space-y-2">
              <a href="https://discord.gg/solana" target="_blank" rel="noopener noreferrer" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Discord</a>
              <a href="https://twitter.com/SuperteamBR" target="_blank" rel="noopener noreferrer" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Twitter</a>
              <a href="https://github.com/solana-labs" target="_blank" rel="noopener noreferrer" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">GitHub</a>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border/30 text-center">
          <p className="text-[10px] text-muted-foreground/50">© 2026 SolDev Labs by Superteam Brazil. Open source under MIT License.</p>
        </div>
      </div>
    </footer>
  );
}
